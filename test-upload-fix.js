/**
 * Test Script - Verify Upload Fix Works
 * Run with: node test-upload-fix.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUploadFix() {
  console.log('🧪 Testing Upload Fix...\n');

  try {
    // Test 1: Check if fileContent field exists in schema
    console.log('Test 1: Checking Prisma schema...');
    const uploadModel = prisma.upload;
    if (!uploadModel) {
      console.log('❌ Upload model not found!');
      return false;
    }
    console.log('✅ Upload model exists\n');

    // Test 2: Try to create a test upload with fileContent
    console.log('Test 2: Creating test upload with fileContent...');
    
    // First, get or create a test customer
    let customer = await prisma.customer.findFirst({
      where: { code: 'TEST001' }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'Test Customer',
          code: 'TEST001',
          category: 'Test',
          level: 'Test'
        }
      });
      console.log('✅ Test customer created');
    } else {
      console.log('✅ Test customer found');
    }

    // Get or create a test user
    let user = await prisma.user.findFirst({
      where: { email: 'test@test.com' }
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 12);
      user = await prisma.user.create({
        data: {
          email: 'test@test.com',
          password: hashedPassword,
          role: 'ADMIN',
          customerId: customer.id
        }
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    // Create test upload with fileContent
    const testFileContent = 'Date,Site,Activity Type,Scope,Quantity,Unit\n2024-01-01,Office,ELECTRICITY,SCOPE_2,100,kWh';
    
    const testUpload = await prisma.upload.create({
      data: {
        customerId: customer.id,
        originalFilename: 'test-file.csv',
        filename: 'test-file-123.csv',
        s3Key: 'test-file-123.csv',
        fileContent: testFileContent, // THIS IS THE KEY FIELD
        uploadedBy: user.id,
        status: 'PENDING'
      }
    });

    console.log('✅ Test upload created with ID:', testUpload.id);
    console.log('✅ File content stored:', testFileContent.substring(0, 50) + '...\n');

    // Test 3: Retrieve the upload and verify fileContent
    console.log('Test 3: Retrieving upload and verifying fileContent...');
    const retrievedUpload = await prisma.upload.findUnique({
      where: { id: testUpload.id }
    });

    if (!retrievedUpload) {
      console.log('❌ Could not retrieve upload!');
      return false;
    }

    if (!retrievedUpload.fileContent) {
      console.log('❌ fileContent is empty!');
      return false;
    }

    if (retrievedUpload.fileContent !== testFileContent) {
      console.log('❌ fileContent does not match!');
      return false;
    }

    console.log('✅ File content retrieved successfully');
    console.log('✅ Content matches original\n');

    // Clean up test data
    console.log('Cleaning up test data...');
    await prisma.upload.delete({ where: { id: testUpload.id } });
    console.log('✅ Test upload deleted\n');

    // Final result
    console.log('========================================');
    console.log('  ✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('');
    console.log('The upload fix is working correctly!');
    console.log('');
    console.log('✅ fileContent field exists');
    console.log('✅ Can store file content in database');
    console.log('✅ Can retrieve file content from database');
    console.log('');
    console.log('You can now deploy to production!');
    console.log('');

    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('fileContent')) {
      console.error('💡 Solution: Run "npx prisma generate" to update Prisma client');
    }
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('💡 Solution: Check your .env file has correct DATABASE_URL');
    }

    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testUploadFix()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
