import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'
import { errorResponse } from '../utils/response.js'

type ValidationData = {
  body: unknown
  params: unknown
  query: unknown
}

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>
      validatedParams?: Record<string, unknown>
    }
  }
}

export const validate = (schema: ZodType<ValidationData>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    })

    if (!result.success) {
      return errorResponse(res, 'Validation failed', result.error.issues, 400)
    }

    req.body = result.data.body

    req.validatedParams = result.data.params as Record<string, unknown>

    req.validatedQuery = result.data.query as Record<string, unknown>

    next()
  }
}
