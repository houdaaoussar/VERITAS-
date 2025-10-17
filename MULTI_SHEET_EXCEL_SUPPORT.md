# 📊 Multi-Sheet Excel Support

## ✅ Intelligent Sheet Detection

The system now automatically finds the correct sheet in Excel files with multiple sheets!

---

## 🎯 **How It Works:**

### **Automatic Sheet Selection**
The system scores each sheet based on:

1. **Sheet Name** (10 points if contains keywords):
   - emission, activity, data, scope, carbon, ghg, co2
   - consumption, quantity, fuel, energy, site, location

2. **Column Headers** (5 points per match):
   - Looks for emission-related column names
   - Matches against target fields and synonyms
   - Identifies data vs metadata sheets

3. **Data Volume** (up to 10 points):
   - More rows = higher score
   - Helps distinguish data sheets from summary sheets

---

## 📋 **Example Scenarios:**

### **Scenario 1: Multiple Data Sheets**
```
Sheet 1: "Summary" (5 rows, no emission columns) → Score: 0.5
Sheet 2: "Emissions Data" (100 rows, all columns) → Score: 45
Sheet 3: "Notes" (2 rows, text only) → Score: 0.2
```
**Selected:** Sheet 2 (highest score)

### **Scenario 2: Mixed Content**
```
Sheet 1: "Instructions" (text) → Score: 0
Sheet 2: "Scope 1 Emissions" (50 rows) → Score: 35
Sheet 3: "Scope 2 Data" (30 rows) → Score: 30
```
**Selected:** Sheet 2 (highest score)

### **Scenario 3: Generic Names**
```
Sheet 1: "Sheet1" (empty) → Score: 0
Sheet 2: "Sheet2" (emission data, 75 rows) → Score: 32.5
Sheet 3: "Sheet3" (summary, 10 rows) → Score: 1
```
**Selected:** Sheet 2 (has data with matching columns)

---

## 🔍 **Detection Keywords:**

### **Sheet Names:**
- emission, activity, data
- scope, carbon, ghg, co2
- consumption, quantity
- fuel, energy
- site, location

### **Column Headers:**
- Emission Category/Type
- Site/Location
- Quantity/Consumption
- Unit
- Activity Date
- Scope
- Notes

---

## 📊 **Response Information:**

The API now returns sheet information:

```json
{
  "status": "success",
  "rows_imported": 50,
  "sheet_info": {
    "selected_sheet": "Emissions Data",
    "total_sheets": 3,
    "all_sheets": ["Summary", "Emissions Data", "Notes"]
  }
}
```

---

## ✨ **Features:**

### **Smart Detection**
- ✅ Skips empty sheets automatically
- ✅ Ignores summary/instruction sheets
- ✅ Finds data even with generic sheet names
- ✅ Prioritizes sheets with emission keywords

### **Flexible Handling**
- ✅ Works with any sheet name
- ✅ Handles multiple data sheets
- ✅ Falls back to first sheet if no clear winner
- ✅ Logs selection reasoning

### **CSV Compatibility**
- ✅ CSV files work as before (single sheet)
- ✅ No changes needed for CSV uploads
- ✅ Seamless fallback

---

## 🧪 **Testing:**

### **Test with Multi-Sheet Excel:**

1. Create an Excel file with multiple sheets:
   - Sheet 1: "Instructions" (text only)
   - Sheet 2: "Emissions Data" (your emission data)
   - Sheet 3: "Summary" (totals)

2. Upload the file

3. System will automatically select "Emissions Data"

4. Check the response to see which sheet was selected

---

## 📝 **Logging:**

The system logs detailed information:

```
Analyzing workbook sheets: { sheetCount: 3, sheets: [...] }
Sheet score: Instructions { score: 0, rowCount: 5 }
Sheet score: Emissions Data { score: 45, rowCount: 100 }
Sheet score: Summary { score: 5, rowCount: 10 }
Selected sheet: Emissions Data { score: 45 }
```

---

## 🎨 **User Experience:**

### **Transparent Selection**
- Users see which sheet was selected
- Total sheet count displayed
- All sheet names listed in response

### **No Configuration Needed**
- Works automatically
- No need to specify sheet name
- Intelligent selection every time

---

## 🚀 **Benefits:**

1. ✅ **Saves Time** - No need to manually select sheets
2. ✅ **Reduces Errors** - Automatically finds the right data
3. ✅ **User Friendly** - Works with any Excel structure
4. ✅ **Flexible** - Adapts to different naming conventions
5. ✅ **Transparent** - Shows which sheet was selected

---

## 📊 **Example Use Cases:**

### **Use Case 1: Template Files**
Excel templates with:
- Instructions sheet
- Data entry sheet
- Calculation sheet
→ System finds data entry sheet automatically

### **Use Case 2: Exported Reports**
Reports with:
- Cover page
- Multiple data tabs
- Summary tab
→ System finds the main data tab

### **Use Case 3: Consolidated Files**
Files with:
- Scope 1 data
- Scope 2 data
- Scope 3 data
→ System selects the sheet with most emission data

---

**Your system now intelligently handles multi-sheet Excel files!** 🎉
