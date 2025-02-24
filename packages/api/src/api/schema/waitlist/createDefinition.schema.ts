import { z } from 'zod';

export const waitlistDefinitionTypeSchema = z
.enum(['feature-resourcesharing-waitlist', 'prelaunch-waitlist'])
.default('prelaunch-waitlist');

export const waitlistDefinitionStatusSchema = z
.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

// Take note that multiselect's eventual CONCRETE values
// would be contained in an array, and ultimately parsed
// and stored in the db as a JSON array
export const waitlistFieldTypeSchema = z
.enum(['TEXT', 'SELECT', 'MULTISELECT', 'REASON', 'COMPANY_NAME'])
.default('TEXT');

export const createDefinitionInputSchema = z.object({
    name: z.string(),  // A sort of title
    description: z.string().min(20),
    waitlistType: waitlistDefinitionTypeSchema,
    status: waitlistDefinitionStatusSchema,
    fields: z.array(waitlistFieldTypeSchema), // Defaults to ['TEXT']
});

export const createDefinitionOutputSchema = z.object({
    message: z.string().default("Waitlist definition created"),
    id: z.string().cuid(),
    name: z.string()
});
