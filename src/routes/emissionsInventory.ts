import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { EmissionsInventoryParser, ColumnMapping } from '../services/emissionsInventoryParser';
import { IntelligentCSVParser } from '../services/intelligentCSVParser';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

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
    cb(null, 'emissions-' + uniqueSuffix + path.extname(file.originalname));
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
const uploadSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  siteId: Joi.string().uuid().optional(),
  periodId: Joi.string().uuid().optional(),
  autoCreate: Joi.string().optional()
});

const parseSchema = Joi.object({
  hasHeaders: Joi.boolean().optional().default(true),
  skipRows: Joi.number().integer().min(0).optional().default(0),
  columnMapping: Joi.object().optional()
});

const importSchema = Joi.object({
  skipErrors: Joi.boolean().optional().default(true),
  createMissingPeriods: Joi.boolean().optional().default(false)
});

/**
 * POST /api/emissions-inventory/upload
 * Upload emissions inventory CSV/Excel file
 */
router.post('/upload', 
  authenticateToken, 
  requireRole(['ADMIN', 'EDITOR']), 
  upload.single('file'), 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400, 'NO_FILE');
      }

      const { error, value } = uploadSchema.validate(req.body);
      if (error) {
        throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
      }

      const { customerId, autoCreate } = value;
      let { siteId, periodId } = value;

      // Check access permissions
      if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
        throw createError('Access denied', 403, 'FORBIDDEN');
      }

      // Auto-create site and period if not provided
      if (!siteId || !periodId) {
        // Create or get default site
        let site = await prisma.site.findFirst({
          where: { customerId, name: 'Default Site' }
        });
        
        if (!site) {
          site = await prisma.site.create({
            data: {
              customerId,
              name: 'Default Site',
              country: 'Unknown',
              description: 'Auto-created default site for emissions inventory'
            }
          });
          logger.info('Auto-created default site', { siteId: site.id, customerId });
        }
        
        siteId = site.id;

        // Create or get default period for current year
        const currentYear = new Date().getFullYear();
        let period = await prisma.reportingPeriod.findFirst({
          where: { customerId, year: currentYear, quarter: null }
        });

        if (!period) {
          period = await prisma.reportingPeriod.create({
            data: {
              customerId,
              year: currentYear,
              fromDate: new Date(`${currentYear}-01-01`),
              toDate: new Date(`${currentYear}-12-31`),
              status: 'OPEN'
            }
          });
          logger.info('Auto-created default period', { periodId: period.id, year: currentYear });
        }

        periodId = period.id;
      } else {
        // Verify site and period exist if provided
        const [site, period] = await Promise.all([
          prisma.site.findFirst({
            where: { id: siteId, customerId }
          }),
          prisma.reportingPeriod.findFirst({
            where: { id: periodId, customerId }
          })
        ]);

        if (!site) {
          throw createError('Site not found', 404, 'SITE_NOT_FOUND');
        }

        if (!period) {
          throw createError('Reporting period not found', 404, 'PERIOD_NOT_FOUND');
        }
      }

      // Create upload record
      const uploadRecord = await prisma.upload.create({
        data: {
          customerId,
          siteId,
          periodId,
          originalFilename: req.file.originalname,
          filename: req.file.filename,
          s3Key: req.file.filename,
          uploadedBy: req.user!.id,
          status: 'PENDING'
        }
      });

      logger.info('Emissions inventory file uploaded', {
        uploadId: uploadRecord.id,
        filename: req.file.originalname,
        size: req.file.size,
        uploadedBy: req.user!.id
      });

      res.status(201).json({
        uploadId: uploadRecord.id,
        filename: req.file.originalname,
        size: req.file.size,
        status: 'uploaded',
        message: 'File uploaded successfully. Use /parse endpoint to analyze the file.'
      });
    } catch (error) {
      // Clean up file if upload record creation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

/**
 * POST /api/emissions-inventory/:id/parse
 * Parse and validate uploaded emissions inventory file
 */
router.post('/:id/parse', 
  authenticateToken, 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { error, value } = parseSchema.validate(req.body);
      
      if (error) {
        throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
      }

      const upload = await prisma.upload.findUnique({
        where: { id },
      });

      if (!upload) {
        throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
      }

      // Check access permissions
      if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
        throw createError('Access denied', 403, 'FORBIDDEN');
      }

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      // Update status to PROCESSING
      await prisma.upload.update({
        where: { id },
        data: { status: 'PROCESSING' },
      });

      const ext = path.extname(upload.filename).toLowerCase();
      let parsedData;

      // Parse file based on type
      if (ext === '.csv') {
        parsedData = await EmissionsInventoryParser.parseCSV(filePath, value);
      } else if (ext === '.xlsx' || ext === '.xls') {
        parsedData = await EmissionsInventoryParser.parseExcel(filePath, value);
      } else {
        throw createError('Unsupported file format', 400, 'UNSUPPORTED_FORMAT');
      }

      // Get summary statistics
      const summary = EmissionsInventoryParser.getSummary(parsedData);

      // Get sample data (first 10 rows)
      const sampleSize = Math.min(10, parsedData.length);
      const sample = parsedData.slice(0, sampleSize).map(row => ({
        rowIndex: row.rowIndex,
        mapped: row.mapped,
        errors: row.errors,
        warnings: row.warnings
      }));

      // Get error details (first 20 errors)
      const errorDetails = parsedData
        .filter(row => row.errors.length > 0)
        .slice(0, 20)
        .map(row => ({
          rowIndex: row.rowIndex,
          errors: row.errors,
          raw: row.raw
        }));

      // Store validation results
      const validationResults = {
        summary,
        errorDetails: errorDetails.slice(0, 10) // Store first 10 errors
      };

      // Update upload status
      await prisma.upload.update({
        where: { id },
        data: {
          status: summary.validRows > 0 ? 'COMPLETED' : 'FAILED',
          errorCount: summary.errorRows,
          validationResults: JSON.stringify(validationResults),
        },
      });

      logger.info('Emissions inventory file parsed', {
        uploadId: id,
        totalRows: summary.totalRows,
        validRows: summary.validRows,
        errorRows: summary.errorRows
      });

      res.json({
        uploadId: id,
        summary,
        sample,
        errorDetails,
        message: summary.validRows > 0 
          ? `Successfully parsed ${summary.validRows} valid rows out of ${summary.totalRows} total rows.`
          : 'No valid rows found. Please check the error details.'
      });
    } catch (error) {
      // Update upload status to FAILED
      if (req.params.id) {
        await prisma.upload.update({
          where: { id: req.params.id },
          data: { status: 'FAILED' },
        }).catch(() => {});
      }
      next(error);
    }
  }
);

/**
 * POST /api/emissions-inventory/:id/import
 * Import parsed emissions inventory data into activities
 */
router.post('/:id/import', 
  authenticateToken, 
  requireRole(['ADMIN', 'EDITOR']), 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { error, value } = importSchema.validate(req.body);
      
      if (error) {
        throw createError(error.details[0].message, 400, 'VALIDATION_ERROR');
      }

      const { skipErrors } = value;

      const upload = await prisma.upload.findUnique({
        where: { id },
        include: {
          site: true,
          period: true
        }
      });

      if (!upload) {
        throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
      }

      // Check access permissions
      if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
        throw createError('Access denied', 403, 'FORBIDDEN');
      }

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      // Parse file
      const ext = path.extname(upload.filename).toLowerCase();
      let parsedData;

      if (ext === '.csv') {
        parsedData = await EmissionsInventoryParser.parseCSV(filePath);
      } else {
        parsedData = await EmissionsInventoryParser.parseExcel(filePath);
      }

      // Convert to activity data
      const activityData = EmissionsInventoryParser.toActivityData(
        parsedData,
        upload.siteId,
        upload.periodId,
        skipErrors
      );

      if (activityData.length === 0) {
        throw createError('No valid activities to import', 400, 'NO_VALID_ACTIVITIES');
      }

      // Import activities
      const imported = await prisma.activity.createMany({
        data: activityData.map(activity => ({
          ...activity,
          uploadId: upload.id
        }))
      });

      // Update upload status
      await prisma.upload.update({
        where: { id },
        data: { status: 'imported' }
      });

      logger.info('Emissions inventory data imported', {
        uploadId: id,
        totalParsed: parsedData.length,
        imported: imported.count,
        importedBy: req.user?.id
      });

      res.json({
        uploadId: id,
        totalParsed: parsedData.length,
        totalImported: imported.count,
        message: `Successfully imported ${imported.count} activities from emissions inventory.`,
        nextSteps: [
          'Review imported activities in the Activities page',
          'Run calculations to compute emissions',
          'Generate reports for stakeholders'
        ]
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/emissions-inventory/:id/preview
 * Get preview of parsed data without importing
 */
router.get('/:id/preview', 
  authenticateToken, 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { limit = 100 } = req.query;

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

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      // Parse file
      const ext = path.extname(upload.filename).toLowerCase();
      let parsedData;

      if (ext === '.csv') {
        parsedData = await EmissionsInventoryParser.parseCSV(filePath);
      } else {
        parsedData = await EmissionsInventoryParser.parseExcel(filePath);
      }

      const limitNum = Math.min(parseInt(limit as string), 1000);
      const preview = parsedData.slice(0, limitNum);

      res.json({
        uploadId: id,
        total: parsedData.length,
        showing: preview.length,
        data: preview.map(row => ({
          rowIndex: row.rowIndex,
          mapped: row.mapped,
          errors: row.errors,
          warnings: row.warnings
        }))
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/emissions-inventory/:id/column-detection
 * Auto-detect columns from uploaded file
 */
router.get('/:id/column-detection', 
  authenticateToken, 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;

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

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      const ext = path.extname(upload.filename).toLowerCase();
      let headers: string[] = [];

      // Extract headers
      if (ext === '.csv') {
        const firstLine = await new Promise<string>((resolve, reject) => {
          const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
          let line = '';
          stream.on('data', (chunk) => {
            line += chunk;
            const newlineIndex = line.indexOf('\n');
            if (newlineIndex !== -1) {
              stream.destroy();
              resolve(line.substring(0, newlineIndex));
            }
          });
          stream.on('error', reject);
          stream.on('end', () => resolve(line));
        });
        headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      } else {
        const workbook = new (await import('exceljs')).Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        if (worksheet) {
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell((cell, colNumber) => {
            headers[colNumber - 1] = String(cell.value || `col_${colNumber}`).trim();
          });
        }
      }

      // Auto-detect column mapping
      const detectedMapping = EmissionsInventoryParser.detectColumns(headers);

      res.json({
        uploadId: id,
        headers,
        detectedMapping,
        message: 'Column detection completed. Review and adjust mapping as needed.'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/emissions-inventory/:id/intelligent-parse
 * Intelligently parse CSV by scanning all cells for patterns
 */
router.post('/:id/intelligent-parse', 
  authenticateToken, 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;

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

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      // Update status to PROCESSING
      await prisma.upload.update({
        where: { id },
        data: { status: 'PROCESSING' },
      });

      // Parse intelligently
      const results = await IntelligentCSVParser.parseIntelligently(filePath);
      const summary = IntelligentCSVParser.getSummary(results);

      // Store results
      await prisma.upload.update({
        where: { id },
        data: {
          status: results.length > 0 ? 'COMPLETED' : 'FAILED',
          validationResults: JSON.stringify({
            method: 'intelligent',
            summary,
            results: results.slice(0, 20) // Store first 20 results
          }),
        },
      });

      logger.info('Intelligent CSV parsing completed', {
        uploadId: id,
        totalFound: summary.totalFound,
        highConfidence: summary.highConfidence,
        averageConfidence: summary.averageConfidence
      });

      res.json({
        uploadId: id,
        method: 'intelligent',
        summary,
        results: results.map(r => ({
          activityType: r.activityType,
          quantity: r.quantity,
          unit: r.unit,
          year: r.year,
          scope: r.scope,
          confidence: r.confidence,
          sourceRow: r.sourceRow
        })),
        message: `Found ${summary.totalFound} activities with ${summary.highConfidence} high-confidence matches`
      });
    } catch (error) {
      // Update upload status to FAILED
      if (req.params.id) {
        await prisma.upload.update({
          where: { id: req.params.id },
          data: { status: 'FAILED' },
        }).catch(() => {});
      }
      next(error);
    }
  }
);

/**
 * POST /api/emissions-inventory/:id/intelligent-import
 * Import intelligently parsed data
 */
router.post('/:id/intelligent-import', 
  authenticateToken, 
  requireRole(['ADMIN', 'EDITOR']), 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { minConfidence = 0.5 } = req.body;

      const upload = await prisma.upload.findUnique({
        where: { id },
        include: {
          site: true,
          period: true
        }
      });

      if (!upload) {
        throw createError('Upload not found', 404, 'UPLOAD_NOT_FOUND');
      }

      // Check access permissions
      if (req.user?.role !== 'ADMIN' && req.user?.customerId !== upload.customerId) {
        throw createError('Access denied', 403, 'FORBIDDEN');
      }

      const filePath = path.join(uploadDir, upload.s3Key!);
      if (!fs.existsSync(filePath)) {
        throw createError('File not found', 404, 'FILE_NOT_FOUND');
      }

      // Parse intelligently
      const results = await IntelligentCSVParser.parseIntelligently(filePath);
      
      // Convert to activity data
      const activityData = IntelligentCSVParser.toActivityData(
        results,
        upload.siteId,
        upload.periodId,
        minConfidence
      );

      if (activityData.length === 0) {
        throw createError('No valid activities found with sufficient confidence', 400, 'NO_VALID_ACTIVITIES');
      }

      // Import activities
      const imported = await prisma.activity.createMany({
        data: activityData.map(activity => ({
          ...activity,
          uploadId: upload.id
        }))
      });

      // Update upload status
      await prisma.upload.update({
        where: { id },
        data: { status: 'imported' }
      });

      logger.info('Intelligent CSV import completed', {
        uploadId: id,
        totalParsed: results.length,
        imported: imported.count,
        minConfidence,
        importedBy: req.user?.id
      });

      res.json({
        uploadId: id,
        method: 'intelligent',
        totalParsed: results.length,
        totalImported: imported.count,
        minConfidence,
        message: `Successfully imported ${imported.count} activities using intelligent parsing`,
        nextSteps: [
          'Review imported activities in the Activities page',
          'Run calculations to compute emissions',
          'Generate reports for stakeholders'
        ]
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as emissionsInventoryRoutes };
