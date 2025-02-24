import { initTRPC } from '@trpc/server';
import { Context } from './context';

const trpc = initTRPC.context<Context>().meta<object>().create();

// Base router and procedure helpers
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
