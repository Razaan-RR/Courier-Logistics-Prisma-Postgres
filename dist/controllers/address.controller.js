import { createAddress, getMyAddresses, updateAddress, deleteAddress, } from '../services/address.service.js';
import { errorResponse, successResponse } from '../utils/response.js';
export const create = async (req, res) => {
    try {
        const address = await createAddress(req.user.id, req.body);
        return successResponse(res, 'Address created successfully', address, 201);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to create address', [], 400);
    }
};
export const getAll = async (req, res) => {
    try {
        const addresses = await getMyAddresses(req.user.id);
        return successResponse(res, 'Addresses retrieved successfully', addresses);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to retrieve addresses', [], 500);
    }
};
export const update = async (req, res) => {
    try {
        const address = await updateAddress(req.user.id, req.params.id, req.body);
        return successResponse(res, 'Address updated successfully', address);
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to update address', [], 400);
    }
};
export const remove = async (req, res) => {
    try {
        await deleteAddress(req.user.id, req.params.id);
        return successResponse(res, 'Address deleted successfully', {});
    }
    catch (error) {
        return errorResponse(res, error instanceof Error ? error.message : 'Failed to delete address', [], 400);
    }
};
//# sourceMappingURL=address.controller.js.map