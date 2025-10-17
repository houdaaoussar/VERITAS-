import fs from 'fs';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { logger } from '../utils/logger';

/**
 * Interface for emissions inventory CSV data
 * Based on GPC/CRF reporting format
 */
export interface EmissionsInventoryRow {
  inventoryYear?: number;
  gpcRefNo?: string;
  crfSector?: string;
  crfSubSector?: string;
  scope?: string;
  fuelTypeOrActivity?: string;
  notationKey?: string;
  activityDataAmount?: number;
  activityDataUnit?: string;
  // Additional optional fields
  description?: string;
  source?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Parsed and validated row with error tracking
 */
export interface ParsedEmissionsRow {
  rowIndex: number;
  raw: EmissionsInventoryRow;
  mapped: {
    inventoryYear?: number;
    sector?: string;
    subSector?: string;
    scope?: string;
    activityType?: string;
    quantity?: number;
    unit?: string;
    notationKey?: string;
    source?: string;
    notes?: string;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Column mapping configuration
 */
export interface ColumnMapping {
  inventoryYear?: string;
  gpcRefNo?: string;
  crfSector?: string;
  crfSubSector?: string;
  scope?: string;
  fuelTypeOrActivity?: string;
  notationKey?: string;
  activityDataAmount?: string;
  activityDataUnit?: string;
  description?: string;
}

/**
 * Parse options
 */
export interface ParseOptions {
  hasHeaders?: boolean;
  skipRows?: number;
  columnMapping?: ColumnMapping;
  dateFormat?: string;
}

/**
 * Emissions Inventory CSV Parser
 * Handles GPC/CRF format emissions inventory data
 */
export class EmissionsInventoryParser {
  
  /**
   * Auto-detect column headers from first row - flexible approach
   */
  static detectColumns(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    
    // More flexible patterns that match common variations
    const patterns = {
      inventoryYear: /inventory.*year|year|date.*year|reporting.*year/i,
      gpcRefNo: /gpc.*ref|gpc.*no|reference.*no|ref.*no|gpc/i,
      crfSector: /crf.*sector|sector|category|industry/i,
      crfSubSector: /crf.*sub.*sector|sub.*sector|sub.*category/i,
      scope: /scope|emission.*scope|ghg.*scope/i,
      fuelTypeOrActivity: /fuel.*type|activity|fuel.*activity|energy.*type|fuel|energy/i,
      notationKey: /notation.*key|notation|key|flag/i,
      activityDataAmount: /activity.*data.*amount|amount|quantity|value|consumption|usage/i,
      activityDataUnit: /activity.*data.*unit|unit|units|measurement/i,
      description: /description|desc|notes|comment|remarks/i
    };

    headers.forEach(header => {
      const cleanHeader = header.trim();
      
      // Try exact match first
      for (const [key, pattern] of Object.entries(patterns)) {
        if (pattern.test(cleanHeader)) {
          mapping[key as keyof ColumnMapping] = cleanHeader;
          break; // Use first match
        }
      }
    });

    // If no specific mappings found, try to map by position/order
    if (Object.keys(mapping).length === 0) {
      logger.info('No pattern matches found, attempting positional mapping');
      
      // Try to map first few columns to common fields
      if (headers.length > 0) mapping.inventoryYear = headers[0];
      if (headers.length > 1) mapping.fuelTypeOrActivity = headers[1];
      if (headers.length > 2) mapping.activityDataAmount = headers[2];
      if (headers.length > 3) mapping.activityDataUnit = headers[3];
      if (headers.length > 4) mapping.scope = headers[4];
    }

    logger.info('Auto-detected column mapping', { mapping, totalHeaders: headers.length });
    return mapping;
  }

  /**
   * Parse CSV file
   */
  static async parseCSV(
    filePath: string,
    options: ParseOptions = {}
  ): Promise<ParsedEmissionsRow[]> {
    return new Promise((resolve, reject) => {
      const results: ParsedEmissionsRow[] = [];
      let rowIndex = 0;
      let headers: string[] = [];
      let columnMapping: ColumnMapping = options.columnMapping || {};

      const stream = fs.createReadStream(filePath)
        .pipe(csv({ 
          headers: options.hasHeaders !== false,
          skipLines: options.skipRows || 0
        }))
        .on('headers', (csvHeaders: string[]) => {
          headers = csvHeaders;
          // Auto-detect columns if no mapping provided
          if (!options.columnMapping) {
            columnMapping = this.detectColumns(headers);
          }
        })
        .on('data', (data: any) => {
          rowIndex++;
          const parsed = this.parseRow(data, rowIndex, columnMapping);
          results.push(parsed);
        })
        .on('end', () => {
          logger.info(`CSV parsing completed: ${results.length} rows parsed`);
          resolve(results);
        })
        .on('error', (error) => {
          logger.error('CSV parsing error', { error: error.message });
          reject(error);
        });
    });
  }

  /**
   * Parse Excel file
   */
  static async parseExcel(
    filePath: string,
    options: ParseOptions = {}
  ): Promise<ParsedEmissionsRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    const results: ParsedEmissionsRow[] = [];
    const headers: string[] = [];
    let columnMapping: ColumnMapping = options.columnMapping || {};

    // Extract headers from first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value || `col_${colNumber}`).trim();
    });

    // Auto-detect columns if no mapping provided
    if (!options.columnMapping) {
      columnMapping = this.detectColumns(headers);
    }

    // Parse data rows
    const startRow = (options.hasHeaders !== false ? 2 : 1) + (options.skipRows || 0);
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= startRow) {
        const rowData: any = {};
        
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber] || `col_${colNumber}`;
          rowData[header] = cell.value;
        });
        
        const parsed = this.parseRow(rowData, rowNumber, columnMapping);
        results.push(parsed);
      }
    });

    logger.info(`Excel parsing completed: ${results.length} rows parsed`);
    return results;
  }

  /**
   * Parse individual row - flexible approach
   */
  private static parseRow(
    data: any,
    rowIndex: number,
    columnMapping: ColumnMapping
  ): ParsedEmissionsRow {
    const errors: string[] = [];
    const warnings: string[] = [];
    const raw: EmissionsInventoryRow = {};
    const mapped: ParsedEmissionsRow['mapped'] = {};

    try {
      // Extract raw data using column mapping
      for (const [targetKey, sourceKey] of Object.entries(columnMapping)) {
        if (sourceKey && data[sourceKey] !== undefined && data[sourceKey] !== null) {
          raw[targetKey as keyof EmissionsInventoryRow] = data[sourceKey];
        }
      }

      // Parse and validate inventory year (optional)
      if (raw.inventoryYear) {
        const year = this.parseYear(raw.inventoryYear);
        if (year) {
          mapped.inventoryYear = year;
        } else {
          warnings.push(`Could not parse year: ${raw.inventoryYear}`);
        }
      } else {
        // Default to current year if no year provided
        mapped.inventoryYear = new Date().getFullYear();
        warnings.push('No year provided, using current year');
      }

      // Parse sector and sub-sector (optional)
      if (raw.crfSector) {
        mapped.sector = this.cleanString(raw.crfSector);
      }
      if (raw.crfSubSector) {
        mapped.subSector = this.cleanString(raw.crfSubSector);
      }

      // Parse scope (optional, try to infer)
      if (raw.scope) {
        mapped.scope = this.parseScope(raw.scope);
      } else {
        // Try to infer scope from activity type
        mapped.scope = this.inferScopeFromActivity(raw.fuelTypeOrActivity);
      }

      // Parse activity type from fuel type or activity (required)
      if (raw.fuelTypeOrActivity) {
        mapped.activityType = this.mapActivityType(raw.fuelTypeOrActivity);
      } else {
        // Try to use any column that might contain activity info
        const activityColumn = Object.values(data).find((value: any) => 
          typeof value === 'string' && 
          value.length > 0 && 
          !this.isNumeric(value) &&
          !this.isDate(value)
        );
        if (activityColumn) {
          mapped.activityType = this.mapActivityType(activityColumn);
          warnings.push(`Used column "${activityColumn}" as activity type`);
        } else {
          errors.push('No activity type found');
        }
      }

      // Parse quantity (activity data amount) - flexible
      if (raw.activityDataAmount !== undefined) {
        const quantity = this.parseNumber(raw.activityDataAmount);
        if (quantity !== null) {
          if (quantity > 0) {
            mapped.quantity = quantity;
          } else if (quantity === 0) {
            warnings.push('Activity data amount is zero');
            mapped.quantity = 0;
          } else {
            errors.push('Activity data amount must be non-negative');
          }
        } else if (raw.notationKey) {
          warnings.push(`No quantity data (notation: ${raw.notationKey})`);
        } else {
          // Try to find any numeric column
          const numericColumn = Object.values(data).find((value: any) => 
            typeof value === 'number' || 
            (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value) > 0)
          );
          if (numericColumn) {
            mapped.quantity = parseFloat(String(numericColumn));
            warnings.push(`Used numeric column "${numericColumn}" as quantity`);
          } else {
            errors.push(`Invalid activity data amount: ${raw.activityDataAmount}`);
          }
        }
      } else {
        // Try to find any numeric column for quantity
        const numericColumn = Object.values(data).find((value: any) => 
          typeof value === 'number' || 
          (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value) > 0)
        );
        if (numericColumn) {
          mapped.quantity = parseFloat(String(numericColumn));
          warnings.push(`Used numeric column "${numericColumn}" as quantity`);
        } else {
          errors.push('No quantity data found');
        }
      }

      // Parse unit (optional, try to infer)
      if (raw.activityDataUnit) {
        mapped.unit = this.cleanString(raw.activityDataUnit);
      } else {
        // Try to infer unit from activity type
        mapped.unit = this.inferUnitFromActivity(mapped.activityType);
        if (mapped.unit) {
          warnings.push(`Inferred unit "${mapped.unit}" from activity type`);
        } else {
          mapped.unit = 'UNKNOWN';
          warnings.push('No unit found, using UNKNOWN');
        }
      }

      // Parse notation key (optional)
      if (raw.notationKey) {
        mapped.notationKey = this.cleanString(raw.notationKey);
      }

      // Build notes field from metadata
      const noteParts: string[] = [];
      if (raw.gpcRefNo) noteParts.push(`GPC Ref: ${raw.gpcRefNo}`);
      if (mapped.sector) noteParts.push(`Sector: ${mapped.sector}`);
      if (mapped.subSector) noteParts.push(`Sub-sector: ${mapped.subSector}`);
      if (mapped.notationKey) noteParts.push(`Notation: ${mapped.notationKey}`);
      if (raw.description) noteParts.push(`Description: ${raw.description}`);
      
      // Add any unmapped columns to notes
      const mappedColumns = Object.values(columnMapping);
      for (const [key, value] of Object.entries(data)) {
        if (!mappedColumns.includes(key) && value && String(value).trim()) {
          noteParts.push(`${key}: ${value}`);
        }
      }
      
      mapped.notes = noteParts.join(' | ');

      // Build source field
      mapped.source = raw.source || 'EMISSIONS_INVENTORY_UPLOAD';

      // More lenient validation - only require activity type and quantity
      if (!mapped.activityType) {
        errors.push('Activity type is required');
      }
      if (!mapped.quantity && !mapped.notationKey) {
        errors.push('Either quantity or notation key must be provided');
      }

    } catch (error) {
      errors.push(`Row parsing error: ${(error as Error).message}`);
    }

    return {
      rowIndex,
      raw,
      mapped,
      errors,
      warnings
    };
  }

  /**
   * Parse year from various formats
   */
  private static parseYear(value: any): number | null {
    if (typeof value === 'number') {
      return value >= 1900 && value <= 2100 ? Math.floor(value) : null;
    }
    
    const yearStr = String(value).trim();
    const yearNum = parseInt(yearStr, 10);
    
    if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2100) {
      return yearNum;
    }
    
    return null;
  }

  /**
   * Parse and normalize scope value
   */
  private static parseScope(value: any): string | undefined {
    const scopeStr = this.cleanString(value).toUpperCase();
    
    const scopeMapping: { [key: string]: string } = {
      'SCOPE 1': 'SCOPE_1',
      'SCOPE1': 'SCOPE_1',
      '1': 'SCOPE_1',
      'SCOPE 2': 'SCOPE_2',
      'SCOPE2': 'SCOPE_2',
      '2': 'SCOPE_2',
      'SCOPE 3': 'SCOPE_3',
      'SCOPE3': 'SCOPE_3',
      '3': 'SCOPE_3',
      'INDIRECT EMISSIONS': 'SCOPE_2',
      'DIRECT EMISSIONS': 'SCOPE_1'
    };

    return scopeMapping[scopeStr] || scopeStr;
  }

  /**
   * Map fuel type/activity to standard activity type
   */
  private static mapActivityType(value: any): string {
    const activity = this.cleanString(value).toUpperCase();
    
    // Mapping rules for common fuel types and activities
    const typeMapping: { [key: string]: string } = {
      // Electricity
      'ELECTRICITY': 'ELECTRICITY',
      'ELECTRIC': 'ELECTRICITY',
      'POWER': 'ELECTRICITY',
      
      // Heating
      'DISTRICT HEATING': 'DISTRICT_HEATING',
      'DISTRICT HEATING - HOT WATER': 'DISTRICT_HEATING',
      'DISTRICT HEATING - STEAM': 'DISTRICT_HEATING',
      'DISTRICT COOLING': 'DISTRICT_COOLING',
      
      // Natural Gas
      'NATURAL GAS': 'NATURAL_GAS',
      'GAS': 'NATURAL_GAS',
      
      // Fuels
      'DIESEL': 'DIESEL',
      'DIESEL OIL': 'DIESEL',
      'PETROL': 'PETROL',
      'GASOLINE': 'PETROL',
      'KEROSENE': 'KEROSENE',
      'KEROSENE (PARAFFIN)': 'KEROSENE',
      'LIQUEFIED PETROLEUM GAS (LPG)': 'LPG',
      'LPG': 'LPG',
      'COAL': 'COAL',
      'COAL (BITUMINOUS OR BLACK COAL)': 'COAL',
      'RESIDUAL FUEL OIL': 'FUEL_OIL',
      'WOOD OR WOOD WASTE': 'BIOMASS',
      
      // Other
      'OTHER BIOGASS': 'BIOGAS',
      'OTHER BIOGAS': 'BIOGAS',
      'OTHER LIQUID BIOFUELS': 'BIOFUEL',
      
      // Generic categories
      'FUEL': 'FUEL',
      'TRANSPORT': 'TRANSPORT',
      'WASTE': 'WASTE',
      'WATER': 'WATER'
    };

    // Try exact match first
    if (typeMapping[activity]) {
      return typeMapping[activity];
    }

    // Try partial match
    for (const [key, value] of Object.entries(typeMapping)) {
      if (activity.includes(key)) {
        return value;
      }
    }

    // Return cleaned original value if no mapping found
    return activity.replace(/[^A-Z0-9_]/g, '_');
  }

  /**
   * Parse number from various formats
   */
  private static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    // Handle string values
    const str = String(value).trim().toUpperCase();
    
    // Check for notation keys (NO, NA, NE, IE, etc.)
    if (/^(NO|NA|NE|IE|NR|C)$/.test(str)) {
      return null;
    }

    // Remove common thousand separators and parse
    const cleaned = str.replace(/[,\s]/g, '');
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? null : num;
  }

  /**
   * Clean and normalize string values
   */
  private static cleanString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }

  /**
   * Check if value is numeric
   */
  private static isNumeric(value: any): boolean {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    }
    return false;
  }

  /**
   * Check if value is a date
   */
  private static isDate(value: any): boolean {
    if (value instanceof Date) return true;
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }

  /**
   * Infer scope from activity type
   */
  private static inferScopeFromActivity(activityType: string): string {
    if (!activityType) return 'SCOPE_3';
    
    const activity = activityType.toUpperCase();
    
    // Scope 1: Direct emissions from owned/controlled sources
    if (activity.includes('NATURAL_GAS') || activity.includes('DIESEL') || 
        activity.includes('PETROL') || activity.includes('COAL') ||
        activity.includes('FUEL') || activity.includes('COMBUSTION')) {
      return 'SCOPE_1';
    }
    
    // Scope 2: Indirect emissions from purchased energy
    if (activity.includes('ELECTRICITY') || activity.includes('POWER') ||
        activity.includes('DISTRICT_HEATING') || activity.includes('DISTRICT_COOLING')) {
      return 'SCOPE_2';
    }
    
    // Default to Scope 3 for other activities
    return 'SCOPE_3';
  }

  /**
   * Infer unit from activity type
   */
  private static inferUnitFromActivity(activityType: string): string {
    if (!activityType) return 'UNKNOWN';
    
    const activity = activityType.toUpperCase();
    
    // Energy units
    if (activity.includes('ELECTRICITY') || activity.includes('POWER')) {
      return 'kWh';
    }
    if (activity.includes('NATURAL_GAS') || activity.includes('GAS')) {
      return 'm3';
    }
    if (activity.includes('DIESEL') || activity.includes('PETROL') || 
        activity.includes('FUEL') || activity.includes('OIL')) {
      return 'L';
    }
    if (activity.includes('COAL')) {
      return 'kg';
    }
    if (activity.includes('DISTRICT_HEATING') || activity.includes('DISTRICT_COOLING')) {
      return 'MJ';
    }
    
    // Default units
    return 'UNKNOWN';
  }

  /**
   * Get summary statistics from parsed data
   */
  static getSummary(parsedData: ParsedEmissionsRow[]): {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    yearRange: { min?: number; max?: number };
    activityTypes: { [key: string]: number };
    scopes: { [key: string]: number };
  } {
    const summary = {
      totalRows: parsedData.length,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      yearRange: { min: undefined as number | undefined, max: undefined as number | undefined },
      activityTypes: {} as { [key: string]: number },
      scopes: {} as { [key: string]: number }
    };

    parsedData.forEach(row => {
      if (row.errors.length === 0) {
        summary.validRows++;
      } else {
        summary.errorRows++;
      }

      if (row.warnings.length > 0) {
        summary.warningRows++;
      }

      // Track year range
      if (row.mapped.inventoryYear) {
        if (!summary.yearRange.min || row.mapped.inventoryYear < summary.yearRange.min) {
          summary.yearRange.min = row.mapped.inventoryYear;
        }
        if (!summary.yearRange.max || row.mapped.inventoryYear > summary.yearRange.max) {
          summary.yearRange.max = row.mapped.inventoryYear;
        }
      }

      // Track activity types
      if (row.mapped.activityType) {
        summary.activityTypes[row.mapped.activityType] = 
          (summary.activityTypes[row.mapped.activityType] || 0) + 1;
      }

      // Track scopes
      if (row.mapped.scope) {
        summary.scopes[row.mapped.scope] = 
          (summary.scopes[row.mapped.scope] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Convert parsed rows to activity data format
   */
  static toActivityData(
    parsedRows: ParsedEmissionsRow[],
    siteId: string,
    periodId: string,
    skipErrors: boolean = true
  ): Array<{
    siteId: string;
    periodId: string;
    type: string;
    quantity: number;
    unit: string;
    activityDateStart: Date;
    activityDateEnd: Date;
    source: string;
    notes?: string;
  }> {
    const activities = [];

    for (const row of parsedRows) {
      // Skip rows with errors if requested
      if (skipErrors && row.errors.length > 0) {
        continue;
      }

      // Skip rows without quantity (notation key entries)
      if (!row.mapped.quantity || !row.mapped.unit || !row.mapped.activityType) {
        continue;
      }

      // Create date range from inventory year
      const year = row.mapped.inventoryYear || new Date().getFullYear();
      const activityDateStart = new Date(year, 0, 1); // Jan 1
      const activityDateEnd = new Date(year, 11, 31); // Dec 31

      activities.push({
        siteId,
        periodId,
        type: row.mapped.activityType,
        quantity: row.mapped.quantity,
        unit: row.mapped.unit,
        activityDateStart,
        activityDateEnd,
        source: row.mapped.source || 'EMISSIONS_INVENTORY_UPLOAD',
        notes: row.mapped.notes
      });
    }

    return activities;
  }
}
