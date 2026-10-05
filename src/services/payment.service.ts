import { prisma } from '../config/prisma.js'
import { stripe } from '../config/stripe.js'

export const createStripePayment = async (
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

  if (!['PENDING_PAYMENT'].includes(shipment.status)) {
    throw new Error('Payment cannot be created for this shipment')
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      shipmentId,
      status: 'SUCCESS',
    },
  })

  if (existingPayment) {
    throw new Error('Shipment has already been paid')
  }

  const amount = Number(shipment.deliveryCharge)

  if (amount <= 0) {
    throw new Error('Invalid shipment delivery charge')
  }

  const payment = await prisma.payment.create({
    data: {
      shipmentId,
      customerId,
      provider: 'STRIPE',
      amount,
      currency: 'BDT',
      status: 'PENDING',
    },
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: `Shipment ${shipment.trackingNumber}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment.id,
      shipmentId: shipment.id,
    },
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentUrl: session.url,
    },
  })

  return {
    paymentId: payment.id,
    shipmentId: shipment.id,
    amount,
    currency: 'BDT',
    status: 'PENDING',
    paymentUrl: session.url,
  }
}

export const getCustomerPayments = async (
  customerId: string,
  options: {
    page: number
    limit: number
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
    sortOrder: 'asc' | 'desc'
  },
) => {
  const { page, limit, status, sortOrder } = options

  const where = {
    customerId,
    ...(status ? { status } : {}),
  }

  const skip = (page - 1) * limit

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      include: {
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            deliveryCharge: true,
            status: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getCustomerPaymentById = async (
  customerId: string,
  paymentId: string,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      customerId,
    },
    include: {
      shipment: {
        select: {
          id: true,
          trackingNumber: true,
          deliveryCharge: true,
          status: true,
        },
      },
    },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  return payment
}

export const getCustomerShipmentPayment = async (
  customerId: string,
  shipmentId: string,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      customerId,
      shipmentId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      shipment: {
        select: {
          id: true,
          trackingNumber: true,
          deliveryCharge: true,
          status: true,
        },
      },
    },
  })

  if (!payment) {
    throw new Error('Payment not found for this shipment')
  }

  return payment
}
