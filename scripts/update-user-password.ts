import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Updating user password...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Update the admin user
  await prisma.user.update({
    where: { email: 'admin@acme.com' },
    data: { password: hashedPassword }
  })

  console.log('✅ Admin user password updated with proper hash')
  console.log('📋 Login with: admin@acme.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
