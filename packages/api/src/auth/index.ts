import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer, jwt, openAPI } from "better-auth/plugins";
import * as dotenv from "dotenv";
import { createDBConnection } from "../db";
import { FastifyRequest } from "fastify";
import path from "path";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// @Awwal: Note we need to refactor (later) to make sure there is only one database connection across 
const db = createDBConnection();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    openAPI(), // @TODO: disable in production /api/auth/reference
    admin(),
    bearer(),  // https://www.better-auth.com/docs/plugins/bearer
  ],
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
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export type AuthUserType = Session["user"];

