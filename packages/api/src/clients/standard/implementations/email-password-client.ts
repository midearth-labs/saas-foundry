import * as dotenv from "dotenv";
import path from "path";
import { AuthClientInterface } from "../interfaces/auth-client.interface";
import {
  createUserOrThrow,
  signInUserOrThrow,
  signInUnsuccessfully,
  getTRPCClient,
  truncateError
} from "../common/utils";

/**
 * Implementation of the AuthClientInterface for email/password authentication
 */
export class EmailPasswordClient implements AuthClientInterface {
  private USER_NAME: string;
  private USER_EMAIL: string;
  private USER_PASSWORD: string;

  /**
   * Creates a new EmailPasswordClient
   * @param userName User's name (optional, defaults to environment variable or "James Bond")
   * @param userEmail User's email (optional, defaults to environment variable or "james.bond@007.co.uk")
   * @param userPassword User's password (optional, defaults to environment variable or "Shaken-N0t-St!rred")
   */
  constructor(
    userName?: string,
    userEmail?: string,
    userPassword?: string
  ) {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    this.USER_NAME = userName || process.env.ADMIN_USER_NAME || "James Bond";
    this.USER_EMAIL = userEmail || "admin_mi6@007.co.uk";
    this.USER_PASSWORD = userPassword || process.env.ADMIN_USER_PASSWORD || "Shaken-N0t-St!rred";
  }

  /**
   * Create a user with email and password
   * @param name User's name
   * @param email User's email
   * @param password User's password
   * @returns Promise with the created user
   */
  public createUser(name: string, email: string, password: string): Promise<any> {
    console.log(`\nCreating user ${name} with email ${email}...`);
    return createUserOrThrow(name, email, password);
  }

  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the signed in user session
   */
  public signInUser(email: string, password: string): Promise<any> {
    console.log(`\nAttempting to sign in user ${email}...`);
    return signInUserOrThrow(email, password);
  }

  /**
   * Sign in a user with unsuccessful credentials (for testing)
   * @param email User's email
   * @param password User's password
   * @returns Promise with the unsuccessful sign in result
   */
  public signInUnsuccessfully(email: string, password: string): Promise<any> {
    console.log(`\nAttempting unsuccessful sign in with ${email}...`);
    return signInUnsuccessfully(email, password + "BAD");
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<any> {
    return this.createUser(this.USER_NAME, this.USER_EMAIL, this.USER_PASSWORD)
      .then(() => {
        console.log("\nUser created successfully");
      })
      .then(() => {
        console.log("\nAttempting successful sign in...");
        return this.signInUser(this.USER_EMAIL, this.USER_PASSWORD);
      })
      .then(({ signedInUser }) => {
        console.log("\nSuccessful sign in completed");
        
        console.log("\nAttempting unsuccessful sign in (expected to fail)...");
        return this.signInUnsuccessfully(this.USER_EMAIL, this.USER_PASSWORD)
          .then(({ unsuccessfulUser }) => {
            console.log("\nUnsuccessful sign in completed as expected");
            
            const authenticatedTRPCClient = getTRPCClient(signedInUser.data!.token);
            const unauthenticatedTRPCClient = getTRPCClient(unsuccessfulUser?.data?.token ?? "");

            console.log("\nAttempting TRPC operations...");
            return Promise.all([
              authenticatedTRPCClient.waitlist.definition.create.mutate({ 
                name: 'Test', 
                description: 'Desc', 
                status: 'ACTIVE' 
              }).catch(error => {
                console.error("\nAuthenticated TRPC operation failed:", truncateError(error));
                return null;
              }),
              unauthenticatedTRPCClient.waitlist.definition.create.mutate({ 
                name: 'Test2', 
                description: 'Desc2', 
                status: 'ACTIVE' 
              }).catch(error => {
                console.error("\nUnauthenticated TRPC operation failed:", truncateError(error));
                return null;
              })
            ]).then(([authOutput, unauthOutput]) => {
              console.log("\nTRPC operations completed");
              console.log("\nWaitlist procedures results:");
              console.log({
                authenticatedResult: authOutput || "Failed",
                unauthenticatedResult: unauthOutput || "Failed"
              });
            });
          })
          .catch(error => {
            console.error("\nUnsuccessful sign in error (expected):", truncateError(error));
            // Continue execution even after expected error
            return Promise.resolve();
          });
      })
      .catch(error => {
        console.error("\nFatal error in main execution:", truncateError(error));
        throw error;
      });
  }
} 