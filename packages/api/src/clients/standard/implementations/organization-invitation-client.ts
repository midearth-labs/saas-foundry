import * as dotenv from "dotenv";
import path from "path";
import { OrganizationClientInterface } from "../interfaces/organization-client.interface";
import {
  acceptOrgInvitationOrThrow,
  createOrgOrThrow,
  createUserOrThrow,
  inviteUserToOrgOrThrow,
  signInUserOrThrow,
} from "../common/utils";

/**
 * Implementation of the OrganizationClientInterface for organization invitations
 */
export class OrganizationInvitationClient implements OrganizationClientInterface {
  private INVITER_EMAIL: string;
  private INVITEE_EMAIL: string;
  private COMMON_PASSWORD: string;
  private ORG_NAME: string;
  private ORG_SLUG: string;

  /**
   * Creates a new OrganizationInvitationClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Generate unique credentials for this run
    const timestamp = Date.now();
    this.INVITER_EMAIL = `admin_inviter${timestamp}@example.com`;
    this.INVITEE_EMAIL = `invitee${timestamp}@example.com`;
    this.COMMON_PASSWORD = `SecurePass!${timestamp}`;
    this.ORG_NAME = `Test Organization ${timestamp}`;
    this.ORG_SLUG = `test-org-${timestamp}`;
  }

  /**
   * Create an inviter user
   * @returns Promise with the created user
   */
  private createInviterUser(): Promise<any> {
    console.log("\n1. Creating inviter user...");
    return createUserOrThrow(
      "Inviter User",
      this.INVITER_EMAIL,
      this.COMMON_PASSWORD
    );
  }

  /**
   * Sign in the inviter user
   * @returns Promise with the signed in user
   */
  private signInInviter(): Promise<any> {
    console.log("\n3. Signing in inviter...");
    return signInUserOrThrow(this.INVITER_EMAIL, this.COMMON_PASSWORD);
  }

  /**
   * Create an organization
   * @param token Authentication token
   * @param name Organization name
   * @param slug Organization slug
   * @returns Promise with the created organization
   */
  public createOrganization(token: string, name: string, slug: string): Promise<any> {
    console.log("\n4. Creating organization...");
    return createOrgOrThrow(token, name, slug);
  }

  /**
   * Invite a user to an organization
   * @param token Authentication token
   * @param email Email of the user to invite
   * @param role Role to assign to the user
   * @param organizationId Organization ID
   * @returns Promise with the invitation result
   */
  public inviteUser(token: string, email: string, role: string, organizationId: string): Promise<any> {
    console.log("\n5. Sending invitation...");
    return inviteUserToOrgOrThrow(token, email, role, organizationId);
  }

  /**
   * Create an invitee user
   * @returns Promise with the created user
   */
  private createInviteeUser(): Promise<any> {
    console.log("\n6. Creating invitee user...");
    return createUserOrThrow(
      "Invitee User",
      this.INVITEE_EMAIL,
      this.COMMON_PASSWORD
    );
  }

  /**
   * Sign in the invitee user
   * @returns Promise with the signed in user
   */
  private signInInvitee(): Promise<any> {
    console.log("\n7. Signing in invitee...");
    return signInUserOrThrow(this.INVITEE_EMAIL, this.COMMON_PASSWORD);
  }

  /**
   * Accept an organization invitation
   * @param token Authentication token
   * @param invitationId Invitation ID
   * @returns Promise with the acceptance result
   */
  public acceptInvitation(token: string, invitationId: string): Promise<any> {
    console.log("\n8. Accepting invitation...");
    return acceptOrgInvitationOrThrow(token, invitationId);
  }

  /**
   * Execute the organization invitation flow
   * @returns Promise with the flow result
   */
  public createOrganizationInvitationFlow(): Promise<any> {
    return this.createInviterUser()
      .then(() => this.signInInviter())
      .then(inviterSession => {
        return this.createOrganization(inviterSession.signedInUser.data.token, this.ORG_NAME, this.ORG_SLUG)
          .then(organization => ({
            inviterSession,
            organization
          }));
      })
      .then(({ inviterSession, organization }) => {
        return this.inviteUser(inviterSession.signedInUser.data.token, this.INVITEE_EMAIL, "member", organization?.data?.id ?? '')
          .then(invitation => ({
            inviterSession,
            organization,
            invitation
          }));
      })
      .then(({ inviterSession, organization, invitation }) => {
        return this.createInviteeUser()
          .then(() => this.signInInvitee())
          .then(inviteeSession => ({
            inviterSession,
            organization,
            invitation,
            inviteeSession
          }));
      })
      .then(({ inviterSession, organization, invitation, inviteeSession }) => {
        return this.acceptInvitation(inviteeSession.signedInUser.data.token, invitation?.data?.id ?? '')
          .then(acceptedInvitation => ({
            organization,
            invitation: acceptedInvitation,
            inviter: inviterSession.signedInUser.data,
            invitee: inviteeSession.signedInUser.data
          }));
      })
      .catch(error => {
        console.error("Error in organization invitation process:", error);
        throw error;
      });
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<any> {
    return this.createOrganizationInvitationFlow()
      .then(result => {
        console.log("\nProcess completed successfully!");
        console.log("Organization and Invitation details:", JSON.stringify(result, null, 2));
        return result;
      })
      .catch(error => {
        console.error("Error:", error);
        throw error;
      });
  }
} 