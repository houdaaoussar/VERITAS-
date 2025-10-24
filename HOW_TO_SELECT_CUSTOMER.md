# 🎯 How to Select Customer & Reporting Period

## Problem
You see "Select a customer..." but the dropdown is empty because **no customers exist yet**.

---

## ✅ Solution: Create Test Data

### Step 1: Run the Seed Script

Open a **new terminal** and run:

```powershell
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
npx ts-node seed-test-data.ts
```

**This will create:**
- ✅ Test customer: "Test Company Ltd"
- ✅ Test user: test@example.com / Test123456
- ✅ Test sites: Headquarters & Manufacturing Plant
- ✅ Reporting periods: 2024 Annual & 2024 Q1
- ✅ Sample activities

---

## 🔐 Step 2: Login

1. Open browser: http://localhost:3001
2. Login with:
   - **Email:** `test@example.com`
   - **Password:** `Test123456`

---

## 📊 Step 3: Select Customer

After login, you should now see:
- **Customer dropdown:** "Test Company Ltd" will appear
- **Reporting Period dropdown:** "2024 Annual" and "2024 Q1" will appear

---

## 🎯 Alternative: Create Customer via API

If you prefer to create customers manually:

### Create Customer
```powershell
# First, login to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" `
  -Method POST `
  -Body '{"email":"test@example.com","password":"Test123456"}' `
  -ContentType "application/json"

$token = $loginResponse.accessToken

# Create customer
Invoke-RestMethod -Uri "http://localhost:3002/api/customers" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"} `
  -Body '{
    "name": "My Company",
    "code": "MYCO001",
    "category": "Technology",
    "level": "Enterprise"
  }' `
  -ContentType "application/json"
```

### Create Reporting Period
```powershell
# Get customer ID from previous response, then:
Invoke-RestMethod -Uri "http://localhost:3002/api/periods" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"} `
  -Body '{
    "customerId": "YOUR_CUSTOMER_ID",
    "fromDate": "2024-01-01",
    "toDate": "2024-12-31",
    "year": 2024,
    "status": "OPEN"
  }' `
  -ContentType "application/json"
```

---

## 🔍 Troubleshooting

### Issue: "No customers found"
**Solution:** Run the seed script:
```powershell
npx ts-node seed-test-data.ts
```

### Issue: "Cannot login"
**Solution:** The seed script creates the user. If it fails, create manually:
```powershell
curl -X POST http://localhost:3002/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "role": "ADMIN",
    "customerId": "YOUR_CUSTOMER_ID"
  }'
```

### Issue: "Dropdown still empty after seeding"
**Solutions:**
1. Refresh the browser page (Ctrl+R)
2. Clear browser cache
3. Check browser console for errors (F12)
4. Verify data was created:
   ```powershell
   curl http://localhost:3002/api/customers `
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 📋 Quick Start Checklist

- [ ] Backend server is running (port 3002)
- [ ] Frontend server is running (port 3001)
- [ ] Run seed script: `npx ts-node seed-test-data.ts`
- [ ] Login with test@example.com / Test123456
- [ ] Select "Test Company Ltd" from customer dropdown
- [ ] Select "2024 Annual" from period dropdown
- [ ] Start using the app!

---

## 🎉 What You Can Do After Setup

Once customer and period are selected:

1. **Upload Files**
   - Navigate to Uploads page
   - Upload CSV/Excel files
   - Parse and import activities

2. **Enter Estimation Data**
   - Navigate to Reporting → Estimation
   - Fill in employee commuting data
   - Fill in business travel data
   - Calculate emissions

3. **Run Calculations**
   - Navigate to Calculations page
   - Run calculation on imported activities
   - View results

4. **View Reports**
   - Navigate to Reports page
   - View emissions by scope
   - View emissions by category
   - Export data

---

## 💡 Pro Tip

Create multiple customers and periods for testing:

```powershell
# Run the seed script multiple times with different data
# Or modify seed-test-data.ts to create more test data
```

---

**Now you can select customers and start testing! 🚀**
