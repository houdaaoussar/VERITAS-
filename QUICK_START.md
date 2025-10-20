# 🚀 Quick Start Guide - No Database Required!

## ✅ What You Have

Your application is ready to run **without a database**! Everything is set up to work with in-memory storage.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm installed

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

**Wait for this to complete** (may take 2-3 minutes)

### Step 2: Create Environment File

Copy the example file:
```bash
copy .env.example .env
```

Or create `.env` manually with:
```
PORT=3000
NODE_ENV=development
USE_DATABASE=false
JWT_SECRET=your-secret-key-here
```

### Step 3: Start the Server

```bash
npm run dev:backend
```

**Server will start at:** `http://localhost:3000`

---

## 🎮 Testing the Upload

### Option 1: Use the Test Script (Easiest)

```bash
test-upload.bat
```

This will:
1. Create a test CSV file
2. Upload it to the server
3. Show you the results

### Option 2: Manual Upload

1. Create a CSV file (`emissions_data.csv`):
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

2. Upload using curl:
```bash
curl -X POST "http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true" -F "file=@emissions_data.csv"
```

3. Or use Postman/Insomnia:
   - Method: POST
   - URL: `http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true`
   - Body: form-data
   - Key: `file`
   - Value: Select your CSV file

---

## 📊 View Your Data

### View Activities
```bash
curl "http://localhost:3000/api/activities?customerId=customer_default&periodId=period_default"
```

### View Sites
```bash
curl "http://localhost:3000/api/sites?customerId=customer_default"
```

### View Periods
```bash
curl "http://localhost:3000/api/periods?customerId=customer_default"
```

---

## 🧮 Run Calculations

### Start a Calculation Run
```bash
curl -X POST http://localhost:3000/api/calculations/runs \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"customer_default\",\"periodId\":\"period_default\"}"
```

This will return a `run_id`.

### Get Results
```bash
curl "http://localhost:3000/api/calculations/runs/{run_id}/results"
```

Replace `{run_id}` with the ID from the previous step.

**You'll see:**
- Scope 1 Total (Direct emissions)
- Scope 2 Total (Purchased energy)
- Scope 3 Total (Indirect emissions)
- Total Carbon Footprint

---

## 🔧 Troubleshooting

### Error: "Cannot find module"

**Solution:** Make sure npm install completed successfully
```bash
npm install
```

### Error: "Port 3000 is already in use"

**Solution:** Change the port in `.env`:
```
PORT=3001
```

### Error: "prisma is not defined"

**Solution:** You need to update the imports to use the storage adapter. See `MIGRATION_INSTRUCTIONS.md`

### Server won't start

**Solution:** Check if all dependencies are installed:
```bash
npm list
```

---

## 📁 Default Data

Your system starts with these pre-loaded:

### Customer
- ID: `customer_default`
- Name: "Demo Company"

### Site
- ID: `site_default`
- Name: "Main Office"

### Period
- ID: `period_default`
- Name: "2024 Q1"
- Dates: Jan 1 - Mar 31, 2024

### Emission Factors
All Scope 1, 2, and 3 factors are pre-loaded!

---

## 🎯 Next Steps

1. ✅ **Start the server** - `npm run dev:backend`
2. ✅ **Upload a CSV** - Use `test-upload.bat` or manual upload
3. ✅ **View activities** - Check your uploaded data
4. ✅ **Run calculations** - Get emissions by scope
5. ✅ **See results** - View your carbon footprint

---

## 📚 More Information

- **WORKING_WITHOUT_DATABASE.md** - Complete guide
- **MIGRATION_INSTRUCTIONS.md** - How to update code
- **NO_DATABASE_SETUP_SUMMARY.md** - Overview

---

## 🆘 Need Help?

### Check Server Status
```bash
curl http://localhost:3000
```

Should return: "Co-Lab VERITAS™ API is running"

### View Logs
Check the console where you ran `npm run dev:backend`

### Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Get template
curl http://localhost:3000/api/ingest/template
```

---

## ✅ Success Checklist

- [ ] npm install completed
- [ ] .env file created
- [ ] Server started successfully
- [ ] CSV uploaded successfully
- [ ] Activities visible
- [ ] Calculations run successfully
- [ ] Results show Scope 1, 2, 3 totals

---

**You're ready to go!** 🎉

Start with: `npm run dev:backend`
