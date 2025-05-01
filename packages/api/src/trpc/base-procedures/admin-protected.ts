import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { protectedProcedure } from "./protected";

// This protected procedure checks if the user is an admin.
export const adminProtectedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    const isAdmin = await ctx.in.getAdminStatus();
    if (!isAdmin) {  
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not an admin' });
    }
    return next({ ctx: { ...ctx } });
});
export type AdminProtectedContext = inferProcedureBuilderResolverOptions<typeof adminProtectedProcedure>['ctx'];