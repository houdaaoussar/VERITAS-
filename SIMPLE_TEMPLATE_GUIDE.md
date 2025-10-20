# 📊 Emissions Data Upload Template - Simple Guide

## Overview

This is a **simple CSV template** for uploading your company's emissions activity data. You just need to provide your raw consumption data (like electricity usage, fuel consumption, etc.), and the system will automatically:

- ✅ Determine which scope (1, 2, or 3) each emission belongs to
- ✅ Select appropriate emission factors from the database
- ✅ Calculate your carbon emissions
- ✅ Generate reports by scope

---

## 🎯 Quick Start

### Step 1: Download the Template

**Via API:**
```bash
GET /api/ingest/template/download
Authorization: Bearer <your-token>
```

**Or use the file:**
`templates/simple_emissions_template.csv`

### Step 2: Fill in Your Data

1. Open the template in Excel or Google Sheets
2. **Delete the example rows** (rows 2-19)
3. Add your company's emissions data
4. Save as CSV format

### Step 3: Upload

```bash
POST /api/ingest
Authorization: Bearer <token>
Content-Type: multipart/form-data

Parameters:
- file: your_data.csv
- customerId: your-customer-id
- periodId: your-period-id
- save: true
```

---

## 📋 Template Structure

### Required Columns

| Column | What to Enter | Example |
|--------|---------------|---------|
| **Emission Source** | Type of emission | Natural Gas, Electricity, Diesel |
| **Site/Location** | Where it happened | Main Office, Fleet, Warehouse |
| **Activity Data** | How much consumed | 1500, 25000, 800 |
| **Unit** | Unit of measurement | kWh, litres, kg, m³ |
| **Start Date** | Period start | 2024-01-01 |
| **End Date** | Period end | 2024-01-31 |
| **Notes** | Optional notes | Office heating, Fleet fuel |

---

## 🔍 What You Need to Provide

### 1. Emission Source

**Just enter the common name** - the system will figure out the rest!

#### Scope 1 Sources (Direct Emissions)
- `Natural Gas` - For heating
- `Diesel` - For vehicles/generators
- `Petrol` - For company cars
- `LPG` - For cooking/heating
- `Refrigerants` - For AC systems
- `Coal` - For combustion
- `Fuel Oil` - For heating

#### Scope 2 Sources (Purchased Energy)
- `Electricity` - From the grid
- `District Heating` - Purchased heat
- `District Cooling` - Purchased cooling
- `Steam` - Purchased steam

#### Scope 3 Sources (Indirect Emissions)
- `Air Travel - Domestic` - Domestic flights
- `Air Travel - International` - International flights
- `Rail Travel` - Train journeys
- `Taxi/Car Hire` - Rental cars, taxis
- `Employee Commuting` - Staff travel to work
- `Waste to Landfill` - Waste disposal
- `Recycling` - Recycled materials
- `Water` - Water consumption
- `Wastewater` - Sewage treatment

### 2. Site/Location

**Where the activity happened:**
- Office names: `Main Office`, `London Office`, `Branch 1`
- Facilities: `Warehouse`, `Factory`, `Data Center`
- Mobile: `Fleet`, `Company Vehicles`
- Activities: `Business Travel`, `Employee Commuting`

**Tips:**
- Use consistent names across your uploads
- Keep it simple and descriptive
- Group similar activities together

### 3. Activity Data

**The quantity consumed** - just the number!

**Examples:**
- `1500` for 1500 kWh of natural gas
- `25000` for 25000 kWh of electricity
- `800` for 800 litres of diesel
- `5` for 5 kg of refrigerant

**Important:**
- Must be a positive number
- No commas (use `25000` not `25,000`)
- Use decimal point for fractions (`1500.5`)

### 4. Unit

**The measurement unit:**

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
- `tonne` or `tonnes`

#### Distance
- `km` - Kilometers
- `miles` - Miles
- `passenger-km` - For travel

### 5. Start Date & End Date

**Format:** `YYYY-MM-DD`

**Examples:**
- `2024-01-01` to `2024-01-31` (January)
- `2024-01-01` to `2024-03-31` (Q1)
- `2024-01-01` to `2024-12-31` (Full year)

### 6. Notes (Optional)

**Any additional information:**
- `Office heating`
- `Company vehicles`
- `Q1 business travel`
- `Includes backup generator usage`

---

## 📝 Complete Examples

### Example 1: Office Natural Gas
```csv
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
```
**What happens:** System recognizes this as Scope 1, selects natural gas emission factor, calculates emissions.

### Example 2: Office Electricity
```csv
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
```
**What happens:** System recognizes this as Scope 2, selects electricity emission factor for your region, calculates emissions.

### Example 3: Company Fleet
```csv
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```
**What happens:** System recognizes this as Scope 1 mobile combustion, selects diesel emission factor, calculates emissions.

### Example 4: Business Travel
```csv
Air Travel - International,Business Travel,5000,passenger-km,2024-01-01,2024-01-31,International flights
```
**What happens:** System recognizes this as Scope 3, selects air travel emission factor, calculates emissions.

### Example 5: Multiple Sites
```csv
Electricity,London Office,15000,kWh,2024-01-01,2024-01-31,London consumption
Electricity,Manchester Office,12000,kWh,2024-01-01,2024-01-31,Manchester consumption
Electricity,Birmingham Office,10000,kWh,2024-01-01,2024-01-31,Birmingham consumption
```

---

## ✅ What You DON'T Need to Provide

### ❌ You DON'T need to:
- Specify the scope (Scope 1, 2, or 3) - **System determines this automatically**
- Provide emission factors - **System selects appropriate factors**
- Know technical emission factor sources - **System uses latest DESNZ/IPCC data**
- Calculate emissions yourself - **System does all calculations**
- Worry about complex categories - **Just use simple names**

### ✅ You ONLY need to:
- Know what you consumed (Natural Gas, Electricity, etc.)
- Know how much you consumed (1500 kWh, 800 litres, etc.)
- Know where it was consumed (Main Office, Fleet, etc.)
- Know when it was consumed (dates)

---

## 🚀 How It Works

### Step 1: You Upload Your Data
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

### Step 2: System Processes It

**For Natural Gas:**
- ✅ Recognizes as "Stationary Combustion"
- ✅ Classifies as Scope 1 (direct emission)
- ✅ Selects emission factor: 0.0002027 kgCO2e/kWh (DESNZ 2025)
- ✅ Calculates: 1500 × 0.0002027 = 0.304 kgCO2e

**For Electricity:**
- ✅ Recognizes as "Purchased Electricity"
- ✅ Classifies as Scope 2 (purchased energy)
- ✅ Selects emission factor: 0.00019338 kgCO2e/kWh (DESNZ 2025)
- ✅ Calculates: 25000 × 0.00019338 = 4.835 kgCO2e

**For Diesel:**
- ✅ Recognizes as "Mobile Combustion"
- ✅ Classifies as Scope 1 (direct emission)
- ✅ Selects emission factor: 0.000239 kgCO2e/kWh (DESNZ 2025)
- ✅ Calculates emissions

### Step 3: You Get Results

**By Scope:**
- Scope 1 Total: X kgCO2e
- Scope 2 Total: Y kgCO2e
- Scope 3 Total: Z kgCO2e
- **Total Emissions: X + Y + Z kgCO2e**

**By Category:**
- Natural Gas: 0.304 kgCO2e
- Electricity: 4.835 kgCO2e
- Diesel: ... kgCO2e

---

## ✅ Best Practices

### Do's ✓
- ✓ Use simple, common names for emission sources
- ✓ Keep site names consistent across uploads
- ✓ Use the exact date format: YYYY-MM-DD
- ✓ Delete all example rows before adding your data
- ✓ Double-check your quantities and units
- ✓ Add notes for clarity
- ✓ Test with preview mode first (`save=false`)

### Don'ts ✗
- ✗ Don't include scope numbers - system does this
- ✗ Don't try to calculate emissions yourself
- ✗ Don't use commas in numbers (25,000)
- ✗ Don't mix date formats
- ✗ Don't leave required fields empty
- ✗ Don't include the example data in your upload

---

## 🔧 Common Questions

### Q: Do I need to know which scope my emissions belong to?
**A:** No! Just enter the emission source (like "Natural Gas" or "Electricity") and the system automatically determines the scope.

### Q: Do I need to provide emission factors?
**A:** No! The system automatically selects the most appropriate and up-to-date emission factors from its database.

### Q: What if I have data for multiple sites?
**A:** Perfect! Just add multiple rows with different site names. The system will track emissions by site.

### Q: Can I upload data for different time periods?
**A:** Yes! Use different date ranges for different rows. You can have monthly, quarterly, or annual data.

### Q: What emission factor sources does the system use?
**A:** The system uses the latest emission factors from:
- DESNZ 2025 (UK Government)
- DEFRA (Department for Environment, Food & Rural Affairs)
- IPCC (Intergovernmental Panel on Climate Change)

### Q: Can I see which emission factors were used?
**A:** Yes! After calculations, you can view the emission factors that were applied to each activity.

---

## 🎓 Example Upload Workflow

### Your Company's Data (Excel/CSV):

| Emission Source | Site/Location | Activity Data | Unit | Start Date | End Date | Notes |
|----------------|---------------|---------------|------|------------|----------|-------|
| Natural Gas | Main Office | 1500 | kWh | 2024-01-01 | 2024-01-31 | Heating |
| Electricity | Main Office | 25000 | kWh | 2024-01-01 | 2024-01-31 | Power |
| Diesel | Fleet | 800 | litres | 2024-01-01 | 2024-01-31 | Vehicles |
| Air Travel - International | Business Travel | 5000 | passenger-km | 2024-01-01 | 2024-01-31 | Flights |

### What You Get Back:

**Scope 1 (Direct Emissions):**
- Natural Gas: 0.304 kgCO2e
- Diesel: 2.392 kgCO2e
- **Scope 1 Total: 2.696 kgCO2e**

**Scope 2 (Purchased Energy):**
- Electricity: 4.835 kgCO2e
- **Scope 2 Total: 4.835 kgCO2e**

**Scope 3 (Indirect Emissions):**
- Air Travel: 0.600 kgCO2e
- **Scope 3 Total: 0.600 kgCO2e**

**Total Carbon Footprint: 8.131 kgCO2e**

---

## 📤 Upload Process

### Preview Mode (Recommended First)
```bash
POST /api/ingest?save=false
- file: your_data.csv
- customerId: <id>
- periodId: <id>
```

**Check the response:**
- How many rows were imported successfully?
- Any validation errors?
- Are the mappings correct?

### Save Mode (After Preview Looks Good)
```bash
POST /api/ingest?save=true
- file: your_data.csv
- customerId: <id>
- periodId: <id>
```

**Data is saved and ready for calculations!**

---

## 🆘 Troubleshooting

### Issue: "Emission source not recognized"
**Solution:** Check the supported emission sources list above. Use simple, common names like "Natural Gas" not "NG" or "Gas".

### Issue: "Invalid date format"
**Solution:** Use YYYY-MM-DD format exactly (e.g., 2024-01-31).

### Issue: "Activity data must be positive"
**Solution:** Ensure all quantities are positive numbers without text or special characters.

### Issue: "Unit not supported"
**Solution:** Check the supported units list. Use standard units like kWh, litres, kg, m³.

### Issue: "Site not found"
**Solution:** Either use an existing site name or enable auto-creation when uploading.

---

## 📞 Support

### API Endpoints
- `GET /api/ingest/template` - Get template structure (JSON)
- `GET /api/ingest/template/download` - Download CSV template
- `GET /api/ingest/help` - API documentation

### Need Help?
1. Check this guide
2. Review the example rows in the template
3. Use preview mode to test your data
4. Check error messages for specific issues

---

## 🎯 Summary

**This template makes it easy:**

1. ✅ **Simple Format** - Just 7 columns, only 6 required
2. ✅ **No Technical Knowledge** - Use common names
3. ✅ **Automatic Scope Classification** - System determines Scope 1, 2, or 3
4. ✅ **Automatic Emission Factors** - System selects appropriate factors
5. ✅ **Automatic Calculations** - System calculates all emissions
6. ✅ **Comprehensive Coverage** - Supports all emission types
7. ✅ **Flexible** - Works with your existing data format

**You focus on:** What you consumed, how much, and where  
**System handles:** Scopes, emission factors, and calculations

---

**Template Version:** 1.0 (Simple)  
**Last Updated:** 2024  
**Compatible with:** Houda Carbon Management System v1.0+
