import { publicProcedure } from "../trpc";
import { authenticatedProcedure } from "./authenticated";

export const waitlistAdminProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {

    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "feature": "waitlist", "segment": "admin" }) } });
});

export const waitlistPublicProcedure = publicProcedure.use(async ({ ctx, next }) => {
    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "feature": "waitlist", "segment": "public" }) } });
});