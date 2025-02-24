import { Routes } from '../api/types/schema.configuration';
import {  voidSchema, todoIDSchema, createTodoSchema, updateTodoSchema, listTodosSchema, singleTodoSchema } from '../api/schema/todo.schema';
import { ZodFirstPartySchemaTypes } from 'zod';
import { InferredClientRoutes, InferredServiceRoutes } from '../api/types/schema.zod.configuration';

const AppRoutesConfiguration = {
  todo: {
    list: {
      schema: {
        input: voidSchema,
        output: listTodosSchema,
      },
      type: 'query',
    },
    getById: {  
      schema: {
        input: todoIDSchema,
        output: singleTodoSchema,
      },
      type: 'query',
    },
    create: {
      schema: {
        input: createTodoSchema,
        output: singleTodoSchema,
      },
      type: 'mutation',
    },
    delete: {
      schema: {
        input: todoIDSchema,
        output: voidSchema,
      },
      type: 'mutation',
    },
    update: {
      schema: {
        input: updateTodoSchema,
        output: singleTodoSchema,
      },
      type: 'mutation',
    }
  },
  getById2: {  
    schema: {
      input: todoIDSchema,
      output: singleTodoSchema,
    },
    type: 'query',
  },
} satisfies Routes<ZodFirstPartySchemaTypes>;

export type AppRouter = InferredClientRoutes<typeof AppRoutesConfiguration>

export type AppServiceRouter = InferredServiceRoutes<typeof AppRoutesConfiguration>
