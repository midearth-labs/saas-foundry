import { publicProcedure, router } from '../trpc';
import { HotelGuestRoutesConfiguration } from '../../api/schema/hotel-guest/hotel-guest.schema';
import { hotelGuestService } from '../../services/impl/hotel-guest.service';

const hotelGuestBaseProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const { repositories, ...rest } = ctx;
    return next({
        ctx: {
            ...rest,
            hotelGuestRepository: repositories.hotelGuest,
        },
    });
});

export const hotelGuestRouter = router({
    create: hotelGuestBaseProcedure
        .input(HotelGuestRoutesConfiguration.create.input)
        .mutation(hotelGuestService.create),

    get: hotelGuestBaseProcedure
        .input(HotelGuestRoutesConfiguration.get.input)
        .query(hotelGuestService.get),

    list: hotelGuestBaseProcedure
        .input(HotelGuestRoutesConfiguration.list.input)
        .query(hotelGuestService.list),

    update: hotelGuestBaseProcedure
        .input(HotelGuestRoutesConfiguration.update.input)
        .mutation(hotelGuestService.update),

    delete: hotelGuestBaseProcedure
        .input(HotelGuestRoutesConfiguration.delete.input)
        .mutation(hotelGuestService.delete),
}); 