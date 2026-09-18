import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'
import { errorResponse } from '../utils/response.js'

type ValidationData = {
  body: Request['body']
  params: Request['params']
  query: Request['query']
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
    req.params = result.data.params

    next()
  }
}
