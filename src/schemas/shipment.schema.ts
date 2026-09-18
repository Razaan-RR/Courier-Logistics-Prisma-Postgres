import { z } from 'zod'

export const createShipmentSchema = z.object({
  body: z.object({
    pickupAddressId: z.string().uuid(),
    deliveryAddressId: z.string().uuid(),
    recipientName: z.string().min(2).max(100),
    recipientPhone: z.string().min(10).max(20),
    packageType: z.string().min(2).max(100),
    description: z.string().max(1000).optional(),
    weight: z.coerce.number().positive(),
    length: z.coerce.number().positive().optional(),
    width: z.coerce.number().positive().optional(),
    height: z.coerce.number().positive().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
})

export const updateShipmentSchema = z.object({
  body: z
    .object({
      recipientName: z.string().min(2).max(100).optional(),
      recipientPhone: z.string().min(10).max(20).optional(),
      packageType: z.string().min(2).max(100).optional(),
      description: z.string().max(1000).optional(),
      weight: z.coerce.number().positive().optional(),
      length: z.coerce.number().positive().optional(),
      width: z.coerce.number().positive().optional(),
      height: z.coerce.number().positive().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})

export const shipmentIdSchema = z.object({
  body: z.any(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})

export const shipmentListSchema = z.object({
  body: z.any(),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.string().optional(),
    sortBy: z
      .enum(['createdAt', 'updatedAt', 'deliveryCharge', 'weight'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})

export const shipmentSearchSchema = z.object({
  body: z.any(),
  params: z.object({}),
  query: z.object({
    q: z.string().min(1).max(100),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
})
