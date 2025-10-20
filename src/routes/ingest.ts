import express, { Request, Response } from 'express';
import multer from 'multer';
import { db as prisma } from '../storage/storageAdapter';
import { 
  ingestFile, 
  saveIngestedData, 
  getAvailableCategories 
} from '../services/ingestService';
import { logger } from '../utils/logger';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

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
      const customer = await prisma.customer.findUnique({ id: customerId as string });

      if (!customer) {
        return res.status(404).json({
          status: 'error',
          message: `Customer not found: ${customerId}`
        });
      }

      const period = await prisma.reportingPeriod.findUnique({ id: periodId as string });

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
        customerId: customerId as string,
        periodId: periodId as string,
        originalFilename: req.file.originalname,
        filename: `ingest_${Date.now()}_${req.file.originalname}`,
        uploadedBy: req.user!.id,
        status: 'processing',
        errorCount: result.rows_failed
      });

      // Save the data
      saveResult = await saveIngestedData(
        result.data,
        customerId as string,
        periodId as string,
        uploadRecord.id
      );

      // Update upload record
      await prisma.upload.update(
        { id: uploadRecord.id },
        {
          status: saveResult.errors.length > 0 ? 'completed_with_errors' : 'completed',
          errorCount: saveResult.errors.length,
          validationResults: JSON.stringify({
            rows_imported: saveResult.created,
            rows_failed: saveResult.errors.length,
            errors: saveResult.errors
          })
        }
      );

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
 * Returns a simple template structure for users to upload their activity data
 */
router.get('/template', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const template = {
    columns: [
      'Emission Source',
      'Site/Location',
      'Activity Data',
      'Unit',
      'Start Date',
      'End Date',
      'Notes'
    ],
    example_rows: [
      {
        'Emission Source': 'Natural Gas',
        'Site/Location': 'Main Office',
        'Activity Data': 1500,
        'Unit': 'kWh',
        'Start Date': '2024-01-01',
        'End Date': '2024-01-31',
        'Notes': 'Office heating'
      },
      {
        'Emission Source': 'Electricity',
        'Site/Location': 'Main Office',
        'Activity Data': 25000,
        'Unit': 'kWh',
        'Start Date': '2024-01-01',
        'End Date': '2024-01-31',
        'Notes': 'Office electricity'
      },
      {
        'Emission Source': 'Diesel',
        'Site/Location': 'Fleet',
        'Activity Data': 800,
        'Unit': 'litres',
        'Start Date': '2024-01-01',
        'End Date': '2024-01-31',
        'Notes': 'Company vehicles'
      },
      {
        'Emission Source': 'Air Travel - International',
        'Site/Location': 'Business Travel',
        'Activity Data': 5000,
        'Unit': 'passenger-km',
        'Start Date': '2024-01-01',
        'End Date': '2024-01-31',
        'Notes': 'International flights'
      }
    ],
    supported_emission_sources: {
      'Scope 1 (Direct Emissions)': [
        'Natural Gas',
        'Diesel',
        'Petrol',
        'LPG',
        'Refrigerants',
        'Coal',
        'Fuel Oil'
      ],
      'Scope 2 (Purchased Energy)': [
        'Electricity',
        'District Heating',
        'District Cooling',
        'Steam'
      ],
      'Scope 3 (Indirect Emissions)': [
        'Air Travel - Domestic',
        'Air Travel - International',
        'Rail Travel',
        'Taxi/Car Hire',
        'Employee Commuting',
        'Waste to Landfill',
        'Recycling',
        'Water',
        'Wastewater'
      ]
    },
    notes: [
      'Simply enter your emission source name - the system will automatically determine the scope',
      'The system will automatically select appropriate emission factors based on your data',
      'Column names are flexible - the system will intelligently map similar names',
      'Dates should be in YYYY-MM-DD format',
      'All columns except Notes are required'
    ]
  };

  res.json(template);
});

/**
 * GET /api/ingest/template/download
 * Downloads a simple CSV template file with examples covering all emission scopes
 * Users only need to provide their activity data - the system handles scope classification and emission factors
 */
router.get('/template/download', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const csvContent = `Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
Petrol,Fleet,500,litres,2024-01-01,2024-01-31,Company cars
LPG,Backup Generator,200,kg,2024-01-01,2024-01-31,Emergency generator
Refrigerants,Main Office,5,kg,2024-01-01,2024-01-31,AC refrigerant top-up
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Electricity,Warehouse,12000,kWh,2024-01-01,2024-01-31,Warehouse electricity
District Heating,Main Office,5000,kWh,2024-01-01,2024-01-31,Building heating
District Cooling,Main Office,3000,kWh,2024-01-01,2024-01-31,Building cooling
Air Travel - Domestic,Business Travel,2000,passenger-km,2024-01-01,2024-01-31,Domestic flights
Air Travel - International,Business Travel,5000,passenger-km,2024-01-01,2024-01-31,International flights
Rail Travel,Business Travel,1500,passenger-km,2024-01-01,2024-01-31,Train travel
Taxi/Car Hire,Business Travel,800,passenger-km,2024-01-01,2024-01-31,Rental cars
Employee Commuting,Employee Commuting,3000,passenger-km,2024-01-01,2024-01-31,Staff commute
Waste to Landfill,Main Office,1200,kg,2024-01-01,2024-01-31,General waste
Recycling,Main Office,500,kg,2024-01-01,2024-01-31,Recycled materials
Water,Main Office,500,m³,2024-01-01,2024-01-31,Water consumption
Wastewater,Main Office,450,m³,2024-01-01,2024-01-31,Wastewater discharge`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=emissions_data_template.csv');
  res.status(200).send(csvContent);
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
      'GET /api/ingest/template': 'Get simple template structure (JSON) - just activity data needed',
      'GET /api/ingest/template/download': 'Download CSV template - system auto-calculates scopes and emission factors',
      'GET /api/ingest/help': 'This help documentation'
    }
  });
});

/**
 * POST /api/ingest/test
 * Test endpoint without authentication for demo purposes
 */
router.post('/test', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const customerId = 'customer_default';
    const periodId = 'period_default';

    // Process the file
    const result = await ingestFile(req.file.buffer);

    if (result.status === 'error') {
      return res.status(400).json(result);
    }

    // Save to database
    let uploadRecord;
    let saveResult;

    if (result.data.length > 0) {
      uploadRecord = await prisma.upload.create({
        customerId,
        periodId,
        originalFilename: req.file.originalname,
        filename: `test_${Date.now()}_${req.file.originalname}`,
        uploadedBy: 'user_default',
        status: 'processing',
        errorCount: result.rows_failed
      });

      saveResult = await saveIngestedData(
        result.data,
        customerId,
        periodId,
        uploadRecord.id
      );

      await prisma.upload.update(
        { id: uploadRecord.id },
        {
          status: saveResult.errors.length > 0 ? 'completed_with_errors' : 'completed',
          errorCount: saveResult.errors.length
        }
      );
    }

    res.json({
      status: 'success',
      message: `Successfully processed and saved ${result.rows_imported} rows`,
      rows_imported: result.rows_imported,
      rows_failed: result.rows_failed,
      activities_created: saveResult?.created || 0,
      save_errors: saveResult?.errors || [],
      data: result.data // Include the processed data for calculator
    });

  } catch (error) {
    logger.error('Test ingest error', { error: (error as Error).message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
});

export const ingestRoutes = router;
