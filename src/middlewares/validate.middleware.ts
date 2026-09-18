import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'
import { errorResponse } from '../utils/response.js'

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    })

    if (!result.success) {
      return errorResponse(res, 'Validation failed', result.error.issues, 400)
    }

    const data = result.data as {
      body: Request['body']
      params: Request['params']
      query: Request['query']
    }

    req.body = data.body
    req.params = data.params
    req.query = data.query

    next()
  }
}
