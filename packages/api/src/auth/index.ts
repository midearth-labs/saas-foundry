import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as dotenv from "dotenv";
import { DB } from "../db";  // Global database instance (all caps to distinguish from any other db instance)
import { FastifyRequest } from "fastify";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { 
  sendVerificationEmailAdapter,
  sendOrganizationInvitationEmailAdapter,
} from "./email";
import { 
  admin, 
  bearer,
  openAPI,
  organization,
} from "better-auth/plugins";
import {
  roles,
} from "./roles";
import { 
  waitlistAccessControl
} from "./permissions";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// @TODO: Temp fix; refactor appropriately later
const isAdmin = async (email: string) => {
  return email.startsWith("admin_");
}

const requireEmailVerification = process.env.AUTH_PREFERENCE_EMAIL_VERIFICATION === "true";

// Type inference issue fixed as of BetterAuth 1.2.6-beta.7
const auth = betterAuth({
  database: drizzleAdapter(DB, {
    provider: "pg",
  }),
  plugins: [
    openAPI(), // @TODO: disable in production /api/auth/reference
    admin({
      // @TODO: Make this more generic for future access control needs
      ac: waitlistAccessControl,
      roles,
      adminRoles: ["admin", "adminRole"],
      defaultRole: "user",
    }),
    bearer(),
    organization({
      allowUserToCreateOrganization: async (user) => { return await isAdmin(user.email) },
      sendInvitationEmail: async (data) => { await sendOrganizationInvitationEmailAdapter(data) }  
    }),
  ],
  ...(requireEmailVerification ? {
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendVerificationEmailAdapter({
        email: user.email,
        token,
        url,
        subject: "Verify your email",
        text: `Click the link below to verify your email: ${url}`,
        request,
      });
      }
    }
  } : {}),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 10, // max requests in the window
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = await isAdmin(user.email) ? "adminRole" : "userRole";
          console.log("\nSetting role for user:", user.email, "to: ", role);
          // Add role data to user object before creation
          return { data: { ...user, role } };
        }
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
    autoSignIn: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "invalid-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "invalid-google-client-secret",
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export type AuthUserType = Session["user"];

export const getSession = async (req: FastifyRequest) => {
  return await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });
}

export const getAuthHandler = async () => {
  return toNodeHandler(auth);
}

export const listOrgs = async (token?: string) => {
  return await auth.api.listOrganizations({
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
}

export const checkPermission = async (session: Session, permission: Record<string, string[]>) => {
  const token = session.session.token;
  const userId = session.user.id;

  const userHasPermission = await auth.api.userHasPermission({
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    body: {
      userId,
      permission: permission,
    },
  });

  if (!userHasPermission) {
    throw new Error("Unable to verify permissions");
  }

  return (userHasPermission.success && !userHasPermission.error);
}

