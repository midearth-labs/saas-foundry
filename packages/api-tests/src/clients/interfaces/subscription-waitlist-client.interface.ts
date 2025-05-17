import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for testing waitlist functionality with subscription access control
 */
export interface SubscriptionWaitlistClientInterface extends BaseClientInterface {
  /**
   * Create users for testing
   * @returns Promise with the created users
   */
  createUsers(): Promise<void>;
  
  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<void>;
} 