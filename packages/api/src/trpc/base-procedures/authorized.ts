import { publicProcedure } from "../trpc";
import { inferProcedureBuilderResolverOptions, TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "./authenticated";

// Base-level authorization procedure that checks if the user is authorized
// There's currently no top-level authorization operation as of yet
// Like authenticated procedure, this is just a placeholder 
// for other authorization procedures to USE
export const authorizedProcedure = authenticatedProcedure.use(async ({ ctx, next, meta }) => {
    // TODO: Add top-level authorization operation(s)
    return next({ ctx: { ...ctx } });
});
export type AuthorizedContext = inferProcedureBuilderResolverOptions<typeof authorizedProcedure>['ctx'];