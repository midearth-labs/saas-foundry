import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const protectedProcedure = publicProcedure.use(async ({ ctx, next, meta }) => {
    const session = await ctx.in.getSessionOrThrow();
    const permission = meta?.permission;
    if (permission) {
        await ctx.in.checkAuthorized(session, permission);
    } else {
        console.error("No permissions defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    return next({ ctx: { ...ctx, session } });
});
export type ProtectedContext = inferProcedureBuilderResolverOptions<typeof protectedProcedure>['ctx'];