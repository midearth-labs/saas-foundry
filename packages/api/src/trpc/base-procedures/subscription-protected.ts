import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { authorizedProcedure } from "./authorized-procedure";

// Protected procedure that validates subscriptions
export const subscriptionProtectedProcedure = authorizedProcedure.use(async ({ ctx, next, meta }) => {
    const subscription = meta?.subscription;

    if (subscription) {
        await ctx.auth.validateSubscriptionOrThrow(subscription);  // Validate the subscription
    } else {
        console.error("No subscription defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    
    return next({ ctx: { ...ctx } });
});

export type SubscriptionProtectedContext = inferProcedureBuilderResolverOptions<typeof subscriptionProtectedProcedure>['ctx']; 