import { publicProcedure } from '../trpc';
import { inferProcedureBuilderResolverOptions } from '@trpc/server';


export const bookstoreBaseProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const { repositories, ...rest } = ctx;
  const bookstoreContext = {
    bookRepository: repositories.bookstore.book,
    orderRepository: repositories.bookstore.order,
  };
  
  return next({ 
    ctx: { 
      ...rest, 
      bookstoreContext, 
      logger: ctx.logger.child({ "feature": "bookstore" }) 
    } 
  });
});

// Book creation now authenticates users by validating the session token
export const bookstoreProtectedProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.in.getSessionOrThrow();
  console.info("Session: ", JSON.stringify(session?.session, null, 2));
  return next({ ctx: { 
      ...ctx, logger: ctx.logger.child({ "segment": "protected", "session": session?.session }) 
    } });
});

// Admin procedure now uses protected procedure
// @TODO: Add admin role check
export const bookstoreAdminProcedure = bookstoreProtectedProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "admin" }) } });
});

export const bookstorePublicProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});

export type BookstoreAdminContext = inferProcedureBuilderResolverOptions<typeof bookstoreAdminProcedure>['ctx'];
export type BookstorePublicContext = inferProcedureBuilderResolverOptions<typeof bookstorePublicProcedure>['ctx']; 
export type BookstoreProtectedContext = inferProcedureBuilderResolverOptions<typeof bookstoreProtectedProcedure>['ctx'];
