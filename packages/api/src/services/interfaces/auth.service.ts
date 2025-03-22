import { AuthServiceShape } from '../../api/schema/auth';
import { AuthContext } from '../../trpc/base-procedures/auth';

export type AuthService = {
  signUp(opts: { ctx: AuthContext, input: AuthServiceShape['signUp']['input'] }): Promise<AuthServiceShape['signUp']['output']>;
  signIn(opts: { ctx: AuthContext, input: AuthServiceShape['signIn']['input'] }): Promise<AuthServiceShape['signIn']['output']>;
  signOut(opts: { ctx: AuthContext, input: AuthServiceShape['signOut']['input'] }): Promise<AuthServiceShape['signOut']['output']>;
}; 