import { z } from 'zod';
export const collaboratorValidator = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    role: z.enum(['member', 'admin'], {
        message: 'Role must be one of: member, admin',
    }).default('member'),
});