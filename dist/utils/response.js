export const successResponse = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
export const errorResponse = (res, message, errors = [], statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
//# sourceMappingURL=response.js.map