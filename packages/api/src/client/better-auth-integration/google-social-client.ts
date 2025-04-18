import { 
  signInGoogleUserOrThrow, 
  getTRPCClient, 
  getTokenSilently,
} from "../utils";

async function signInViaGoogle() {
    await signInGoogleUserOrThrow();
}

async function useGoogleTokenInProtectedProcedure(token: string) {
  if (!token) {
    throw new Error("No token provided. Exiting.");
  }
  console.info(`Token received: ${token.slice(0,10)} ...[TRUNCATED]...\n`);
  const authenticatedTRPCClient = getTRPCClient(token);
  const output = await authenticatedTRPCClient
                  .waitlist
                  .definition
                  .list
                  .query();
    console.info("\nOutput from protected procedure: ", JSON.stringify(output, null, 2));
    process.exit(0);
}

function main() {
  signInViaGoogle()
  .then(() => {
    console.info("Google sign in URL was successfully generated. \nThere's currently no protected procedure that can be used to test the token for NOW.");
    // getTokenSilently('Please enter your token (input will be hidden): ')
    // .then((token) => { 
    //    useGoogleTokenInProtectedProcedure(token.toString());
    //})
    //.catch((error) => {
      //    console.error("An error occurred:", error);
      //    process.exit(1);
      //});
      process.exit(0);
  }).catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
  })
}

main();
