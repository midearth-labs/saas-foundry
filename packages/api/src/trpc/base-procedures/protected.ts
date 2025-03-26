import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const jwt = ctx.in.getBetterAuthJWT();
    if (!jwt) {
        // Should be handled by the error handling middleware and this should be a domain error
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated'
        });
    }
    return next({ ctx: { ...ctx, jwt, logger: ctx.logger.child({ jwt }) } });
});
export type ProtectedContext = inferProcedureBuilderResolverOptions<typeof protectedProcedure>['ctx'];