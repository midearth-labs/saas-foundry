import { z } from 'zod';
import { definitionId } from './common.schema';
import { ConvertRoutesToType, ZodOperation, ZodRoutes } from '../../types/schema.zod.configuration';
import { UUIDInputSchema, UUIDOutputSchema, VoidInputSchema } from '../common';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

const waitlistDefinitionStatus = z
.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

const definitionIDInputSchema = UUIDInputSchema;

const create = {
    input: z.object({
        name: z.string(),  // A sort of title
        description: z.string().min(0),
        status: waitlistDefinitionStatus,
        // fields: z.array(waitlistFieldTypeSchema), // Defaults to ['TEXT']
    }),
    output: UUIDOutputSchema,
    type: 'mutation',
} satisfies ZodOperation;

const get = {
    input: definitionIDInputSchema,
    output: z.object({
        id: definitionId, // DB primary key
        ...create.input.shape,
        createdAt: z.date(),
        updatedAt: z.date(),  // Last used
    }),
    type: 'query',
} satisfies ZodOperation;

/**
 * Create a ListOperationSchema, that its Input & Output Schema extends something that has pagination controls 
 */
const list = {
    input: VoidInputSchema,
    output: z.array(get.output),
    type: 'query',
} satisfies ZodOperation;

export const DefinitionRoutesConfiguration = {
    create,
    get,
    list,
} satisfies ZodRoutes;

export type DefinitionServiceShape = ConvertRoutesToType<typeof DefinitionRoutesConfiguration>
export type DefinitionServiceRouter = ConvertRoutesToCreateRouterOptions<DefinitionServiceShape>
