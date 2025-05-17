import * as dotenv from "dotenv";
import path from "path";
import { 
  acceptOrgInvitationOrThrow,
  createOrgOrThrow,
  createEmailUserOrThrow, 
  getAllSessionsOrThrow, 
  inviteUserToOrgOrThrow, 
  signInUserOrThrow,
  listOrgsOrThrow,
  truncateError
} from "../utils";

type Users = Awaited<ReturnType<typeof signInUserOrThrow>>["signedInUser"];
type OrgInvitationResult = Awaited<ReturnType<typeof inviteUserToOrgOrThrow>>;
type CreateOrgResult = Awaited<ReturnType<typeof createOrgOrThrow>>;

/**
 * Implementation of the OrganizationAuthClientInterface for GitHub-style organization auth
 */
export class GithubStyleOrganizationAuthClient {
  private contextData: {
    userA?: Users;
    userB?: Users;
    userC?: Users;
    orgs?: { firstOrg: CreateOrgResult, secondOrg: CreateOrgResult };
    invites?: { firstOrgInvite: OrgInvitationResult, secondOrgInvite: OrgInvitationResult };
  };
  private readonly OrgUsers: {
    A: { name: string; email: string; password: string };
    B: { name: string; email: string; password: string };
    C: { name: string; email: string; password: string };
  };
  private readonly Organizations: {
    First: { name: string; slug: string };
    Second: { name: string; slug: string };
  };
  private readonly TIMESTAMP: string = new Date().toISOString().replace(/[-:Z]/g, '');
  /**
   * Creates a new GithubStyleOrganizationAuthClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Initialize user data
    this.OrgUsers = {
      A: {
        name: `John Smith ` + this.TIMESTAMP,
        email: `admin_ajohn${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureA!${this.TIMESTAMP}`
      },
      B: {
        name: `Jane Doe` + this.TIMESTAMP,
        email: `bjane${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureB!${this.TIMESTAMP}`
      },
      C: {
        name: `Bob Wilson` + this.TIMESTAMP,
        email: `cbob${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureC!${this.TIMESTAMP}`
      }
    };

    // Initialize organizations
    this.Organizations = {
      First: {
        name: `Tech Team` + this.TIMESTAMP,
        slug: `tech-team-${this.TIMESTAMP}`
      },
      Second: {
        name: `Design Team` + this.TIMESTAMP,
        slug: `design-team-${this.TIMESTAMP}`
      }
    };

    // Initialize state
    this.contextData = {};
  }

  /**
   * Create multiple users for testing
   * @returns Promise with the created users
   */
  public createUsers() {
    console.log("\n1. Creating users A, B, and C...");
    
    // Handle User A first - create, verify, and promote to admin
    return createEmailUserOrThrow(this.OrgUsers.A.name, this.OrgUsers.A.email.toLowerCase(), this.OrgUsers.A.password)
      .then(() => {
        // Now create B and C
        return Promise.all([
          createEmailUserOrThrow(
            this.OrgUsers.B.name, 
            this.OrgUsers.B.email.toLowerCase(), 
            this.OrgUsers.B.password),
          createEmailUserOrThrow(
            this.OrgUsers.C.name, 
            this.OrgUsers.C.email.toLowerCase(), 
            this.OrgUsers.C.password)
        ]);
      });
  }

  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  public signInUsers() {
    return signInUserOrThrow(this.OrgUsers.A.email, this.OrgUsers.A.password)
      .then(userASession => {
        if (!userASession?.signedInUser?.data?.token) {
          throw new Error('Failed to get valid session token for User A');
        }
        this.contextData.userA = userASession.signedInUser;
        return userASession;
      });
  }

  /**
   * Create organizations
   * @returns Promise with the created organizations
   */
  public createOrganizations() {
    console.log("\n2. Creating organizations...");
    return createOrgOrThrow(
      this.contextData.userA!.data!.token, 
      this.Organizations.First.name, 
      this.Organizations.First.slug
    )
    .then(firstOrg => {
      return createOrgOrThrow(
        this.contextData.userA!.data!.token, 
        this.Organizations.Second.name, 
        this.Organizations.Second.slug
      )
      .then(secondOrg => {
        return { firstOrg, secondOrg };
      });
    })
    .then(orgs => {
      this.contextData.orgs = orgs;
      return orgs;
    });
  }

  /**
   * Invite users to organizations
   * @returns Promise with the invitation results
   */
  public inviteUsersToOrganizations() {
    console.log("\n3. Adding User B to both organizations...");
    
    return inviteUserToOrgOrThrow(
      this.contextData.userA!.data!.token, 
      this.OrgUsers.B.email.toLowerCase(), 
      "member", 
      this.contextData.orgs!.firstOrg.id
    )
    .then(firstOrgInvite => {
      return inviteUserToOrgOrThrow(
        this.contextData.userA!.data!.token, 
        this.OrgUsers.B.email.toLowerCase(), 
        "member", 
        this.contextData.orgs!.secondOrg.id
      )
      .then(secondOrgInvite => {
        const invites = { firstOrgInvite, secondOrgInvite };
        this.contextData.invites = invites;
        return invites;
      });
    });
  }

  /**
   * Accept organization invitations
   * @returns Promise with the acceptance results
   */
  public acceptInvitations() {
    console.log("\n4. User B accepting invitations...");
    
    return signInUserOrThrow(this.OrgUsers.B.email, this.OrgUsers.B.password)
      .then(userBSession => {
        if (!userBSession?.signedInUser?.data?.token) {
          throw new Error('Failed to get valid session token for User B');
        }
        this.contextData.userB = userBSession.signedInUser;
        
        return acceptOrgInvitationOrThrow(
          this.contextData.userB.data!.token, 
          this.contextData.invites!.firstOrgInvite.data.id
        )
        .then(firstAccept => {
          return acceptOrgInvitationOrThrow(
            String(userBSession?.signedInUser?.data?.token), 
            this.contextData.invites!.secondOrgInvite.data.id
          )
          .then(secondAccept => {
            return { firstAccept, secondAccept };
          });
        });
      });
  }

  /**
   * Test organization operations with different users
   * @returns Promise with the test results
   */
  public testOrganizationOperations() {
    console.log(`\n5-6. Testing organizational operations...`);
    
    // Test operations for User A
    return this.testOperationsForUser('A', this.contextData.userA!.data!.token)
      .then(() => {
        // Test operations for User B
        return this.testOperationsForUser('B', this.contextData.userB!.data!.token);
      })
      .then(() => {
        // Sign in as User C
        return signInUserOrThrow(this.OrgUsers.C.email, this.OrgUsers.C.password);
      })
      .then(userCSession => {
        if (!userCSession?.signedInUser?.data?.token) {
          throw new Error('Failed to get valid session token for User C');
        }
        this.contextData.userC = userCSession.signedInUser;
        // Test operations for User C
        return this.testOperationsForUser('C', this.contextData.userC!.data!.token);
      });
  }

  /**
   * Test operations for a specific user
   * @param userType User type (A, B, or C)
   * @param token User's token
   * @returns Promise with the test results
   */
  private testOperationsForUser(userType: string, token: string) {
    console.log(`\nTesting organizational operations for User ${userType}...`);
    
    try {
      return listOrgsOrThrow(token)
        .then(organizations => {
          console.log(`User ${userType}'s organizations: `, JSON.stringify(organizations, null, 2));
          return organizations;
        })
        .catch(error => {
          console.error(`Error listing organizations for User ${userType}:`, truncateError(error));
          throw error;
        });
    } catch (error) {
      console.error(`Error in testOperationsForUser for ${userType}:`, truncateError(error));
      throw error;
    }
  }

  /**
   * Create and list multiple user sessions
   * @returns Promise with the session results
   */
  public createMultipleSessionsAndList() {
    // Create multiple sessions for User A
    return this.createMultipleSessionsForUser('A', this.OrgUsers.A.email, this.OrgUsers.A.password)
      .then(() => {
        // Create multiple sessions for User B
        return this.createMultipleSessionsForUser('B', this.OrgUsers.B.email, this.OrgUsers.B.password);
      });
  }

  /**
   * Create multiple sessions for a specific user
   * @param userType User type (A or B)
   * @param email User's email
   * @param password User's password
   * @returns Promise with the session results
   */
  private createMultipleSessionsForUser(userType: string, email: string, password: string) {
    console.log(`\n7-8. Creating multiple sessions for User ${userType}...`);
    
    // Create three sessions
    return Promise.all([
      signInUserOrThrow(email, password),
      signInUserOrThrow(email, password),
      signInUserOrThrow(email, password)
    ])
    .then(sessions => {
      // List all sessions
      return getAllSessionsOrThrow(String(sessions[0]?.signedInUser?.data?.token))
        .then(allSessions => {
          console.log(`All sessions for User ${userType}:`, allSessions);
          return { sessions, allSessions };
        });
    });
  }

  /**
   * Execute the main client flow
   * Maintains the original .then() chain structure
   * @returns Promise that resolves when the flow completes
   */
  public execute(): Promise<JSON> {
    // Start the chain with user creation and verification
    const execution = this.createUsers()
      .then(() => {
        console.log("Users created and verified successfully");
        return this.signInUsers();
      })
      .then(() => {
        // Create organizations with User A
        return this.createOrganizations();
      })
      .then(() => {
        // Add User B to organizations
        return this.inviteUsersToOrganizations();
      })
      .then(() => {
        // Accept invitations as User B
        return this.acceptInvitations();
      })
      .then(() => {
        // Test operations for all users
        return this.testOrganizationOperations();
      })
      .then(() => {
        // Create multiple sessions and list them
        return this.createMultipleSessionsAndList();
      })
      .then(() => {
        console.log("\nGitHub-style organization auth test completed successfully!");
        return {
          users: {
            userA: this.contextData.userA?.data!,
            userB: this.contextData.userB?.data!,
            userC: this.contextData.userC?.data!
          },
          organizations: {
            first: this.contextData.orgs?.firstOrg.id,
            second: this.contextData.orgs?.secondOrg.id
          }
        };
      })
      .catch(error => {
        console.error("Error in main execution:", truncateError(error));
        throw error;
      });

      return JSON.parse(JSON.stringify(execution));
  }
} 