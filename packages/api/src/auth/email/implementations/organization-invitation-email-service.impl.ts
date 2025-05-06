import * as dotenv from 'dotenv';
import path from 'path';
import { Email } from '@saas-foundry/api-model/common';
import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { OrganizationInvitationEmailServiceInterface } from '../interfaces/organization-invitation-email-service.interface';
import { EmailResult, OrganizationInvitationData, OrganizationInvitationEmailOptions } from '../types/email-types';

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

/**
 * Implementation of the organization invitation email service
 */
export class OrganizationInvitationEmailServiceImpl implements OrganizationInvitationEmailServiceInterface {
  private emailService: BaseEmailServiceInterface;

  /**
   * Initialize with an email service
   * @param emailService The underlying email service to use
   */
  constructor(emailService: BaseEmailServiceInterface) {
    this.emailService = emailService;
  }

  /**
   * Transform BetterAuth organization invitation data to email options
   * @param data The organization invitation data from BetterAuth
   * @returns The transformed email options
   */
  private transformInvitationData(data: OrganizationInvitationData): OrganizationInvitationEmailOptions {
    return {
      email: data.email,
      url: `${process.env.BETTER_AUTH_BASE_URL}/accept-invite/${data.invitation.id}`,
      inviterName: data.inviter.user.name,
      inviterEmail: data.inviter.user.email,
      orgName: data.organization.name
    };
  }

  /**
   * Send an organization invitation email using the raw BetterAuth data
   * @param data The organization invitation data from BetterAuth
   * @returns Promise with the result of the email sending operation
   */
  async sendOrganizationInvitationEmailAdapter(data: OrganizationInvitationData): Promise<void> {
    // const options = this.transformInvitationData(data);
    const options = {
      email: data.email,
      url: `${process.env.BETTER_AUTH_BASE_URL}/accept-invite/${data.invitation.id}`,
      inviterName: data.inviter.user.name,
      inviterEmail: data.inviter.user.email,
      orgName: data.organization.name
    };
    await this.sendOrganizationInvitationEmail(options);
  }

  /**
   * Send an organization invitation email
   * @param options The organization invitation {@link OrganizationInvitationEmailOptions email options}
   * @returns Promise with the result of the email sending operation
   */
  async sendOrganizationInvitationEmail(options: OrganizationInvitationEmailOptions): Promise<EmailResult> {
    const { email, url, inviterName, orgName } = options;

    // Construct the email content
    const html = `
      <h1>Invitation to ${orgName}</h1>
      <p>${inviterName} has invited you to join ${orgName}.</p>
      <p>Click the link below to accept the invitation:</p>
      <p><a href="${url}">${url}</a></p>
    `;

    // Send the email using the underlying email service
    return await this.emailService.sendEmail({
      from: Email.parse(process.env.EMAIL_FROM || 'noreply@example.com'),
      to: email,
      subject: `You've been invited to join ${orgName}`,
      html
    });
  }
} 