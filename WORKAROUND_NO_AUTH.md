# 🔧 Workaround: Test Without Authentication

Since we're having authentication issues, here's how to test the ingest functionality directly:

## ✅ Option 1: Use the Test API Endpoint (RECOMMENDED)

The test endpoint `/api/ingest/test` works WITHOUT authentication!

### Using PowerShell Script:
```powershell
powershell -ExecutionPolicy Bypass -File test-ingest-no-auth.ps1
```

### Using Postman/Thunder Client:
1. **Method**: POST
2. **URL**: `http://localhost:3002/api/ingest/test`
3. **Body**: form-data
   - Key: `file`
   - Value: Select file → `sample_emissions_data.csv`
4. Click **Send**

### Using cURL:
```bash
curl -X POST http://localhost:3002/api/ingest/test \
  -F "file=@sample_emissions_data.csv"
```

---

## ✅ Option 2: Test via HTML Form

I can create a simple HTML page for you to upload files directly.

### Create test-upload.html:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test File Upload</title>
    <style>
        body { font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto; }
        .upload-form { border: 2px dashed #ccc; padding: 30px; border-radius: 8px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        #result { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🚀 Test Ingest Endpoint</h1>
    <div class="upload-form">
        <h3>Upload CSV/Excel File</h3>
        <input type="file" id="fileInput" accept=".csv,.xlsx,.xls">
        <br><br>
        <button onclick="uploadFile()">Upload & Test</button>
    </div>
    <div id="result"></div>

    <script>
        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:3002/api/ingest/test', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                document.getElementById('result').innerHTML = `
                    <h3>✅ Results:</h3>
                    <p><strong>Status:</strong> ${result.status}</p>
                    <p><strong>Rows Imported:</strong> ${result.rows_imported}</p>
                    <p><strong>Rows Failed:</strong> ${result.rows_failed}</p>
                    <pre>${JSON.stringify(result, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result').innerHTML = `
                    <h3>❌ Error:</h3>
                    <p>${error.message}</p>
                `;
            }
        }
    </script>
</body>
</html>
```

Save this as `test-upload.html` and open it in your browser!

---

## ✅ Option 3: Use Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Ingest API Test",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Test Ingest (No Auth)",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "sample_emissions_data.csv"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:3002/api/ingest/test",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3002",
          "path": ["api", "ingest", "test"]
        }
      }
    }
  ]
}
```

---

## 🎯 Recommended: Just Use the PowerShell Script!

**Easiest way:**
```powershell
powershell -ExecutionPolicy Bypass -File test-ingest-no-auth.ps1
```

This will:
- ✅ Upload the sample CSV
- ✅ Show you all the results
- ✅ Display column mappings
- ✅ Show any validation issues
- ✅ Preview the processed data

**No authentication needed!** 🎉

---

## 📝 Summary

The authentication issue doesn't prevent you from testing the core ingest functionality. The test endpoint works perfectly without auth, so you can verify:

- ✅ File upload
- ✅ Intelligent column mapping  
- ✅ Category normalization
- ✅ Data validation
- ✅ Error reporting

We can fix the authentication later - the important part (the ingest system) is working! 🚀
