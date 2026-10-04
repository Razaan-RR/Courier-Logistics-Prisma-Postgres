import { Request, Response } from 'express'
import {
  createShipment,
  getMyShipments,
  getMyShipmentById,
  updateMyShipment,
  deleteMyShipment,
  searchMyShipments,
  getMyShipmentHistory,
  cancelMyShipment,
  assignShipmentToCourier,
  markShipmentAsPaidForTesting,
  makeShipmentReadyForAssignment,
  acceptShipmentAssignment,
  pickupShipment,
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

export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await getMyShipmentHistory(
      req.user!.id,
      req.params.id as string,
    )

    return successResponse(
      res,
      'Shipment history retrieved successfully',
      history,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to retrieve shipment history',
      [],
      404,
    )
  }
}

export const cancel = async (req: Request, res: Response) => {
  try {
    const shipment = await cancelMyShipment(
      req.user!.id,
      req.params.id as string,
    )

    return successResponse(res, 'Shipment cancelled successfully', shipment)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to cancel shipment',
      [],
      400,
    )
  }
}

export const assign = async (req: Request, res: Response) => {
  try {
    const assignment = await assignShipmentToCourier(
      req.params.id as string,
      req.body.courierId,
      req.user!.id,
    )

    return successResponse(
      res,
      'Shipment assigned to courier successfully',
      assignment,
      201,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to assign shipment',
      [],
      400,
    )
  }
}

export const markAsPaidForTesting = async (req: Request, res: Response) => {
  try {
    const shipment = await markShipmentAsPaidForTesting(
      req.params.id as string,
      req.user!.id,
    )

    return successResponse(
      res,
      'Shipment marked as paid successfully',
      shipment,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to mark shipment as paid',
      [],
      400,
    )
  }
}

export const makeReadyForAssignment = async (
  req: Request,
  res: Response,
) => {
  try {
    const shipment = await makeShipmentReadyForAssignment(
      req.params.id as string,
      req.user!.id,
    )

    return successResponse(
      res,
      'Shipment is ready for assignment',
      shipment,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to make shipment ready for assignment',
      [],
      400,
    )
  }
}

export const acceptAssignment = async (
  req: Request,
  res: Response,
) => {
  try {
    const assignment = await acceptShipmentAssignment(
      req.params.id as string,
      req.user!.id,
    )

    return successResponse(
      res,
      'Shipment assignment accepted successfully',
      assignment,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to accept shipment assignment',
      [],
      400,
    )
  }
}

export const pickup = async (
  req: Request,
  res: Response,
) => {
  try {
    const shipment = await pickupShipment(
      req.params.id as string,
      req.user!.id,
    )

    return successResponse(
      res,
      'Shipment picked up successfully',
      shipment,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to pick up shipment',
      [],
      400,
    )
  }
}