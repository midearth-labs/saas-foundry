import * as dotenv from "dotenv";
import path from "path";
import { SubscriptionWaitlistClientInterface } from "../interfaces/subscription-waitlist-client.interface";
import { 
  createUserOrThrow, 
  signInUserOrThrow,
  getTRPCClient,
  getAuthClient,
  getUserInput,
  truncateError
} from "../common/utils";
import { PRO_PLAN } from "@saas-foundry/api-model/auth/stripe/plans";

/**
 * Implementation of the SubscriptionWaitlistClientInterface for testing
 * subscription access control on endpoints
 */
export class SubscriptionWaitlistClient implements SubscriptionWaitlistClientInterface {
  private users: {
    regular: { token: string; id: string } | null;
    subscriber: { token: string; id: string } | null;
  };
  private subscription: any;
  private readonly Users: {
    Regular: { name: string; email: string; password: string };
    Subscriber: { name: string; email: string; password: string };
  };
  private readonly TIMESTAMP: string = new Date().toISOString().replace(/[-:Z]/g, '');

  /**
   * Creates a new SubscriptionWaitlistClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Initialize user data with timestamp to ensure uniqueness
    // Note: Subscriber user has admin_ prefix to get admin permissions
    this.Users = {
      Regular: {
        name: 'Regular User ' + this.TIMESTAMP,
        email: `regular_user_${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `RegularPass!${this.TIMESTAMP}`
      },
      Subscriber: {
        name: 'Admin Subscriber ' + this.TIMESTAMP,
        email: `admin_subscriber_${this.TIMESTAMP}@example.com`.toLowerCase(), // admin_ prefix grants admin permissions
        password: `SubscriberPass!${this.TIMESTAMP}`
      }
    };

    // Initialize state
    this.users = {
      regular: null,
      subscriber: null
    };
  }

  /**
   * Create users for testing
   * @returns Promise with the created users
   */
  public createUsers(): Promise<any> {
    console.log("\n1. Creating users...");
    return createUserOrThrow(this.Users.Regular.name, this.Users.Regular.email, this.Users.Regular.password)
      .then(() => createUserOrThrow(this.Users.Subscriber.name, this.Users.Subscriber.email, this.Users.Subscriber.password))
      .then(() => {
        console.log("\nAll users created successfully");
      });
  }

  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  public signInUsers(): Promise<any> {
    console.log("\n2. Signing in users...");
    return signInUserOrThrow(this.Users.Regular.email, this.Users.Regular.password)
      .then(({ signedInUser }) => {
        this.users.regular = { 
          token: signedInUser.data!.token,
          id: signedInUser.data!.user.id
        };
        console.log("\nRegular user signed in successfully");
      })
      .then(() => signInUserOrThrow(this.Users.Subscriber.email, this.Users.Subscriber.password))
      .then(({ signedInUser }) => {
        this.users.subscriber = { 
          token: signedInUser.data!.token,
          id: signedInUser.data!.user.id
        };
        console.log("\nAdmin subscriber user signed in successfully");
      });
  }

  /**
   * Set up a subscription for the paid user
   * @returns Promise with the subscription
   */
  public setupSubscription(): Promise<any> {
    console.log("\n3. Setting up subscription for admin subscriber user...");
    
    // Create an auth client instance with the Better-Auth Stripe client
    const [subscriberAuthClient, regularAuthClient] = [getAuthClient(), getAuthClient()];
    
    // Create a real subscription using the Better Auth Stripe client
    console.log("\nCreating Stripe subscription checkout for PRO plan...");
    
    return subscriberAuthClient.subscription.upgrade({
      plan: PRO_PLAN,
      successUrl: "http://localhost:3005/test/stripe-success",
      cancelUrl: "http://localhost:3005/test/stripe-cancel",
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${this.users.subscriber!.token}`
        }
      }
    })
    .then(response => {
      if (response.error) {
        console.error("\nFailed to create subscription checkout:", response.error);
        throw new Error(`Subscription upgrade failed: ${response.error.message}`);
      }
      
      if (!response.data || !response.data.url) {
        console.error("\nNo checkout URL returned from subscription upgrade");
        throw new Error("No checkout URL returned from subscription upgrade");
      }
      
      // Display the checkout URL for the user to visit
      console.log("\n------------------------------------------------------------");
      console.log("IMPORTANT: Please complete the subscription process by visiting this URL:", response.data.url);
      console.log("This is a Stripe test mode checkout - use test card 4242 4242 4242 4242");
      console.log("with any future expiry date and any CVC code.");
      console.log("\nSTEPS TO FOLLOW:");
      console.log("1. Open the URL in your browser");
      console.log("2. Complete the payment process with the test card");
      console.log("3. Return to this terminal window");
      console.log("4. Press Enter to continue with the test");
      console.log("------------------------------------------------------------");
      
      // Wait for user confirmation that they've completed the checkout
      return getUserInput("\nAfter completing the Stripe checkout in your browser, press Enter to continue...");
    })
    .then(() => {
      console.log("\nWaiting for subscription webhook processing (5 seconds)...");
      // Wait for webhook processing
      return new Promise(resolve => setTimeout(resolve, 5000));
    })
    .then(() => {
      // List active subscriptions to confirm
      return subscriberAuthClient.subscription.list({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${this.users.subscriber!.token}`
          }
        }
      });
    })
    .then(response => {
      if (response.error) {
        console.error("\nFailed to list subscriptions:", response.error);
        throw new Error(`Failed to list subscriptions: ${response.error.message}`);
      }
      console.log("\n======================SUBSCRIPTIONS==================\n", JSON.stringify(response.data, null, 2));
      console.log("\n=====================================================\n");
      
      // Log all subscription statuses for debugging
      if (response.data && response.data.length > 0) {
        console.log("\nAll subscription statuses:");
        response.data.forEach((sub, idx) => {
          console.log(`[${idx}] Plan: ${sub.plan}, Status: ${sub.status}, ID: ${sub.id}`);
        });
      }
      
      // Look for any subscription with the PRO plan, even if not fully active yet
      const anySubscription = response.data?.find(sub => sub.plan === PRO_PLAN);
      const activeSubscription = response.data?.find(sub => 
        (sub.status === "active" || sub.status === "trialing") && sub.plan === PRO_PLAN
      );
      
      if (activeSubscription) {
        console.log("\nActive subscription confirmed:", {
          plan: activeSubscription.plan,
          status: activeSubscription.status,
          periodEnd: activeSubscription.periodEnd
        });
        
        this.subscription = activeSubscription;
        return activeSubscription;
      } 
      else if (anySubscription) {
        console.log("\nFound subscription but not yet active:", {
          plan: anySubscription.plan,
          status: anySubscription.status
        });
        this.subscription = anySubscription;
        return anySubscription;
      }
      else {
        console.warn("\nWarning: No subscription found. The webhook might not have been processed yet.");
        console.warn("Will continue with script, but paid operations might fail.");
        
        // Return a placeholder subscription for the rest of the script
        const placeholderSubscription = {
          plan: PRO_PLAN,
          status: "active",
          userId: this.users.subscriber!.id
        };
        
        this.subscription = placeholderSubscription;
        return placeholderSubscription;
      }
    });
  }

  /**
   * Test subscription-protected endpoint access with both users
   * @returns Promise with the test results
   */
  public testWaitlistOperations(): Promise<any> {
    console.log("\n4. Testing subscription-protected endpoint access...");
    const regularTrpc = getTRPCClient(this.users.regular!.token);
    const subscriberTrpc = getTRPCClient(this.users.subscriber!.token);
    
    // Print current subscription status for debugging
    console.log("\nCurrent subscription status:", {
      plan: this.subscription?.plan,
      status: this.subscription?.status,
      id: this.subscription?.id
    });
    
    console.log("\nTesting subscription-protected dummy endpoint access:");
    
    // Both users attempt to access the subscription-protected endpoint
    return Promise.all([
      // Regular user tries to access subscription-protected endpoint (should fail)
      regularTrpc.waitlist.entry.subscriptionWaitlistDummy.query()
        .then(result => {
          console.log("\n⚠ UNEXPECTED: Regular user successfully accessed subscription-protected endpoint:", result);
          return { success: true, result };
        })
        .catch(error => {
          console.log("\n✓ EXPECTED: Regular user failed to access subscription-protected endpoint (expected):", truncateError(error));
          return { success: false, error: truncateError(error) };
        }),
        
      // Subscriber user tries to access subscription-protected endpoint (should succeed)
      subscriberTrpc.waitlist.entry.subscriptionWaitlistDummy.query()
        .then(result => {
          console.log("\n✓ SUCCESS: Subscriber successfully accessed subscription-protected endpoint:", result);
          return { success: true, result };
        })
        .catch(error => {
          console.log("\n⚠ UNEXPECTED: Subscriber failed to access subscription-protected endpoint:", truncateError(error));
          console.log("This might happen if the Stripe webhook hasn't been fully processed yet.");
          return { success: false, error: truncateError(error) };
        })
    ])
    .then(([regularResult, subscriberResult]) => {
      // Summary of test results
      console.log("\n---------------------------------------------");
      console.log("SUBSCRIPTION ENDPOINT ACCESS TEST RESULTS");
      console.log("---------------------------------------------");
      console.log("Regular user access:", regularResult.success ? "❌ UNEXPECTED SUCCESS" : "✓ EXPECTED FAILURE");
      console.log("Subscriber access:", subscriberResult.success ? "✓ EXPECTED SUCCESS" : "❌ UNEXPECTED FAILURE");
      console.log("---------------------------------------------");
      
      if (!subscriberResult.success) {
        console.log("\n⚠ NOTE: Subscriber couldn't access subscription-protected endpoint. This could be because:");
        console.log("  1. The Stripe webhook hasn't been fully processed yet");
        console.log("  2. There might be an issue with the subscription validation");
        console.log("  3. The endpoint might be misconfigured");
        
        // Try to refresh subscriptions one more time for diagnostic purposes
        console.log("\nRefreshing subscription status for diagnostics...");
        return getAuthClient().subscription.list({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${this.users.subscriber!.token}`
            }
          }
        })
        .then(response => {
          if (response.data && response.data.length > 0) {
            console.log("Latest subscription data:", JSON.stringify(response.data, null, 2));
          } else {
            console.log("No subscriptions found after refresh.");
          }
          return { regularResult, subscriberResult };
        })
        .catch(err => {
          console.error("Error refreshing subscriptions:", err);
          return { regularResult, subscriberResult };
        });
      }
      
      return { regularResult, subscriberResult };
    });
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<any> {
    return this.createUsers()
      .then(() => this.signInUsers())
      .then(() => this.setupSubscription())
      // Skip createWaitlistDefinition per requirements
      .then(() => this.testWaitlistOperations())
      .then(results => {
        console.log("\nSubscription validation test executed successfully!");
        return {
          users: this.users,
          subscription: this.subscription,
          results
        };
      })
      .catch(error => {
        console.error("\nError in subscription validation test:", truncateError(error));
        throw error;
      });
  }
} 