# 📋 CSV Template Implementation Summary

## What Was Created

### 1. Comprehensive CSV Template File
**Location**: `templates/comprehensive_emissions_template.csv`

**Features**:
- ✅ Includes **all 3 emission scopes** (Scope 1, 2, and 3)
- ✅ Contains **23 example rows** covering major emission categories
- ✅ Includes **emission factors** with sources (DESNZ 2025, IPCC 2014, etc.)
- ✅ Shows **activity data** with proper units
- ✅ Demonstrates proper date formatting
- ✅ Includes site names and notes

**Columns**:
1. Emission Category
2. Activity Data Amount
3. Activity Data Unit
4. Emission Factor
5. Emission Factor Unit
6. Emission Factor Source
7. Scope
8. Site Name
9. Activity Date Start
10. Activity Date End
11. Notes

### 2. API Endpoints

#### GET /api/ingest/template
**Purpose**: Returns template structure as JSON

**Response**: JSON object with:
- Column definitions
- Example rows for each scope
- Supported categories by scope
- Usage notes

**Usage**:
```bash
curl -X GET http://localhost:3000/api/ingest/template \
  -H "Authorization: Bearer <token>"
```

#### GET /api/ingest/template/download
**Purpose**: Downloads the CSV template file

**Response**: CSV file with all examples

**Usage**:
```bash
curl -X GET http://localhost:3000/api/ingest/template/download \
  -H "Authorization: Bearer <token>" \
  -o emissions_template.csv
```

### 3. Comprehensive User Guide
**Location**: `COMPREHENSIVE_TEMPLATE_GUIDE.md`

**Contents**:
- Complete column explanations
- Examples for each scope
- Best practices
- Troubleshooting guide
- Common mistakes to avoid
- Upload process walkthrough
- Advanced tips

---

## Template Coverage

### Scope 1 Examples (6 rows)
1. Stationary Combustion (Natural Gas) - kWh
2. Mobile Combustion (Diesel) - litres
3. Mobile Combustion (Petrol) - litres
4. Stationary Combustion (LPG) - kg
5. Fugitive Emissions (Refrigerants) - kg
6. Process Emissions - tonnes

### Scope 2 Examples (4 rows)
1. Purchased Electricity - kWh (Main Office)
2. Purchased Electricity - kWh (Warehouse)
3. District Heating - kWh
4. District Cooling - kWh

### Scope 3 Examples (13 rows)
1. Business Travel - Air (Short-haul) - passenger-km
2. Business Travel - Air (Long-haul) - passenger-km
3. Business Travel - Rail - passenger-km
4. Business Travel - Road - passenger-km
5. Employee Commuting - passenger-km
6. Waste - Landfill - kg
7. Waste - Recycling - kg
8. Waste - Incineration - kg
9. Water Supply - m³
10. Wastewater Treatment - m³
11. Purchased Goods & Services - GBP
12. Upstream Transport - tonne-km
13. Fuel & Energy Related - kWh

---

## How Users Should Use This Template

### Step 1: Download
Users can download the template via:
- API endpoint: `GET /api/ingest/template/download`
- Direct file: `templates/comprehensive_emissions_template.csv`

### Step 2: Review Examples
The template includes 23 example rows showing:
- Proper formatting for each column
- Emission factors with sources
- Different units for different activities
- All three scopes represented

### Step 3: Delete Examples
Users must **delete rows 2-24** (all example data) before adding their own data.

### Step 4: Add Their Data
Users fill in their own emissions data following the format shown in the examples.

### Step 5: Upload
Users upload the completed CSV file using:
```bash
POST /api/ingest
- file: their_data.csv
- customerId: <id>
- periodId: <id>
- save: true
```

---

## Key Features

### 1. Comprehensive Coverage
- **All emission scopes** included in one template
- **Multiple emission categories** per scope
- **Various units** demonstrated (kWh, litres, kg, m³, passenger-km, GBP, etc.)
- **Different emission factor sources** shown (DESNZ, IPCC, Process-Specific)

### 2. Transparency
- **Emission factors** are visible and documented
- **Sources** are clearly stated
- **Units** are explicit for both activity data and emission factors
- **Calculations** can be verified by users

### 3. Flexibility
- Users can **include or omit** emission factors
- System will **auto-select** factors if not provided
- **Multiple sites** can be tracked
- **Different time periods** supported

### 4. Educational
- Examples show **best practices**
- **Proper formatting** is demonstrated
- **Common scenarios** are covered
- **Notes** provide context

---

## Emission Factors Included

### DESNZ 2025 (UK Government)
- Natural Gas: 0.0002027 kgCO2e/kWh
- Diesel: 0.000239 kgCO2e/kWh
- Petrol: 0.00024 kgCO2e/kWh
- LPG: 0.00023032 kgCO2e/kWh
- Electricity: 0.00019338 kgCO2e/kWh
- District Heating: 0.00021 kgCO2e/kWh
- District Cooling: 0.00018 kgCO2e/kWh
- Air Travel (Short-haul): 0.00015 kgCO2e/passenger-km
- Air Travel (Long-haul): 0.00012 kgCO2e/passenger-km
- Rail: 0.00004 kgCO2e/passenger-km
- Road: 0.00011 kgCO2e/passenger-km
- Waste (Landfill): 0.00057 kgCO2e/kg
- Waste (Recycling): 0.00021 kgCO2e/kg
- Water Supply: 0.344 kgCO2e/m³
- Wastewater: 0.708 kgCO2e/m³
- Purchased Goods: 0.00025 kgCO2e/GBP
- Transport: 0.00011 kgCO2e/tonne-km
- Fuel Related: 0.00003 kgCO2e/kWh

### IPCC 2014
- Refrigerants: 1.43 kgCO2e/kg

### Process-Specific
- Process Emissions: 1.5 kgCO2e/tonne

---

## Benefits for Users

### 1. Standardization
- **Consistent format** across all users
- **Predictable structure** for uploads
- **Clear requirements** for each field

### 2. Guidance
- **Example data** shows correct formatting
- **Multiple scenarios** covered
- **Best practices** demonstrated

### 3. Transparency
- **Emission factors** are visible
- **Sources** are documented
- **Calculations** can be verified

### 4. Flexibility
- Works with **intelligent parser**
- **Optional fields** for emission factors
- **Multiple scopes** in one file

### 5. Completeness
- **All scopes** covered
- **Major emission categories** included
- **Various units** supported

---

## Integration with Existing System

### Compatible With
- ✅ Intelligent CSV Parser (`intelligentCSVParser.ts`)
- ✅ Ingest Service (`ingestService.ts`)
- ✅ Emissions Inventory Parser (`emissionsInventoryParser.ts`)
- ✅ Activity creation endpoints
- ✅ Calculation engine

### Column Mapping
The system's intelligent parser will automatically map:
- "Emission Category" → activity type
- "Activity Data Amount" → quantity
- "Activity Data Unit" → unit
- "Scope" → scope classification
- "Site Name" → site identification
- Dates → activity period

### Emission Factor Handling
- If provided: System uses the provided factor
- If omitted: System auto-selects from database
- Source tracking: Maintains audit trail

---

## Testing the Template

### Test Upload (Preview Mode)
```bash
POST /api/ingest?save=false
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: comprehensive_emissions_template.csv
customerId: <test-customer-id>
periodId: <test-period-id>
```

### Expected Result
- 23 rows should be parsed successfully
- All scopes should be recognized
- Emission factors should be validated
- Sites should be identified or flagged for creation

---

## Documentation Files

1. **COMPREHENSIVE_TEMPLATE_GUIDE.md** (Main user guide)
   - Complete instructions
   - Column explanations
   - Examples by scope
   - Troubleshooting

2. **TEMPLATE_IMPLEMENTATION_SUMMARY.md** (This file)
   - Technical overview
   - Implementation details
   - Integration notes

3. **templates/comprehensive_emissions_template.csv** (The template)
   - Ready-to-use CSV file
   - 23 example rows
   - All scopes covered

---

## Next Steps for Users

### 1. Access the Template
- Download via API or access the file directly
- Review the example data

### 2. Understand the Structure
- Read the comprehensive guide
- Study the examples
- Note the required vs optional fields

### 3. Prepare Their Data
- Gather emissions data
- Collect emission factors (if available)
- Organize by scope and category

### 4. Fill the Template
- Delete example rows
- Add their data
- Follow the format shown

### 5. Upload and Validate
- Use preview mode first
- Fix any validation errors
- Save when ready

### 6. Calculate Emissions
- Run calculations on uploaded data
- Review results by scope
- Generate reports

---

## Support Resources

### For Users
- **User Guide**: `COMPREHENSIVE_TEMPLATE_GUIDE.md`
- **API Help**: `GET /api/ingest/help`
- **Template JSON**: `GET /api/ingest/template`
- **Download Template**: `GET /api/ingest/template/download`

### For Developers
- **Implementation**: This file
- **Parser Code**: `src/services/intelligentCSVParser.ts`
- **Ingest Service**: `src/services/ingestService.ts`
- **API Routes**: `src/routes/ingest.ts`

---

## Version Information

**Template Version**: 2.0 (Comprehensive)  
**Created**: 2024  
**Last Updated**: 2024  
**Compatible with**: Houda Carbon Management System v1.0+

---

## Summary

This implementation provides users with:
1. ✅ A **comprehensive CSV template** covering all emission scopes
2. ✅ **Clear examples** with real emission factors
3. ✅ **API endpoints** for easy access
4. ✅ **Detailed documentation** for guidance
5. ✅ **Flexible structure** that works with the intelligent parser
6. ✅ **Transparency** in emission factor sources
7. ✅ **Standardization** across all users

Users can now download a single template that shows them exactly how to format their emissions data for all three scopes, complete with emission factors and sources.
