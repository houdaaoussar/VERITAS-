# Ingest API - Quick Start Guide

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

The ingest endpoint will be available at: `http://localhost:3002/api/ingest`

### 2. Get Access Token (Required)

**All endpoints require authentication!**

```bash
# Login to get access token
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@example.com",
    "password": "your_password"
  }'

# Save the token from response
# Response: {"token": "eyJhbGc...", "user": {...}}
```

### 3. Test Endpoints (With Token)

**Important**: Replace `YOUR_ACCESS_TOKEN` with the token from login response.

#### Get Available Categories
```bash
curl http://localhost:3002/api/ingest/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Template
```bash
curl http://localhost:3002/api/ingest/template \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Preview File (Without Saving)
```bash
curl -X POST http://localhost:3002/api/ingest \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@sample_emissions_data.csv"
```

#### Upload and Save to Database
```bash
# customerId is automatically set from your user account
curl -X POST "http://localhost:3002/api/ingest?periodId=YOUR_PERIOD_ID&save=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@sample_emissions_data.csv"
```

## 📋 Supported Emission Categories

1. **Stationary Combustion (Natural Gas)** - Natural gas, NG, gas
2. **Mobile Combustion (Diesel)** - Diesel, diesel fuel, vehicle diesel
3. **Process Emissions** - Process, industrial process, manufacturing
4. **Fugitive Emissions (Refrigerants)** - Refrigerants, HVAC, R134A, R410A
5. **Stationary Combustion (LPG)** - LPG, propane, butane

## 📊 Required Columns (Flexible Names)

| Required | Column | Accepted Names |
|----------|--------|----------------|
| ✅ | Emission Category | category, emission type, type, fuel type |
| ✅ | Site Name | site, location, facility, building |
| ✅ | Quantity | amount, consumption, usage, volume, qty |
| ✅ | Unit | units, uom, measurement unit |
| ✅ | Start Date | start_date, from_date, period start |
| ✅ | End Date | end_date, to_date, period end |
| ⚪ | Notes | comments, description, remarks |

## 🎯 Workflow

### Step 1: Preview Mode (Recommended)
```bash
# Upload file without saving
curl -X POST http://localhost:3002/api/ingest \
  -F "file=@your_file.xlsx"
```

**Check the response for:**
- ✅ `rows_imported`: Number of valid rows
- ❌ `rows_failed`: Number of invalid rows
- 🗺️ `header_mappings`: How columns were mapped
- ⚠️ `issues`: Validation errors (if any)

### Step 2: Fix Issues (If Any)
Review the `issues` array and fix problems in your file:
- Missing required columns
- Invalid data types
- Date format issues
- Unknown emission categories

### Step 3: Save to Database
```bash
# After successful preview, save to database
curl -X POST "http://localhost:3002/api/ingest?customerId=123&periodId=456&save=true" \
  -F "file=@your_file.xlsx"
```

## 📁 Sample File Format

### CSV Example
```csv
Emission Type,Location,Consumption,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,January heating
Diesel,Warehouse,250,litres,2024-01-01,2024-01-31,Fleet fuel
```

### Excel Example
| Emission Type | Location | Consumption | Unit | Start Date | End Date | Notes |
|--------------|----------|-------------|------|------------|----------|-------|
| Natural Gas | Main Office | 1500 | kWh | 2024-01-01 | 2024-01-31 | January |
| Diesel | Warehouse | 250 | litres | 2024-01-01 | 2024-01-31 | Fleet |

## 🔍 Response Examples

### Success Response
```json
{
  "status": "success",
  "message": "Successfully processed 100 rows",
  "rows_imported": 100,
  "rows_failed": 0,
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

### Error Response (Missing Columns)
```json
{
  "status": "error",
  "message": "Missing required columns after intelligent mapping.",
  "missing_targets": ["quantity", "unit"],
  "detected_columns": ["Emission Type", "Location", "Date"]
}
```

### Validation Issues
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
          "path": ["quantity"],
          "message": "Expected number, received string"
        }
      ],
      "raw": {...}
    }
  ]
}
```

## 🛠️ Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:3002/api/ingest`
3. **Query Params** (for save mode):
   - `customerId`: Your customer ID
   - `periodId`: Your period ID
   - `save`: true
4. **Body**: 
   - Type: form-data
   - Key: `file`
   - Value: Select your Excel/CSV file

## 🔧 Troubleshooting

### "Missing required columns"
- Check that your file has all required columns
- Column names should be similar to accepted names
- Use `GET /api/ingest/template` to see expected format

### "Site not found"
- Ensure site names in your file match database exactly
- Site names are case-insensitive
- Create sites first if they don't exist

### "Category normalization failed"
- Use one of the supported category names
- Check `GET /api/ingest/categories` for available options
- Common names like "Natural Gas" or "Diesel" work best

### "Invalid date format"
- Use ISO format: YYYY-MM-DD
- Or common formats: DD/MM/YYYY, MM/DD/YYYY
- Ensure start date ≤ end date

## 🔐 Authentication & Permissions

### Required Role
- **Upload files**: `ADMIN` or `EDITOR` role
- **View data**: Any authenticated user

### Customer Access
- Users can only access their own customer's data
- Admins can access any customer's data

**For detailed authentication guide, see**: `INGEST_AUTHENTICATION.md`

## 📚 More Information

- **Authentication guide**: `INGEST_AUTHENTICATION.md`
- **Full documentation**: `INGEST_API_DOCUMENTATION.md`
- **API help**: `GET /api/ingest/help`
- **Sample file**: `sample_emissions_data.csv`

## 🎉 Features

✅ Intelligent column mapping (60%+ similarity)
✅ Flexible column names
✅ Automatic category normalization
✅ Data validation with detailed errors
✅ Preview before saving
✅ Supports Excel (.xlsx, .xls) and CSV
✅ 100MB file size limit
✅ Batch processing support

---

**Ready to test?** Use the sample file: `sample_emissions_data.csv`
