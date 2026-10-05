import { Request, Response } from 'express'
import Stripe from 'stripe'
import { stripe } from '../config/stripe.js'
import { prisma } from '../config/prisma.js'
import { createAuditLog } from '../services/audit.service.js'

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature']

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing Stripe signature',
    })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid Stripe webhook signature',
    })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const paymentId = session.metadata?.paymentId
      const shipmentId = session.metadata?.shipmentId

      if (session.payment_status !== 'paid') {
        return res.status(200).json({
          success: true,
          received: true,
          message: 'Checkout completed but payment is not confirmed',
        })
      }

      if (!paymentId || !shipmentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment metadata',
        })
      }

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
        })

        if (!payment) {
          throw new Error('Payment not found')
        }

        if (payment.status === 'SUCCESS') {
          return
        }

        const shipment = await tx.shipment.findUnique({
          where: { id: shipmentId },
        })

        if (!shipment) {
          throw new Error('Shipment not found')
        }

        if (shipment.status !== 'PENDING_PAYMENT') {
          throw new Error('Shipment is not awaiting payment')
        }

        const oldPaymentStatus = payment.status
        const oldShipmentStatus = shipment.status

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            transactionId: session.payment_intent as string,
            paidAt: new Date(),
          },
        })

        await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            status: 'PAID',
          },
        })

        await tx.shipmentStatusHistory.create({
          data: {
            shipmentId: shipment.id,
            changedById: payment.customerId,
            status: 'PAID',
            note: 'Payment completed successfully through Stripe',
          },
        })

        await createAuditLog(
          {
            actorId: payment.customerId,
            action: 'SHIPMENT_STATUS_CHANGED',
            entity: 'Shipment',
            entityId: shipment.id,
            oldData: {
              status: oldShipmentStatus,
              paymentStatus: oldPaymentStatus,
            },
            newData: {
              status: 'PAID',
              paymentStatus: 'SUCCESS',
              paymentId: payment.id,
            },
          },
          tx,
        )
      })
    }

    return res.status(200).json({
      success: true,
      received: true,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to process Stripe webhook',
    })
  }
}
