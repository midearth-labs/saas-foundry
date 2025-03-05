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

export const bookstoreAdminProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "admin" }) } });
});

export const bookstorePublicProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});

export type BookstoreAdminContext = inferProcedureBuilderResolverOptions<typeof bookstoreAdminProcedure>['ctx'];
export type BookstorePublicContext = inferProcedureBuilderResolverOptions<typeof bookstorePublicProcedure>['ctx']; 