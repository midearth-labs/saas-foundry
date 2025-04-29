import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for testing waitlist functionality with subscription access control
 */
export interface SubscriptionWaitlistClientInterface extends BaseClientInterface {
  /**
   * Create users for testing
   * @returns Promise with the created users
   */
  createUsers(): Promise<any>;
  
  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<any>;
  
  /**
   * Set up a subscription for the paid user
   * @returns Promise with the subscription
   */
  setupSubscription(): Promise<any>;
  
  /**
   * Create a waitlist definition for testing
   * @returns Promise with the created waitlist definition
   */
  createWaitlistDefinition(): Promise<any>;
  
  /**
   * Test waitlist entry operations with both users
   * @returns Promise with the test results
   */
  testWaitlistOperations(): Promise<any>;
} 