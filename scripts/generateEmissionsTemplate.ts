import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Generate comprehensive emissions data upload template
 * This template helps users structure their emissions data for Scope 1, 2, and 3 calculations
 */
async function generateEmissionsTemplate() {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'Houda Carbon Management System';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // ============================================
  // INSTRUCTIONS SHEET
  // ============================================
  const instructionsSheet = workbook.addWorksheet('Instructions', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  instructionsSheet.columns = [
    { width: 50 },
    { width: 80 }
  ];
  
  // Title
  const titleRow = instructionsSheet.addRow(['EMISSIONS DATA UPLOAD TEMPLATE']);
  titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
  titleRow.height = 30;
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  instructionsSheet.mergeCells('A1:B1');
  
  instructionsSheet.addRow([]);
  
  // Overview
  const overviewRow = instructionsSheet.addRow(['OVERVIEW']);
  overviewRow.font = { size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  instructionsSheet.addRow(['Purpose', 'This template helps you organize and upload your emissions data for carbon footprint calculations across Scope 1, 2, and 3 emissions.']);
  instructionsSheet.addRow(['How to Use', '1. Fill in your data in the respective scope sheets (Scope 1, Scope 2, Scope 3)\n2. Follow the column headers and examples provided\n3. Save the file and upload it to the system\n4. The system will automatically parse and calculate your emissions']);
  instructionsSheet.addRow([]);
  
  // Scope Definitions
  const scopeDefRow = instructionsSheet.addRow(['SCOPE DEFINITIONS']);
  scopeDefRow.font = { size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  
  instructionsSheet.addRow(['Scope 1', 'Direct emissions from owned or controlled sources (e.g., company vehicles, on-site fuel combustion, refrigerants)']);
  instructionsSheet.addRow(['Scope 2', 'Indirect emissions from purchased electricity, heat, steam, and cooling']);
  instructionsSheet.addRow(['Scope 3', 'All other indirect emissions in the value chain (e.g., business travel, waste, purchased goods and services)']);
  instructionsSheet.addRow([]);
  
  // Required Fields
  const reqFieldsRow = instructionsSheet.addRow(['REQUIRED FIELDS']);
  reqFieldsRow.font = { size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  
  instructionsSheet.addRow(['Activity Type', 'The type of emission source (e.g., Natural Gas, Electricity, Diesel)']);
  instructionsSheet.addRow(['Quantity', 'The amount consumed (numeric value)']);
  instructionsSheet.addRow(['Unit', 'The unit of measurement (e.g., kWh, litres, kg, km)']);
  instructionsSheet.addRow([]);
  
  // Optional Fields
  const optFieldsRow = instructionsSheet.addRow(['OPTIONAL FIELDS']);
  optFieldsRow.font = { size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  
  instructionsSheet.addRow(['Location', 'Where the activity occurred (e.g., Main Office, Warehouse)']);
  instructionsSheet.addRow(['Start Date', 'Beginning of the reporting period (YYYY-MM-DD)']);
  instructionsSheet.addRow(['End Date', 'End of the reporting period (YYYY-MM-DD)']);
  instructionsSheet.addRow(['Notes', 'Any additional information or context']);
  instructionsSheet.addRow([]);
  
  // Tips
  const tipsRow = instructionsSheet.addRow(['TIPS FOR SUCCESS']);
  tipsRow.font = { size: 14, bold: true, color: { argb: 'FF2E7D32' } };
  
  instructionsSheet.addRow(['✓', 'Use the provided examples as a guide']);
  instructionsSheet.addRow(['✓', 'Ensure quantities are positive numbers']);
  instructionsSheet.addRow(['✓', 'Use consistent units (the system will convert if needed)']);
  instructionsSheet.addRow(['✓', 'Include dates in YYYY-MM-DD format']);
  instructionsSheet.addRow(['✓', 'Delete example rows before uploading your data']);
  instructionsSheet.addRow(['✓', 'You can use any of the three scope sheets or combine data in one sheet']);
  
  // Style the instructions
  instructionsSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 && cell.value) {
          cell.font = { bold: true };
        }
        cell.alignment = { vertical: 'top', wrapText: true };
      });
    }
  });
  
  // ============================================
  // SCOPE 1 SHEET
  // ============================================
  const scope1Sheet = workbook.addWorksheet('Scope 1 - Direct Emissions', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  scope1Sheet.columns = [
    { header: 'Activity Type', key: 'activityType', width: 25 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 15 },
    { header: 'Unit', key: 'unit', width: 15 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];
  
  // Style header row
  const scope1HeaderRow = scope1Sheet.getRow(1);
  scope1HeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  scope1HeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD32F2F' } };
  scope1HeaderRow.height = 25;
  scope1HeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add example data for Scope 1
  scope1Sheet.addRow({
    activityType: 'Natural Gas',
    location: 'Main Office',
    quantity: 15000,
    unit: 'kWh',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Heating for January'
  });
  
  scope1Sheet.addRow({
    activityType: 'Diesel',
    location: 'Fleet Vehicles',
    quantity: 500,
    unit: 'litres',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Company vehicle fuel consumption'
  });
  
  scope1Sheet.addRow({
    activityType: 'LPG',
    location: 'Warehouse',
    quantity: 800,
    unit: 'kg',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Forklift operations'
  });
  
  scope1Sheet.addRow({
    activityType: 'Petrol',
    location: 'Company Cars',
    quantity: 300,
    unit: 'litres',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Executive vehicle fuel'
  });
  
  scope1Sheet.addRow({
    activityType: 'Refrigerants',
    location: 'Main Office',
    quantity: 5,
    unit: 'kg',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    notes: 'AC maintenance - R134A refrigerant top-up'
  });
  
  // Add data validation for units (Scope 1)
  scope1Sheet.getColumn('unit').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"kWh,litres,kg,m3,GJ"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Unit',
        error: 'Please select a valid unit from the dropdown'
      };
    }
  });
  
  // ============================================
  // SCOPE 2 SHEET
  // ============================================
  const scope2Sheet = workbook.addWorksheet('Scope 2 - Indirect Emissions', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  scope2Sheet.columns = [
    { header: 'Activity Type', key: 'activityType', width: 25 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 15 },
    { header: 'Unit', key: 'unit', width: 15 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];
  
  // Style header row
  const scope2HeaderRow = scope2Sheet.getRow(1);
  scope2HeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  scope2HeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6F00' } };
  scope2HeaderRow.height = 25;
  scope2HeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add example data for Scope 2
  scope2Sheet.addRow({
    activityType: 'Electricity',
    location: 'Main Office',
    quantity: 25000,
    unit: 'kWh',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Grid electricity consumption'
  });
  
  scope2Sheet.addRow({
    activityType: 'Electricity',
    location: 'Warehouse',
    quantity: 12000,
    unit: 'kWh',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Warehouse lighting and equipment'
  });
  
  scope2Sheet.addRow({
    activityType: 'Heat/Steam',
    location: 'Factory',
    quantity: 50,
    unit: 'GJ',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'District heating'
  });
  
  scope2Sheet.addRow({
    activityType: 'Cooling',
    location: 'Data Center',
    quantity: 8000,
    unit: 'kWh',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'District cooling for servers'
  });
  
  // Add data validation for units (Scope 2)
  scope2Sheet.getColumn('unit').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"kWh,MWh,GJ"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Unit',
        error: 'Please select a valid unit from the dropdown'
      };
    }
  });
  
  // ============================================
  // SCOPE 3 SHEET
  // ============================================
  const scope3Sheet = workbook.addWorksheet('Scope 3 - Value Chain', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  scope3Sheet.columns = [
    { header: 'Activity Type', key: 'activityType', width: 30 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 15 },
    { header: 'Unit', key: 'unit', width: 20 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];
  
  // Style header row
  const scope3HeaderRow = scope3Sheet.getRow(1);
  scope3HeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  scope3HeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
  scope3HeaderRow.height = 25;
  scope3HeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add example data for Scope 3
  scope3Sheet.addRow({
    activityType: 'Business Travel - Air',
    location: 'International',
    quantity: 5000,
    unit: 'passenger-km',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Employee flights for business meetings'
  });
  
  scope3Sheet.addRow({
    activityType: 'Business Travel - Rail',
    location: 'Domestic',
    quantity: 2000,
    unit: 'passenger-km',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Train travel for conferences'
  });
  
  scope3Sheet.addRow({
    activityType: 'Waste - Landfill',
    location: 'Main Office',
    quantity: 2.5,
    unit: 'tonne',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'General waste sent to landfill'
  });
  
  scope3Sheet.addRow({
    activityType: 'Purchased Goods & Services',
    location: 'All Sites',
    quantity: 50000,
    unit: 'GBP',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Office supplies and services (spend-based)'
  });
  
  scope3Sheet.addRow({
    activityType: 'Capital Goods',
    location: 'All Sites',
    quantity: 100000,
    unit: 'GBP',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'IT equipment purchases (spend-based)'
  });
  
  scope3Sheet.addRow({
    activityType: 'Upstream Transport',
    location: 'Supply Chain',
    quantity: 15000,
    unit: 'GBP',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Freight and delivery costs (spend-based)'
  });
  
  scope3Sheet.addRow({
    activityType: 'Fuel & Energy Related',
    location: 'All Sites',
    quantity: 40000,
    unit: 'kWh',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    notes: 'Upstream emissions from fuel production'
  });
  
  // Add data validation for units (Scope 3)
  scope3Sheet.getColumn('unit').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"passenger-km,tonne,kg,GBP,USD,EUR,kWh"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Unit',
        error: 'Please select a valid unit from the dropdown'
      };
    }
  });
  
  // ============================================
  // ACTIVITY TYPES REFERENCE SHEET
  // ============================================
  const referenceSheet = workbook.addWorksheet('Activity Types Reference', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });
  
  referenceSheet.columns = [
    { header: 'Scope', key: 'scope', width: 15 },
    { header: 'Activity Type', key: 'activityType', width: 35 },
    { header: 'Typical Units', key: 'units', width: 25 },
    { header: 'Description', key: 'description', width: 50 }
  ];
  
  // Style header row
  const refHeaderRow = referenceSheet.getRow(1);
  refHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  refHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF455A64' } };
  refHeaderRow.height = 25;
  refHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add reference data
  const referenceData = [
    // Scope 1
    { scope: 'Scope 1', activityType: 'Natural Gas', units: 'kWh, m3, GJ', description: 'Natural gas combustion for heating, cooking, or processes' },
    { scope: 'Scope 1', activityType: 'Diesel', units: 'litres, kWh', description: 'Diesel fuel for vehicles, generators, or equipment' },
    { scope: 'Scope 1', activityType: 'Petrol/Gasoline', units: 'litres, kWh', description: 'Petrol fuel for company vehicles' },
    { scope: 'Scope 1', activityType: 'LPG', units: 'kg, litres, kWh', description: 'Liquefied petroleum gas for forklifts or heating' },
    { scope: 'Scope 1', activityType: 'Kerosene', units: 'litres, kWh', description: 'Kerosene for heating or aviation' },
    { scope: 'Scope 1', activityType: 'Coal', units: 'kg, tonne', description: 'Coal combustion for energy or processes' },
    { scope: 'Scope 1', activityType: 'Fuel Oil', units: 'litres, kWh', description: 'Heavy fuel oil for heating or power generation' },
    { scope: 'Scope 1', activityType: 'Refrigerants', units: 'kg', description: 'Refrigerant leakage from AC or cooling systems (specify type in notes)' },
    { scope: 'Scope 1', activityType: 'Process Emissions', units: 'kg, tonne', description: 'Direct emissions from industrial processes' },
    
    // Scope 2
    { scope: 'Scope 2', activityType: 'Electricity', units: 'kWh, MWh', description: 'Purchased electricity from the grid' },
    { scope: 'Scope 2', activityType: 'Heat/Steam', units: 'GJ, kWh', description: 'Purchased heat or steam from district heating' },
    { scope: 'Scope 2', activityType: 'Cooling', units: 'kWh, GJ', description: 'Purchased cooling from district cooling systems' },
    
    // Scope 3
    { scope: 'Scope 3', activityType: 'Business Travel - Air', units: 'passenger-km, miles', description: 'Employee air travel for business purposes' },
    { scope: 'Scope 3', activityType: 'Business Travel - Rail', units: 'passenger-km, miles', description: 'Employee train travel for business purposes' },
    { scope: 'Scope 3', activityType: 'Business Travel - Road', units: 'passenger-km, miles', description: 'Employee road travel (taxi, rental cars)' },
    { scope: 'Scope 3', activityType: 'Waste - Landfill', units: 'tonne, kg', description: 'Waste sent to landfill' },
    { scope: 'Scope 3', activityType: 'Waste - Recycling', units: 'tonne, kg', description: 'Waste sent for recycling' },
    { scope: 'Scope 3', activityType: 'Waste - Incineration', units: 'tonne, kg', description: 'Waste sent for incineration' },
    { scope: 'Scope 3', activityType: 'Water Supply', units: 'm3, litres', description: 'Water consumption' },
    { scope: 'Scope 3', activityType: 'Wastewater Treatment', units: 'm3, litres', description: 'Wastewater treatment' },
    { scope: 'Scope 3', activityType: 'Purchased Goods & Services', units: 'GBP, USD, EUR', description: 'Spend on goods and services (spend-based)' },
    { scope: 'Scope 3', activityType: 'Capital Goods', units: 'GBP, USD, EUR', description: 'Spend on capital equipment (spend-based)' },
    { scope: 'Scope 3', activityType: 'Upstream Transport', units: 'GBP, USD, EUR, tonne-km', description: 'Transportation and distribution of purchased goods' },
    { scope: 'Scope 3', activityType: 'Fuel & Energy Related', units: 'kWh', description: 'Upstream emissions from fuel and energy production' },
    { scope: 'Scope 3', activityType: 'Employee Commuting', units: 'passenger-km, miles', description: 'Employee travel between home and work' }
  ];
  
  referenceData.forEach(data => {
    referenceSheet.addRow(data);
  });
  
  // Style reference sheet
  referenceSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', wrapText: true };
      });
      
      // Color code by scope
      const scopeCell = row.getCell(1);
      if (scopeCell.value === 'Scope 1') {
        scopeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
      } else if (scopeCell.value === 'Scope 2') {
        scopeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
      } else if (scopeCell.value === 'Scope 3') {
        scopeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
      }
    }
  });
  
  // ============================================
  // SAVE THE WORKBOOK
  // ============================================
  const templateDir = path.join(__dirname, '..', 'templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  
  const templatePath = path.join(templateDir, 'Emissions_Data_Upload_Template.xlsx');
  await workbook.xlsx.writeFile(templatePath);
  
  console.log(`✅ Emissions data upload template generated successfully!`);
  console.log(`📁 Location: ${templatePath}`);
  console.log(`\nThe template includes:`);
  console.log(`  • Instructions sheet with guidance`);
  console.log(`  • Scope 1 sheet for direct emissions`);
  console.log(`  • Scope 2 sheet for indirect emissions (electricity, heat, cooling)`);
  console.log(`  • Scope 3 sheet for value chain emissions`);
  console.log(`  • Activity Types Reference sheet with all supported activities`);
  console.log(`\nUsers can fill in any or all scope sheets and upload the file.`);
}

// Run the generator
generateEmissionsTemplate()
  .then(() => {
    console.log('\n✨ Template generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating template:', error);
    process.exit(1);
  });
