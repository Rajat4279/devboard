import express from 'express';
import {
   createCollaborator,
    getAllCollaborators,
    getCollaboratorById,
    updateCollaborator,
    deleteCollaborator
} from '../controllers/collaborator.controller.js';
import { isLoggedIn, apiKeyRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/projects/:projectId/collaborators').post(isLoggedIn, apiKeyRequired, createCollaborator);
router.route('/projects/:projectId/collaborators').get(isLoggedIn, apiKeyRequired, getAllCollaborators);
router.route('/collaborators/:id').get(isLoggedIn, apiKeyRequired, getCollaboratorById);
router.route('/collaborators/:id').put(isLoggedIn, apiKeyRequired, updateCollaborator);
router.route('/collaborators/:id').delete(isLoggedIn, apiKeyRequired, deleteCollaborator);

export default router;