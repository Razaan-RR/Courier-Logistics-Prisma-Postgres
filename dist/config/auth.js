import 'dotenv/config';
export const authConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
};
//# sourceMappingURL=auth.js.map