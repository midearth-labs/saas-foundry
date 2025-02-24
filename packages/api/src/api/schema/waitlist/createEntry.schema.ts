import { z } from 'zod';
import { EmailSchema } from '../../types/user.schema';
import { waitlistFieldTypeSchema } from './createDefinition.schema';

export const waitlistEntryStatus = z
.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING');

export const fieldValueSchema = z.object({
    fieldType: waitlistFieldTypeSchema,
    fieldValue: z.string().or(z.array(z.string()))
});

export const createEntryInputSchema = z.object({
    id: z.string().cuid().min(16).optional(),
    definitionId: z.string().cuid(),
    by: z.string().optional(), 
    email: EmailSchema, 
    status: waitlistEntryStatus,
    fieldValues: z
        .array(fieldValueSchema)
        .refine(fields => new Set(fields).size === fields.length, 
        "No duplicate fields allowed")
});

export const createEntryOutputSchema = z.object({
    message: z.string().default("Entry created successfully"),
    id: z.string().cuid().optional()
});

