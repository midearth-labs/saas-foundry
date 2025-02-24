import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
// import { DrizzleTodoRepository } from '../repositories/impl/todo.repository';
// import { DefaultTodoService } from '../services/impl/todo.service';

export interface Context {
  tenantId: string;
}

export const createContext = async ({ req }: CreateFastifyContextOptions) => {
  // Here you would normally get the tenant from the request
  // This could be from a header, JWT token, or other authentication mechanism
  const tenantId = (req.headers['x-tenant-id'] ?? "no-tenant-id") as string;

  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  // Initialize repositories and services
  // const todoRepository = new DrizzleTodoRepository();
  // const todoService = new DefaultTodoService(todoRepository);

  return {
    tenantId
  };
};

