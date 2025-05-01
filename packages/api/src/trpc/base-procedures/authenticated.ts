import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const authenticatedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const session = await ctx.in.getSessionOrThrow();
   if (!session.session) {  
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not authenticated' });
    }
    return next({ ctx: { ...ctx, session } });
});
export type AuthenticatedContext = inferProcedureBuilderResolverOptions<typeof authenticatedProcedure>['ctx'];