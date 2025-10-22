# 🔍 CSV Upload Troubleshooting Guide

## Quick Test - Upload CSV File

### Method 1: Test Endpoint (No Authentication)

```powershell
# Test with curl (easiest)
curl -X POST http://localhost:3000/api/ingest/test `
  -F "file=@test_emissions.csv"
```

### Method 2: Test with PowerShell

```powershell
# Create a test CSV file first
@"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
"@ | Out-File -FilePath test_upload.csv -Encoding UTF8

# Upload it
$uri = "http://localhost:3000/api/ingest/test"
$filePath = "test_upload.csv"

$form = @{
    file = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri $uri -Method Post -Form $form
```

### Method 3: Browser Upload

1. Open: http://localhost:3000/api/ingest/test
2. Or use the upload page in your frontend

---

## Common Issues & Solutions

### ❌ Issue 1: "No file uploaded"

**Cause:** File field name is wrong

**Solution:** Make sure the form field is named `file`:
```html
<input type="file" name="file" />
```

### ❌ Issue 2: "Invalid file type"

**Cause:** File extension not recognized

**Solution:** Use `.csv`, `.xlsx`, or `.xls` files only

### ❌ Issue 3: "Database not configured"

**Cause:** `USE_DATABASE=true` but no database connected

**Solution:** Set `USE_DATABASE=false` in your `.env` file:
```env
USE_DATABASE=false
```

### ❌ Issue 4: CORS Error

**Cause:** Frontend and backend on different ports

**Solution:** Already configured in `server-simple.ts` to allow localhost

### ❌ Issue 5: File too large

**Cause:** File exceeds 100MB limit

**Solution:** Check file size or increase limit in `ingest.ts`

---

## Check Your .env File

Make sure you have:

```env
# Use in-memory storage (no database needed)
USE_DATABASE=false

# Port
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Test the Backend is Running

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"...","version":"1.1.0"}
```

---

## Frontend Upload Test

If using the frontend upload page:

1. **Make sure backend is running:**
   ```powershell
   npm run dev:backend
   ```

2. **Make sure frontend is running:**
   ```powershell
   npm run dev:frontend
   ```

3. **Check browser console** (F12) for errors

4. **Check Network tab** to see the actual request

---

## What Error Are You Seeing?

Please tell me:

1. **What page are you using?**
   - `/upload`
   - `/calculator`
   - `/emissions-inventory-upload`
   - Other?

2. **What error message do you see?**
   - In browser console?
   - On the page?
   - In terminal?

3. **What happens when you click upload?**
   - Nothing?
   - Error message?
   - Loading forever?

---

## Quick Fix Script

Run this to test upload:

```powershell
# Create test CSV
@"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31
"@ | Out-File -FilePath test.csv -Encoding UTF8

# Test upload
curl -X POST http://localhost:3000/api/ingest/test -F "file=@test.csv"
```

If this works, the backend is fine. If not, there's a backend issue.

---

## Next Steps

1. **Run the test above**
2. **Tell me what error you see**
3. **I'll fix it immediately**
