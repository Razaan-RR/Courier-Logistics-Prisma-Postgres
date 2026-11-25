import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        return errorResponse(res, 'Authentication required', [], 401);
    }
    const token = authorization.substring(7);
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch {
        return errorResponse(res, 'Invalid or expired access token', [], 401);
    }
};
//# sourceMappingURL=auth.middleware.js.map