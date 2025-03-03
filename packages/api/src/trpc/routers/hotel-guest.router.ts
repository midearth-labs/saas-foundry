import { publicProcedure, router } from '../trpc';
import { HotelGuestRoutesConfiguration, HotelGuestServiceRouter } from '../../api/schema/hotel-guest/hotel-guest.schema';
import { hotelGuestService } from '../../services/impl/hotel-guest.service';

// @TODO: @Awwal this need to be moved to trpc/base-procedures/hotel-guest.ts
const hotelGuestBaseProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const { repositories, ...rest } = ctx;
    return next({
        ctx: {
            ...rest,
            hotelGuestRepository: repositories.hotelGuest,
        },
    });
});

// @TODO: @Awwal this needs to be typed as HotelGuestServiceRouter. Also the router call should not be added. hotelGuestRouter should be a plain object
// could also be named hotelGuestRouterConfiguration
export const hotelGuestRouter: HotelGuestServiceRouter = {
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
}; 