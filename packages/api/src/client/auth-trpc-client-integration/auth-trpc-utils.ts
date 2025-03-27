import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from '../../api/schema/root';
import { APIError } from 'better-auth/api';
import path from 'path';
import * as dotenv from "dotenv";
import { createAuthClient, SuccessContext, ErrorContext } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
  });
  
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
  
/** BetterAuth Auth Client */
export const getAuthClient = (): ReturnType<typeof createAuthClient> => {
    return createAuthClient({
        baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
        plugins: [adminClient()]
    });
}

export type AuthClient = ReturnType<typeof getAuthClient>;
export const authClient: AuthClient = getAuthClient();

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
