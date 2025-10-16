# Emissions Inventory CSV Upload Guide

## Overview

This feature allows you to upload and import emissions inventory data from CSV or Excel files in GPC/CRF format directly into your sustainability management platform.

## Features

### 1. **Intelligent CSV Parsing**
- Auto-detects column headers and data structure
- Supports GPC (Global Protocol for Community-Scale Greenhouse Gas Emission Inventories) format
- Handles CRF (Common Reporting Format) data
- Smart column mapping with pattern matching

### 2. **Data Validation & Cleaning**
- Validates data types and formats
- Handles notation keys (NO, NA, NE, IE, etc.) for missing/non-applicable data
- Provides detailed error and warning messages
- Shows summary statistics before import

### 3. **Activity Type Mapping**
Automatically maps fuel types and activities to standard categories:
- **Electricity**: Electricity, Electric, Power
- **Natural Gas**: Natural Gas, Gas
- **Fuels**: Diesel, Petrol, Kerosene, LPG, Coal, etc.
- **District Energy**: District Heating, District Cooling
- **Biofuels**: Biogas, Biodiesel, Wood waste
- And many more...

### 4. **Scope Detection**
Automatically identifies and normalizes emission scopes:
- Scope 1 (Direct emissions)
- Scope 2 (Indirect emissions - electricity)
- Scope 3 (Other indirect emissions)

## CSV File Format

### Required Columns

Your CSV file should include the following columns (column names are auto-detected):

| Column | Expected Names | Description | Example |
|--------|---------------|-------------|---------|
| Inventory Year | `Inventory Year`, `Year` | Year of the inventory | 2015 |
| GPC Ref No. | `GPC ref. no.`, `GPC Ref No` | GPC reference number | - |
| CRF Sector | `CRF - Sector`, `Sector` | CRF sector classification | Stationary Energy |
| CRF Sub-Sector | `CRF - Sub-sector`, `Sub-Sector` | Sub-sector details | Residential Buildings |
| Scope | `Scope` | Emission scope | Indirect emissions |
| Fuel Type/Activity | `Fuel type or activity`, `Activity` | Type of fuel or activity | Electricity |
| Activity Data Amount | `Activity data - Amount`, `Amount`, `Quantity` | Numerical quantity | 50844998.8 |
| Activity Data Unit | `Activity data - Unit`, `Unit` | Unit of measurement | MJ |
| Notation Key | `Notation key` | Notation for missing data | NO, NA, NE, IE |

### Example CSV Structure

```csv
Inventory year,GPC ref. no.,CRF - Sector,CRF - Sub-sector,Scope,Fuel type or activity,Notation key,Activity data - Amount,Activity data - Unit
2015,,Stationary Energy,Residential Buildings,Indirect emissions,Electricity,,50844998.8,MJ
2015,,Stationary Energy,Residential Buildings,Indirect emissions,District heating - hot water,,410426994.8,MJ
2015,,Stationary Energy,Residential Buildings,Indirect emissions,District Cooling,NE,,
2015,,Stationary Energy,Residential Buildings,Direct emissions,Coal (bituminous or Black coal),,29868325.49,MJ
2015,,Stationary Energy,Residential Buildings,Direct emissions,Diesel oil,,
2015,,Stationary Energy,Residential Buildings,Direct emissions,Kerosene (paraffin),NE,,
```

## How to Use

### Step 1: Prepare Your Data

1. Export your emissions inventory data to CSV or Excel format
2. Ensure the file has headers in the first row
3. Verify data quality (no special characters, consistent formatting)

### Step 2: Upload File

1. Navigate to **Emissions Inventory** page in the app
2. Select the **Site** where the activities occurred
3. Select the **Reporting Period** (year/quarter)
4. Drag and drop your CSV/Excel file or click to browse
5. Wait for the upload to complete

### Step 3: Parse & Validate

1. Click **Parse & Validate** button
2. Review the parsing summary:
   - Total rows parsed
   - Valid rows (ready for import)
   - Error rows (will be skipped)
   - Warning rows (imported but flagged)
3. Check the **Year Range** detected
4. Review **Activity Types** found in your data
5. Inspect **Error Details** if any rows failed validation

### Step 4: Import Activities

1. Review the import summary
2. Click **Import X Activities** button
3. Wait for the import to complete
4. View confirmation message with next steps

### Step 5: Verify & Calculate

1. Navigate to **Activities** page to verify imported data
2. Go to **Calculations** page to run emission calculations
3. Generate reports from the **Reports** page

## API Endpoints

### POST `/api/emissions-inventory/upload`
Upload a CSV/Excel file

**Request:**
```javascript
FormData {
  file: File,
  customerId: string,
  siteId: string,
  periodId: string
}
```

**Response:**
```json
{
  "uploadId": "uuid",
  "filename": "emissions_2015.csv",
  "size": 12345,
  "status": "uploaded",
  "message": "File uploaded successfully"
}
```

### POST `/api/emissions-inventory/:id/parse`
Parse and validate uploaded file

**Request:**
```json
{
  "hasHeaders": true,
  "skipRows": 0,
  "columnMapping": {} // optional
}
```

**Response:**
```json
{
  "uploadId": "uuid",
  "summary": {
    "totalRows": 100,
    "validRows": 95,
    "errorRows": 5,
    "warningRows": 10,
    "yearRange": { "min": 2015, "max": 2015 },
    "activityTypes": {
      "ELECTRICITY": 20,
      "NATURAL_GAS": 15,
      "DIESEL": 10
    },
    "scopes": {
      "SCOPE_1": 40,
      "SCOPE_2": 55
    }
  },
  "sample": [...],
  "errorDetails": [...]
}
```

### POST `/api/emissions-inventory/:id/import`
Import parsed data as activities

**Request:**
```json
{
  "skipErrors": true
}
```

**Response:**
```json
{
  "uploadId": "uuid",
  "totalParsed": 100,
  "totalImported": 95,
  "message": "Successfully imported 95 activities",
  "nextSteps": [
    "Review imported activities",
    "Run calculations",
    "Generate reports"
  ]
}
```

### GET `/api/emissions-inventory/:id/preview`
Preview parsed data without importing

**Query Parameters:**
- `limit`: Number of rows to preview (default: 100, max: 1000)

### GET `/api/emissions-inventory/:id/column-detection`
Auto-detect columns from uploaded file

## Supported Notation Keys

The system recognizes the following notation keys for missing/non-applicable data:

- **NO**: Not Occurring
- **NA**: Not Applicable
- **NE**: Not Estimated
- **IE**: Included Elsewhere
- **NR**: Not Reported
- **C**: Confidential

Rows with notation keys will be skipped during import but logged for reference.

## Data Mapping

### Activity Types Mapped

The parser automatically maps common fuel types to standardized activity types:

| Source Value | Mapped To |
|-------------|-----------|
| Electricity, Electric, Power | ELECTRICITY |
| Natural Gas, Gas | NATURAL_GAS |
| Diesel, Diesel Oil | DIESEL |
| Petrol, Gasoline | PETROL |
| Kerosene, Kerosene (paraffin) | KEROSENE |
| LPG, Liquefied Petroleum Gas | LPG |
| Coal, Coal (bituminous) | COAL |
| District Heating, District Heating - hot water | DISTRICT_HEATING |
| District Cooling | DISTRICT_COOLING |
| Wood waste, Biomass | BIOMASS |
| Other Biogas | BIOGAS |

### Scope Mapping

| Source Value | Mapped To |
|-------------|-----------|
| Scope 1, Direct emissions, 1 | SCOPE_1 |
| Scope 2, Indirect emissions, 2 | SCOPE_2 |
| Scope 3, 3 | SCOPE_3 |

## Troubleshooting

### Common Issues

**Issue:** No valid rows found after parsing
- **Solution**: Check that your CSV has the correct column headers
- Verify data is in the expected format
- Ensure quantity values are numeric

**Issue:** Many error rows
- **Solution**: Review the error details in the parse results
- Common errors: missing required fields, invalid numbers, date format issues
- Fix errors in source file and re-upload

**Issue:** Activity types not recognized
- **Solution**: The parser will create a sanitized version of unrecognized types
- Consider updating the mapping rules in `emissionsInventoryParser.ts`

**Issue:** Date range incorrect
- **Solution**: Check the "Inventory Year" column in your CSV
- Ensure years are in YYYY format (e.g., 2015, not 15)

## Advanced Configuration

### Custom Column Mapping

If your CSV uses different column names, you can provide custom mapping:

```javascript
{
  "columnMapping": {
    "inventoryYear": "Year",
    "crfSector": "Sector Name",
    "activityDataAmount": "Quantity",
    "activityDataUnit": "Unit of Measure"
  }
}
```

### Skip Header Rows

If your CSV has multiple header rows or metadata at the top:

```javascript
{
  "hasHeaders": true,
  "skipRows": 2  // Skip first 2 rows
}
```

## Best Practices

1. **Prepare Data Quality**: Clean your data before upload
2. **Test with Sample**: Upload a small sample file first to verify formatting
3. **Review Parse Results**: Always check the parse summary before importing
4. **Handle Errors**: Fix errors in source data rather than skipping them
5. **Verify After Import**: Check the Activities page after import
6. **Run Calculations**: Execute emission calculations after import
7. **Regular Backups**: Keep backup copies of your source CSV files

## Support

For additional help:
- Check the error messages in parse results
- Review the API response for detailed error information
- Consult the application logs for debugging
- Contact system administrator for advanced issues

## Related Documentation

- [Activity Management](./docs/activities.md)
- [Calculation Engine](./docs/calculations.md)
- [Emission Factors](./docs/emission-factors.md)
- [Reporting](./docs/reporting.md)
