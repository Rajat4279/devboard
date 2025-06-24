import prisma from '../../prisma/client.js';
import { taskValidator } from '../utils/validators/task.validator.js';
import ApiResponse from '../lib/api-response.js';
import ApiError from '../lib/api-error.js';
import { logger } from '../utils/logger/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { id } from 'zod/v4/locales';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createTask = async (req, res) => {
    try {
        const result = taskValidator.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { title, description, status, assignedToId } =
            result.data;
        
        const projectId = req.params.projectId;

        // check if the assignedToId is exists in the db for that project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                collaborators: true,
            },
        });

        if (!project) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        let isMember = project.collaborators.some(
            (member) => member.userId === assignedToId
        );



        isMember = isMember ||( assignedToId == req.user.id);

        if (!isMember ) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'Assigned user is not a member of the project'
                    )
                );
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'pending',
                projectId,
                assignedToId,
                assignedById: req.user.id,
            },
        });

        if (!task) {
            return res
                .status(500)
                .json(new ApiError(400, 'Failed to create task'));
        }

        return res
            .status(201)
            .json(new ApiResponse(201, 'Task created successfully', task));
    } catch (error) {
        logger.error(
            `Internal server error during task creation {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            select: {
                id: true,
                project: true,
                title: true,
                description: true,
                status: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
            },
        });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json(new ApiError(404, 'No tasks found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Tasks fetched successfully', tasks));
    } catch (error) {
        logger.error(
            `Internal server error during fetching all tasks {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
            select: {
                id: true,
                project: true,
                title: true,
                description: true,
                status: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json(new ApiError(404, 'Task not found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Task fetched successfully', task));
    } catch (error) {
        logger.error(
            `Internal server error during fetching task by ID {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const result = taskValidator.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { title, description, status, projectId, assignedToId } =
            result.data;

        const task = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                status,
                projectId,
                assignedToId,
            },
            select: {
                id: true,
                project: true,
                title: true,
                description: true,
                status: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        gender: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json(new ApiError(404, 'Task not found'));
        }
        return res
            .status(200)
            .json(new ApiResponse(200, 'Task updated successfully', task));
    } catch (error) {
        logger.error(
            `Internal server error during task update {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.delete({
            where: { id },
        });

        if (!task) {
            return res.status(404).json(new ApiError(404, 'Task not found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Task deleted successfully', task));
    } catch (error) {
        logger.error(
            `Internal server error during task deletion {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
