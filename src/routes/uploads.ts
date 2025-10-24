import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Validation schemas
const parseFileSchema = Joi.object({
  siteMapping: Joi.object().pattern(Joi.string(), Joi.string().uuid()).optional(),
  dateFormat: Joi.string().optional().default('YYYY-MM-DD'),
  hasHeaders: Joi.boolean().optional().default(true)
});

interface ParsedRow {
  rowIndex: number;
  siteId?: string;
  siteName?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  activityDateStart?: Date;
  activityDateEnd?: Date;
  source?: string;
  notes?: string;
  errors: string[];
}

// Get upload history
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      throw createError('Customer ID is required', 400, 'CUSTOMER_ID_REQUIRED');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const uploads = await prisma.upload.findMany({
      where: { customerId: customerId as string },
      include: {
        uploader: {
          select: { email: true }
        },
        site: {
          select: { name: true }
        },
        period: {
          select: { year: true, quarter: true }
        },
        _count: {
          select: { activities: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json(uploads);
  } catch (error) {
    next(error);
  }
});

// Upload file endpoint
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400, 'NO_FILE');
    }

    const { customerId, siteId, periodId } = req.body;
    if (!customerId) {
      throw createError('Customer ID is required', 400, 'MISSING_IDS');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Create upload record
    const uploadRecord = await prisma.upload.create({
      data: {
        customerId,
        siteId: siteId || null,
        periodId: periodId || null,
        originalFilename: req.file.originalname,
        filename: req.file.filename,
        s3Key: req.file.filename, // Using local filename as key
        uploadedBy: req.user!.id,
        status: 'PENDING'
      }
    });

    logger.info('File uploaded', {
      uploadId: uploadRecord.id,
      filename: req.file.originalname,
      size: req.file.size,
      uploadedBy: req.user!.id
    });

    res.status(201).json({
      uploadId: uploadRecord.id,
      filename: req.file.originalname,
      size: req.file.size,
      status: 'uploaded'
    });
  } catch (error) {
    // Clean up file if upload record creation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Parse uploaded file
router.post('/:id/parse', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = parseFileSchema.validate(req.body);
    
    if (error) {
      throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
    }

    // Set status to PROCESSING
    await prisma.upload.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    const filePath = path.join(uploadDir, upload.s3Key!);
    if (!fs.existsSync(filePath)) {
      throw createError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const ext = path.extname(upload.filename).toLowerCase();
    let parsedData: ParsedRow[];

    if (ext === '.csv') {
      parsedData = await parseCSV(filePath, value);
    } else if (ext === '.xlsx' || ext === '.xls') {
      parsedData = await parseExcel(filePath, value);
    } else {
      throw createError('Unsupported file format', 400, 'UNSUPPORTED_FORMAT');
    }

    // Get sample data and column info
    const sampleSize = Math.min(5, parsedData.length);
    const sample = parsedData.slice(0, sampleSize);
    
    const columns = parsedData.length > 0 ? Object.keys(parsedData[0]).filter(k => k !== 'errors' && k !== 'rowIndex') : [];
    
    const validRows = parsedData.filter(row => row.errors.length === 0).length;
    const errorRows = parsedData.length - validRows;

    const validationResultData = {
      totalRows: parsedData.length,
      validRows,
      invalidRows: errorRows,
      errors: parsedData.filter(row => row.errors.length > 0).map(row => `Row ${row.rowIndex}: ${row.errors.join(', ')}`)
    };

    // Update upload status and save validation results
    await prisma.upload.update({
      where: { id },
      data: {
        status: validRows > 0 ? 'COMPLETED' : 'FAILED',
        errorCount: errorRows,
        validationResults: JSON.stringify(validationResultData),
      },
    });

    res.json({
      totalRows: parsedData.length,
      validRows,
      errorRows,
      columns,
      sample,
      errors: parsedData.filter(row => row.errors.length > 0).slice(0, 10) // First 10 errors
    });
  } catch (error) {
    next(error);
  }
});

// Bulk create activities from parsed data
router.post('/:id/import', authenticateToken, requireRole(['ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { periodId, columnMapping, skipErrors = true } = req.body;

    // periodId can now come from either req.body or from the upload record
    let finalPeriodId = periodId;

    const upload = await prisma.upload.findUnique({
      where: { id }
    });

    if (!upload) {
      throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
    }

    // Check access permissions
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Use period from upload if not provided in request
    if (!finalPeriodId && upload.periodId) {
      finalPeriodId = upload.periodId;
    }

    if (!finalPeriodId) {
      throw createError('Reporting period ID is required', 400, 'PERIOD_ID_REQUIRED');
    }

    // Verify reporting period
    const period = await prisma.reportingPeriod.findFirst({
      where: {
        id: finalPeriodId,
        customerId: upload.customerId
      }
    });

    if (!period) {
      throw createError('Reporting period not found', 404, 'PERIOD_NOT_FOUND');
    }

    const filePath = path.join(uploadDir, upload.s3Key!);
    const ext = path.extname(upload.filename).toLowerCase();
    let parsedData: ParsedRow[];

    if (ext === '.csv') {
      parsedData = await parseCSV(filePath, {});
    } else {
      parsedData = await parseExcel(filePath, {});
    }

    // Filter out rows with errors if skipErrors is true
    const validRows = skipErrors ? parsedData.filter(row => row.errors.length === 0) : parsedData;

    if (validRows.length === 0) {
      throw createError('No valid rows to import', 400, 'NO_VALID_ROWS');
    }

    // Create activities
    const activities = [];
    for (const row of validRows) {
      if (row.siteId && row.type && row.quantity && row.unit && row.activityDateStart && row.activityDateEnd) {
        activities.push({
          siteId: row.siteId,
          periodId: finalPeriodId,
          type: row.type,
          quantity: row.quantity,
          unit: row.unit,
          activityDateStart: row.activityDateStart,
          activityDateEnd: row.activityDateEnd,
          source: row.source || 'FILE_UPLOAD',
          uploadId: upload.id,
          notes: row.notes
        });
      }
    }

    const createdActivities = await prisma.activity.createMany({
      data: activities
    });

    // Update upload status
    await prisma.upload.update({
      where: { id },
      data: { status: 'imported' }
    });

    logger.info('Activities imported', {
      uploadId: id,
      totalRows: parsedData.length,
      importedRows: createdActivities.count,
      importedBy: req.user?.id
    });

    res.json({
      totalRows: parsedData.length,
      validRows: validRows.length,
      importedRows: createdActivities.count,
      message: 'Activities imported successfully'
    });
  } catch (error) {
    next(error);
  }
});


// Helper function to parse CSV files
async function parseCSV(filePath: string, options: any): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const results: ParsedRow[] = [];
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csv({ headers: options.hasHeaders !== false }))
      .on('data', (data) => {
        rowIndex++;
        const parsed = parseRowData(data, rowIndex);
        results.push(parsed);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Helper function to parse Excel files
async function parseExcel(filePath: string, options: any): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1); // First worksheet
  const results: ParsedRow[] = [];
  
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file');
  }

  const startRow = options.hasHeaders !== false ? 2 : 1;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= startRow) {
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        rowData[`col_${colNumber}`] = cell.value;
      });
      
      const parsed = parseRowData(rowData, rowNumber);
      results.push(parsed);
    }
  });

  return results;
}

// Helper function to parse and validate row data
function parseRowData(data: any, rowIndex: number): ParsedRow {
  const errors: string[] = [];
  const row: ParsedRow = { rowIndex, errors };

  // Extract and validate data based on common column patterns
  const sitePattern = /site|location/i;
  const typePattern = /type|category|activity/i;
  const quantityPattern = /quantity|amount|value/i;
  const unitPattern = /unit/i;
  const startDatePattern = /start.*date|from.*date/i;
  const endDatePattern = /end.*date|to.*date/i;

  // Find columns by pattern matching
  for (const [key, value] of Object.entries(data)) {
    if (sitePattern.test(key)) {
      row.siteName = String(value || '').trim();
    } else if (typePattern.test(key)) {
      row.type = String(value || '').trim().toUpperCase();
    } else if (quantityPattern.test(key)) {
      const qty = parseFloat(String(value || '0'));
      if (!isNaN(qty) && qty > 0) {
        row.quantity = qty;
      } else if (value) {
        errors.push(`Invalid quantity: ${value}`);
      }
    } else if (unitPattern.test(key)) {
      row.unit = String(value || '').trim();
    } else if (startDatePattern.test(key)) {
      const date = parseDate(value);
      if (date) {
        row.activityDateStart = date;
      } else if (value) {
        errors.push(`Invalid start date: ${value}`);
      }
    } else if (endDatePattern.test(key)) {
      const date = parseDate(value);
      if (date) {
        row.activityDateEnd = date;
      } else if (value) {
        errors.push(`Invalid end date: ${value}`);
      }
    }
  }

  // Validation
  if (!row.siteName) errors.push('Site name is required');
  if (!row.type) errors.push('Activity type is required');
  if (!row.quantity) errors.push('Quantity is required');
  if (!row.unit) errors.push('Unit is required');
  if (!row.activityDateStart) errors.push('Start date is required');
  if (!row.activityDateEnd) errors.push('End date is required');

  if (row.quantity && row.quantity <= 0) {
    errors.push('Quantity must be positive');
  }

  if (row.activityDateStart && row.activityDateEnd && row.activityDateStart > row.activityDateEnd) {
    errors.push('Start date must be before end date');
  }

  return row;
}

// Helper function to parse dates
function parseDate(value: any): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) return value;
  
  const dateStr = String(value).trim();
  const date = new Date(dateStr);
  
  return isNaN(date.getTime()) ? null : date;
}

// Delete an upload
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
    }

    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }

    // Delete the physical file
    if (upload.filename) {
        const filePath = path.join(uploadDir, upload.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted physical file: ${filePath}`);
        }
    }

    // Delete associated activities first to prevent foreign key constraint errors
    await prisma.activity.deleteMany({
      where: { uploadId: id },
    });

    // Now, delete the database record
    await prisma.upload.delete({
      where: { id },
    });

    logger.info(`Deleted upload record: ${id} by user ${req.user!.id}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as uploadRoutes };
