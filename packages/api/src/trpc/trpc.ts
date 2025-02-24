import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().meta<{}>().create();

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

export const protectedProcedure = procedure;
