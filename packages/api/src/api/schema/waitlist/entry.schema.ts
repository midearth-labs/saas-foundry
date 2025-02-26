import { z } from 'zod';
import { Email, UUIDOutputSchema } from '../common';
import { ZodRoutes, ZodOperation, ConvertRoutesToType } from '../../types/schema.zod.configuration';
import { definitionId } from './common.schema';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

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

export type EntryServiceShape = ConvertRoutesToType<typeof EntryRoutesConfiguration>
export type EntryServiceRouter = ConvertRoutesToCreateRouterOptions<EntryServiceShape>