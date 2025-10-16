import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with calculations...');

  // Get existing customer and site
  const customer = await prisma.customer.findFirst({
    where: { name: 'Acme Corporation' }
  });

  const site = await prisma.site.findFirst({
    where: { customerId: customer?.id }
  });

  const period = await prisma.reportingPeriod.findFirst({
    where: { customerId: customer?.id, year: 2024 }
  });

  if (!customer || !site || !period) {
    console.log('❌ Missing required data. Run simple-seed.ts first.');
    return;
  }

  // Create some sample activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        siteId: site.id,
        periodId: period.id,
        type: 'ELECTRICITY_CONSUMPTION',
        quantity: 50000,
        unit: 'kWh',
        activityDateStart: new Date('2024-01-01'),
        activityDateEnd: new Date('2024-12-31'),
        source: 'Utility bills'
      }
    }),
    prisma.activity.create({
      data: {
        siteId: site.id,
        periodId: period.id,
        type: 'NATURAL_GAS_CONSUMPTION',
        quantity: 25000,
        unit: 'kWh',
        activityDateStart: new Date('2024-01-01'),
        activityDateEnd: new Date('2024-12-31'),
        source: 'Utility bills'
      }
    }),
    prisma.activity.create({
      data: {
        siteId: site.id,
        periodId: period.id,
        type: 'BUSINESS_TRAVEL',
        quantity: 15000,
        unit: 'km',
        activityDateStart: new Date('2024-01-01'),
        activityDateEnd: new Date('2024-12-31'),
        source: 'Travel records'
      }
    })
  ]);

  console.log('✅ Created sample activities');

  // Create emission factors
  const factors = await Promise.all([
    prisma.emissionFactor.create({
      data: {
        category: 'Electricity',
        geography: 'US',
        year: 2024,
        value: 0.4,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        sourceName: 'EPA eGRID',
        sourceVersion: '2024',
        gwpVersion: 'AR6',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31')
      }
    }),
    prisma.emissionFactor.create({
      data: {
        category: 'Natural Gas',
        geography: 'US',
        year: 2024,
        value: 0.2,
        inputUnit: 'kWh',
        outputUnit: 'kgCO2e',
        sourceName: 'EPA',
        sourceVersion: '2024',
        gwpVersion: 'AR6',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31')
      }
    }),
    prisma.emissionFactor.create({
      data: {
        category: 'Transport',
        geography: 'US',
        year: 2024,
        value: 0.15,
        inputUnit: 'km',
        outputUnit: 'kgCO2e',
        sourceName: 'DEFRA',
        sourceVersion: '2024',
        gwpVersion: 'AR6',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31')
      }
    })
  ]);

  console.log('✅ Created emission factors');

  // Get admin user for requester
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@acme.com' }
  });

  // Create a calculation run
  const calcRun = await prisma.calcRun.create({
    data: {
      customerId: customer.id,
      periodId: period.id,
      requestedBy: adminUser?.id || '',
      status: 'COMPLETED',
      factorLibraryVersion: 'DEFRA-2025.1',
      completedAt: new Date()
    }
  });

  console.log('✅ Created calculation run');

  // Create emission results
  const results = await Promise.all([
    prisma.emissionResult.create({
      data: {
        calcRunId: calcRun.id,
        activityId: activities[0].id,
        factorId: factors[0].id,
        scope: 'SCOPE_2',
        method: 'Direct calculation',
        quantityBase: 50000,
        unitBase: 'kWh',
        resultKgCo2e: 50000 * 0.4 // 20,000 kg CO2e
      }
    }),
    prisma.emissionResult.create({
      data: {
        calcRunId: calcRun.id,
        activityId: activities[1].id,
        factorId: factors[1].id,
        scope: 'SCOPE_1',
        method: 'Direct calculation',
        quantityBase: 25000,
        unitBase: 'kWh',
        resultKgCo2e: 25000 * 0.2 // 5,000 kg CO2e
      }
    }),
    prisma.emissionResult.create({
      data: {
        calcRunId: calcRun.id,
        activityId: activities[2].id,
        factorId: factors[2].id,
        scope: 'SCOPE_3',
        method: 'Direct calculation',
        quantityBase: 15000,
        unitBase: 'km',
        resultKgCo2e: 15000 * 0.15 // 2,250 kg CO2e
      }
    })
  ]);

  console.log('✅ Created emission results');

  const totalEmissions = results.reduce((sum, result) => sum + result.resultKgCo2e, 0);
  console.log(`🎉 Seeding completed! Total emissions: ${totalEmissions.toFixed(2)} kg CO2e`);
  
  console.log('\n📋 Demo Credentials:');
  console.log('Email: admin@acme.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
