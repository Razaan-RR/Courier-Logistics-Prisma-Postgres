import { NextFunction, Request, Response } from 'express'
import { UserRole } from '../generated/prisma/client.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { errorResponse } from '../utils/response.js'
import { AuthUser } from '../types/auth.types.js'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required', [], 401)
  }

  const token = authorization.substring(7)

  try {
    const payload = verifyAccessToken(token)

    req.user = {
      id: payload.userId,
      role: payload.role as UserRole,
    }

    next()
  } catch {
    return errorResponse(res, 'Invalid or expired access token', [], 401)
  }
}
