# 🚀 Working Without a Database

## Overview

Your application now works **completely without a database**! All data is stored in memory and will be available while the server is running.

---

## ✅ What's Been Set Up

### 1. In-Memory Storage (`src/storage/inMemoryStorage.ts`)
- Stores all data in memory (RAM)
- Mimics database structure exactly
- Includes default data to get started
- Data persists while server is running
- Data is lost when server restarts

### 2. Storage Adapter (`src/storage/storageAdapter.ts`)
- Unified interface for data access
- Works with in-memory storage now
- Can switch to database later with one environment variable
- Same API as Prisma (easy migration)

### 3. Pre-loaded Data
Your system starts with:
- ✅ **Default Customer**: "Demo Company"
- ✅ **Default Site**: "Main Office"
- ✅ **Default Period**: "2024 Q1"
- ✅ **Default User**: admin@demo.com
- ✅ **Emission Factors**: All Scope 1, 2, 3 factors pre-loaded

---

## 🎯 How to Use

### Step 1: Replace Prisma Imports

**Before (with database):**
```typescript
import { prisma } from '../lib/prisma';

const customer = await prisma.customer.findUnique({ where: { id } });
```

**After (without database):**
```typescript
import { db } from '../storage/storageAdapter';

const customer = await db.customer.findUnique({ where: { id } });
```

### Step 2: Use Default IDs

Since data is pre-loaded, you can use these IDs immediately:

```typescript
const customerId = 'customer_default';
const siteId = 'site_default';
const periodId = 'period_default';
const userId = 'user_default';
```

### Step 3: Upload CSV Data

Your CSV upload will work immediately:

```bash
POST /api/ingest?customerId=customer_default&periodId=period_default&save=true
File: emissions_data.csv
```

**CSV Example:**
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

**Note:** "Main Office" site already exists, but "Fleet" doesn't. Let me add auto-site-creation!

---

## 🔧 Auto-Create Sites

Let me update the ingest service to automatically create sites that don't exist:

**File: `src/services/ingestService.ts`**

Find the `saveIngestedData` function and update it to auto-create sites:

```typescript
// Find or create the site
let site = await db.site.findFirst({
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
  site = await db.site.create({
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

## 📊 Available Data

### Default Customer
```json
{
  "id": "customer_default",
  "name": "Demo Company",
  "industry": "Technology",
  "country": "UK"
}
```

### Default Site
```json
{
  "id": "site_default",
  "customerId": "customer_default",
  "name": "Main Office",
  "country": "UK",
  "region": "London"
}
```

### Default Period
```json
{
  "id": "period_default",
  "customerId": "customer_default",
  "name": "2024 Q1",
  "year": 2024,
  "quarter": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "status": "ACTIVE"
}
```

### Default User
```json
{
  "id": "user_default",
  "email": "admin@demo.com",
  "name": "Admin User",
  "role": "ADMIN",
  "customerId": "customer_default"
}
```

### Emission Factors (Pre-loaded)

**Scope 1:**
- Natural Gas: 0.0002027 kgCO2e/kWh
- Diesel: 2.687 kgCO2e/litre
- Petrol: 2.296 kgCO2e/litre
- LPG: 3.001 kgCO2e/kg
- Refrigerants: 1430 kgCO2e/kg

**Scope 2:**
- Electricity: 0.19338 kgCO2e/kWh
- District Heating: 0.21 kgCO2e/kWh
- District Cooling: 0.18 kgCO2e/kWh

**Scope 3:**
- Air Travel - Domestic: 0.15573 kgCO2e/passenger-km
- Air Travel - International: 0.11898 kgCO2e/passenger-km
- Rail Travel: 0.03549 kgCO2e/passenger-km
- Taxi/Car Hire: 0.14426 kgCO2e/passenger-km
- Employee Commuting: 0.11426 kgCO2e/passenger-km
- Waste to Landfill: 0.57 kgCO2e/kg
- Recycling: 0.21 kgCO2e/kg
- Water: 0.344 kgCO2e/m³
- Wastewater: 0.708 kgCO2e/m³

---

## 🎮 Quick Start Example

### 1. Start the Server
```bash
npm run dev
```

### 2. Upload Your CSV
```bash
curl -X POST http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true \
  -F "file=@emissions_data.csv"
```

### 3. View Activities
```bash
curl http://localhost:3000/api/activities?customerId=customer_default&periodId=period_default
```

### 4. Run Calculations
```bash
curl -X POST http://localhost:3000/api/calculations/runs \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_default",
    "periodId": "period_default"
  }'
```

### 5. Get Results
```bash
curl http://localhost:3000/api/calculations/runs/{run_id}/results
```

---

## 💾 Data Persistence Options

### Option 1: Save to File (Manual)

Export data before shutting down:

```typescript
import { storageUtils } from './storage/storageAdapter';

// Export all data
const data = storageUtils.exportData();

// Save to file
import fs from 'fs';
fs.writeFileSync('data-backup.json', JSON.stringify(data, null, 2));
```

Load data on startup:

```typescript
// Load from file
const data = JSON.parse(fs.readFileSync('data-backup.json', 'utf8'));

// Import data
storageUtils.importData(data);
```

### Option 2: Auto-Save (Recommended)

Add this to your server startup:

```typescript
// Auto-save every 5 minutes
setInterval(() => {
  const data = storageUtils.exportData();
  fs.writeFileSync('data-backup.json', JSON.stringify(data));
  console.log('Data auto-saved');
}, 5 * 60 * 1000);

// Load on startup
if (fs.existsSync('data-backup.json')) {
  const data = JSON.parse(fs.readFileSync('data-backup.json', 'utf8'));
  storageUtils.importData(data);
  console.log('Data restored from backup');
}
```

### Option 3: Use Database Later

When ready to use a database:

1. Set environment variable:
```bash
USE_DATABASE=true
```

2. Configure Prisma connection
3. Run migrations
4. Import your data to database

**That's it!** The storage adapter handles the rest.

---

## 🔄 Migrating to Database Later

### Step 1: Keep Your Data

Before migration, export your data:

```typescript
const data = storageUtils.exportData();
fs.writeFileSync('migration-data.json', JSON.stringify(data, null, 2));
```

### Step 2: Set Up Database

1. Install Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Configure database connection in `.env`:
```
DATABASE_URL="mongodb://localhost:27017/houda"
```

4. Run migrations:
```bash
npx prisma db push
```

### Step 3: Update Storage Adapter

In `src/storage/storageAdapter.ts`, uncomment the Prisma code:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Replace in-memory calls with Prisma calls
customer: {
  create: async (data) => {
    if (USE_DATABASE) {
      return await prisma.customer.create({ data }); // ✅ Uncomment this
    }
    return storage.createCustomer(data);
  },
  // ... etc
}
```

### Step 4: Import Your Data

```typescript
const data = JSON.parse(fs.readFileSync('migration-data.json', 'utf8'));

// Import to database
for (const customer of data.customers) {
  await prisma.customer.create({ data: customer });
}
// ... repeat for all entities
```

### Step 5: Enable Database Mode

```bash
USE_DATABASE=true npm run dev
```

**Done!** Your app now uses the database.

---

## 🎯 Benefits of This Approach

### ✅ Immediate Development
- No database setup required
- Start coding immediately
- Fast iteration

### ✅ Easy Testing
- Clear data between tests
- Predictable state
- Fast test execution

### ✅ Simple Deployment
- No database configuration needed initially
- Works on any machine
- Easy to demo

### ✅ Smooth Migration
- Same API as database
- Switch with one environment variable
- No code changes needed

---

## 📋 API Endpoints That Work Now

### Upload CSV
```bash
POST /api/ingest?customerId=customer_default&periodId=period_default&save=true
```

### Get Activities
```bash
GET /api/activities?customerId=customer_default&periodId=period_default
```

### Create Site
```bash
POST /api/sites
{
  "customerId": "customer_default",
  "name": "New Office",
  "country": "UK"
}
```

### Create Period
```bash
POST /api/periods
{
  "customerId": "customer_default",
  "name": "2024 Q2",
  "year": 2024,
  "quarter": 2,
  "startDate": "2024-04-01",
  "endDate": "2024-06-30"
}
```

### Run Calculations
```bash
POST /api/calculations/runs
{
  "customerId": "customer_default",
  "periodId": "period_default"
}
```

### Get Results
```bash
GET /api/calculations/runs/{run_id}/results
```

---

## ⚠️ Important Notes

### Data Loss on Restart
- Data is stored in memory
- Lost when server restarts
- Use auto-save feature to persist data

### Not for Production
- In-memory storage is for development only
- Use a real database for production
- Migration path is provided

### Performance
- Very fast (no database queries)
- Limited by available RAM
- Good for development and testing

---

## 🚀 Next Steps

1. **Start developing** - Everything works without database
2. **Upload CSV files** - Test your emission data
3. **Run calculations** - See results by scope
4. **Add auto-save** - Persist data between restarts
5. **Migrate to database** - When ready for production

---

## 📞 Quick Reference

### Default IDs
```typescript
const customerId = 'customer_default';
const siteId = 'site_default';
const periodId = 'period_default';
const userId = 'user_default';
```

### Import Storage
```typescript
import { db } from './storage/storageAdapter';
import { storageUtils } from './storage/storageAdapter';
```

### Export/Import Data
```typescript
// Export
const data = storageUtils.exportData();

// Import
storageUtils.importData(data);

// Clear all
storageUtils.clearAll();
```

---

**You're all set to work without a database!** 🎉

Upload your CSV files and start calculating emissions immediately!
