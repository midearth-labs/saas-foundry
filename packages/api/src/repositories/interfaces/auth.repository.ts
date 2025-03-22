import { AuthServiceShape } from '../../api/schema/auth';

/**
 * Repository interface for auth operations
 */
export type AuthRepository = {
  /**
   * Creates a new user account
   */
  signUp(data: AuthServiceShape['signUp']['input']): Promise<void>;

  /**
   * Authenticates a user and creates a session
   */
  signIn(data: AuthServiceShape['signIn']['input']): Promise<void>;

  /**
   * Ends the current user session
   */
  signOut(): Promise<void>;
} 