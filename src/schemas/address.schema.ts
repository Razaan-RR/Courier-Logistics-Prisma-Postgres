import { z } from 'zod'

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(50),
    addressLine: z.string().min(5).max(255),
    city: z.string().min(2).max(100),
    district: z.string().min(2).max(100),
    postalCode: z.string().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
})

export const updateAddressSchema = z.object({
  body: z
    .object({
      label: z.string().min(1).max(50).optional(),
      addressLine: z.string().min(5).max(255).optional(),
      city: z.string().min(2).max(100).optional(),
      district: z.string().min(2).max(100).optional(),
      postalCode: z.string().max(20).optional(),
      latitude: z.coerce.number().min(-90).max(90).optional(),
      longitude: z.coerce.number().min(-180).max(180).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})

export const addressIdSchema = z.object({
  body: z.any(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}),
})
