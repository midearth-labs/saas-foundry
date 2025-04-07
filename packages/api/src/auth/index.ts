import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as dotenv from "dotenv";
import { DB } from "../db";  // Global database instance (all caps to distinguish from any other db instance)
import { FastifyRequest } from "fastify";
import path from "path";
import { sendVerificationEmailAdapter } from "./email";
import { 
  admin, 
  bearer,
  openAPI,
  organization,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { user } from "../db/schema/auth.schema";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// @TODO: Temp fix for direct db query; will refactor for standard API repository level query later
const isAdmin = async (email: string) => {
  try {
    const userRole = await DB.select().from(user).where(eq(user.email, email)).limit(1);
    return userRole[0].role === "admin";
  } catch (error) {
    console.error(
      "Failed to get user role.",
      error,
      "Safely returning false instead..."
    );
    return false;
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(DB, {
    provider: "pg",
  }),
  plugins: [
    openAPI(), // @TODO: disable in production /api/auth/reference
    admin(),
    bearer(),
    organization({
      allowUserToCreateOrganization: async (user) => { return await isAdmin(user.email) },
      organizationCreation: {
        beforeCreate: async ({ organization, user }, request) => {
          // Extract the session token from cookies
          const cookieHeader = request?.headers.get('cookie')
          const cookies = cookieHeader?.split(';')
          const sessionTokenCookie = cookies?.find((cookie: string) => 
              cookie.trim().startsWith('better-auth.session_token=')
          )
          if (sessionTokenCookie) {
              const tokenValue = sessionTokenCookie.split('=')[1].split('.')[0]
              request?.headers.set('authorization', `Bearer ${tokenValue}`)
              console.log("Token set from organization hook: ", tokenValue);
          }
          return {
              data: { ...organization, request }
          }
        },
    }      
  }),
],
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
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  user: {
    additionalFields: {
      role: {
        // required: true,
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 5, // max requests in the window
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export type AuthUserType = Session["user"];

