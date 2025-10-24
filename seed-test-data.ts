/**
 * Seed Test Data Script
 * Creates sample customers, sites, and reporting periods for testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  try {
    // 1. Create Test Customer
    console.log('📊 Creating test customer...');
    const customer = await prisma.customer.upsert({
      where: { code: 'TEST001' },
      update: {},
      create: {
        name: 'Test Company Ltd',
        code: 'TEST001',
        category: 'Manufacturing',
        level: 'Enterprise'
      }
    });
    console.log(`✅ Customer created: ${customer.name} (ID: ${customer.id})\n`);

    // 2. Create Test User
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('Test123456', 12);
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        customerId: customer.id
      }
    });
    console.log(`✅ User created: ${user.email}\n`);

    // 3. Create Test Sites
    console.log('🏢 Creating test sites...');
    const site1 = await prisma.site.upsert({
      where: { id: 'temp-id-1' },
      update: {},
      create: {
        customerId: customer.id,
        name: 'Headquarters',
        country: 'UK',
        city: 'London',
        address: '123 Business Street',
        region: 'Greater London',
        postalCode: 'SW1A 1AA',
        siteType: 'Office',
        floorArea: 5000,
        employeeCount: 150
      }
    }).catch(async () => {
      // If ID doesn't exist, create new
      return await prisma.site.create({
        data: {
          customerId: customer.id,
          name: 'Headquarters',
          country: 'UK',
          city: 'London',
          address: '123 Business Street',
          region: 'Greater London',
          postalCode: 'SW1A 1AA',
          siteType: 'Office',
          floorArea: 5000,
          employeeCount: 150
        }
      });
    });
    console.log(`✅ Site created: ${site1.name} (ID: ${site1.id})`);

    const site2 = await prisma.site.create({
      data: {
        customerId: customer.id,
        name: 'Manufacturing Plant',
        country: 'UK',
        city: 'Birmingham',
        address: '456 Industrial Road',
        region: 'West Midlands',
        postalCode: 'B1 1AA',
        siteType: 'Factory',
        floorArea: 15000,
        employeeCount: 300
      }
    }).catch(() => null);
    if (site2) {
      console.log(`✅ Site created: ${site2.name} (ID: ${site2.id})`);
    }
    console.log('');

    // 4. Create Reporting Periods
    console.log('📅 Creating reporting periods...');
    const period2024 = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
        year: 2024,
        quarter: null,
        status: 'OPEN'
      }
    }).catch(async () => {
      // If already exists, get it
      return await prisma.reportingPeriod.findFirst({
        where: {
          customerId: customer.id,
          year: 2024,
          quarter: null
        }
      });
    });
    console.log(`✅ Period created: 2024 Annual (ID: ${period2024?.id})`);

    const periodQ1 = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-03-31'),
        year: 2024,
        quarter: 1,
        status: 'OPEN'
      }
    }).catch(async () => {
      return await prisma.reportingPeriod.findFirst({
        where: {
          customerId: customer.id,
          year: 2024,
          quarter: 1
        }
      });
    });
    console.log(`✅ Period created: 2024 Q1 (ID: ${periodQ1?.id})\n`);

    // 5. Create Sample Activities
    console.log('⚡ Creating sample activities...');
    if (site1 && period2024) {
      const activity1 = await prisma.activity.create({
        data: {
          siteId: site1.id,
          periodId: period2024.id,
          type: 'ELECTRICITY',
          quantity: 5000,
          unit: 'kWh',
          activityDateStart: new Date('2024-01-01'),
          activityDateEnd: new Date('2024-01-31'),
          source: 'MANUAL_ENTRY',
          notes: 'January electricity consumption'
        }
      }).catch(() => null);
      if (activity1) {
        console.log(`✅ Activity created: Electricity - 5000 kWh`);
      }

      const activity2 = await prisma.activity.create({
        data: {
          siteId: site1.id,
          periodId: period2024.id,
          type: 'NATURAL_GAS',
          quantity: 2000,
          unit: 'kWh',
          activityDateStart: new Date('2024-01-01'),
          activityDateEnd: new Date('2024-01-31'),
          source: 'MANUAL_ENTRY',
          notes: 'January gas consumption'
        }
      }).catch(() => null);
      if (activity2) {
        console.log(`✅ Activity created: Natural Gas - 2000 kWh`);
      }
    }
    console.log('');

    // Summary
    console.log('✅ Test data seeded successfully!\n');
    console.log('📋 Summary:');
    console.log('===========');
    console.log(`Customer: ${customer.name} (${customer.code})`);
    console.log(`Customer ID: ${customer.id}`);
    console.log(`User Email: test@example.com`);
    console.log(`User Password: Test123456`);
    console.log(`Sites: ${site2 ? 2 : 1}`);
    console.log(`Periods: 2`);
    console.log('');
    console.log('🚀 You can now:');
    console.log('1. Login with test@example.com / Test123456');
    console.log('2. Select "Test Company Ltd" as customer');
    console.log('3. Select "2024 Annual" or "2024 Q1" as reporting period');
    console.log('4. Upload files or enter estimation data');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestData()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
