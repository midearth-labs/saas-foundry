import { ClientFactory } from "../client-factory";

/**
 * Main function to run the create organization client
 */
async function main() {
  const client = ClientFactory.createOrganizationClient();
  
  console.log("Starting organization creation flow...");
  try {
    await client.execute();
    // Handle successful execution
  } catch (error) {
    console.error("Failed to execute create organization client:", error);
    process.exit(1);
  }

}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runCreateOrganizationClient };
