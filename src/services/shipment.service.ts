import { prisma } from '../config/prisma.js'
import { createAuditLog } from './audit.service.js'

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

const allowedStatusTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['READY_FOR_ASSIGNMENT', 'CANCELLED'],
  READY_FOR_ASSIGNMENT: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['COURIER_ACCEPTED'],
  COURIER_ACCEPTED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERY_FAILED: ['RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
}

export const validateShipmentStatusTransition = (
  currentStatus: string,
  nextStatus: string,
) => {
  const allowedStatuses = allowedStatusTransitions[currentStatus] ?? []

  if (!allowedStatuses.includes(nextStatus)) {
    throw new Error(
      `Invalid shipment status transition: ${currentStatus} → ${nextStatus}`,
    )
  }

  return true
}

export const updateShipmentStatus = async (
  shipmentId: string,
  nextStatus: string,
  changedById: string,
  note?: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  validateShipmentStatusTransition(shipment.status, nextStatus)

  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: { status: nextStatus as any },
    })

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        changedById,
        status: nextStatus as any,
        note,
      },
    })

    await createAuditLog(
      {
        actorId: changedById,
        action: 'SHIPMENT_STATUS_CHANGED',
        entity: 'Shipment',
        entityId: shipmentId,
        oldData: {
          status: shipment.status,
        },
        newData: {
          status: nextStatus,
        },
      },
      tx,
    )

    return updatedShipment
  })

  return result
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

  const result = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
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

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        changedById: customerId,
        status: 'PENDING_PAYMENT',
        note: 'Shipment created',
      },
    })

    await createAuditLog(
      {
        actorId: customerId,
        action: 'SHIPMENT_CREATED',
        entity: 'Shipment',
        entityId: shipment.id,
        oldData: null,
        newData: {
          status: 'PENDING_PAYMENT',
          trackingNumber: shipment.trackingNumber,
          deliveryCharge: shipment.deliveryCharge,
        },
      },
      tx,
    )

    return shipment
  })

  return result
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

export const getMyShipmentHistory = async (
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

  return prisma.shipmentStatusHistory.findMany({
    where: {
      shipmentId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  })
}

export const cancelMyShipment = async (
  customerId: string,
  shipmentId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, customerId, deletedAt: null },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  return updateShipmentStatus(
    shipmentId,
    'CANCELLED',
    customerId,
    'Shipment cancelled by customer',
  )
}

export const assignShipmentToCourier = async (
  shipmentId: string,
  courierId: string,
  adminId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  if (shipment.status !== 'READY_FOR_ASSIGNMENT') {
    throw new Error(
      'Only shipments ready for assignment can be assigned to a courier',
    )
  }

  const courier = await prisma.user.findFirst({
    where: {
      id: courierId,
      role: 'COURIER',
      status: 'ACTIVE',
      deletedAt: null,
    },
  })

  if (!courier) {
    throw new Error('Active courier not found')
  }

  const result = await prisma.$transaction(async (tx) => {
    const assignment = await tx.deliveryAssignment.create({
      data: {
        shipmentId,
        courierId,
        assignedById: adminId,
        status: 'PENDING',
      },
    })

    await tx.shipment.update({
      where: {
        id: shipmentId,
      },
      data: {
        status: 'ASSIGNED',
      },
    })

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        changedById: adminId,
        status: 'ASSIGNED',
        note: `Shipment assigned to courier ${courier.name}`,
      },
    })

    await createAuditLog(
      {
        actorId: adminId,
        action: 'SHIPMENT_STATUS_CHANGED',
        entity: 'Shipment',
        entityId: shipmentId,
        oldData: {
          status: shipment.status,
        },
        newData: {
          status: 'ASSIGNED',
          courierId,
          courierName: courier.name,
          assignmentId: assignment.id,
        },
      },
      tx,
    )

    return assignment
  })

  return result
}

export const markShipmentAsPaidForTesting = async (
  shipmentId: string,
  adminId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  if (shipment.status !== 'PENDING_PAYMENT') {
    throw new Error('Only shipments pending payment can be marked as paid')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipmentId,
      },
      data: {
        status: 'PAID',
      },
    })

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        changedById: adminId,
        status: 'PAID',
        note: 'Shipment marked as paid for development testing',
      },
    })

    await createAuditLog(
      {
        actorId: adminId,
        action: 'SHIPMENT_STATUS_CHANGED',
        entity: 'Shipment',
        entityId: shipmentId,
        oldData: {
          status: shipment.status,
        },
        newData: {
          status: 'PAID',
          note: 'Development testing payment',
        },
      },
      tx,
    )

    return updatedShipment
  })

  return result
}

export const makeShipmentReadyForAssignment = async (
  shipmentId: string,
  adminId: string,
) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  if (shipment.status !== 'PAID') {
    throw new Error('Only paid shipments can be made ready for assignment')
  }

  return updateShipmentStatus(
    shipmentId,
    'READY_FOR_ASSIGNMENT',
    adminId,
    'Shipment marked ready for courier assignment',
  )
}

export const acceptShipmentAssignment = async (
  shipmentId: string,
  courierId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'PENDING',
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: true,
    },
  })

  if (!assignment) {
    throw new Error('Pending shipment assignment not found')
  }

  if (assignment.shipment.status !== 'ASSIGNED') {
    throw new Error('Only assigned shipments can be accepted by the courier')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedAssignment = await tx.deliveryAssignment.update({
      where: {
        id: assignment.id,
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })

    await tx.shipment.update({
      where: {
        id: shipmentId,
      },
      data: {
        status: 'COURIER_ACCEPTED',
      },
    })

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        changedById: courierId,
        status: 'COURIER_ACCEPTED',
        note: 'Shipment assignment accepted by courier',
      },
    })

    await createAuditLog(
      {
        actorId: courierId,
        action: 'SHIPMENT_STATUS_CHANGED',
        entity: 'Shipment',
        entityId: shipmentId,
        oldData: {
          status: assignment.shipment.status,
          assignmentStatus: assignment.status,
        },
        newData: {
          status: 'COURIER_ACCEPTED',
          assignmentStatus: 'ACCEPTED',
        },
      },
      tx,
    )

    return updatedAssignment
  })

  return result
}

export const pickupShipment = async (shipmentId: string, courierId: string) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: true,
    },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'COURIER_ACCEPTED') {
    throw new Error('Only courier-accepted shipments can be picked up')
  }

  return updateShipmentStatus(
    shipmentId,
    'PICKED_UP',
    courierId,
    'Shipment picked up by courier',
  )
}

export const markShipmentInTransit = async (
  shipmentId: string,
  courierId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: true,
    },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'PICKED_UP') {
    throw new Error('Only picked-up shipments can be marked as in transit')
  }

  return updateShipmentStatus(
    shipmentId,
    'IN_TRANSIT',
    courierId,
    'Shipment is now in transit',
  )
}

export const markShipmentOutForDelivery = async (
  shipmentId: string,
  courierId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: true,
    },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'IN_TRANSIT') {
    throw new Error('Only shipments in transit can be marked out for delivery')
  }

  return updateShipmentStatus(
    shipmentId,
    'OUT_FOR_DELIVERY',
    courierId,
    'Shipment is out for delivery',
  )
}

export const deliverShipment = async (
  shipmentId: string,
  courierId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: true,
    },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'OUT_FOR_DELIVERY') {
    throw new Error(
      'Only shipments out for delivery can be marked as delivered',
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipmentId,
      },
      data: {
        status: 'DELIVERED',
      },
    })

    await tx.deliveryAssignment.update({
      where: {
        id: assignment.id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        changedById: courierId,
        status: 'DELIVERED',
        note: 'Shipment delivered successfully',
      },
    })

    await createAuditLog(
      {
        actorId: courierId,
        action: 'SHIPMENT_STATUS_CHANGED',
        entity: 'Shipment',
        entityId: shipmentId,
        oldData: {
          status: assignment.shipment.status,
          assignmentStatus: assignment.status,
        },
        newData: {
          status: 'DELIVERED',
          assignmentStatus: 'COMPLETED',
        },
      },
      tx,
    )

    return updatedShipment
  })

  return result
}

export const markShipmentDeliveryFailed = async (
  shipmentId: string,
  courierId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: { deletedAt: null },
    },
    include: { shipment: true },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'OUT_FOR_DELIVERY') {
    throw new Error(
      'Only shipments out for delivery can be marked as delivery failed',
    )
  }

  return updateShipmentStatus(
    shipmentId,
    'DELIVERY_FAILED',
    courierId,
    'Delivery failed',
  )
}

export const returnShipment = async (shipmentId: string, courierId: string) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      shipmentId,
      courierId,
      status: 'ACCEPTED',
      shipment: { deletedAt: null },
    },
    include: { shipment: true },
  })

  if (!assignment) {
    throw new Error('Accepted shipment assignment not found')
  }

  if (assignment.shipment.status !== 'DELIVERY_FAILED') {
    throw new Error('Only delivery-failed shipments can be marked as returned')
  }

  return updateShipmentStatus(
    shipmentId,
    'RETURNED',
    courierId,
    'Shipment returned after delivery failure',
  )
}

export const getCourierAssignedShipments = async (courierId: string) => {
  return prisma.deliveryAssignment.findMany({
    where: {
      courierId,
      status: {
        in: ['PENDING', 'ACCEPTED'],
      },
      shipment: {
        deletedAt: null,
      },
    },
    orderBy: {
      assignedAt: 'desc',
    },
    include: {
      shipment: {
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  })
}

export const getCourierCompletedShipments = async (courierId: string) => {
  return prisma.deliveryAssignment.findMany({
    where: {
      courierId,
      status: 'COMPLETED',
      shipment: {
        deletedAt: null,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    include: {
      shipment: {
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  })
}

export const getCourierActiveShipments = async (courierId: string) => {
  return prisma.deliveryAssignment.findMany({
    where: {
      courierId,
      status: 'ACCEPTED',
      shipment: {
        deletedAt: null,
        status: {
          in: [
            'COURIER_ACCEPTED',
            'PICKED_UP',
            'IN_TRANSIT',
            'OUT_FOR_DELIVERY',
            'DELIVERY_FAILED',
          ],
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      shipment: {
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  })
}

export const getCourierShipmentById = async (
  courierId: string,
  shipmentId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      courierId,
      shipmentId,
      status: {
        in: ['PENDING', 'ACCEPTED', 'COMPLETED'],
      },
      shipment: {
        deletedAt: null,
      },
    },
    include: {
      shipment: {
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!assignment) {
    throw new Error('Shipment not found in your assignments')
  }

  return assignment
}

export const getCourierShipmentHistory = async (
  courierId: string,
  shipmentId: string,
) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      courierId,
      shipmentId,
      shipment: {
        deletedAt: null,
      },
    },
  })

  if (!assignment) {
    throw new Error('Shipment not found in your assignments')
  }

  return prisma.shipmentStatusHistory.findMany({
    where: {
      shipmentId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  })
}
