import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc";
import { protectedProcedure } from "./protected";

const waitListBaseProcedure = publicProcedure.use(async ({ ctx, next }) => {
    // Extract out the needed repositories from ctx
    const { repositories, ...rest } = ctx;
    const waitlistContext = {
        definitionRepository: repositories.waitlist.definition,
        entryRepository: repositories.waitlist.entry,
    }

    return next({ ctx: { ...rest, waitlistContext, logger: ctx.logger.child({ "feature": "waitlist" }) } });
});

// Create a separate protected procedure with waitlist context
export const waitlistProtectedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    // Extract out the needed repositories from ctx
    const { repositories, ...rest } = ctx;
    const waitlistContext = {
        definitionRepository: repositories.waitlist.definition,
        entryRepository: repositories.waitlist.entry,
    }

    return next({ 
        ctx: { 
            ...rest, 
            waitlistContext, 
            logger: ctx.logger.child({ "segment": "protected" }) 
        } 
    });
});

// Now chain the admin procedure to the waitlistProtectedProcedure
export const waitlistAdminProcedure = waitlistProtectedProcedure.use(async ({ ctx, next }) => {
    return next({ 
        ctx: { 
            ...ctx, 
            logger: ctx.logger.child({ "segment": "admin" }) 
        } 
    });
});

export type WaitlistAdminContext = inferProcedureBuilderResolverOptions<typeof waitlistAdminProcedure>['ctx'];

export const waitlistPublicProcedure = waitListBaseProcedure.use(async ({ ctx, next }) => {
    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});
export type WaitlistPublicContext = inferProcedureBuilderResolverOptions<typeof waitlistPublicProcedure>['ctx'];
