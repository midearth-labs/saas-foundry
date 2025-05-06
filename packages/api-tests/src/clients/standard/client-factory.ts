import { BaseClientInterface } from "./interfaces/base-client.interface";
import { AuthClientInterface } from "./interfaces/auth-client.interface";
import { OrganizationClientInterface } from "./interfaces/organization-client.interface";
import { SocialAuthClientInterface } from "./interfaces/social-auth-client.interface";
import { WaitlistEnhancedClientInterface } from "./interfaces/waitlist-enhanced-client.interface";
import { OrganizationAuthClientInterface } from "./interfaces/organization-auth-client.interface";
import { ProtectedProcedureClientInterface } from "./interfaces/protected-procedure-client.interface";
import { OrganizationPermissionsClientInterface } from "./interfaces/organization-permissions-client.interface";
import { LinkAccountClientInterface } from "./interfaces/link-account-client.interface";
import { SubscriptionWaitlistClientInterface } from "./interfaces/subscription-waitlist-client.interface";

import { EmailPasswordClient } from "./implementations/email-password-client";
import { GoogleSocialClient } from "./implementations/google-social-client";
import { CreateOrganizationClient } from "./implementations/create-organization-client";
import { OrganizationInvitationClient } from "./implementations/organization-invitation-client";
import { VerificationRequiredUserClient } from "./implementations/verification-required-user-client";
import { EnhancedWaitlistClient } from "./implementations/enhanced-waitlist-client";
import { ProtectedProcedureClient } from "./implementations/protected-procedure-client";
import { GithubStyleOrganizationAuthClient } from "./implementations/github-style-organization-auth-client";
import { SlackStyleOrganizationAuthClient } from "./implementations/slack-style-organization-auth-client";
import { OrganizationPermissionsClient } from "./implementations/organization-permissions-client";
import { LinkAccountClient } from "./implementations/link-account-client";
import { SubscriptionWaitlistClient } from "./implementations/subscription-waitlist-client";

/**
 * Factory class to create client instances
 */
export class ClientFactory {
  /**
   * Create an EmailPasswordClient
   * @returns EmailPasswordClient instance
   */
  public static createEmailPasswordClient(): AuthClientInterface {
    return new EmailPasswordClient();
  }

  /**
   * Create a GoogleSocialClient
   * @returns GoogleSocialClient instance
   */
  public static createGoogleSocialClient(): SocialAuthClientInterface {
    return new GoogleSocialClient();
  }

  /**
   * Create a CreateOrganizationClient
   * @returns CreateOrganizationClient instance
   */
  public static createOrganizationClient(): OrganizationClientInterface {
    return new CreateOrganizationClient();
  }

  /**
   * Create an OrganizationInvitationClient
   * @returns OrganizationInvitationClient instance
   */
  public static createOrganizationInvitationClient(): OrganizationClientInterface {
    return new OrganizationInvitationClient();
  }

  /**
   * Create a VerificationRequiredUserClient
   * @returns VerificationRequiredUserClient instance
   */
  public static createVerificationRequiredUserClient(): AuthClientInterface {
    return new VerificationRequiredUserClient();
  }

  /**
   * Create an EnhancedWaitlistClient
   * @returns EnhancedWaitlistClient instance
   */
  public static createEnhancedWaitlistClient(): WaitlistEnhancedClientInterface {
    return new EnhancedWaitlistClient();
  }

  /**
   * Create a SubscriptionWaitlistClient
   * @returns SubscriptionWaitlistClient instance
   */
  public static createSubscriptionWaitlistClient(): SubscriptionWaitlistClientInterface {
    return new SubscriptionWaitlistClient();
  }

  /**
   * Create a ProtectedProcedureClient
   * @returns ProtectedProcedureClient instance
   */
  public static createProtectedProcedureClient(): ProtectedProcedureClientInterface {
    return new ProtectedProcedureClient();
  }

  /**
   * Create a GithubStyleOrganizationAuthClient
   * @returns GithubStyleOrganizationAuthClient instance
   */
  public static createGithubStyleOrganizationAuthClient(): OrganizationAuthClientInterface {
    return new GithubStyleOrganizationAuthClient();
  }

  /**
   * Create a SlackStyleOrganizationAuthClient
   * @returns SlackStyleOrganizationAuthClient instance
   */
  public static createSlackStyleOrganizationAuthClient(): OrganizationAuthClientInterface {
    return new SlackStyleOrganizationAuthClient();
  }

  /**
   * Create an OrganizationPermissionsClient
   * @returns OrganizationPermissionsClient instance
   */
  public static createOrganizationPermissionsClient(): OrganizationPermissionsClientInterface {
    return new OrganizationPermissionsClient();
  }

  /**
   * Create a LinkAccountClient
   * @returns LinkAccountClient instance
   */
  public static createLinkAccountClient(): LinkAccountClientInterface {
    return new LinkAccountClient();
  }

  /**
   * Get a client by name
   * @param clientName Name of the client to create
   * @returns Client instance
   */
  public static getClient(clientName: string): BaseClientInterface {
    switch (clientName.toLowerCase()) {
      case 'email-password':
        return this.createEmailPasswordClient();
      case 'google-social':
        return this.createGoogleSocialClient();
      case 'create-organization':
        return this.createOrganizationClient();
      case 'organization-invitation':
        return this.createOrganizationInvitationClient();
      case 'verification-required-user':
        return this.createVerificationRequiredUserClient();
      case 'enhanced-waitlist':
        return this.createEnhancedWaitlistClient();
      case 'subscription-waitlist':
        return this.createSubscriptionWaitlistClient();
      case 'protected-procedure':
        return this.createProtectedProcedureClient();
      case 'github-style-organization-auth':
        return this.createGithubStyleOrganizationAuthClient();
      case 'slack-style-organization-auth':
        return this.createSlackStyleOrganizationAuthClient();
      case 'organization-permissions':
        return this.createOrganizationPermissionsClient();
      case 'link-account':
        return this.createLinkAccountClient();
      default:
        throw new Error(`Unknown client type: ${clientName}`);
    }
  }
} 