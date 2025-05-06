import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "./authenticated";


// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
/**
 * This base-level authorization procedure checks if the user is authorized
 * to access the specific resource (and corresponding permission) defined in the procedure metadata.
 * It checks the personal workspace layer permission via BetterAuth Admin API.
 */
export const authorizedProcedure = authenticatedProcedure.use(async ({ ctx, next, meta }) => {
    const permission = meta?.permission;
    if (permission) {
        await ctx.auth.checkPermission(permission);
    } else {
        console.error("No permissions defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    return next({ ctx: { ...ctx } });
});
export type AuthorizedContext = inferProcedureBuilderResolverOptions<typeof authorizedProcedure>['ctx'];