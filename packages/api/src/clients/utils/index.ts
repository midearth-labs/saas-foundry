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
 */
import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from '../../api/schema/root';
import path from 'path';
import * as dotenv from "dotenv";
import { createAuthClient, SuccessContext, ErrorContext } from 'better-auth/client';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import * as readline from 'readline';
import { Writable } from 'stream';
import { adminAccessControl } from '../../auth/admin/permissions';
import { organizationAccessControl } from '../../auth/org/permissions';
import { roles as adminRoles } from '../../auth/admin/roles';
import { OrgRoleTypeKeys, roles as orgRoles } from '../../auth/org/roles';
import { Session } from 'better-auth';
import { stripeClient } from '@better-auth/stripe/client';


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Should not be a problem if this is used in-file only
/** BetterAuth Auth Client */
const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
    plugins: [
        adminClient({
            ac: adminAccessControl,
            roles: adminRoles,
            adminRoles: ["admin", "adminRole", "owner", "ownerRole"],
            defaultRole: "user",
          }),
        organizationClient({
            ac: organizationAccessControl,
            roles: orgRoles,
            adminRoles: ["owner", "ownerRole", "admin", "adminRole"],
            defaultRole: "member",
        }),
        stripeClient({
            subscription: true
        }),
    ]
});

// Experimental exported usage in wake of BetterAuth 1.2.6-beta.7 (probably won't work as expected)
/** Get a BetterAuth Authentication Client */
export const getAuthClient = () => {
    return createAuthClient({
        baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
        plugins: [
            adminClient({
                ac: adminAccessControl,
                roles: adminRoles,
                adminRoles: ["admin", "adminRole", "owner", "ownerRole"],
                defaultRole: "user",
              }),
            organizationClient({
                ac: organizationAccessControl,
                roles: orgRoles,
                adminRoles: ["owner", "ownerRole", "admin", "adminRole"],
                defaultRole: "member",
            }),
            stripeClient({
                subscription: true,
            }),
        ]
    })
}
  
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

/** Get the latest session token from the user or throw an error*/
export const getSessionTokenOrThrow = async (token: string) => {
    const { data } = await authClient.listSessions({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
    const session = data?.[0];
    if (!session) {
        throw new Error("Unable to create organization because no session was found");
    }
    return session.token;
};

/** Get the active organization for a user via BetterAuth Client */
export const getActiveOrganization = async (token: string) => {
    const response = await authClient.useActiveOrganization.get();
    if (response.data) {
        console.info("Active organization retrieved successfully")
    } else {
        return null;
    }
    return response;
};

/** Set the active organization for the user or throw an error */
export const setActiveOrganizationOrThrow = async (token: string, orgId: string) => {
    const response = await authClient.organization.setActive({
        organizationId: orgId,
        fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    if (response.data) {
        console.info("Organization set as active successfully")
    } else {
        throw new Error("Failed to set organization as active.")
    }
    return response;
};

/** Get all sessions for a user via BetterAuth Client or throw an error */
export const getAllSessionsOrThrow = async (token: string) => {
    const response = await authClient.listSessions({
        fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    return response;
};

/** Invite a user to an organization via BetterAuth Client or throw an error */
export const inviteUserToOrgOrThrow = async (token: string, email: string, role: string, orgId: string) => {
    const response = await authClient.organization.inviteMember({
        email,
        role: role as OrgRoleTypeKeys,
        organizationId: orgId,
        fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    if (response.data) {
        console.info("User invited to organization successfully")
    } else {
        throw new Error("Failed to invite user to organization.")
    }
    return response;
};

/** Accept an invitation to an organization via BetterAuth Client or throw an error */
export const acceptOrgInvitationOrThrow = async (token: string, invitationId: string) => {
    const response = await authClient.organization.acceptInvitation({
        invitationId,
        fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    if (response.data) {
        console.info("Organization invitation accepted successfully")
    } else {
        throw new Error("Failed to accept organization invitation.")
    }
    return response;
};

/** Create an organization via BetterAuth Client or throw an error */
export const createOrgOrThrow = async (token: string, name: string, slug: string) => {
    const response = await authClient.organization.create({ 
        name,
        slug,
        fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    if (response.data) {
        console.info("Organization created successfully")
    } else {
        throw new Error("Failed to create organization.")
    }
    return response;
};
  
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

/** Email verification function using the token delivered in the verification email.
 * This is in lieu of browser-based email verification */
export const verifyEmailWithToken = async (token: string) => {
    return await authClient.verifyEmail({
        query: {
            token
        }
    });
}

/** Get user input from the console */
export const getUserInput = async (prompt: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

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
