import { z } from 'zod';
import { waitlistFieldTypeSchema } from './common.schema';

const waitlistDefinitionTypeSchema = z
.enum(['feature-resourcesharing-waitlist', 'prelaunch-waitlist'])
.default('prelaunch-waitlist');

const waitlistDefinitionStatusSchema = z
.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

const createDefinitionInputSchema = z.object({
    name: z.string(),  // A sort of title
    description: z.string().min(20),
    waitlistType: waitlistDefinitionTypeSchema,
    status: waitlistDefinitionStatusSchema,
    fields: z.array(waitlistFieldTypeSchema), // Defaults to ['TEXT']
});

const createDefinitionOutputSchema = z.object({
    message: z.string().default("Waitlist definition created"),
    id: z.string().cuid(),
    name: z.string()
});

const getDefinitionInputSchema = z.object({
    id: z.string().cuid()
});

const getDefinitionOutputSchema = z.object({
    id: z.string().cuid().min(16), // DB primary key
    ...createDefinitionInputSchema.shape,
    createdAt: z.date(),
    updatedAt: z.date(),  // Last used
});

const getAllDefinitionsOutputSchema = z.array(getDefinitionOutputSchema);