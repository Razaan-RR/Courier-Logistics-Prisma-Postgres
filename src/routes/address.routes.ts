import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  create,
  getAll,
  update,
  remove,
} from '../controllers/address.controller.js'

import {
    addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from '../schemas/address.schema.js'
import { UserRole } from '../generated/prisma/client.js'

const router = Router()

router.use(authenticate, authorize(UserRole.CUSTOMER))

router.post('/', validate(createAddressSchema), create)

router.get('/', getAll)

router.patch('/:id', validate(updateAddressSchema), update)

router.delete('/:id', validate(addressIdSchema), remove)

export default router
