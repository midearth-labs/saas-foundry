import { ClientFactory } from "../client-factory";

/**
 * Displays the usage instructions for this script
 */
function showUsage() {
  console.log(`
Usage: npm run client:standard -- <client-name>

Available clients:
  email-password             - Run the email-password authentication client
  google-social              - Run the Google social authentication client
  create-organization        - Run the organization creation client
  organization-invitation    - Run the organization invitation client
  verification-required-user - Run the verification required user client
  enhanced-waitlist          - Run the enhanced waitlist client
  protected-procedure        - Run the protected procedure client
  github-style-organization-auth - Run the GitHub-style organization auth client
  slack-style-organization-auth  - Run the Slack-style organization auth client
  organization-permissions      - Run the organization permissions client
  link-account                  - Run the account linking client

Example:
  npm run client -- email-password
`);
}

/**
 * Main function to run a client based on command-line arguments
 */
function main() {
  const clientName = process.argv[2];
  
  if (!clientName) {
    console.error("Error: No client name specified");
    showUsage();
    process.exit(1);
  }
  
  try {
    const client = ClientFactory.getClient(clientName);
    
    console.log(`Starting ${clientName} client...`);
    return client.execute()
      .then(() => {
        console.log(`\n${clientName} client executed successfully`);
        process.exit(0);
      })
      .catch(error => {
        console.error(`\nFailed to execute ${clientName} client:`, error);
        process.exit(1);
      });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    showUsage();
    process.exit(1);
  }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runClient }; 