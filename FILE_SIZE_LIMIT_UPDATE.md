# 📦 File Size Limit Update

## ✅ File Upload Limit Increased

The file upload limit has been increased from **25MB to 100MB** to support larger datasets.

## Changes Made

### 1. Multer Configuration
**File**: `src/routes/ingest.ts`
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit (increased from 25MB)
  },
  // ...
});
```

### 2. Express Body Parser
**File**: `src/server-simple.ts`
```typescript
// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
```

## New Limits

| Component | Previous Limit | New Limit |
|-----------|---------------|-----------|
| File Upload (Multer) | 25MB | **100MB** |
| JSON Body Parser | 10MB | **100MB** |
| URL Encoded Body | 10MB | **100MB** |

## What This Means

✅ **Larger Files**: You can now upload Excel/CSV files up to 100MB  
✅ **More Rows**: Support for datasets with 50,000+ rows  
✅ **Better Performance**: No need to split large files into batches  

## Recommendations

### For Files Under 100MB
- Upload directly using the ingest API
- Use preview mode first to validate
- Single upload operation

### For Files Over 100MB
Consider these alternatives:
1. **Split the file** into multiple smaller files
2. **Use CSV format** instead of Excel (more efficient)
3. **Implement streaming** for very large datasets
4. **Database direct import** for massive datasets

## Performance Considerations

### Expected Processing Times

| File Size | Rows (approx) | Processing Time |
|-----------|---------------|-----------------|
| < 10MB | < 10,000 | 1-3 seconds |
| 10-50MB | 10,000-50,000 | 3-15 seconds |
| 50-100MB | 50,000-100,000 | 15-60 seconds |
| > 100MB | > 100,000 | Consider splitting |

### Memory Usage

- Files are loaded into memory during processing
- 100MB file may use 200-300MB RAM during processing
- Ensure server has adequate memory (recommended: 2GB+ available)

## Testing

Test the new limit:

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Upload large file (up to 100MB)
curl -X POST "http://localhost:3002/api/ingest?periodId=123&save=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large_emissions_data.xlsx"
```

## Error Handling

### File Too Large (> 100MB)
```json
{
  "error": "File too large",
  "message": "File size exceeds 100MB limit"
}
```

**Solution**: Split the file or use alternative import method

### Server Memory Issues
If you encounter memory errors with large files:
1. Increase Node.js memory: `node --max-old-space-size=4096 server.js`
2. Use CSV instead of Excel (more memory efficient)
3. Split into smaller batches

## Production Deployment

### Environment Configuration

For production servers, consider:

```env
# .env file
NODE_OPTIONS=--max-old-space-size=4096
MAX_FILE_SIZE=100
```

### Server Requirements

Recommended server specs for 100MB files:
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2+ cores
- **Storage**: SSD for better I/O performance

### Load Balancing

For high-traffic scenarios:
- Use multiple server instances
- Implement queue system for large file processing
- Consider background job processing

## Monitoring

Monitor these metrics:
- Upload success rate
- Processing time per file size
- Memory usage during uploads
- Error rates for large files

## Rollback

If you need to revert to 25MB limit:

```typescript
// src/routes/ingest.ts
limits: {
  fileSize: 25 * 1024 * 1024 // 25MB
}

// src/server-simple.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Documentation Updated

All documentation has been updated to reflect the new 100MB limit:
- ✅ `INGEST_README.md`
- ✅ `INGEST_API_DOCUMENTATION.md`
- ✅ `INGEST_QUICK_START.md`

---

**Questions?** Check the main documentation or contact support.
