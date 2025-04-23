import { EmailResult, OrganizationInvitationData, OrganizationInvitationEmailOptions } from '../types/email-types';

/**
 * Interface for services that send organization invitation emails
 */
export interface OrganizationInvitationEmailServiceInterface {
  /**
   * Send an organization invitation email with the provided options
   * @param options The organization invitation email options
   * @returns Promise with the result of the email sending operation
   */
  sendOrganizationInvitationEmail(options: OrganizationInvitationEmailOptions): Promise<EmailResult>;
  
  /**
   * Send an organization invitation email using raw BetterAuth data
   * @param data The organization invitation data from BetterAuth
   * @returns Promise with the result of the email sending operation
   */
  sendOrganizationInvitationEmailAdapter(data: OrganizationInvitationData): Promise<void>;
} 