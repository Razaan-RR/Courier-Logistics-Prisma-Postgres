import { Request, Response } from 'express'
import {
  createShipment,
  getMyShipments,
  getMyShipmentById,
  updateMyShipment,
  deleteMyShipment,
  searchMyShipments,
} from '../services/shipment.service.js'
import { errorResponse, successResponse } from '../utils/response.js'

export const create = async (req: Request, res: Response) => {
  try {
    const shipment = await createShipment(req.user!.id, req.body)

    return successResponse(res, 'Shipment created successfully', shipment, 201)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to create shipment',
      [],
      400,
    )
  }
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getMyShipments(req.user!.id, {
      page: query.page as number,
      limit: query.limit as number,
      status: query.status as string | undefined,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(res, 'Shipments retrieved successfully', result)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve shipments',
      [],
      500,
    )
  }
}

export const getOne = async (req: Request, res: Response) => {
  try {
    const shipment = await getMyShipmentById(
      req.user!.id,
      req.params.id as string,
    )

    return successResponse(res, 'Shipment retrieved successfully', shipment)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve shipment',
      [],
      404,
    )
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const shipment = await updateMyShipment(
      req.user!.id,
      req.params.id as string,
      req.body,
    )

    return successResponse(res, 'Shipment updated successfully', shipment)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to update shipment',
      [],
      400,
    )
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await deleteMyShipment(req.user!.id, req.params.id as string)

    return successResponse(res, 'Shipment deleted successfully', {})
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to delete shipment',
      [],
      400,
    )
  }
}

export const search = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await searchMyShipments(req.user!.id, {
      q: query.q as string,
      page: query.page as number,
      limit: query.limit as number,
    })

    return successResponse(
      res,
      'Shipments search completed successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to search shipments',
      [],
      500,
    )
  }
}
