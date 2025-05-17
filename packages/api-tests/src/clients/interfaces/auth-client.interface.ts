import { BaseClientInterface } from './base-client.interface';
import { CreateEmailUserResult, SignInUnsuccessfullyResult, SignInUserResult } from '../utils';
/**
 * Interface for authentication-related client operations
 */
export interface AuthClientInterface extends BaseClientInterface {
  
  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the signed in user session
   */
  signInUser?(email: string, password: string): Promise<SignInUserResult>;
  
  /**
   * Sign in a user with unsuccessful credentials (for testing)
   * @param email User's email
   * @param password User's password
   * @returns Promise with the unsuccessful sign in result
   */
  signInUnsuccessfully?(email: string, password: string): Promise<SignInUnsuccessfullyResult>;
} 