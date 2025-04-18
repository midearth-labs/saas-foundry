import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for organization permissions client operations
 */
export interface OrganizationPermissionsClientInterface extends BaseClientInterface {
  /**
   * Create users with different roles
   * @returns Promise with the created users
   */
  createUsers(): Promise<any>;
  
  /**
   * Sign in users to get their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<any>;
  
  /**
   * Create an organization and add users with different roles
   * @returns Promise with the created organization
   */
  setupOrganization(): Promise<any>;
  
  /**
   * Test permissions for different user roles
   * @returns Promise with the test results
   */
  testRolePermissions(): Promise<any>;
  
  /**
   * Set active organization for all user sessions
   * @param token User's token
   * @param organizationId Organization ID
   * @returns Promise with the result
   */
  setActiveOrganizationForAllSessions(token: string, organizationId: string): Promise<any>;
} 