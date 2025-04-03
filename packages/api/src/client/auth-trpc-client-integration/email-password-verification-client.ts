import * as dotenv from "dotenv";
import path from "path";
import { 
  createUserOrThrow,
  getTokenSilently,
  getTRPCClient, 
} from './client-utils';


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
  USER_NAME = process.env.USER_NAME || "James Bond",
  USER_EMAIL = process.env.USER_EMAIL || "james.bond@007.co.uk",
  USER_PASSWORD = process.env.USER_PASSWORD || "Shaken-N0t-St!rred"

  // Automatically creates and (upon successful verification) signs in the user
async function createPostVerifiedUser() {
  const { createdUser } = await createUserOrThrow(
    "verification-" + USER_NAME, 
    "verification-" + USER_EMAIL, 
    "verification-" + USER_PASSWORD
  );
  return createdUser;
}

async function useTokenInProtectedProcedure(token: string) {
  const protectedTRPCClient = getTRPCClient(token);
  const output = await protectedTRPCClient
                  .waitlist
                  .definition
                  .create
                  .mutate({ 
                    name: 'Test Email Password Verification', 
                    description: 'Email Password Verification Waitlist definition', 
                    status: 'ACTIVE' 
                  });
  console.info("\nOutput from protected procedure: ", JSON.stringify(output, null, 2));
  process.exit(0);
}
            
function main() {
  createPostVerifiedUser()
  .then(() => {
    getTokenSilently('Please enter your token (input will be hidden): ')
    .then((token) => {
        useTokenInProtectedProcedure(token.toString());
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      process.exit(1);
    });
  });
}

main();
