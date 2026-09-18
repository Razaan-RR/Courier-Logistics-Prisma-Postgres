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
