import { Request, Response } from 'express'
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
} from '../services/auth.service.js'
import { successResponse, errorResponse } from '../utils/response.js'

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

    return successResponse(res, 'Login successful', result)
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
    const { refreshToken: token } = req.body

    const result = await refreshAccessToken(token)

    return successResponse(res, 'Access token refreshed successfully', result)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Invalid refresh token',
      [],
      401,
    )
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body

    await logoutUser(token)

    return successResponse(res, 'Logout successful', {})
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Logout failed',
      [],
      401,
    )
  }
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
