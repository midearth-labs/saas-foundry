import { authenticatedProcedure } from "./authenticated";

export const todoBaseProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {

    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "feature": "todo" }) } });
});