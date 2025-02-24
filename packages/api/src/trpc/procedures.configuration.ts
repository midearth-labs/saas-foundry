import { DecorateCreateRouterOptions, QueryProcedure, MutationProcedure, SubscriptionProcedure, Router, DefaultErrorShape, ProcedureType } from '@trpc/server/unstable-core-do-not-import';

export interface Operation {
  schema: {
    input: unknown;
    output: unknown;
  };
  type: ProcedureType;
}

export interface Routes {
  [key: string]: Operation | Routes;
}

export type ConvertOperationToProcedure<TOperation extends Operation> = 
  TOperation['type'] extends 'query'
    ? QueryProcedure<TOperation['schema']>
    : TOperation['type'] extends 'mutation'
      ? MutationProcedure<TOperation['schema']>
      : TOperation['type'] extends 'subscription'
        ? SubscriptionProcedure<TOperation['schema']>
        : never;

export type ConvertRoutesToCreateRouterOptions<TRoutes extends Routes> = {
  [K in keyof TRoutes]: TRoutes[K] extends infer $Value 
    ? $Value extends Operation
      ? ConvertOperationToProcedure<$Value>
      : $Value extends Routes
        ? ConvertRoutesToCreateRouterOptions<$Value>
        : never
    : never;
}

export type ConvertRoutesToClientRouter<TRoutes extends Routes> = Router<{
  ctx: {};
  meta: {};
  errorShape: DefaultErrorShape;
  transformer: false;
}, DecorateCreateRouterOptions<ConvertRoutesToCreateRouterOptions<TRoutes>>>
