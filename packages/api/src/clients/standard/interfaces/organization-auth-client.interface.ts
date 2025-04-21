import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for organization auth client operations
 */
export interface OrganizationAuthClientInterface extends BaseClientInterface {
  /**
   * Create multiple users for testing
   * @returns Promise with the created users
   */
  createUsers(): Promise<any>;
  
  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  signInUsers(): Promise<any>;
  
  /**
   * Create organizations
   * @returns Promise with the created organizations
   */
  createOrganizations(): Promise<any>;
  
  /**
   * Invite users to organizations
   * @returns Promise with the invitation results
   */
  inviteUsersToOrganizations(): Promise<any>;
  
  /**
   * Accept organization invitations
   * @returns Promise with the acceptance results
   */
  acceptInvitations(): Promise<any>;
  
  /**
   * Test organization operations with different users
   * @returns Promise with the test results
   */
  testOrganizationOperations(): Promise<any>;
  
  /**
   * Create and list multiple user sessions
   * @returns Promise with the session results
   */
  createMultipleSessionsAndList(): Promise<any>;
  
  /**
   * Set active organization for a user (for Slack-style)
   * @param token User's token
   * @param organizationId Organization ID
   * @returns Promise with the result
   */
  setActiveOrganization?(token: string, organizationId: string | null): Promise<any>;
  
  /**
   * Select a workspace (for Slack-style)
   * @param token User's token
   * @returns Promise with the selected organization ID
   */
  selectWorkspace?(token: string): Promise<string | null>;
} 