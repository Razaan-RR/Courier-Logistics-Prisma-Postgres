import { NextFunction, Request, Response } from 'express'
import { errorResponse } from '../utils/response.js'

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err)

  return errorResponse(res, 'Something went wrong', [], 500)
}
