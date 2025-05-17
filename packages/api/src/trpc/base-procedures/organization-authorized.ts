import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { authorizedProcedure } from "./authorized-procedure";

// Authorized procedure that only checks organization-level permissions
// TODO this is to be inspected and reimplemented as organizational permissions are dynamic
// also check implementation of checkOrgPermission
export const organizationAuthorizedProcedure = authorizedProcedure.use(async ({ ctx, next, meta }) => {
    // const session = await ctx.auth.checkValidSession();
    const permission = meta?.permission;

    if (permission) {
        let perm = await ctx.auth.checkOrgAuthorized(permission);  // Only check org-level permission
        console.log("Permission check result:", JSON.stringify(perm, null, 2));
    } else {
        console.error("No permissions defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    
    return next({ ctx: { ...ctx } });
});

export type OrganizationAuthorizedContext = inferProcedureBuilderResolverOptions<typeof organizationAuthorizedProcedure>['ctx']; 