import { Routes } from '../types/schema.configuration';
import { ZodFirstPartySchemaTypes } from 'zod';
import { InferredClientRoutes, InferredServiceRoutes } from '../types/schema.zod.configuration';
import { TodoRoutesConfiguration } from './todo.schema';
import { RandomRoutesConfiguration } from './random.schema';

export const AppRoutesConfiguration = {
  todo: TodoRoutesConfiguration,
  ...RandomRoutesConfiguration,
} satisfies Routes<ZodFirstPartySchemaTypes>;

export type AppClientRouter = InferredClientRoutes<typeof AppRoutesConfiguration>

export type AppServiceRouter = InferredServiceRoutes<typeof AppRoutesConfiguration>
