import { ClientFactory } from "../client-factory";

/**
 * Main function to run the Google social client
 */
function main() {
  const client = ClientFactory.createGoogleSocialClient();
  
  console.log("Starting Google social authentication flow...");
  return client.execute()
    .catch(error => {
      console.error("Failed to execute Google social client:", error);
      process.exit(1);
    });
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runGoogleSocialClient }; 