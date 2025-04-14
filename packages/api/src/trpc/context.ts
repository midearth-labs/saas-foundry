import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";
import { DB } from "../db";
import { canCreateWaitlistDefinitions, Session } from "../auth";
import { getSession } from "../auth";
import { FastifyRequest } from "fastify";
import { TRPCError } from "@trpc/server";


type InFunction<T> = () => T | undefined;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string>;
  getRequestId: InFunction<string>;
  getTenantId: InFunction<string>;
  getSessionOrThrow: InFunction<Promise<Session | null>>;
  canCreateWaitDefsOrThrow: InFunction<Promise<boolean>>;
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

export const canCreateWaitlistDefinitionsOrThrow = async (req: FastifyRequest): Promise<boolean> => {
  const session = await getServerSessionOrThrow(req);
  const permissions = await canCreateWaitlistDefinitions(session.user.id, session.session.token);
  if (!permissions) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unable to verify permissions' });
  }
  const result = (permissions.success && !permissions.error);
  console.log("\nUser ", session.user.email, " can create waitlist definitions result:", result);
  return result;
}

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
        canCreateWaitDefsOrThrow: () => canCreateWaitlistDefinitionsOrThrow(req),
      },
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}
