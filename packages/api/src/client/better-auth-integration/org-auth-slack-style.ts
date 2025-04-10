import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    promoteUserToAdminOrThrow,
} from '../utils';
import readline from 'readline';
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";
import { listOrgs } from "../../auth"; 

// Initialize auth client with organization plugin
const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
    plugins: [
        adminClient(),
        organizationClient(),
    ]
});

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate random 3-digit number
const rand = () => Math.floor(Math.random() * 900 + 100);

// Generate unique but readable credentials
const Users = {
    A: {
        name: `John Smith`,
        email: `asmith${rand()}@example.com`.toLowerCase(),
        password: `SecureA!${rand()}`
    },
    B: {
        name: `Jane Doe`,
        email: `jdoe${rand()}@example.com`.toLowerCase(),
        password: `SecureB!${rand()}`
    },
    C: {
        name: `Bob Wilson`,
        email: `bwilson${rand()}@example.com`.toLowerCase(),
        password: `SecureC!${rand()}`
    }
};

const Organizations = {
    First: {
        name: `Engineering Team`,
        slug: `eng-team-${rand()}`
    },
    Second: {
        name: `Product Team`,
        slug: `prod-team-${rand()}`
    }
};

// Utility to get user input
const getUserInput = async (prompt: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Wait for verification utility
const waitForVerification = async (email: string) => {
    console.log(`\nPlease verify the email for ${email} and press any key to continue...`);
    return new Promise<boolean>((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        process.stdin.once('data', () => {
            rl.close();
            resolve(true);
        });
    });
};

// Workspace selection utility
const selectWorkspace = async (token: string): Promise<string | null> => {
    try {
        // Ensure the request is being made for EXACT intended user by explicit authentication
        await authClient.getSession({
            fetchOptions: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });

        const orgs = await listOrgs(token);
        console.log("organizations found:\n", JSON.stringify(orgs, null, 2));

        if (!orgs || orgs.length === 0) {
            console.log("\nNo organizations available. Using personal workspace.");
            return null;
        }

        console.log("\nAvailable workspaces:");
        orgs.forEach((org, index) => {
            console.log(`${index + 1}. ${org.slug} (${org.slug})`);
        });
        console.log("0. Personal workspace");

        const selection = await getUserInput("\nSelect workspace (enter number): ");
        const choice = parseInt(selection);

        if (choice === 0) return null;
        if (choice > 0 && choice <= orgs.length) {
            return orgs[choice - 1].id;
        }

        throw new Error("Invalid selection");
    } catch (error) {
        console.error("Error selecting workspace:", error);
        return null;
    }
};

// Set active organization for all user sessions to impose singular global workspace context like Slack
const setActiveOrganizationForAllSessions = async (token: string, organizationId: string | null) => {
    try {
        // First, list all sessions
        let sessions = await authClient.listSessions({
            fetchOptions: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });

        // Set active organization for each session
        await Promise.all((sessions?.data ?? []).map(session => 
            authClient.organization.setActive({
                organizationId,
                fetchOptions: {
                    headers: { Authorization: `Bearer ${session.token}` }
                }
            })
        )).then(async () => {
            // Fetch updated sessions
            sessions = await authClient.listSessions({
                fetchOptions: {
                    headers: { Authorization: `Bearer ${token}` }
                }
            });
            console.log(`\nSet active organization ${organizationId || 'personal workspace'} for all sessions:\n\t`);
            console.info(sessions.data);
        });
    } catch (error) {
        console.error("Error setting active organization:\n", error);
    }
};

// Enhanced sign in with workspace selection
const signInWithWorkspaceSelection = async (email: string, password: string) => {
    const { signedInUser } = await signInUserOrThrow(email, password);
    if (!signedInUser?.data?.token) {
        throw new Error('Failed to get valid session token');
    }

    const selectedOrgId = await selectWorkspace(signedInUser.data.token);
    await setActiveOrganizationForAllSessions(signedInUser.data.token, selectedOrgId);

    return { signedInUser, activeOrganizationId: selectedOrgId };
};

// Step 1: Create and verify all users
const createAndVerifyUsers = async () => {
    console.log("\n1. Creating users A, B, and C...");
    
    return createUserOrThrow(Users.A.name, Users.A.email, Users.A.password)
        .then(() => waitForVerification(Users.A.email))
        .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
        .then(() => promoteUserToAdminOrThrow(Users.A.email))
        .then(() => {
            return Promise.all([
                createUserOrThrow(Users.B.name, Users.B.email, Users.B.password),
                createUserOrThrow(Users.C.name, Users.C.email, Users.C.password)
            ]);
        })
        .then(() => Promise.all([
            waitForVerification(Users.B.email),
            waitForVerification(Users.C.email)
        ]));
};

// Step 2: Create organizations with User A
const createOrganizations = async (token: string) => {
    console.log("\n2. Creating organizations...");
    
    const firstOrg = await authClient.organization.create({
        name: Organizations.First.name,
        slug: Organizations.First.slug,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    const secondOrg = await authClient.organization.create({
        name: Organizations.Second.name,
        slug: Organizations.Second.slug,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    return { firstOrg, secondOrg };
};

// Step 3: Add User B to both organizations
const addUserBToOrganizations = async (token: string, orgs: any) => {
    console.log("\n3. Adding User B to both organizations...");
    
    const firstOrgInvite = await authClient.organization.inviteMember({
        email: Users.B.email,
        role: "member",
        organizationId: orgs.firstOrg.data.id,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    const secondOrgInvite = await authClient.organization.inviteMember({
        email: Users.B.email,
        role: "member",
        organizationId: orgs.secondOrg.data.id,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    return { firstOrgInvite, secondOrgInvite };
};

// Step 4: Accept invitations as User B
const acceptInvitations = async (token: string, invites: any) => {
    console.log("\n4. User B accepting invitations...");
    
    const firstAccept = await authClient.organization.acceptInvitation({
        invitationId: invites.firstOrgInvite.data.id,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    const secondAccept = await authClient.organization.acceptInvitation({
        invitationId: invites.secondOrgInvite.data.id,
        fetchOptions: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });

    return { firstAccept, secondAccept };
};

// Test organizational operations in current workspace context
const testWorkspaceOperations = async (userType: string, token: string) => {
    console.log(`\nTesting workspace operations for User ${userType}...`);
    
    try {
        // Get current workspace context
        const activeOrg = await authClient.useActiveOrganization.get();

        console.log(`Current workspace context for User ${userType}:\n`, 
            activeOrg.data ? activeOrg.data.name : "Personal workspace");

        // Test some operations
        const orgs = authClient.useListOrganizations.get()

        console.log(`Available organizations for User ${userType}:`, 
            JSON.stringify(orgs.data, null, 2));

        return { activeOrg, orgs };
    } catch (error) {
        console.error(`Error in workspace operations for User ${userType}:`, error);
        throw error;
    }
};

// Main execution flow
function main() {
    let contextData: {
        userA: { signedInUser: any; activeOrganizationId: string | null } | null;
        userB: { signedInUser: any; activeOrganizationId: string | null } | null;
        userC: { signedInUser: any; activeOrganizationId: string | null } | null;
        orgs: any | null;
        invites: any | null;
    } = {
        userA: null,
        userB: null,
        userC: null,
        orgs: null,
        invites: null
    };

    // Start the chain with user creation and verification
    return createAndVerifyUsers()
        .then(() => {
            console.log("\nUsers created and verified successfully");
            return signInWithWorkspaceSelection(Users.A.email, Users.A.password);
        })
        .then(userASession => {
            contextData.userA = userASession;
            return createOrganizations(userASession.signedInUser.data.token);
        })
        .then(orgs => {
            contextData.orgs = orgs;
            return addUserBToOrganizations(contextData.userA!.signedInUser.data.token, orgs);
        })
        .then(invites => {
            contextData.invites = invites;
            return signInWithWorkspaceSelection(Users.B.email, Users.B.password);
        })
        .then(userBSession => {
            contextData.userB = userBSession;
            return acceptInvitations(userBSession.signedInUser.data.token, contextData.invites);
        })
        .then(() => {
            // Test User A operations in their workspace context
            return testWorkspaceOperations('A', contextData.userA!.signedInUser.data.token);
        })
        .then(() => {
            // Test User B operations in their workspace context
            return testWorkspaceOperations('B', contextData.userB!.signedInUser.data.token);
        })
        .then(() => {
            // Sign in User C and test (should only see personal workspace)
            return signInWithWorkspaceSelection(Users.C.email, Users.C.password);
        })
        .then(userCSession => {
            contextData.userC = userCSession;
            return testWorkspaceOperations('C', userCSession.signedInUser.data.token);
        })
        .then(() => {
            // Test workspace switching for User B
            console.log("\nTesting workspace switching for User B...");
            return selectWorkspace(contextData.userB!.signedInUser.data.token)
                .then(newOrgId => 
                    setActiveOrganizationForAllSessions(
                        contextData.userB!.signedInUser.data.token, 
                        newOrgId
                    )
                );
        })
        .then(() => {
            console.log("\nSlack-style organization auth test completed successfully!");
        })
        .catch(error => {
            console.error("Error in main execution:", error);
            process.exit(1);
        });
}

// Execute
main();

export { main as testSlackOrganizationalAuth };