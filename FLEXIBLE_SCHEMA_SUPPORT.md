# 🔄 Flexible Schema Support - Upload Any File Format!

## Overview

The ingest API now supports **MULTIPLE file schemas** with intelligent mapping. You can upload files in **any format** and the system will automatically detect and map your columns!

## ✅ Supported Schemas

### Schema 1: Original Format (Emission Category Based)
```csv
Emission Category,Site Name,Quantity,Unit,Activity Date Start,Activity Date End,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,January heating
Diesel,Warehouse,250,litres,2024-01-01,2024-01-31,Fleet fuel
```

### Schema 2: Alternative Format (Activity Type Based)
```csv
Date,Site,Activity Type,Quantity,Unit,Description
2024-01-01,Main Office,NATURAL_GAS,1500,kWh,January heating
2024-01-01,Warehouse,DIESEL,250,litres,Fleet fuel
```

### Schema 3: With Scope (GHG Protocol Format)
```csv
Date,Site,Activity Type,Scope,Quantity,Unit,Description
2024-01-01,Main Office,Natural Gas,SCOPE_1,1500,kWh,Heating
2024-01-01,Warehouse,Diesel,SCOPE_1,250,litres,Fleet
```

### Schema 4: Minimal Format (Single Date)
```csv
Date,Site,Type,Quantity,Unit
2024-01-01,Main Office,Gas,1500,kWh
2024-01-01,Warehouse,Diesel,250,litres
```

## 📋 Required Columns (Flexible Names)

| Required | Field | Accepted Column Names |
|----------|-------|----------------------|
| ✅ | **Activity Type** | Activity Type, Emission Category, Type, Category, Fuel Type, Activity, Emission, Source |
| ✅ | **Site** | Site, Site Name, Location, Facility, Building, Office, Site ID, Facility ID |
| ✅ | **Quantity** | Quantity, Amount, Value, Consumption, Usage, Volume, Total, Qty |
| ✅ | **Unit** | Unit, Units, UOM, Measurement Unit, Unit of Measure |
| ✅ | **Date** | Date, Start Date, End Date, Activity Date, Transaction Date, From Date, To Date |
| ⚪ | **Scope** | Scope, Emission Scope, GHG Scope, Scope Type *(optional - auto-determined)* |
| ⚪ | **Description** | Description, Notes, Comments, Remarks, Details, Desc *(optional)* |

## 🎯 How It Works

### 1. Intelligent Column Mapping
The system uses **string similarity** (60%+ threshold) to match your column names:

**Examples:**
- "Fuel Type" → `emission_category` ✅
- "Location" → `site_name` ✅
- "Consumption" → `quantity` ✅
- "Date" → `activity_date_start` & `activity_date_end` ✅

### 2. Single Date Column Support
If you have only **one date column**, the system automatically uses it for both start and end dates:

```csv
Date,Site,Type,Quantity,Unit
2024-01-15,Office,Gas,100,kWh
```
↓ Becomes ↓
```
activity_date_start: 2024-01-15
activity_date_end: 2024-01-15
```

### 3. Automatic Scope Determination
If you don't provide a **Scope** column, the system automatically determines it from the activity type:

| Activity Type | Auto-Determined Scope |
|--------------|----------------------|
| Natural Gas, LPG, Diesel | SCOPE_1 |
| Electricity | SCOPE_2 |
| Others | SCOPE_3 |

### 4. Category Normalization
The system recognizes common names for emission categories:

**Natural Gas:**
- "Natural Gas", "NG", "Gas", "Natural_Gas"

**Diesel:**
- "Diesel", "Diesel Fuel", "Vehicle Diesel"

**LPG:**
- "LPG", "Propane", "Butane"

**Refrigerants:**
- "Refrigerants", "HVAC", "Cooling", "R134A", "R410A"

**Process Emissions:**
- "Process", "Process Emissions", "Manufacturing"

## 📊 Example Files

### Example 1: Standard Format
```csv
Emission Type,Location,Consumption,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Heating
Diesel,Warehouse,250,litres,2024-01-01,2024-01-31,Fleet
LPG,Factory,800,kg,2024-01-01,2024-01-31,Forklifts
```

### Example 2: Minimal Format
```csv
Date,Site,Type,Qty,Unit
2024-01-15,Office,Gas,100,kWh
2024-01-15,Warehouse,Diesel,50,litres
```

### Example 3: With Scope
```csv
Date,Facility,Activity,Scope,Amount,UOM,Comments
2024-01-01,HQ,Natural Gas,SCOPE_1,1500,kWh,Jan heating
2024-01-01,Plant,Electricity,SCOPE_2,2000,kWh,Jan power
```

### Example 4: Alternative Names
```csv
Transaction Date,Facility ID,Fuel,Value,Measurement,Remarks
2024-01-01,FAC001,NG,1500,kWh,Monthly
2024-01-01,FAC002,Diesel,250,L,Fleet fuel
```

## 🚀 Upload Any Format

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Upload ANY file format
curl -X POST "http://localhost:3002/api/ingest?periodId=123&save=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@your_file.xlsx"
```

## ✨ Supported Variations

### Date Columns
✅ Single "Date" column  
✅ "Start Date" and "End Date"  
✅ "From Date" and "To Date"  
✅ "Activity Date"  
✅ "Transaction Date"  

### Activity Type Columns
✅ "Activity Type"  
✅ "Emission Category"  
✅ "Type"  
✅ "Category"  
✅ "Fuel Type"  
✅ "Energy Type"  
✅ "Source"  

### Site Columns
✅ "Site"  
✅ "Site Name"  
✅ "Location"  
✅ "Facility"  
✅ "Building"  
✅ "Office"  
✅ "Site ID"  
✅ "Facility ID"  

### Quantity Columns
✅ "Quantity"  
✅ "Amount"  
✅ "Value"  
✅ "Consumption"  
✅ "Usage"  
✅ "Volume"  
✅ "Total"  
✅ "Qty"  

## 🔍 Response with Mapping Details

When you upload a file, the response shows how columns were mapped:

```json
{
  "status": "success",
  "rows_imported": 100,
  "rows_failed": 0,
  "header_mappings": [
    {
      "targetField": "emission_category",
      "sourceColumn": "Fuel Type",
      "confidence": 0.85
    },
    {
      "targetField": "site_name",
      "sourceColumn": "Location",
      "confidence": 0.78
    },
    {
      "targetField": "quantity",
      "sourceColumn": "Consumption",
      "confidence": 0.92
    },
    {
      "targetField": "activity_date_start",
      "sourceColumn": "Date",
      "confidence": 1.0
    }
  ],
  "data": [...]
}
```

## 🎓 Best Practices

1. **Use descriptive column names** - "Fuel Type" is better than "FT"
2. **Be consistent** - Use the same column names across files
3. **Include units** - Always specify the unit (kWh, litres, kg, etc.)
4. **Date format** - Use ISO format (YYYY-MM-DD) when possible
5. **Preview first** - Always preview before saving to database

## 🛠️ Troubleshooting

### "Missing required columns"
**Problem:** System couldn't map your columns  
**Solution:** 
- Check the `detected_columns` in the response
- Ensure column names are similar to accepted names
- Use more descriptive names (e.g., "Type" instead of "T")

### "Category normalization failed"
**Problem:** Activity type not recognized  
**Solution:**
- Use common names: "Natural Gas", "Diesel", "LPG"
- Check available categories: `GET /api/ingest/categories`
- Avoid abbreviations unless listed in synonyms

### "Site not found"
**Problem:** Site doesn't exist in database  
**Solution:**
- Create the site first in the system
- Check spelling (case-insensitive matching)
- Use exact site name from database

## 📈 Migration Guide

### From Old Format to New Format

**Old Format:**
```csv
Emission Category,Site Name,Quantity,Unit,Start Date,End Date
```

**New Supported Formats:**
```csv
# Option 1: Keep the same
Emission Category,Site Name,Quantity,Unit,Start Date,End Date

# Option 2: Simplified
Date,Site,Type,Quantity,Unit

# Option 3: With Scope
Date,Site,Activity Type,Scope,Quantity,Unit

# Option 4: Your custom names
Transaction Date,Facility,Fuel Type,Amount,UOM
```

**All formats work!** The system intelligently maps them.

## 🎉 Summary

✅ **Upload ANY file format** - System adapts to your schema  
✅ **Flexible column names** - Use names that make sense to you  
✅ **Single or dual dates** - One "Date" column or separate start/end  
✅ **Optional scope** - Provide it or let system determine it  
✅ **Smart mapping** - 60%+ similarity matching  
✅ **Preview mode** - Validate before saving  

---

**Ready to upload?** Just send your file - the system will figure it out! 🚀
