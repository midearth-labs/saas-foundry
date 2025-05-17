import { SocialAuthClientInterface } from "../interfaces/social-auth-client.interface";
import {
  signInGoogleUserOrThrow,
  getTRPCClient,
  getTokenSilently,
  SignInGoogleUserResult
} from "../utils";

/**
 * Implementation of the SocialAuthClientInterface for Google social authentication
 */
export class GoogleSocialClient implements SocialAuthClientInterface {
  /**
   * Sign in a user with Google social auth
   * @returns Promise with the Google auth result
   */
  public signInGoogleUser(): Promise<SignInGoogleUserResult> {
    return signInGoogleUserOrThrow()
      .then(response => response.googleUser);
  }

  /**
   * Use a Google token in a protected procedure
   * @param token Google auth token
   * @returns Promise with the procedure result
   */
  public useGoogleTokenInProtectedProcedure(token: string) {
    if (!token) {
      throw new Error("No token provided. Exiting.");
    }
    console.info(`Token received: ${token.slice(0,10)} ...[TRUNCATED]...\n`);
    const authenticatedTRPCClient = getTRPCClient(token);
    return authenticatedTRPCClient
                    .waitlist
                    .definition
                    .list
                    .query()
                    .then(output => {
                      console.info("\nOutput from protected procedure: ", JSON.stringify(output, null, 2));
                      return output;
                    });
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<JSON> {
    const execution = this.signInGoogleUser()
      .then((googleUser) => {
        console.log(JSON.stringify(googleUser, null, 2));
        console.info("Google sign in URL was successfully generated. \nThere's currently no protected procedure that can be used to test the token for NOW.");
        // Uncomment the below code when needed to test with a token
        /*
        return getTokenSilently('Please enter your token (input will be hidden): ')
          .then((token) => { 
            return this.useGoogleTokenInProtectedProcedure(token.toString());
          })
          .catch((error) => {
            console.error("An error occurred:", error);
            throw error;
          });
        */
        return googleUser;
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        throw error;
      });

      return JSON.parse(JSON.stringify(execution));
  }
} 