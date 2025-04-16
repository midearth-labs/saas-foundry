import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Base procedure that only checks organization-level permissions
export const orgProtectedProcedure = publicProcedure.use(async ({ ctx, next, meta }) => {
    const session = await ctx.in.getSessionOrThrow();
    const permission = meta?.permission;
    
    if (!session.session.activeOrganizationId) {
        throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'This operation requires an active organization context' 
        });
    }

    if (permission) {
        await ctx.in.checkOrgAuthorized(session, permission);  // Only check org-level permission
    } else {
        console.error("No permissions defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    
    return next({ ctx: { ...ctx, session } });
});

export type OrgProtectedContext = inferProcedureBuilderResolverOptions<typeof orgProtectedProcedure>['ctx']; 