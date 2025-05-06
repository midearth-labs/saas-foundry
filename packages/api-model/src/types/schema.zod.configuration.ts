import { z, ZodFirstPartySchemaTypes } from 'zod';
import { ConvertRoutesToClientRouter, Routes, Operation, ConvertRoutesToCreateRouterOptions } from './schema.configuration';

export type ZodOperation = Operation<ZodFirstPartySchemaTypes>;
export type ZodRoutes = Routes<ZodFirstPartySchemaTypes>;

export type ConvertRoutesToType<T extends ZodRoutes> = {
  [K in keyof T]: T[K] extends ZodOperation
    ? {
      input: z.infer<T[K]['input']>,
      output: z.infer<T[K]['output']>,
      type: T[K]['type']
    }
    : T[K] extends ZodRoutes
      ? ConvertRoutesToType<T[K]>
      : never;
};

export type InferredServiceRoutes<AppRoutesType extends ZodRoutes> = 
  ConvertRoutesToCreateRouterOptions<ConvertRoutesToType<AppRoutesType>>

export type InferredClientRoutes<AppRoutesType extends ZodRoutes> = ConvertRoutesToClientRouter<ConvertRoutesToType<AppRoutesType>>;
