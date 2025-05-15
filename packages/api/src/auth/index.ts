import { betterAuth, type BetterAuthOptions } from "better-auth";
import { 
  admin, 
  bearer,
  openAPI,
  organization,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { FastifyRequest } from "fastify";
import { toNodeHandler } from "better-auth/node";
import { EmailServiceFactory } from "./email/factories/email-service-factory";
import { roles as adminRoles } from "@saas-foundry/api-model/auth/admin/roles";
import { adminAccessControl } from "@saas-foundry/api-model/auth/admin/permissions";
import { roles as orgRoles, OrgRoleTypeKeys } from "@saas-foundry/api-model/auth/org/roles";
import { organizationAccessControl } from "@saas-foundry/api-model/auth/org/permissions";
import { stripe } from "@better-auth/stripe";
import { 
  plans, 
  stripeClient, 
  stripeWebhookSecret 
} from "./stripe";
import { AppContext } from "../app-context";

// @TODO: Temp fix; refactor appropriately later
const isAdmin = (email: string) => {
  return email.startsWith("admin_");
}


export const createAuthEngine = (db: AppContext["coreDB"]) => {
  const requireEmailVerification = process.env.AUTH_PREFERENCE_EMAIL_VERIFICATION === "true";
  const requireStripeUserRegistration = process.env.STRIPE_PREFERENCE_USER_REGISTRATION === "true";


  const addOrgMember = async (userId: string, organizationId: string, roles: OrgRoleTypeKeys | OrgRoleTypeKeys[], token: string) => {
    return await auth.api.addMember({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        userId,
        organizationId,
        role: Array.isArray(roles) ? roles : [roles]
      }
    });
  }


  const auth = betterAuth({
    trustedOrigins: [process.env.API_ORIGIN || "http://localhost:3005", "/\\"],
    database: drizzleAdapter(db, {
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
        allowUserToCreateOrganization: async (user) => { return isAdmin(user.email) },
        sendInvitationEmail: async (data) => { 
          await EmailServiceFactory.createOrganizationInvitationEmailService().sendOrganizationInvitationEmailAdapter(data) 
        },
        ac: organizationAccessControl,
        roles: orgRoles,
        adminRoles: ["owner", "ownerRole", "admin", "adminRole"],
        defaultRole: "member",
        organizationCreation: {
          afterCreate: async ({ organization, member, user }, request) => {
              // Run custom logic after organization is created
              // e.g., create default resources, send notifications
              if (user.email.startsWith("admin_creator_owner_")) {
                const metadata = JSON.parse(request?.headers.get("Metadata") || "{}");
                
                const token = (await auth.api.getSession({
                  headers: request?.headers as unknown as Headers,
                }))?.session.token;

                if (metadata.addUsers) {
                  for (const userr of metadata.addUsers) {
                    await addOrgMember(userr.userId, organization.id, userr.role, token!);
                  }
                }

              }
              
          }
        }
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

  type Session = typeof auth.$Infer.Session;
  const getAuthHandler = async () => {
    return toNodeHandler(auth);
  }


  const getAuthForRequest = (req: FastifyRequest) => {
    let session: Session | null = null;
    let isSessionLoaded: boolean = false;
    
    const getSession = async () => {
      // get or create session
      if (!isSessionLoaded) { 
        session = await auth.api.getSession({
          headers: req.headers as unknown as Headers,
        });
        isSessionLoaded = true;
      }

      return session;
    }

    const getValidSession = async () => {
      return (await getSession())!!;
    }

    const isValidSession = async (): Promise<boolean> => {
      return (await getSession()) !== null;
    }

    // TODO refactor this so we dont need to generate headers everywhere all over this code.
    const getToken = async () => {
      return (await getValidSession()).session.token;
    }

    const listActiveSubscriptions = async () => {
      return await auth.api.listActiveSubscriptions({
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
    }

    const checkSubscription = async (subscription: Record<string, string>) => {
      const plan = Object.keys(subscription)[0] as keyof typeof subscription;
      const status = subscription[plan];
      const subscriptions = await listActiveSubscriptions();
      const validSubscription = subscriptions.find(s => s.status === status && s.plan === plan);
      if (!validSubscription) {
        throw new Error("Subscription not found");
      }
      return validSubscription ? true : false;
    }

    /**Checks top-level workspace user permissions via BetterAuth Admin API */
    const checkUserPermission = async (permission: Record<string, string[]>) => {
      const token = await getToken();
      const userId = (await getValidSession()).user.id;

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
    const checkOrgPermission = async (permission: Record<string, string[]>) => {
      const token = await getToken();
      // TODO something is wrong with this casting here.
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

    const verifyEmail = async (token: string) => {
      return await auth.api.verifyEmail({
        query: { token },
      });
    }

    return {
      listActiveSubscriptions,
      checkSubscription,
      isValidSession,
      checkUserPermission,
      checkOrgPermission,
      verifyEmail,
    };
  };

  return {
    getAuthForRequest,
    getAuthHandler,
  }
}

export type AuthEngine = ReturnType<typeof createAuthEngine>;
export type RequestAuth = ReturnType<AuthEngine["getAuthForRequest"]>;