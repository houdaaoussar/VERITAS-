# 🔐 Ingest API Authentication Guide

## Overview

All ingest endpoints require JWT authentication. You must include a valid access token in the `Authorization` header for all requests.

## Authentication Requirements

### Required for All Endpoints
- **Authentication**: JWT Bearer token
- **Role Requirements**:
  - `POST /api/ingest`: Requires `ADMIN` or `EDITOR` role
  - `GET /api/ingest/*`: Requires any authenticated user

## How to Get an Access Token

### 1. Login to Get Token

**Endpoint**: `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@example.com",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "your.email@example.com",
    "role": "EDITOR",
    "customerId": "customer_id"
  }
}
```

### 2. Use Token in Requests

Include the token in the `Authorization` header with `Bearer` prefix:

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Using the Ingest API with Authentication

### Preview File (Without Saving)

```bash
curl -X POST http://localhost:3002/api/ingest \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@emissions_data.xlsx"
```

### Save to Database

```bash
curl -X POST "http://localhost:3002/api/ingest?periodId=PERIOD_ID&save=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@emissions_data.xlsx"
```

**Note**: `customerId` is automatically set to the authenticated user's customer. Admins can override by providing `customerId` query parameter.

### Get Available Categories

```bash
curl http://localhost:3002/api/ingest/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Template

```bash
curl http://localhost:3002/api/ingest/template \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## JavaScript/TypeScript Example

```typescript
// 1. Login to get token
const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// 2. Upload file with token
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

## React Example with Axios

```typescript
import axios from 'axios';

// Configure axios with token
const api = axios.create({
  baseURL: 'http://localhost:3002/api'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Upload file
const uploadFile = async (file: File, periodId: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    `/ingest?periodId=${periodId}&save=true`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};
```

## Error Responses

### 401 Unauthorized - No Token
```json
{
  "error": "Access token required",
  "code": "UNAUTHORIZED"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": "Invalid token",
  "code": "INVALID_TOKEN"
}
```

### 401 Unauthorized - Expired Token
```json
{
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

### 403 Forbidden - Customer Access Denied
```json
{
  "error": "Access denied to customer data",
  "code": "CUSTOMER_ACCESS_DENIED"
}
```

## Role-Based Access Control

### VIEWER Role
- ❌ Cannot upload files
- ✅ Can view categories
- ✅ Can view template
- ✅ Can view help

### EDITOR Role
- ✅ Can upload files
- ✅ Can save to database (own customer only)
- ✅ Can view categories
- ✅ Can view template
- ✅ Can view help

### ADMIN Role
- ✅ Can upload files
- ✅ Can save to any customer's database
- ✅ Can override customerId
- ✅ Full access to all endpoints

## Customer Access Control

### Default Behavior
- Users can only access their own customer's data
- `customerId` is automatically set from the authenticated user

### Admin Override
Admins can specify a different `customerId`:

```bash
curl -X POST "http://localhost:3002/api/ingest?customerId=OTHER_CUSTOMER&periodId=123&save=true" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@emissions_data.xlsx"
```

## Token Storage Best Practices

### Frontend Applications

**✅ DO:**
- Store tokens in memory (React state, Vue store)
- Use httpOnly cookies for refresh tokens
- Implement token refresh mechanism
- Clear tokens on logout

**❌ DON'T:**
- Store tokens in localStorage (XSS vulnerable)
- Store tokens in sessionStorage
- Log tokens to console
- Send tokens in URL parameters

### Example: Secure Token Management

```typescript
// Token service
class AuthService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const authService = new AuthService();
```

## Testing with Postman

### 1. Create Environment Variables
- `base_url`: `http://localhost:3002`
- `access_token`: (will be set after login)

### 2. Login Request
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Tests** (to save token):
  ```javascript
  const response = pm.response.json();
  pm.environment.set("access_token", response.token);
  ```

### 3. Upload Request
- **Method**: POST
- **URL**: `{{base_url}}/api/ingest?periodId=123&save=true`
- **Headers**:
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (form-data):
  - Key: `file`
  - Value: Select file

## Troubleshooting

### Issue: "Access token required"
**Solution**: Include `Authorization: Bearer YOUR_TOKEN` header in request

### Issue: "Token expired"
**Solution**: Login again to get a new token

### Issue: "Insufficient permissions"
**Solution**: 
- Check your user role (must be ADMIN or EDITOR for uploads)
- Contact admin to upgrade your role

### Issue: "Access denied to customer data"
**Solution**:
- Ensure you're accessing your own customer's data
- If you're an admin, verify the customerId parameter

## Security Considerations

1. **Token Expiration**: Tokens expire after a configured time (check JWT_EXPIRY in .env)
2. **HTTPS Required**: Always use HTTPS in production
3. **Token Rotation**: Implement refresh token mechanism
4. **Rate Limiting**: API has rate limits (1000 req/15min)
5. **File Validation**: Files are validated for type and size

## Environment Variables

Ensure these are set in your `.env` file:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h
```

## Complete Workflow Example

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Preview file
curl -X POST http://localhost:3002/api/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@emissions.xlsx"

# 3. Save to database
curl -X POST "http://localhost:3002/api/ingest?periodId=123&save=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@emissions.xlsx"
```

---

**Need Help?** Check the main documentation in `INGEST_API_DOCUMENTATION.md`
