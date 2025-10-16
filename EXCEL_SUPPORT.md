# 📊 Excel File Support - Complete Guide

## ✅ Supported File Formats

Your app now supports **THREE file formats**:

| Format | Extension | Description |
|--------|-----------|-------------|
| **CSV** | `.csv` | Comma-separated values |
| **Excel (new)** | `.xlsx` | Modern Excel format |
| **Excel (legacy)** | `.xls` | Older Excel format |

---

## 🎯 How Excel Upload Works

### **Step 1: Upload Excel File**
```bash
POST /api/emissions-inventory/upload

Form Data:
  file: your_file.xlsx
  customerId: <uuid>
  autoCreate: true
```

### **Step 2: Choose Parsing Method**

#### **Option A: Standard Parse** (Column-based)
```bash
POST /api/emissions-inventory/:uploadId/parse
```
- Works when Excel has clear column headers
- Faster and more accurate
- Best for structured data

#### **Option B: Intelligent Parse** (Content-based)
```bash
POST /api/emissions-inventory/:uploadId/intelligent-parse
```
- Scans entire Excel sheet for patterns
- Finds data anywhere in the sheet
- Best for messy or unstructured data

### **Step 3: Import Data**
```bash
POST /api/emissions-inventory/:uploadId/import
# OR
POST /api/emissions-inventory/:uploadId/intelligent-import
```

---

## 📝 Excel Format Examples

### Example 1: Standard Format
```
| Inventory Year | Sector | Scope | Fuel Type      | Amount | Unit  |
|----------------|--------|-------|----------------|--------|-------|
| 2024           | Energy | 1     | Natural Gas    | 1500   | m³    |
| 2024           | Energy | 2     | Electricity    | 25000  | kWh   |
| 2024           | Transport | 1  | Diesel         | 800    | liters|
```

### Example 2: Messy Format (Intelligent Parser Handles This!)
```
2024 Company Energy Report

Description                    | Monthly Average
Office electricity consumption | 25000 kWh
Natural gas for heating        | 1500 cubic meters
Company fleet diesel           | 800 liters
```

### Example 3: Multiple Sheets
- Currently reads **first sheet only**
- If you have multiple sheets, combine them or upload separately

---

## 🔧 Excel-Specific Features

### **1. Formula Support**
✅ Formulas are automatically calculated
```
| Item       | Jan  | Feb  | Total      |
|------------|------|------|------------|
| Electricity| 8000 | 8500 | =SUM(B2:C2)|
```
Result: Sees "16500" (calculated value)

### **2. Formatted Numbers**
✅ Handles Excel number formatting
```
| Amount     |
|------------|
| 1,500.00   | ← Recognized as 1500
| $25,000    | ← Recognized as 25000
| 800 L      | ← Recognized as 800 (unit: L)
```

### **3. Date Recognition**
✅ Extracts years from date cells
```
| Date       | Amount |
|------------|--------|
| 01/01/2024 | 1500   | ← Year: 2024
| 2024-03-15 | 2500   | ← Year: 2024
```

### **4. Merged Cells**
⚠️ Merged cells use the first cell's value
```
| Fuel Type (merged) | Amount |
|--------------------|--------|
| Natural Gas        | 1500   |
```

### **5. Hidden Rows/Columns**
✅ Hidden rows are still processed
⚠️ To skip hidden rows, unhide or delete them first

---

## 🎨 Frontend Usage

### Upload Excel File
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('customerId', user.customerId);
  formData.append('autoCreate', 'true');

  const response = await api.post('/emissions-inventory/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.uploadId;
};
```

### Parse Excel Intelligently
```typescript
const parseExcel = async (uploadId: string) => {
  const response = await api.post(
    `/emissions-inventory/${uploadId}/intelligent-parse`
  );

  console.log('Found activities:', response.data.summary.totalFound);
  console.log('High confidence:', response.data.summary.highConfidence);
  
  return response.data;
};
```

### Import Data
```typescript
const importData = async (uploadId: string) => {
  const response = await api.post(
    `/emissions-inventory/${uploadId}/intelligent-import`,
    { minConfidence: 0.7 } // Only import 70%+ confidence
  );

  console.log('Imported:', response.data.totalImported);
  return response.data;
};
```

---

## 🐛 Common Excel Issues & Solutions

### Issue 1: "No worksheet found"
**Cause:** Empty Excel file or corrupted

**Solution:**
- Open Excel file and verify it has data
- Save as new file
- Try converting to CSV

### Issue 2: "No valid rows found"
**Cause:** Data not recognized

**Solution:**
1. Use **intelligent parse** instead of standard parse
2. Check if data has recognizable fuel types
3. Ensure numbers are actual numbers, not text

### Issue 3: Excel formulas not working
**Cause:** Formulas with errors (#DIV/0!, #REF!, etc.)

**Solution:**
- Fix formula errors in Excel first
- Or replace formulas with values (Copy → Paste Special → Values)

### Issue 4: Special characters in Excel
**Cause:** Non-standard characters (é, ñ, 中文, etc.)

**Solution:**
✅ **Already supported!** Excel encoding is handled automatically

### Issue 5: Large Excel files (>10MB)
**Cause:** File size limit

**Solution:**
1. Split into multiple files
2. Remove unnecessary sheets/columns
3. Or increase limit in `.env`:
```
MAX_FILE_SIZE=20971520  # 20MB
```

---

## 📊 Excel vs CSV Comparison

| Feature | CSV | Excel |
|---------|-----|-------|
| **File Size** | Smaller | Larger |
| **Speed** | Faster | Slightly slower |
| **Formulas** | ❌ No | ✅ Yes |
| **Formatting** | ❌ No | ✅ Yes |
| **Multiple Sheets** | ❌ No | ⚠️ First sheet only |
| **Dates** | Text only | ✅ Proper dates |
| **Compatibility** | Universal | Excel required to create |

**Recommendation:** 
- Use **CSV** for simple, fast uploads
- Use **Excel** when you have formulas or formatted data

---

## 🧪 Testing

### Test with Sample Excel
1. Create Excel file with this data:
```
| Year | Fuel Type   | Amount | Unit |
|------|-------------|--------|------|
| 2024 | Electricity | 25000  | kWh  |
| 2024 | Natural Gas | 1500   | m³   |
| 2024 | Diesel      | 800    | L    |
```

2. Upload via API or frontend
3. Use intelligent parse
4. Check confidence scores
5. Import data

### Expected Result:
```json
{
  "summary": {
    "totalFound": 3,
    "highConfidence": 3,
    "averageConfidence": 0.85
  }
}
```

---

## 🎯 Best Practices

### ✅ DO:
- Use clear, descriptive names (e.g., "Natural Gas" not "NG")
- Include units in separate column or with values
- Use standard fuel type names
- Keep data in first sheet
- Use numbers for quantities (not text)

### ❌ DON'T:
- Mix different data types in same column
- Use merged cells for data (headers OK)
- Leave empty rows between data
- Use special formatting that hides data
- Put multiple tables in one sheet

---

## 🚀 Advanced Features

### Custom Column Mapping (Standard Parse)
```bash
POST /api/emissions-inventory/:uploadId/parse

Body:
{
  "columnMapping": {
    "inventoryYear": "Year",
    "fuelTypeOrActivity": "Fuel Type",
    "activityDataAmount": "Amount",
    "activityDataUnit": "Unit"
  }
}
```

### Confidence Filtering (Intelligent Parse)
```bash
POST /api/emissions-inventory/:uploadId/intelligent-import

Body:
{
  "minConfidence": 0.8  // Only import 80%+ confidence
}
```

---

## 📞 Support

### File Not Uploading?
1. Check file size (< 10MB)
2. Check file extension (.xlsx or .xls)
3. Check authentication token
4. Check CORS settings

### Data Not Recognized?
1. Try intelligent parse
2. Check fuel type names
3. Verify numbers are not text
4. Check for formula errors

---

## ✅ Summary

Your app now supports:
- ✅ CSV files (.csv)
- ✅ Excel files (.xlsx, .xls)
- ✅ Standard parsing (column-based)
- ✅ Intelligent parsing (content-based)
- ✅ Automatic pattern recognition
- ✅ Confidence scoring
- ✅ Formula calculation
- ✅ Date extraction
- ✅ Number formatting

**Upload any format, and the system will figure it out!** 🎉
