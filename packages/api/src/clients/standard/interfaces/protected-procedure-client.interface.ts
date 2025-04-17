import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for protected procedure client operations
 */
export interface ProtectedProcedureClientInterface extends BaseClientInterface {
  /**
   * Create admin and regular users
   * @returns Promise with the created users
   */
  createUsers(): Promise<any>;
  
  /**
   * Sign in users to get their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<any>;
  
  /**
   * Test protected procedures with different authentication levels
   * @returns Promise with the test results
   */
  testProtectedProcedures(): Promise<any>;
} 