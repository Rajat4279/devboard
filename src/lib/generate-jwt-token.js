import jwt from 'jsonwebtoken';

export const generateJwtToken = (userId) => {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    const accessToken = jwt.sign({ userId }, accessTokenSecret, { expiresIn: '5m' });
    const refreshToken = jwt.sign({ userId }, refreshTokenSecret, { expiresIn: '1d' });

    return { accessToken, refreshToken };
}