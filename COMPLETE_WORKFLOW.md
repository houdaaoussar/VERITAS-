# 🎯 Complete Upload to Calculator Workflow

## ✅ How It Works Now

Your data flows from CSV upload directly into the Calculator page!

---

## 📊 The Complete Flow

```
1. Upload CSV File
   ↓
2. Backend Processes & Saves Data
   ↓
3. Data Saved to localStorage
   ↓
4. Calculator Page Loads Data Automatically
   ↓
5. See Your Emissions Calculated!
```

---

## 🚀 Step-by-Step Guide

### Step 1: Open the Upload Page

**Option A: Use the simple upload page**
```
.\open-upload-page.bat
```

Or open directly:
```
file:///c:/Users/Dell/Downloads/HoudaProject_update (4)/HoudaProject/simple-upload-page.html
```

**Option B: Use React frontend** (requires login)
```
http://localhost:3001
```

---

### Step 2: Upload Your CSV

**CSV Format:**
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

**Drag & drop** your file or **click to browse**

---

### Step 3: Data is Processed

The backend will:
- ✅ Parse your CSV
- ✅ Map columns intelligently
- ✅ Determine emission scopes automatically
- ✅ Select appropriate emission factors
- ✅ Save activities to in-memory storage
- ✅ Return processed data

---

### Step 4: Data Saved to Calculator

After successful upload:
- ✅ Data is saved to `localStorage`
- ✅ A button appears: **"📊 Open Calculator"**
- ✅ Click it to see your data in the calculator!

---

### Step 5: View in Calculator

The Calculator page will:
- ✅ Load your uploaded data automatically
- ✅ Display it in the Scope 1, 2, 3 tables
- ✅ Calculate CO2e emissions
- ✅ Show totals by scope
- ✅ Generate charts and graphs

---

## 🎮 Quick Test

### 1. Make sure both servers are running:

**Backend:**
```bash
npm run dev:backend
# Should be running on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should be running on http://localhost:3001
```

### 2. Open the upload page:
```bash
.\open-upload-page.bat
```

### 3. Upload the test file:
- Use `test_emissions.csv` (already created)
- Or create your own CSV

### 4. After upload, click:
```
📊 Open Calculator
```

### 5. See your data in the calculator!

---

## 📋 Data Mapping

The calculator expects these fields:

| CSV Column | Calculator Field | Example |
|------------|-----------------|---------|
| Emission Source | source | Natural Gas |
| Activity Data | activity | 1500 |
| Unit | unit | kWh |
| Site/Location | location | Main Office |

**The system automatically:**
- Maps similar column names
- Determines emission factors
- Calculates CO2e
- Assigns to correct scope

---

## 🔧 What Was Fixed

### 1. Backend Updates
- ✅ Added `data` field to API response
- ✅ Returns processed data for calculator
- ✅ Test endpoint works without auth

### 2. Frontend Updates
- ✅ Upload page saves to `localStorage`
- ✅ Calculator loads from `localStorage`
- ✅ Button to navigate to calculator
- ✅ Success message with data confirmation

### 3. Data Flow
- ✅ CSV → Backend → localStorage → Calculator
- ✅ Automatic data population
- ✅ No manual entry needed

---

## 📊 Calculator Features

Once data is loaded, you can:

### View Data
- ✅ See all activities in tables
- ✅ Organized by Scope 1, 2, 3
- ✅ Emission factors displayed
- ✅ CO2e calculated automatically

### Edit Data
- ✅ Modify activity amounts
- ✅ Change units
- ✅ Update emission factors
- ✅ Recalculates automatically

### Export Results
- ✅ Download as CSV
- ✅ Generate reports
- ✅ View charts

---

## 🎯 Supported Emission Sources

### Scope 1 (Direct Emissions)
- Natural Gas
- Diesel
- Petrol/Gasoline
- LPG/Propane
- Refrigerants
- Coal
- Fuel Oil

### Scope 2 (Purchased Energy)
- Electricity
- District Heating
- District Cooling
- Steam

### Scope 3 (Indirect Emissions)
- Business Travel
- Employee Commuting
- Waste
- Water
- Purchased Goods & Services
- And more...

---

## ✅ Verification Steps

### 1. Check Upload Success
After upload, you should see:
```
✅ Upload Successful!
Successfully processed X rows
Y activities created
Data is now available in the Calculator!
```

### 2. Check localStorage
Open browser console (F12) and type:
```javascript
localStorage.getItem('uploadedEmissionData')
```
You should see your data!

### 3. Check Calculator
Open calculator page:
```
http://localhost:3001/calculator
```
Your data should appear in the tables!

---

## 🐛 Troubleshooting

### Data not appearing in calculator?

**Check 1: Is data in localStorage?**
```javascript
console.log(localStorage.getItem('uploadedEmissionData'));
```

**Check 2: Are both servers running?**
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

**Check 3: Did upload succeed?**
- Look for success message
- Check for "📊 Open Calculator" button

**Fix: Clear and re-upload**
```javascript
localStorage.clear();
// Then upload again
```

### Calculator shows default data?

**Solution:** The calculator shows default data if no uploaded data is found. Make sure:
1. Upload was successful
2. Data was saved to localStorage
3. You're opening the calculator in the same browser

### Wrong data format?

**Solution:** The calculator expects specific field names. Check the CSV template:
```bash
curl http://localhost:3000/api/ingest/template/download -o template.csv
```

---

## 📝 Example Workflow

### Complete Example:

1. **Start servers:**
   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Open upload page:**
   ```bash
   .\open-upload-page.bat
   ```

3. **Create CSV:**
   ```csv
   Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
   Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Heating
   Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Power
   Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Vehicles
   ```

4. **Upload file** (drag & drop)

5. **See success message:**
   ```
   ✅ Successfully processed 3 rows
   3 activities created
   ```

6. **Click "📊 Open Calculator"**

7. **See your data:**
   - Natural Gas: 1500 kWh → 0.30 tCO2e
   - Electricity: 25000 kWh → 4.43 tCO2e
   - Diesel: 800 litres → 2.15 tCO2e
   - **Total: 6.88 tCO2e**

---

## 🎉 Summary

**What you have now:**

✅ **Simple upload page** - No login required  
✅ **Automatic data flow** - CSV → Calculator  
✅ **Smart mapping** - Handles various column names  
✅ **Auto-calculation** - Emissions calculated automatically  
✅ **Beautiful UI** - Professional calculator interface  
✅ **No database needed** - All in-memory  

**Your complete emissions tracking system is ready!** 🌱

Upload your data and see it calculated instantly in the calculator page!
