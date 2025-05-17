import { EnhancedWaitlistClient } from "../implementations/enhanced-waitlist-client";

/**
 * Main function to run the enhanced waitlist client
 */
async function main() {
  const client = new EnhancedWaitlistClient();
  
  console.log("Starting enhanced waitlist flow...");
  try {
    await client.execute();
    // Handle successful execution
  } catch (error) {
    console.error("Failed to execute enhanced waitlist client:", error);
    process.exit(1);
  }
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runEnhancedWaitlistClient }; 