# 📥 Intelligent CSV/Excel Ingest System

## Overview

A production-ready intelligent file ingestion system that reads Excel/CSV files, intelligently maps columns, validates data, and imports emission activities into your database.

## ✨ Key Features

- **🎯 Intelligent Column Mapping**: Uses string similarity (60%+ threshold) to automatically map column headers
- **🔄 Flexible Column Names**: Accepts various column name variations (e.g., "Emission Type", "Category", "Fuel Type")
- **✅ Data Validation**: Zod schema validation with detailed error reporting
- **🗄️ Database Integration**: Retrieves emission categories from database and validates against them
- **👁️ Preview Mode**: Validate files before saving to database
- **📊 Multiple Formats**: Supports .xlsx, .xls, and .csv files (up to 100MB)
- **🔍 Detailed Feedback**: Returns mapping confidence, validation issues, and row-by-row errors

## 🏗️ Architecture

```
POST /api/ingest
    ↓
┌─────────────────────────────────────┐
│  1. File Upload (Multer)            │
│     - Accept Excel/CSV               │
│     - 100MB limit                    │
│     - MIME type validation           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  2. File Reading (XLSX)              │
│     - Parse Excel/CSV                │
│     - Extract rows as JSON           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  3. Header Mapping (String-Similarity)│
│     - Compare column names           │
│     - Match to target schema         │
│     - Calculate confidence scores    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  4. Category Normalization           │
│     - Map emission categories        │
│     - Use synonyms + similarity      │
│     - Validate against DB categories │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  5. Data Validation (Zod)            │
│     - Type checking                  │
│     - Required fields                │
│     - Date validation                │
│     - Business rules                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  6. Database Save (Optional)         │
│     - Create upload record           │
│     - Save activities                │
│     - Link to sites & periods        │
└─────────────────────────────────────┘
    ↓
Response with results
```

## 📁 File Structure

```
src/
├── config/
│   └── mapping.ts              # Schema, synonyms, validation rules
├── services/
│   └── ingestService.ts        # Core ingestion logic
└── routes/
    └── ingest.ts               # API endpoints

Documentation/
├── INGEST_API_DOCUMENTATION.md # Complete API reference
├── INGEST_QUICK_START.md       # Quick start guide
└── sample_emissions_data.csv   # Sample test file
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install xlsx zod string-similarity
npm install --save-dev @types/string-similarity
```

**Note**: File upload limit is set to 100MB. For larger files, consider splitting them or using streaming.

### 2. Start Server
```bash
npm run dev
```

Server will start on `http://localhost:3002`

### 3. Test the Endpoint

**Preview a file:**
```bash
curl -X POST http://localhost:3002/api/ingest \
  -F "file=@sample_emissions_data.csv"
```

**Save to database:**
```bash
curl -X POST "http://localhost:3002/api/ingest?customerId=YOUR_ID&periodId=YOUR_PERIOD&save=true" \
  -F "file=@sample_emissions_data.csv"
```

## 📊 Supported Emission Categories

The system retrieves categories from your database and supports:

1. **Stationary Combustion (Natural Gas)**
   - Synonyms: natural gas, ng, gas, stationary natural gas

2. **Mobile Combustion (Diesel)**
   - Synonyms: diesel, diesel fuel, vehicle diesel, mobile diesel

3. **Process Emissions**
   - Synonyms: process, industrial process, manufacturing

4. **Fugitive Emissions (Refrigerants)**
   - Synonyms: refrigerants, hvac, cooling, r134a, r410a

5. **Stationary Combustion (LPG)**
   - Synonyms: lpg, propane, butane, liquefied petroleum gas

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ingest` | POST | Upload and process file |
| `/api/ingest/categories` | GET | Get available emission categories |
| `/api/ingest/template` | GET | Get template structure |
| `/api/ingest/help` | GET | Get API documentation |

## 📋 Required Columns

| Column | Synonyms | Type | Required |
|--------|----------|------|----------|
| Emission Category | category, type, fuel type, source | String | ✅ |
| Site Name | site, location, facility, building | String | ✅ |
| Quantity | amount, consumption, usage, volume | Number | ✅ |
| Unit | units, uom, measurement unit | String | ✅ |
| Activity Date Start | start_date, from_date, period start | Date | ✅ |
| Activity Date End | end_date, to_date, period end | Date | ✅ |
| Notes | comments, description, remarks | String | ⚪ |

## 🔧 Configuration

### Adjust Mapping Confidence Threshold
Edit `src/config/mapping.ts`:
```typescript
export const MAPPING_CONFIDENCE_THRESHOLD = 0.6; // 60% similarity
```

### Add Custom Synonyms
Edit `src/config/mapping.ts`:
```typescript
export const FIELD_SYNONYMS: Record<TargetField, string[]> = {
  emission_category: [
    'emission_category',
    'category',
    'your_custom_name', // Add here
    // ...
  ],
  // ...
};
```

### Add New Emission Categories
1. Add to `EMISSION_CATEGORIES` array
2. Add synonyms to `CATEGORY_SYNONYMS`
3. Ensure corresponding emission factors exist in database

## 📈 Response Format

### Success Response
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

## 🧪 Testing

### Test with Sample File
```bash
curl -X POST http://localhost:3002/api/ingest \
  -F "file=@sample_emissions_data.csv"
```

### Test Category Retrieval
```bash
curl http://localhost:3002/api/ingest/categories
```

### Test with Different Column Names
The system handles variations like:
- "Fuel Type" → `emission_category`
- "Location" → `site_name`
- "Consumption" → `quantity`
- "From Date" → `activity_date_start`

## 🔒 Security Features

- ✅ File type validation (MIME + extension)
- ✅ File size limits (100MB)
- ✅ Rate limiting (1000 req/15min)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Error sanitization

## 🎓 Best Practices

1. **Always preview first**: Use preview mode to validate before saving
2. **Consistent naming**: Use similar column names across files
3. **Date formats**: Prefer ISO format (YYYY-MM-DD)
4. **Category names**: Use common names like "Natural Gas" or "Diesel"
5. **Batch processing**: Split large files (>10k rows) into smaller batches
6. **Error handling**: Review `issues` array and fix problems before re-uploading

## 🐛 Troubleshooting

### Missing Required Columns
**Problem**: "Missing required columns after intelligent mapping"
**Solution**: 
- Check `detected_columns` in response
- Ensure column names are similar to accepted synonyms
- Use template from `GET /api/ingest/template`

### Site Not Found
**Problem**: "Site not found: [site_name]"
**Solution**:
- Verify site exists in database
- Check spelling (case-insensitive)
- Create site first if it doesn't exist

### Category Normalization Failed
**Problem**: Category not recognized
**Solution**:
- Use supported category names
- Check `GET /api/ingest/categories`
- Add custom synonyms in config

### Invalid Date Format
**Problem**: Date parsing errors
**Solution**:
- Use ISO format: YYYY-MM-DD
- Ensure start date ≤ end date
- Check for empty date cells

## 📊 Performance

| File Size | Rows | Processing Time |
|-----------|------|-----------------|
| Small | <1,000 | <1 second |
| Medium | 1,000-10,000 | 1-5 seconds |
| Large | 10,000+ | 5-30 seconds |

## 🔄 Workflow Example

```bash
# Step 1: Get available categories
curl http://localhost:3002/api/ingest/categories

# Step 2: Preview file (validate without saving)
curl -X POST http://localhost:3002/api/ingest \
  -F "file=@emissions.xlsx"

# Step 3: Review response
# - Check rows_imported and rows_failed
# - Review header_mappings
# - Fix any issues in the file

# Step 4: Save to database
curl -X POST "http://localhost:3002/api/ingest?customerId=123&periodId=456&save=true" \
  -F "file=@emissions.xlsx"

# Step 5: Verify activities created
# Check activities_created in response
```

## 📚 Documentation

- **Quick Start**: `INGEST_QUICK_START.md`
- **Full API Reference**: `INGEST_API_DOCUMENTATION.md`
- **Sample File**: `sample_emissions_data.csv`
- **Interactive Help**: `GET /api/ingest/help`

## 🤝 Integration

### JavaScript/TypeScript
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'http://localhost:3002/api/ingest?customerId=123&periodId=456&save=true',
  {
    method: 'POST',
    body: formData
  }
);

const result = await response.json();
console.log(`Imported ${result.rows_imported} rows`);
```

### Python
```python
import requests

files = {'file': open('emissions.xlsx', 'rb')}
params = {'customerId': '123', 'periodId': '456', 'save': 'true'}

response = requests.post(
    'http://localhost:3002/api/ingest',
    files=files,
    params=params
)

result = response.json()
print(f"Imported {result['rows_imported']} rows")
```

## 🎉 Success!

Your intelligent ingest system is ready to use! It will:
- ✅ Read Excel and CSV files
- ✅ Intelligently map column headers
- ✅ Validate data with detailed errors
- ✅ Retrieve emission categories from database
- ✅ Save activities with proper relationships

**Next Steps:**
1. Test with `sample_emissions_data.csv`
2. Review the API documentation
3. Integrate with your frontend
4. Monitor logs for any issues

---

**Need Help?** Check `INGEST_API_DOCUMENTATION.md` or visit `GET /api/ingest/help`
