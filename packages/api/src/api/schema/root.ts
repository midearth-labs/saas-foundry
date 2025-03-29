import { InferredClientRoutes, InferredServiceRoutes, ZodRoutes } from '../types/schema.zod.configuration';
import { WaitlistRoutesConfiguration } from './waitlist';


export const AppRoutesConfiguration = {
  waitlist: WaitlistRoutesConfiguration,
} satisfies ZodRoutes;

export type AppClientRouter = InferredClientRoutes<typeof AppRoutesConfiguration>
export type AppServiceRouter = InferredServiceRoutes<typeof AppRoutesConfiguration>
