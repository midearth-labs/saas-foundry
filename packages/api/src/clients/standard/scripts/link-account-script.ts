import { ClientFactory } from "../client-factory";

/**
 * Run the link account client
 */
const client = ClientFactory.createLinkAccountClient();

client.execute()
  .then(() => {
    console.log("\nLink account client executed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("\nFailed to execute link account client:", error);
    process.exit(1);
  }); 