import { TRPCError } from "@trpc/server";
import { AppContext } from "../app-context";
import { FastifyRequest } from "fastify";

export type Permission = Record<string, string[]>;
export type Subscription = Record<string, string>;

export const createRequestAuthProxy = (req: FastifyRequest, appContext: AppContext) => {
  const requestAuth = appContext.authEngine.getAuthForRequest(req);
  
  const checkValidSession = async () => {
    const isValidSession = await requestAuth.isValidSession();
    if (!isValidSession) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid session' });
    }
  };

  const validateSubscriptionOrThrow = async (subscription: Subscription) => {
    const validSubscription = await requestAuth.checkSubscription(subscription);
    if (!validSubscription) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have valid subscription to the service' });
    }
    return validSubscription;
  }

  const checkPermission = async (permission: Permission) => {
    const hasPermission = await requestAuth.checkUserPermission(permission);
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have required permissions' });
    }
  }

  const checkOrgAuthorized = async (permission: Permission) => {
    const hasPermission = await requestAuth.checkOrgPermission(permission);
    console.log("Permission check result:", JSON.stringify(hasPermission, null, 2));
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have required permissions' });
    }
  }

  return {
    checkValidSession,
    validateSubscriptionOrThrow,
    checkPermission,
    checkOrgAuthorized,
  }
}

export type RequestAuthProxy = ReturnType<typeof createRequestAuthProxy>;