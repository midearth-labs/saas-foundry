import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Repositories } from "./repositories";
import { createRepositories } from "./repositories.impl";
import { DB } from "../db";
import { checkUserPermission, checkOrgPermission, checkSubscription, Session, isAdmin } from "../auth";
import { getSession } from "../auth";
import { FastifyRequest } from "fastify";
import { TRPCError } from "@trpc/server";


type InFunction<T> = () => T;
type OutFunction<T> = (value: T | undefined) => void;

type InContext = {
  getAuthorizationToken: InFunction<string | undefined>;
  getRequestId: InFunction<string | undefined>;
  getSessionOrThrow: InFunction<Promise<Session>>;
  getAdminStatus: InFunction<Promise<boolean>>;
  checkPermission: (session: Session, permission: Record<string, string[]>) => Promise<void>;
  checkOrgAuthorized: (session: Session, permission: Record<string, string[]>) => Promise<void>;
  validateSubscriptionOrThrow: (session: Session, subscription: Record<string, string>) => Promise<boolean>;
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

export const validateSubscriptionOrThrow: InContext["validateSubscriptionOrThrow"] = async (session, subscription) => {
  const validSubscription = await checkSubscription(session?.session?.token, subscription);
  if (!validSubscription) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have valid subscription to the service' });
  }
  return validSubscription;
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
        getSessionOrThrow: () => getServerSessionOrThrow(req),
        getAdminStatus: () => getAdminStatusFromRequest(req),
        checkPermission,
        checkOrgAuthorized,
        validateSubscriptionOrThrow,
      },
      out: { },
      extendedRequestId,
      logger: req.log.child({ extendedRequestId }),
      repositories,
    } satisfies BaseContext;
  };

  return createContext;
}

const getAdminStatusFromRequest = async (req: FastifyRequest) => {
  const session = await getServerSessionOrThrow(req);
  const result = await isAdmin(String(session?.user.email));
  return result;
}

const checkPermission: InContext["checkPermission"] = async (session, permission) => {
  const hasPermission = await checkUserPermission(session, permission);
  if (!hasPermission) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have required permissions' });
  }
}

const checkOrgAuthorized: InContext["checkOrgAuthorized"] = async (session, permission) => {
  const hasPermission = await checkOrgPermission(session, permission);
  if (!hasPermission) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have required permissions' });
  }
}