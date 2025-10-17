# 🚀 Quick Start Guide - Full Application

## ✅ Application is Running!

### 🌐 Access the Application

**Frontend (UI):** http://localhost:3001

**Backend (API):** http://localhost:3002

---

## 📋 How to Test the Ingest Feature

### Step 1: Open the Application
Click the browser preview or go to: **http://localhost:3001**

### Step 2: Login (Auto-login enabled)
The app should automatically log you in as a demo admin user.

If you need to login manually:
- Email: `test@test.com`
- Password: `test123`

### Step 3: Navigate to Emissions Inventory
Look for the **"Emissions Inventory"** or **"Upload"** section in the sidebar/menu.

### Step 4: Upload the Sample File
1. Select the file: `sample_emissions_data.csv`
2. Choose a site (if required)
3. Choose a reporting period (if required)
4. Click Upload

### Step 5: View Results
You should see:
- ✅ 5 rows imported successfully
- Column mappings displayed
- Processed emission data

---

## 🧪 Alternative: Test API Directly (No UI)

If you prefer to test just the API without the UI:

### Test Endpoint (No Authentication)
```
POST http://localhost:3002/api/ingest/test
```

**Using PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File test-ingest-no-auth.ps1
```

**Using Postman/Thunder Client:**
- Method: POST
- URL: http://localhost:3002/api/ingest/test
- Body: form-data
  - Key: `file`
  - Value: Select `sample_emissions_data.csv`

---

## 📊 What's Running

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3001 | ✅ Running |
| Backend API | http://localhost:3002 | ✅ Running |
| Health Check | http://localhost:3002/health | ✅ Available |
| Test Endpoint | http://localhost:3002/api/ingest/test | ✅ Available |

---

## 🔧 Troubleshooting

### Frontend not loading?
```powershell
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Restart the app
npm run dev
```

### Backend not responding?
```powershell
# Check if port 3002 is in use
netstat -ano | findstr :3002

# Restart the backend
npm run dev:backend
```

### Need to restart everything?
```powershell
# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# Start fresh
npm run dev
```

---

## 📁 Test Files Available

1. **sample_emissions_data.csv** - 5 rows of emission data
2. **sample_emissions_inventory.csv** - Larger sample file
3. **example_messy_format.csv** - Test file with messy column names

---

## 🎯 Next Steps

1. ✅ Open http://localhost:3001 in your browser
2. ✅ Navigate to the Emissions Inventory page
3. ✅ Upload `sample_emissions_data.csv`
4. ✅ View the intelligent mapping and results!

---

**Enjoy testing your intelligent CSV/Excel ingest system!** 🎉
