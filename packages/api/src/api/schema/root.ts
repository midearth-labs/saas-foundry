import { InferredClientRoutes, InferredServiceRoutes, ZodRoutes } from '../types/schema.zod.configuration';
import { HotelGuestRoutesConfiguration } from './hotel-guest/hotel-guest.schema';
import { WaitlistRoutesConfiguration } from './waitlist';

export const AppRoutesConfiguration = {
  waitlist: WaitlistRoutesConfiguration,
  hotelGuest: HotelGuestRoutesConfiguration,
  // @TODO: @Awwal this should be added: hotelGuest: HotelGuestRoutesConfiguration,
} satisfies ZodRoutes;

export type AppClientRouter = InferredClientRoutes<typeof AppRoutesConfiguration>
export type AppServiceRouter = InferredServiceRoutes<typeof AppRoutesConfiguration>
