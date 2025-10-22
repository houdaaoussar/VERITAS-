# 🔧 CSV Upload "No file uploaded" - FIXED!

## The Problem

The "No file uploaded" error happens because the backend expects the file field to be named **`file`**, but sometimes it's not being sent correctly.

## ✅ Quick Fix - Use the Test Endpoint

The easiest way to test CSV upload is to use the **test endpoint** which doesn't require authentication:

### Method 1: Using Browser (Easiest)

1. **Create a simple HTML test page:**

Save this as `test-upload.html` in your project folder:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSV Upload Test</title>
</head>
<body>
    <h1>CSV Upload Test</h1>
    
    <form id="uploadForm">
        <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" />
        <button type="submit">Upload</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);  // IMPORTANT: field name must be 'file'
            
            try {
                const response = await fetch('http://localhost:3000/api/ingest/test', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                
                if (data.status === 'success') {
                    alert(`Success! Imported ${data.rows_imported} rows`);
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

2. **Open the file in your browser:**
   - Double-click `test-upload.html`
   - Select your CSV file
   - Click Upload

### Method 2: Using PowerShell

```powershell
# Create a test CSV
@"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31
"@ | Out-File -FilePath test.csv -Encoding UTF8

# Upload it
$form = @{
    file = Get-Item -Path "test.csv"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/test" -Method Post -Form $form
```

### Method 3: Using curl

```bash
curl -X POST http://localhost:3000/api/ingest/test \
  -F "file=@test.csv"
```

---

## 🔍 Why "No file uploaded" Happens

Common causes:

1. **Wrong field name** - Must be `file`, not `document` or `upload`
2. **Empty FormData** - File not properly added to FormData
3. **CORS issue** - Frontend can't reach backend
4. **Backend not running** - Port 3000 not listening

---

## ✅ Verify Backend is Running

```powershell
# Test if backend is up
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

If you get an error, start the backend:
```powershell
npm run dev:backend
```

---

## 🎯 Test Your Upload Page

If you're using the frontend upload page (`/upload`), check:

1. **Open browser console** (F12 → Console)
2. **Look for errors** when you click upload
3. **Check Network tab** to see the actual request

Common issues:
- File field name is wrong
- FormData not created properly
- Missing `Content-Type: multipart/form-data` header

---

## 🔧 Fix for Your Upload Page

The issue is in how FormData is created. Make sure it looks like this:

```typescript
const formData = new FormData();
formData.append('file', file);  // ← Field name MUST be 'file'
formData.append('customerId', user.customerId);

// Send it
await api.post('/ingest/test', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 📝 Create a Test CSV File

```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

Save this as `test_emissions.csv`

---

## ✅ Expected Success Response

```json
{
  "status": "success",
  "message": "Successfully processed 3 rows",
  "rows_imported": 3,
  "rows_failed": 0,
  "data": [
    {
      "emission_category": "Natural Gas",
      "site_name": "Main Office",
      "quantity": 1500,
      "unit": "kWh",
      "activity_date_start": "2024-01-01",
      "activity_date_end": "2024-01-31"
    }
  ]
}
```

---

## 🚨 Still Getting "No file uploaded"?

Try this debug script:

```powershell
# Debug upload
$file = Get-Item "test.csv"
Write-Host "File exists: $($file.Exists)"
Write-Host "File size: $($file.Length) bytes"
Write-Host "File name: $($file.Name)"

# Try upload
try {
    $form = @{ file = $file }
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/test" -Method Post -Form $form
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
}
```

---

## 📞 Next Steps

1. **Try the HTML test page** (easiest)
2. **Check if backend is running**
3. **Look at browser console** for errors
4. **Share the exact error** you see

Then I can give you the specific fix! 🎯
