import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for authentication-related client operations
 */
export interface AuthClientInterface extends BaseClientInterface {
  /**
   * Create a user with email and password
   * @param name User's name
   * @param email User's email
   * @param password User's password
   * @returns Promise with the created user
   */
  createUser(name: string, email: string, password: string): Promise<any>;
  
  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the signed in user session
   */
  signInUser(email: string, password: string): Promise<any>;
  
  /**
   * Sign in a user with unsuccessful credentials (for testing)
   * @param email User's email
   * @param password User's password
   * @returns Promise with the unsuccessful sign in result
   */
  signInUnsuccessfully?(email: string, password: string): Promise<any>;
} 