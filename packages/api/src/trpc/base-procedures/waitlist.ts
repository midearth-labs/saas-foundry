import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc";
import { protectedProcedure } from "./protected";
import { orgProtectedProcedure } from "./org-protected";

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

// Create a separate org-protected procedure with waitlist context
export const waitlistOrgProtectedProcedure = orgProtectedProcedure.use(async ({ ctx, next }) => {
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
            logger: ctx.logger.child({ "segment": "org-protected" }) 
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

// Chain the analysis procedure to the waitlistOrgProtectedProcedure instead
export const waitlistAnalysisProcedure = waitlistOrgProtectedProcedure.use(async ({ ctx, next }) => {
    return next({ 
        ctx: { 
            ...ctx, 
            logger: ctx.logger.child({ "segment": "analysis" }) 
        } 
    });
});

export type WaitlistAdminContext = inferProcedureBuilderResolverOptions<typeof waitlistAdminProcedure>['ctx'];
export type WaitlistAnalysisContext = inferProcedureBuilderResolverOptions<typeof waitlistAnalysisProcedure>['ctx'];

export const waitlistPublicProcedure = waitListBaseProcedure.use(async ({ ctx, next }) => {
    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});
export type WaitlistPublicContext = inferProcedureBuilderResolverOptions<typeof waitlistPublicProcedure>['ctx'];
