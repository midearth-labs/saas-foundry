import * as dotenv from "dotenv";
import path from "path";
import { 
  createUserOrThrow, 
  signInUserOrThrow,
  signInUnsuccessfully,
  getTRPCClient
} from '../utils';
import readline from 'readline';

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
  USER_NAME = process.env.USER_NAME || "James Bond",
  USER_EMAIL = process.env.USER_EMAIL || "james.bond@007.co.uk",
  USER_PASSWORD = process.env.USER_PASSWORD || "Shaken-N0t-St!rred"

// Utility to truncate error messages
const truncateError = (error: any, maxLength: number = 150): string => {
  const errorMessage = error?.message || String(error);
  return errorMessage.length > maxLength 
    ? `${errorMessage.substring(0, maxLength)}...` 
    : errorMessage;
};

// Wait for verification utility
const waitForVerification = async (email: string) => {
    console.log(`\nPlease verify the email for ${email} and press any key to continue...`);
    return new Promise<boolean>((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        process.stdin.once('data', () => {
            rl.close();
            resolve(true);
        });
    });
};

function main() {
  return createUserOrThrow(USER_NAME, USER_EMAIL, USER_PASSWORD)
    .then(() => {
      console.log("\nUser created successfully");
      return waitForVerification(USER_EMAIL);
    })
    .then(() => {
      console.log("\nAttempting successful sign in...");
      return signInUserOrThrow(USER_EMAIL, USER_PASSWORD);
    })
    .then(({ signedInUser }) => {
      console.log("\nSuccessful sign in completed");
      
      console.log("\nAttempting unsuccessful sign in (expected to fail)...");
      return signInUnsuccessfully(USER_EMAIL, USER_PASSWORD + "BAD")
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
      process.exit(1);
    });
}

main();