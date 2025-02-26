import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { BaseLogger } from "pino";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";

type InFunction<T> = () => T | undefined;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string>;
  getRequestId: InFunction<string>;
  getTenantId: InFunction<string>;
}

type OutContext = {
}

function extractLastHeaderValue(header: string | string[] | undefined): string | undefined {
  if (Array.isArray(header)) {
    return header.length > 0 ? header[header.length - 1] : undefined;
  }
  return header;
}

export type BaseContext = {
  in: InContext,
  out: OutContext,
  extendedRequestId: string,
  logger: CreateFastifyContextOptions['req']['log'],
  repositories: Repositories
}

export const getContextCreator = () => {
  // createContext will be called per request.
  // Add any objects that need to be created once outside here. 
  const repositories = createRepositories();

  const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
    const extendedRequestId = crypto.randomUUID();
    res.header('extended-request-id', extendedRequestId);

    return {
      in: {
        getAuthorizationToken: () => req.headers['authorization'],
        getRequestId: () => extractLastHeaderValue(req.headers['x-request-id']),
        getTenantId: () => extractLastHeaderValue(req.headers['x-tenant-id']),
      },
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}
