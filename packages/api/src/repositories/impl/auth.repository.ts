import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuthRepository } from '../interfaces/auth.repository';
import { AuthServiceShape } from '../../api/schema/auth';
import { auth } from '../../auth';
import { TRPCError } from '@trpc/server';
import { createAuthClient, SuccessContext } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from the root of the API package
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

// Auth Client Configuration
const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  //plugins: [adminClient()]
});

/**
 * Creates a Drizzle-based auth repository implementation
 */
export const createDrizzleAuthRepository = (db: NodePgDatabase<any>): AuthRepository => {
  return {
    async signUp(data: AuthServiceShape['signUp']['input']): Promise<any> {  // TODO: Proper return types and DTOs to be improved later on
      try {
        // BetterAuth will handle the actual user creation and password hashing
        return await authClient.signUp.email({
          name: data.name,
          email: data.email,  // TODO: Add email verification (quite tough to do in backend/API-only without UI)
          password: data.password,
        },
        {
          onError: (error) => {
            const errorMessage = JSON.stringify(error, null, 2);
            console.log(`Failed to sign up: ${errorMessage}`);
          },
          onSuccess: (result) => {
            console.log(JSON.stringify(result, null, 2));
          }
        }
      );
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to create user account',
          cause: error
        });
      }
    },

    async signIn(data: AuthServiceShape['signIn']['input']): Promise<void> {
      try {
        // BetterAuth will handle authentication and session creation
        await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          cause: error
        });
      }
    },

    async signOut(): Promise<void> {
      try {
        // BetterAuth will handle session termination
        await authClient.signOut();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sign out',
          cause: error
        });
      }
    }
  };
}; 