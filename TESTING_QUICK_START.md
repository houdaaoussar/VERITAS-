# 🚀 Testing Quick Start

## ⚡ 3 Ways to Test Everything

### Method 1: Automated Test Script (Fastest)
```powershell
# 1. Start the server
.\test-local.bat

# 2. Open new terminal and run tests
.\run-all-tests.ps1
```

### Method 2: Manual Full Test
Follow the complete guide:
```
📖 See: TEST_COMPLETE_APP.md
```

### Method 3: Quick Smoke Test
```powershell
# Start server
npm run dev

# Test health
curl http://localhost:3002/health

# Test estimation preview
curl -X POST http://localhost:3002/api/estimations/test/test/preview `
  -H "Content-Type: application/json" `
  -d '{"numberOfEmployees":50,"avgCommuteKm":15,"avgWorkdaysPerYear":220,"transportSplitCar":70,"transportSplitPublic":20,"transportSplitWalk":10}'
```

---

## 📋 What Gets Tested

### ✅ Backend API
- Health endpoints
- Authentication
- Customer management
- Site management
- Reporting periods
- **Estimation feature** ⭐
- File uploads
- Calculations
- Reporting

### ✅ Frontend UI (Manual)
- Login page
- Dashboard
- Upload page
- Activities page
- **Estimation page** ⭐
- Calculations page
- Reports page

---

## 🎯 Key Features to Test

### 1. File Upload
```
Upload → Parse → Import → Verify Activities
```

### 2. Estimation Feature (NEW!)
```
Enter Data → Preview → Save → Calculate → View Results
```

### 3. Calculation Engine
```
Activities → Run Calculation → View Results → Generate Report
```

---

## ✅ Success Checklist

Quick checklist for testing:

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Database connects successfully
- [ ] Can login/authenticate
- [ ] Can upload CSV file
- [ ] Can upload Excel file
- [ ] File parsing works
- [ ] Activities imported
- [ ] **Estimation preview works** ⭐
- [ ] **Estimation save works** ⭐
- [ ] **Estimation calculations correct** ⭐
- [ ] Calculation engine runs
- [ ] Reports display data
- [ ] Frontend UI loads
- [ ] No console errors

---

## 🐛 Quick Troubleshooting

### Server won't start
```powershell
# Check if port is in use
netstat -ano | findstr :3002

# Kill process if needed
taskkill /PID <PID> /F
```

### Database connection fails
```
Check .env file:
DATABASE_URL="mongodb+srv://..."
```

### Estimation calculations return 0
```
1. Check emission factors are seeded
2. Verify input data is valid
3. Check server logs
```

### File upload fails
```
1. Check uploads folder exists
2. Verify file size < 10MB
3. Check file format (CSV/Excel)
```

---

## 📖 Full Documentation

- **`TEST_COMPLETE_APP.md`** - Complete testing guide
- **`TEST_LOCALLY.md`** - Local setup guide
- **`DATABASE_UPLOAD_ESTIMATION_FIXES.md`** - All fixes explained
- **`ESTIMATION_FEATURE_GUIDE.md`** - Estimation feature details

---

## 🎉 Ready to Test!

**Quick Start:**
1. Run `.\test-local.bat` to start server
2. Run `.\run-all-tests.ps1` to test APIs
3. Open browser to test UI
4. Check `TEST_COMPLETE_APP.md` for detailed tests

**All fixes are applied and ready to test! 🚀**
