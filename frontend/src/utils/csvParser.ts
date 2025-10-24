/**
 * Client-Side CSV Parser
 * Parse CSV files directly in the browser - no backend needed!
 */

export interface ParsedRow {
  rowIndex: number;
  [key: string]: any;
  errors: string[];
}

export interface ParseResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  columns: string[];
  sample: ParsedRow[];
  errors: ParsedRow[];
  allData: ParsedRow[];
}

/**
 * Parse CSV file content
 */
export function parseCSV(fileContent: string): ParseResult {
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const columns = headers.map(h => h.trim());

  // Parse data rows
  const parsedRows: ParsedRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: ParsedRow = {
      rowIndex: i + 1,
      errors: []
    };

    // Map values to columns
    columns.forEach((col, idx) => {
      row[col] = values[idx]?.trim() || '';
    });

    // Validate row
    validateRow(row, columns);
    
    parsedRows.push(row);
  }

  // Calculate stats
  const validRows = parsedRows.filter(r => r.errors.length === 0);
  const errorRows = parsedRows.filter(r => r.errors.length > 0);

  return {
    totalRows: parsedRows.length,
    validRows: validRows.length,
    errorRows: errorRows.length,
    columns,
    sample: parsedRows.slice(0, 5),
    errors: errorRows.slice(0, 10),
    allData: parsedRows
  };
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Validate a parsed row
 */
function validateRow(row: ParsedRow, columns: string[]): void {
  // Check for required columns
  const requiredColumns = ['Date', 'Site', 'Activity Type', 'Scope', 'Quantity', 'Unit'];
  
  for (const col of requiredColumns) {
    const colVariations = [col, col.toLowerCase(), col.replace(/ /g, '_').toLowerCase()];
    const found = columns.some(c => colVariations.includes(c.toLowerCase()));
    
    if (!found) {
      row.errors.push(`Missing required column: ${col}`);
      continue;
    }

    // Find the actual column name
    const actualCol = columns.find(c => colVariations.includes(c.toLowerCase()));
    if (actualCol && !row[actualCol]) {
      row.errors.push(`${col} is required`);
    }
  }

  // Validate quantity is a number
  const quantityCol = columns.find(c => c.toLowerCase().includes('quantity'));
  if (quantityCol && row[quantityCol]) {
    const quantity = parseFloat(row[quantityCol]);
    if (isNaN(quantity)) {
      row.errors.push('Quantity must be a number');
    }
  }

  // Validate date format
  const dateCol = columns.find(c => c.toLowerCase().includes('date'));
  if (dateCol && row[dateCol]) {
    const dateStr = row[dateCol];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      row.errors.push('Invalid date format (use YYYY-MM-DD)');
    }
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse Excel file (requires xlsx library)
 */
export async function parseExcel(file: File): Promise<ParseResult> {
  // For now, show error - Excel parsing requires additional library
  throw new Error('Excel parsing not yet implemented. Please use CSV format.');
}
