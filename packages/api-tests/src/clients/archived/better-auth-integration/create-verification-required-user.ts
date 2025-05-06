import * as dotenv from "dotenv";
import path from "path";
import { createUserOrThrow } from '../../utils';

// Before running this test, set the AUTH_PREFERENCE_EMAIL_VERIFICATION environment variable to true

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
  USER_NAME = process.env.USER_NAME || "James Bond",
  USER_EMAIL = process.env.USER_EMAIL || "james.bond@007.co.uk",
  USER_PASSWORD = process.env.USER_PASSWORD || "Shaken-N0t-St!rred"

// Create user function
async function createUser() {
  console.log("Creating a new user...");
  await createUserOrThrow(
    "verification-" + USER_NAME, 
    "verification-" + USER_EMAIL, 
    "verification-" + USER_PASSWORD
  );
  console.log("\nPlease complete the verification process:");
  console.debug(
    "\n\t 1.) Check the server logs or your email (if using standard email provider) for the verification link.",
    "\n\t 2.) Follow the link and copy the valid portion of the token (just before the dot/hash) from the redirected page.",
    "\n\t 3.) When prompted, paste the token to use in the verified procedure.",
  )
}

// Execute
createUser().catch(console.error);