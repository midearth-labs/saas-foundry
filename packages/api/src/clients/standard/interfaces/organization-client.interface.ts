import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for organization-related client operations
 */
export interface OrganizationClientInterface extends BaseClientInterface {
  /**
   * Create an organization
   * @param token Authentication token
   * @param name Organization name
   * @param slug Organization slug
   * @returns Promise with the created organization
   */
  createOrganization(token: string, name: string, slug: string): Promise<any>;
  
  /**
   * Invite a user to an organization
   * @param token Authentication token
   * @param email Email of the user to invite
   * @param role Role to assign to the user
   * @param organizationId Organization ID
   * @returns Promise with the invitation result
   */
  inviteUser(token: string, email: string, role: string, organizationId: string): Promise<any>;
  
  /**
   * Accept an organization invitation
   * @param token Authentication token
   * @param invitationId Invitation ID
   * @returns Promise with the acceptance result
   */
  acceptInvitation(token: string, invitationId: string): Promise<any>;
  
  /**
   * Set the active organization for the user
   * @param token Authentication token
   * @param organizationId Organization ID
   * @returns Promise with the set active organization result
   */
  setActiveOrganization?(token: string, organizationId: string): Promise<any>;
} 