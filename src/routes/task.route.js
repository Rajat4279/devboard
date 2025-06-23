import express from 'express';
import {
    createTask,
    getAllTasks,
    updateTask,
    deleteTask,
    getTaskById
} from '../controllers/task.controller.js';
import { isLoggedIn, apiKeyRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/projects/:projectId/tasks').post(isLoggedIn, apiKeyRequired, createTask);
router.route('/projects/:projectId/tasks').get(isLoggedIn, apiKeyRequired, getAllTasks);
router.route('/tasks/:id').get(isLoggedIn, apiKeyRequired, getTaskById);
router.route('/tasks/:id').put(isLoggedIn, apiKeyRequired, updateTask);
router.route('/tasks/:id').delete(isLoggedIn, apiKeyRequired, deleteTask);

export default router;