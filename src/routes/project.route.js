import express from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectById,
    deleteProjectById,
} from '../controllers/project.controller.js';
import { isLoggedIn, apiKeyRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/projects').post(isLoggedIn, apiKeyRequired, createProject);
router.route('/projects').get(isLoggedIn, apiKeyRequired, getAllProjects);
router.route('/projects/:id').get(isLoggedIn, apiKeyRequired, getProjectById);
router
    .route('/projects/:id')
    .put(isLoggedIn, apiKeyRequired, updateProjectById);
router
    .route('/projects/:id')
    .delete(isLoggedIn, apiKeyRequired, deleteProjectById);

export default router;
