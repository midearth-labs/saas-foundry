import { ClientFactory } from "../client-factory";

/**
 * Main function to run the organization invitation client
 */
function main() {
  const client = ClientFactory.createOrganizationInvitationClient();
  
  console.log("Starting organization invitation flow...");
  return client.execute()
    .catch(error => {
      console.error("Failed to execute organization invitation client:", error);
      process.exit(1);
    });
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runOrganizationInvitationClient }; 