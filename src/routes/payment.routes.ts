import { Router } from 'express'

import { authenticate } from '../middlewares/auth.middleware.js'

import { authorize } from '../middlewares/role.middleware.js'

import { validate } from '../middlewares/validate.middleware.js'

import {
  createPayment,
  paymentSuccess,
  paymentCancel,
  getPayments,
  getPaymentById,
  getShipmentPayment,
} from '../controllers/payment.controller.js'

import {
  createPaymentSchema,
  paymentIdSchema,
  shipmentPaymentSchema,
  paymentListSchema,
} from '../schemas/payment.schema.js'

import { UserRole } from '../generated/prisma/client.js'

const router = Router()

router.get('/success', paymentSuccess)

router.get('/cancel', paymentCancel)

router.get(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(paymentListSchema),
  getPayments,
)

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(paymentIdSchema),
  getPaymentById,
)

router.get(
  '/shipment/:id',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentPaymentSchema),
  getShipmentPayment,
)

router.post(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createPaymentSchema),
  createPayment,
)

export default router
