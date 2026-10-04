import { Request, Response } from 'express'

import {
  getAdminShipments,
  getAdminShipmentById,
  getAdminShipmentHistory,
  getAdminShipmentsByStatus,
  getAdminCouriers,
  getAdminCourierShipments,
  getAdminActiveShipments,
} from '../services/admin-shipment.service.js'

import { successResponse, errorResponse } from '../utils/response.js'

export const getAll = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminShipments({
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

    return successResponse(
      res,
      'Admin shipments retrieved successfully',
      result,
    )
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
    const shipment = await getAdminShipmentById(req.params.id as string)

    return successResponse(
      res,
      'Admin shipment retrieved successfully',
      shipment,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve shipment',
      [],
      404,
    )
  }
}

export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await getAdminShipmentHistory(req.params.id as string)

    return successResponse(
      res,
      'Admin shipment history retrieved successfully',
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

export const getReadyForAssignment = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminShipmentsByStatus('READY_FOR_ASSIGNMENT', {
      page: query.page as number,
      limit: query.limit as number,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(
      res,
      'Ready-for-assignment shipments retrieved successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve shipments',
      [],
      500,
    )
  }
}

export const getActive = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminActiveShipments({
      page: query.page as number,
      limit: query.limit as number,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(
      res,
      'Active shipments retrieved successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to retrieve active shipments',
      [],
      500,
    )
  }
}

export const getCompleted = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminShipmentsByStatus('DELIVERED', {
      page: query.page as number,
      limit: query.limit as number,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(
      res,
      'Completed shipments retrieved successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to retrieve completed shipments',
      [],
      500,
    )
  }
}

export const getCancelled = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminShipmentsByStatus('CANCELLED', {
      page: query.page as number,
      limit: query.limit as number,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(
      res,
      'Cancelled shipments retrieved successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to retrieve cancelled shipments',
      [],
      500,
    )
  }
}

export const getCouriers = async (req: Request, res: Response) => {
  try {
    const couriers = await getAdminCouriers()

    return successResponse(res, 'Couriers retrieved successfully', couriers)
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to retrieve couriers',
      [],
      500,
    )
  }
}

export const getCourierShipments = async (req: Request, res: Response) => {
  try {
    const query = req.validatedQuery!

    const result = await getAdminCourierShipments(req.params.id as string, {
      page: query.page as number,
      limit: query.limit as number,
      sortBy: query.sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'deliveryCharge'
        | 'weight',
      sortOrder: query.sortOrder as 'asc' | 'desc',
    })

    return successResponse(
      res,
      'Courier shipments retrieved successfully',
      result,
    )
  } catch (error) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Failed to retrieve courier shipments',
      [],
      404,
    )
  }
}
