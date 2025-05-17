import { ClientFactory } from "../client-factory";

/**
 * Run the organization permissions client
 */
async function main() {
  const client = ClientFactory.createOrganizationPermissionsClient();

  try {
    await client.execute();
    console.log("\nOrganization permissions client executed successfully");
    process.exit(0);
  } catch (error) {
      console.error("\nFailed to execute organization permissions client:", error);
      process.exit(1);
    }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}
