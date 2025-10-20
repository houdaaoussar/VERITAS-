# 📊 Comprehensive Emissions Template - User Guide

## Overview

This comprehensive CSV template includes **all emission scopes** (Scope 1, 2, and 3) with detailed columns for emission categories, activity data, emission factors, and sources. This template is designed to provide complete transparency and control over your emissions calculations.

---

## 🎯 Quick Start

### Download the Template

**Option 1: Via API**
```bash
GET /api/ingest/template/download
Authorization: Bearer <your-token>
```

**Option 2: Direct File**
Located at: `templates/comprehensive_emissions_template.csv`

### How to Use

1. **Download** the template
2. **Review** the example data (rows 2-24)
3. **Delete** all example rows
4. **Add** your own emissions data
5. **Save** as CSV format
6. **Upload** to the system

---

## 📋 Template Structure

### All Columns Explained

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| **Emission Category** | ✅ Yes | Full name of the emission source | Stationary Combustion (Natural Gas) |
| **Activity Data Amount** | ✅ Yes | Quantity consumed | 1500 |
| **Activity Data Unit** | ✅ Yes | Unit of measurement | kWh, litres, kg |
| **Emission Factor** | ⚠️ Optional* | CO2e conversion factor | 0.0002027 |
| **Emission Factor Unit** | ⚠️ Optional* | Unit for emission factor | kgCO2e/kWh |
| **Emission Factor Source** | ⚠️ Optional* | Source of emission factor | DESNZ 2025, IPCC 2014 |
| **Scope** | ✅ Yes | GHG Protocol scope | Scope 1, Scope 2, Scope 3 |
| **Site Name** | ✅ Yes | Location/facility name | Main Office, Fleet |
| **Activity Date Start** | ✅ Yes | Start date (YYYY-MM-DD) | 2024-01-01 |
| **Activity Date End** | ✅ Yes | End date (YYYY-MM-DD) | 2024-01-31 |
| **Notes** | ❌ No | Additional information | Office heating |

*The system can auto-select emission factors if not provided, but including them ensures accuracy and transparency.

---

## 🔍 Detailed Column Guide

### 1. Emission Category

**Purpose**: Identifies the specific type of emission source

**Format**: Use the full descriptive name with category in parentheses

**Scope 1 Examples**:
- `Stationary Combustion (Natural Gas)`
- `Mobile Combustion (Diesel)`
- `Mobile Combustion (Petrol)`
- `Stationary Combustion (LPG)`
- `Fugitive Emissions (Refrigerants)`
- `Process Emissions`

**Scope 2 Examples**:
- `Purchased Electricity`
- `District Heating`
- `District Cooling`

**Scope 3 Examples**:
- `Business Travel - Air (Short-haul)`
- `Business Travel - Air (Long-haul)`
- `Business Travel - Rail`
- `Business Travel - Road`
- `Employee Commuting`
- `Waste - Landfill`
- `Waste - Recycling`
- `Waste - Incineration`
- `Water Supply`
- `Wastewater Treatment`
- `Purchased Goods & Services`
- `Upstream Transport`
- `Fuel & Energy Related`

### 2. Activity Data Amount

**Purpose**: The quantity of the activity

**Format**: Numeric value (positive numbers only)

**Examples**:
- `1500` (for 1500 kWh of natural gas)
- `800` (for 800 litres of diesel)
- `25000` (for 25000 kWh of electricity)
- `5` (for 5 kg of refrigerant)

**Important**:
- Must be a positive number
- No commas (use `25000` not `25,000`)
- Use decimal point for fractions (`1500.5` not `1500,5`)

### 3. Activity Data Unit

**Purpose**: The unit of measurement for the activity data

**Supported Units**:

#### Energy
- `kWh` - Kilowatt hours
- `MWh` - Megawatt hours
- `GJ` - Gigajoules

#### Volume
- `litres` or `liters`
- `m³` - Cubic meters
- `gallons`

#### Mass
- `kg` - Kilograms
- `tonne` or `tonnes` - Metric tonnes

#### Distance
- `km` - Kilometers
- `miles` - Miles
- `passenger-km` - Passenger kilometers
- `tonne-km` - Tonne kilometers

#### Currency (for spend-based)
- `GBP` - British Pounds
- `USD` - US Dollars
- `EUR` - Euros

### 4. Emission Factor

**Purpose**: The conversion factor to calculate CO2e emissions

**Format**: Decimal number representing kgCO2e per unit of activity

**Examples**:
- `0.0002027` (for natural gas in kgCO2e/kWh)
- `0.000239` (for diesel in kgCO2e/kWh)
- `1.43` (for refrigerants in kgCO2e/kg)
- `0.00019338` (for electricity in kgCO2e/kWh)

**Note**: If you don't provide this, the system will use its database of emission factors based on the emission category and year.

### 5. Emission Factor Unit

**Purpose**: Specifies what the emission factor measures

**Format**: Always in the form `kgCO2e/[activity unit]`

**Examples**:
- `kgCO2e/kWh` - For energy-based activities
- `kgCO2e/kg` - For mass-based activities
- `kgCO2e/litre` - For volume-based activities
- `kgCO2e/passenger-km` - For distance-based activities
- `kgCO2e/GBP` - For spend-based activities

### 6. Emission Factor Source

**Purpose**: Documents where the emission factor comes from

**Common Sources**:
- `DESNZ 2025` - UK Department for Energy Security and Net Zero (latest)
- `DEFRA 2024` - Department for Environment, Food & Rural Affairs
- `IPCC 2014` - Intergovernmental Panel on Climate Change
- `Process-Specific` - Custom process-specific factors
- `GHG Protocol` - GHG Protocol standards

### 7. Scope

**Purpose**: Categorizes emissions by GHG Protocol scope

**Values**:
- `Scope 1` - Direct emissions from owned/controlled sources
- `Scope 2` - Indirect emissions from purchased energy
- `Scope 3` - All other indirect emissions in the value chain

**Format**: Use exact format shown (capital S, space, number)

### 8. Site Name

**Purpose**: Identifies where the activity occurred

**Examples**:
- `Main Office`
- `Warehouse`
- `Fleet`
- `Manufacturing Plant`
- `Business Travel`
- `Employee Commuting`

**Tips**:
- Use consistent naming across uploads
- Create logical groupings (e.g., all vehicles under "Fleet")
- Use descriptive names for reporting clarity

### 9. Activity Date Start & End

**Purpose**: Defines the time period for the activity

**Format**: `YYYY-MM-DD` (ISO 8601)

**Examples**:
- `2024-01-01` to `2024-01-31` (January 2024)
- `2024-01-01` to `2024-03-31` (Q1 2024)
- `2024-01-01` to `2024-12-31` (Full year 2024)

**Rules**:
- Start date must be before or equal to end date
- Both dates are required
- Use exact format shown

### 10. Notes

**Purpose**: Additional context or information

**Examples**:
- `Office heating`
- `Company vehicles`
- `AC refrigerant top-up`
- `Q1 business travel`

**Optional**: This field can be left empty

---

## 📊 Complete Examples by Scope

### Scope 1: Direct Emissions

#### Example 1: Natural Gas Heating
```csv
Stationary Combustion (Natural Gas),1500,kWh,0.0002027,kgCO2e/kWh,DESNZ 2025,Scope 1,Main Office,2024-01-01,2024-01-31,Office heating
```

#### Example 2: Company Fleet Diesel
```csv
Mobile Combustion (Diesel),800,litres,0.000239,kgCO2e/kWh,DESNZ 2025,Scope 1,Fleet,2024-01-01,2024-01-31,Company vehicles
```

#### Example 3: Refrigerant Leakage
```csv
Fugitive Emissions (Refrigerants),5,kg,1.43,kgCO2e/kg,IPCC 2014,Scope 1,Main Office,2024-01-01,2024-01-31,AC refrigerant top-up
```

#### Example 4: Process Emissions
```csv
Process Emissions,2,tonnes,1.5,kgCO2e/tonne,Process-Specific,Scope 1,Manufacturing Plant,2024-01-01,2024-01-31,Production process
```

### Scope 2: Indirect Energy Emissions

#### Example 1: Purchased Electricity
```csv
Purchased Electricity,25000,kWh,0.00019338,kgCO2e/kWh,DESNZ 2025,Scope 2,Main Office,2024-01-01,2024-01-31,Office electricity
```

#### Example 2: District Heating
```csv
District Heating,5000,kWh,0.00021,kgCO2e/kWh,DESNZ 2025,Scope 2,Main Office,2024-01-01,2024-01-31,Building heating
```

#### Example 3: District Cooling
```csv
District Cooling,3000,kWh,0.00018,kgCO2e/kWh,DESNZ 2025,Scope 2,Main Office,2024-01-01,2024-01-31,Building cooling
```

### Scope 3: Other Indirect Emissions

#### Example 1: Business Air Travel
```csv
Business Travel - Air (Short-haul),2000,passenger-km,0.00015,kgCO2e/passenger-km,DESNZ 2025,Scope 3,Business Travel,2024-01-01,2024-01-31,Domestic flights
```

#### Example 2: Employee Commuting
```csv
Employee Commuting,3000,passenger-km,0.00011,kgCO2e/passenger-km,DESNZ 2025,Scope 3,Employee Commuting,2024-01-01,2024-01-31,Staff commute by car
```

#### Example 3: Waste Disposal
```csv
Waste - Landfill,1200,kg,0.00057,kgCO2e/kg,DESNZ 2025,Scope 3,Main Office,2024-01-01,2024-01-31,General waste
```

#### Example 4: Water Consumption
```csv
Water Supply,500,m³,0.344,kgCO2e/m³,DESNZ 2025,Scope 3,Main Office,2024-01-01,2024-01-31,Water consumption
```

#### Example 5: Purchased Goods (Spend-based)
```csv
Purchased Goods & Services,50000,GBP,0.00025,kgCO2e/GBP,DESNZ 2025,Scope 3,Procurement,2024-01-01,2024-01-31,Office supplies
```

---

## ✅ Best Practices

### Data Quality
- ✓ Use actual measured data where possible
- ✓ Include emission factors from recognized sources
- ✓ Document the source of your emission factors
- ✓ Use consistent units within each category
- ✓ Keep date ranges logical and non-overlapping

### Organization
- ✓ Group similar activities together
- ✓ Use consistent site names
- ✓ Add descriptive notes for unusual entries
- ✓ Separate data by reporting period
- ✓ Keep a backup of your original files

### Accuracy
- ✓ Double-check emission factors against official sources
- ✓ Verify units match the activity type
- ✓ Ensure dates are in correct format
- ✓ Review calculations before upload
- ✓ Use preview mode to validate data

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This:
- Leave example rows in your upload
- Use commas in numbers (25,000)
- Mix date formats
- Use negative quantities
- Leave required fields empty
- Use unsupported units
- Include formulas or calculations
- Mix different scopes in the same row

### ✅ Do This Instead:
- Delete all example rows before adding your data
- Use plain numbers (25000)
- Always use YYYY-MM-DD format
- Use positive numbers only
- Fill all required columns
- Check supported units list
- Use plain values only
- Keep one scope per row

---

## 🔧 Troubleshooting

### Issue: "Invalid emission category"
**Solution**: Check the emission category matches one of the supported categories listed in this guide. Use the exact format shown.

### Issue: "Activity data amount must be positive"
**Solution**: Ensure all quantities are positive numbers without text or special characters.

### Issue: "Invalid date format"
**Solution**: Use YYYY-MM-DD format exactly (e.g., 2024-01-31, not 31/01/2024).

### Issue: "Emission factor unit doesn't match activity unit"
**Solution**: Ensure your emission factor unit corresponds to your activity data unit (e.g., if activity is in kWh, emission factor should be kgCO2e/kWh).

### Issue: "Site not found"
**Solution**: Either use an existing site name or enable auto-creation when uploading.

---

## 📤 Upload Process

### Step 1: Prepare Your Data
1. Fill in the template with your emissions data
2. Delete all example rows (rows 2-24)
3. Verify all required fields are complete
4. Check emission factors are correct
5. Save as CSV format

### Step 2: Preview Upload
```bash
POST /api/ingest
Authorization: Bearer <token>
Content-Type: multipart/form-data

Parameters:
- file: your_emissions_data.csv
- customerId: <your-customer-id>
- periodId: <your-period-id>
- save: false  # Preview mode
```

### Step 3: Review Results
- Check `rows_imported` and `rows_failed` counts
- Review any validation errors in `issues` array
- Verify `header_mappings` are correct

### Step 4: Fix Issues (if any)
- Update your CSV based on error messages
- Re-upload in preview mode
- Repeat until validation passes

### Step 5: Save Data
```bash
POST /api/ingest
Parameters:
- save: true  # Save mode
```

---

## 🎓 Advanced Tips

### Using Custom Emission Factors
If you have organization-specific or region-specific emission factors:
1. Include them in the "Emission Factor" column
2. Document the source in "Emission Factor Source"
3. Ensure the unit matches your activity data unit

### Tracking Multiple Locations
Use consistent site naming:
```csv
London Office,Purchased Electricity,15000,kWh,...
Manchester Office,Purchased Electricity,12000,kWh,...
Birmingham Office,Purchased Electricity,10000,kWh,...
```

### Quarterly Reporting
Use date ranges for quarters:
```csv
...,2024-01-01,2024-03-31,... # Q1
...,2024-04-01,2024-06-30,... # Q2
...,2024-07-01,2024-09-30,... # Q3
...,2024-10-01,2024-12-31,... # Q4
```

### Handling Missing Emission Factors
If you don't have emission factors:
1. Leave the emission factor columns empty
2. The system will auto-select appropriate factors
3. Review the selected factors in the calculation results

---

## 📊 What Happens After Upload?

### Data Processing
1. **Validation**: System checks all required fields and data formats
2. **Mapping**: Columns are mapped to database fields
3. **Factor Matching**: Emission factors are validated or auto-selected
4. **Activity Creation**: Valid rows are converted to activity records
5. **Site Linking**: Activities are linked to sites (created if needed)

### Next Steps
1. **Review Activities**: Verify activities were created correctly
2. **Run Calculations**: Execute emission calculations
3. **View Results**: Check calculated emissions by scope
4. **Generate Reports**: Create reports for stakeholders

---

## 📞 Support & Resources

### API Endpoints
- `GET /api/ingest/template` - Get template structure (JSON)
- `GET /api/ingest/template/download` - Download CSV template
- `GET /api/ingest/categories` - List available categories
- `GET /api/ingest/help` - API documentation

### Documentation
- GHG Protocol: https://ghgprotocol.org/
- DESNZ Emission Factors: https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting
- IPCC Guidelines: https://www.ipcc.ch/

### Getting Help
1. Check this guide first
2. Review error messages carefully
3. Use preview mode to test data
4. Contact your system administrator
5. Refer to API documentation

---

## 📋 Quick Reference Card

### Template Columns (in order)
1. Emission Category (required)
2. Activity Data Amount (required)
3. Activity Data Unit (required)
4. Emission Factor (optional)
5. Emission Factor Unit (optional)
6. Emission Factor Source (optional)
7. Scope (required)
8. Site Name (required)
9. Activity Date Start (required)
10. Activity Date End (required)
11. Notes (optional)

### Scopes
- **Scope 1**: Direct emissions (fuel, refrigerants, processes)
- **Scope 2**: Purchased energy (electricity, heating, cooling)
- **Scope 3**: Value chain (travel, waste, water, procurement)

### Date Format
`YYYY-MM-DD` (e.g., 2024-01-31)

### Common Emission Factor Sources
- DESNZ 2025 (UK Government - latest)
- DEFRA 2024
- IPCC 2014
- Process-Specific

---

**Last Updated**: 2024  
**Template Version**: 2.0 (Comprehensive)  
**Compatible with**: Houda Carbon Management System v1.0+
