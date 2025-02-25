import { router } from './trpc';
import { waitlistRouterConfiguration } from './routers/waitlist';
import { AppServiceRouter } from '../api/schema/root';

const routerConfiguration: AppServiceRouter = {
  waitlist: waitlistRouterConfiguration,
}

export const appRouter = router(routerConfiguration);