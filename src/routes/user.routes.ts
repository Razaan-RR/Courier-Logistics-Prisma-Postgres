import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { getProfile, updateProfile } from '../controllers/user.controller.js'
import { updateProfileSchema } from '../schemas/user.schema.js'

const router = Router()

router.get('/me', authenticate, getProfile)

router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile)

export default router
