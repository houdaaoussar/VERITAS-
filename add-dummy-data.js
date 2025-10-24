/**
 * Quick Dummy Data Script
 * Run with: node add-dummy-data.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addDummyData() {
  console.log('🌱 Adding dummy data to database...\n');

  try {
    // 1. Create Customer
    console.log('📊 Creating customer...');
    const customer = await prisma.customer.create({
      data: {
        name: 'Demo Company Ltd',
        code: 'DEMO001',
        category: 'Technology',
        level: 'Enterprise'
      }
    }).catch(async (e) => {
      // If already exists, get it
      console.log('Customer already exists, fetching...');
      return await prisma.customer.findFirst({
        where: { code: 'DEMO001' }
      });
    });
    console.log(`✅ Customer: ${customer.name} (ID: ${customer.id})\n`);

    // 2. Create User
    console.log('👤 Creating user...');
    const hashedPassword = await bcrypt.hash('Demo123456', 12);
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        customerId: customer.id
      }
    }).catch(async (e) => {
      console.log('User already exists, fetching...');
      return await prisma.user.findFirst({
        where: { email: 'demo@example.com' }
      });
    });
    console.log(`✅ User: ${user.email}\n`);

    // 3. Create Sites
    console.log('🏢 Creating sites...');
    const site1 = await prisma.site.create({
      data: {
        customerId: customer.id,
        name: 'Main Office',
        country: 'UK',
        city: 'London',
        address: '100 Demo Street'
      }
    }).catch(async (e) => {
      return await prisma.site.findFirst({
        where: { 
          customerId: customer.id,
          name: 'Main Office'
        }
      });
    });
    console.log(`✅ Site: ${site1.name}\n`);

    // 4. Create Reporting Periods
    console.log('📅 Creating reporting periods...');
    const period2024 = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
        year: 2024,
        status: 'OPEN'
      }
    }).catch(async (e) => {
      return await prisma.reportingPeriod.findFirst({
        where: {
          customerId: customer.id,
          year: 2024
        }
      });
    });
    console.log(`✅ Period: 2024 Annual (ID: ${period2024.id})\n`);

    const periodQ1 = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-03-31'),
        year: 2024,
        quarter: 1,
        status: 'OPEN'
      }
    }).catch(async (e) => {
      return await prisma.reportingPeriod.findFirst({
        where: {
          customerId: customer.id,
          year: 2024,
          quarter: 1
        }
      });
    });
    console.log(`✅ Period: 2024 Q1 (ID: ${periodQ1.id})\n`);

    // Summary
    console.log('✅ Dummy data added successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('=====================');
    console.log('Email: demo@example.com');
    console.log('Password: Demo123456');
    console.log('');
    console.log('📊 Data Created:');
    console.log('================');
    console.log(`Customer: ${customer.name} (${customer.code})`);
    console.log(`Customer ID: ${customer.id}`);
    console.log('Sites: 1');
    console.log('Periods: 2 (2024 Annual, 2024 Q1)');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('==============');
    console.log('1. Refresh your browser (Ctrl+R or F5)');
    console.log('2. Login with demo@example.com / Demo123456');
    console.log('3. Select "Demo Company Ltd" from customer dropdown');
    console.log('4. Select "2024 Annual" or "2024 Q1" from period dropdown');
    console.log('');

  } catch (error) {
    console.error('❌ Error adding dummy data:', error);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('- Make sure your .env file has correct DATABASE_URL');
    console.error('- Ensure MongoDB is accessible');
    console.error('- Check if server is running');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addDummyData()
  .then(() => {
    console.log('✅ Done! Refresh your browser now.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
