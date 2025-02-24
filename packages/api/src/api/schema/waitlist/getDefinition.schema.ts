import { z } from 'zod';
import { createDefinitionInputSchema } from './createDefinition.schema';

export const getDefinitionInputSchema = z.object({
    id: z.string().cuid()
});

export const getDefinitionOutputSchema = z.object({
    id: z.string().cuid().min(16), // DB primary key
    ...createDefinitionInputSchema.shape,
    createdAt: z.date(),
    updatedAt: z.date(),  // Last used
});
