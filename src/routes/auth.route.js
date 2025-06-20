import express from 'express';
import {
    register,
    login,
    generateApiKey,
    getMe,
    logout,
    generateRefereshToken,
} from '../controllers/auth.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/auth/register').post(register);
router.route('/auth/login').post(login);
router.route('/auth/api-key').post(isLoggedIn, generateApiKey);
router.route('/auth/me').get(isLoggedIn, getMe);
router.route('/auth/logout').post(isLoggedIn, logout);
router.route('/auth/refresh-token').post(generateRefereshToken);

export default router;
