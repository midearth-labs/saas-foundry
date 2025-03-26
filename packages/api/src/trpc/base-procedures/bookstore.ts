import { publicProcedure } from '../trpc';
import { inferProcedureBuilderResolverOptions } from '@trpc/server';
import { TRPCError } from "@trpc/server";
import { auth } from '../../auth';

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

// Making creation of certain bookstore methods protected by requiring valid JWT authentication
export const bookstoreProtectedProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  const jwt = ctx.in.getBetterAuthJWT();
  const bearerToken = ctx.in.getBetterAuthBearerToken();

  console.log("jwt", jwt);
  console.log("bearerToken", bearerToken);

  // Token existence check
  if (!jwt) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated with JWT)' });
  }
  if (!bearerToken) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated with Bearer Token)' });
  }

  // Token validation
  const session = await auth.api.getSession({
    headers: ctx.req.headers as unknown as Headers
  });
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid session from auth.api.getSession call' });
  }

  return next({ 
    ctx: { 
      ...ctx, 
      logger: ctx.logger.child({ 
        "segment": "protected", 
        jwt,
        bearerToken,
      }) 
    } 
  });
});

// Admin procedure now uses protected procedure
export const bookstoreAdminProcedure = bookstoreProtectedProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "admin" }) } });
});

export const bookstorePublicProcedure = bookstoreBaseProcedure.use(async ({ ctx, next }) => {
  return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});

export type BookstoreAdminContext = inferProcedureBuilderResolverOptions<typeof bookstoreAdminProcedure>['ctx'];
export type BookstorePublicContext = inferProcedureBuilderResolverOptions<typeof bookstorePublicProcedure>['ctx']; 
export type BookstoreProtectedContext = inferProcedureBuilderResolverOptions<typeof bookstoreProtectedProcedure>['ctx'];
