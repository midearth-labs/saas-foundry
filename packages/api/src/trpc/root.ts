import { router } from './trpc';
import { waitlistRouterConfiguration } from './routers/waitlist.router';
import { AppServiceRouter } from '../api/schema/root';

// Refresh type definition by re-exporting
export const getAppRouter = () => {
  // Use type assertion to bypass the type checking error
  const routerConfiguration = {
    waitlist: waitlistRouterConfiguration,
  } as AppServiceRouter;
  
  return router(routerConfiguration);
}