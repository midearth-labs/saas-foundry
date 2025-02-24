import { DecorateCreateRouterOptions, QueryProcedure, MutationProcedure, SubscriptionProcedure, Router, DefaultErrorShape, ProcedureType } from '@trpc/server/unstable-core-do-not-import';

export type Operation<SchemaType> = {
  input: SchemaType;
  output: SchemaType;
  type: ProcedureType;
}

export type Routes<SchemaType> = {
  [key: string]: Operation<SchemaType> | Routes<SchemaType>;
}

export type ConvertOperationToProcedure<TOperation extends Operation<any>> = 
  TOperation['type'] extends 'query'
    ? QueryProcedure<{input: TOperation['input'], output: TOperation['output']}>
    : TOperation['type'] extends 'mutation'
      ? MutationProcedure<{input: TOperation['input'], output: TOperation['output']}>
      : TOperation['type'] extends 'subscription'
        ? SubscriptionProcedure<{input: TOperation['input'], output: TOperation['output']}>
        : never;

export type ConvertRoutesToCreateRouterOptions<TRoutes extends Routes<any>> = {
  [K in keyof TRoutes]: TRoutes[K] extends infer $Value 
    ? $Value extends Operation<any>
      ? ConvertOperationToProcedure<$Value>
      : $Value extends Routes<any>
        ? ConvertRoutesToCreateRouterOptions<$Value>
        : never
    : never;
}

export type ConvertRoutesToClientRouter<TRoutes extends Routes<any>> = Router<{
  ctx: {};
  meta: {};
  errorShape: DefaultErrorShape;
  transformer: false;
}, DecorateCreateRouterOptions<ConvertRoutesToCreateRouterOptions<TRoutes>>>
