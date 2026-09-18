import { Request, Response } from 'express'
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
} from '../services/address.service.js'
import { errorResponse, successResponse } from '../utils/response.js'

export const create = async (req: Request, res: Response) => {
  try {
    const address = await createAddress(req.user!.id, req.body)

    return successResponse(res, 'Address created successfully', address, 201)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create address',
      [],
      400,
    )
  }
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const addresses = await getMyAddresses(req.user!.id)

    return successResponse(res, 'Addresses retrieved successfully', addresses)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve addresses',
      [],
      500,
    )
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const address = await updateAddress(
      req.user!.id,
      req.params.id as string,
      req.body,
    )

    return successResponse(res, 'Address updated successfully', address)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update address',
      [],
      400,
    )
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await deleteAddress(req.user!.id, req.params.id as string)

    return successResponse(res, 'Address deleted successfully', {})
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete address',
      [],
      400,
    )
  }
}
