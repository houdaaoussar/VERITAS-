# 🔧 CSV Upload Troubleshooting Guide

## ✅ **Quick Fix Applied!**

I just fixed the upload issue. The frontend now recognizes `customer_default` and uses the test endpoint.

---

## 🎯 **How to Upload CSV Now**

### **Option 1: Full React App (Recommended)**

1. **Open the app:**
   ```
   http://localhost:3001/upload
   ```

2. **Upload your CSV:**
   - Click "Choose File" or drag & drop
   - Select your CSV file
   - Click "Upload"

3. **Parse & Import:**
   - Click "Parse & Validate"
   - Review the data
   - Click "Import Activities"

4. **Check Calculator:**
   ```
   http://localhost:3001/calculator
   ```
   Your data should appear!

---

### **Option 2: Simple Upload Page**

1. **Open:**
   ```
   simple-upload-page.html
   ```
   Or run: `.\open-upload-page.bat`

2. **Drag & drop CSV**

3. **Click "Upload & Process"**

4. **Click "📊 Open Calculator"**

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Access token required"**

**Cause:** Using wrong endpoint or not logged in

**Solution:**
```javascript
// Check if logged in (open browser console F12)
localStorage.getItem('accessToken')
// Should show: mock-token-for-testing

// If not, refresh the page
location.reload()
```

---

### **Issue 2: "No file uploaded"**

**Cause:** File not selected properly

**Solution:**
- Make sure file is selected
- Check file extension is `.csv` or `.xlsx`
- Try drag & drop instead of clicking

---

### **Issue 3: Upload button disabled**

**Cause:** No file selected or wrong format

**Solution:**
- Select a valid CSV file
- Check file size (must be < 100MB)
- Try a different file

---

### **Issue 4: "Network Error"**

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# Check backend is running
curl http://localhost:3000

# Should return: "Co-Lab VERITAS™ API is running"

# If not, start backend:
npm run dev:backend
```

---

### **Issue 5: Data not appearing in calculator**

**Cause:** Data not saved to localStorage

**Solution:**
```javascript
// Check if data is saved (F12 console)
localStorage.getItem('uploadedEmissionData')

// If null, upload again
// If has data, go to calculator and refresh
```

---

## ✅ **Verification Steps**

### **Step 1: Check Servers**

**Backend:**
```bash
curl http://localhost:3000
```
Should return: API is running

**Frontend:**
```bash
curl http://localhost:3001
```
Should return: HTML

---

### **Step 2: Check Login**

Open browser console (F12) and run:
```javascript
localStorage.getItem('accessToken')
```
Should show: `mock-token-for-testing`

If not, refresh the page.

---

### **Step 3: Test Upload**

1. Go to: `http://localhost:3001/upload`
2. Select `test_emissions.csv`
3. Click "Upload"
4. Should see success message

---

### **Step 4: Check Data**

```javascript
// Open console (F12)
sessionStorage.getItem('latestIngestData')
// Should show your uploaded data
```

---

## 📝 **CSV Format Requirements**

Your CSV must have these columns (names can vary):

| Required Column | Alternatives |
|----------------|--------------|
| **Emission Source** | Fuel Type, Category, Type |
| **Site/Location** | Site, Location, Facility |
| **Activity Data** | Amount, Quantity, Consumption |
| **Unit** | Units, UOM |
| **Start Date** | Date, Period Start |
| **End Date** | Period End |

**Example:**
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Power
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Vehicles
```

---

## 🎮 **Test Upload Now**

### **Quick Test:**

1. **Make sure frontend is running:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open upload page:**
   ```
   http://localhost:3001/upload
   ```

3. **Upload test file:**
   - Use `test_emissions.csv`
   - Click "Upload"

4. **See success!**

---

## 🔍 **Debug Mode**

### **Enable Console Logging:**

Open browser console (F12) and you'll see:
- 🚀 Upload response
- ✅ Data stored
- 📊 Rows imported
- ❌ Any errors

---

## 📞 **Still Having Issues?**

### **Check These:**

1. **Both servers running?**
   - Backend: `npm run dev:backend`
   - Frontend: `cd frontend && npm run dev`

2. **Correct URLs?**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:3001

3. **Mock token set?**
   - Check: `localStorage.getItem('accessToken')`
   - Should be: `mock-token-for-testing`

4. **File format correct?**
   - Must be `.csv` or `.xlsx`
   - Check column names match template

5. **Browser console errors?**
   - Press F12
   - Check Console tab
   - Look for red errors

---

## ✅ **Success Indicators**

When upload works, you should see:

1. **Success toast message:**
   ```
   ✅ File uploaded successfully
   ```

2. **Console logs:**
   ```
   🚀 Upload response from backend
   ✅ Stored in sessionStorage
   ```

3. **Data in calculator:**
   - Go to `/calculator`
   - See your activities in tables

---

## 🚀 **Try Again Now!**

The fix is applied. Try uploading again:

1. **Refresh the page** (Ctrl+R or F5)
2. **Go to Upload page**
3. **Select your CSV**
4. **Click Upload**
5. **Should work now!** ✅

---

**If you still can't upload, let me know the exact error message you see!**
