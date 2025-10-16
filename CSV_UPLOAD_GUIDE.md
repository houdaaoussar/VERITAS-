# 📊 CSV Upload System - Complete Guide

## 🎯 How It Works

Your app has a **smart CSV parser** that automatically detects and maps columns from different CSV formats!

---

## ✅ What Your System Can Do

### 1. **Auto-Detect Columns**
The system recognizes these column patterns:

| Expected Data | Recognized Column Names |
|---------------|------------------------|
| **Year** | "inventory year", "year", "Year" |
| **Sector** | "crf sector", "sector", "Sector" |
| **Sub-Sector** | "crf sub sector", "sub sector" |
| **Scope** | "scope", "Scope" |
| **Activity/Fuel** | "fuel type", "activity", "fuel activity" |
| **Amount** | "activity data amount", "amount", "quantity" |
| **Unit** | "activity data unit", "unit" |
| **Notes** | "description", "desc", "notes" |

### 2. **Flexible Fuel/Activity Mapping**
Automatically maps common fuel types:
- Electricity, Natural Gas, Diesel, Petrol
- District Heating/Cooling
- LPG, Coal, Biomass, etc.

### 3. **Smart Scope Detection**
Recognizes:
- "Scope 1", "SCOPE1", "1" → SCOPE_1
- "Scope 2", "SCOPE2", "2" → SCOPE_2
- "Scope 3", "SCOPE3", "3" → SCOPE_3

---

## 📝 CSV Format Examples

### Example 1: Standard Format
```csv
Inventory Year,CRF Sector,Scope,Fuel Type or Activity,Activity Data Amount,Activity Data Unit
2024,Energy,Scope 1,Natural Gas,1500,m³
2024,Energy,Scope 2,Electricity,25000,kWh
2024,Transport,Scope 1,Diesel,800,liters
```

### Example 2: Simplified Format
```csv
Year,Sector,Scope,Activity,Quantity,Unit
2024,Energy,1,Electricity,25000,kWh
2024,Transport,1,Diesel,800,L
```

### Example 3: Custom Format (will auto-detect)
```csv
reporting_year,category,emission_scope,fuel_type,amount,measurement_unit
2024,Buildings,Scope 2,Power,25000,kWh
2024,Fleet,Scope 1,Gasoline,500,gallons
```

---

## 🚀 Upload Process (3 Steps)

### **Step 1: Upload File**
```
POST /api/emissions-inventory/upload
```

**What happens:**
- File is saved to server
- Auto-creates default site/period if not provided
- Returns `uploadId`

### **Step 2: Parse & Validate**
```
POST /api/emissions-inventory/:uploadId/parse
```

**What happens:**
- Auto-detects column headers
- Maps columns to expected fields
- Validates data
- Returns summary with errors/warnings

### **Step 3: Import Data**
```
POST /api/emissions-inventory/:uploadId/import
```

**What happens:**
- Converts to activities
- Saves to database
- Ready for calculations!

---

## 🔧 API Endpoints

### 1. **Upload CSV**
```bash
POST /api/emissions-inventory/upload

Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body:
  file: <csv file>
  customerId: <uuid>
  autoCreate: true  # Auto-create site/period
```

**Response:**
```json
{
  "uploadId": "abc-123",
  "filename": "emissions.csv",
  "size": 12345,
  "status": "uploaded"
}
```

### 2. **Auto-Detect Columns**
```bash
GET /api/emissions-inventory/:uploadId/column-detection

Headers:
  Authorization: Bearer <token>
```

**Response:**
```json
{
  "uploadId": "abc-123",
  "headers": ["Year", "Sector", "Scope", "Activity", "Amount", "Unit"],
  "detectedMapping": {
    "inventoryYear": "Year",
    "crfSector": "Sector",
    "scope": "Scope",
    "fuelTypeOrActivity": "Activity",
    "activityDataAmount": "Amount",
    "activityDataUnit": "Unit"
  }
}
```

### 3. **Parse with Custom Mapping** (Optional)
```bash
POST /api/emissions-inventory/:uploadId/parse

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "hasHeaders": true,
  "skipRows": 0,
  "columnMapping": {
    "inventoryYear": "reporting_year",
    "crfSector": "category",
    "scope": "emission_scope",
    "fuelTypeOrActivity": "fuel_type",
    "activityDataAmount": "amount",
    "activityDataUnit": "measurement_unit"
  }
}
```

**Response:**
```json
{
  "uploadId": "abc-123",
  "summary": {
    "totalRows": 100,
    "validRows": 95,
    "errorRows": 5,
    "yearRange": { "min": 2024, "max": 2024 },
    "activityTypes": {
      "ELECTRICITY": 30,
      "NATURAL_GAS": 25,
      "DIESEL": 20
    },
    "scopes": {
      "SCOPE_1": 45,
      "SCOPE_2": 30,
      "SCOPE_3": 20
    }
  },
  "errorDetails": [
    {
      "rowIndex": 5,
      "errors": ["Invalid year: abc"],
      "raw": {...}
    }
  ]
}
```

### 4. **Import Data**
```bash
POST /api/emissions-inventory/:uploadId/import

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "skipErrors": true
}
```

**Response:**
```json
{
  "uploadId": "abc-123",
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

---

## 🎨 Frontend Usage

### Current Implementation
Your `EmissionsInventoryUploadPage.tsx` handles:
1. ✅ File drag & drop
2. ✅ Upload to server
3. ✅ Parse validation
4. ✅ Import activities

### What Users See:
1. **Upload Screen** - Drag & drop CSV
2. **Parse Results** - Shows validation summary
3. **Import Confirmation** - Import valid rows
4. **Success** - Activities created!

---

## 🐛 Common Issues & Solutions

### Issue 1: "No valid rows found"
**Cause:** Column names don't match expected patterns

**Solution:** Use column detection endpoint to see mapping:
```bash
GET /api/emissions-inventory/:uploadId/column-detection
```

Then provide custom mapping in parse request.

### Issue 2: "Activity type is required"
**Cause:** Fuel/activity column is empty or not recognized

**Solution:** Check fuel type names. Supported types:
- Electricity, Natural Gas, Diesel, Petrol, LPG
- District Heating, District Cooling
- Coal, Biomass, Biogas, Biofuel

### Issue 3: "Unit is required when quantity is provided"
**Cause:** Missing unit column

**Solution:** Add unit column with values like:
- kWh, MWh (electricity)
- m³, liters, gallons (fuels)
- kg, tonnes (solid fuels)

---

## 📋 CSV Template

Here's a template your users can follow:

```csv
Inventory Year,CRF Sector,CRF Sub-Sector,Scope,Fuel Type or Activity,Activity Data Amount,Activity Data Unit,Description
2024,Energy,Stationary Combustion,Scope 1,Natural Gas,1500,m³,Office heating
2024,Energy,Purchased Electricity,Scope 2,Electricity,25000,kWh,Office consumption
2024,Transport,Mobile Combustion,Scope 1,Diesel,800,liters,Company vehicles
2024,Transport,Mobile Combustion,Scope 1,Petrol,500,liters,Company vehicles
2024,Energy,District Heating,Scope 2,District Heating,5000,kWh,Building heating
```

---

## 🔄 Testing Locally

### 1. Start Backend
```bash
npm run dev
# Backend runs on http://localhost:3002
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3002
```

### 3. Test Upload
1. Go to Emissions Inventory page
2. Drag & drop your CSV
3. Click "Parse" to validate
4. Review results
5. Click "Import" to save

---

## ✅ What Makes Your System Smart

1. **Flexible Column Names** - Recognizes variations
2. **Auto-Mapping** - No manual configuration needed
3. **Error Handling** - Shows exactly what's wrong
4. **Validation** - Checks data before import
5. **Preview** - See what will be imported
6. **Notation Keys** - Handles NO, NA, NE entries

---

## 🎯 For Different Users

Each user can upload their own CSV format because:
- ✅ Auto-detection finds the right columns
- ✅ Flexible mapping handles variations
- ✅ Custom mapping available if needed
- ✅ Clear error messages guide users

---

## 📞 Need Help?

If upload fails:
1. Check column names match patterns above
2. Use column detection endpoint
3. Provide custom mapping if needed
4. Check error details in parse response

Your CSV parser is already smart - it just needs the right column names or a custom mapping!
