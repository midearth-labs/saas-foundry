import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";

// Convert this to a middleware for reuse
// Maybe use type for ctx T that extends the base context
export const authenticatedProcedure = publicProcedure.use(async ({ ctx, next }) => {
   await ctx.auth.checkValidSession();
   return next({ ctx: { ...ctx } });
});
export type AuthenticatedContext = inferProcedureBuilderResolverOptions<typeof authenticatedProcedure>['ctx'];