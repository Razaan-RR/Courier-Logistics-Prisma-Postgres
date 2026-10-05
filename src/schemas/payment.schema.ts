import { z } from 'zod'

export const createPaymentSchema = z.object({
  body: z.object({
    shipmentId: z.string().uuid(),
  }),
  params: z.object({}),
  query: z.object({}),
})

export const paymentIdSchema = z.object({
  body: z.any(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})

export const shipmentPaymentSchema = z.object({
  body: z.any(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})

export const paymentListSchema = z.object({
  body: z.any(),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})
