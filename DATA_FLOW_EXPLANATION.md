# 📊 Data Upload Flow - Where Does Your Data Go?

## ✅ YES - Data Goes Directly to the Right Place!

When you upload the CSV template, here's exactly what happens:

---

## 🔄 Complete Data Flow

### Step 1: User Uploads CSV File
```bash
POST /api/ingest?customerId=xxx&periodId=yyy&save=true
File: emissions_data.csv
```

**Your CSV:**
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

---

### Step 2: System Validates
✅ Checks if customer exists  
✅ Checks if reporting period exists  
✅ Validates user has access  
✅ Validates file format  

---

### Step 3: System Parses CSV
The intelligent parser reads your CSV and maps columns:
- "Emission Source" → `emission_category`
- "Site/Location" → `site_name`
- "Activity Data" → `quantity`
- "Unit" → `unit`
- "Start Date" → `activity_date_start`
- "End Date" → `activity_date_end`
- "Notes" → `notes`

---

### Step 4: System Creates Upload Record
**Database Table:** `uploads`

```javascript
{
  id: "upload_123",
  customerId: "customer_456",
  periodId: "period_789",
  originalFilename: "emissions_data.csv",
  uploadedBy: "user_001",
  status: "processing",
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

### Step 5: System Saves Each Row as Activity
**Database Table:** `activities`

For each row in your CSV, the system creates an **Activity** record:

#### Example 1: Natural Gas
```javascript
{
  id: "activity_001",
  siteId: "site_main_office",      // Found by matching "Main Office"
  periodId: "period_789",           // From your upload parameters
  type: "Natural Gas",              // From "Emission Source" column
  quantity: 1500,                   // From "Activity Data" column
  unit: "kWh",                      // From "Unit" column
  activityDateStart: "2024-01-01",  // From "Start Date" column
  activityDateEnd: "2024-01-31",    // From "End Date" column
  source: "FILE_UPLOAD",            // Automatically set
  uploadId: "upload_123",           // Links to upload record
  notes: "Office heating",          // From "Notes" column
  createdAt: "2024-01-15T10:30:01Z"
}
```

#### Example 2: Electricity
```javascript
{
  id: "activity_002",
  siteId: "site_main_office",
  periodId: "period_789",
  type: "Electricity",
  quantity: 25000,
  unit: "kWh",
  activityDateStart: "2024-01-01",
  activityDateEnd: "2024-01-31",
  source: "FILE_UPLOAD",
  uploadId: "upload_123",
  notes: "Office electricity",
  createdAt: "2024-01-15T10:30:02Z"
}
```

#### Example 3: Diesel
```javascript
{
  id: "activity_003",
  siteId: "site_fleet",             // Found by matching "Fleet"
  periodId: "period_789",
  type: "Diesel",
  quantity: 800,
  unit: "litres",
  activityDateStart: "2024-01-01",
  activityDateEnd: "2024-01-31",
  source: "FILE_UPLOAD",
  uploadId: "upload_123",
  notes: "Company vehicles",
  createdAt: "2024-01-15T10:30:03Z"
}
```

---

### Step 6: System Updates Upload Status
**Database Table:** `uploads`

```javascript
{
  id: "upload_123",
  status: "completed",              // Changed from "processing"
  errorCount: 0,                    // No errors
  validationResults: {
    rows_imported: 3,
    rows_failed: 0,
    errors: []
  }
}
```

---

### Step 7: You Get Response
```json
{
  "status": "success",
  "message": "Successfully processed and saved 3 rows",
  "rows_imported": 3,
  "rows_failed": 0,
  "upload_id": "upload_123",
  "activities_created": 3,
  "save_errors": []
}
```

---

## 📊 Database Structure

### Your Data is Stored in the `activities` Table

**Schema:**
```
activities
├── id (unique identifier)
├── siteId (links to sites table)
├── periodId (links to reporting_periods table)
├── type (emission source: "Natural Gas", "Electricity", etc.)
├── quantity (amount consumed)
├── unit (measurement unit)
├── activityDateStart (start date)
├── activityDateEnd (end date)
├── source ("FILE_UPLOAD")
├── uploadId (links to uploads table)
├── notes (optional notes)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

**Relationships:**
- Each activity belongs to a **Site** (via `siteId`)
- Each activity belongs to a **Reporting Period** (via `periodId`)
- Each activity links to an **Upload** record (via `uploadId`)
- Each activity can have multiple **Emission Results** (after calculations)

---

## 🎯 What Happens Next?

### After Upload, Your Activities Are Ready For:

### 1. **Viewing Activities**
```bash
GET /api/activities?customerId=xxx&periodId=yyy
```

**Response:**
```json
{
  "activities": [
    {
      "id": "activity_001",
      "type": "Natural Gas",
      "quantity": 1500,
      "unit": "kWh",
      "site": {
        "name": "Main Office"
      },
      "period": {
        "year": 2024,
        "quarter": 1
      }
    },
    // ... more activities
  ]
}
```

### 2. **Running Calculations**
```bash
POST /api/calculations/runs
{
  "customerId": "xxx",
  "periodId": "yyy"
}
```

**What happens:**
- System reads all activities for the period
- Determines scope for each activity (Scope 1, 2, or 3)
- Selects appropriate emission factors
- Calculates CO2e emissions
- Stores results in `emission_results` table

**Creates Emission Results:**
```javascript
{
  id: "result_001",
  activityId: "activity_001",
  calcRunId: "calc_run_001",
  scope: "SCOPE_1",                    // Auto-determined
  factorId: "factor_natural_gas",      // Auto-selected
  resultKgCo2e: 0.304,                 // Calculated: 1500 × 0.0002027
  createdAt: "2024-01-15T10:35:00Z"
}
```

### 3. **Viewing Results**
```bash
GET /api/calculations/runs/{calc_run_id}/results
```

**Response:**
```json
{
  "aggregation": {
    "scope1Total": 0.495,      // Natural Gas + Diesel
    "scope2Total": 4.835,      // Electricity
    "scope3Total": 0,
    "totalEmissions": 5.330,
    "resultCount": 3
  },
  "results": [
    {
      "activity": {
        "type": "Natural Gas",
        "quantity": 1500,
        "unit": "kWh"
      },
      "scope": "SCOPE_1",
      "resultKgCo2e": 0.304,
      "factor": {
        "sourceName": "DESNZ",
        "sourceVersion": "2025"
      }
    }
    // ... more results
  ]
}
```

---

## ✅ Summary: Where Does Your Data Go?

### Direct Path:
```
CSV File
  ↓
Upload Endpoint (/api/ingest)
  ↓
Parse & Validate
  ↓
Create Upload Record (uploads table)
  ↓
Create Activity Records (activities table) ← YOUR DATA IS HERE
  ↓
Ready for Calculations
  ↓
Emission Results (emission_results table)
```

---

## 🔍 How to Verify Your Data Was Saved

### Method 1: Check the Upload Response
Look for:
```json
{
  "activities_created": 3,  // Number of rows saved
  "save_errors": []         // Should be empty
}
```

### Method 2: Query Activities
```bash
GET /api/activities?customerId=xxx&periodId=yyy
```

You should see all your uploaded activities.

### Method 3: Check Upload History
```bash
GET /api/uploads?customerId=xxx
```

You should see your upload record with status "completed".

---

## 🚨 What If Sites Don't Exist?

### Current Behavior:
If you upload data for "Main Office" but that site doesn't exist in the database:
- ❌ Row will **fail** to save
- ❌ Error: "Site not found: Main Office"

### Solution Options:

#### Option 1: Create Sites First
```bash
POST /api/sites
{
  "customerId": "xxx",
  "name": "Main Office",
  "country": "UK"
}
```

#### Option 2: Enable Auto-Creation
The system can be configured to automatically create sites when they don't exist.

**Would you like me to add auto-site-creation functionality?**

---

## 📋 Complete Example

### Your CSV:
```csv
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
```

### Becomes 3 Activity Records:

**Database: `activities` table**
| id | siteId | periodId | type | quantity | unit | dates | uploadId |
|----|--------|----------|------|----------|------|-------|----------|
| act_001 | site_main | period_q1 | Natural Gas | 1500 | kWh | Jan 2024 | upload_123 |
| act_002 | site_main | period_q1 | Electricity | 25000 | kWh | Jan 2024 | upload_123 |
| act_003 | site_fleet | period_q1 | Diesel | 800 | litres | Jan 2024 | upload_123 |

### After Running Calculations:

**Database: `emission_results` table**
| id | activityId | scope | resultKgCo2e | factorSource |
|----|------------|-------|--------------|--------------|
| res_001 | act_001 | SCOPE_1 | 0.304 | DESNZ 2025 |
| res_002 | act_002 | SCOPE_2 | 4.835 | DESNZ 2025 |
| res_003 | act_003 | SCOPE_1 | 0.191 | DESNZ 2025 |

---

## ✅ Final Answer

**YES!** When you upload the CSV template with `save=true`:

1. ✅ Data goes **directly** to the `activities` table
2. ✅ Each CSV row becomes an **Activity** record
3. ✅ Activities are linked to your **Customer** and **Reporting Period**
4. ✅ Activities are **ready for emission calculations**
5. ✅ You can **view, edit, or delete** activities via API
6. ✅ You can **run calculations** to get emission results

**Your data is stored permanently and ready to use!** 🎉
