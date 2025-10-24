# 🧪 Complete Application Testing Guide

## 📋 Overview

This guide will help you test **all features** of the HoudaProject application:
- ✅ Backend API
- ✅ Frontend UI
- ✅ Database Connection
- ✅ File Upload (CSV/Excel)
- ✅ Estimation Feature
- ✅ Calculation Engine
- ✅ Reporting & Analytics

---

## 🚀 Step 1: Start the Application

### Option A: Full Stack (Backend + Frontend)

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
npx prisma generate
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject\frontend"
npm install
npm run dev
```

### Option B: Backend Only (API Testing)

```powershell
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
npx prisma generate
npm run dev
```

---

## ✅ Step 2: Verify Backend is Running

### Test 1: Health Check
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

### Test 2: Check Server Logs
Look for these messages:
```
✅ Database connected successfully
🚀 Co-Lab VERITAS™ API Server running on port 3002
📊 Health check: http://localhost:3002/health
```

---

## 🧪 Step 3: Test Authentication

### Create a Test User (First Time Setup)

```powershell
# Run the user creation script
node create-test-user.ts
```

Or manually via API:
```powershell
curl -X POST http://localhost:3002/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "role": "ADMIN",
    "customerId": "test-customer-id"
  }'
```

### Login and Get Token

```powershell
curl -X POST http://localhost:3002/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Save the `accessToken` from the response - you'll need it for other tests!**

---

## 📊 Step 4: Test Customer Management

### Create a Customer

```powershell
curl -X POST http://localhost:3002/api/customers `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "name": "Test Company Ltd",
    "code": "TEST001",
    "category": "Manufacturing",
    "level": "Enterprise"
  }'
```

**Save the customer ID from the response!**

### Get All Customers

```powershell
curl http://localhost:3002/api/customers `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🏢 Step 5: Test Site Management

### Create a Site

```powershell
curl -X POST http://localhost:3002/api/sites `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "name": "Headquarters",
    "country": "UK",
    "city": "London",
    "address": "123 Test Street"
  }'
```

**Save the site ID!**

### Get All Sites

```powershell
curl http://localhost:3002/api/sites?customerId=YOUR_CUSTOMER_ID `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📅 Step 6: Test Reporting Period

### Create a Reporting Period

```powershell
curl -X POST http://localhost:3002/api/periods `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "year": 2024,
    "quarter": null,
    "status": "OPEN"
  }'
```

**Save the period ID!**

---

## 📤 Step 7: Test File Upload (CSV/Excel)

### Prepare Test CSV File

Create `test_emissions.csv`:
```csv
Inventory Year,CRF Sector,Scope,Fuel Type or Activity,Activity Data Amount,Activity Data Unit
2024,Energy,Scope 1,Natural Gas,1000,kWh
2024,Energy,Scope 2,Electricity,5000,kWh
2024,Transport,Scope 1,Diesel,500,liters
2024,Energy,Scope 1,LPG,200,kWh
```

### Upload the File

```powershell
curl -X POST http://localhost:3002/api/uploads `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -F "file=@test_emissions.csv" `
  -F "customerId=YOUR_CUSTOMER_ID" `
  -F "siteId=YOUR_SITE_ID" `
  -F "periodId=YOUR_PERIOD_ID"
```

**Save the upload ID from the response!**

### Parse the Uploaded File

```powershell
curl -X POST http://localhost:3002/api/uploads/YOUR_UPLOAD_ID/parse `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{}'
```

### Import Parsed Data

```powershell
curl -X POST http://localhost:3002/api/uploads/YOUR_UPLOAD_ID/import `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "periodId": "YOUR_PERIOD_ID"
  }'
```

---

## 📊 Step 8: Test Activities

### Get All Activities

```powershell
curl http://localhost:3002/api/activities?periodId=YOUR_PERIOD_ID `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Manual Activity

```powershell
curl -X POST http://localhost:3002/api/activities `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "siteId": "YOUR_SITE_ID",
    "periodId": "YOUR_PERIOD_ID",
    "type": "ELECTRICITY",
    "quantity": 1000,
    "unit": "kWh",
    "activityDateStart": "2024-01-01",
    "activityDateEnd": "2024-01-31",
    "source": "MANUAL_ENTRY"
  }'
```

---

## 🧮 Step 9: Test Calculation Engine

### Run Calculation

```powershell
curl -X POST http://localhost:3002/api/calc/runs `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "periodId": "YOUR_PERIOD_ID",
    "factorLibraryVersion": "DEFRA-2025.1"
  }'
```

**Save the calculation run ID!**

### Get Calculation Results

```powershell
curl http://localhost:3002/api/calc/runs/YOUR_CALC_RUN_ID `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📈 Step 10: Test Estimation Feature (NEW!)

### Save Estimation Data

```powershell
curl -X POST http://localhost:3002/api/estimations `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "reportingPeriodId": "YOUR_PERIOD_ID",
    "createdBy": "YOUR_USER_ID",
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
    "confidenceLevel": "MEDIUM",
    "notes": "Q1 2024 estimates"
  }'
```

### Calculate Estimations

```powershell
curl -X POST http://localhost:3002/api/estimations/YOUR_CUSTOMER_ID/YOUR_PERIOD_ID/calculate `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "estimations": [
    {
      "category": "Employee Commuting",
      "scope": "SCOPE_3",
      "estimatedKgCo2e": 56430.6,
      "confidenceLevel": "MEDIUM",
      "methodology": "Distance-based calculation using DEFRA 2025 emission factors"
    },
    {
      "category": "Business Travel",
      "scope": "SCOPE_3",
      "estimatedKgCo2e": 32376.1,
      "confidenceLevel": "MEDIUM"
    }
  ],
  "totalKgCo2e": 88806.7,
  "totalTonnesCo2e": 88.81
}
```

### Preview Estimations (Without Saving)

```powershell
curl -X POST http://localhost:3002/api/estimations/YOUR_CUSTOMER_ID/YOUR_PERIOD_ID/preview `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{
    "numberOfEmployees": 100,
    "avgCommuteKm": 20,
    "avgWorkdaysPerYear": 220,
    "transportSplitCar": 60,
    "transportSplitPublic": 30,
    "transportSplitWalk": 10
  }'
```

### Get Saved Estimation Data

```powershell
curl http://localhost:3002/api/estimations/YOUR_CUSTOMER_ID/YOUR_PERIOD_ID `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Step 11: Test Reporting & Analytics

### Get Emissions Overview

```powershell
curl "http://localhost:3002/api/reporting/overview?customerId=YOUR_CUSTOMER_ID&periodId=YOUR_PERIOD_ID" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Emissions by Scope

```powershell
curl "http://localhost:3002/api/reporting/by-scope?customerId=YOUR_CUSTOMER_ID&periodId=YOUR_PERIOD_ID" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Emissions by Category

```powershell
curl "http://localhost:3002/api/reporting/by-category?customerId=YOUR_CUSTOMER_ID&periodId=YOUR_PERIOD_ID" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🌐 Step 12: Test Frontend UI (If Running)

Open your browser and navigate to: **http://localhost:3001**

### Test Flow:

1. **Login**
   - Email: `test@example.com`
   - Password: `Test123456`

2. **Dashboard**
   - ✅ View emissions summary
   - ✅ Check charts and graphs
   - ✅ Verify data displays correctly

3. **Upload Page**
   - ✅ Upload CSV file
   - ✅ Upload Excel file
   - ✅ Verify file parsing
   - ✅ Check import success

4. **Activities Page**
   - ✅ View imported activities
   - ✅ Create manual activity
   - ✅ Edit activity
   - ✅ Delete activity

5. **Estimation Page** (NEW!)
   - Navigate to: `/reporting/[periodId]/estimation`
   - ✅ Fill in employee commuting data
   - ✅ Fill in business travel data
   - ✅ Fill in purchased goods data
   - ✅ Fill in waste data
   - ✅ Click "Preview" to see calculations
   - ✅ Click "Save" to store data
   - ✅ Click "Calculate" to get final results
   - ✅ Verify results display correctly

6. **Calculations Page**
   - ✅ Run new calculation
   - ✅ View calculation results
   - ✅ Check emission factors used

7. **Reports Page**
   - ✅ View emissions by scope
   - ✅ View emissions by category
   - ✅ Export reports
   - ✅ Check charts render correctly

---

## ✅ Testing Checklist

### Backend Tests
- [ ] Health endpoint returns 200 OK
- [ ] Database connection successful
- [ ] Authentication works (login/register)
- [ ] Customer CRUD operations work
- [ ] Site CRUD operations work
- [ ] Period CRUD operations work
- [ ] File upload works (CSV)
- [ ] File upload works (Excel)
- [ ] File parsing works correctly
- [ ] Activities imported successfully
- [ ] Manual activity creation works
- [ ] Calculation engine runs successfully
- [ ] Calculation results are correct
- [ ] **Estimation data saves correctly** ✨
- [ ] **Estimation calculations work** ✨
- [ ] **Estimation preview works** ✨
- [ ] Reporting endpoints return data
- [ ] All API endpoints respond correctly

### Frontend Tests (If Available)
- [ ] Login page works
- [ ] Dashboard displays data
- [ ] Upload page accepts files
- [ ] Activities page shows data
- [ ] **Estimation page loads** ✨
- [ ] **Estimation form validates input** ✨
- [ ] **Estimation calculations display** ✨
- [ ] Calculations page works
- [ ] Reports page renders charts
- [ ] Navigation works correctly
- [ ] No console errors

### Database Tests
- [ ] Data persists after server restart
- [ ] Relationships work correctly
- [ ] **EstimationInput model works** ✨
- [ ] Queries execute successfully
- [ ] No connection leaks

---

## 🎯 Expected Results

### Successful Test Indicators:

1. **Backend:**
   - ✅ All API endpoints return 200/201 status
   - ✅ No errors in server logs
   - ✅ Database operations succeed
   - ✅ Calculations produce results
   - ✅ **Estimations calculate correctly**

2. **Frontend:**
   - ✅ All pages load without errors
   - ✅ Forms submit successfully
   - ✅ Data displays correctly
   - ✅ Charts render properly
   - ✅ **Estimation feature fully functional**

3. **Integration:**
   - ✅ File upload → Parse → Import flow works
   - ✅ Activity → Calculation → Report flow works
   - ✅ **Estimation → Calculation → Report flow works**
   - ✅ Data consistency across features

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
1. Check `.env` file has correct `DATABASE_URL`
2. Verify MongoDB Atlas is running
3. Check IP whitelist
4. Test connection: `npx prisma db push`

### Issue: "File upload fails"
**Solution:**
1. Check `uploads` folder exists
2. Verify file size < 10MB
3. Check file format (CSV or Excel)
4. Review server logs for errors

### Issue: "Estimation calculations return 0"
**Solution:**
1. Verify emission factors are seeded
2. Check input data is valid
3. Review calculation methodology
4. Check server logs for errors

### Issue: "Frontend can't connect to backend"
**Solution:**
1. Verify backend is running on port 3002
2. Check CORS settings in `.env`
3. Update frontend API URL if needed
4. Check browser console for errors

---

## 📊 Performance Testing

### Load Test (Optional)

Test with multiple concurrent requests:

```powershell
# Install artillery (if not installed)
npm install -g artillery

# Create test config
artillery quick --count 10 --num 50 http://localhost:3002/health
```

---

## 📝 Test Results Template

Create a file to track your test results:

```markdown
# Test Results - [Date]

## Backend API
- Health Check: ✅/❌
- Authentication: ✅/❌
- Customer Management: ✅/❌
- Site Management: ✅/❌
- File Upload: ✅/❌
- Activities: ✅/❌
- Calculations: ✅/❌
- **Estimations: ✅/❌**
- Reporting: ✅/❌

## Frontend UI
- Login: ✅/❌
- Dashboard: ✅/❌
- Upload: ✅/❌
- Activities: ✅/❌
- **Estimations: ✅/❌**
- Calculations: ✅/❌
- Reports: ✅/❌

## Issues Found
1. [Issue description]
2. [Issue description]

## Notes
[Any additional observations]
```

---

## 🎉 Success Criteria

Your application is fully working when:

✅ All backend endpoints respond correctly  
✅ File uploads process successfully  
✅ Calculations produce accurate results  
✅ **Estimation feature calculates emissions correctly**  
✅ Reports display data properly  
✅ No errors in server or browser logs  
✅ Data persists across server restarts  
✅ Frontend UI is responsive and functional  

---

## 📞 Next Steps

After testing:

1. **Document any issues found**
2. **Review test results**
3. **Fix any bugs discovered**
4. **Re-test fixed features**
5. **Prepare for deployment**

---

## 🚀 Ready for Production?

Once all tests pass:
- ✅ Update `.env` with production credentials
- ✅ Run `npm run build`
- ✅ Deploy to AWS/Amplify
- ✅ Test production environment
- ✅ Monitor logs and performance

---

**Happy Testing! 🧪**

For detailed troubleshooting, see:
- `DATABASE_UPLOAD_ESTIMATION_FIXES.md`
- `TROUBLESHOOTING_CSV_UPLOAD.md`
- `ESTIMATION_FEATURE_GUIDE.md`
