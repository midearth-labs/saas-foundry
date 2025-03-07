import { InferredClientRoutes, InferredServiceRoutes, ZodRoutes } from '../types/schema.zod.configuration';
import { WaitlistRoutesConfiguration } from './waitlist';
import { BookstoreRoutesConfiguration } from './bookstore';

export const AppRoutesConfiguration = {
  waitlist: WaitlistRoutesConfiguration,
  bookstore: BookstoreRoutesConfiguration,
} satisfies ZodRoutes;

/*
export const AppRoutesConfiguration = {
  waitlist: WaitlistRoutesConfiguration,
  bookstore: {
    book: BookRoutesConfiguration,
    order: OrderRoutesConfiguration,
  },
} satisfies ZodRoutes;
*/

export type AppClientRouter = InferredClientRoutes<typeof AppRoutesConfiguration>
export type AppServiceRouter = InferredServiceRoutes<typeof AppRoutesConfiguration>
