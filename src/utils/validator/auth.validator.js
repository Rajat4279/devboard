import { z } from 'zod';

export const registerValidator = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
        .string()
        .min(6, 'Confirm password must be at least 6 characters long'),
    gender: z.enum(['male', 'female', 'other']).optinal(),
});
