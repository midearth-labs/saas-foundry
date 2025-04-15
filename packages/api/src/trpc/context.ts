import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";
import { DB } from "../db";
import { checkPermission, Session } from "../auth";
import { getSession } from "../auth";
import { FastifyRequest } from "fastify";
import { TRPCError } from "@trpc/server";


type InFunction<T> = () => T;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string | undefined>;
  getRequestId: InFunction<string | undefined>;
  getSessionOrThrow: InFunction<Promise<Session>>;
  checkAuthorized: (session: Session, permission: Record<string, string[]>) => Promise<void>;
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
  const session = await getSession(req);
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
        getSessionOrThrow: () => getServerSessionOrThrow(req),
        checkAuthorized,
      },
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}


const checkAuthorized: InContext["checkAuthorized"] = async (session, permission) => {
  const hasPermission = await checkPermission(session, permission);
  if (!hasPermission) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have required permissions' });
  }
}
