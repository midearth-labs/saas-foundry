import { z } from 'zod';
import { EmailSchema, PasswordSchema, UserSchema } from '../../types/user.schema';

export const signupInputSchema = z.object({
    email: EmailSchema, // Auto-casing transform
    password: PasswordSchema, // Enforces strong password rule
    role: z.enum(['USER', 'ADMIN']).default('USER').readonly(),
});

const userCreatedMessageSchema = UserSchema.pick({
    role: true,
});

export const signupOutputSchema = userCreatedMessageSchema.extend({
    token: z.string().cuid(),
    message: z.string().optional().default("User created successfully")
});
