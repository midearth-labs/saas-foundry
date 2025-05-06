import * as dotenv from "dotenv";
import path from "path";
import { AuthClientInterface } from "../interfaces/auth-client.interface";
import { createUserOrThrow } from "../common/utils";


// !!! SET AUTH_PREFERENCE_EMAIL_VERIFICATION TO true IN .env TO ENABLE THIS CLIENT
/**
 * Implementation of the AuthClientInterface for creating a user that requires verification
 */
export class VerificationRequiredUserClient implements AuthClientInterface {
  private USER_NAME: string;
  private USER_EMAIL: string;
  private USER_PASSWORD: string;
  private readonly TIMESTAMP: string = new Date().toISOString().replace(/[-:Z]/g, '');
  /**
   * Creates a new VerificationRequiredUserClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    this.USER_NAME = "John Doe " + this.TIMESTAMP;
    this.USER_EMAIL = `john_doe_${this.TIMESTAMP}@example.com`;
    this.USER_PASSWORD = `SecurePass!${this.TIMESTAMP}`;
  }

  /**
   * Create a user with email and password
   * @param name User's name
   * @param email User's email
   * @param password User's password
   * @returns Promise with the created user
   */
  public createUser(name: string, email: string, password: string): Promise<any> {
    console.log(`Creating a new user: ${name} (${email})...`);
    return createUserOrThrow(name, email, password);
  }

  /**
   * Sign in a user (not implemented in this client)
   */
  public signInUser(email: string, password: string): Promise<any> {
    throw new Error("Method not implemented in this client");
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<any> {
    return this.createUser(
      "verification-" + this.USER_NAME, 
      "verification-" + this.USER_EMAIL, 
      "verification-" + this.USER_PASSWORD
    )
    .then(() => {
      console.log("\nPlease complete the verification process:");
      console.debug(
        "\n\t 1.) Check the server logs or your email (if using standard email provider) for the verification link.",
        "\n\t 2.) Follow the link and copy the valid portion of the token (just before the dot/hash) from the redirected page.",
        "\n\t 3.) When prompted, paste the token to use in the verified procedure.",
      );
    })
    .catch(error => {
      console.error("Error creating verification-required user:", error);
      throw error;
    });
  }
} 