import { TRPCError } from '@trpc/server';
import { HotelGuestService } from '../interfaces/hotel-guest.service';

export const hotelGuestService: HotelGuestService = {
    async create({ input, ctx: { hotelGuestRepository } }) {
        return await hotelGuestRepository.create(input);
    },

    async get({ input, ctx: { hotelGuestRepository } }) {
        const guest = await hotelGuestRepository.findById(input);
        if (!guest) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Hotel guest not found',
            });
        }
        return guest;
    },

    async list({ ctx: { hotelGuestRepository } }) {
        return await hotelGuestRepository.findAll();
    },

    async update({ input: { id, data }, ctx: { hotelGuestRepository } }) {
        const updated = await hotelGuestRepository.update({ id }, data);
        if (!updated) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Hotel guest not found',
            });
        }
        return updated;
    },

    async delete({ input, ctx: { hotelGuestRepository } }) {
        await hotelGuestRepository.delete(input);
    },
}; 