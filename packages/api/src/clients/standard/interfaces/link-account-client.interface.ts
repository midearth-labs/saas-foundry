import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for account linking client operations
 */
export interface LinkAccountClientInterface extends BaseClientInterface {
  /**
   * Create an email user
   * @param shouldSignIn Whether to sign in after creation
   * @returns Promise with the created user
   */
  createEmailUser(shouldSignIn?: boolean): Promise<any>;
  
  /**
   * Sign in with email
   * @param shouldSignOut Whether to sign out after sign in
   * @returns Promise with the signed in user
   */
  signInEmailUser(shouldSignOut?: boolean): Promise<any>;
  
  /**
   * Sign in with Google
   * @param shouldSignOut Whether to sign out after sign in
   * @returns Promise with the Google sign in result
   */
  signInGoogleUser(shouldSignOut?: boolean): Promise<any>;
  
  /**
   * Sign out a user
   * @param client Auth client to use
   * @returns Promise with the sign out result
   */
  signOutUser(client: any): Promise<any>;
  
  /**
   * Update user profile
   * @param client Auth client to use
   * @returns Promise with the updated profile
   */
  updateUserProfile(client: any): Promise<any>;
  
  /**
   * Link accounts between providers
   * @returns Promise with the linked account
   */
  linkAccount(): Promise<any>;
} 