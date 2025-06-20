import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    registerValidator,
    loginValidator,
} from '../utils/validators/auth.validator.js';
import ApiResponse from '../lib/api-response.js';
import ApiError from '../lib/api-error.js';
import { logger } from '../utils/logger/index.js';
import { generateJwtToken } from '../lib/generate-jwt-token.js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const register = async (req, res) => {
    try {
        const result = registerValidator.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { name, email, password, confirmPassword, gender } = result.data;

        // Check if password is equal to confirmPassword
        if (password !== confirmPassword) {
            return res
                .status(400)
                .json(new ApiError(400, 'Passwords do not match'));
        }

        // check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res
                .status(400)
                .json(new ApiError(400, 'User already exists'));
        }

        // hash the passwrod
        const hashedPassword = await bcrypt.hash(password, 10);
        // add random user image
        let profilePic = `https://avatar.iran.liara.run/username?username=[${name}]`;
        if (gender && gender === 'male') {
            profilePic = 'https://avatar.iran.liara.run/public/boy';
        } else if (gender && gender === 'female') {
            profilePic = 'https://avatar.iran.liara.run/public/girl';
        }

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: profilePic,
                gender,
            },
        });

        // get JWT tokens
        const { accessToken, refreshToken } = generateJwtToken(user.id);

        // save refresh token in the database
        await prisma.user.update({
            where: { id: user.id },
            data: { ...user, refreshToken },
        });

        // set access token in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000, // 5 minutes
        });

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        if (!user) {
            return res
                .status(500)
                .json(new ApiError(500, 'Failed to create user'));
        }

        // ensure api key in set to null
        if (!user.apiKey) {
            user.apiKey = null;
        }

        // remove password and refresh token from user object
        delete user.password;
        delete user.refreshToken;

        return res
            .status(201)
            .json(new ApiResponse(201, 'User registered successfully', user));
    } catch (error) {
        logger.error(
            `Internal server error during registration {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
export const login = async (req, res) => {
    try {
        const result = loginValidator.safeParse(req.body);

        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { email, password } = result.data;

        // search for user by email
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res
                .status(403)
                .json(new ApiError(403, 'Email or password is incorrect'));
        }

        // check user password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(403)
                .json(new ApiError(403, 'Email or password is incorrect'));
        }

        // generate JWT tokens
        const { accessToken, refreshToken } = generateJwtToken(user.id);

        // save refresh token in the database
        await prisma.user.update({
            where: { id: user.id },
            data: { ...user, refreshToken },
        });

        // set access token in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000, // 5 minutes
        });

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // remove password, apiKey and refresh token from user object
        delete user.password;
        delete user.refreshToken;
        if (user.apiKey) {
            delete user.apiKey;
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'User logged in successfully', user));
    } catch (error) {
        logger.error(`Internal server error during login {Location: ${__dirname + __filename}}`);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const generateApiKey = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
        });

        // generate api key
        const apiKey = crypto.randomBytes(32).toString('hex');

        // update user with api key
        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                apiKey: apiKey,
            },
        });

        // remove password, apikey and refreshtoken from user object
        delete updatedUser.password;
        delete updatedUser.apiKey;
        delete updatedUser.refreshToken;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'API key generated successfully',
                    updatedUser
                )
            );
    } catch (error) {
        logger.error(
            `Internal server error during API key generation {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                gender: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, 'User fetched successfully', user));
    } catch (error) {
        logger.error(`Internal server error while fetching user  {Location: ${__dirname+__filename}}`);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const logout = async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null }, // clear refresh token in the database
        });

        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        // clear access token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        // clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res
            .status(200)
            .json(new ApiResponse(200, 'User logged out successfully'));
    } catch (error) {
        logger.error(`Internal server error during logout  {Location: ${__dirname+__filename}}`);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const generateRefereshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res
                .status(401)
                .json(new ApiError(401, 'No refresh token provided'));
        }

        // verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
        } catch (err) {
            return res
                .status(401)
                .json(new ApiError(401, 'Invalid or expired refresh token'));
        }

        if (!decoded) {
            return res
                .status(401)
                .json(new ApiError(401, 'Invalid refresh token'));
        }

        // find user by id
        let user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            return res
                .status(401)
                .json(new ApiError(401, 'User not found or invalid token'));
        }

        // generate new access token and refresh token
        const { accessToken, refreshToken: newRefreshToken } = generateJwtToken(
            user.id
        );

        // update user with new refresh token
        user = await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        // set new access token in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000, // 5 minutes
        });

        // set new refresh token in cookies
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // remove password and refresh token from user object
        delete user.password;
        delete user.refreshToken;

        return res
            .status(200)
            .json(new ApiResponse(200, 'Tokens generated successfully', user));
    } catch (error) {
        logger.error(
            `Internal server error during token generation  {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
