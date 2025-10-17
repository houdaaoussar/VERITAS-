# Intelligent CSV/Excel Ingest API Documentation

## Overview

The Ingest API provides an intelligent file upload system that:
- ✅ Accepts Excel (.xlsx, .xls) and CSV files (up to 100MB)
- ✅ Intelligently maps column headers using synonyms and similarity matching
- ✅ Validates data with Zod schema
- ✅ Retrieves emission categories from the database
- ✅ Supports preview mode before saving
- ✅ Returns detailed validation results

## Supported Emission Categories

The system supports the following emission categories from your database:

1. **Stationary Combustion (Natural Gas)** - `STATIONARY_COMBUSTION_NATURAL_GAS`
2. **Mobile Combustion (Diesel)** - `MOBILE_COMBUSTION_DIESEL`
3. **Process Emissions** - `PROCESS_EMISSIONS`
4. **Fugitive Emissions (Refrigerants)** - `FUGITIVE_EMISSIONS_REFRIGERANTS`
5. **Stationary Combustion (LPG)** - `STATIONARY_COMBUSTION_LPG`

## API Endpoints

### 1. POST /api/ingest

Main endpoint for file ingestion.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File field name: `file`

**Query Parameters:**
- `customerId` (string, required if save=true): Customer ID
- `periodId` (string, required if save=true): Reporting period ID
- `save` (boolean, optional): Set to `true` to save to database, omit for preview mode

**Response:**
```json
{
  "status": "success",
  "message": "Successfully processed 150 rows",
  "rows_imported": 150,
  "rows_failed": 5,
  "data": [...],  // Only in preview mode
  "issues": [
    {
      "row_index": 3,
      "errors": [...],
      "raw": {...}
    }
  ],
  "header_mappings": [
    {
      "targetField": "emission_category",
      "sourceColumn": "Emission Type",
      "confidence": 0.95
    }
  ],
  "available_categories": [...]
}
```

**Example cURL:**

Preview mode (validate without saving):
```bash
curl -X POST http://localhost:3002/api/ingest \
  -F "file=@emissions_data.xlsx"
```

Save to database:
```bash
curl -X POST "http://localhost:3002/api/ingest?customerId=123&periodId=456&save=true" \
  -F "file=@emissions_data.xlsx"
```

### 2. GET /api/ingest/categories

Returns available emission categories from the database.

**Response:**
```json
{
  "status": "success",
  "categories": [
    "STATIONARY_COMBUSTION_NATURAL_GAS",
    "MOBILE_COMBUSTION_DIESEL",
    "PROCESS_EMISSIONS",
    "FUGITIVE_EMISSIONS_REFRIGERANTS",
    "STATIONARY_COMBUSTION_LPG"
  ],
  "count": 5
}
```

### 3. GET /api/ingest/template

Returns template structure with example data.

**Response:**
```json
{
  "columns": [...],
  "example_rows": [...],
  "supported_categories": [...],
  "notes": [...]
}
```

### 4. GET /api/ingest/help

Returns comprehensive API documentation.

## Required Columns

The following columns are required in your file (column names are flexible):

| Target Field | Synonyms | Description |
|-------------|----------|-------------|
| `emission_category` | category, emission type, activity type, type, fuel type, source | Type of emission activity |
| `site_name` | site, location, facility, building, office | Name of the site/facility |
| `quantity` | amount, value, consumption, usage, volume, total, qty | Numeric quantity |
| `unit` | units, measurement unit, uom, unit of measure | Unit of measurement |
| `activity_date_start` | start_date, from_date, date_from, period start | Start date of activity |
| `activity_date_end` | end_date, to_date, date_to, period end | End date of activity |
| `notes` | note, comments, description, remarks | Optional notes |

## Intelligent Column Mapping

The system uses **string similarity matching** to map your column names to the target schema:

### Example Mappings:
- "Fuel Type" → `emission_category` (confidence: 0.85)
- "Location" → `site_name` (confidence: 0.78)
- "Consumption" → `quantity` (confidence: 0.82)
- "From Date" → `activity_date_start` (confidence: 0.90)

**Confidence Threshold:** 0.6 (60% similarity required)

## Emission Category Normalization

The system intelligently normalizes emission category values:

### Natural Gas:
- "natural gas", "naturalgas", "ng", "gas"
- "stationary combustion natural gas"

### Diesel:
- "diesel", "mobile diesel", "diesel fuel"
- "vehicle diesel", "transport diesel"

### Process Emissions:
- "process emissions", "process"
- "industrial process", "manufacturing"

### Refrigerants:
- "refrigerants", "refrigerant", "fugitive emissions"
- "hvac", "cooling", "r134a", "r410a"

### LPG:
- "lpg", "liquefied petroleum gas", "propane", "butane"

## File Format Examples

### Excel Format (.xlsx)

| Emission Type | Location | Consumption | Unit | Start Date | End Date | Notes |
|--------------|----------|-------------|------|------------|----------|-------|
| Natural Gas | Main Office | 1500 | kWh | 2024-01-01 | 2024-01-31 | January |
| Diesel | Warehouse | 250 | litres | 2024-01-01 | 2024-01-31 | Fleet fuel |

### CSV Format

```csv
Emission Type,Location,Consumption,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,January
Diesel,Warehouse,250,litres,2024-01-01,2024-01-31,Fleet fuel
```

## Validation Rules

1. **Emission Category**: Must match one of the supported categories
2. **Site Name**: Required, must exist in database (when saving)
3. **Quantity**: Must be a positive number
4. **Unit**: Required string
5. **Dates**: Must be valid dates, start date ≤ end date
6. **Notes**: Optional

## Error Handling

### Missing Columns
```json
{
  "status": "error",
  "message": "Missing required columns after intelligent mapping.",
  "missing_targets": ["quantity", "unit"],
  "detected_columns": ["Emission Type", "Location", "Date"],
  "header_mappings": [...]
}
```

### Validation Errors
```json
{
  "status": "success",
  "rows_imported": 95,
  "rows_failed": 5,
  "issues": [
    {
      "row_index": 3,
      "errors": [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "string",
          "path": ["quantity"],
          "message": "Expected number, received string"
        }
      ],
      "raw": {
        "emission_category": "Natural Gas",
        "quantity": "invalid"
      }
    }
  ]
}
```

## Workflow

### Preview Mode (Recommended First Step)
1. Upload file without `save=true`
2. Review `header_mappings` to verify column detection
3. Check `issues` array for validation errors
4. Review `data` array to see parsed results
5. Fix any issues in your file

### Save Mode
1. After successful preview, add query parameters
2. Set `customerId` and `periodId`
3. Add `save=true` to query
4. System will:
   - Validate customer and period exist
   - Create upload record
   - Save activities to database
   - Return upload ID and creation results

## Best Practices

1. **Always preview first**: Use preview mode to validate before saving
2. **Consistent naming**: Use similar column names across files for better mapping
3. **Date formats**: Use ISO format (YYYY-MM-DD) for best results
4. **Category names**: Use common names like "Natural Gas" or "Diesel"
5. **File Size Limit**: Maximum 100MB per file
6. **Batch processing**: For large datasets, split into multiple files

## Integration Example (JavaScript)

```javascript
// Preview mode
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const previewResponse = await fetch('http://localhost:3002/api/ingest', {
  method: 'POST',
  body: formData
});

const previewResult = await previewResponse.json();

if (previewResult.status === 'success' && previewResult.rows_failed === 0) {
  // Save to database
  const saveResponse = await fetch(
    'http://localhost:3002/api/ingest?customerId=123&periodId=456&save=true',
    {
      method: 'POST',
      body: formData
    }
  );
  
  const saveResult = await saveResponse.json();
  console.log(`Created ${saveResult.activities_created} activities`);
}
```

## Troubleshooting

### Issue: "Missing required columns"
**Solution**: Check `detected_columns` and `header_mappings` in response. Ensure your file has all required columns with recognizable names.

### Issue: "Site not found"
**Solution**: Ensure site names in your file exactly match site names in the database (case-insensitive).

### Issue: "Category normalization failed"
**Solution**: Use one of the supported category names or synonyms listed above.

### Issue: "Invalid date format"
**Solution**: Use standard date formats like YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY.

## Technical Details

- **Dependencies**: xlsx, zod, string-similarity, multer
- **Validation**: Zod schema with coercion
- **Similarity Algorithm**: Dice coefficient (string-similarity)
- **Supported Formats**: .xlsx, .xls, .csv
- **Max File Size**: 100MB
- **Database**: MongoDB via Prisma

## Security Considerations

- File type validation (MIME type + extension)
- File size limits enforced
- Rate limiting applied (1000 requests per 15 minutes)
- Input validation with Zod
- SQL injection prevention via Prisma ORM

## Performance

- **Small files** (<1000 rows): < 1 second
- **Medium files** (1000-10000 rows): 1-5 seconds
- **Large files** (10000+ rows): 5-30 seconds

For very large files, consider:
- Splitting into smaller batches
- Using CSV format (faster than Excel)
- Implementing background job processing

---

**Need Help?** Visit `GET /api/ingest/help` for interactive documentation.
