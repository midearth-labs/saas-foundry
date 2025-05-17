import { ClientFactory } from "../client-factory";

/**
 * Run the link account client
 */
async function main() {
  const client = ClientFactory.createLinkAccountClient();

  try {
    console.log("\nLink account client executed successfully");
    return client.execute();
  } catch (error) {
    console.error("\nFailed to execute link account client:", error);
    process.exit(1);
  }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}