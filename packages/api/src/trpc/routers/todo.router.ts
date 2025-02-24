import { publicProcedure } from '../trpc';
import { TodoServiceRouter, TodoRoutesConfiguration } from '../../api/schema/todo.schema';

export const todoRouter = {
  list: publicProcedure
    .input(TodoRoutesConfiguration['list']['input'])
    .query(({ ctx }) => {
      return [{ id: 1, title: 'Test: ' + ctx.tenantId, description: 'Test', completed: false, tenantId: ctx.tenantId, createdAt: new Date(), updatedAt: new Date() }]
    }),

  getById: publicProcedure
    .input(TodoRoutesConfiguration['getById']['input'])
    .query(({ ctx, input }) => {
      return { id: input, title: 'Test: ' + ctx.tenantId, description: 'Test', completed: false, tenantId: ctx.tenantId, createdAt: new Date(), updatedAt: new Date() }
    }),

  create: publicProcedure
    .input(TodoRoutesConfiguration['create']['input'])
    .mutation(({ ctx, input }) => {
      return { id: 1, title: input.title + ' : ' + ctx.tenantId, description: input.description, completed: false, tenantId: ctx.tenantId, createdAt: new Date(), updatedAt: new Date() }
    }),

  update: publicProcedure
    .input(TodoRoutesConfiguration['update']['input'])
    .mutation(({ ctx, input }) => {
      return { id: input.id, title: input.data.title + ' : ' + ctx.tenantId, description: input.data.description, completed: false, tenantId: ctx.tenantId, createdAt: new Date(), updatedAt: new Date() }
    }),

  delete: publicProcedure
    .input(TodoRoutesConfiguration['delete']['input'])
    .mutation(({ ctx, input }) => {
      console.log('delete', input, ctx.tenantId);
      return;
    })
} satisfies TodoServiceRouter;
