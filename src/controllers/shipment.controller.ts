import { Request, Response } from 'express'
import { createShipment } from '../services/shipment.service.js'
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
