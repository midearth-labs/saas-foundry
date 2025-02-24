import { z } from 'zod';
import { EmailSchema, PasswordSchema } from '../../types/user.schema';

export const loginInputSchema = z.object({
    email: EmailSchema, // Auto-casing transform
    password: PasswordSchema, // Enforces strong password rule
    role: z.enum(['USER', 'ADMIN']).default('USER').readonly(),
});

export const loginOutputSchema = z.object({
    token: z.string().cuid(),
    message: z.string().optional().default("User logged in successfully")
});
