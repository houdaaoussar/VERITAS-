# Emissions Data Upload Template Guide

## Overview

The **Emissions Data Upload Template** is a comprehensive Excel file designed to help you organize and upload your organization's emissions data for carbon footprint calculations. This template supports all three scopes of greenhouse gas emissions as defined by the GHG Protocol.

## Template Location

📁 `templates/Emissions_Data_Upload_Template.xlsx`

## What's Included

The template contains **5 worksheets**:

1. **Instructions** - Detailed guidance on how to use the template
2. **Scope 1 - Direct Emissions** - For direct emissions from owned/controlled sources
3. **Scope 2 - Indirect Emissions** - For emissions from purchased energy
4. **Scope 3 - Value Chain** - For all other indirect emissions
5. **Activity Types Reference** - Complete list of supported emission sources

## How to Use

### Step 1: Download the Template

Download the template file from the system or generate it using:

```bash
npm run generate-template
```

### Step 2: Fill in Your Data

1. Open the Excel file
2. Navigate to the relevant scope sheet(s)
3. **Delete the example rows** (they are provided as guidance only)
4. Enter your emissions data following the column structure

### Step 3: Upload to the System

1. Save your completed Excel file
2. Log into the carbon management system
3. Navigate to **Emissions Inventory** > **Upload**
4. Select your file and upload
5. The system will automatically parse and validate your data

## Column Definitions

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| **Activity Type** | The type of emission source | Natural Gas, Electricity, Diesel |
| **Quantity** | The amount consumed (numeric) | 15000, 500, 2.5 |
| **Unit** | The unit of measurement | kWh, litres, kg, tonne |

### Optional Columns

| Column | Description | Example |
|--------|-------------|---------|
| **Location** | Where the activity occurred | Main Office, Warehouse, Fleet |
| **Start Date** | Beginning of reporting period | 2024-01-01 |
| **End Date** | End of reporting period | 2024-01-31 |
| **Notes** | Additional context or details | January heating costs |

## Scope Definitions

### Scope 1: Direct Emissions

Emissions from sources that are **owned or controlled** by your organization.

**Examples:**
- 🔥 Natural gas for heating
- 🚗 Company vehicle fuel (diesel, petrol)
- 🏭 On-site fuel combustion
- ❄️ Refrigerant leakage
- ⚙️ Process emissions from manufacturing

**Common Activity Types:**
- Natural Gas
- Diesel
- Petrol/Gasoline
- LPG
- Kerosene
- Coal
- Fuel Oil
- Refrigerants
- Process Emissions

### Scope 2: Indirect Emissions from Energy

Emissions from the generation of **purchased energy** consumed by your organization.

**Examples:**
- ⚡ Electricity from the grid
- 🌡️ District heating
- ❄️ District cooling
- 💨 Purchased steam

**Common Activity Types:**
- Electricity
- Heat/Steam
- Cooling

### Scope 3: Value Chain Emissions

All **other indirect emissions** that occur in your value chain, both upstream and downstream.

**Examples:**
- ✈️ Business travel (air, rail, road)
- 🗑️ Waste disposal
- 💧 Water consumption
- 📦 Purchased goods and services
- 🚚 Transportation and distribution
- 👥 Employee commuting

**Common Activity Types:**
- Business Travel - Air
- Business Travel - Rail
- Business Travel - Road
- Waste - Landfill
- Waste - Recycling
- Waste - Incineration
- Water Supply
- Wastewater Treatment
- Purchased Goods & Services
- Capital Goods
- Upstream Transport
- Fuel & Energy Related
- Employee Commuting

## Supported Units

### Energy Units
- `kWh` - Kilowatt hours
- `MWh` - Megawatt hours
- `GJ` - Gigajoules

### Volume Units
- `litres` - Litres
- `m3` - Cubic meters
- `gallons` - Gallons

### Mass Units
- `kg` - Kilograms
- `tonne` - Metric tonnes

### Distance Units
- `km` - Kilometers
- `miles` - Miles
- `passenger-km` - Passenger kilometers
- `tonne-km` - Tonne kilometers

### Currency Units (for spend-based calculations)
- `GBP` - British Pounds
- `USD` - US Dollars
- `EUR` - Euros

## Tips for Success

### ✅ Do's

- **Use the examples** as a guide for formatting
- **Be consistent** with units across similar activities
- **Include dates** in YYYY-MM-DD format
- **Add notes** to provide context (especially for unusual entries)
- **Use dropdown menus** where provided for units
- **Keep quantities positive** - the system expects positive numbers
- **Group similar activities** by location or time period
- **Use any combination of sheets** - you can fill one, two, or all three scope sheets

### ❌ Don'ts

- **Don't leave example rows** in your upload file
- **Don't use negative numbers** for quantities
- **Don't mix different date formats** - stick to YYYY-MM-DD
- **Don't leave required fields empty** (Activity Type, Quantity, Unit)
- **Don't use unsupported units** - refer to the reference sheet
- **Don't include formulas** - use plain values only

## Data Validation

The template includes built-in data validation for units:

- **Scope 1**: kWh, litres, kg, m3, GJ
- **Scope 2**: kWh, MWh, GJ
- **Scope 3**: passenger-km, tonne, kg, GBP, USD, EUR, kWh

If you need to use a different unit, you can override the validation, but ensure it's a standard unit that the system can convert.

## Example Data

### Scope 1 Example

```
Activity Type: Natural Gas
Location: Main Office
Quantity: 15000
Unit: kWh
Start Date: 2024-01-01
End Date: 2024-01-31
Notes: Heating for January
```

### Scope 2 Example

```
Activity Type: Electricity
Location: Warehouse
Quantity: 12000
Unit: kWh
Start Date: 2024-01-01
End Date: 2024-01-31
Notes: Warehouse lighting and equipment
```

### Scope 3 Example

```
Activity Type: Business Travel - Air
Location: International
Quantity: 5000
Unit: passenger-km
Start Date: 2024-01-01
End Date: 2024-01-31
Notes: Employee flights for business meetings
```

## Calculation Methods

The system uses different calculation methods based on the scope and data type:

### Activity-Based Calculation
Used for most Scope 1, 2, and some Scope 3 emissions where you have actual consumption data (e.g., kWh of electricity, litres of fuel).

**Formula:** `Emissions = Activity Data × Emission Factor`

### Spend-Based Calculation
Used for Scope 3 emissions where only financial data is available (e.g., spend on goods and services).

**Formula:** `Emissions = Spend Amount × Emission Factor (per currency unit)`

## Emission Factors

The system automatically selects appropriate emission factors based on:

- **Activity Type** - What you're measuring
- **Geography** - Your location (defaults to UK, can be configured)
- **Year** - The reporting period
- **Unit** - The measurement unit

Emission factors are sourced from:
- DESNZ (UK Government)
- IPCC (Intergovernmental Panel on Climate Change)
- DEFRA (Department for Environment, Food & Rural Affairs)

## Troubleshooting

### Common Issues

**Issue:** "No emission factor found"
- **Solution:** Check that your activity type matches the supported types in the reference sheet
- **Solution:** Verify your unit is correct and supported

**Issue:** "Invalid date format"
- **Solution:** Use YYYY-MM-DD format (e.g., 2024-01-31)

**Issue:** "Quantity must be positive"
- **Solution:** Ensure all quantity values are greater than 0

**Issue:** "File upload failed"
- **Solution:** Remove example rows before uploading
- **Solution:** Check file size is under 10MB
- **Solution:** Ensure file format is .xlsx or .csv

### Getting Help

If you encounter issues:

1. Check the **Instructions** sheet in the template
2. Review the **Activity Types Reference** sheet
3. Ensure all required fields are filled
4. Verify your data matches the examples provided
5. Contact your system administrator

## Advanced Features

### Multiple Locations

You can track emissions across multiple locations by using the Location column:

```
Activity Type: Electricity
Location: Office A
Quantity: 10000
Unit: kWh

Activity Type: Electricity
Location: Office B
Quantity: 15000
Unit: kWh
```

### Time Periods

Track emissions over different time periods:

```
Activity Type: Natural Gas
Start Date: 2024-01-01
End Date: 2024-01-31
Quantity: 15000

Activity Type: Natural Gas
Start Date: 2024-02-01
End Date: 2024-02-29
Quantity: 12000
```

### Refrigerant Tracking

For refrigerants, specify the type in the notes:

```
Activity Type: Refrigerants
Quantity: 5
Unit: kg
Notes: R134A refrigerant top-up during AC maintenance
```

### Spend-Based Emissions

For Scope 3 spend-based calculations:

```
Activity Type: Purchased Goods & Services
Quantity: 50000
Unit: GBP
Notes: Office supplies and equipment purchases
```

## Regenerating the Template

If you need to regenerate the template (e.g., after updates):

```bash
cd HoudaProject
npm run generate-template
```

Or using ts-node directly:

```bash
npx ts-node scripts/generateEmissionsTemplate.ts
```

## Version History

- **v1.0** - Initial template with Scope 1, 2, and 3 support
- Includes comprehensive activity types reference
- Built-in data validation for units
- Example data for each scope

## Support

For questions or issues with the template:

- 📧 Email: support@houdacarbon.com
- 📚 Documentation: [System Documentation]
- 💬 Support Portal: [Support Portal URL]

---

**Last Updated:** 2024
**Template Version:** 1.0
**Compatible with:** Houda Carbon Management System v1.0+
