import { z } from 'zod';
import { bookId } from './common.schema';
import { ConvertRoutesToType, ZodOperation, ZodRoutes } from '../../types/schema.zod.configuration';
import { UUIDInputSchema, UUIDOutputSchema, VoidInputSchema } from '../common';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

const bookStatus = z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']);

const bookIDInputSchema = UUIDInputSchema;

const create = {
  input: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().min(10).max(20),
    status: bookStatus,
    description: z.string().optional(),
    price: z.number().positive(),
    pageCount: z.number().int().positive().optional(),
    publisher: z.string().optional(),
    publishedYear: z.number().int().positive().optional(),
  }),
  output: UUIDOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

const get = {
  input: bookIDInputSchema,
  output: z.object({
    id: bookId,
    title: z.string(),
    author: z.string(),
    isbn: z.string(),
    status: bookStatus,
    description: z.string().nullable(),
    price: z.number(),
    pageCount: z.number().nullable(),
    publisher: z.string().nullable(),
    publishedYear: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  type: 'query',
} satisfies ZodOperation;

const list = {
  input: VoidInputSchema,
  output: z.array(get.output),
  type: 'query',
} satisfies ZodOperation;

const update = {
  input: z.object({
    id: bookId,
    data: z.object({
      title: z.string().min(1).optional(),
      author: z.string().min(1).optional(),
      isbn: z.string().min(10).max(20).optional(),
      status: bookStatus.optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      pageCount: z.number().int().positive().optional(),
      publisher: z.string().optional(),
      publishedYear: z.number().int().positive().optional(),
    }),
  }),
  output: UUIDOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

const remove = {
  input: bookIDInputSchema,
  output: UUIDOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

export const BookRoutesConfiguration = {
  create,
  get,
  list,
  update,
  remove,
} satisfies ZodRoutes;

export type BookServiceShape = ConvertRoutesToType<typeof BookRoutesConfiguration>;
export type BookServiceRouter = ConvertRoutesToCreateRouterOptions<BookServiceShape>; 