import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a test customer
    const customer = await prisma.customer.create({
      data: {
        name: 'Test Company',
        code: 'TEST001',
        category: 'Enterprise',
        level: 'Premium'
      }
    });

    console.log('✅ Customer created:', customer.name);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        customerId: customer.id
      }
    });

    console.log('✅ Admin user created:');
    console.log('   Email:', user.email);
    console.log('   Password: admin123');
    console.log('   Role:', user.role);

    // Create a test site
    const site = await prisma.site.create({
      data: {
        name: 'Main Office',
        country: 'USA',
        city: 'New York',
        customerId: customer.id
      }
    });

    console.log('✅ Site created:', site.name);

    // Create a reporting period
    const period = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        year: 2024,
        quarter: 1,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-03-31'),
        status: 'OPEN'
      }
    });

    console.log('✅ Reporting period created: 2024 Q1');

    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
