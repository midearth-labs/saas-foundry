import * as dotenv from "dotenv";
import path from "path";
import { OrganizationClientInterface } from "../interfaces/organization-client.interface";
import {
  createUserOrThrow,
  signInUserOrThrow,
  getSessionTokenOrThrow,
  createOrgOrThrow
} from "../common/utils";

/**
 * Implementation of the OrganizationClientInterface for creating an organization with an admin user
 */
export class CreateOrganizationClient implements OrganizationClientInterface {
  private USER_NAME: string;
  private USER_EMAIL: string;
  private USER_PASSWORD: string;
  private ORG_NAME: string;
  private ORG_SLUG: string;

  /**
   * Creates a new CreateOrganizationClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    this.USER_NAME = process.env.ADMIN_USER_NAME || "Admin User";
    this.USER_EMAIL = process.env.ADMIN_USER_EMAIL || "admin_123@example.com";
    this.USER_PASSWORD = process.env.USER_PASSWORD || "Adm!n123Secure";
    this.ORG_NAME = process.env.ORG_NAME || "My Organization";
    this.ORG_SLUG = process.env.ORG_SLUG || "my-org";
  }

  /**
   * Create a user with email and password
   * @returns Promise with the created user
   */
  private createInitialUser(): Promise<any> {
    console.log("\n1. Creating new user...");
    return createUserOrThrow(
      this.USER_NAME,
      this.USER_EMAIL,
      this.USER_PASSWORD
    );
  }

  /**
   * Sign in a user with email and password
   * @returns Promise with the signed in user
   */
  private signInUser(): Promise<any> {
    console.log("\n4. Signing in user...");
    return signInUserOrThrow(this.USER_EMAIL, this.USER_PASSWORD)
      .then(({ signedInUser }) => {
        if (!signedInUser.data?.token) {
          throw new Error("Failed to get authentication token");
        }
        return signedInUser;
      });
  }

  /**
   * Create an organization
   * @param token Authentication token
   * @param name Organization name
   * @param slug Organization slug
   * @returns Promise with the created organization
   */
  public createOrganization(token: string, name: string, slug: string): Promise<any> {
    return createOrgOrThrow(token, name, slug);
  }

  /**
   * Invite a user to an organization (not implemented in this client)
   */
  public inviteUser(token: string, email: string, role: string, organizationId: string): Promise<any> {
    throw new Error("Method not implemented in this client");
  }

  /**
   * Accept an organization invitation (not implemented in this client)
   */
  public acceptInvitation(token: string, invitationId: string): Promise<any> {
    throw new Error("Method not implemented in this client");
  }

  /**
   * Creates a verified admin user with an organization
   * @returns Promise with the created user and organization
   */
  public createVerifiedAdminWithOrganization(): Promise<{
    user: { token: string };
    organization: any;
  }> {
    return this.createInitialUser()
      .then(() => this.signInUser())
      .then(signedInUser => {
        return getSessionTokenOrThrow(signedInUser.data.token)
          .then(latestToken => this.createOrganization(latestToken, this.ORG_NAME, this.ORG_SLUG))
          .then(organization => ({
            user: signedInUser.data,
            organization
          }));
      })
      .catch(error => {
        console.error("Error in organization creation process:", error);
        throw error;
      });
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<any> {
    return this.createVerifiedAdminWithOrganization()
      .then(result => {
        console.log("\nProcess completed successfully!");
        console.log("User and Organization details:", JSON.stringify(result, null, 2));
        return result;
      })
      .catch(error => {
        console.error("Error:", error);
        throw error;
      });
  }
} 