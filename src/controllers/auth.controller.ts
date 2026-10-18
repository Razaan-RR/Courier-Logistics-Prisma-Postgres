import { Request, Response } from 'express'
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
} from '../services/auth.service.js'
import { successResponse, errorResponse } from '../utils/response.js'

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body

    const user = await registerUser(name, email, phone, password)

    return successResponse(res, 'Registration successful', user, 201)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Registration failed',
      [],
      400,
    )
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)

    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)

    const { refreshToken: _, ...safeResult } = result

    return successResponse(res, 'Login successful', safeResult)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Login failed',
      [],
      401,
    )
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      return errorResponse(res, 'Refresh token is required', [], 401)
    }

    const result = await refreshAccessToken(token)

    return successResponse(res, 'Access token refreshed successfully', result)
  } catch (error) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    })

    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Invalid refresh token',
      [],
      401,
    )
  }
}

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken

  try {
    if (token) {
      await logoutUser(token)
    }
  } catch (error) {
    console.error('Failed to revoke refresh token:', error)
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  })

  return successResponse(res, 'Logout successful', {})
}

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    await changePassword(req.user!.id, currentPassword, newPassword)

    return successResponse(res, 'Password changed successfully', {})
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Password change failed',
      [],
      400,
    )
  }
}
