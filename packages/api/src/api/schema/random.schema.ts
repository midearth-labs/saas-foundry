import { ZodFirstPartySchemaTypes } from 'zod';
import { Routes } from '../types/schema.configuration';
import { InferredServiceRoutes } from '../types/schema.zod.configuration';
import { TodoRoutesConfiguration } from './todo.schema';

export const RandomRoutesConfiguration = {
  getById2: TodoRoutesConfiguration.getById
} satisfies Routes<ZodFirstPartySchemaTypes>;

export type RandomServiceRouter = InferredServiceRoutes<typeof RandomRoutesConfiguration>
