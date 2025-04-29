import { SubscriptionWaitlistClient } from "../implementations/subscription-waitlist-client";

/**
 * Main function to run the subscription waitlist client
 */
function main() {
  const client = new SubscriptionWaitlistClient();
  
  console.log("\n=====================================================");
  console.log("SUBSCRIPTION WAITLIST TEST SCRIPT");
  console.log("=====================================================");
  console.log("This script will:");
  console.log("1. Create two test users:");
  console.log("   - Regular user (no admin permissions)");
  console.log("   - Admin subscriber user (with admin_ prefix for admin permissions)");
  console.log("2. Sign in both users");
  console.log("3. Set up a real Stripe subscription (test mode) for the admin subscriber user");
  console.log("   - The script will provide a URL to open in your browser");
  console.log("   - You'll need to complete the checkout process with the test card");
  console.log("   - Use test card 4242 4242 4242 4242 with any future expiry date and CVC");
  console.log("   - After completing the checkout, return to the terminal and press Enter");
  console.log("4. Create a waitlist definition (uses admin privileges)");
  console.log("5. Test regular waitlist entries with both users");
  console.log("6. Test paid waitlist entries (requires PRO subscription)");
  console.log("   - Regular user should fail (no subscription)");
  console.log("   - Admin subscriber user should succeed (has subscription)");
  console.log("=====================================================\n");
  
  console.log("Starting subscription waitlist flow...");
  return client.execute()
    .then(() => {
      console.log("\n=====================================================");
      console.log("SUBSCRIPTION WAITLIST TEST COMPLETED SUCCESSFULLY");
      console.log("=====================================================");
      console.log("The test has demonstrated:");
      console.log("✓ Regular users can create standard waitlist entries");
      console.log("✓ Admin users can create and manage waitlist definitions");
      console.log("✓ Only users with PRO subscription can create paid entries");
      console.log("✓ Better Auth Stripe integration works correctly");
      console.log("=====================================================\n");
    })
    .catch(error => {
      console.error("\n=====================================================");
      console.error("ERROR: Failed to execute subscription waitlist client");
      console.error(error);
      console.error("=====================================================\n");
      process.exit(1);
    });
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runSubscriptionWaitlistClient }; 