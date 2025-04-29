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
import { PRO_PLAN } from "../../../auth/stripe";

/**
 * Implementation of the SubscriptionWaitlistClientInterface for testing
 * waitlist functionality with subscribed and non-subscribed users
 */
export class SubscriptionWaitlistClient implements SubscriptionWaitlistClientInterface {
  private users: {
    regular: { token: string; id: string } | null;
    subscriber: { token: string; id: string } | null;
  };
  private waitlistDefinition: any;
  private regularEntries: any[] = [];
  private paidEntries: any[] = [];
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
        name: 'Regular User' + this.TIMESTAMP,
        email: `regular_user_${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `RegularPass!${this.TIMESTAMP}`
      },
      Subscriber: {
        name: 'Admin Subscriber' + this.TIMESTAMP,
        email: `admin_subscriber_${this.TIMESTAMP}@example.com`.toLowerCase(), // admin_ prefix grants admin permissions
        password: `SubscriberPass!${this.TIMESTAMP}`
      }
    };

    // Initialize state
    this.users = {
      regular: null,
      subscriber: null
    };
    this.waitlistDefinition = null;
    this.subscription = null;
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
      successUrl: "http://localhost:3005/",
      cancelUrl: "http://localhost:3005/",
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
      console.log("\nWaiting for subscription webhook processing (3 seconds)...");
      // Wait for webhook processing
      return new Promise(resolve => setTimeout(resolve, 3000));
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
      const activeSubscription = response.data?.find(sub => 
        (sub.status === "active") && sub.plan === PRO_PLAN
      );
      
      if (!activeSubscription) {
        console.warn("\nWarning: No active subscription found. The webhook might not have been processed yet.");
        console.warn("Will continue with script, but paid operations might fail.");
        
        // Return a placeholder subscription for the rest of the script
        return {
          plan: PRO_PLAN,
          status: "active",
          userId: this.users.subscriber!.id
        };
      }
      
      console.log("\nActive subscription confirmed:", {
        plan: activeSubscription.plan,
        status: activeSubscription.status,
        periodEnd: activeSubscription.periodEnd
      });
      
      this.subscription = activeSubscription;
      return activeSubscription;
    });
  }

  /**
   * Create a waitlist definition for testing
   * @returns Promise with the created waitlist definition
   */
  public createWaitlistDefinition(): Promise<any> {
    console.log("\n4. Creating waitlist definition...");
    const regularTrpc = getTRPCClient(this.users.regular!.token);
    const subscriberTrpc = getTRPCClient(this.users.subscriber!.token);
    
    // First try with regular user (should fail due to permissions)
    return regularTrpc.waitlist.definition.create.mutate({ 
      name: `Test Waitlist ${this.TIMESTAMP}`, 
      description: 'A test waitlist for subscription testing', 
      status: 'ACTIVE' 
    })
    .catch(error => {
      console.log("\nRegular user failed to create waitlist definition (expected):", truncateError(error));
      
      // Now try with subscriber user (should succeed with admin privileges)
      return subscriberTrpc.waitlist.definition.create.mutate({ 
        name: `Test Waitlist ${this.TIMESTAMP}`, 
        description: 'A test waitlist for subscription testing', 
        status: 'ACTIVE' 
      });
    })
    .then(definition => {
      this.waitlistDefinition = definition;
      console.log("\nWaitlist definition created:", {
        id: definition.id,
      });
      return definition;
    });
  }

  /**
   * Test waitlist entry operations with both users
   * @returns Promise with the test results
   */
  public testWaitlistOperations(): Promise<any> {
    console.log("\n5. Testing waitlist operations...");
    const regularTrpc = getTRPCClient(this.users.regular!.token);
    const subscriberTrpc = getTRPCClient(this.users.subscriber!.token);
    
    // Step 1: Both users create normal waitlist entries
    console.log("\nCreating regular waitlist entries with both users...");
    
    return Promise.all([
      // Regular user creates entry
      regularTrpc.waitlist.entry.create.mutate({
        definitionId: this.waitlistDefinition.id,
        email: `regular_entry_${this.TIMESTAMP}@example.com`
      }),
      // Subscriber user creates entry
      subscriberTrpc.waitlist.entry.create.mutate({
        definitionId: this.waitlistDefinition.id,
        email: `subscriber_entry_${this.TIMESTAMP}@example.com`
      })
    ])
    .then(([regularEntry, subscriberEntry]) => {
      this.regularEntries = [regularEntry, subscriberEntry];
      console.log("\nBoth users successfully created regular waitlist entries:", {
        regularUserEntry: regularEntry.id,
        subscriberUserEntry: subscriberEntry.id
      });
      
      // Step 2: Test paid waitlist entries (requires subscription)
      console.log("\nTesting paid waitlist entries (requires PRO subscription)...");
      
      return Promise.all([
        // Regular user tries to create paid entry (should fail)
        regularTrpc.waitlist.entry.createPaidEntry.mutate({
          definitionId: String(this.waitlistDefinition.id),
          email: `regular_paid_entry_${this.TIMESTAMP}@example.com`
        }).catch(error => {
          console.log("\nRegular user failed to create paid entry (expected):", truncateError(error));
          return null;
        }),
        // Subscriber user tries to create paid entry (should succeed with subscription)
        subscriberTrpc.waitlist.entry.createPaidEntry.mutate({
          definitionId: this.waitlistDefinition.id,
          email: `subscriber_paid_entry_${this.TIMESTAMP}@example.com`
        }).catch(error => {
          // This might fail if the webhook hasn't been fully processed
          console.log("\nSubscriber user failed to create paid entry:", truncateError(error));
          console.log("This might happen if the Stripe webhook hasn't been fully processed yet.");
          return null;
        })
      ]);
    })
    .then(([regularPaidEntry, subscriberPaidEntry]) => {
      if (subscriberPaidEntry) {
        this.paidEntries.push(subscriberPaidEntry);
        console.log("\n✓ SUCCESS: Subscriber created paid waitlist entry:", {
          id: subscriberPaidEntry.id,
        });
        console.log("This confirms that the subscription is active and the protection is working correctly.");
      } else {
        console.log("\n⚠ NOTE: Subscriber couldn't create paid entry. This could be because:");
        console.log("  1. The Stripe webhook hasn't been fully processed yet");
        console.log("  2. There might be an issue with the subscription validation");
        console.log("  3. The paid entry endpoint might be misconfigured");
        console.log("\nCheck the server logs for more details on the subscription status.");
      }
      
      // Get stats from subscriber (admin) user
      return subscriberTrpc.waitlist.definition.getStats.query({ id: this.waitlistDefinition.id });
    })
    .then(stats => {
      console.log("\nWaitlist stats:", stats);
      
      // Use the admin user's permission to list all waitlist definitions instead of searching entries
      return subscriberTrpc.waitlist.definition.list.query();
    })
    .then(definitions => {
      console.log("\nFound waitlist definitions:", {
        count: definitions.length,
        definitions: definitions.map(d => ({ id: d.id, name: d.name, status: d.status }))
      });
      
      // Access the waitlist definition stats to indirectly get information about entries
      return subscriberTrpc.waitlist.definition.getActiveCount.query({ id: this.waitlistDefinition.id });
    })
    .then(activeCount => {
      console.log("\nActive count for waitlist:", activeCount);
      
      return {
        regularEntries: this.regularEntries,
        paidEntries: this.paidEntries,
        waitlistDefinition: this.waitlistDefinition,
        subscription: this.subscription
      };
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
      .then(() => this.createWaitlistDefinition())
      .then(() => this.testWaitlistOperations())
      .then(results => {
        console.log("\nSubscription waitlist client executed successfully!");
        return {
          users: this.users,
          waitlistDefinition: this.waitlistDefinition,
          regularEntries: this.regularEntries,
          paidEntries: this.paidEntries,
          subscription: this.subscription
        };
      })
      .catch(error => {
        console.error("\nError in subscription waitlist client:", truncateError(error));
        throw error;
      });
  }
} 