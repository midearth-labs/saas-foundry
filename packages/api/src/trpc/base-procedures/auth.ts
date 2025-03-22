import { publicProcedure } from '../trpc';
import { inferProcedureBuilderResolverOptions } from '@trpc/server';

export const authBaseProcedure = publicProcedure.use(async ({ ctx, next }) => {
    return next({ 
        ctx: { 
            ...ctx,
            logger: ctx.logger.child({ "feature": "auth" }) 
        } 
    });
});

export const authPublicProcedure = authBaseProcedure;

export type AuthContext = inferProcedureBuilderResolverOptions<typeof authBaseProcedure>['ctx']; 