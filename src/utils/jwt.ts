import jwt from 'jsonwebtoken'
import { UserRole } from '../generated/prisma/client.js'
import { authConfig } from '../config/auth.js'

interface AccessTokenPayload {
  userId: string
  role: UserRole
}

interface RefreshTokenPayload {
  userId: string
}

export const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, authConfig.accessTokenSecret, {
    expiresIn: authConfig.accessTokenExpiresIn,
  })
}

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, authConfig.refreshTokenSecret, {
    expiresIn: authConfig.refreshTokenExpiresIn,
  })
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, authConfig.accessTokenSecret) as AccessTokenPayload
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, authConfig.refreshTokenSecret) as RefreshTokenPayload
}
