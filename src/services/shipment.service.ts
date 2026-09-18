import { prisma } from '../config/prisma.js'

const BASE_CHARGE = 60
const CHARGE_PER_KG = 20

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(1000 + Math.random() * 9000)

  return `CLP${timestamp}${random}`
}

const calculateDeliveryCharge = (weight: number) => {
  return BASE_CHARGE + weight * CHARGE_PER_KG
}

export const createShipment = async (
  customerId: string,
  data: {
    pickupAddressId: string
    deliveryAddressId: string
    recipientName: string
    recipientPhone: string
    packageType: string
    description?: string
    weight: number
    length?: number
    width?: number
    height?: number
  },
) => {
  const addresses = await prisma.address.findMany({
    where: {
      id: {
        in: [data.pickupAddressId, data.deliveryAddressId],
      },
      userId: customerId,
      deletedAt: null,
    },
  })

  if (addresses.length !== 2) {
    throw new Error('Pickup and delivery addresses must belong to you')
  }

  const deliveryCharge = calculateDeliveryCharge(data.weight)

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber: generateTrackingNumber(),
      customerId,
      pickupAddressId: data.pickupAddressId,
      deliveryAddressId: data.deliveryAddressId,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      packageType: data.packageType,
      description: data.description,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      deliveryCharge,
      status: 'PENDING_PAYMENT',
    },
  })

  await prisma.shipmentStatusHistory.create({
    data: {
      shipmentId: shipment.id,
      changedById: customerId,
      status: 'PENDING_PAYMENT',
      note: 'Shipment created',
    },
  })

  return shipment
}

export const getMyShipments = async (
  customerId: string,
  options: {
    page: number
    limit: number
    status?: string
    sortBy: 'createdAt' | 'updatedAt' | 'deliveryCharge' | 'weight'
    sortOrder: 'asc' | 'desc'
  },
) => {
  const { page, limit, status, sortBy, sortOrder } = options

  const where = {
    customerId,
    deletedAt: null,
    ...(status ? { status: status as any } : {}),
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shipment.count({
      where,
    }),
  ])

  return {
    shipments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getMyShipmentById = async (
  customerId: string,
  shipmentId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      customerId,
      deletedAt: null,
    },
    include: {
      pickupAddress: true,
      deliveryAddress: true,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  return shipment
}

export const updateMyShipment = async (
  customerId: string,
  shipmentId: string,
  data: {
    recipientName?: string
    recipientPhone?: string
    packageType?: string
    description?: string
    weight?: number
    length?: number
    width?: number
    height?: number
  },
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      customerId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  if (shipment.status !== 'PENDING_PAYMENT') {
    throw new Error('Shipment can only be updated before payment')
  }

  const weight =
    data.weight !== undefined ? data.weight : Number(shipment.weight)

  const deliveryCharge = 60 + weight * 20

  return prisma.shipment.update({
    where: {
      id: shipmentId,
    },
    data: {
      ...data,
      deliveryCharge,
    },
  })
}

export const deleteMyShipment = async (
  customerId: string,
  shipmentId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      customerId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  if (shipment.status !== 'PENDING_PAYMENT') {
    throw new Error('Shipment can only be deleted before payment')
  }

  return prisma.shipment.update({
    where: {
      id: shipmentId,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

export const searchMyShipments = async (
  customerId: string,
  options: {
    q: string
    page: number
    limit: number
  },
) => {
  const { q, page, limit } = options

  const where = {
    customerId,
    deletedAt: null,
    OR: [
      {
        trackingNumber: {
          contains: q,
          mode: 'insensitive' as const,
        },
      },
      {
        recipientName: {
          contains: q,
          mode: 'insensitive' as const,
        },
      },
      {
        recipientPhone: {
          contains: q,
        },
      },
    ],
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shipment.count({
      where,
    }),
  ])

  return {
    shipments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
