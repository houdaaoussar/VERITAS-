# Test Excel Upload - Debugging Guide

## 🔍 Step-by-Step Debugging

### Step 1: Check Backend Console
Look at the terminal where backend is running. You should see:
```
📨 POST /api/emissions-inventory/upload
```

If you see errors, copy them here.

### Step 2: Check Browser Console (F12)
1. Open your app in browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Try uploading file
5. Look for red errors

Common errors:
- **401 Unauthorized** → You're not logged in
- **403 Forbidden** → Wrong permissions
- **404 Not Found** → Wrong API URL
- **500 Internal Server Error** → Backend error

### Step 3: Check Network Tab
1. In Developer Tools, go to "Network" tab
2. Try uploading file
3. Find the upload request
4. Click on it
5. Check:
   - **Request URL**: Should be `http://localhost:3002/api/emissions-inventory/upload`
   - **Request Method**: Should be POST
   - **Status Code**: Should be 200 or 201
   - **Response**: What does it say?

### Step 4: Test with cURL
Open a new terminal and run:

```bash
# First, login to get token
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}"

# Copy the accessToken from response

# Then test upload (replace YOUR_TOKEN and YOUR_CUSTOMER_ID)
curl -X POST http://localhost:3002/api/emissions-inventory/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/your/file.xlsx" \
  -F "customerId=YOUR_CUSTOMER_ID" \
  -F "autoCreate=true"
```

## 🐛 Common Issues

### Issue 1: "Failed to upload file"
**Possible causes:**
1. Backend not running
2. Wrong API URL in frontend
3. CORS error
4. Not logged in

**Check:**
```bash
# Is backend running?
curl http://localhost:3002/health

# Should return: {"status":"healthy",...}
```

### Issue 2: "No file uploaded"
**Cause:** File not attached properly

**Fix:** Check FormData in frontend:
```typescript
const formData = new FormData();
formData.append('file', file);  // Make sure 'file' is the actual File object
formData.append('customerId', user.customerId);
formData.append('autoCreate', 'true');
```

### Issue 3: "Only CSV and Excel files are allowed"
**Cause:** Wrong file extension

**Check:** File must be `.csv`, `.xlsx`, or `.xls`

### Issue 4: "File too large"
**Cause:** File > 10MB

**Fix:** Reduce file size or increase limit in backend

### Issue 5: "Access denied"
**Cause:** Not logged in or wrong permissions

**Fix:** 
1. Make sure you're logged in
2. Check user role (must be ADMIN or EDITOR)

## 🔧 Frontend API Configuration

Check `frontend/src/services/api.ts`:

```typescript
// Should be:
const API_BASE_URL = 'http://localhost:3002';

// NOT:
const API_BASE_URL = 'http://localhost:3001';  // ❌ Wrong port
```

## 🔧 Backend CORS Configuration

Check `src/server-simple.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002'
  ],
  credentials: true
}));
```

## 📝 Quick Test

Create a simple Excel file:

| Year | Fuel Type   | Amount | Unit |
|------|-------------|--------|------|
| 2024 | Electricity | 25000  | kWh  |
| 2024 | Natural Gas | 1500   | m³   |

Save as `test.xlsx` and try uploading.

## 🎯 What Should Happen

### Success Flow:
1. **Upload** → Returns `uploadId`
2. **Parse** → Returns summary with activities found
3. **Import** → Creates activities in database

### Response Example:
```json
{
  "uploadId": "abc-123-def-456",
  "filename": "test.xlsx",
  "size": 12345,
  "status": "uploaded",
  "message": "File uploaded successfully..."
}
```

## 🚨 If Still Not Working

1. **Restart backend** (Ctrl+C, then `npm run dev:backend`)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try different browser**
4. **Check if MongoDB is connected**
5. **Look at backend terminal for errors**

## 📞 Get More Info

Run this in backend terminal to see detailed logs:
```bash
# Set debug mode
$env:DEBUG="*"
npm run dev:backend
```

Then try uploading and copy ALL the output.
