import 'dotenv/config'
import type { SignOptions } from 'jsonwebtoken'

export const authConfig: {
  accessTokenSecret: string
  refreshTokenSecret: string
  accessTokenExpiresIn: SignOptions['expiresIn']
  refreshTokenExpiresIn: SignOptions['expiresIn']
} = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
}
