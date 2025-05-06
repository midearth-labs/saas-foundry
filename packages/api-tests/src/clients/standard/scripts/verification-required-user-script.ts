import { ClientFactory } from "../client-factory";

/**
 * Main function to run the verification required user client
 */
function main() {
  const client = ClientFactory.createVerificationRequiredUserClient();
  
  console.log("Starting verification required user creation flow...");
  return client.execute()
    .catch(error => {
      console.error("Failed to execute verification required user client:", error);
      process.exit(1);
    });
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runVerificationRequiredUserClient }; 