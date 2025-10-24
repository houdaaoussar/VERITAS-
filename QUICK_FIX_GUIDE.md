# 🚀 Quick Fix Guide - Get Running in 3 Steps

## ⚡ Fast Track (3 Steps)

### Step 1: Run the Fix Script
```powershell
.\fix-and-start.ps1
```

This will:
- ✅ Regenerate Prisma client
- ✅ Check dependencies
- ✅ Verify .env configuration
- ✅ Start the server

### Step 2: Verify Database Connection
Check your `.env` file has the correct database URL:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/houdaproject?retryWrites=true&w=majority"
```

### Step 3: Test the Fixes
```bash
# Test health endpoint
curl http://localhost:3002/health

# Test estimation endpoint
curl http://localhost:3002/api/estimations/test/test
```

---

## 🔧 What Was Fixed?

### 1. Database Connection ✅
- **Before:** Multiple Prisma instances causing connection issues
- **After:** Single centralized database client with error handling

### 2. File Upload ✅
- **Before:** Missing Prisma imports, upload failures
- **After:** Proper imports, working file uploads

### 3. Estimation Feature ✅
- **Before:** Schema relationships commented out, feature broken
- **After:** Full estimation feature working with calculations

---

## 📝 Manual Steps (If Script Fails)

### Option A: Development Mode
```bash
npx prisma generate
npm install
npm run dev
```

### Option B: Production Mode
```bash
npx prisma generate
npm install
npm run build
npm start
```

---

## 🧪 Test Your Fixes

### 1. Test File Upload
```bash
# Upload a CSV file
curl -X POST http://localhost:3002/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample_emissions_data.csv" \
  -F "customerId=YOUR_CUSTOMER_ID"
```

### 2. Test Estimation Feature
```bash
# Save estimation data
curl -X POST http://localhost:3002/api/estimations \
  -H "Content-Type: application/json" \
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

# Calculate estimations
curl -X POST http://localhost:3002/api/estimations/test123/period123/calculate
```

### 3. Test Database Connection
```bash
# Check if server connects to database
# Look for this in server logs:
# ✅ Database connected successfully
```

---

## ❌ Common Issues & Solutions

### Issue: "Cannot find module '../config/database'"
**Solution:**
```bash
npm run build
```

### Issue: "Prisma Client validation error"
**Solution:**
```bash
npx prisma generate
```

### Issue: "Database connection failed"
**Solution:**
1. Check `.env` file
2. Verify MongoDB Atlas is running
3. Check IP whitelist
4. Verify credentials

### Issue: "Port 3002 already in use"
**Solution:**
```powershell
# Find and kill the process
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

---

## 📊 Server Endpoints

### Health Check
```
GET http://localhost:3002/health
```

### Estimation Endpoints
```
GET    /api/estimations/:customerId/:periodId
POST   /api/estimations
POST   /api/estimations/:customerId/:periodId/calculate
POST   /api/estimations/:customerId/:periodId/preview
DELETE /api/estimations/:customerId/:periodId
```

### Upload Endpoints
```
GET    /api/uploads
POST   /api/uploads
POST   /api/uploads/:id/parse
POST   /api/uploads/:id/import
DELETE /api/uploads/:id
```

---

## 📖 Full Documentation

For detailed information, see:
- `DATABASE_UPLOAD_ESTIMATION_FIXES.md` - Complete fix documentation
- `ESTIMATION_FEATURE_GUIDE.md` - Estimation feature usage
- `TROUBLESHOOTING_CSV_UPLOAD.md` - Upload troubleshooting

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Server starts without errors
2. ✅ Database connection logs show success
3. ✅ Health endpoint returns 200 OK
4. ✅ File uploads work
5. ✅ Estimation calculations return results
6. ✅ No Prisma client errors in logs

---

## 🎯 Next Steps

After fixes are working:

1. **Test file uploads** with your CSV/Excel files
2. **Try estimation feature** with sample data
3. **Run calculations** on imported activities
4. **Check reports** are generating correctly
5. **Deploy to production** when ready

---

**Need Help?**
- Check server logs for detailed errors
- Review `DATABASE_UPLOAD_ESTIMATION_FIXES.md`
- Verify `.env` configuration
- Ensure database is accessible

---

**Status:** ✅ All fixes applied and ready to test!
