import * as dotenv from "dotenv";
import path from "path";
import { 
  createUserOrThrow, 
  signInUserOrThrow,
  signInUnsuccessfully,
  getTRPCClient
} from '../utils';


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
  USER_NAME = process.env.USER_NAME || "James Bond",
  USER_EMAIL = process.env.USER_EMAIL || "james.bond@007.co.uk",
  USER_PASSWORD = process.env.USER_PASSWORD || "Shaken-N0t-St!rred"

async function main() {

  const { createdUser } = await createUserOrThrow(
    USER_NAME, 
    USER_EMAIL, 
    USER_PASSWORD
  );

  const { signedInUser } = await signInUserOrThrow(
    USER_EMAIL, 
    USER_PASSWORD
  );

  const { unsuccessfulUser } = await signInUnsuccessfully(
    USER_EMAIL, 
    USER_PASSWORD + "BAD"
  );

  const authenticatedTRPCClient = getTRPCClient(signedInUser.data!.token);
  const unauthenticatedTRPCClient = getTRPCClient(unsuccessfulUser?.data?.token ?? "");

  let authOutput = await authenticatedTRPCClient
    .waitlist
    .definition
    .create
    .mutate({ name: 'Test', description: 'Desc', status: 'ACTIVE' });

  let unauthOutput = await unauthenticatedTRPCClient
    .waitlist
    .definition
    .create
    .mutate({ name: 'Test2', description: 'Desc2', status: 'ACTIVE' });
  
  console.log("\nWaitlist procedures currently work with unauthenticated requests");
  console.log({authOutput, unauthOutput});

}

main();