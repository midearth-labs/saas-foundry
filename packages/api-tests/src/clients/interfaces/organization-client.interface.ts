import { BaseClientInterface } from './base-client.interface';
import { CreateOrgResult, AcceptOrgInvitationResult, SetActiveOrganizationResult } from '../utils';
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
  createOrganization?(token: string, name: string, slug: string): Promise<CreateOrgResult>;
  
  /**
   * Accept an organization invitation
   * @param token Authentication token
   * @param invitationId Invitation ID
   * @returns Promise with the acceptance result
   */
  acceptInvitation?(token: string, invitationId: string): Promise<AcceptOrgInvitationResult>;
  
  /**
   * Set the active organization for the user
   * @param token Authentication token
   * @param organizationId Organization ID
   * @returns Promise with the set active organization result
   */
  setActiveOrganizationForAllUsers?(token: string, organizationId: string): Promise<SetActiveOrganizationResult>;
} 