# 📊 Scope 3 Estimation Feature - Implementation Guide

## Overview

The **Estimation Inputs** feature allows VERITAS™ users to estimate Scope 3 emissions when direct activity data is not available. This is particularly useful for:

- **Employee Commuting** - When you don't have individual commute data
- **Business Travel** - When you only have spend data
- **Purchased Goods & Services** - Spend-based estimation
- **Waste Generated** - When detailed waste tracking isn't available

---

## 🎯 What's Been Implemented

### ✅ Backend Components

1. **Prisma Schema** (`prisma/schema.prisma`)
   - New `EstimationInput` model with all necessary fields
   - Relationships to Customer, ReportingPeriod, and User
   - Unique constraint per customer/period

2. **Estimation Service** (`src/services/estimationService.ts`)
   - `estimateEmployeeCommuting()` - Distance-based calculation
   - `estimateBusinessTravel()` - Flight and spend-based
   - `estimatePurchasedGoods()` - Spend-based using DEFRA factors
   - `estimateWaste()` - Waste treatment method-based
   - `calculateAllEstimations()` - Runs all calculations
   - Database CRUD operations

3. **API Routes** (`src/routes/estimations.ts`)
   - `GET /api/estimations/:customerId/:periodId` - Get estimation data
   - `POST /api/estimations` - Save estimation inputs
   - `POST /api/estimations/:customerId/:periodId/calculate` - Calculate emissions
   - `POST /api/estimations/:customerId/:periodId/preview` - Preview without saving
   - `DELETE /api/estimations/:customerId/:periodId` - Delete estimation data

4. **Server Integration** (`src/server-simple.ts`)
   - Estimation routes registered at `/api/estimations`

### ✅ Frontend Components

5. **Estimation Input Page** (`frontend/src/pages/EstimationInputPage.tsx`)
   - Comprehensive form for all estimation inputs
   - Real-time validation
   - Preview functionality
   - Save and calculate
   - Results visualization

---

## 📋 Database Schema

```prisma
model EstimationInput {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId
  customerId              String   @db.ObjectId
  reportingPeriodId       String   @db.ObjectId
  createdBy               String   @db.ObjectId
  
  // Employee Commuting
  numberOfEmployees       Int?
  avgCommuteKm            Float?
  avgWorkdaysPerYear      Int?
  transportSplitCar       Float?     // Percentage (0-100)
  transportSplitPublic    Float?     // Percentage (0-100)
  transportSplitWalk      Float?     // Percentage (0-100)
  
  // Business Travel
  businessTravelSpendGBP  Float?
  avgFlightDistanceKm     Float?
  numberOfFlights         Int?
  
  // Purchased Goods & Services
  annualSpendGoodsGBP     Float?
  annualSpendServicesGBP  Float?
  
  // Waste
  wasteTonnes             Float?
  wasteRecycledPercent    Float?     // Percentage (0-100)
  
  // Office/Facility
  officeAreaM2            Float?
  dataCenter              Boolean?   @default(false)
  dataCenterServers       Int?
  
  // Metadata
  confidenceLevel         String?    @default("MEDIUM") // HIGH, MEDIUM, LOW
  notes                   String?
  createdAt               DateTime   @default(now())
  updatedAt               DateTime   @updatedAt

  @@unique([customerId, reportingPeriodId])
}
```

---

## 🔧 How to Use

### 1. Run Database Migration

```bash
# Generate Prisma client with new schema
npx prisma generate

# If using a database, run migration
npx prisma migrate dev --name add_estimation_inputs
```

### 2. Access the Feature

**Frontend Route:**
```
/reporting/:periodId/estimation
```

**Example:**
```
http://localhost:5173/reporting/period123/estimation
```

### 3. API Usage Examples

#### Save Estimation Data

```bash
POST /api/estimations
Content-Type: application/json

{
  "customerId": "customer123",
  "reportingPeriodId": "period456",
  "createdBy": "user789",
  "numberOfEmployees": 50,
  "avgCommuteKm": 15,
  "avgWorkdaysPerYear": 220,
  "transportSplitCar": 70,
  "transportSplitPublic": 20,
  "transportSplitWalk": 10,
  "businessTravelSpendGBP": 50000,
  "numberOfFlights": 20,
  "avgFlightDistanceKm": 1500,
  "annualSpendGoodsGBP": 100000,
  "annualSpendServicesGBP": 75000,
  "wasteTonnes": 5.5,
  "wasteRecycledPercent": 30,
  "confidenceLevel": "MEDIUM",
  "notes": "Estimated based on 2024 data"
}
```

#### Calculate Estimations

```bash
POST /api/estimations/customer123/period456/calculate
```

**Response:**
```json
{
  "estimations": [
    {
      "category": "Employee Commuting",
      "scope": "SCOPE_3",
      "estimatedKgCo2e": 56430.6,
      "confidenceLevel": "MEDIUM",
      "methodology": "Distance-based calculation using DEFRA 2025 emission factors",
      "inputs": {
        "numberOfEmployees": 50,
        "avgCommuteKm": 15,
        "avgWorkdaysPerYear": 220,
        "transportSplits": { "car": 0.7, "public": 0.2, "walk": 0.1 }
      }
    },
    {
      "category": "Business Travel",
      "scope": "SCOPE_3",
      "estimatedKgCo2e": 32376.1,
      "confidenceLevel": "MEDIUM",
      "methodology": "Flight distance and spend-based calculation",
      "inputs": {
        "numberOfFlights": 20,
        "avgFlightDistanceKm": 1500,
        "businessTravelSpendGBP": 50000
      }
    }
  ],
  "totalKgCo2e": 88806.7,
  "totalTonnesCo2e": 88.81
}
```

---

## 📐 Calculation Methodologies

### Employee Commuting

**Formula:**
```
Total Emissions = Σ (Employees × Commute Distance × 2 × Workdays × Transport Mode % × Emission Factor)
```

**Emission Factors (DEFRA 2025):**
- Car: 0.17119 kg CO₂e per km
- Public Transport (Bus): 0.10312 kg CO₂e per km
- Walk/Cycle: 0 kg CO₂e per km

**Example:**
- 50 employees
- 15 km average commute (one-way)
- 220 workdays/year
- 70% car, 20% public, 10% walk

```
Car: 50 × 15 × 2 × 220 × 0.70 × 0.17119 = 39,581 kg CO₂e
Public: 50 × 15 × 2 × 220 × 0.20 × 0.10312 = 6,806 kg CO₂e
Walk: 50 × 15 × 2 × 220 × 0.10 × 0 = 0 kg CO₂e
Total: 46,387 kg CO₂e (46.4 tonnes)
```

### Business Travel

**Flight-based:**
```
Emissions = Number of Flights × Average Distance × Emission Factor
```

**Spend-based:**
```
Emissions = Spend (£) × 0.5 kg CO₂e/£
```

**Emission Factor:**
- Economy long-haul: 0.24587 kg CO₂e per passenger-km

### Purchased Goods & Services

**Spend-based (DEFRA Economic I-O Factors):**
```
Goods Emissions = Spend (£) × 0.43 kg CO₂e/£
Services Emissions = Spend (£) × 0.21 kg CO₂e/£
```

### Waste Generated

**Formula:**
```
Recycled Emissions = Waste (tonnes) × Recycled % × 21 kg CO₂e/tonne
Landfill Emissions = Waste (tonnes) × (1 - Recycled %) × 467 kg CO₂e/tonne
```

**Emission Factors (DEFRA 2025):**
- Landfill: 467 kg CO₂e per tonne
- Recycling: 21 kg CO₂e per tonne
- Incineration: 21 kg CO₂e per tonne

---

## 🎨 Frontend Integration

### Add Route to Your Router

```typescript
// In your React Router configuration
import EstimationInputPage from './pages/EstimationInputPage';

<Route path="/reporting/:periodId/estimation" element={<EstimationInputPage />} />
```

### Add Navigation Link

```typescript
// In your dashboard or reporting period page
<Link to={`/reporting/${periodId}/estimation`}>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
    📊 Estimation Inputs
  </button>
</Link>
```

---

## 🔄 Integration with Calculation Engine

To integrate estimations into your main calculation engine, modify `src/services/calculationEngine.ts`:

```typescript
import { EstimationService } from './estimationService';

// In your calculation run method
async function runCalculation(customerId: string, periodId: string) {
  // 1. Calculate from actual activity data
  const actualEmissions = await calculateActualEmissions(customerId, periodId);
  
  // 2. Get estimation data
  const estimationInput = await EstimationService.getEstimationInput(customerId, periodId);
  
  // 3. Calculate estimated emissions for missing categories
  let estimatedEmissions = [];
  if (estimationInput) {
    estimatedEmissions = await EstimationService.calculateAllEstimations(estimationInput);
  }
  
  // 4. Combine results
  return {
    actualEmissions,
    estimatedEmissions,
    totalEmissions: calculateTotal(actualEmissions, estimatedEmissions),
    estimatedPercentage: calculateEstimatedPercentage(actualEmissions, estimatedEmissions)
  };
}
```

---

## 📊 Dashboard Visualization

### Show Estimated vs Actual Data

```typescript
// Example component
const EmissionsSummary = ({ data }) => {
  const actualTotal = data.actualEmissions.reduce((sum, e) => sum + e.kgCo2e, 0);
  const estimatedTotal = data.estimatedEmissions.reduce((sum, e) => sum + e.estimatedKgCo2e, 0);
  const total = actualTotal + estimatedTotal;
  const estimatedPercent = (estimatedTotal / total * 100).toFixed(1);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Emissions Breakdown</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Actual Data:</span>
          <span className="font-bold">{(actualTotal / 1000).toFixed(2)} tonnes</span>
        </div>
        
        <div className="flex justify-between">
          <span>Estimated Data:</span>
          <span className="font-bold text-yellow-600">{(estimatedTotal / 1000).toFixed(2)} tonnes</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">{(total / 1000).toFixed(2)} tonnes CO₂e</span>
        </div>
      </div>
      
      {estimatedPercent > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ {estimatedPercent}% of total emissions are estimated
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 🧪 Testing

### Test the API

```bash
# 1. Save estimation data
curl -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test123",
    "reportingPeriodId": "period123",
    "createdBy": "user123",
    "numberOfEmployees": 50,
    "avgCommuteKm": 15,
    "avgWorkdaysPerYear": 220,
    "transportSplitCar": 70,
    "transportSplitPublic": 20,
    "transportSplitWalk": 10
  }'

# 2. Calculate estimations
curl -X POST http://localhost:3000/api/estimations/test123/period123/calculate

# 3. Get estimation data
curl http://localhost:3000/api/estimations/test123/period123
```

---

## 📝 Best Practices

### 1. Data Quality Indicators

Always show confidence levels:
- **HIGH**: Based on accurate, recent data
- **MEDIUM**: Based on reasonable estimates
- **LOW**: Based on assumptions or old data

### 2. User Guidance

Provide tooltips and help text:
```typescript
<div className="flex items-center gap-2">
  <label>Number of Employees</label>
  <Tooltip content="Total number of employees who commute to the office">
    <InfoIcon className="w-4 h-4 text-gray-400" />
  </Tooltip>
</div>
```

### 3. Validation

- Ensure percentages sum to 100%
- Validate positive numbers
- Provide clear error messages

### 4. Transparency

Always indicate which emissions are estimated:
```typescript
<Badge color="yellow">Estimated</Badge>
```

---

## 🚀 Deployment

### 1. Build and Deploy

```bash
# Build backend
npm run build

# Build frontend
cd frontend && npm run build

# Deploy to AWS Amplify (automatic via git push)
git add .
git commit -m "Add estimation inputs feature"
git push origin main
```

### 2. Database Migration

If using MongoDB Atlas, the schema will be created automatically.

For PostgreSQL:
```bash
npx prisma migrate deploy
```

---

## 📈 Future Enhancements

### Planned Features

1. **CSV Template Upload**
   - Allow bulk upload of estimation data
   - Template: `estimation_template.csv`

2. **Historical Tracking**
   - Track changes in estimation inputs over time
   - Compare estimated vs actual when data becomes available

3. **Industry Benchmarks**
   - Compare estimations against industry averages
   - Suggest improvements

4. **Advanced Calculations**
   - Upstream emissions for purchased goods
   - Downstream emissions for sold products
   - Capital goods estimation

5. **Confidence Scoring**
   - Automatic confidence level calculation
   - Data quality metrics

---

## 🐛 Troubleshooting

### Common Issues

**1. Transport split doesn't sum to 100%**
```
Error: Transport mode percentages must sum to 100
Solution: Adjust the percentages to total exactly 100
```

**2. Missing required fields**
```
Error: customerId, reportingPeriodId, and createdBy are required
Solution: Ensure all required fields are provided
```

**3. Estimation not found**
```
Error: Estimation input not found
Solution: Create estimation data first using POST /api/estimations
```

---

## 📞 Support

For questions or issues:
1. Check the API documentation
2. Review calculation methodologies
3. Test with the preview endpoint first
4. Check browser console for errors

---

## ✅ Checklist

- [x] Prisma schema updated
- [x] Backend service created
- [x] API routes implemented
- [x] Frontend form created
- [x] Calculation logic implemented
- [x] Validation added
- [x] Documentation written
- [ ] Integration with main calculation engine
- [ ] Dashboard visualization
- [ ] CSV upload template
- [ ] Unit tests
- [ ] E2E tests

---

**Made with ❤️ for sustainable business**

🌱 **VERITAS™ - Accurate carbon accounting through estimation and measurement**
