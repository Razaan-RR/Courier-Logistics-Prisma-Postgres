import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  search,
  getHistory,
  cancel,
  assign,
  markAsPaidForTesting,
  makeReadyForAssignment,
  acceptAssignment,
  pickup,
  markInTransit,
  markOutForDelivery,
  deliver,
} from '../controllers/shipment.controller.js'
import {
  createShipmentSchema,
  shipmentIdSchema,
  shipmentListSchema,
  shipmentSearchSchema,
  updateShipmentSchema,
  assignShipmentSchema,
} from '../schemas/shipment.schema.js'
import { UserRole } from '../generated/prisma/client.js'

const router = Router()

router.post(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createShipmentSchema),
  create,
)

router.get(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentListSchema),
  getAll,
)

router.get(
  '/search',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentSearchSchema),
  search,
)

router.post(
  '/:id/mark-paid-test',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(shipmentIdSchema),
  markAsPaidForTesting,
)

router.post(
  '/:id/ready-for-assignment',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(shipmentIdSchema),
  makeReadyForAssignment,
)

router.post(
  '/:id/assign',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(shipmentIdSchema),
  validate(assignShipmentSchema),
  assign,
)

router.post(
  '/:id/accept',
  authenticate,
  authorize(UserRole.COURIER),
  validate(shipmentIdSchema),
  acceptAssignment,
)

router.post(
  '/:id/pickup',
  authenticate,
  authorize(UserRole.COURIER),
  validate(shipmentIdSchema),
  pickup,
)

router.post(
  '/:id/in-transit',
  authenticate,
  authorize(UserRole.COURIER),
  validate(shipmentIdSchema),
  markInTransit,
)

router.post(
  '/:id/out-for-delivery',
  authenticate,
  authorize(UserRole.COURIER),
  validate(shipmentIdSchema),
  markOutForDelivery,
)

router.post(
  '/:id/deliver',
  authenticate,
  authorize(UserRole.COURIER),
  validate(shipmentIdSchema),
  deliver,
)

router.get(
  '/:id/history',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentIdSchema),
  getHistory,
)

router.post(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentIdSchema),
  cancel,
)

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentIdSchema),
  getOne,
)

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(updateShipmentSchema),
  update,
)

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(shipmentIdSchema),
  remove,
)

export default router
