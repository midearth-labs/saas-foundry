// @TODO: Add support for attachments; Add robust typing/schema validation

/**
 * Base email options interface
 */
export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Verification email specific options
 */
export interface VerificationEmailOptions {
  email: string;
  token: string;
  url: string;
  subject?: string;
  text?: string;
  request?: Request | undefined;
}

/**
 * Verification email specific data from BetterAuth
 */
export interface VerificationData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
  };
  url: string;
  token: string;
  request?: Request | undefined;
}

/**
 * Organization invitation specific data from BetterAuth
 */
export interface OrganizationInvitationData {
  id: string;
  role: string;
  email: string;
  organization: { name: string };
  invitation: { 
    id: string; 
    email: string; 
    status: string; 
    expiresAt: Date; 
    organizationId: string; 
    role: string; 
    inviterId: string; 
    teamId?: string 
  };
  inviter: { 
    user: { 
      name: string; 
      email: string 
    } 
  };
}

/**
 * Organization invitation email options
 */
export interface OrganizationInvitationEmailOptions {
  email: string;
  url: string;
  inviterName: string;
  inviterEmail: string;
  orgName: string;
}

/**
 * Result of an email sending operation
 */
export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
} 