import { z } from 'zod';

export const taskValidator = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    status: z
        .enum(['pending', 'in-progress', 'completed'], {
            message: 'Status must be one of: pending, in-progress, completed',
        })
        .default('pending'),
    assignedToId: z.string().uuid('Invalid assigned user ID format'),
});
