# 📊 CSV Template - Final Implementation Summary

## What Was Created

### ✅ Simple, User-Friendly Template

The template has been redesigned based on your requirements:

**Users provide ONLY their activity data:**
- Emission Source (e.g., "Natural Gas", "Electricity", "Diesel")
- Site/Location (e.g., "Main Office", "Fleet")
- Activity Data (e.g., 1500, 25000, 800)
- Unit (e.g., kWh, litres, kg)
- Start Date & End Date
- Notes (optional)

**System automatically handles:**
- ✅ Scope classification (Scope 1, 2, or 3)
- ✅ Emission factor selection
- ✅ Emission calculations
- ✅ Reporting by scope

---

## 📁 Files Created

### 1. Template File
**Location:** `templates/simple_emissions_template.csv`

**Columns (7 total, 6 required):**
1. Emission Source
2. Site/Location
3. Activity Data
4. Unit
5. Start Date
6. End Date
7. Notes (optional)

**Coverage:** 18 example rows covering:
- 5 Scope 1 sources (Natural Gas, Diesel, Petrol, LPG, Refrigerants)
- 4 Scope 2 sources (Electricity x2, District Heating, District Cooling)
- 9 Scope 3 sources (Air Travel, Rail, Taxi, Commuting, Waste, Recycling, Water, Wastewater)

### 2. User Guide
**Location:** `SIMPLE_TEMPLATE_GUIDE.md`

**Contents:**
- Quick start guide
- Column explanations
- Supported emission sources by scope
- Complete examples
- Best practices
- Troubleshooting
- FAQ section

### 3. API Endpoints

#### GET /api/ingest/template
Returns JSON with:
- Column names
- Example rows
- Supported emission sources grouped by scope
- Usage notes

#### GET /api/ingest/template/download
Downloads the CSV template file ready to use.

---

## 🎯 How Users Use It

### Step 1: Download Template
```bash
GET /api/ingest/template/download
```

### Step 2: Fill in Their Data
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

### Step 3: Upload
```bash
POST /api/ingest?customerId=xxx&periodId=yyy&save=true
```

### Step 4: System Processes

**For "Natural Gas":**
- Recognizes as Scope 1 (Stationary Combustion)
- Selects emission factor from database
- Calculates emissions

**For "Electricity":**
- Recognizes as Scope 2 (Purchased Electricity)
- Selects emission factor from database
- Calculates emissions

**For "Diesel":**
- Recognizes as Scope 1 (Mobile Combustion)
- Selects emission factor from database
- Calculates emissions

### Step 5: Results
Users get emissions broken down by:
- Scope 1 Total
- Scope 2 Total
- Scope 3 Total
- Total Carbon Footprint

---

## 🔑 Key Features

### 1. Simplicity
- **Only 7 columns** (6 required)
- **No technical jargon** - use common names
- **No scope specification needed** - system determines automatically
- **No emission factors needed** - system selects automatically

### 2. Automatic Intelligence
- **Scope Classification**: System automatically determines if emission is Scope 1, 2, or 3
- **Emission Factor Selection**: System selects appropriate factors from database
- **Calculation**: System calculates all emissions automatically
- **Validation**: System validates data and provides clear error messages

### 3. Comprehensive Coverage
- **Scope 1**: Natural Gas, Diesel, Petrol, LPG, Refrigerants, Coal, Fuel Oil
- **Scope 2**: Electricity, District Heating, District Cooling, Steam
- **Scope 3**: Air Travel, Rail, Taxi, Commuting, Waste, Water, Wastewater

### 4. Flexibility
- **Multiple sites** supported
- **Different time periods** supported
- **Various units** supported (kWh, litres, kg, m³, passenger-km, etc.)
- **Intelligent column mapping** - system recognizes variations

---

## 📊 Template Example

### What User Provides:
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
Air Travel - International,Business Travel,5000,passenger-km,2024-01-01,2024-01-31,International flights
```

### What System Does:

| Emission Source | Scope | Emission Factor | Calculation | Result |
|----------------|-------|-----------------|-------------|--------|
| Natural Gas | Scope 1 | 0.0002027 kgCO2e/kWh | 1500 × 0.0002027 | 0.304 kgCO2e |
| Electricity | Scope 2 | 0.00019338 kgCO2e/kWh | 25000 × 0.00019338 | 4.835 kgCO2e |
| Diesel | Scope 1 | 0.000239 kgCO2e/kWh | 800 × 0.000239 | 0.191 kgCO2e |
| Air Travel | Scope 3 | 0.00012 kgCO2e/passenger-km | 5000 × 0.00012 | 0.600 kgCO2e |

**Total: 5.930 kgCO2e**

---

## 🎓 Supported Emission Sources

### Scope 1 (Direct Emissions) - Auto-Detected
- Natural Gas
- Diesel
- Petrol
- LPG
- Refrigerants
- Coal
- Fuel Oil
- Kerosene
- Biomass

### Scope 2 (Purchased Energy) - Auto-Detected
- Electricity
- District Heating
- District Cooling
- Steam

### Scope 3 (Indirect Emissions) - Auto-Detected
- Air Travel - Domestic
- Air Travel - International
- Rail Travel
- Taxi/Car Hire
- Employee Commuting
- Waste to Landfill
- Recycling
- Waste Incineration
- Water
- Wastewater
- Purchased Goods & Services
- Upstream Transport

---

## 💡 Key Differences from Previous Version

### ❌ Removed (User doesn't need to provide):
- Scope column (Scope 1, 2, 3) - **System determines automatically**
- Emission Factor column - **System selects automatically**
- Emission Factor Unit column - **System handles automatically**
- Emission Factor Source column - **System tracks automatically**
- Complex category names - **Simple names work**

### ✅ Kept (User provides):
- Emission Source (simple name like "Natural Gas")
- Site/Location (where it happened)
- Activity Data (how much)
- Unit (measurement unit)
- Start Date & End Date (when)
- Notes (optional context)

---

## 🚀 Benefits

### For Users:
1. **Simple** - Just provide consumption data
2. **No technical knowledge required** - Use common names
3. **Fast** - Quick to fill out
4. **Accurate** - System uses latest emission factors
5. **Comprehensive** - All scopes covered
6. **Flexible** - Works with existing data

### For the System:
1. **Intelligent** - Auto-classifies emissions
2. **Maintainable** - Emission factors in database
3. **Auditable** - Tracks which factors were used
4. **Scalable** - Easy to add new emission sources
5. **Consistent** - Standardized calculations

---

## 📝 Integration

### Works With:
- ✅ Intelligent CSV Parser (`intelligentCSVParser.ts`)
- ✅ Ingest Service (`ingestService.ts`)
- ✅ Emissions Inventory Parser (`emissionsInventoryParser.ts`)
- ✅ Activity creation endpoints
- ✅ Calculation engine
- ✅ Existing emission factor database

### Column Mapping:
- "Emission Source" → activity type + scope determination
- "Site/Location" → site identification
- "Activity Data" → quantity
- "Unit" → unit
- "Start Date" & "End Date" → activity period
- "Notes" → notes field

---

## 🎯 User Journey

### Before (Complex):
1. User needs to know: Scope, Emission Category, Emission Factor, Source, etc.
2. User needs to research emission factors
3. User needs to understand GHG Protocol scopes
4. User needs to format complex category names
5. **High barrier to entry**

### After (Simple):
1. User knows: "We used 1500 kWh of Natural Gas"
2. User enters: Natural Gas, Main Office, 1500, kWh, dates
3. System does everything else
4. **Low barrier to entry**

---

## 📞 API Endpoints Summary

### GET /api/ingest/template
**Purpose:** Get template structure as JSON  
**Response:** Column names, examples, supported sources

### GET /api/ingest/template/download
**Purpose:** Download CSV template file  
**Response:** Ready-to-use CSV with examples

### POST /api/ingest
**Purpose:** Upload emissions data  
**Parameters:** file, customerId, periodId, save  
**Response:** Validation results, imported rows

### GET /api/ingest/help
**Purpose:** API documentation  
**Response:** Complete API guide

---

## ✅ Success Criteria Met

### ✓ Simple Template
- Only 7 columns (6 required)
- No technical jargon
- Common emission source names

### ✓ Automatic Scope Detection
- System determines Scope 1, 2, or 3
- Based on emission source name
- No user input needed

### ✓ Automatic Emission Factors
- System selects appropriate factors
- From database (DESNZ, IPCC, etc.)
- No user input needed

### ✓ Comprehensive Coverage
- All three scopes included
- Major emission sources covered
- Examples provided

### ✓ User-Friendly
- Clear examples
- Simple instructions
- Helpful error messages

---

## 📚 Documentation

### For Users:
- **SIMPLE_TEMPLATE_GUIDE.md** - Complete user guide
- **Template file** - Ready-to-use CSV with examples
- **API help endpoint** - Online documentation

### For Developers:
- **This file** - Implementation summary
- **API routes** - `src/routes/ingest.ts`
- **Parser** - `src/services/intelligentCSVParser.ts`

---

## 🎉 Summary

**What users need to do:**
1. Download template
2. Enter their consumption data (what, how much, where, when)
3. Upload

**What system does automatically:**
1. Determines scope (1, 2, or 3)
2. Selects emission factors
3. Calculates emissions
4. Generates reports

**Result:** Simple, user-friendly emissions data upload that requires no technical knowledge of carbon accounting!

---

**Template Version:** 1.0 (Simple)  
**Created:** 2024  
**Compatible with:** Houda Carbon Management System v1.0+
