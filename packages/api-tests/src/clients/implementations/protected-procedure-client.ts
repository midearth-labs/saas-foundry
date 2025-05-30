import * as dotenv from "dotenv";
import path from "path";
import { ProtectedProcedureClientInterface } from "../interfaces/protected-procedure-client.interface";
import { 
  createEmailUserOrThrow, 
  signInUserOrThrow, 
  getTRPCClient,
  truncateError
} from "../utils";

/**
 * Implementation of the ProtectedProcedureClientInterface for testing protected procedures
 */
export class ProtectedProcedureClient implements ProtectedProcedureClientInterface {
  private contextData: {
    adminUser: { token: string } | null;
    regularUser: { token: string } | null;
    waitlistDefinitionID: { id: string };
  };
  private readonly Users: {
    Admin: { name: string; email: string; password: string };
    Regular: { name: string; email: string; password: string };
  };
  private readonly TIMESTAMP: string = new Date().toISOString().replace(/[-:Z]/g, '');
  /**
   * Creates a new ProtectedProcedureClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Initialize user data
    this.Users = {
      Admin: {
        name: `Admin User`,
        email: `admin_${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `AdminPass!${this.TIMESTAMP}`
      },
      Regular: {
        name: `Regular User`,
        email: `user_${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `UserPass!${this.TIMESTAMP}`
      }
    };

    // Initialize state
    this.contextData = {
      adminUser: null,
      regularUser: null,
      waitlistDefinitionID: { id: "" }
    };
  }

  /**
   * Create admin and regular users
   * @returns Promise with the created users
   */
  public createUsers() {
    // Step 1: Create both users
    return createEmailUserOrThrow(this.Users.Admin.name, this.Users.Admin.email, this.Users.Admin.password)
      .then(() => createEmailUserOrThrow(this.Users.Regular.name, this.Users.Regular.email, this.Users.Regular.password))
      .then(() => {
        console.log("\nBoth users created successfully");
      });
  }

  /**
   * Sign in users to get their tokens
   * @returns Promise with the signed in users
   */
  public signInUsers() {
    // Step 2: Sign in admin user
    return signInUserOrThrow(this.Users.Admin.email, this.Users.Admin.password)
      .then(({ signedInUser }) => {
        this.contextData.adminUser = { token: signedInUser.data!.token };
      })
      // Step 3: Sign in regular user
      .then(() => signInUserOrThrow(this.Users.Regular.email, this.Users.Regular.password))
      .then(({ signedInUser }) => {
        this.contextData.regularUser = { token: signedInUser.data!.token };
      });
  }

  /**
   * Test protected procedures with different authentication levels
   * @returns Promise with the test results
   */
  public testProtectedProcedures() {
    const adminTrpc = getTRPCClient(this.contextData.adminUser!.token);
    const regularTrpc = getTRPCClient(this.contextData.regularUser!.token);
    const unauthenticatedTrpc = getTRPCClient("");

    console.log("\nTesting waitlist definition creation...");
    
    // Step 5: Test waitlist definition creation with all clients
    return adminTrpc.waitlist.definition.create.mutate({ 
      name: 'Admin Created Waitlist', 
      description: 'Test waitlist definition by admin', 
      status: 'ACTIVE' 
    })
    .then(definition => {
      this.contextData.waitlistDefinitionID = definition;
      console.log("\nAdmin successfully created waitlist definition");
      
      // Regular user attempt (authenticated but not admin)
      return regularTrpc.waitlist.definition.create.mutate({ 
        name: 'Regular User Waitlist', 
        description: 'Should fail - authenticated but not admin', 
        status: 'ACTIVE' 
      })
      .catch(error => {
        console.log("\nRegular user (authenticated, non-admin) failed to create definition (expected):", 
          truncateError(error));
        return Promise.resolve(); // Continue to next attempt
      })
      .then((regValue) => {
        console.log("\nRegular user waitlist definition creation attempt:", regValue);
        // Unauthenticated attempt (not even logged in)
        return unauthenticatedTrpc.waitlist.definition.create.mutate({ 
          name: 'Unauthenticated Waitlist', 
          description: 'Should fail - not even authenticated', 
          status: 'ACTIVE' 
        })
        .catch(error => {
          console.log("\nUnauthenticated client failed to create definition (expected):", 
            truncateError(error));
          return Promise.resolve(); // Continue to next step
        });
      });
    })
    // Step 6: Test waitlist entry creation with all clients (should succeed)
    .then(() => {
      console.log("\nTesting waitlist entry creation...");
      return Promise.all([
        adminTrpc.waitlist.entry.create.mutate({
          definitionId: this.contextData.waitlistDefinitionID.id,
          email: `entry1_${this.TIMESTAMP}@example.com`
        }),
        regularTrpc.waitlist.entry.create.mutate({
          definitionId: this.contextData.waitlistDefinitionID.id,
          email: `entry2_${this.TIMESTAMP}@example.com`
        }),
        unauthenticatedTrpc.waitlist.entry.create.mutate({
          definitionId: this.contextData.waitlistDefinitionID.id,
          email: `entry3_${this.TIMESTAMP}@example.com`
        })
      ]);
    })
    .then(results => {
      console.log("\nAll clients successfully created waitlist entries:", 
        results.map(r => r.id));
      return results;
    });
  }

  /**
   * Execute the main client flow
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<JSON> {
    const execution = this.createUsers()
      .then(() => this.signInUsers())
      .then(() => this.testProtectedProcedures())
      .then(results => {
        console.log("\nProtected procedure client executed successfully!");
        return {
          users: {
            admin: this.contextData.adminUser,
            regular: this.contextData.regularUser
          },
          waitlistDefinition: this.contextData.waitlistDefinitionID,
          entries: results
        };
      })
      .catch(error => {
        console.error("\nFatal error in main execution:", truncateError(error));
        throw error;
      });

    return JSON.parse(JSON.stringify(execution));
  }
} 