import fs from 'fs';
import csv from 'csv-parser';
import { logger } from '../utils/logger';

/**
 * Intelligent CSV Parser
 * Scans entire CSV to find data based on content patterns, not just column positions
 */

export interface IntelligentParseResult {
  activityType: string;
  quantity: number;
  unit: string;
  year?: number;
  scope?: string;
  sector?: string;
  description?: string;
  confidence: number; // 0-1 score
  sourceRow: number;
  sourceData: any;
}

export class IntelligentCSVParser {
  
  // Fuel/Activity patterns to recognize
  private static readonly ACTIVITY_PATTERNS = {
    ELECTRICITY: /electricity|electric|power|kwh|mwh/i,
    NATURAL_GAS: /natural\s*gas|gas\s*natural|methane|ng/i,
    DIESEL: /diesel|gas\s*oil|gasoil/i,
    PETROL: /petrol|gasoline|gas(?!.*natural)/i,
    LPG: /lpg|liquefied\s*petroleum|propane/i,
    KEROSENE: /kerosene|paraffin|jet\s*fuel/i,
    COAL: /coal|charbon/i,
    DISTRICT_HEATING: /district\s*heat|heating\s*network|chauffage/i,
    DISTRICT_COOLING: /district\s*cool|cooling\s*network/i,
    BIOMASS: /biomass|wood|timber|pellet/i,
    BIOGAS: /biogas|bio\s*gas/i,
    BIOFUEL: /biofuel|bio\s*fuel|biodiesel/i,
    FUEL_OIL: /fuel\s*oil|heavy\s*oil|residual/i,
    WATER: /water|eau/i,
    WASTE: /waste|dechet|garbage/i,
    TRANSPORT: /transport|vehicle|car|truck|fleet/i,
  };

  // Unit patterns
  private static readonly UNIT_PATTERNS = {
    // Energy
    KWH: /kwh|kilowatt/i,
    MWH: /mwh|megawatt/i,
    GJ: /gj|gigajoule/i,
    // Volume
    M3: /m3|m³|cubic\s*meter|metre\s*cube/i,
    LITER: /liter|litre|l(?!\w)/i,
    GALLON: /gallon|gal/i,
    // Mass
    KG: /kg|kilogram|kilo(?!watt)/i,
    TONNE: /tonne|ton(?!ne)|mt/i,
    // Distance
    KM: /km|kilometer|kilometre/i,
    MILE: /mile|mi(?!\w)/i,
  };

  // Scope patterns
  private static readonly SCOPE_PATTERNS = {
    SCOPE_1: /scope\s*1|scope\s*one|direct\s*emission/i,
    SCOPE_2: /scope\s*2|scope\s*two|indirect\s*emission|purchased/i,
    SCOPE_3: /scope\s*3|scope\s*three|value\s*chain/i,
  };

  /**
   * Parse CSV intelligently - scan all cells for patterns
   */
  static async parseIntelligently(filePath: string): Promise<IntelligentParseResult[]> {
    return new Promise((resolve, reject) => {
      const results: IntelligentParseResult[] = [];
      const allRows: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          allRows.push(row);
        })
        .on('end', () => {
          // Process all rows
          allRows.forEach((row, rowIndex) => {
            const parsed = this.parseRowIntelligently(row, rowIndex + 1);
            if (parsed) {
              results.push(parsed);
            }
          });
          
          logger.info(`Intelligent parsing completed: ${results.length} activities found from ${allRows.length} rows`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  /**
   * Parse a single row by scanning all cells
   */
  private static parseRowIntelligently(row: any, rowIndex: number): IntelligentParseResult | null {
    // Convert row to array of all cell values
    const cells = Object.values(row).map(v => String(v || '').trim());
    const allText = cells.join(' ');

    // Skip empty rows
    if (allText.length === 0) {
      return null;
    }

    // Extract components
    const activityType = this.detectActivityType(allText, cells);
    const quantity = this.extractQuantity(allText, cells);
    const unit = this.detectUnit(allText, cells);
    const year = this.extractYear(allText, cells);
    const scope = this.detectScope(allText, cells);
    
    // Must have at least activity type and quantity
    if (!activityType || quantity === null) {
      return null;
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence({
      hasActivityType: !!activityType,
      hasQuantity: quantity !== null,
      hasUnit: !!unit,
      hasYear: !!year,
      hasScope: !!scope,
    });

    return {
      activityType,
      quantity,
      unit: unit || 'unit',
      year,
      scope,
      description: this.buildDescription(row),
      confidence,
      sourceRow: rowIndex,
      sourceData: row,
    };
  }

  /**
   * Detect activity type from text
   */
  private static detectActivityType(allText: string, cells: string[]): string | null {
    for (const [activityType, pattern] of Object.entries(this.ACTIVITY_PATTERNS)) {
      if (pattern.test(allText)) {
        return activityType;
      }
    }
    return null;
  }

  /**
   * Extract numeric quantity from cells
   */
  private static extractQuantity(allText: string, cells: string[]): number | null {
    // Look for numbers in each cell
    for (const cell of cells) {
      // Remove common separators and try to parse
      const cleaned = cell.replace(/[,\s]/g, '');
      const num = parseFloat(cleaned);
      
      // Valid number that's not a year
      if (!isNaN(num) && num > 0 && num < 1000000000 && !(num >= 1900 && num <= 2100)) {
        return num;
      }
    }
    
    // Try extracting from full text
    const matches = allText.match(/\b(\d+(?:[.,]\d+)?)\b/g);
    if (matches) {
      for (const match of matches) {
        const num = parseFloat(match.replace(',', '.'));
        if (!isNaN(num) && num > 0 && num < 1000000000 && !(num >= 1900 && num <= 2100)) {
          return num;
        }
      }
    }
    
    return null;
  }

  /**
   * Detect unit from text
   */
  private static detectUnit(allText: string, cells: string[]): string | null {
    for (const [unit, pattern] of Object.entries(this.UNIT_PATTERNS)) {
      if (pattern.test(allText)) {
        return unit.toLowerCase();
      }
    }
    return null;
  }

  /**
   * Extract year from text
   */
  private static extractYear(allText: string, cells: string[]): number | null {
    // Look for 4-digit year
    const yearMatch = allText.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10);
    }
    
    // Check individual cells
    for (const cell of cells) {
      const num = parseInt(cell, 10);
      if (num >= 1900 && num <= 2100) {
        return num;
      }
    }
    
    return null;
  }

  /**
   * Detect scope from text
   */
  private static detectScope(allText: string, cells: string[]): string | null {
    for (const [scope, pattern] of Object.entries(this.SCOPE_PATTERNS)) {
      if (pattern.test(allText)) {
        return scope;
      }
    }
    return null;
  }

  /**
   * Build description from row data
   */
  private static buildDescription(row: any): string {
    const parts: string[] = [];
    
    for (const [key, value] of Object.entries(row)) {
      if (value && String(value).trim()) {
        parts.push(`${key}: ${value}`);
      }
    }
    
    return parts.join(' | ');
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(checks: {
    hasActivityType: boolean;
    hasQuantity: boolean;
    hasUnit: boolean;
    hasYear: boolean;
    hasScope: boolean;
  }): number {
    let score = 0;
    
    if (checks.hasActivityType) score += 0.3;
    if (checks.hasQuantity) score += 0.3;
    if (checks.hasUnit) score += 0.2;
    if (checks.hasYear) score += 0.1;
    if (checks.hasScope) score += 0.1;
    
    return score;
  }

  /**
   * Convert to activity data format
   */
  static toActivityData(
    parsedResults: IntelligentParseResult[],
    siteId: string,
    periodId: string,
    minConfidence: number = 0.5
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

    for (const result of parsedResults) {
      // Skip low confidence results
      if (result.confidence < minConfidence) {
        logger.warn(`Skipping low confidence result (${result.confidence}): ${result.activityType}`);
        continue;
      }

      // Create date range from year
      const year = result.year || new Date().getFullYear();
      const activityDateStart = new Date(year, 0, 1);
      const activityDateEnd = new Date(year, 11, 31);

      activities.push({
        siteId,
        periodId,
        type: result.activityType,
        quantity: result.quantity,
        unit: result.unit,
        activityDateStart,
        activityDateEnd,
        source: 'INTELLIGENT_CSV_PARSER',
        notes: `${result.description} (Confidence: ${(result.confidence * 100).toFixed(0)}%, Row: ${result.sourceRow})`,
      });
    }

    return activities;
  }

  /**
   * Get summary of intelligent parsing
   */
  static getSummary(results: IntelligentParseResult[]): {
    totalFound: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    activityTypes: { [key: string]: number };
    averageConfidence: number;
  } {
    const summary = {
      totalFound: results.length,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      activityTypes: {} as { [key: string]: number },
      averageConfidence: 0,
    };

    let totalConfidence = 0;

    results.forEach(result => {
      // Count confidence levels
      if (result.confidence >= 0.7) {
        summary.highConfidence++;
      } else if (result.confidence >= 0.5) {
        summary.mediumConfidence++;
      } else {
        summary.lowConfidence++;
      }

      // Count activity types
      summary.activityTypes[result.activityType] = 
        (summary.activityTypes[result.activityType] || 0) + 1;

      totalConfidence += result.confidence;
    });

    summary.averageConfidence = results.length > 0 
      ? totalConfidence / results.length 
      : 0;

    return summary;
  }
}
