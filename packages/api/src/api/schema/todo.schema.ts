import { z, ZodFirstPartySchemaTypes } from 'zod';
import { Routes } from '../types/schema.configuration';
import { InferredServiceRoutes } from '../types/schema.zod.configuration';

const todoIDSchema = z.number();
const voidSchema = z.void();
const createTodoSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).nullable()
  });
const todoSchema = z.object({
    id: z.number(),
    title: z.string().min(1).max(255),
    description: z.string().max(1000).nullable(),
    completed: z.boolean(),
    tenantId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});
const listTodosSchema = z.array(todoSchema);
const singleTodoSchema = todoSchema;
  
  
const updateTodoSchema =  z.object({
    id: z.number(),
    data: z.object({
        title: z.string().min(1).max(255).nullable(),
        description: z.string().max(1000).nullable(),
        completed: z.boolean().nullable()
    })
});

export const TodoRoutesConfiguration = {
    list: {
        input: voidSchema,
        output: listTodosSchema,
        type: 'query',
    },
    getById: {  
        input: todoIDSchema,
        output: singleTodoSchema,
        type: 'query',
    },
    create: {
        input: createTodoSchema,
        output: singleTodoSchema,
        type: 'mutation',
    },
    delete: {
        input: todoIDSchema,
        output: voidSchema,
        type: 'mutation',
    },
    update: {
        input: updateTodoSchema,
        output: singleTodoSchema,
        type: 'mutation',
    }
  } satisfies Routes<ZodFirstPartySchemaTypes>;


export type TodoServiceRouter = InferredServiceRoutes<typeof TodoRoutesConfiguration>
