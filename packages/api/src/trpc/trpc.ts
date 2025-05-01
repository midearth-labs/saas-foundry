import { initTRPC } from '@trpc/server';
import { BaseContext } from './context';

/**
 * Global tRPC middleware metadata interceptor interface.
 * See https://trpc.io/docs/server/metadata for more information.
 */
export interface Meta {
    /**
     * Permissions are in the form of `resource: [action1, action2, ..., actionN]`.
     * For example, `report: [submit, edit, delete]` means that the user has submit, edit, and delete permissions for the report resource.
     * The resource names are defined by the application, and the actions are defined by the resource.
     */
    permission?: Record<string, string[]>;
    /**
     * Subscriptions are in the form of `subscription_plan: status`.
     * Take note that the plan names MUST match your payment/subscription platform plan names.
     * We recommend storing the actual names in a controled/secured environment variable.
     */
    subscription?: Record<string, string>;
  }
  

const trpc = initTRPC.context<BaseContext>().meta<Meta>().create();

// Base router and procedure helpers
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
