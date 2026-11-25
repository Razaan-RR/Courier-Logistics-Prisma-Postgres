import { createShipment, getMyShipments, getMyShipmentById, updateMyShipment, deleteMyShipment, searchMyShipments, getMyShipmentHistory, cancelMyShipment, assignShipmentToCourier, markShipmentAsPaidForTesting, makeShipmentReadyForAssignment, acceptShipmentAssignment, pickupShipment, markShipmentInTransit, markShipmentOutForDelivery, deliverShipment, markShipmentDeliveryFailed, returnShipment, getCourierAssignedShipments, getCourierCompletedShipments, getCourierActiveShipments, getCourierShipmentById, getCourierShipmentHistory, } from '../services/shipment.service.js';
import { errorResponse, successResponse } from '../utils/response.js';
export const create = async (req, res) => {
    try {
        const shipment = await createShipment(req.user.id, req.body);
        return successResponse(res, 'Shipment created successfully', shipment, 201);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to create shipment', [], 400);
    }
};
export const getAll = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getMyShipments(req.user.id, {
            page: query.page,
            limit: query.limit,
            status: query.status,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipments', [], 500);
    }
};
export const getOne = async (req, res) => {
    try {
        const shipment = await getMyShipmentById(req.user.id, req.params.id);
        return successResponse(res, 'Shipment retrieved successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipment', [], 404);
    }
};
export const update = async (req, res) => {
    try {
        const shipment = await updateMyShipment(req.user.id, req.params.id, req.body);
        return successResponse(res, 'Shipment updated successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to update shipment', [], 400);
    }
};
export const remove = async (req, res) => {
    try {
        await deleteMyShipment(req.user.id, req.params.id);
        return successResponse(res, 'Shipment deleted successfully', {});
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to delete shipment', [], 400);
    }
};
export const search = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await searchMyShipments(req.user.id, {
            q: query.q,
            page: query.page,
            limit: query.limit,
        });
        return successResponse(res, 'Shipments search completed successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to search shipments', [], 500);
    }
};
export const getHistory = async (req, res) => {
    try {
        const history = await getMyShipmentHistory(req.user.id, req.params.id);
        return successResponse(res, 'Shipment history retrieved successfully', history);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve shipment history', [], 404);
    }
};
export const cancel = async (req, res) => {
    try {
        const shipment = await cancelMyShipment(req.user.id, req.params.id);
        return successResponse(res, 'Shipment cancelled successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to cancel shipment', [], 400);
    }
};
export const assign = async (req, res) => {
    try {
        const assignment = await assignShipmentToCourier(req.params.id, req.body.courierId, req.user.id);
        return successResponse(res, 'Shipment assigned to courier successfully', assignment, 201);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to assign shipment', [], 400);
    }
};
export const markAsPaidForTesting = async (req, res) => {
    try {
        const shipment = await markShipmentAsPaidForTesting(req.params.id, req.user.id);
        return successResponse(res, 'Shipment marked as paid successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to mark shipment as paid', [], 400);
    }
};
export const makeReadyForAssignment = async (req, res) => {
    try {
        const shipment = await makeShipmentReadyForAssignment(req.params.id, req.user.id);
        return successResponse(res, 'Shipment is ready for assignment', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to make shipment ready for assignment', [], 400);
    }
};
export const acceptAssignment = async (req, res) => {
    try {
        const assignment = await acceptShipmentAssignment(req.params.id, req.user.id);
        return successResponse(res, 'Shipment assignment accepted successfully', assignment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to accept shipment assignment', [], 400);
    }
};
export const pickup = async (req, res) => {
    try {
        const shipment = await pickupShipment(req.params.id, req.user.id);
        return successResponse(res, 'Shipment picked up successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to pick up shipment', [], 400);
    }
};
export const markInTransit = async (req, res) => {
    try {
        const shipment = await markShipmentInTransit(req.params.id, req.user.id);
        return successResponse(res, 'Shipment marked as in transit successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to mark shipment as in transit', [], 400);
    }
};
export const markOutForDelivery = async (req, res) => {
    try {
        const shipment = await markShipmentOutForDelivery(req.params.id, req.user.id);
        return successResponse(res, 'Shipment marked as out for delivery successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to mark shipment as out for delivery', [], 400);
    }
};
export const deliver = async (req, res) => {
    try {
        const shipment = await deliverShipment(req.params.id, req.user.id);
        return successResponse(res, 'Shipment delivered successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to deliver shipment', [], 400);
    }
};
export const deliveryFailed = async (req, res) => {
    try {
        const shipment = await markShipmentDeliveryFailed(req.params.id, req.user.id);
        return successResponse(res, 'Shipment marked as delivery failed successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to mark shipment as delivery failed', [], 400);
    }
};
export const returnShipmentController = async (req, res) => {
    try {
        const shipment = await returnShipment(req.params.id, req.user.id);
        return successResponse(res, 'Shipment returned successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to return shipment', [], 400);
    }
};
export const getCourierAssigned = async (req, res) => {
    try {
        const assignments = await getCourierAssignedShipments(req.user.id);
        return successResponse(res, 'Courier assigned shipments retrieved successfully', assignments);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve assigned shipments', [], 500);
    }
};
export const getCourierCompleted = async (req, res) => {
    try {
        const assignments = await getCourierCompletedShipments(req.user.id);
        return successResponse(res, 'Courier completed shipments retrieved successfully', assignments);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve completed shipments', [], 500);
    }
};
export const getCourierActive = async (req, res) => {
    try {
        const assignments = await getCourierActiveShipments(req.user.id);
        return successResponse(res, 'Courier active shipments retrieved successfully', assignments);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve active shipments', [], 500);
    }
};
export const getCourierShipment = async (req, res) => {
    try {
        const shipment = await getCourierShipmentById(req.user.id, req.params.id);
        return successResponse(res, 'Courier shipment retrieved successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipment', [], 404);
    }
};
export const getCourierHistory = async (req, res) => {
    try {
        const history = await getCourierShipmentHistory(req.user.id, req.params.id);
        return successResponse(res, 'Courier shipment history retrieved successfully', history);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve shipment history', [], 404);
    }
};
//# sourceMappingURL=shipment.controller.js.map