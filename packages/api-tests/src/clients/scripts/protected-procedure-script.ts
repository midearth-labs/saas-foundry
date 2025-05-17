import { ProtectedProcedureClient } from "../implementations/protected-procedure-client";

/**
 * Main function to run the protected procedure client
 */
async function main() {
  const client = new ProtectedProcedureClient();
  
  console.log("Starting protected procedure flow...");
  try {
    await client.execute();
  } catch(error) {
      console.error("Failed to execute protected procedure client:", error);
      process.exit(1);
  };
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runProtectedProcedureClient }; 