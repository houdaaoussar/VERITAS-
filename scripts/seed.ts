import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      code: 'ACME',
      category: 'Manufacturing',
      level: 'Enterprise',
    },
  });
  console.log(`✅ Created customer: ${customer.name}`);

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      role: 'ADMIN',
      customerId: customer.id,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@acme.com',
      password: hashedPassword,
      role: 'EDITOR',
      customerId: customer.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      password: hashedPassword,
      role: 'VIEWER',
      customerId: customer.id,
    },
  });
  console.log('✅ Created users: Admin, Editor, Viewer');

  // Create demo sites
  const mainOffice = await prisma.site.create({
    data: {
      customerId: customer.id,
      name: 'Main Office',
      country: 'United States',
      region: 'NY',
      postalCode: '10001',
    },
  });

  const warehouse = await prisma.site.create({
    data: {
      customerId: customer.id,
      name: 'Distribution Center',
      country: 'United States',
      region: 'NJ',
      postalCode: '07102',
    },
  });

  const factory = await prisma.site.create({
    data: {
      customerId: customer.id,
      name: 'Manufacturing Plant',
      country: 'United States',
      region: 'NY',
      postalCode: '14201',
    },
  });
  console.log('✅ Created demo sites: Main Office, Distribution Center, Manufacturing Plant');

  // Create reporting periods
  for (let year = 2023; year <= 2024; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      await prisma.reportingPeriod.create({
        data: {
          customerId: customer.id,
          year,
          quarter,
          fromDate: new Date(`${year}-${(quarter - 1) * 3 + 1}-01`),
          toDate: new Date(`${year}-${quarter * 3}-${quarter === 1 ? 31 : quarter === 2 ? 30 : quarter === 3 ? 30 : 31}`),
          status: 'OPEN',
        },
      });
    }
  }
  console.log('✅ Created reporting periods for 2023-2024');

  // Seed emission factors
  const emissionFactors = [
    {
      category: 'NATURAL_GAS',
      geography: 'UK',
      year: 2025,
      inputUnit: 'kWh',
      outputUnit: 'kgCO2e',
      value: 0.0002027,
      sourceName: 'DESNZ',
      sourceVersion: '2025',
      gwpVersion: 'AR6',
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-12-31'),
    },
  ];

  for (const factor of emissionFactors) {
    await prisma.emissionFactor.create({ data: factor });
  }
  console.log('✅ Created emission factors');

  // Create sample activities
  const currentPeriod = await prisma.reportingPeriod.findFirst({ where: { year: 2024, quarter: 4 } });
  
  const activities = [
    {
      siteId: mainOffice.id,
      periodId: currentPeriod!.id,
      type: 'ELECTRICITY_CONSUMPTION',
      quantity: 12500,
      unit: 'kWh',
      activityDateStart: new Date('2024-10-15'),
      activityDateEnd: new Date('2024-10-15'),
      source: 'SEED',
      notes: 'Monthly electricity consumption',
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }
  console.log('✅ Created sample activities');

  // Create sample projects
  const projects = [
    {
      customerId: customer.id,
      type: 'ENERGY_EFFICIENCY',
      description: 'Replace all fluorescent lighting with LED fixtures across all facilities',
      startDate: new Date('2024-01-01'),
      lifecycleState: 'IN_PROGRESS',
      estAnnualSavingKgCo2e: 15.5,
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }
  console.log('✅ Created sample projects');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin: admin@acme.com / password123');
  console.log('Editor: editor@acme.com / password123');
  console.log('Viewer: viewer@acme.com / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
