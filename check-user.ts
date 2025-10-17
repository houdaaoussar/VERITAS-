import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@test.com' },
      include: { customer: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Customer ID:', user.customerId);
    console.log('Customer Name:', user.customer.name);
    console.log('');
    
    // Test password
    const testPassword = 'test123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`Password "test123" is ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // Also check all users
    console.log('\n📋 All users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true
      }
    });
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
