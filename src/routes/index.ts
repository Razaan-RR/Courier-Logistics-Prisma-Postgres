import { Router } from 'express'
import authRouter from './auth.routes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {},
  })
})

router.use('/auth', authRouter)

export default router
