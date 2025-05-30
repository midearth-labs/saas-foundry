import * as dotenv from "dotenv";
import path from "path";
import { 
  acceptOrgInvitationOrThrow,
  createOrgOrThrow,
  createEmailUserOrThrow, 
  getAllSessionsOrThrow, 
  getSessionTokenOrThrow, 
  inviteUserToOrgOrThrow, 
  setActiveOrganizationOrThrow, 
  signInUserOrThrow,
  getUserInput,
  listOrgsOrThrow,
  truncateError
} from "../utils";

type OrgInvitationResult = Awaited<ReturnType<typeof inviteUserToOrgOrThrow>>;
type Users = Awaited<ReturnType<typeof signInUserOrThrow>>["signedInUser"];
type CreateOrgResult = Awaited<ReturnType<typeof createOrgOrThrow>>;

/**
 * Implementation of the OrganizationAuthClientInterface for Slack-style organization auth
 */
export class SlackStyleOrganizationAuthClient {
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
   * Creates a new SlackStyleOrganizationAuthClient
   */
  constructor() {
    // Load environment variables
    dotenv.config({
      path: path.resolve(process.cwd(), '.env')
    });

    // Initialize user data
    this.OrgUsers = {
      A: {
        name: `John Smith`,
        email: `admin_asmith${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureA!${this.TIMESTAMP}`
      },
      B: {
        name: `Jane Doe`,
        email: `jdoe${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureB!${this.TIMESTAMP}`
      },
      C: {
        name: `Bob Wilson`,
        email: `bwilson${this.TIMESTAMP}@example.com`.toLowerCase(),
        password: `SecureC!${this.TIMESTAMP}`
      }
    };

    // Initialize organizations
    this.Organizations = {
      First: {
        name: `Engineering Team`,
        slug: `eng-team-${this.TIMESTAMP}`
      },
      Second: {
        name: `Product Team`,
        slug: `prod-team-${this.TIMESTAMP}`
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
    
    return createEmailUserOrThrow(this.OrgUsers.A.name, this.OrgUsers.A.email, this.OrgUsers.A.password)
      .then(() => {
        return Promise.all([
          createEmailUserOrThrow(this.OrgUsers.B.name, this.OrgUsers.B.email, this.OrgUsers.B.password),
          createEmailUserOrThrow(this.OrgUsers.C.name, this.OrgUsers.C.email, this.OrgUsers.C.password)
        ]);
      });
  }

  /**
   * Sign in users and store their tokens
   * @returns Promise with the signed in users
   */
  public signInUsers() {
    console.log("\nSigning in User A...");
    return this.signInWithWorkspaceSelection(this.OrgUsers.A.email, this.OrgUsers.A.password)
      .then(userASession => {
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
    
    return createOrgOrThrow(this.contextData.userA!.data!.token, 
                           this.Organizations.First.name, 
                           this.Organizations.First.slug)
      .then(firstOrg => {
        return createOrgOrThrow(this.contextData.userA!.data!.token, 
                               this.Organizations.Second.name, 
                               this.Organizations.Second.slug)
          .then(secondOrg => {
            const orgs = { firstOrg, secondOrg };
            this.contextData.orgs = orgs;
            return orgs;
          });
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
      this.OrgUsers.B.email, 
      "member", 
      this.contextData.orgs!.firstOrg.id
    )
    .then(firstOrgInvite => {
      return inviteUserToOrgOrThrow(
        this.contextData.userA!.data!.token, 
        this.OrgUsers.B.email, 
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
    
    return this.signInWithWorkspaceSelection(this.OrgUsers.B.email, this.OrgUsers.B.password)
      .then(userBSession => {
        this.contextData.userB = userBSession.signedInUser;
        
        return acceptOrgInvitationOrThrow(
          this.contextData.userB!.data!.token, 
          this.contextData.invites!.firstOrgInvite.data.id
        )
        .then(firstAccept => {
          return acceptOrgInvitationOrThrow(
            this.contextData.userB!.data!.token, 
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
    console.log(`\nTesting workspace operations...`);
    
    // Test User A operations in their workspace context
    return this.testWorkspaceOperations('A', this.contextData.userA!.data!.token)
      .then(() => {
        // Test User B operations in their workspace context
        return this.testWorkspaceOperations('B', this.contextData.userB!.data!.token);
      })
      .then(() => {
        // Sign in User C and test (should only see personal workspace)
        return this.signInWithWorkspaceSelection(this.OrgUsers.C.email, this.OrgUsers.C.password);
      })
      .then(userCSession => {
        this.contextData.userC = userCSession.signedInUser;
        return this.testWorkspaceOperations('C', userCSession.signedInUser.data.token);
      });
  }

  /**
   * Create and list multiple user sessions
   * @returns Promise with the session results
   */
  public createMultipleSessionsAndList() {
    // Test workspace switching for User B
    console.log("\nTesting workspace switching for User B...");
    return this.selectWorkspace(this.contextData.userB!.data!.token)
      .then(newOrgId => 
        this.setActiveOrganization(this.contextData.userB!.data!.token, newOrgId)
      );
  }

  /**
   * Select a workspace
   * @param token User's token
   * @returns Promise with the selected organization ID
   */
  public selectWorkspace(token: string): Promise<string | null> {
    try {
      // Ensure the request is being made for EXACT intended user by explicit authentication
      return getSessionTokenOrThrow(token)
        .then(() => listOrgsOrThrow(token))
        .then(orgs => {
          console.log("organizations found:\n", JSON.stringify(orgs, null, 2));

          if (!orgs || orgs.length === 0) {
            console.log("\nNo organizations available. Using personal workspace.");
            return null;
          }

          console.log("\nAvailable workspaces:");
          orgs.forEach((org, index) => {
            console.log(`${index + 1}. ${org.name} (${org.slug})`);
          });
          console.log("0. Personal workspace");

          return getUserInput("\nSelect workspace (enter number): ")
            .then(selection => {
              const choice = parseInt(selection);

              if (choice === 0) return null;
              if (choice > 0 && choice <= orgs.length) {
                return orgs[choice - 1].id;
              }

              throw new Error("Invalid selection");
            });
        })
        .catch(error => {
          console.error("Error selecting workspace:", truncateError(error));
          return null;
        });
    } catch (error) {
      console.error("Error in selectWorkspace:", truncateError(error));
      return Promise.resolve(null);
    }
  }

  /**
   * Set active organization for a user
   * @param token User's token
   * @param organizationId Organization ID
   * @returns Promise with the result
   */
  public setActiveOrganization(token: string, organizationId: string | null) {
    return this.setActiveOrganizationForAllSessions(token, organizationId);
  }

  /**
   * Test workspace operations
   * @param userType User type (A, B or C)
   * @param token User's token
   * @returns Promise with the test results
   */
  private testWorkspaceOperations(userType: string, token: string) {
    console.log(`\nTesting workspace operations for User ${userType}...`);
    
    try {
      // Get current workspace context and available organizations
      return listOrgsOrThrow(token)
        .then(orgs => {
          console.log(`Available organizations for User ${userType}:`, 
            JSON.stringify(orgs, null, 2));
          return orgs;
        })
        .catch(error => {
          console.error(`Error in workspace operations for User ${userType}:`, truncateError(error));
          throw error;
        });
    } catch (error) {
      console.error(`Error in testWorkspaceOperations for ${userType}:`, truncateError(error));
      throw error;
    }
  }

  /**
   * Set active organization for all user sessions
   * @param token User's token
   * @param organizationId Organization ID
   * @returns Promise with the result
   */
  private setActiveOrganizationForAllSessions(token: string, organizationId: string | null) {
    try {
      // First, list all sessions
      return getAllSessionsOrThrow(token)
        .then(sessions => {
          // Set active organization for each session
          return Promise.all((sessions?.data ?? []).map(async session => {
            if (organizationId) {
              return setActiveOrganizationOrThrow(session.token, String(organizationId));
            }
            return Promise.resolve();
          }))
          .then(async () => {
            // Fetch updated sessions
            return getAllSessionsOrThrow(token)
              .then(updatedSessions => {
                console.log(`\nSet active organization ${organizationId || 'personal workspace'} for all sessions:\n\t`);
                console.info(updatedSessions.data);
                return updatedSessions;
              });
          });
        });
    } catch (error) {
      console.error("Error setting active organization:\n", truncateError(error));
      return Promise.reject(error);
    }
  }

  /**
   * Enhanced sign in with workspace selection
   * @param email User email
   * @param password User password
   * @returns Promise with the signed in user and active organization ID
   */
  private signInWithWorkspaceSelection(email: string, password: string){
    return signInUserOrThrow(email, password)
      .then(({ signedInUser }) => {
        if (!signedInUser?.data?.token) {
          throw new Error('Failed to get valid session token');
        }

        return this.selectWorkspace(signedInUser.data.token)
          .then(selectedOrgId => {
            return this.setActiveOrganizationForAllSessions(signedInUser.data.token, selectedOrgId)
              .then(() => {
                return { signedInUser, activeOrganizationId: selectedOrgId };
              });
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
        console.log("\nUsers created and verified successfully");
        return this.signInUsers();
      })
      .then(() => {
        return this.createOrganizations();
      })
      .then(() => {
        return this.inviteUsersToOrganizations();
      })
      .then(() => {
        return this.acceptInvitations();
      })
      .then(() => {
        return this.testOrganizationOperations();
      })
      .then(() => {
        return this.createMultipleSessionsAndList();
      })
      .then(() => {
        console.log("\nSlack-style organization auth test completed successfully!");
        return {
          users: {
            userA: this.contextData.userA,
            userB: this.contextData.userB,
            userC: this.contextData.userC
          },
          organizations: this.contextData.orgs
        };
      })
      .catch(error => {
        console.error("Error in main execution:", truncateError(error));
        throw error;
      });

      return JSON.parse(JSON.stringify(execution));
  }
} 