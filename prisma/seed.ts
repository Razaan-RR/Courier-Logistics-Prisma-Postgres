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

  const courierPassword = 'Courier@123456'
  const hashedCourierPassword = await bcrypt.hash(courierPassword, SALT_ROUNDS)

  const courier = await prisma.user.upsert({
    where: {
      email: 'courier@courier.com',
    },
    update: {
      name: 'Test Courier',
      phone: '01700000002',
      password: hashedCourierPassword,
      role: 'COURIER',
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      name: 'Test Courier',
      email: 'courier@courier.com',
      phone: '01700000002',
      password: hashedCourierPassword,
      role: 'COURIER',
      status: 'ACTIVE',
    },
  })

  console.log('Courier created successfully:')
  console.log({
    id: courier.id,
    name: courier.name,
    email: courier.email,
    phone: courier.phone,
    role: courier.role,
    status: courier.status,
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
