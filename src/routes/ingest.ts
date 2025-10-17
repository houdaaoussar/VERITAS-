import express, { Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { 
  ingestFile, 
  saveIngestedData, 
  getAvailableCategories 
} from '../services/ingestService';
import { logger } from '../utils/logger';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel and CSV files
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'));
    }
  }
});

/**
 * GET /api/ingest/test
 * Test endpoint without authentication - for development only
 */
router.post('/test', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Please upload a file with field name "file".'
      });
    }

    logger.info('File upload received (TEST MODE)', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Process the file (preview mode only - no save)
    const result = await ingestFile(req.file.buffer);

    // Return response
    res.json({
      status: result.status,
      message: `Successfully processed ${result.rows_imported} rows (TEST/PREVIEW MODE - NO AUTH)`,
      rows_imported: result.rows_imported,
      rows_failed: result.rows_failed,
      data: result.data,
      issues: result.issues,
      header_mappings: result.header_mappings,
      available_categories: result.available_categories
    });

  } catch (error) {
    logger.error('Test ingest endpoint error', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during file ingestion',
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/ingest/categories
 * Returns available emission categories from the database
 */
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await getAvailableCategories();
    
    res.json({
      status: 'success',
      categories,
      count: categories.length
    });
  } catch (error) {
    logger.error('Failed to retrieve categories', { error: (error as Error).message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve emission categories',
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/ingest
 * Accepts file upload, reads Excel/CSV, maps columns intelligently, validates, and returns results
 * 
 * Query parameters:
 * - customerId: Customer ID (optional, defaults to authenticated user's customerId)
 * - periodId: Reporting period ID (required if save=true)
 * - save: Whether to save to database (optional, default: false)
 */
router.post('/', authenticateToken, requireRole(['ADMIN', 'EDITOR']), upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Please upload a file with field name "file".'
      });
    }

    logger.info('File upload received', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract query parameters
    const { periodId, save } = req.query;
    // Use customerId from query or default to authenticated user's customerId
    const customerId = (req.query.customerId as string) || req.user?.customerId;
    const shouldSave = save === 'true' || save === '1';

    // Validate required parameters if saving
    if (shouldSave && !periodId) {
      return res.status(400).json({
        status: 'error',
        message: 'periodId is required when save=true'
      });
    }

    if (!customerId) {
      return res.status(400).json({
        status: 'error',
        message: 'customerId could not be determined'
      });
    }

    // Verify user has access to this customer
    if (req.user?.role !== 'ADMIN' && req.user?.customerId !== customerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to customer data'
      });
    }

    // Verify customer and period exist if saving
    if (shouldSave) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId as string }
      });

      if (!customer) {
        return res.status(404).json({
          status: 'error',
          message: `Customer not found: ${customerId}`
        });
      }

      const period = await prisma.reportingPeriod.findUnique({
        where: { id: periodId as string }
      });

      if (!period) {
        return res.status(404).json({
          status: 'error',
          message: `Reporting period not found: ${periodId}`
        });
      }

      if (period.customerId !== customerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Reporting period does not belong to the specified customer'
        });
      }
    }

    // Process the file
    const result = await ingestFile(req.file.buffer);

    // If ingestion failed, return error
    if (result.status === 'error') {
      return res.status(400).json(result);
    }

    // Save to database if requested
    let uploadRecord;
    let saveResult;

    if (shouldSave && result.data.length > 0) {
      // Create upload record
      uploadRecord = await prisma.upload.create({
        data: {
          customerId: customerId as string,
          periodId: periodId as string,
          originalFilename: req.file.originalname,
          filename: `ingest_${Date.now()}_${req.file.originalname}`,
          uploadedBy: req.user!.id,
          status: 'processing',
          errorCount: result.rows_failed
        }
      });

      // Save the data
      saveResult = await saveIngestedData(
        result.data,
        customerId as string,
        periodId as string,
        uploadRecord.id
      );

      // Update upload record
      await prisma.upload.update({
        where: { id: uploadRecord.id },
        data: {
          status: saveResult.errors.length > 0 ? 'completed_with_errors' : 'completed',
          errorCount: saveResult.errors.length,
          validationResults: JSON.stringify({
            rows_imported: saveResult.created,
            rows_failed: saveResult.errors.length,
            errors: saveResult.errors
          })
        }
      });

      logger.info('Data saved to database', {
        uploadId: uploadRecord.id,
        created: saveResult.created,
        errors: saveResult.errors.length
      });
    }

    // Return response
    const response: any = {
      status: 'success',
      message: shouldSave 
        ? `Successfully processed and saved ${result.rows_imported} rows` 
        : `Successfully processed ${result.rows_imported} rows (preview mode)`,
      rows_imported: result.rows_imported,
      rows_failed: result.rows_failed,
      data: shouldSave ? undefined : result.data, // Don't return data if saved
      issues: result.issues,
      header_mappings: result.header_mappings,
      available_categories: result.available_categories
    };

    if (shouldSave && uploadRecord) {
      response.upload_id = uploadRecord.id;
      response.activities_created = saveResult?.created || 0;
      response.save_errors = saveResult?.errors || [];
    }

    res.json(response);

  } catch (error) {
    logger.error('Ingest endpoint error', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during file ingestion',
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/ingest/template
 * Returns a template file with expected column headers
 */
router.get('/template', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const template = {
    columns: [
      'Emission Category',
      'Site Name',
      'Quantity',
      'Unit',
      'Activity Date Start',
      'Activity Date End',
      'Notes'
    ],
    example_rows: [
      {
        'Emission Category': 'Natural Gas',
        'Site Name': 'Main Office',
        'Quantity': 1500,
        'Unit': 'kWh',
        'Activity Date Start': '2024-01-01',
        'Activity Date End': '2024-01-31',
        'Notes': 'January consumption'
      },
      {
        'Emission Category': 'Diesel',
        'Site Name': 'Warehouse',
        'Quantity': 250,
        'Unit': 'litres',
        'Activity Date Start': '2024-01-01',
        'Activity Date End': '2024-01-31',
        'Notes': 'Fleet fuel'
      }
    ],
    supported_categories: [
      'Stationary Combustion (Natural Gas)',
      'Mobile Combustion (Diesel)',
      'Process Emissions',
      'Fugitive Emissions (Refrigerants)',
      'Stationary Combustion (LPG)'
    ],
    notes: [
      'Column names are flexible - the system will intelligently map similar names',
      'Dates can be in various formats (YYYY-MM-DD, DD/MM/YYYY, etc.)',
      'Emission categories can use common names (e.g., "Natural Gas", "Diesel")',
      'All columns except Notes are required'
    ]
  };

  res.json(template);
});

/**
 * GET /api/ingest/help
 * Returns documentation about the ingest endpoint
 */
router.get('/help', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    endpoint: 'POST /api/ingest',
    description: 'Intelligent file ingestion for emission activity data',
    features: [
      'Accepts Excel (.xlsx, .xls) and CSV files',
      'Intelligent column mapping using synonyms and similarity matching',
      'Automatic data validation with detailed error reporting',
      'Preview mode to validate before saving',
      'Retrieves available emission categories from database'
    ],
    usage: {
      method: 'POST',
      content_type: 'multipart/form-data',
      file_field: 'file',
      query_parameters: {
        customerId: 'Customer ID (required if save=true)',
        periodId: 'Reporting period ID (required if save=true)',
        save: 'Set to "true" to save to database, omit for preview mode'
      }
    },
    example_curl: `curl -X POST http://localhost:3000/api/ingest?customerId=123&periodId=456&save=true \\
  -F "file=@emissions_data.xlsx"`,
    response_fields: {
      status: 'success or error',
      rows_imported: 'Number of valid rows',
      rows_failed: 'Number of invalid rows',
      data: 'Array of validated data (preview mode only)',
      issues: 'Array of validation errors',
      header_mappings: 'How columns were mapped',
      available_categories: 'Emission categories from database'
    },
    other_endpoints: {
      'GET /api/ingest/categories': 'List available emission categories',
      'GET /api/ingest/template': 'Get template structure',
      'GET /api/ingest/help': 'This help documentation'
    }
  });
});

export const ingestRoutes = router;
