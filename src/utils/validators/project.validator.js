import { z } from 'zod';

export const projectValidator = z.object({
    name: z.string().trim().min(1, 'Project name is required'),
    description: z.string().trim().min(5, 'Project description is required'),
});
