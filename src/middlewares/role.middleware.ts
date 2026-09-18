import { NextFunction, Request, Response } from 'express'
import { UserRole } from '../generated/prisma/client.js'
import { errorResponse } from '../utils/response.js'

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', [], 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied', [], 403)
    }

    next()
  }
}
