import { ClientFactory } from "../client-factory";

/**
 * Run the organization permissions client
 */
const client = ClientFactory.createOrganizationPermissionsClient();

client.execute()
  .then(() => {
    console.log("\nOrganization permissions client executed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("\nFailed to execute organization permissions client:", error);
    process.exit(1);
  }); 