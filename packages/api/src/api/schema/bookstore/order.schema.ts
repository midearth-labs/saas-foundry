import { z } from 'zod';
import { bookId, orderId } from './common.schema';
import { ConvertRoutesToType, ZodOperation, ZodRoutes } from '../../types/schema.zod.configuration';
import { UUIDInputSchema, UUIDOutputSchema, VoidInputSchema } from '../common';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

const orderStatus = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

const orderIDInputSchema = UUIDInputSchema;

const orderItem = z.object({
  bookId: bookId,
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const create = {
  input: z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    shippingAddress: z.string().min(1),
    status: orderStatus,
    totalAmount: z.number().positive(),
    items: z.array(orderItem).min(1),
  }),
  output: UUIDOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

const get = {
  input: orderIDInputSchema,
  output: z.object({
    id: orderId,
    customerName: z.string(),
    customerEmail: z.string(),
    shippingAddress: z.string(),
    status: orderStatus,
    totalAmount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    items: z.array(
      z.object({
        id: z.string().uuid(),
        bookId: bookId,
        quantity: z.number(),
        unitPrice: z.number(),
      })
    ),
  }),
  type: 'query',
} satisfies ZodOperation;

const list = {
  input: VoidInputSchema,
  output: z.array(
    z.object({
      id: orderId,
      customerName: z.string(),
      customerEmail: z.string(),
      shippingAddress: z.string(),
      status: orderStatus,
      totalAmount: z.number(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
  type: 'query',
} satisfies ZodOperation;

const updateStatus = {
  input: z.object({
    id: orderId,
    status: orderStatus,
  }),
  output: UUIDOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

export const OrderRoutesConfiguration = {
  create,
  get,
  list,
  updateStatus,
} satisfies ZodRoutes;

export type OrderServiceShape = ConvertRoutesToType<typeof OrderRoutesConfiguration>;
export type OrderServiceRouter = ConvertRoutesToCreateRouterOptions<OrderServiceShape>; 