import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc";
import { protectedProcedure } from "./protected";
import { organizationAuthorizedProcedure } from "./organization-authorized";
import { subscriptionProtectedProcedure } from "./subscription-protected";
import { adminProtectedProcedure } from "./admin-protected";

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

// Create a separate organizationally-authorized procedure with waitlist context
export const waitlistOrgAuthorizedProcedure = organizationAuthorizedProcedure.use(async ({ ctx, next }) => {
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
            logger: ctx.logger.child({ "segment": "org-authorized" }) 
        } 
    });
});

// Create a separate subscription protected procedure with waitlist context
export const waitlistSubscriptionProtectedProcedure = subscriptionProtectedProcedure.use(async ({ ctx, next }) => {
    // Extract out the needed repositories from ctx
    const { repositories, ...rest } = ctx;
    const waitlistContext = {
        definitionRepository: repositories.waitlist.definition,
        entryRepository: repositories.waitlist.entry,
    }
    return next({ ctx: { ...rest, waitlistContext, logger: ctx.logger.child({ "segment": "subscription-protected" }) } });
});

// Now chain the admin procedure to the adminProtectedProcedure
export const waitlistAdminProcedure = adminProtectedProcedure.use(async ({ ctx, next }) => {
    const { repositories, ...rest } = ctx;
    const waitlistContext = {
        definitionRepository: repositories.waitlist.definition,
        entryRepository: repositories.waitlist.entry,
    }

    return next({ 
        ctx: { 
            ...rest, 
            waitlistContext, 
            logger: ctx.logger.child({ "segment": "admin-protected" }) 
        } 
    });
});

// Chain the analysis procedure to the waitlistOrgProtectedProcedure instead
export const waitlistAnalysisProcedure = waitlistOrgAuthorizedProcedure.use(async ({ ctx, next }) => {
    return next({ 
        ctx: { 
            ...ctx, 
            logger: ctx.logger.child({ "segment": "analysis" }) 
        } 
    });
});

export const waitlistPublicProcedure = waitListBaseProcedure.use(async ({ ctx, next }) => {
    return next({ ctx: { ...ctx, logger: ctx.logger.child({ "segment": "public" }) } });
});


export type WaitlistAdminContext = inferProcedureBuilderResolverOptions<typeof waitlistAdminProcedure>['ctx'];
export type WaitlistAnalysisContext = inferProcedureBuilderResolverOptions<typeof waitlistAnalysisProcedure>['ctx'];
export type WaitlistSubscriptionProtectedContext = inferProcedureBuilderResolverOptions<typeof waitlistSubscriptionProtectedProcedure>['ctx'];
export type WaitlistPublicContext = inferProcedureBuilderResolverOptions<typeof waitlistPublicProcedure>['ctx'];
