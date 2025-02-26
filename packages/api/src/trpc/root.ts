import { router } from './trpc';
import { waitlistRouterConfiguration } from './routers/waitlist.router';
import { AppServiceRouter } from '../api/schema/root';

export const getAppRouter = () => {
  const routerConfiguration: AppServiceRouter = {
    waitlist: waitlistRouterConfiguration,
  }
  
  return router(routerConfiguration);
}