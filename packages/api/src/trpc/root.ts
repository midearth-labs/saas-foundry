import { router } from './trpc';
import { waitlistRouterConfiguration } from './routers/waitlist.router';
import { AppServiceRouter } from '../api/schema/root';
import { hotelGuestRouter } from './routers/hotel-guest.router';

export const getAppRouter = () => {
  const routerConfiguration: AppServiceRouter = {
    waitlist: waitlistRouterConfiguration,
    hotelGuest: hotelGuestRouter,
    // @TODO: @Awwal this should be added: hotelGuest: hotelGuestRouterConfiguration,
  }
  
  return router(routerConfiguration);
}