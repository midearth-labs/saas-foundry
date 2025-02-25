import { z } from 'zod';
import { EmailSchema } from '../common/user.schema';
import { waitlistFieldTypeSchema } from './common.schema';

const waitlistEntryStatus = z
.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING');

const fieldValueSchema = z.map(waitlistFieldTypeSchema, z.string().or(z.array(z.string())));

const createEntryInputSchema = z.object({
    id: z.string().cuid().min(16).optional(),
    definitionId: z.string().cuid(),
    by: z.string().optional(), 
    email: EmailSchema, 
    status: waitlistEntryStatus,
    fieldValues: fieldValueSchema
});

const createEntryOutputSchema = z.object({
    message: z.string().default("Entry created successfully"),
    id: z.string().cuid().optional()
});
