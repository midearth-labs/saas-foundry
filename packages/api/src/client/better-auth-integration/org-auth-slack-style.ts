import * as dotenv from "dotenv";
import path from "path";
import { 
    acceptOrgInvitationOrThrow,
    createOrgOrThrow,
    createUserOrThrow, 
    getActiveOrganization, 
    getAllSessionsOrThrow, 
    getSessionTokenOrThrow, 
    inviteUserToOrgOrThrow, 
    setActiveOrganizationOrThrow, 
    signInUserOrThrow,
    getUserInput,
} from '../utils';
import { listOrgs } from "../../auth"; 


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
        email: `admin_asmith${rand()}@example.com`.toLowerCase(),
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

// Workspace selection utility
const selectWorkspace = async (token: string): Promise<string | null> => {
    try {
        // Ensure the request is being made for EXACT intended user by explicit authentication
        await getSessionTokenOrThrow(token);

        const orgs = await listOrgs(token);
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
        let sessions = await getAllSessionsOrThrow(token);

        // Set active organization for each session
        await Promise.all((sessions?.data ?? []).map(async session => {
            if (organizationId) {
                await setActiveOrganizationOrThrow(session.token, String(organizationId))
            }
        })).then(async () => {
            // Fetch updated sessions
            sessions = await getAllSessionsOrThrow(token);
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
const createUsers = async () => {
    console.log("\n1. Creating users A, B, and C...");
    
    return createUserOrThrow(Users.A.name, Users.A.email, Users.A.password)
        .then(() => {
            return Promise.all([
                createUserOrThrow(Users.B.name, Users.B.email, Users.B.password),
                createUserOrThrow(Users.C.name, Users.C.email, Users.C.password)
            ]);
        });
};

// Step 2: Create organizations with User A
const createOrganizations = async (token: string) => {
    console.log("\n2. Creating organizations...");
    
    const firstOrg = await createOrgOrThrow(token, Organizations.First.name, Organizations.First.slug);
    const secondOrg = await createOrgOrThrow(token, Organizations.Second.name, Organizations.Second.slug);

    return { firstOrg, secondOrg };
};

// Step 3: Add User B to both organizations
const addUserBToOrganizations = async (token: string, orgs: any) => {
    console.log("\n3. Adding User B to both organizations...");
    
    const firstOrgInvite = await inviteUserToOrgOrThrow(token, Users.B.email, "member", orgs.firstOrg.data.id);

    const secondOrgInvite = await inviteUserToOrgOrThrow(token, Users.B.email, "member", orgs.secondOrg.data.id);

    return { firstOrgInvite, secondOrgInvite };
};

// Step 4: Accept invitations as User B
const acceptInvitations = async (token: string, invites: any) => {
    console.log("\n4. User B accepting invitations...");
    
    const firstAccept = await acceptOrgInvitationOrThrow(token, invites.firstOrgInvite.data.id);

    const secondAccept = await acceptOrgInvitationOrThrow(token, invites.secondOrgInvite.data.id);

    return { firstAccept, secondAccept };
};

// Test organizational operations in current workspace context
const testWorkspaceOperations = async (userType: string, token: string) => {
    console.log(`\nTesting workspace operations for User ${userType}...`);
    
    try {
        // Get current workspace context
        const activeOrg = await getActiveOrganization(token);

        console.log(`Current workspace context for User ${userType}:\n`, 
            activeOrg?.data ? activeOrg.data.name : "Personal workspace");

        // Test some operations
        const orgs = await listOrgs(token);

        console.log(`Available organizations for User ${userType}:`, 
            JSON.stringify(orgs, null, 2));

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
    return createUsers()
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