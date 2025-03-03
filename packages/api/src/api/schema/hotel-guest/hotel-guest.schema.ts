import { z } from 'zod';
import { ConvertRoutesToType, ZodOperation, ZodRoutes } from '../../types/schema.zod.configuration';
import { UUIDInputSchema, UUIDOutputSchema, VoidInputSchema } from '../common';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';

const hotelGuestStatus = z.enum(['CHECKED_IN', 'CHECKED_OUT', 'RESERVED', 'CANCELLED']);

const createHotelGuestSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    status: hotelGuestStatus,
    roomNumber: z.string().optional(),
    checkInDate: z.date().optional(),
    checkOutDate: z.date().optional(),
    specialRequests: z.string().optional(),
});

const create = {
    input: createHotelGuestSchema,
    output: UUIDOutputSchema,
    type: 'mutation',
} satisfies ZodOperation;

const get = {
    input: UUIDInputSchema,
    output: createHotelGuestSchema.extend({
        id: z.string().uuid(),
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
        id: z.string().uuid(),
        data: createHotelGuestSchema.partial(),
    }),
    output: get.output,
    type: 'mutation',
} satisfies ZodOperation;

const remove = {
    input: UUIDInputSchema,
    output: z.void(),
    type: 'mutation',
} satisfies ZodOperation;

export const HotelGuestRoutesConfiguration = {
    create,
    get,
    list,
    update,
    delete: remove,
} satisfies ZodRoutes;

export type HotelGuestServiceShape = ConvertRoutesToType<typeof HotelGuestRoutesConfiguration>;
export type HotelGuestServiceRouter = ConvertRoutesToCreateRouterOptions<HotelGuestServiceShape>