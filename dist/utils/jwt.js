import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, authConfig.accessTokenSecret, {
        expiresIn: authConfig.accessTokenExpiresIn,
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, authConfig.refreshTokenSecret, {
        expiresIn: authConfig.refreshTokenExpiresIn,
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, authConfig.accessTokenSecret);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, authConfig.refreshTokenSecret);
};
//# sourceMappingURL=jwt.js.map