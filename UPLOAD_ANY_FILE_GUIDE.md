# 📤 Upload ANY File - Quick Guide

## 🎉 You Can Now Upload Files in ANY Format!

The system intelligently maps your columns, so you don't need to follow a strict schema.

## ✅ Minimum Required Columns

You only need **5 columns** (with flexible names):

1. **Activity Type** (e.g., "Type", "Category", "Fuel Type", "Emission Type")
2. **Site** (e.g., "Site", "Location", "Facility", "Building")
3. **Quantity** (e.g., "Quantity", "Amount", "Consumption", "Value")
4. **Unit** (e.g., "Unit", "UOM", "Units")
5. **Date** (e.g., "Date", "Start Date", "Activity Date")

**Optional:**
- **Scope** (e.g., "Scope", "GHG Scope") - Auto-determined if not provided
- **Description** (e.g., "Notes", "Comments", "Description")

## 📊 Example Files That Work

### Format 1: Simple
```csv
Date,Site,Type,Quantity,Unit
2024-01-15,Office,Gas,100,kWh
2024-01-15,Warehouse,Diesel,50,litres
```

### Format 2: Detailed
```csv
Date,Site,Activity Type,Scope,Quantity,Unit,Description
2024-01-01,Office,Natural Gas,SCOPE_1,1500,kWh,Heating
2024-01-01,Warehouse,Diesel,SCOPE_1,250,litres,Fleet
```

### Format 3: Your Custom Names
```csv
Transaction Date,Facility,Fuel,Amount,UOM,Notes
2024-01-01,HQ,NG,1500,kWh,Monthly
2024-01-01,Plant,Diesel,250,L,Fleet
```

**All these formats work!** The system adapts to your column names.

## 🚀 How to Upload

### Step 1: Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

**Save the token from the response!**

### Step 2: Upload Your File
```bash
curl -X POST "http://localhost:3002/api/ingest?periodId=YOUR_PERIOD&save=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@your_file.xlsx"
```

**That's it!** The system will:
- ✅ Detect your column names
- ✅ Map them intelligently
- ✅ Validate the data
- ✅ Save to database

## 🔍 Preview First (Recommended)

Before saving, preview to check the mapping:

```bash
curl -X POST http://localhost:3002/api/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@your_file.xlsx"
```

The response shows:
- How columns were mapped
- Validation results
- Any issues found

## 📋 Supported Activity Types

Use common names - the system recognizes them:

| You Write | System Understands |
|-----------|-------------------|
| Natural Gas, NG, Gas | STATIONARY_COMBUSTION_NATURAL_GAS |
| Diesel, Diesel Fuel | MOBILE_COMBUSTION_DIESEL |
| LPG, Propane, Butane | STATIONARY_COMBUSTION_LPG |
| Refrigerants, HVAC, R134A | FUGITIVE_EMISSIONS_REFRIGERANTS |
| Process, Manufacturing | PROCESS_EMISSIONS |

## ⚠️ Common Issues

### "Access token required"
**Fix:** Add the Authorization header with your token from login

### "Missing required columns"
**Fix:** Ensure you have at least: Type, Site, Quantity, Unit, Date

### "Site not found"
**Fix:** The site must exist in your database first

## 📚 More Information

- **Flexible Schema Guide**: `FLEXIBLE_SCHEMA_SUPPORT.md`
- **Authentication Guide**: `INGEST_AUTHENTICATION.md`
- **Full API Docs**: `INGEST_API_DOCUMENTATION.md`
- **Quick Start**: `INGEST_QUICK_START.md`

---

**Questions?** The system is designed to be flexible - just upload your file and it will work! 🎉
