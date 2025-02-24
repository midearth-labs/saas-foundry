import { z, ZodFirstPartySchemaTypes } from 'zod';
import { ConvertRoutesToClientRouter, Routes, Operation, ConvertRoutesToCreateRouterOptions } from './schema.configuration';

export type ConvertRoutesToType<T extends Routes<ZodFirstPartySchemaTypes>> = {
  [K in keyof T]: T[K] extends Operation<ZodFirstPartySchemaTypes>
    ? {
      input: z.infer<T[K]['input']>,
      output: z.infer<T[K]['output']>,
      type: T[K]['type']
    }
    : T[K] extends Routes<ZodFirstPartySchemaTypes>
      ? ConvertRoutesToType<T[K]>
      : never;
};

export type InferredServiceRoutes<AppRoutesType extends Routes<ZodFirstPartySchemaTypes>> = 
  ConvertRoutesToCreateRouterOptions<ConvertRoutesToType<AppRoutesType>>

export type InferredClientRoutes<AppRoutesType extends Routes<ZodFirstPartySchemaTypes>> = ConvertRoutesToClientRouter<ConvertRoutesToType<AppRoutesType>>;
