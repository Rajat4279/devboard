import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js';
import ApiError from '../lib/api-error.js';
import { logger } from '../utils/logger/index.js';

export const isLoggedIn = async (req, res, next) => {
    try {
        const token =
            req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        'You are not logged in! Please log in to get access.'
                    )
                );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            return res
                .status(401)
                .json(new ApiError(401, 'Invalid token. Please log in again.'));
        }

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId },
        });

        if (!user) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        'The user belonging to this token no longer exists.'
                    )
                );
        }
        req.user = user;
        next();
    } catch (error) {
        logger.error('Internal server error during authentication');
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const apiKeyRequired = (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res
                .status(401)
                .json(new ApiError(401, 'API key is required for this route.'));
        }

        if (req.user.apiKey !== apiKey) {
            return res
                .status(403)
                .json(new ApiError(403, 'Forbidden: Invalid API key.'));
        }

        next();
    } catch (error) {
        logger.error('Internal server error during api key validation');
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
