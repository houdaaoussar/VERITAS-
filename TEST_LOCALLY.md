# 🧪 Test Locally - Step by Step Guide

## ⚠️ Important: Run from Correct Directory

Make sure you're in the **HoudaProject** directory, not the parent folder!

```powershell
# Navigate to the correct directory
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
```

---

## 🚀 Quick Start (3 Commands)

### Step 1: Generate Prisma Client
```powershell
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Start Development Server
```powershell
npm run dev
```

**Expected Output:**
```
🚀 Co-Lab VERITAS™ API Server running on port 3002
✅ Database connected successfully
```

---

## 🌐 Access Your Application

Once the server is running:

- **Backend API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health
- **Frontend:** http://localhost:3001 (if running separately)

---

## 🧪 Test the Fixes

### 1. Test Health Endpoint

Open a new terminal and run:
```powershell
curl http://localhost:3002/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T00:00:00.000Z",
  "version": "1.1.0",
  "name": "Co-Lab VERITAS™"
}
```

### 2. Test Database Connection

Check the server logs for:
```
✅ Database connected successfully
```

If you see this, database connection is working!

### 3. Test File Upload (via UI)

1. Start the frontend (if not already running):
   ```powershell
   cd frontend
   npm run dev
   ```

2. Open browser: http://localhost:3001
3. Navigate to uploads page
4. Upload a CSV file
5. Check if activities are imported

### 4. Test Estimation Feature

1. Navigate to: http://localhost:3001/reporting/[periodId]/estimation
2. Fill in estimation data:
   - Number of employees: 50
   - Average commute: 15 km
   - Workdays per year: 220
   - Transport splits: 70% car, 20% public, 10% walk
3. Click "Calculate"
4. Check results display correctly

---

## 🔍 Verify Fixes Are Working

### ✅ Database Connection
- [ ] Server starts without errors
- [ ] Logs show "Database connected successfully"
- [ ] No Prisma client errors

### ✅ File Upload
- [ ] Can upload CSV files
- [ ] Can upload Excel files
- [ ] Files are parsed correctly
- [ ] Activities imported to database

### ✅ Estimation Feature
- [ ] Can access estimation page
- [ ] Can save estimation data
- [ ] Calculations return results
- [ ] Results display correctly

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '../config/database'"

**Solution:**
```powershell
npm run build
npm run dev
```

### Issue: "Port 3002 already in use"

**Solution:**
```powershell
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
# PORT=3003
```

### Issue: "Database connection failed"

**Check:**
1. Is `.env` file configured correctly?
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/houdaproject?retryWrites=true&w=majority"
   ```

2. Is MongoDB Atlas cluster running?
3. Is your IP address whitelisted?
4. Are credentials correct?

**Temporary Solution (Test without database):**
```env
# In .env file
USE_DATABASE=false
```

### Issue: "Prisma Client validation error"

**Solution:**
```powershell
# Make sure you're in HoudaProject directory
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

# Regenerate
npx prisma generate
```

---

## 📊 Test API Endpoints with curl

### Health Check
```powershell
curl http://localhost:3002/health
```

### Get Customers (requires auth)
```powershell
curl http://localhost:3002/api/customers `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Save Estimation Data
```powershell
curl -X POST http://localhost:3002/api/estimations `
  -H "Content-Type: application/json" `
  -d '{
    "customerId": "test123",
    "reportingPeriodId": "period123",
    "createdBy": "user123",
    "numberOfEmployees": 50,
    "avgCommuteKm": 15,
    "avgWorkdaysPerYear": 220,
    "transportSplitCar": 70,
    "transportSplitPublic": 20,
    "transportSplitWalk": 10
  }'
```

### Calculate Estimations
```powershell
curl -X POST http://localhost:3002/api/estimations/test123/period123/calculate
```

---

## 🎯 Complete Test Workflow

### Full Stack Testing

1. **Start Backend:**
   ```powershell
   # Terminal 1
   cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
   npm run dev
   ```

2. **Start Frontend:**
   ```powershell
   # Terminal 2
   cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject\frontend"
   npm run dev
   ```

3. **Test in Browser:**
   - Open: http://localhost:3001
   - Login with test credentials
   - Upload a CSV file
   - Navigate to estimation page
   - Enter data and calculate
   - Check reports

---

## 📝 Sample Test Data

### Sample CSV for Upload
Create `test_data.csv`:
```csv
Inventory Year,CRF Sector,Scope,Fuel Type or Activity,Activity Data Amount,Activity Data Unit
2024,Energy,Scope 1,Natural Gas,1000,kWh
2024,Energy,Scope 2,Electricity,5000,kWh
2024,Transport,Scope 1,Diesel,500,liters
```

### Sample Estimation Data
```json
{
  "customerId": "test-customer-id",
  "reportingPeriodId": "test-period-id",
  "createdBy": "test-user-id",
  "numberOfEmployees": 50,
  "avgCommuteKm": 15,
  "avgWorkdaysPerYear": 220,
  "transportSplitCar": 70,
  "transportSplitPublic": 20,
  "transportSplitWalk": 10,
  "businessTravelSpendGBP": 50000,
  "numberOfFlights": 20,
  "avgFlightDistanceKm": 1500,
  "annualSpendGoodsGBP": 100000,
  "annualSpendServicesGBP": 75000,
  "wasteTonnes": 5.5,
  "wasteRecycledPercent": 30,
  "confidenceLevel": "MEDIUM"
}
```

---

## ✅ Success Checklist

- [ ] Prisma client generated successfully
- [ ] Server starts on port 3002
- [ ] Database connection established
- [ ] Health endpoint returns 200 OK
- [ ] Can upload CSV files
- [ ] Can access estimation page
- [ ] Calculations return results
- [ ] No errors in server logs

---

## 🎉 You're Ready!

Once all tests pass, your application is working correctly with:
- ✅ Fixed database connections
- ✅ Working file uploads
- ✅ Functional estimation feature

**Happy Testing! 🚀**

---

## 📞 Need Help?

If you encounter issues:
1. Check server logs for detailed errors
2. Verify you're in the correct directory
3. Ensure `.env` is configured
4. Try regenerating Prisma client
5. Restart the server

See `DATABASE_UPLOAD_ESTIMATION_FIXES.md` for detailed troubleshooting.
