import { z } from 'zod';
import { Email, UUIDOutputSchema } from '../common';
import { InferredServiceRoutes, ZodRoutes, ZodOperation } from '../../types/schema.zod.configuration';
import { definitionId } from './common.schema';

const create = {
    input: z.object({
        definitionId: definitionId,
        email: Email,
    }),
    output: UUIDOutputSchema,
    type: 'mutation',
} satisfies ZodOperation;

export const EntryRoutesConfiguration = {
    create,
} satisfies ZodRoutes;

export type EntryServiceRouter = InferredServiceRoutes<typeof EntryRoutesConfiguration>
