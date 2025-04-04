import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";
import { DB } from "../db";
import { auth, Session } from "../auth";
import { FastifyRequest } from "fastify";
import { TRPCError } from "@trpc/server";


type InFunction<T> = () => T | undefined;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string>;
  getRequestId: InFunction<string>;
  getTenantId: InFunction<string>;
  getSessionOrThrow: InFunction<Promise<Session | null>>;
}

type OutContext = {
}

function extractLastHeaderValue(header: string | string[] | undefined): string | undefined {
  if (Array.isArray(header)) {
    return header.length > 0 ? header[header.length - 1] : undefined;
  }
  return header;
}

export const getServerSessionOrThrow = async (req: FastifyRequest): Promise<Session> => {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid session' });
  }
  return session;
};

export type BaseContext = {
  in: InContext,
  out: OutContext,
  extendedRequestId: string,
  logger: CreateFastifyContextOptions['req']['log'],
  repositories: Repositories,
}

export const getContextCreator = () => {
  // Create repositories with the database connection
  const repositories = createRepositories(DB);

  const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
    const extendedRequestId = crypto.randomUUID();
    res.header('extended-request-id', extendedRequestId);

    return {
      in: {
        getAuthorizationToken: () => req.headers['authorization'],
        getRequestId: () => extractLastHeaderValue(req.headers['x-request-id']),
        getTenantId: () => extractLastHeaderValue(req.headers['x-tenant-id']),
        getSessionOrThrow: () => getServerSessionOrThrow(req),
      },
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}
