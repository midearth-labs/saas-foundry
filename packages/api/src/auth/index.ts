import { betterAuth, type BetterAuthOptions } from "better-auth";
import { 
  admin, 
  bearer,
  openAPI,
  organization,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as dotenv from "dotenv";
import { DB } from "../db";  // Global database instance (all caps to distinguish from any other db instance)
import { FastifyRequest } from "fastify";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import EmailServiceFactory from "./email/factories/email-service-factory";
import { roles as adminRoles } from "./admin/roles";
import { adminAccessControl } from "./admin/permissions";
import { roles as orgRoles, OrgRoleTypeKeys } from "./org/roles";
import { organizationAccessControl } from "./org/permissions";
import { stripe } from "@better-auth/stripe";
import { 
  plans, 
  stripeClient, 
  stripeWebhookSecret 
} from "./stripe";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// @TODO: Temp fix; refactor appropriately later
export const isAdmin = async (email: string) => {
  return email.startsWith("admin_");
}

const requireEmailVerification = process.env.AUTH_PREFERENCE_EMAIL_VERIFICATION === "true";
const requireStripeUserRegistration = process.env.STRIPE_PREFERENCE_USER_REGISTRATION === "true";

export const auth = betterAuth({
  trustedOrigins: [process.env.API_ORIGIN || "http://localhost:3005", "/\\"],
  database: drizzleAdapter(DB, {
    provider: "pg",
  }),
  plugins: [
    stripe({
      subscription: {
        enabled: true,
        plans,
      },
      stripeClient,
      stripeWebhookSecret,
      createCustomerOnSignUp: requireStripeUserRegistration ? true : false,
      onCustomerCreate: async ({ customer, stripeCustomer, user }, request) => {
        // Do something with the newly created customer
        console.log(`Stripe plug-in: Customer ${customer.id}::${stripeCustomer.id} created for user ${user.name}`);
      },
    }),
    openAPI(), // @TODO: disable in production /api/auth/reference
    admin({
      // @TODO: Make this more generic for future access control needs
      ac: adminAccessControl,
      roles: adminRoles,
      adminRoles: ["admin", "adminRole", "owner", "ownerRole"],
      defaultRole: "user",
    }),
    bearer(),
    organization({
      allowUserToCreateOrganization: async (user) => { return await isAdmin(user.email) },
      sendInvitationEmail: async (data) => { 
        await EmailServiceFactory.createOrganizationInvitationEmailService().sendOrganizationInvitationEmailAdapter(data) 
      },
      ac: organizationAccessControl,
      roles: orgRoles,
      adminRoles: ["owner", "ownerRole", "admin", "adminRole"],
      defaultRole: "member",
    }),
  ],
  account: {
    accountLinking: {
      enabled: true,
      // trustedProviders: ["google"],  // Will autolink the user's account if one existed prior with same email
      // allowDifferentEmails: true,  // Linking of accounts with different email addresses (should be used with extra security verification steps)
    },
  },
  ...(requireEmailVerification ? {
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }) => {
        await EmailServiceFactory.createVerificationEmailService().sendVerificationEmailAdapter({user, url, token});
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

export const listActiveSubscriptions = async (token: string) => {
  return await auth.api.listActiveSubscriptions({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const checkSubscription = async (token: string, subscription: Record<string, string>) => {
  const plan = Object.keys(subscription)[0] as keyof typeof subscription;
  const status = subscription[plan];
  const subscriptions = await listActiveSubscriptions(token);
  const validSubscription = subscriptions.find(s => s.status === status && s.plan === plan);
  if (!validSubscription) {
    throw new Error("Subscription not found");
  }
  return validSubscription ? true : false;
}

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

export const listOrgs = async (token: string) => {
  return await auth.api.listOrganizations({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const listOrgsWithoutAuth = async () => {
  return await auth.api.listOrganizations();
}

/**Checks top-level workspace user permissions via BetterAuth Admin API */
export const checkUserPermission = async (session: Session, permission: Record<string, string[]>) => {
  const token = session.session.token;
  const userId = session.user.id;

  // Silly naming from BetterAuth; auth.api.userHasPermission is used for admin permissions
  // While auth.api.hasPermission is used for org permissions
  // Very easy to mix them up
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

/** Checks org-level user permissions via BetterAuth Org API */
export const checkOrgPermission = async (session: Session, permission: Record<string, string[]>) => {
  const token = session.session.token;
  const resource = Object.keys(permission)[0] as keyof typeof permission;
  const actions = permission[resource];

  const userHasPermission = await auth.api.hasPermission({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: {
      permission: { [resource]: actions },
    },
  });

  if (!userHasPermission) {
    throw new Error("Unable to verify organization permissions");
  }

  return (userHasPermission.success && !userHasPermission.error);
}

export const createOrg = async (token: string, name: string, slug: string) => {
  return await auth.api.createOrganization({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: { name, slug },
  });
}

export const addOrgMember = async (token: string, userId: string, organizationId: string, roles: OrgRoleTypeKeys | OrgRoleTypeKeys[]) => {
  return await auth.api.addMember({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: {
      userId,
      organizationId,
      role: Array.isArray(roles) ? roles : [roles]
    }
  });
}

export const verifyEmail = async (token: string, userId: string) => {
  return await auth.api.verifyEmail({
    query: { token },
  });
}
