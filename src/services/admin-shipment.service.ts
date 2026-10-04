import { prisma } from '../config/prisma.js'

export const getAdminShipments = async (options: {
  page: number
  limit: number
  status?: string
  sortBy: 'createdAt' | 'updatedAt' | 'deliveryCharge' | 'weight'
  sortOrder: 'asc' | 'desc'
}) => {
  const { page, limit, status, sortBy, sortOrder } = options

  const where: any = {
    deletedAt: null,
  }

  if (status) {
    where.status = status
  }

  const skip = (page - 1) * limit

  const [shipments, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        pickupAddress: true,
        deliveryAddress: true,
        assignments: {
          orderBy: {
            assignedAt: 'desc',
          },
          take: 1,
          include: {
            courier: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.shipment.count({
      where,
    }),
  ])

  return {
    data: shipments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getAdminShipmentById = async (shipmentId: string) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      pickupAddress: true,
      deliveryAddress: true,
      assignments: {
        orderBy: {
          assignedAt: 'desc',
        },
        include: {
          courier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!shipment) {
    throw new Error('Shipment not found')
  }

  return shipment
}

export const getAdminShipmentHistory = async (shipmentId: string) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      deletedAt: null,
    },
    select: {
      id: true,
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

export const getAdminShipmentsByStatus = async (
  status: string,
  options: {
    page: number
    limit: number
    sortBy: 'createdAt' | 'updatedAt' | 'deliveryCharge' | 'weight'
    sortOrder: 'asc' | 'desc'
  },
) => {
  return getAdminShipments({
    ...options,
    status,
  })
}

export const getAdminCouriers = async () => {
  return prisma.user.findMany({
    where: {
      role: 'COURIER',
      status: 'ACTIVE',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          courierAssignments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getAdminCourierShipments = async (
  courierId: string,
  options: {
    page: number
    limit: number
    sortBy: 'createdAt' | 'updatedAt' | 'deliveryCharge' | 'weight'
    sortOrder: 'asc' | 'desc'
  },
) => {
  const courier = await prisma.user.findFirst({
    where: {
      id: courierId,
      role: 'COURIER',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
    },
  })

  if (!courier) {
    throw new Error('Courier not found')
  }

  const skip = (options.page - 1) * options.limit

  const where = {
    courierId,
    shipment: {
      deletedAt: null,
    },
  }

  const [assignments, total] = await prisma.$transaction([
    prisma.deliveryAssignment.findMany({
      where,
      skip,
      take: options.limit,
      orderBy: {
        assignedAt: options.sortOrder,
      },
      include: {
        shipment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            pickupAddress: true,
            deliveryAddress: true,
          },
        },
      },
    }),

    prisma.deliveryAssignment.count({
      where,
    }),
  ])

  return {
    courier,
    data: assignments,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  }
}

export const getAdminActiveShipments = async (options: {
  page: number
  limit: number
  sortBy: 'createdAt' | 'updatedAt' | 'deliveryCharge' | 'weight'
  sortOrder: 'asc' | 'desc'
}) => {
  const { page, limit, sortBy, sortOrder } = options

  const where = {
    deletedAt: null,
    status: {
      in: [
        'ASSIGNED',
        'COURIER_ACCEPTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERY_FAILED',
      ] as any,
    },
  }

  const skip = (page - 1) * limit

  const [shipments, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        pickupAddress: true,
        deliveryAddress: true,
        assignments: {
          orderBy: {
            assignedAt: 'desc',
          },
          take: 1,
          include: {
            courier: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.shipment.count({
      where,
    }),
  ])

  return {
    data: shipments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
