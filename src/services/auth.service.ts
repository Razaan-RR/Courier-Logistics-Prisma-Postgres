import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js'

const SALT_ROUNDS = 12

export const registerUser = async (
  name: string,
  email: string,
  phone: string,
  password: string,
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
      deletedAt: null,
    },
  })

  if (existingUser) {
    throw new Error('Email or phone number already registered')
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
    },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('User account is not active')
  }

  const passwordMatched = await bcrypt.compare(password, user.password)

  if (!passwordMatched) {
    throw new Error('Invalid email or password')
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  })

  const refreshToken = generateRefreshToken({
    userId: user.id,
  })

  const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  }
}

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken)

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  let matchedToken = null

  for (const token of tokens) {
    const matched = await bcrypt.compare(refreshToken, token.token)

    if (matched) {
      matchedToken = token
      break
    }
  }

  if (!matchedToken) {
    throw new Error('Invalid or expired refresh token')
  }

  const accessToken = generateAccessToken({
    userId: payload.userId,
    role: (
      await prisma.user.findUniqueOrThrow({
        where: { id: payload.userId },
      })
    ).role,
  })

  return {
    accessToken,
  }
}

export const logoutUser = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken)

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  })

  for (const token of tokens) {
    const matched = await bcrypt.compare(refreshToken, token.token)

    if (matched) {
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: {
          revokedAt: new Date(),
        },
      })

      return
    }
  }

  throw new Error('Invalid refresh token')
}

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.deletedAt) {
    throw new Error('User not found')
  }

  const passwordMatched = await bcrypt.compare(currentPassword, user.password)

  if (!passwordMatched) {
    throw new Error('Current password is incorrect')
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })
}
