import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  create,
  getAll,
  getOne,
  remove,
  search,
  update,
} from '../controllers/shipment.controller.js'
import {
  createShipmentSchema,
  shipmentIdSchema,
  shipmentListSchema,
  shipmentSearchSchema,
  updateShipmentSchema,
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
