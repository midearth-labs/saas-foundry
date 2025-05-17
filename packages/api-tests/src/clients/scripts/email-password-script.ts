import { ClientFactory } from "../client-factory";

/**
 * Main function to run the email-password client
 */
async function main() {
  const client = ClientFactory.createEmailPasswordClient();
  
  console.log("Starting email-password authentication flow...");
  try {
    await client.execute();
    // Handle successful execution
  } catch (error) {
    console.error("Failed to execute email-password client:", error);
    process.exit(1);
  }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runEmailPasswordClient }; 