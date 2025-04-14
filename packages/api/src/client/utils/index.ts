/**
 * Utility functions for the server client.
 * 
 * - {@link getTokenSilently}: Get a token silently from the user
 * - {@link getTRPCClient}: Get a TRPC client
 * - {@link getAuthClient}: Get an auth client
 * - {@link getProtectedTRPCClient}: Get a protected TRPC client
 * - {@link verifyEmailWithToken}: Verify an email with a token
 * - {@link signInGoogleUserOrThrow}: Sign in a user via Google
 * - {@link signInUserOrThrow}: Sign in a user via email and password
 * - {@link signInUnsuccessfully}: Sign in a user with wrong password
 * - {@link createUserOrThrow}: Create a user
 * - {@link promoteUserToAdminOrThrow}: Promote a user to admin
 */
import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from '../../api/schema/root';
import path from 'path';
import * as dotenv from "dotenv";
import { createAuthClient, SuccessContext, ErrorContext } from 'better-auth/client';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import * as readline from 'readline';
import { Writable } from 'stream';
import { user } from '../../db/schema/auth.schema';
import { eq } from 'drizzle-orm';
import { DB } from '../../db';


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});
  
/** Create a custom muted stdout to hide the input */
class MutedStdout extends Writable {
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
        callback();
    }
}

/** Function to get user input in silent mode */
export async function getTokenSilently(message: string): Promise<string> {
    const mutedStdout = new MutedStdout();
    const rl = readline.createInterface({
        input: process.stdin,
        output: mutedStdout,
        terminal: true
    });

    process.stdout.write(message);

    return new Promise((resolve) => {
        rl.question('', (token) => {
        process.stdout.write('\n');
        rl.close();
        resolve(token);
        });
    });
}
  
/** TRPC Client for interacting with the API */
export const getTRPCClient = (token: string) => {
    return createTRPCClient<AppClientRouter>({
        links: [
        httpLink({
            url: process.env.API_URL || 'http://localhost:3005/api/trpc',
            headers: () => ({
            'x-tenant-id': 'your-tenant-id-2',
            // 'authorization': `Bearer ${bearerToken}`
            ...(token != undefined && {Authorization: `Bearer ${token}`})
            })
        })
        ]
    });
}


/** Authenticated TRPC client that needs a valid token */
export async function getProtectedTRPCClient(token: string) {
    if (!token) {
      throw new Error("No token provided. Exiting.");
    }
    console.info(`Token received: ${token.slice(0,10)} ...[TRUNCATED]...\n`);
    const authenticatedTRPCClient = getTRPCClient(token);
    return authenticatedTRPCClient;
}

// Type inference won't be a problem if this is used in-file only
/** BetterAuth Auth Client */
const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
        baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
        plugins: [
            adminClient(),
            organizationClient(),
        ]
});

/** Email verification function using the token delivered in the verification email.
 * This is in lieu of browser-based email verification */
export const verifyEmailWithToken = async (token: string) => {
    return await authClient.verifyEmail({
        query: {
            token
        }
    });
}

/** Sign in a user via Google Social Provider */
export const signInGoogleUserOrThrow = async () => {
    let googleUser = await authClient.signIn.social({
        provider: "google",
    }, {
        onError: (ectx: ErrorContext) => {
          const errorMessage = JSON.stringify(ectx.error, null, 2);
          console.error(`\nFailed to sign in with Google: ${errorMessage}`);
        },
        onSuccess: (sctx: SuccessContext) => {
          console.info(JSON.stringify(sctx.data, null, 2));
          console.info("\nGoogle OAuth2.0 Response:", JSON.stringify(sctx.response, null, 2));
          console.info("\nGoogle OAuth Request:", JSON.stringify(sctx.request, null, 2));
        }
    });
    if (googleUser.data) {
        console.info(
            "\nRedirecting to Google OAuth2.0...",
            JSON.stringify(googleUser, null, 2)
        )
    } else {
        throw new Error("Failed to sign in via Google.")
    }

    return { googleUser };
}

/** Sign in a user via BetterAuth Client or throw an error */
export const signInUserOrThrow = async (email: string, password: string) => {
    let signedInUser = await authClient.signIn.email({
        email,
        password
    }, {
        onError: (ectx: ErrorContext) => {
          const errorMessage = JSON.stringify(ectx.error, null, 2);
          console.error(`\nFailed to sign in: ${errorMessage}`);
        },
        onSuccess: (sctx: SuccessContext) => {
          console.info(JSON.stringify(sctx.data, null, 2));
        }
    });
    if (signedInUser.data) {
        console.info(
            "\nUser signed in successfully",
            "\ntoken=" + signedInUser.data.token
        )
    } else if (signedInUser.error.code === "INVALID_CREDENTIALS") {
        console.error("Invalid credentials.")
    } else {
        throw new Error("Failed to sign in.")
    }

    return { signedInUser };
}

/** Infer the signed-in user type from the signInUserOrThrow function */
export type SignedInUser = Awaited<ReturnType<typeof signInUserOrThrow>>['signedInUser'];

/** Sign in a user via BetterAuth Client with wrong password */
export const signInUnsuccessfully = async (email: string, password: string) => {
    let unsuccessfulUser;
    try {
        unsuccessfulUser = await authClient.signIn.email({
            email,
            password
        }, {
        onError: (ectx: ErrorContext) => {
            console.error(`\nFailed to sign in with wrong password: ${JSON.stringify(ectx.error, null, 2).slice(0, 150) + "[...truncated...]"}`);
        }
    });
    } catch (error) {
        console.error(`\nFailed to sign in with wrong password: ${JSON.stringify(error, null, 2).slice(0, 150) + "[...truncated...]"}`);
    }
    return { unsuccessfulUser };
}

/** Create a user via BetterAuth Client or throw an error */
export const createUserOrThrow = async (name: string, email: string, password: string) => {
    let createdUser = await authClient.signUp.email({
      name,
      email,
      password
    }, {
        onError: (ectx: ErrorContext) => {
          const errorMessage = JSON.stringify(ectx.error, null, 2);
          console.error(`\nFailed to sign up: ${errorMessage}`);
        },
        onSuccess: (sctx: SuccessContext) => {
          console.info(JSON.stringify(sctx.data, null, 2));
        }
    });
    if (createdUser.data) {
        console.info("User created successfully")
    } else if (createdUser.error.code === "USER_ALREADY_EXISTS") {
        console.error("User already exists.")
    } else {
        throw new Error("Failed to create user.")
    }

    return { createdUser };
}

// @TODO: This is temporary, role promotion would later be handled via the API at repository level
/** Promote a signed-in user to admin role via direct database connection */
export const promoteUserToAdminOrThrow = async (email: string) => {

    try {
        const result = await DB
            .update(user)
            .set({ role: "admin" })
            .where(eq(user.email, email))
            .returning();

        if (!result.length) {
            throw new Error(`User with email ${email} not found or failed to update role`);
        }

        console.info("User successfully promoted to admin:", result[0]);
        return { updatedUser: result[0] };
    } catch (error) {
        console.error("Failed to promote user to admin:", error);
        throw error;
    }
}

/** Inferred return type for the admin promotion function */
export type PromotedUser = Awaited<ReturnType<typeof promoteUserToAdminOrThrow>>['updatedUser'];

/** Create an organization via direct database connection */
export const createOrganizationOrThrow = async function ({
    name,
    slug,
    logo,
    metadata
}: {
    name: string;
    slug: string;
    logo?: string;
    metadata?: string;
}) {   
} 
