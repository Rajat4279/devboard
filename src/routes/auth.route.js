import express from 'express';
import {
    register,
    login,
    generateApiKey,
    getMe,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/api-key').post(generateApiKey);
router.route('/me').get(getMe);

export default router;