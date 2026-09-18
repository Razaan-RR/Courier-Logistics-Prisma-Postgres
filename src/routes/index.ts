import { Router } from 'express'
import authRouter from './auth.routes.js'
import userRouter from './user.routes.js'
import shipmentRouter from "./shipment.routes.js";

const router = Router()

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {},
  })
})

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use("/shipments", shipmentRouter);

export default router
