import { z } from 'zod';

export const logoutOutputSchema = z.object({
    success: z.boolean(),
    message: z.string().optional().default("User logged out successfully")
});
