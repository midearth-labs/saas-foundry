import { 
  SignInGoogleUserResult, 
  SignOutUserResult, 
  UpdateUserProfileResult,
  AuthClientType
} from '../utils';
import { BaseClientInterface } from './base-client.interface';


/**
 * Interface for social authentication-related client operations
 */
export interface SocialAuthClientInterface extends BaseClientInterface {
  /**
   * Sign in a user with Google social auth
   * @returns Promise with the Google auth result
   */
  signInGoogleUser(): Promise<SignInGoogleUserResult>;
  
  /**
   * Sign out a user
   * @param client Auth client to use
   * @returns Promise with the sign out result
   */
  signOutUser?(client: AuthClientType): Promise<SignOutUserResult>;
  
  /**
   * Update user profile
   * @param client Auth client to use
   * @returns Promise with the updated user profile
   */
  updateUserProfile?(client: AuthClientType): Promise<UpdateUserProfileResult>;
  
  /**
   * Link an account with social provider
   * @returns Promise with the linked account result
   */
  linkAccount?(): Promise<any>;

} 