# 🔐 Authentication Summary - Quick Reference

## ⚠️ IMPORTANT: All Ingest Endpoints Require Authentication

The ingest API now requires a valid JWT access token for all requests.

## Quick Steps to Use the API

### Step 1: Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "role": "EDITOR",
    "customerId": "customer_id"
  }
}
```

### Step 2: Use Token in Requests

Add this header to all requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Step 3: Upload File

```bash
curl -X POST "http://localhost:3002/api/ingest?periodId=PERIOD_ID&save=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@your_file.xlsx"
```

## Role Requirements

| Endpoint | Required Role |
|----------|---------------|
| `POST /api/ingest` | ADMIN or EDITOR |
| `GET /api/ingest/categories` | Any authenticated user |
| `GET /api/ingest/template` | Any authenticated user |
| `GET /api/ingest/help` | Any authenticated user |

## Key Changes

✅ **Authentication Required**: All endpoints now require JWT token  
✅ **Role-Based Access**: Only ADMIN and EDITOR can upload files  
✅ **Customer Isolation**: Users can only access their own customer data  
✅ **Auto Customer ID**: customerId is automatically set from user account  

## Common Errors

### "Access token required"
**Fix**: Add `Authorization: Bearer YOUR_TOKEN` header

### "Insufficient permissions"
**Fix**: Your role must be ADMIN or EDITOR to upload files

### "Access denied to customer data"
**Fix**: You can only access your own customer's data (unless you're an ADMIN)

## Complete Example (Bash)

```bash
#!/bin/bash

# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Preview file
curl -X POST http://localhost:3002/api/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@emissions.xlsx"

# 3. Save to database
curl -X POST "http://localhost:3002/api/ingest?periodId=123&save=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@emissions.xlsx"
```

## JavaScript Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// 2. Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch(
  'http://localhost:3002/api/ingest?periodId=123&save=true',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

const result = await uploadResponse.json();
console.log(`Imported ${result.rows_imported} rows`);
```

## Postman Setup

1. **Login Request**:
   - POST `http://localhost:3002/api/auth/login`
   - Body: `{"email":"user@example.com","password":"password"}`
   - Save token from response

2. **Upload Request**:
   - POST `http://localhost:3002/api/ingest?periodId=123&save=true`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body (form-data): file → Select file

## Security Notes

- Tokens expire after configured time (default: 24h)
- Use HTTPS in production
- Never log or expose tokens
- Store tokens securely (not in localStorage)

---

**For complete authentication documentation, see**: `INGEST_AUTHENTICATION.md`
