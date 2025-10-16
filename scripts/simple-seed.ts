import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...');

  // Upsert demo customer
  const customer = await prisma.customer.upsert({
    where: { code: 'ACME001' },
    update: {},
    create: {
      name: 'Acme Corporation',
      code: 'ACME001',
      category: 'MANUFACTURING',
      level: 'ENTERPRISE',
    },
  });
  console.log('✅ Upserted customer:', customer.name);

  // Upsert demo user with hashed password
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {
      password: hashedPassword, // Update password in case it changed
    },
    create: {
      email: 'admin@acme.com',
      password: hashedPassword,
      role: 'ADMIN',
      customerId: customer.id,
    },
  });
  console.log('✅ Upserted admin user:', adminUser.email);

  // Upsert a simple site
  let site = await prisma.site.findFirst({
    where: {
      customerId: customer.id,
      name: 'Main Office',
    },
  });

  if (!site) {
    site = await prisma.site.create({
      data: {
        customerId: customer.id,
        name: 'Main Office',
        description: 'Corporate headquarters',
        address: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        postalCode: '10001',
        siteType: 'OFFICE',
        floorArea: 5000.0,
        employeeCount: 150,
        contactName: 'Facilities Manager',
        contactEmail: 'facilities@acme.com',
        contactPhone: '+1-555-0123',
      },
    });
  }
  console.log('✅ Upserted site:', site.name);

  // Upsert a reporting period
  // Since Prisma doesn't support unique constraints with null values on SQLite well,
  // we'll check for existence manually before creating.
  let period = await prisma.reportingPeriod.findFirst({
    where: {
      customerId: customer.id,
      year: 2024,
      quarter: null,
    },
  });

  if (!period) {
    period = await prisma.reportingPeriod.create({
      data: {
        customerId: customer.id,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
        year: 2024,
        quarter: null,
        status: 'OPEN',
      },
    });
  }
  console.log('✅ Upserted reporting period for 2024');

  // Create a sample upload
  if (period) {
    await prisma.upload.create({
      data: {
        customerId: customer.id,
        siteId: site.id,
        periodId: period.id,
        originalFilename: 'sample-data.csv',
        filename: 'sample-data.csv',
        s3Key: 'sample-upload.csv',
        uploadedBy: adminUser.id,
        status: 'COMPLETED',
      },
    });
    console.log('✅ Created sample upload');
  }

  console.log('🎉 Simple database seeding completed!');
  console.log('\n📋 Demo Credentials:');
  console.log('Email: admin@acme.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
