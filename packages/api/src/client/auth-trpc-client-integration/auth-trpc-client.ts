import { 
  createUserOrThrow, 
  signInUserOrThrow,
  signInUnsuccessfully,
  getTRPCClient
} from './auth-trpc-utils';


const
  USER_NAME = "Oladipo Fasoro",
  USER_EMAIL = "dfasoro@gmail.com",
  USER_PASSWORD = "TheBestPassWordInTheUniverseNot"

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