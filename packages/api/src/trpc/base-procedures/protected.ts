import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "./authenticated";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const protectedProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {
    // Currently does not define a base or top level protected operation(s)
    // This is just a placeholder to ensure derivative protected procedures USE this for semantic consistency
    return next({ ctx: { ...ctx } });
});
export type ProtectedContext = inferProcedureBuilderResolverOptions<typeof protectedProcedure>['ctx'];