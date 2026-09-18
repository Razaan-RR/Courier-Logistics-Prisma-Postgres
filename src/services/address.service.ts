import { prisma } from '../config/prisma.js'

export const createAddress = async (
  userId: string,
  data: {
    label: string
    addressLine: string
    city: string
    district: string
    postalCode?: string
    latitude?: number
    longitude?: number
  },
) => {
  return prisma.address.create({
    data: {
      userId,
      label: data.label,
      addressLine: data.addressLine,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  })
}

export const getMyAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: {
    label?: string
    addressLine?: string
    city?: string
    district?: string
    postalCode?: string
    latitude?: number
    longitude?: number
  },
) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
      deletedAt: null,
    },
  })

  if (!address) {
    throw new Error('Address not found')
  }

  return prisma.address.update({
    where: {
      id: addressId,
    },
    data,
  })
}

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
      deletedAt: null,
    },
  })

  if (!address) {
    throw new Error('Address not found')
  }

  return prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}
