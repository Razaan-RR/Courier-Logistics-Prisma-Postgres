import bcrypt from 'bcrypt'
import { prisma } from '../src/config/prisma.js'

const SALT_ROUNDS = 12

async function main() {
  const password = 'Admin@123456'
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@courier.com',
    },
    update: {
      name: 'System Admin',
      phone: '01700000001',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      name: 'System Admin',
      email: 'admin@courier.com',
      phone: '01700000001',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('Admin created successfully:')
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    status: admin.status,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
