import express from 'express'

import cors from 'cors'

import helmet from 'helmet'

import rateLimit from 'express-rate-limit'

import { errorHandler } from './middlewares/error.middleware.js'

import apiRouter from './routes/index.js'

import { stripeWebhook } from './controllers/payment-webhook.controller.js'

import cookieParser from 'cookie-parser'

const app = express()

app.use(cookieParser())

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
)

app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
)

app.use('/api/v1', apiRouter)

app.use(errorHandler)

export default app
