import { getAdminShipments, getAdminShipmentById, getAdminShipmentHistory, getAdminShipmentsByStatus, getAdminCouriers, getAdminCourierShipments, getAdminActiveShipments, getAdminDashboardStats, } from '../services/admin-shipment.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
export const getAll = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminShipments({
            page: query.page,
            limit: query.limit,
            status: query.status,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Admin shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipments', [], 500);
    }
};
export const getOne = async (req, res) => {
    try {
        const shipment = await getAdminShipmentById(req.params.id);
        return successResponse(res, 'Admin shipment retrieved successfully', shipment);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipment', [], 404);
    }
};
export const getHistory = async (req, res) => {
    try {
        const history = await getAdminShipmentHistory(req.params.id);
        return successResponse(res, 'Admin shipment history retrieved successfully', history);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve shipment history', [], 404);
    }
};
export const getReadyForAssignment = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminShipmentsByStatus('READY_FOR_ASSIGNMENT', {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Ready-for-assignment shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve shipments', [], 500);
    }
};
export const getActive = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminActiveShipments({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Active shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve active shipments', [], 500);
    }
};
export const getCompleted = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminShipmentsByStatus('DELIVERED', {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Completed shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve completed shipments', [], 500);
    }
};
export const getCancelled = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminShipmentsByStatus('CANCELLED', {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Cancelled shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve cancelled shipments', [], 500);
    }
};
export const getCouriers = async (req, res) => {
    try {
        const couriers = await getAdminCouriers();
        return successResponse(res, 'Couriers retrieved successfully', couriers);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve couriers', [], 500);
    }
};
export const getCourierShipments = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const result = await getAdminCourierShipments(req.params.id, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Courier shipments retrieved successfully', result);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve courier shipments', [], 404);
    }
};
export const getDashboardStats = async (req, res) => {
    try {
        const stats = await getAdminDashboardStats();
        return successResponse(res, 'Admin dashboard statistics retrieved successfully', stats);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve dashboard statistics', [], 500);
    }
};
//# sourceMappingURL=admin-shipment.controller.js.map