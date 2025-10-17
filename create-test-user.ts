import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Find the customer
    const customer = await prisma.customer.findFirst();
    
    if (!customer) {
      console.error('No customer found. Run npm run db:seed first.');
      process.exit(1);
    }
    
    console.log(`Found customer: ${customer.name} (${customer.id})`);
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    });
    
    if (existingUser) {
      console.log('Test user already exists. Deleting and recreating...');
      await prisma.user.delete({
        where: { email: 'test@test.com' }
      });
    }
    
    // Also try admin@acme.com
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acme.com' }
    });
    
    if (existingAdmin) {
      console.log('Admin user exists. Updating password...');
      const adminPassword = await bcrypt.hash('password123', 10);
      await prisma.user.update({
        where: { email: 'admin@acme.com' },
        data: { password: adminPassword }
      });
      console.log('✅ Admin password updated');
    }
    
    // Create test user with known password
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        customerId: customer.id
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log(`Email: test@test.com`);
    console.log(`Password: test123`);
    console.log(`User ID: ${user.id}`);
    console.log(`Customer ID: ${user.customerId}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
