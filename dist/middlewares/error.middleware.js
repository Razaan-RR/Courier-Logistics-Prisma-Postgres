import { errorResponse } from '../utils/response.js';
export const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    return errorResponse(res, err instanceof Error ? err.message : 'Something went wrong', [], 500);
};
//# sourceMappingURL=error.middleware.js.map