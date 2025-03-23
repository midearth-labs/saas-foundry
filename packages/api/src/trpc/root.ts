import { router } from './trpc';
import { waitlistRouterConfiguration } from './routers/waitlist.router';
import { AppServiceRouter } from '../api/schema/root';
import { bookstoreRouterConfigurations } from './routers/bookstore.router';

export const getAppRouter = () => {
  const routerConfiguration: AppServiceRouter = {
    waitlist: waitlistRouterConfiguration,
    bookstore: bookstoreRouterConfigurations,
  }
  
  return router(routerConfiguration);
}