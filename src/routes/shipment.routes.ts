import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { create } from '../controllers/shipment.controller.js'
import { createShipmentSchema } from '../schemas/shipment.schema.js'
import { UserRole } from '../generated/prisma/client.js'

const router = Router()

router.post(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createShipmentSchema),
  create,
)

export default router
