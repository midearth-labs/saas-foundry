import * as dotenv from "dotenv";
import path from "path";
import { WaitlistEnhancedClientInterface } from "../interfaces/waitlist-enhanced-client.interface";
import { 
  createUserOrThrow, 
  signInUserOrThrow,
  getTRPCClient,
  setActiveOrganizationOrThrow,
  rand,
  createOrg,
  addOrgMember,
  truncateError
} from "../common/utils";

/**
 * Implementation of the WaitlistEnhancedClientInterface for testing waitlist with organization roles
 */
export class EnhancedWaitlistClient implements WaitlistEnhancedClientInterface {
  private users: {
    owner: { token: string; id: string } | null;
    admin: { token: string; id: string } | null;
    regular: { token: string; id: string } | null;
  };
  private organization: any;
  private waitlistDefinition: any;
  private waitlistEntries: any[];
  private readonly Users: {
    Owner: { name: string; email: string; password: string };
    Admin: { name: string; email: string; password: string };
    Regular: { name: string; email: string; password: string };
  };
  private readonly ORG_NAME: string;
  private readonly ORG_SLUG: string;

  /**
   * Creates a new EnhancedWaitlistClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Generate random identifiers for unique test users
    const randId = rand();
    
    // Initialize user data
    this.Users = {
      Owner: {
        name: 'Creator Owner',
        email: `admin_creator_owner_${randId}@example.com`.toLowerCase(),
        password: `CreatorPass!${randId}`
      },
      Admin: {
        name: `Admin User`,
        email: `admin_${randId}@example.com`.toLowerCase(),
        password: `AdminPass!${randId}`
      },
      Regular: {
        name: `Regular User`,
        email: `user_${randId}@example.com`.toLowerCase(),
        password: `UserPass!${randId}`
      }
    };

    // Organization details
    this.ORG_NAME = `Test Organization ${randId}`;
    this.ORG_SLUG = `test-org-${randId}`;

    // Initialize state
    this.users = {
      owner: null,
      admin: null,
      regular: null
    };
    this.organization = null;
    this.waitlistDefinition = null;
    this.waitlistEntries = [];
  }

  /**
   * Create multiple users with different roles
   * @returns Promise with the created users
   */
  public createUsers(): Promise<any> {
    console.log("\n1. Creating users...");
    return createUserOrThrow(this.Users.Owner.name, this.Users.Owner.email, this.Users.Owner.password)
      .then(() => createUserOrThrow(this.Users.Admin.name, this.Users.Admin.email, this.Users.Admin.password))
      .then(() => createUserOrThrow(this.Users.Regular.name, this.Users.Regular.email, this.Users.Regular.password))
      .then(() => {
        console.log("\nAll users created successfully");
      });
  }

  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  public signInUsers(): Promise<any> {
    return signInUserOrThrow(this.Users.Owner.email, this.Users.Owner.password)
      .then(({ signedInUser }) => {
        this.users.owner = { 
          token: signedInUser.data!.token,
          id: signedInUser.data!.user.id
        };
      })
      // Step 3: Sign in admin user
      .then(() => signInUserOrThrow(this.Users.Admin.email, this.Users.Admin.password))
      .then(({ signedInUser }) => {
        this.users.admin = { 
          token: signedInUser.data!.token,
          id: signedInUser.data!.user.id
        };
      })
      // Step 4: Sign in regular user
      .then(() => signInUserOrThrow(this.Users.Regular.email, this.Users.Regular.password))
      .then(({ signedInUser }) => {
        this.users.regular = { 
          token: signedInUser.data!.token,
          id: signedInUser.data!.user.id
        };
      });
  }

  /**
   * Create an organization and add members with roles
   * @returns Promise with the created organization
   */
  public setupOrganization(): Promise<any> {
    console.log("\n2. Creating organization...");
    return createOrg(this.users.owner!.token, this.ORG_NAME, this.ORG_SLUG)
      .then(org => {
        this.organization = org;
        
        // Set active organization for owner
        return setActiveOrganizationOrThrow(this.users.owner!.token, String(org?.id))
          .then(() => {
            // Add admin user to organization with adminRole
            return addOrgMember(
              this.users.owner!.token,
              this.users.admin!.id,
              String(org?.id),
              ["adminRole"]
            );
          })
          .then(() => {
            // Set active organization for admin
            return setActiveOrganizationOrThrow(this.users.admin!.token, String(org?.id));
          })
          .then(() => {
            // Add regular user to organization with memberRole
            return addOrgMember(
              this.users.owner!.token,
              this.users.regular!.id,
              String(org?.id),
              ["memberRole"]
            );
          })
          .then(() => {
            // Set active organization for regular user
            return setActiveOrganizationOrThrow(this.users.regular!.token, String(org?.id));
          });
      });
  }

  /**
   * Test waitlist definition and entry operations with different user roles
   * @returns Promise with the test results
   */
  public testWaitlistOperations(): Promise<any> {
    console.log("\n3. Creating TRPC clients and testing operations...");
    const adminTrpc = getTRPCClient(this.users.admin!.token);
    const regularTrpc = getTRPCClient(this.users.regular!.token);

    console.log("\nTesting waitlist definition creation...");
    
    // Step 7: Create a waitlist definition as admin
    return adminTrpc.waitlist.definition.create.mutate({ 
      name: 'Test Waitlist', 
      description: 'A test waitlist for feature testing', 
      status: 'ACTIVE',
      tier: 'BASIC'
    })
    .then(definition => {
      this.waitlistDefinition = definition;
      console.log("\nAdmin successfully created waitlist definition:", definition);
      
      // First test regular user operations (only entry creation)
      return regularTrpc.waitlist.entry.create.mutate({
        definitionId: definition.id,
        email: "test1@example.com"
      })
      .then(entry => {
        console.log("\nRegular user successfully created entry:", entry);
        
        // Now do admin operations with admin client
        return adminTrpc.waitlist.definition.getStats.query({ id: definition.id })
        .then(stats => {
          console.log("\nAdmin retrieved waitlist stats:", stats);
          // Continue with other admin operations...
        });
      });
    })
    // Step 8: Create multiple entries
    .then(() => {
      console.log("\nCreating multiple waitlist entries...");
      const entries = [
        { email: "test1@example.com" },
        { email: "test2@example.com" },
        { email: "test3@example.com" }
      ];

      return Promise.all(entries.map(entry => 
        regularTrpc.waitlist.entry.create.mutate({
          definitionId: this.waitlistDefinition.id,
          email: entry.email
        })
      ));
    })
    .then(entries => {
      this.waitlistEntries = entries;
      console.log("\nCreated waitlist entries:", entries.map(e => e.id));

      // Step 9: Get updated stats
      return adminTrpc.waitlist.definition.getStats.query({ id: this.waitlistDefinition.id })
      .then(stats => {
        console.log("\nUpdated waitlist stats:", stats);
      });
    })
    // Step 10: Test entry status updates
    .then(() => {
      console.log("\nTesting entry status updates...");
      const [entry1, entry2] = this.waitlistEntries;

      return Promise.all([
        // Approve first entry
        adminTrpc.waitlist.entry.updateStatus.mutate({
          entryId: { id: entry1.id },
          status: 'APPROVED',
        }),
        // Reject second entry
        adminTrpc.waitlist.entry.updateStatus.mutate({
          entryId: { id: entry2.id },
          status: 'REJECTED',
        })
      ]);
    })
    .then(([approved, rejected]) => {
      console.log("\nEntry status updates completed:", {
        approved: approved.status,
        rejected: rejected.status
      });

      // Step 11: Search entries with various filters
      return Promise.all([
        // Search approved entries
        adminTrpc.waitlist.entry.searchEntries.query({
          definitionId: this.waitlistDefinition.id,
          status: 'APPROVED',
          page: 1,
          limit: 10
        }),
        // Search rejected entries
        adminTrpc.waitlist.entry.searchEntries.query({
          definitionId: this.waitlistDefinition.id,
          status: 'REJECTED',
          page: 1,
          limit: 10
        }),
        // Search pending entries
        adminTrpc.waitlist.entry.searchEntries.query({
          definitionId: this.waitlistDefinition.id,
          status: 'PENDING',
          page: 1,
          limit: 10
        })
      ]);
    })
    .then(([approved, rejected, pending]) => {
      console.log("\nSearch results:", {
        approved: approved.entries.length,
        rejected: rejected.entries.length,
        pending: pending.entries.length
      });

      // Step 12: Get active count
      return adminTrpc.waitlist.definition.getActiveCount.query({ 
        id: this.waitlistDefinition.id 
      });
    })
    .then(activeCount => {
      console.log("\nActive count:", activeCount);

      // Step 13: Test regular user permissions
      console.log("\nTesting regular user permissions...");
      return Promise.all([
        // Try to update entry status (should fail)
        regularTrpc.waitlist.entry.updateStatus.mutate({
          entryId: { id: this.waitlistEntries[0].id },
          status: 'APPROVED'
        }).catch(error => {
          console.error("\nRegular user failed to update entry status (expected):", 
            truncateError(error));
          return null;
        }),
        // Try to get stats (should fail)
        regularTrpc.waitlist.definition.getStats.query({ 
          id: this.waitlistDefinition.id 
        }).catch(error => {
          console.error("\nRegular user failed to get stats (expected):", 
            truncateError(error));
          return null;
        })
      ]);
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
      .then(() => this.setupOrganization())
      .then(() => this.testWaitlistOperations())
      .then(() => {
        console.log("\nEnhanced waitlist client executed successfully!");
        return {
          users: this.users,
          organization: this.organization,
          waitlistDefinition: this.waitlistDefinition,
          waitlistEntries: this.waitlistEntries
        };
      })
      .catch(error => {
        console.error("\nError in enhanced waitlist client:", truncateError(error));
        throw error;
      });
  }
} 