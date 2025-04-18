import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for social authentication-related client operations
 */
export interface SocialAuthClientInterface extends BaseClientInterface {
  /**
   * Sign in a user with Google social auth
   * @returns Promise with the Google auth result
   */
  signInGoogleUser(): Promise<any>;
  
  /**
   * Sign out a user
   * @param client Auth client to use
   * @returns Promise with the sign out result
   */
  signOutUser?(client: any): Promise<any>;
  
  /**
   * Update user profile
   * @param client Auth client to use
   * @returns Promise with the updated user profile
   */
  updateUserProfile?(client: any): Promise<any>;
  
  /**
   * Link an account with social provider
   * @returns Promise with the linked account result
   */
  linkAccount?(): Promise<any>;
  
  /**
   * Use a Google token in a protected procedure
   * @param token Google auth token
   * @returns Promise with the procedure result
   */
  useGoogleTokenInProtectedProcedure?(token: string): Promise<any>;
} 