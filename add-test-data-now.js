/**
 * Add Test Data - Quick Script
 * Run with: node add-test-data-now.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTestData() {
  console.log('🌱 Adding test data for estimation...\n');

  try {
    // 1. Create Customer
    console.log('Creating customer...');
    const customer = await prisma.customer.upsert({
      where: { code: 'DEMO001' },
      update: {},
      create: {
        name: 'Demo Company Ltd',
        code: 'DEMO001',
        category: 'Technology',
        level: 'Enterprise'
      }
    });
    console.log(`✅ Customer: ${customer.name} (ID: ${customer.id})\n`);

    // 2. Create User
    console.log('Creating user...');
    const hashedPassword = await bcrypt.hash('Demo123456', 12);
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        customerId: customer.id
      }
    });
    console.log(`✅ User: ${user.email}\n`);

    // 3. Create Sites
    console.log('Creating sites...');
    const site1 = await prisma.site.upsert({
      where: { 
        customerId_name: {
          customerId: customer.id,
          name: 'Main Office'
        }
      },
      update: {},
      create: {
        customerId: customer.id,
        name: 'Main Office',
        country: 'UK',
        city: 'London',
        address: '100 Demo Street'
      }
    });
    console.log(`✅ Site: ${site1.name}\n`);

    // 4. Create Reporting Periods
    console.log('Creating reporting periods...');
    
    const period2024 = await prisma.reportingPeriod.upsert({
      where: {
        customerId_year_quarter: {
          customerId: customer.id,
          year: 2024,
          quarter: 0
        }
      },
      update: {},
      create: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
        year: 2024,
        quarter: 0,
        status: 'OPEN'
      }
    });
    console.log(`✅ Period: 2024 Annual (ID: ${period2024.id})`);

    const periodQ1 = await prisma.reportingPeriod.upsert({
      where: {
        customerId_year_quarter: {
          customerId: customer.id,
          year: 2024,
          quarter: 1
        }
      },
      update: {},
      create: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-03-31'),
        year: 2024,
        quarter: 1,
        status: 'OPEN'
      }
    });
    console.log(`✅ Period: 2024 Q1 (ID: ${periodQ1.id})\n`);

    // Summary
    console.log('========================================');
    console.log('  ✅ TEST DATA ADDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('=====================');
    console.log('Email: demo@example.com');
    console.log('Password: Demo123456');
    console.log('');
    console.log('📊 Data Created:');
    console.log('================');
    console.log(`Customer: ${customer.name}`);
    console.log(`Customer ID: ${customer.id}`);
    console.log('Sites: 1 (Main Office)');
    console.log('Periods: 2 (2024 Annual, 2024 Q1)');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('==============');
    console.log('1. Refresh your browser');
    console.log('2. Login with demo@example.com / Demo123456');
    console.log('3. Go to Estimation page');
    console.log('4. Select "Demo Company Ltd"');
    console.log('5. Select "2024 Annual" or "2024 Q1"');
    console.log('6. Enter estimation data');
    console.log('7. Calculate emissions!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
addTestData()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
