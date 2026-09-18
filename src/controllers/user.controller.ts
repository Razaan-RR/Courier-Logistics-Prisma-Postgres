import { Request, Response } from 'express'
import { getMyProfile, updateMyProfile } from '../services/user.service.js'
import { errorResponse, successResponse } from '../utils/response.js'

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await getMyProfile(req.user!.id)

    return successResponse(res, 'Profile retrieved successfully', user)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve profile',
      [],
      404,
    )
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await updateMyProfile(req.user!.id, req.body)

    return successResponse(res, 'Profile updated successfully', user)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update profile',
      [],
      400,
    )
  }
}
