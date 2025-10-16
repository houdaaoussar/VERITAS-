# 🔧 CSV Upload Troubleshooting

## ❌ Common Errors & Solutions

### Error 1: "Upload Failed" or "Network Error"

**Symptoms:**
- File upload doesn't work
- Network error in console
- CORS error

**Solutions:**

1. **Check Backend is Running:**
```bash
# Backend should be on port 3002
curl http://localhost:3002/health
```

2. **Check CORS Settings:**
Your backend CORS is set to: `http://localhost:3001`
Your frontend runs on: `http://localhost:3002`

**Fix:** Update CORS in `.env`:
```
CORS_ORIGIN=http://localhost:3002
```

Or update `src/server-simple.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
```

3. **Check Authentication:**
Make sure you're logged in and token is valid.

---

### Error 2: "No valid rows found"

**Cause:** Column names don't match expected patterns

**Solution:**

1. **Check your CSV headers** match these patterns:
   - Year: "Inventory Year", "Year", "year"
   - Sector: "CRF Sector", "Sector", "sector"
   - Scope: "Scope", "scope"
   - Activity: "Fuel Type or Activity", "Activity", "Fuel Type"
   - Amount: "Activity Data Amount", "Amount", "Quantity"
   - Unit: "Activity Data Unit", "Unit"

2. **Use the template:**
   Copy `sample_emissions_template.csv` and fill with your data

3. **Test column detection:**
```bash
# After upload, check what columns were detected
GET /api/emissions-inventory/{uploadId}/column-detection
```

---

### Error 3: "Activity type is required"

**Cause:** Fuel/Activity column not recognized

**Supported Activity Types:**
- Electricity, Electric, Power
- Natural Gas, Gas
- Diesel, Diesel Oil
- Petrol, Gasoline
- Kerosene
- LPG (Liquefied Petroleum Gas)
- Coal
- District Heating
- District Cooling
- Biomass, Wood
- Biogas, Biofuel

**Solution:**
Use one of the supported names, or add your custom type to the mapping.

---

### Error 4: "Unit is required when quantity is provided"

**Cause:** Missing or empty unit column

**Supported Units:**
- Energy: kWh, MWh, GJ
- Volume: m³, liters, L, gallons
- Mass: kg, tonnes, tons
- Distance: km, miles

**Solution:**
Add unit column with appropriate values.

---

### Error 5: "Invalid inventory year"

**Cause:** Year column has non-numeric or invalid values

**Valid Years:** 1900-2100

**Solution:**
- Use 4-digit year: 2024
- Don't use: "2024-01-01", "FY2024", "Year 2024"
- Just: "2024"

---

## 🧪 Testing Steps

### 1. Test Backend Health
```bash
curl http://localhost:3002/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-16T...",
  "version": "1.1.0"
}
```

### 2. Test Authentication
```bash
# Login first
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

**Expected:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...}
}
```

### 3. Test File Upload
```bash
curl -X POST http://localhost:3002/api/emissions-inventory/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample_emissions_template.csv" \
  -F "customerId=YOUR_CUSTOMER_ID" \
  -F "autoCreate=true"
```

**Expected:**
```json
{
  "uploadId": "...",
  "filename": "sample_emissions_template.csv",
  "status": "uploaded"
}
```

---

## 🔍 Debug Mode

### Enable Detailed Logging

1. **Backend Console:**
Watch for these logs:
```
📨 POST /api/emissions-inventory/upload
✅ Emissions inventory file uploaded
```

2. **Frontend Console (F12):**
Check Network tab for:
- Request URL
- Request Headers (Authorization token?)
- Response status (200, 401, 500?)
- Response body (error message?)

---

## 📝 Quick Fixes

### Fix 1: Update CORS for Local Development
```typescript
// src/server-simple.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002'
  ],
  credentials: true
}));
```

### Fix 2: Update Frontend API URL
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:3002';
```

### Fix 3: Check Environment Variables
```bash
# .env file
DATABASE_URL="your-mongodb-url"
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN="http://localhost:3002"
PORT=3002
```

---

## ✅ Verification Checklist

Before uploading CSV:
- [ ] Backend running on port 3002
- [ ] Frontend running on port 3002 (or 3001)
- [ ] Logged in successfully
- [ ] CORS allows your frontend origin
- [ ] CSV has proper headers
- [ ] CSV has data rows
- [ ] File size < 10MB

---

## 🎯 Still Not Working?

1. **Check browser console** (F12) for errors
2. **Check backend terminal** for error logs
3. **Try the sample template** first
4. **Test with curl** to isolate frontend vs backend issues
5. **Check MongoDB connection** - backend needs database

---

## 📞 Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "No file uploaded" | File not attached | Check form data |
| "Access denied" | Wrong customer or no permission | Check user role |
| "Upload not found" | Invalid uploadId | Check uploadId from upload response |
| "File not found" | File deleted from server | Re-upload file |
| "Unsupported file format" | Not CSV/Excel | Use .csv or .xlsx |

---

## 🚀 Success Indicators

You'll know it's working when:
1. ✅ Upload returns uploadId
2. ✅ Parse shows summary with validRows > 0
3. ✅ Import returns totalImported > 0
4. ✅ Activities appear in Activities page
5. ✅ Can run calculations on imported data

---

**Your CSV system is smart - it just needs the right setup!** 🎉
