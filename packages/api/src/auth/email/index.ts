import { EmailServiceFactory } from './factories/email-service-factory';
import { OrganizationInvitationData, VerificationEmailOptions } from './types/email-types';

// Export interfaces
export * from './interfaces/base-email-service.interface';
export * from './interfaces/verification-email-service.interface';
export * from './interfaces/organization-invitation-email-service.interface';

// Export implementations
export * from './implementations/console-email-marshal';
export * from './implementations/resend-email-marshal';
export * from './implementations/verification-email-service.impl';
export * from './implementations/organization-invitation-email-service.impl';

// Export types
export * from './types/email-types';

// Export factory
export * from './factories/email-service-factory';

// Create singleton instances for use in adapter functions
const verificationEmailService = EmailServiceFactory.createVerificationEmailService();
const organizationInvitationEmailService = EmailServiceFactory.createOrganizationInvitationEmailService();

/**
 * Adapter function for sending verification emails.
 * Maintains backward compatibility with the original API.
 * 
 * @param options Verification email options
 */
export const sendVerificationEmailAdapter = async (options: VerificationEmailOptions) => {
  console.info(
    `\nSending verification email to`,
    `\n\t email: ${options.email}`,
    `\n\t token: ${options.token}`,
    `\n\t url: ${options.url}`
  );
  return await verificationEmailService.sendVerificationEmail(options);
};

/**
 * Adapter function for sending organization invitation emails.
 * Maintains backward compatibility with the original API.
 * 
 * @param data Organization invitation data from BetterAuth
 */
export const sendOrganizationInvitationEmailAdapter = async (data: OrganizationInvitationData) => {
  console.info(
    `\nSending organization invitation email to`,
    `\n\t email: ${data.email}`,
    `\n\t inviterName: ${data.inviter.user.name}`,
    `\n\t inviterEmail: ${data.inviter.user.email}`,
    `\n\t orgName: ${data.organization.name}`,
    `\n\t url: ${process.env.BETTER_AUTH_BASE_URL}/accept-invite/${data.invitation.id}`
  );
  
  return await organizationInvitationEmailService.sendOrganizationInvitationEmailAdapter(data);
}; 