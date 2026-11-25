import { errorResponse } from '../utils/response.js';
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Authentication required', [], 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 'Access denied', [], 403);
        }
        next();
    };
};
//# sourceMappingURL=role.middleware.js.map