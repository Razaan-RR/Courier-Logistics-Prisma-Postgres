import { errorResponse } from '../utils/response.js';
export const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            return errorResponse(res, 'Validation failed', result.error.issues, 400);
        }
        req.body = result.data.body;
        req.validatedParams = result.data.params;
        req.validatedQuery = result.data.query;
        next();
    };
};
//# sourceMappingURL=validate.middleware.js.map