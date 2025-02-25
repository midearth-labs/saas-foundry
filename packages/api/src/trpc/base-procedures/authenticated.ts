import { publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authenticatedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const tenantId = ctx.in.getTenantId();
    if (!tenantId) {
        //Should be handled by the error handling middleware and this should be a domain error
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated'
        });
    }
    return next({ ctx: { ...ctx, tenantId, logger: ctx.logger.child({ tenantId }) } });
});
