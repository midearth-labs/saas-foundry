import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Base procedure that validates subscriptions
export const subscriptionValidationProcedure = publicProcedure.use(async ({ ctx, next, meta }) => {
    const session = await ctx.in.getSessionOrThrow();
    const subscription = meta?.subscription;

    if (subscription) {
        await ctx.in.validateSubscriptionOrThrow(session, subscription);  // Validate the subscription
    } else {
        console.error("No subscription defined in meta for operation");
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
    
    return next({ ctx: { ...ctx, session } });
});

export type SubscriptionValidationContext = inferProcedureBuilderResolverOptions<typeof subscriptionValidationProcedure>['ctx']; 