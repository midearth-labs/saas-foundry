import { initTRPC } from '@trpc/server';
import { BaseContext } from './context';


export interface Meta {
    permission?: Record<string, string[]>;
  }
  

const trpc = initTRPC.context<BaseContext>().meta<Meta>().create();

// Base router and procedure helpers
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
