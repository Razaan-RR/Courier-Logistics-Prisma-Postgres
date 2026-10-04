import { Router } from 'express'

import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'

import {
  getAll,
  getOne,
  getHistory,
  getReadyForAssignment,
  getActive,
  getCompleted,
  getCancelled,
  getCouriers,
  getCourierShipments,
} from '../controllers/admin-shipment.controller.js'

import {
  shipmentIdSchema,
  adminShipmentListSchema,
} from '../schemas/shipment.schema.js'

import { UserRole } from '../generated/prisma/client.js'

const router = Router()

router.use(authenticate, authorize(UserRole.ADMIN))

router.get('/shipments', validate(adminShipmentListSchema), getAll)

router.get(
  '/shipments/ready-for-assignment',
  validate(adminShipmentListSchema),
  getReadyForAssignment,
)

router.get('/shipments/active', validate(adminShipmentListSchema), getActive)

router.get(
  '/shipments/completed',
  validate(adminShipmentListSchema),
  getCompleted,
)

router.get(
  '/shipments/cancelled',
  validate(adminShipmentListSchema),
  getCancelled,
)

router.get('/shipments/:id/history', validate(shipmentIdSchema), getHistory)

router.get('/shipments/:id', validate(shipmentIdSchema), getOne)

router.get('/couriers', getCouriers)

router.get(
  '/couriers/:id/shipments',
  validate(
    adminShipmentListSchema.extend({
      params: shipmentIdSchema.shape.params,
    }),
  ),
  getCourierShipments,
)

export default router
