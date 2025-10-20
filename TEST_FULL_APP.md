# 🚀 Testing the Full React Application

## ✅ Setup Complete!

Your full React application is now ready to test **without any login required**!

---

## 🌐 **Access the Full App**

### **Main URL:**
```
http://localhost:3001
```

**Features Available:**
- ✅ Dashboard
- ✅ Calculator
- ✅ Upload CSV
- ✅ View Activities
- ✅ Run Calculations
- ✅ View Results
- ✅ Generate Reports
- ✅ **No Login Required!**

---

## 🎯 **What Was Fixed**

### 1. **Auto-Login**
- Frontend automatically logs you in as "Demo User"
- Uses default IDs from in-memory storage
- No password needed!

### 2. **Mock Authentication**
- Backend accepts mock token
- All API calls work
- Full access to all features

### 3. **Data Integration**
- Upload CSV → Saves to storage
- Data appears in Calculator
- All features connected

---

## 📋 **Step-by-Step Testing Guide**

### **Step 1: Make Sure Servers Are Running**

**Backend (Terminal 1):**
```bash
npm run dev:backend
```
Should see: `Server running on port 3000`

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:3001/`

---

### **Step 2: Open the Full App**

**In your browser, go to:**
```
http://localhost:3001
```

**You should see:**
- ✅ Toast message: "Logged in as Demo User (No Auth Required)"
- ✅ Dashboard with navigation
- ✅ No login screen!

---

### **Step 3: Test Each Feature**

#### **A. Dashboard**
```
http://localhost:3001
```
- View overview
- See stats
- Navigate to other pages

#### **B. Calculator**
```
http://localhost:3001/calculator
```
- See emission tables
- Edit activities
- Calculate CO2e
- View totals by scope

#### **C. Upload CSV**
```
http://localhost:3001/upload
```
- Upload CSV file
- See parsing results
- Import activities
- Data flows to calculator

#### **D. Activities**
```
http://localhost:3001/activities
```
- View all activities
- Filter by site/period
- Edit activities
- Delete activities

#### **E. Calculations**
```
http://localhost:3001/calculations
```
- Run calculation
- View results
- See breakdown by scope
- Export reports

---

## 🎮 **Complete Test Workflow**

### **Test 1: Upload & Calculate**

1. **Go to Upload page:**
   ```
   http://localhost:3001/upload
   ```

2. **Upload CSV file:**
   - Click "Choose File"
   - Select `test_emissions.csv`
   - Click "Upload"

3. **Parse the file:**
   - Click "Parse & Validate"
   - See validation results

4. **Import activities:**
   - Select period: "2024 Q1"
   - Click "Import Activities"
   - See success message

5. **Go to Calculator:**
   ```
   http://localhost:3001/calculator
   ```

6. **See your data:**
   - Data appears in tables
   - CO2e calculated
   - Totals by scope

---

### **Test 2: Manual Entry in Calculator**

1. **Go to Calculator:**
   ```
   http://localhost:3001/calculator
   ```

2. **Add new activity:**
   - Click "Add Row"
   - Enter emission source
   - Enter activity amount
   - Select unit
   - See CO2e calculated

3. **Edit existing:**
   - Change activity amount
   - See CO2e update automatically

4. **View totals:**
   - Scope 1 Total
   - Scope 2 Total
   - Scope 3 Total
   - Grand Total

---

### **Test 3: Run Calculation**

1. **Go to Calculations:**
   ```
   http://localhost:3001/calculations
   ```

2. **Start new calculation:**
   - Select customer: "Demo Company"
   - Select period: "2024 Q1"
   - Click "Run Calculation"

3. **View results:**
   - See calculation progress
   - View emissions by scope
   - See breakdown by source
   - Export results

---

## 📊 **All Available Pages**

| Page | URL | What You Can Test |
|------|-----|-------------------|
| **Dashboard** | `/` | Overview, stats, navigation |
| **Calculator** | `/calculator` | Manual entry, calculations |
| **Upload** | `/upload` | CSV upload, parsing, import |
| **Activities** | `/activities` | View, edit, delete activities |
| **Sites** | `/sites` | Manage sites/locations |
| **Periods** | `/periods` | Manage reporting periods |
| **Calculations** | `/calculations` | Run calculations, view results |
| **Projects** | `/projects` | Manage projects |
| **Reports** | `/reports` | Generate reports |

---

## ✅ **Default Data Available**

### **Customer:**
- ID: `customer_default`
- Name: "Demo Company"

### **Site:**
- ID: `site_default`
- Name: "Main Office"

### **Period:**
- ID: `period_default`
- Name: "2024 Q1"
- Dates: Jan 1 - Mar 31, 2024

### **User:**
- ID: `user_default`
- Email: "admin@demo.com"
- Role: ADMIN

---

## 🎯 **Key Features to Test**

### **1. CSV Upload Flow**
- Upload → Parse → Validate → Import → Calculator

### **2. Calculator**
- Manual entry
- Auto-calculation
- Scope totals
- Charts

### **3. Activities Management**
- View all activities
- Filter by site/period
- Edit activities
- Delete activities

### **4. Calculations**
- Run calculation
- View results
- Breakdown by scope
- Export data

### **5. Navigation**
- Sidebar menu
- Page transitions
- Breadcrumbs
- Back buttons

---

## 🐛 **Troubleshooting**

### **Issue: Page shows "Loading..."**

**Solution:** Check if backend is running
```bash
curl http://localhost:3000
```

### **Issue: "Network Error"**

**Solution:** Check frontend environment
```bash
# Check .env.development
cat frontend/.env.development
# Should show: VITE_API_BASE_URL=http://localhost:3000
```

### **Issue: No data in Calculator**

**Solution:** Upload CSV first or check localStorage
```javascript
localStorage.getItem('uploadedEmissionData')
```

### **Issue: API calls fail**

**Solution:** Check mock token is set
```javascript
localStorage.getItem('accessToken')
// Should be: mock-token-for-testing
```

---

## 🔄 **Reset Everything**

If you want to start fresh:

```javascript
// Open browser console (F12) and run:
localStorage.clear();
// Then refresh the page
```

---

## 📝 **Test Checklist**

- [ ] Dashboard loads
- [ ] Auto-login works (see toast message)
- [ ] Navigation works
- [ ] Calculator page loads
- [ ] Can add/edit activities
- [ ] Upload page works
- [ ] CSV upload succeeds
- [ ] Data appears in calculator
- [ ] Calculations run
- [ ] Results display correctly
- [ ] Can export data
- [ ] All pages accessible

---

## 🎉 **You're Ready!**

**Open the full app now:**
```
http://localhost:3001
```

**You should see:**
1. ✅ Auto-login toast message
2. ✅ Dashboard with navigation
3. ✅ All features accessible
4. ✅ No login required!

**Test the complete workflow:**
1. Upload CSV
2. See data in calculator
3. Run calculations
4. View results
5. Export reports

---

## 🚀 **Quick Start Commands**

```bash
# Start backend
npm run dev:backend

# Start frontend (in new terminal)
cd frontend && npm run dev

# Open app
start http://localhost:3001

# Upload test file
# Use the upload page in the app!
```

---

**Your full emissions tracking application is ready to test!** 🌱

No login, no database setup, just upload and calculate! 🎉
