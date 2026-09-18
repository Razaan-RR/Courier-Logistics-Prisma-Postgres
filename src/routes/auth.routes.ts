import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import {
  register,
  login,
  refreshToken,
  logout,
  updatePassword,
} from '../controllers/auth.controller.js'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
} from '../schemas/auth.schema.js'
import { successResponse } from "../utils/response.js";

const router = Router()

router.post('/register', validate(registerSchema), register)

router.post('/login', validate(loginSchema), login)

router.post('/refresh-token', validate(refreshTokenSchema), refreshToken)

router.post('/logout', validate(logoutSchema), logout)

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  updatePassword,
)

router.get('/me', authenticate, (req, res) => {
  return successResponse(res, 'Authenticated user', {
    userId: req.user!.id,
    role: req.user!.role,
  })
})

export default router
