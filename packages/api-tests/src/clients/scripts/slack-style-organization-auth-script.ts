import { SlackStyleOrganizationAuthClient } from "../implementations/slack-style-organization-auth-client";

/**
 * Main function to run the Slack-style organization auth client
 */
async function main() {
  const client = new SlackStyleOrganizationAuthClient();
  
  console.log("Starting Slack-style organization auth flow...");
  try {
    await client.execute();
  } catch (error) {
    console.error("Failed to execute Slack-style organization auth client:", error);
    process.exit(1);
  }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runSlackStyleOrganizationAuthClient }; 
