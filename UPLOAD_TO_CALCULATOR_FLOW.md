# 🔄 Upload to Calculator Integration

## ✅ How It Works

Your uploaded emission data now automatically flows into the Calculator!

---

## 📋 **Workflow:**

### **Step 1: Upload Your CSV File**
1. Go to the **Upload** page
2. Select a site and period
3. Upload your `sample_emissions_data.csv`
4. Review the parsed data (5 rows, 7 columns)

### **Step 2: Import Activities**
1. Select a reporting period
2. Click **"Import X Valid Rows"**
3. You'll see: **"Activities imported successfully! Data is now available in the Calculator."**

### **Step 3: View in Calculator**
1. Navigate to the **Calculator** page
2. You'll see a **green badge** saying **"Using Uploaded Data"**
3. Your Scope 1 emissions will show your uploaded data:
   - Natural Gas (Main Office) - 1500 kWh
   - Diesel (Warehouse) - 250 litres
   - LPG (Factory) - 800 kg
   - Refrigerants (Main Office) - 5 kg
   - Process Emissions (Factory) - 1200 kg

### **Step 4: Calculate Emissions**
- The calculator automatically applies emission factors
- CO2e values are calculated for each activity
- See totals for Scope 1, 2, 3, and Grand Total

---

## 🎯 **What Gets Converted:**

| CSV Column | Calculator Field |
|------------|------------------|
| Emission Type | Source (with location) |
| Consumption | Activity Data |
| Unit | Unit |
| Location | Added to Source name |
| Start/End Date | Stored for reference |
| Notes | Stored for reference |

---

## 📊 **Emission Factors Applied:**

The calculator automatically applies these factors:

| Emission Type | Factor | Source |
|--------------|--------|--------|
| Natural Gas | 0.0002027 | DESNZ, 2025 |
| Diesel | 0.000239 | DESNZ, 2025 |
| LPG | 0.00023032 | DESNZ, 2025 |
| Refrigerants | 1.43 | IPCC, 2014 |
| Process Emissions | 1.5 | Process-Specific |

---

## ✨ **Features:**

### **Automatic Data Loading**
- ✅ Calculator loads uploaded data on page load
- ✅ Shows green "Using Uploaded Data" badge
- ✅ Success toast notification

### **Data Persistence**
- ✅ Data stored in localStorage
- ✅ Survives page refreshes
- ✅ Available until you upload new data

### **Editable Values**
- ✅ Click any activity value to edit
- ✅ CO2e recalculates automatically
- ✅ Totals update in real-time

---

## 🔄 **Complete Flow Example:**

```
1. Upload CSV → Parse (5 rows) → Import
                    ↓
2. Data saved to localStorage
                    ↓
3. Navigate to Calculator
                    ↓
4. Calculator loads data automatically
                    ↓
5. See your emissions with calculations!
```

---

## 🎨 **Visual Indicators:**

### **Upload Page:**
- ✅ Green stats boxes (Total/Valid/Error rows)
- ✅ Sample data table preview
- ✅ Success message with calculator mention

### **Calculator Page:**
- ✅ Green badge: "Using Uploaded Data"
- ✅ Your actual emission sources listed
- ✅ Real quantities from your CSV

---

## 📝 **Example Data Flow:**

**CSV Input:**
```csv
Emission Type,Location,Consumption,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,January heating
```

**Calculator Output:**
```
Source: Natural Gas (Main Office)
Activity: 1500 kWh
Factor: 0.0002027
CO2e: 0.30 tonnes
```

---

## 🚀 **Try It Now:**

1. **Upload** your CSV file
2. **Import** the activities
3. **Navigate** to Calculator
4. **See** your data automatically loaded!

---

**Your emission data is now seamlessly integrated from upload to calculation!** 🎉
