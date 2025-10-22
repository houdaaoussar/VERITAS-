# 🧪 Complete Local Testing Guide - VERITAS™

## 🚀 Quick Start - Test Everything Locally

### Step 1: Install Dependencies (if not done)

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Generate Prisma Client

```powershell
npx prisma generate
```

### Step 3: Start Backend

```powershell
# Option A: Start backend only
npm run dev:backend

# Backend will run on: http://localhost:3000
```

### Step 4: Start Frontend (in a new terminal)

```powershell
# Open a NEW PowerShell window
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

# Start frontend
npm run dev:frontend

# Frontend will run on: http://localhost:5173
```

### Step 5: Open in Browser

```
http://localhost:5173
```

---

## ✅ Complete Testing Checklist

### 1. **Test Backend Health**

```powershell
# Test if backend is running
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.1.0"}
```

### 2. **Test Frontend**

Open browser: `http://localhost:5173`

You should see the login page.

### 3. **Test Login**

Default credentials:
- **Email:** `admin@acme.com`
- **Password:** `password123`

### 4. **Test CSV Upload**

#### Option A: Use Test Endpoint (No Auth)

```powershell
# Create test CSV
@"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31
"@ | Out-File -FilePath test.csv -Encoding UTF8

# Upload it
curl -X POST http://localhost:3000/api/ingest/test -F "file=@test.csv"
```

#### Option B: Use Test HTML Page

```powershell
# Open the test upload page
start test-upload.html
```

Then:
1. Select your CSV file
2. Click Upload
3. See results!

#### Option C: Use Frontend Upload Page

1. Login to `http://localhost:5173`
2. Go to **Upload** page
3. Select CSV file
4. Upload

### 5. **Test Calculator**

1. Go to `http://localhost:5173/calculator`
2. You should see the emissions calculator
3. Data from CSV upload should appear here

### 6. **Test Estimation Feature (NEW!)**

```
http://localhost:5173/reporting/period123/estimation
```

Replace `period123` with an actual period ID.

---

## 🔧 Run Both Backend & Frontend Together

### Option 1: Single Command (Recommended)

```powershell
# Run both backend and frontend together
npm run dev
```

This starts:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

### Option 2: Separate Terminals

**Terminal 1 (Backend):**
```powershell
npm run dev:backend
```

**Terminal 2 (Frontend):**
```powershell
npm run dev:frontend
```

---

## 📋 Test All Features

### ✅ 1. Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Token refresh works

### ✅ 2. Dashboard
- [ ] Dashboard loads
- [ ] Shows emission data
- [ ] Charts display

### ✅ 3. CSV Upload
- [ ] File upload works
- [ ] CSV parsing works
- [ ] Data appears in calculator

### ✅ 4. Calculator
- [ ] Calculator page loads
- [ ] Can input data manually
- [ ] Calculations work
- [ ] Results display

### ✅ 5. Activities
- [ ] Activities page loads
- [ ] Can view activities
- [ ] Can create activity
- [ ] Can edit activity
- [ ] Can delete activity

### ✅ 6. Sites
- [ ] Sites page loads
- [ ] Can create site
- [ ] Can edit site
- [ ] Can delete site

### ✅ 7. Reports
- [ ] Reports page loads
- [ ] Can generate report
- [ ] Can export data

### ✅ 8. Estimation Inputs (NEW!)
- [ ] Estimation page loads
- [ ] Can input estimation data
- [ ] Preview calculations work
- [ ] Save works
- [ ] Results display

---

## 🧪 Automated Test Script

Save this as `test-all.ps1`:

```powershell
# Complete Local Testing Script

Write-Host "🧪 Starting Complete Local Tests..." -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "`n1️⃣ Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health"
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Start it with: npm run dev:backend" -ForegroundColor Yellow
    exit 1
}

# Test 2: Frontend
Write-Host "`n2️⃣ Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
    Write-Host "   ✅ Frontend is running!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend is not running!" -ForegroundColor Red
    Write-Host "   Start it with: npm run dev:frontend" -ForegroundColor Yellow
}

# Test 3: API Endpoints
Write-Host "`n3️⃣ Testing API Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/api/health",
    "/api/sites/test",
    "/api/periods/test"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000$endpoint"
        Write-Host "   ✅ $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $endpoint" -ForegroundColor Red
    }
}

# Test 4: CSV Upload
Write-Host "`n4️⃣ Testing CSV Upload..." -ForegroundColor Yellow

# Create test CSV
$csvContent = @"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31
"@
$csvContent | Out-File -FilePath "test_auto.csv" -Encoding UTF8

try {
    $form = @{ file = Get-Item "test_auto.csv" }
    $upload = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/test" -Method Post -Form $form
    Write-Host "   ✅ CSV Upload works!" -ForegroundColor Green
    Write-Host "   Rows imported: $($upload.rows_imported)" -ForegroundColor White
    
    # Clean up
    Remove-Item "test_auto.csv" -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ❌ CSV Upload failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Testing Complete!" -ForegroundColor Cyan
Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Login: admin@acme.com / password123" -ForegroundColor White
```

Run it:
```powershell
.\test-all.ps1
```

---

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:3000 | API server |
| **Health Check** | http://localhost:3000/health | Backend health |
| **API Docs** | http://localhost:3000/api/health | API status |
| **Test Upload** | Open `test-upload.html` | CSV upload test |

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | password123 |
| Editor | editor@acme.com | password123 |
| Viewer | viewer@acme.com | password123 |

---

## 📝 Test Data

### Test CSV File

```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
Business Travel,HQ,5000,km,2024-01-01,2024-01-31,Employee flights
Waste,Main Office,2.5,tonnes,2024-01-01,2024-01-31,Office waste
```

Save as `test_emissions.csv` and upload!

---

## 🐛 Troubleshooting

### Backend won't start

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Try again
npm run dev:backend
```

### Frontend won't start

```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F

# Try again
npm run dev:frontend
```

### CSV Upload fails

1. **Check backend is running:** `curl http://localhost:3000/health`
2. **Check file format:** Must be `.csv`, `.xlsx`, or `.xls`
3. **Check file size:** Must be < 100MB
4. **Use test endpoint:** `curl -X POST http://localhost:3000/api/ingest/test -F "file=@test.csv"`

### Login fails

1. **Check backend is running**
2. **Use correct credentials:** `admin@acme.com` / `password123`
3. **Clear browser cache**
4. **Check browser console** (F12) for errors

---

## 🎯 Quick Test Commands

```powershell
# Start everything
npm run dev

# Test backend
curl http://localhost:3000/health

# Test CSV upload
curl -X POST http://localhost:3000/api/ingest/test -F "file=@test.csv"

# Open frontend
start http://localhost:5173

# Open test upload page
start test-upload.html
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Backend shows: `🚀 Co-Lab VERITAS™ API Server running on port 3000`
2. ✅ Frontend shows: `VITE v... ready in ... ms`
3. ✅ Browser opens to login page
4. ✅ Can login successfully
5. ✅ Can upload CSV file
6. ✅ Data appears in calculator
7. ✅ All pages load without errors

---

## 🚀 You're Ready!

Your local testing environment is now set up. Test all features before deploying to AWS!

**Happy Testing! 🎉**
