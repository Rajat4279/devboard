import { projectValidator } from '../utils/validators/project.validator.js';
import ApiResponse from '../lib/api-response.js';
import ApiError from '../lib/api-error.js';
import { logger } from '../utils/logger/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ta } from 'zod/v4/locales';
import { title } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createProject = async (req, res) => {
    try {
        const result = projectValidator.safeParse(req.body);

        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { name, description } = result.data;

        // save the project in the database
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: req.user.id,
            },
        });

        if (!newProject) {
            return res
                .status(400)
                .json(new ApiError(400, 'Failed to create project'));
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Project created successfully', newProject)
            );
    } catch (error) {
        logger.error(
            `Internal server error while creating project {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                        gender: true,
                        image: true,
                    },
                },
            },
        });

        if (!projects || projects.length === 0) {
            return res.status(200).json(new ApiError(200, 'No projects found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Projects fetched successfully', projects)
            );
    } catch (error) {
        logger.error(
            `Internal server error while fetching projects {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const getProjectById = async (req, res) => {
    try {
        const { id: projectId } = req.params;

        if (!projectId) {
            return res
                .status(400)
                .json(new ApiError(400, 'Project ID is required'));
        }
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        name: true,
                        email: true,
                        gender: true,
                        image: true,
                    },
                },
                collaborators: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        projectId: true,
                        status: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true,
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        assignedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Project fetched successfully', project)
            );
    } catch (error) {
        logger.error(
            `Internal server error while fetching project {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const updateProjectById = async (req, res) => {
    try {
        const { id: projectId } = req.params;

        if (!projectId) {
            return res
                .status(400)
                .json(new ApiError(400, 'Project ID is required'));
        }

        let updateBody = {};

        if (req.body.name) {
            updateBody.name = req.body.name;
        }

        if (req.body.description) {
            updateBody.description = req.body.description;
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                ...updateBody,
            },
        });

        if (!updatedProject) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Project updated successfully',
                    updatedProject
                )
            );
    } catch (error) {
        logger.error(
            `Internal server error while fetching project {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};

export const deleteProjectById = async (req, res) => {
    try {
        const { id: projectId } = req.params;

        if (!projectId) {
            return res
                .status(400)
                .json(new ApiError(400, 'Project ID is required'));
        }

        const deletedProject = await prisma.project.delete({
            where: { id: projectId },
        });

        if (!deletedProject) {
            return res.status(404).json(new ApiError(404, 'Project not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Project deleted successfully',
                    deletedProject
                )
            );
    } catch (error) {
        logger.error(
            `Internal server error while deleting project {Location: ${__dirname + __filename}}`
        );
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
