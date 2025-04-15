import { z } from 'zod';
import { Email, UUIDInputSchema, UUIDOutputSchema } from '../common';
import { ZodRoutes, ZodOperation, ConvertRoutesToType } from '../../types/schema.zod.configuration';
import { definitionId } from './common.schema';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

const entryStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const create = {
    input: z.object({
        definitionId: definitionId,
        email: Email,
    }),
    output: UUIDOutputSchema,
    type: 'mutation',
} satisfies ZodOperation;

const updateStatus = {
    input: z.object({
        entryId: UUIDInputSchema,
        status: entryStatusEnum,
    }),
    output: z.object({
        id: UUIDOutputSchema,
        status: entryStatusEnum,
        updatedAt: z.date(),
    }),
    type: 'mutation',
} satisfies ZodOperation;

const getEntry = {
    input: UUIDInputSchema,
    output: z.object({
        id: UUIDOutputSchema,
        definitionId: definitionId,
        email: Email,
        status: entryStatusEnum,
        createdAt: z.date(),
        updatedAt: z.date(),
    }),
    type: 'query',
} satisfies ZodOperation;

const searchEntriesInput = z.object({
    definitionId: definitionId,
    status: entryStatusEnum.optional(),
    email: z.string().optional(),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
}).transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
}));

const searchEntries = {
    input: searchEntriesInput,
    output: z.object({
        entries: z.array(getEntry.output),
        total: z.number(),
        page: z.number(),
        pages: z.number(),
    }),
    type: 'query',
} satisfies ZodOperation;

export const EntryRoutesConfiguration = {
    create,
    updateStatus,
    getEntry,
    searchEntries,
} satisfies ZodRoutes;

export type EntryServiceShape = ConvertRoutesToType<typeof EntryRoutesConfiguration>
export type EntryServiceRouter = ConvertRoutesToCreateRouterOptions<EntryServiceShape>