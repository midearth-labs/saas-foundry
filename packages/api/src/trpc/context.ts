import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { BaseLogger } from "pino";
// import { DrizzleTodoRepository } from '../repositories/impl/todo.repository';
// import { DefaultTodoService } from '../services/impl/todo.service';

type InFunction<T> = () => T | undefined;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string>;
  getRequestId: InFunction<string>;
  getTenantId: InFunction<string>;
}

type OutContext = {
}

type Repository<User, Team, Admin, Public> = {
  user: (userId: string) => User;
  team: (teamId: string) => Team;
  admin: (adminId: string) => Admin;
  public: () => Public;
}

type ProviderContext = {
  repositories: {
    waitlist: Repository<object, object, object, object>;
  };
}

const repositories: ProviderContext['repositories'] = {
  waitlist: {
    user: (userId: string) => ({userId}),
    team: (teamId: string) => ({teamId}),
    admin: (adminId: string) => ({adminId}),
    public: () => ({}),
  },
};

function extractLastHeaderValue(header: string | string[] | undefined): string | undefined {
  if (Array.isArray(header)) {
    return header.length > 0 ? header[header.length - 1] : undefined;
  }
  return header;
}

export interface BaseContext {
  in: InContext,
  out: OutContext,
  extendedRequestId: string,
  logger: CreateFastifyContextOptions['req']['log'],
  repositories: ProviderContext['repositories']
}

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  // Initialize repositories and services
  // const todoRepository = new DrizzleTodoRepository();
  // const todoService = new DefaultTodoService(todoRepository);
  const extendedRequestId = crypto.randomUUID();
  res.header('extended-request-id', extendedRequestId);

  return {
    in: {
      getAuthorizationToken: () => req.headers['authorization'],
      getRequestId: () => extractLastHeaderValue(req.headers['x-request-id']),
      getTenantId: () => extractLastHeaderValue(req.headers['x-tenant-id']) ?? "no-tenant-id",
    },
    out: { },
    extendedRequestId,
    logger: req.log.child({ extendedRequestId }),
    repositories,
  } satisfies BaseContext;
};

