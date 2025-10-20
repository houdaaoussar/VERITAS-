# 🚀 How to Run the Application

## Current Status

✅ **In-memory storage system created** - No database needed!  
⏳ **npm install is running** - Wait for it to complete  
📝 **Code needs minor updates** - See below  

---

## Step 1: Wait for npm install ⏳

The `npm install` command is currently running. Wait for it to finish (you'll see "added X packages" message).

---

## Step 2: Create .env File

Run this command:
```bash
copy .env.example .env
```

Or create `.env` manually with this content:
```
PORT=3000
NODE_ENV=development
USE_DATABASE=false
JWT_SECRET=your-secret-key-change-this
```

---

## Step 3: Update One Import (Quick Fix)

Before running, you need to update the Prisma imports. Here's the quickest way:

### Option A: Manual Update (5 minutes)

Open these files and change the import:

**Files to update:**
- `src/services/ingestService.ts`
- `src/routes/ingest.ts`

**Find:**
```typescript
import { prisma } from '../lib/prisma';
```

**Replace with:**
```typescript
import { db as prisma } from '../storage/storageAdapter';
```

### Option B: Use Find & Replace in VS Code

1. Press `Ctrl+Shift+H`
2. Find: `import { prisma } from '../lib/prisma'`
3. Replace: `import { db as prisma } from '../storage/storageAdapter'`
4. Files to include: `src/**/*.ts`
5. Click "Replace All"

---

## Step 4: Start the Server

```bash
npm run dev:backend
```

You should see:
```
✅ All route modules imported successfully
Server running on port 3000
```

---

## Step 5: Test the Upload

### Create a test CSV file (`test.csv`):
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
```

### Upload it:
```bash
curl -X POST "http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true" -F "file=@test.csv"
```

### Or use the test script:
```bash
test-upload.bat
```

---

## ✅ Expected Result

You should see:
```json
{
  "status": "success",
  "message": "Successfully processed and saved 2 rows",
  "rows_imported": 2,
  "rows_failed": 0,
  "activities_created": 2
}
```

---

## 🎯 What Works Now

✅ CSV upload with simple template  
✅ Auto-site creation  
✅ Auto-scope determination  
✅ Auto-emission factor selection  
✅ Activity storage (in-memory)  
✅ Calculations with Scope 1, 2, 3  
✅ Results by scope  

---

## 📊 View Your Data

```bash
# View activities
curl "http://localhost:3000/api/activities?customerId=customer_default&periodId=period_default"

# View sites
curl "http://localhost:3000/api/sites?customerId=customer_default"

# Run calculations
curl -X POST http://localhost:3000/api/calculations/runs \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"customer_default\",\"periodId\":\"period_default\"}"
```

---

## 🔧 If You Get Errors

### Error: "Cannot find module '../storage/storageAdapter'"

**Solution:** Make sure you created the storage files. They should be at:
- `src/storage/inMemoryStorage.ts`
- `src/storage/storageAdapter.ts`

### Error: "prisma is not defined"

**Solution:** You need to update the imports (see Step 3 above)

### Error: "Port 3000 is already in use"

**Solution:** Change PORT in `.env` to 3001

---

## 📝 Summary

1. ⏳ Wait for `npm install` to finish
2. 📄 Create `.env` file
3. ✏️ Update imports (5 minutes)
4. 🚀 Run `npm run dev:backend`
5. 📤 Upload CSV
6. 🎉 See results!

---

## 🆘 Quick Help

**Check if server is running:**
```bash
curl http://localhost:3000
```

**View template:**
```bash
curl http://localhost:3000/api/ingest/template
```

**Download template:**
```bash
curl http://localhost:3000/api/ingest/template/download -o template.csv
```

---

**Need more help?** Check these files:
- `QUICK_START.md` - Detailed guide
- `WORKING_WITHOUT_DATABASE.md` - Complete documentation
- `MIGRATION_INSTRUCTIONS.md` - Step-by-step code updates

---

**You're almost there!** Just wait for npm install, update the imports, and start the server! 🚀
