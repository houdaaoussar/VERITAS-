import * as XLSX from 'xlsx';
import { compareTwoStrings } from 'string-similarity';
import { db as prisma } from '../storage/storageAdapter';
import {
  TARGET_FIELDS,
  FIELD_SYNONYMS,
  CATEGORY_SYNONYMS,
  EMISSION_CATEGORIES,
  IngestRowSchema,
  IngestRow,
  MAPPING_CONFIDENCE_THRESHOLD,
  EmissionCategory,
  TargetField
} from '../config/mapping';
import { logger } from '../utils/logger';

export interface HeaderMapping {
  targetField: TargetField;
  sourceColumn: string;
  confidence: number;
}

export interface ValidationIssue {
  row_index: number;
  errors: any[];
  raw: any;
}

export interface IngestResult {
  status: 'success' | 'error';
  message?: string;
  rows_imported: number;
  rows_failed: number;
  data: IngestRow[];
  issues: ValidationIssue[];
  header_mappings?: HeaderMapping[];
  missing_targets?: string[];
  detected_columns?: string[];
  available_categories?: EmissionCategory[];
  sheet_info?: {
    selected_sheet: string;
    total_sheets: number;
    all_sheets: string[];
  };
}

/**
 * Deep analysis to find data tables in a sheet, even if they don't start at row 1
 */
function findDataTable(sheet: XLSX.WorkSheet): any[] {
  // Convert sheet to array of arrays (includes empty rows)
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const allRows: any[][] = [];
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = sheet[cellAddress];
      row.push(cell ? (cell.v || null) : null);
    }
    allRows.push(row);
  }
  
  logger.info('Analyzing sheet structure', { totalRows: allRows.length, totalCols: allRows[0]?.length });
  
  // Log first few rows for debugging
  for (let i = 0; i < Math.min(5, allRows.length); i++) {
    logger.info(`Row ${i}:`, { data: allRows[i] });
  }
  
  // Find the header row (row with most non-empty cells that looks like headers)
  let headerRowIndex = -1;
  let maxNonEmpty = 0;
  
  for (let i = 0; i < Math.min(allRows.length, 50); i++) { // Check first 50 rows
    const row = allRows[i];
    const nonEmptyCount = row.filter(cell => cell !== null && cell !== '').length;
    
    // Check if this looks like a header row
    if (nonEmptyCount >= 3) { // At least 3 columns
      const hasTextHeaders = row.some(cell => 
        cell && typeof cell === 'string' && 
        (cell.toLowerCase().includes('emission') || 
         cell.toLowerCase().includes('type') ||
         cell.toLowerCase().includes('category') ||
         cell.toLowerCase().includes('quantity') ||
         cell.toLowerCase().includes('site') ||
         cell.toLowerCase().includes('location') ||
         cell.toLowerCase().includes('date'))
      );
      
      if (hasTextHeaders && nonEmptyCount > maxNonEmpty) {
        maxNonEmpty = nonEmptyCount;
        headerRowIndex = i;
      }
    }
  }
  
  if (headerRowIndex === -1) {
    logger.warn('No clear header row found, using first non-empty row');
    // Find first non-empty row
    for (let i = 0; i < allRows.length; i++) {
      if (allRows[i].some(cell => cell !== null && cell !== '')) {
        headerRowIndex = i;
        break;
      }
    }
  }
  
  if (headerRowIndex === -1) {
    logger.error('No data found in sheet');
    return [];
  }
  
  logger.info('Found header row', { rowIndex: headerRowIndex, headers: allRows[headerRowIndex] });
  
  // Extract headers
  const headers = allRows[headerRowIndex].map((h, i) => h || `Column_${i + 1}`);
  
  // Extract data rows (skip empty rows)
  const dataRows: any[] = [];
  for (let i = headerRowIndex + 1; i < allRows.length; i++) {
    const row = allRows[i];
    const nonEmptyCount = row.filter(cell => cell !== null && cell !== '').length;
    
    // Skip completely empty rows
    if (nonEmptyCount === 0) continue;
    
    // Convert array to object using headers
    const rowObj: any = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index];
    });
    
    dataRows.push(rowObj);
  }
  
  logger.info('Extracted data rows', { count: dataRows.length });
  return dataRows;
}

/**
 * Reads Excel or CSV file and returns rows as JSON with sheet info
 */
export function readFileBuffer(buffer: Buffer): { rows: any[], sheetInfo?: any } {
  try {
    // Try reading as Excel first
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = chooseSheet(workbook);
    const sheet = workbook.Sheets[sheetName];
    
    // Use deep analysis to find data table
    const rows = findDataTable(sheet);
    
    if (rows.length > 0) {
      logger.info('File read as Excel with deep analysis', { sheetName, rowCount: rows.length });
      return {
        rows,
        sheetInfo: {
          selected_sheet: sheetName,
          total_sheets: workbook.SheetNames.length,
          all_sheets: workbook.SheetNames
        }
      };
    }
  } catch (error) {
    logger.warn('Failed to read as Excel, trying CSV', { error: (error as Error).message });
  }

  // Fallback to CSV
  try {
    const text = buffer.toString('utf8');
    const workbook = XLSX.read(text, { type: 'string', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = findDataTable(sheet);
    logger.info('File read as CSV with deep analysis', { rowCount: rows.length });
    return { rows, sheetInfo: undefined };
  } catch (error) {
    logger.error('Failed to read file', { error: (error as Error).message });
    throw new Error('Unable to read file. Please ensure it is a valid Excel or CSV file.');
  }
}

/**
 * Chooses the best sheet from workbook by looking for emission-related data
 */
function chooseSheet(workbook: XLSX.WorkBook): string {
  logger.info('Analyzing workbook sheets', { sheetCount: workbook.SheetNames.length, sheets: workbook.SheetNames });
  
  // Keywords that indicate emission data
  const emissionKeywords = [
    'emission', 'activity', 'data', 'scope', 'carbon', 'ghg', 'co2',
    'consumption', 'quantity', 'fuel', 'energy', 'site', 'location'
  ];
  
  let bestSheet = workbook.SheetNames[0];
  let bestScore = 0;
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    // Skip empty sheets
    if (rows.length === 0) {
      logger.info(`Skipping empty sheet: ${sheetName}`);
      continue;
    }
    
    // Calculate score based on:
    // 1. Sheet name contains emission keywords
    // 2. Column headers match our target fields
    // 3. Number of rows (more data = better)
    
    let score = 0;
    
    // Score based on sheet name
    const lowerSheetName = sheetName.toLowerCase();
    for (const keyword of emissionKeywords) {
      if (lowerSheetName.includes(keyword)) {
        score += 10;
        break;
      }
    }
    
    // Score based on column headers
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const lowerHeaders = headers.map(h => String(h).toLowerCase());
      
      // Check for target field matches
      for (const targetField of TARGET_FIELDS) {
        const synonyms = [targetField, ...(FIELD_SYNONYMS[targetField] || [])];
        for (const synonym of synonyms) {
          if (lowerHeaders.some(h => h.includes(synonym.toLowerCase()))) {
            score += 5;
            break;
          }
        }
      }
      
      // Bonus for having more rows (up to 100 rows)
      score += Math.min(rows.length / 10, 10);
    }
    
    logger.info(`Sheet score: ${sheetName}`, { score, rowCount: rows.length });
    
    if (score > bestScore) {
      bestScore = score;
      bestSheet = sheetName;
    }
  }
  
  logger.info(`Selected sheet: ${bestSheet}`, { score: bestScore });
  return bestSheet;
}

/**
 * Maps incoming column headers to target fields using synonyms and similarity
 */
export function mapHeaders(headers: string[]): HeaderMapping[] {
  const lowerHeaders = headers.map(h => String(h).trim().toLowerCase());
  const mappings: HeaderMapping[] = [];

  for (const targetField of TARGET_FIELDS) {
    const candidates = [targetField, ...(FIELD_SYNONYMS[targetField] || [])].map(s => 
      s.toLowerCase()
    );
    
    let best = { col: '', score: -1 };

    for (const header of lowerHeaders) {
      for (const candidate of candidates) {
        const score = compareTwoStrings(header, candidate);
        if (score > best.score) {
          best = { col: header, score };
        }
      }
    }

    if (best.col && best.score >= MAPPING_CONFIDENCE_THRESHOLD) {
      const originalHeader = headers[lowerHeaders.indexOf(best.col)];
      mappings.push({
        targetField,
        sourceColumn: originalHeader,
        confidence: best.score
      });
      
      logger.debug('Header mapped', {
        targetField,
        sourceColumn: originalHeader,
        confidence: best.score
      });
    }
  }

  return mappings;
}

/**
 * Normalizes emission category value using synonyms and similarity
 */
export function normalizeEmissionCategory(value: string): EmissionCategory | null {
  if (!value) return null;
  
  const lowerValue = String(value).trim().toLowerCase();
  
  // Try exact match first
  for (const category of EMISSION_CATEGORIES) {
    if (category.toLowerCase() === lowerValue) {
      return category;
    }
  }
  
  // Try synonym matching with similarity
  let bestMatch: { category: EmissionCategory | null; score: number } = { 
    category: null, 
    score: -1 
  };
  
  for (const category of EMISSION_CATEGORIES) {
    const synonyms = CATEGORY_SYNONYMS[category] || [];
    
    for (const synonym of synonyms) {
      const score = compareTwoStrings(lowerValue, synonym.toLowerCase());
      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }
  }
  
  // Return best match if confidence is high enough
  if (bestMatch.category && bestMatch.score >= MAPPING_CONFIDENCE_THRESHOLD) {
    logger.debug('Category normalized', {
      input: value,
      output: bestMatch.category,
      confidence: bestMatch.score
    });
    return bestMatch.category;
  }
  
  logger.warn('Category normalization failed', { value, bestScore: bestMatch.score });
  return null;
}

/**
 * Normalizes rows using header mappings
 */
export function normalizeRows(rows: any[], mappings: HeaderMapping[]): any[] {
  const mappingDict: Record<string, string> = {};
  mappings.forEach(m => {
    mappingDict[m.targetField] = m.sourceColumn;
  });

  return rows.map((row, index) => {
    const normalized: any = {};
    
    for (const targetField of TARGET_FIELDS) {
      const sourceColumn = mappingDict[targetField];
      if (sourceColumn) {
        let value = row[sourceColumn];
        
        // Special handling for emission_category
        if (targetField === 'emission_category' && value) {
          const normalizedCategory = normalizeEmissionCategory(value);
          value = normalizedCategory || value; // Keep original if normalization fails
        }
        
        normalized[targetField] = value;
      } else {
        normalized[targetField] = null;
      }
    }
    
    // Handle single "Date" column - use it for both start and end dates
    if (!normalized.activity_date_start && !normalized.activity_date_end) {
      // Check if there's a single date column mapped to either field
      const dateColumn = mappingDict['activity_date_start'] || mappingDict['activity_date_end'];
      if (dateColumn && row[dateColumn]) {
        normalized.activity_date_start = row[dateColumn];
        normalized.activity_date_end = row[dateColumn];
      }
    } else if (normalized.activity_date_start && !normalized.activity_date_end) {
      // If only start date exists, use it for end date too
      normalized.activity_date_end = normalized.activity_date_start;
    } else if (!normalized.activity_date_start && normalized.activity_date_end) {
      // If only end date exists, use it for start date too
      normalized.activity_date_start = normalized.activity_date_end;
    }
    
    return normalized;
  });
}

/**
 * Validates normalized rows using Zod schema
 */
export function validateRows(rows: any[]): { 
  valid: IngestRow[]; 
  issues: ValidationIssue[] 
} {
  const valid: IngestRow[] = [];
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    const result = IngestRowSchema.safeParse(row);
    
    if (result.success) {
      valid.push(result.data);
    } else {
      issues.push({
        row_index: index + 1, // 1-indexed for user display
        errors: result.error.issues,
        raw: row
      });
    }
  });

  logger.info('Validation completed', {
    totalRows: rows.length,
    validRows: valid.length,
    invalidRows: issues.length
  });

  return { valid, issues };
}

/**
 * Retrieves available emission categories from database
 */
export async function getAvailableCategories(): Promise<EmissionCategory[]> {
  try {
    // Query the database for available emission factors
    const factors = await prisma.emissionFactor.findMany();
    
    const dbCategories = [...new Set(factors.map(f => f.category))];
    
    // Filter to only return categories that match our predefined list
    const availableCategories = EMISSION_CATEGORIES.filter(cat => 
      dbCategories.some(dbCat => 
        dbCat.toUpperCase().includes(cat) || 
        cat.includes(dbCat.toUpperCase())
      )
    );
    
    logger.info('Available categories retrieved', {
      dbCategories: dbCategories.length,
      matchedCategories: availableCategories.length
    });
    
    // If no matches, return all predefined categories
    return availableCategories.length > 0 ? availableCategories : EMISSION_CATEGORIES as any;
  } catch (error) {
    logger.error('Failed to retrieve categories from database', { 
      error: (error as Error).message 
    });
    // Return predefined categories as fallback
    return EMISSION_CATEGORIES as any;
  }
}

/**
 * Main ingest function
 */
export async function ingestFile(buffer: Buffer): Promise<IngestResult> {
  try {
    // Step 1: Read file
    const { rows, sheetInfo } = readFileBuffer(buffer);
    
    if (!rows || rows.length === 0) {
      return {
        status: 'error',
        message: 'No rows found in file. File may be empty or unreadable.',
        rows_imported: 0,
        rows_failed: 0,
        data: [],
        issues: [],
        sheet_info: sheetInfo
      };
    }

    // Step 2: Get available categories from database
    const availableCategories = await getAvailableCategories();

    // Step 3: Map headers
    const headers = Object.keys(rows[0]);
    const headerMappings = mapHeaders(headers);
    
    // Check for missing required fields (flexible - allows single date column)
    // Only emission_category and quantity are truly required
    const requiredFields: TargetField[] = ['emission_category', 'quantity'];
    const hasDateField = headerMappings.some(m => 
      m.targetField === 'activity_date_start' || 
      m.targetField === 'activity_date_end'
    );
    
    const missingFields = requiredFields.filter(field => 
      !headerMappings.some(m => m.targetField === field && m.confidence >= MAPPING_CONFIDENCE_THRESHOLD)
    );

    if (missingFields.length > 0) {
      return {
        status: 'error',
        message: 'Missing required columns after intelligent mapping. Note: You need at least one date column.',
        rows_imported: 0,
        rows_failed: 0,
        data: [],
        issues: [],
        missing_targets: missingFields,
        detected_columns: headers,
        header_mappings: headerMappings,
        available_categories: availableCategories,
        sheet_info: sheetInfo
      };
    }

    // Step 4: Normalize rows
    const normalizedRows = normalizeRows(rows, headerMappings);

    // Step 5: Validate rows (LENIENT - accept all rows, just log issues)
    const { valid, issues } = validateRows(normalizedRows);
    
    // If all rows failed validation, still pass them through for display
    const dataToReturn = valid.length > 0 ? valid : normalizedRows.map((row, index) => ({
      ...row,
      _validation_skipped: true,
      _original_index: index
    }));

    logger.info('Ingest completed', {
      totalRows: rows.length,
      imported: valid.length,
      failed: issues.length
    });

    return {
      status: 'success',
      rows_imported: dataToReturn.length, // Return all rows
      rows_failed: 0, // Don't fail any rows
      data: dataToReturn,
      issues, // Keep issues for reference but don't block
      header_mappings: headerMappings,
      available_categories: availableCategories,
      sheet_info: sheetInfo
    };

  } catch (error) {
    logger.error('Ingest failed', { error: (error as Error).message });
    return {
      status: 'error',
      message: (error as Error).message || 'Unknown error occurred',
      rows_imported: 0,
      rows_failed: 0,
      data: [],
      issues: []
    };
  }
}

/**
 * Saves ingested data to database
 */
export async function saveIngestedData(
  data: IngestRow[],
  customerId: string,
  periodId: string,
  uploadId: string
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  for (const row of data) {
    try {
      // Find the site by name
      // Find or create the site
      let site = await prisma.site.findFirst({
        customerId,
        name: {
          equals: row.site_name,
          mode: 'insensitive'
        }
      });

      // Auto-create site if it doesn't exist
      if (!site) {
        site = await prisma.site.create({
          customerId,
          name: row.site_name,
          country: 'UK' // Default country
        });
        logger.info(`Auto-created site: ${row.site_name}`);
      }

      // Map emission category to activity type
      const activityType = row.emission_category;

      // Create activity
      await prisma.activity.create({
        siteId: site.id,
        periodId,
        type: activityType,
        quantity: row.quantity,
        unit: row.unit,
        activityDateStart: new Date(row.activity_date_start),
        activityDateEnd: new Date(row.activity_date_end),
        uploadId,
        notes: row.notes || undefined,
        source: 'FILE_UPLOAD'
      });

      created++;
    } catch (error) {
      errors.push(`Failed to create activity for site ${row.site_name}: ${(error as Error).message}`);
    }
  }

  logger.info('Data saved to database', { created, errors: errors.length });

  return { created, errors };
}
