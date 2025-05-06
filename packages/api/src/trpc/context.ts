import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";
import { AppContext } from "../app-context";
import { createRequestAuthProxy, RequestAuthProxy } from "./auth-context";

type InFunction<T> = () => T;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string | undefined>;
  getRequestId: InFunction<string | undefined>;
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
  auth: RequestAuthProxy;
  extendedRequestId: string,
  logger: CreateFastifyContextOptions['req']['log'],
  repositories: Repositories,
}

export const getContextCreator = (appContext: AppContext) => {
  // Create repositories with the database connection
  const repositories = createRepositories(appContext.coreDB);

  const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
    const extendedRequestId = crypto.randomUUID();
    res.header('extended-request-id', extendedRequestId);

    return {
      in: {
        getAuthorizationToken: () => req.headers['authorization'],
        getRequestId: () => extractLastHeaderValue(req.headers['x-request-id']),
      },
      auth: createRequestAuthProxy(req, appContext),
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}