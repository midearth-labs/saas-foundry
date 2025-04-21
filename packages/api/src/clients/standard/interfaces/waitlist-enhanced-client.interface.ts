import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for enhanced waitlist client operations that includes user management
 */
export interface WaitlistEnhancedClientInterface extends BaseClientInterface {
  /**
   * Create multiple users with different roles
   * @returns Promise with the created users
   */
  createUsers(): Promise<any>;
  
  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<any>;
  
  /**
   * Create an organization and add members with roles
   * @returns Promise with the created organization
   */
  setupOrganization(): Promise<any>;
  
  /**
   * Test waitlist definition and entry operations with different user roles
   * @returns Promise with the test results
   */
  testWaitlistOperations(): Promise<any>;
} 