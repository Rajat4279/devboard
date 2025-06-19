import express from 'express';
import {
    register,
    login,
    generateApiKey,
    getMe,
    logout,
    generateRefereshToken,
} from '../controllers/auth.controller.js';
import {isLoggedIn} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/api-key').post(isLoggedIn, generateApiKey);
router.route('/me').get(isLoggedIn, getMe);
router.route('/logout').post(isLoggedIn, logout);
router.route('/refresh-token').post(generateRefereshToken);

export default router;
