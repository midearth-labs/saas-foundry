import { SubscriptionWaitlistClient } from "../implementations/subscription-waitlist-client";

/**
 * Main function to run the subscription validation test client
 */
function main() {
  const client = new SubscriptionWaitlistClient();
  
  console.log("\n=====================================================");
  console.log("STRIPE BETTER AUTH PLUGIN TEST FOR SUBSCRIPTIONS & PAYMENT");
  console.warn(
    "!!! BEFORE RUNNING THIS SCRIPT IN LOCAL TEST MODE, YOU MUST: ",
    "\t1. REDIRECT WEBHOOKS TO LOCAL URL BY RUNNING: stripe listen --forward-to localhost:3005/api/auth/stripe/webhook",
    "\t2. SET STRIPE_PREFERENCE_USER_REGISTRATION=true IN .env",
    "\t3. SET AUTH_PREFERENCE_EMAIL_VERIFICATION=false IN .env",
  );
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
  console.log("4. Test subscription validation by accessing a protected endpoint:");
  console.log("   - Regular user should fail (no subscription)");
  console.log("   - Admin subscriber user should succeed (has subscription)");
  console.log("=====================================================\n");
  
  console.log("Starting subscription validation test...");
  return client.execute()
    .then(() => {
      console.log("\n=====================================================");
      console.log("SUBSCRIPTION VALIDATION TEST COMPLETED");
      console.log("=====================================================");
      console.log("The test has demonstrated:");
      console.log("✓ Subscription validation middleware is working correctly");
      console.log("✓ Regular users cannot access subscription-protected endpoints");
      console.log("✓ Users with active subscriptions can access protected endpoints");
      console.log("✓ Better Auth Stripe integration works correctly for endpoint protection");
      console.log("=====================================================\n");
    })
    .catch(error => {
      console.error("\n=====================================================");
      console.error("ERROR: Failed to execute subscription validation test");
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