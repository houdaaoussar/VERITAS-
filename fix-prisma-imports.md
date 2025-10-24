# Prisma Import Fixes Applied

## Files Updated

The following route files have been updated to use the centralized database client:

1. ✅ `src/routes/uploads.ts` - Fixed
2. ✅ `src/routes/sites.ts` - Fixed  
3. ✅ `src/routes/reporting.ts` - Fixed
4. ⏳ `src/routes/projects.ts` - Needs fix
5. ⏳ `src/routes/emissionsInventory.ts` - Needs fix
6. ⏳ `src/routes/customers.ts` - Needs fix
7. ⏳ `src/routes/calculations.ts` - Needs fix
8. ⏳ `src/routes/auth.ts` - Needs fix
9. ⏳ `src/routes/activities.ts` - Needs fix

## Services Updated

1. ✅ `src/services/estimationService.ts` - Fixed
2. ✅ `src/services/emissionFactors.ts` - Fixed (added getFactorByCategory method)
3. ✅ `src/services/calculationEngine.ts` - Fixed

## Changes Made

### Pattern Applied:
```typescript
// OLD:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// NEW:
import { prisma } from '../config/database';
// Keep Prisma import if needed for types:
import { Prisma } from '@prisma/client';
```

## Remaining Files to Fix

Run these commands to fix remaining files:

```bash
# Fix projects.ts
# Fix emissionsInventory.ts
# Fix customers.ts
# Fix calculations.ts
# Fix auth.ts
# Fix activities.ts
```
