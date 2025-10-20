# 🔄 Migration Instructions: From Prisma to Storage Adapter

## Overview

To work without a database, you need to replace all Prisma imports with the storage adapter.

---

## 📝 Step-by-Step Instructions

### Step 1: Find and Replace Imports

**In ALL files under `src/`, replace:**

**OLD:**
```typescript
import { prisma } from '../lib/prisma';
import { prisma } from '../../lib/prisma';
import { prisma } from './lib/prisma';
```

**NEW:**
```typescript
import { db as prisma } from '../storage/storageAdapter';
import { db as prisma } from '../../storage/storageAdapter';
import { db as prisma } from './storage/storageAdapter';
```

**Why alias as `prisma`?** This way, you don't need to change any other code! All `prisma.customer.findUnique()` calls will work exactly the same.

---

### Step 2: Files That Need Updating

Here are the files that import Prisma (update each one):

1. `src/middleware/auth.ts`
2. `src/routes/activities.ts`
3. `src/routes/auth.ts`
4. `src/routes/calculations.ts`
5. `src/routes/customers.ts`
6. `src/routes/ingest.ts`
7. `src/routes/periods.ts`
8. `src/routes/projects.ts`
9. `src/routes/reporting.ts`
10. `src/routes/sites.ts`
11. `src/routes/uploads.ts`
12. `src/routes/emissionsInventory.ts`
13. `src/server.ts`
14. `src/services/calculationEngine.ts`
15. `src/services/emissionFactors.ts`
16. `src/services/ingestService.ts`

---

### Step 3: Example Migration

**Before (`src/routes/customers.ts`):**
```typescript
import { prisma } from '../lib/prisma';

router.get('/', async (req, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});
```

**After (`src/routes/customers.ts`):**
```typescript
import { db as prisma } from '../storage/storageAdapter';

router.get('/', async (req, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});
```

**That's it!** Only the import line changes. Everything else stays the same.

---

### Step 4: Add Auto-Site-Creation

Update `src/services/ingestService.ts` to automatically create sites:

**Find this code (around line 580):**
```typescript
// Find the site by name
const site = await prisma.site.findFirst({
  where: {
    customerId,
    name: {
      equals: row.site_name,
      mode: 'insensitive'
    }
  }
});

if (!site) {
  errors.push(`Site not found: ${row.site_name}`);
  continue;
}
```

**Replace with:**
```typescript
// Find or create the site
let site = await prisma.site.findFirst({
  where: {
    customerId,
    name: {
      equals: row.site_name,
      mode: 'insensitive'
    }
  }
});

// Auto-create site if it doesn't exist
if (!site) {
  site = await prisma.site.create({
    data: {
      customerId,
      name: row.site_name,
      country: 'UK' // Default country
    }
  });
  logger.info(`Auto-created site: ${row.site_name}`);
}
```

---

### Step 5: Update Server Startup

Add data persistence to `src/server.ts`:

**Add at the top:**
```typescript
import { storageUtils } from './storage/storageAdapter';
import fs from 'fs';
import path from 'path';

const DATA_BACKUP_FILE = path.join(__dirname, '../data-backup.json');
```

**Add after app initialization:**
```typescript
// Load data from backup on startup
if (fs.existsSync(DATA_BACKUP_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_BACKUP_FILE, 'utf8'));
    storageUtils.importData(data);
    logger.info('Data restored from backup');
  } catch (error) {
    logger.error('Failed to restore data from backup', error);
  }
}

// Auto-save data every 5 minutes
setInterval(() => {
  try {
    const data = storageUtils.exportData();
    fs.writeFileSync(DATA_BACKUP_FILE, JSON.stringify(data, null, 2));
    logger.info('Data auto-saved');
  } catch (error) {
    logger.error('Failed to auto-save data', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Save data on graceful shutdown
process.on('SIGINT', () => {
  logger.info('Saving data before shutdown...');
  const data = storageUtils.exportData();
  fs.writeFileSync(DATA_BACKUP_FILE, JSON.stringify(data, null, 2));
  logger.info('Data saved. Shutting down...');
  process.exit(0);
});
```

---

## 🎯 Quick Migration Script

Here's a simple find-and-replace pattern for VS Code:

1. Open VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Set "Files to include": `src/**/*.ts`
4. Find: `import { prisma } from '../lib/prisma'`
5. Replace: `import { db as prisma } from '../storage/storageAdapter'`
6. Click "Replace All"

Repeat for these patterns:
- `from '../../lib/prisma'` → `from '../../storage/storageAdapter'`
- `from './lib/prisma'` → `from './storage/storageAdapter'`

---

## ✅ Verification

After migration, verify everything works:

### 1. Start the Server
```bash
npm run dev
```

### 2. Check Default Data
```bash
curl http://localhost:3000/api/customers
```

Should return:
```json
[
  {
    "id": "customer_default",
    "name": "Demo Company",
    "industry": "Technology",
    "country": "UK"
  }
]
```

### 3. Upload CSV
```bash
curl -X POST http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true \
  -F "file=@emissions_data.csv"
```

### 4. View Activities
```bash
curl http://localhost:3000/api/activities?customerId=customer_default&periodId=period_default
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '../storage/storageAdapter'"

**Solution:** Check the relative path. It should be:
- From `src/routes/`: `'../storage/storageAdapter'`
- From `src/services/`: `'../storage/storageAdapter'`
- From `src/middleware/`: `'../storage/storageAdapter'`

### Error: "prisma.customer.findMany is not a function"

**Solution:** Make sure you're aliasing the import:
```typescript
import { db as prisma } from '../storage/storageAdapter';
```

### Data Not Persisting

**Solution:** Make sure auto-save is enabled in `server.ts` (see Step 5 above).

---

## 📊 What You Get

After migration:

✅ **No database required** - Works immediately  
✅ **Same API** - All Prisma calls work the same  
✅ **Auto-save** - Data persists between restarts  
✅ **Default data** - Customer, site, period, user pre-loaded  
✅ **Emission factors** - All Scope 1, 2, 3 factors ready  
✅ **Auto-create sites** - Sites created automatically on upload  
✅ **Easy migration** - Switch to database later with one env variable  

---

## 🚀 Next: Using the System

Once migration is complete, see `WORKING_WITHOUT_DATABASE.md` for:
- How to upload CSV files
- How to run calculations
- How to view results
- How to migrate to database later

---

**Ready to migrate?** Follow the steps above and you'll be running without a database in minutes! 🎉
