import { createStripePayment, getCustomerPaymentById, getCustomerPayments, getCustomerShipmentPayment } from '../services/payment.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
export const createPayment = async (req, res) => {
    try {
        const payment = await createStripePayment(req.user.id, req.body.shipmentId);
        return successResponse(res, 'Stripe payment session created successfully', payment, 201);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to create payment', [], 400);
    }
};
export const paymentSuccess = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Payment completed. Please check the payment status.',
        sessionId: req.query.session_id,
    });
};
export const paymentCancel = async (_req, res) => {
    return res.status(200).json({
        success: false,
        message: 'Payment was cancelled.',
    });
};
export const getPayments = async (req, res) => {
    try {
        const query = req.validatedQuery;
        const payments = await getCustomerPayments(req.user.id, {
            page: query.page,
            limit: query.limit,
            status: query.status,
            sortOrder: query.sortOrder,
        });
        return successResponse(res, 'Payments retrieved successfully', payments, 200);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve payments', [], 400);
    }
};
export const getPaymentById = async (req, res) => {
    try {
        const payment = await getCustomerPaymentById(req.user.id, req.validatedParams.id);
        return successResponse(res, 'Payment retrieved successfully', payment, 200);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve payment', [], 404);
    }
};
export const getShipmentPayment = async (req, res) => {
    try {
        const payment = await getCustomerShipmentPayment(req.user.id, req.validatedParams.id);
        return successResponse(res, 'Shipment payment retrieved successfully', payment, 200);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error
            ? error.message
            : 'Failed to retrieve shipment payment', [], 404);
    }
};
//# sourceMappingURL=payment.controller.js.map