import prisma from '../../prisma/client.js';
import { collaboratorValidator } from '../utils/validators/collaborator.validator.js';
import ApiResponse from '../lib/api-response.js';
import ApiError from '../lib/api-error.js';
import { logger } from '../utils/logger/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createCollaborator = async (req, res) => {
    const { projectId } = req.params;

    const result = collaboratorValidator.safeParse(req.body);

    if (!result.success) {
        const errors = {};
        result.error.issues.forEach((issue) => {
            errors[issue.path.join('.')] = issue.message;
        });
        return res
            .status(400)
            .json(new ApiError(400, 'Validation error', errors));
    }

    const { userId, role } = result.data;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                collaborators: true,
            },
        });

        if (!project) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        const isMember = project.collaborators.some(
            (member) => member.userId === userId
        );

        if (isMember) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'User is already a collaborator on this project'
                    )
                );
        }
        const collaborator = await prisma.collaborator.create({
            data: {
                userId,
                projectId,
                role,
            },
        });
        res.status(201).json(new ApiResponse(201, 'Collaborator created successfully', collaborator));
    } catch (error) {
        logger.error(
            `Internal server error during task creation {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getAllCollaborators = async (req, res) => {
    const { projectId } = req.params;

    try {
        const collaborators = await prisma.collaborator.findMany({
            where: { projectId },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (collaborators.length === 0) {
            return res.status(404).json(new ApiError(404, 'No collaborators found for this project'));
        }

        res.status(200).json(new ApiResponse(200, 'Collaborators retrieved successfully', collaborators));
    } catch (error) {
        logger.error(
            `Internal server error during fetching collaborators {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getCollaboratorById = async (req, res) => {
    try{
        const { id: collaboratorId } = req.params;

        const collaborator = await prisma.collaborator.findUnique({
            where: { id: collaboratorId },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!collaborator) {
            return res.status(404).json(new ApiError(404, 'Collaborator not found'));
        }

        res.status(200).json(new ApiResponse(200, 'Collaborator retrieved successfully', collaborator));
    }catch(error){
        logger.error(
            `Internal server error during fetching collaborator by ID {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const updateCollaborator = async (req, res) => {
    try{
        const { id: collaboratorId } = req.params;
        const result = collaboratorValidator.safeParse(req.body);

        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { userId, role } = result.data;

        const collaborator = await prisma.collaborator.update({
            where: { id: collaboratorId },
            data: {
                userId,
                role,
            },
        });

        res.status(200).json(new ApiResponse(200, 'Collaborator updated successfully', collaborator));
    }catch(error){
        logger.error(
            `Internal server error during updating collaborator {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const deleteCollaborator = async (req, res) => {
    try {
        const { id: collaboratorId } = req.params;
        
        // Check if the collaborator exists first
        const collaborator = await prisma.collaborator.findUnique({
            where: { id: collaboratorId },
        });

        if (!collaborator) {
            return res.status(404).json(new ApiError(404, 'Collaborator not found'));
        }

        // Now delete it
        await prisma.collaborator.delete({
            where: { id: collaboratorId },
        });

        res.status(200).json(new ApiResponse(200, 'Collaborator deleted successfully', collaborator));
    } catch (error) {
        logger.error(
            `Internal server error during deleting collaborator {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
