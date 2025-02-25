import { initTRPC } from '@trpc/server';
import { BaseContext } from './context';

const trpc = initTRPC.context<BaseContext>().meta<object>().create();

// Base router and procedure helpers
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
