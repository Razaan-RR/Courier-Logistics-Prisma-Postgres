import { prisma } from '../config/prisma.js'

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export const updateMyProfile = async (
  userId: string,
  data: {
    name?: string
    phone?: string
  },
) => {
  if (data.phone) {
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: data.phone,
        id: {
          not: userId,
        },
        deletedAt: null,
      },
    })

    if (existingUser) {
      throw new Error('Phone number already registered')
    }
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}
