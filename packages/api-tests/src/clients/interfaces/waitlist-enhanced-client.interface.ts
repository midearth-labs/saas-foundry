import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for enhanced waitlist client operations that includes user management
 */
export interface WaitlistEnhancedClientInterface extends BaseClientInterface {
  /**
   * Create multiple users with different roles
   * @returns Promise with the created users
   */
  createUsers(): Promise<void>;
  
  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<void>;

} 