import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const session = await ctx.in.getSessionOrThrow();
    return next({ ctx: { ...ctx, session, logger: ctx.logger.child({ session }) } });
});
export type ProtectedContext = inferProcedureBuilderResolverOptions<typeof protectedProcedure>['ctx'];