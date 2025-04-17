import * as dotenv from "dotenv";
import path from "path";
import { 
    acceptOrgInvitationOrThrow,
    createOrgOrThrow,
    createUserOrThrow, 
    getAllSessionsOrThrow, 
    inviteUserToOrgOrThrow, 
    signInUserOrThrow,
} from '../../utils';
import { listOrgs } from "../../../auth";


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate random 3-digit number
const rand = () => Math.floor(Math.random() * 900 + 100);

// Generate unique but readable credentials with lowercase emails
const Users = {
    A: {
        name: `John Smith`,
        email: `admin_ajohn${rand()}@example.com`.toLowerCase(),
        password: `SecureA!${rand()}`
    },
    B: {
        name: `Jane Doe`,
        email: `bjane${rand()}@example.com`.toLowerCase(),
        password: `SecureB!${rand()}`
    },
    C: {
        name: `Bob Wilson`,
        email: `cbob${rand()}@example.com`.toLowerCase(),
        password: `SecureC!${rand()}`
    }
};

const Organizations = {
    First: {
        name: `Tech Team`,
        slug: `tech-team-${rand()}`
    },
    Second: {
        name: `Design Team`,
        slug: `design-team-${rand()}`
    }
};

// Step 1: Create and verify all users
const createUsers = async () => {
    console.log("\n1. Creating users A, B, and C...");
    
    // Handle User A first - create, verify, and promote to admin
    return createUserOrThrow(Users.A.name, Users.A.email.toLowerCase(), Users.A.password)
        .then(() => {
            // Now create B and C
            return Promise.all([
                createUserOrThrow(
                    Users.B.name, 
                    Users.B.email.toLowerCase(), 
                    Users.B.password),
                createUserOrThrow(
                    Users.C.name, 
                    Users.C.email.toLowerCase(), 
                    Users.C.password)
            ]);
        });
};

// Step 2: Create organizations with User A
const createOrganizations = async (token: string) => {
    console.log("\n2. Creating organizations...");
    const firstOrg = await createOrgOrThrow(
        token, 
        Organizations.First.name, 
        Organizations.First.slug
    );
    const secondOrg = await createOrgOrThrow(
        token, 
        Organizations.Second.name, 
        Organizations.Second.slug
    );
    return { firstOrg, secondOrg };
};

// Step 3: Add User B to both organizations
const addUserBToOrganizations = async (token: string, orgs: any) => {
    console.log("\n3. Adding User B to both organizations...");
    
    const firstOrgInvite = await inviteUserToOrgOrThrow(
        token, 
        Users.B.email.toLowerCase(), 
        "member", 
        orgs.firstOrg.data.id
    );

    const secondOrgInvite = await inviteUserToOrgOrThrow(
        token, 
        Users.B.email.toLowerCase(), 
        "member", 
        orgs.secondOrg.data.id
    );

    return { firstOrgInvite, secondOrgInvite };
};

// Step 4: Accept invitations as User B
const acceptInvitations = async (token: string, invites: any) => {
    console.log("\n4. User B accepting invitations...");
    
    const firstAccept = await acceptOrgInvitationOrThrow(
        token, 
        invites.firstOrgInvite.data.id
    );

    const secondAccept = await acceptOrgInvitationOrThrow(
        token, 
        invites.secondOrgInvite.data.id
    );

    return { firstAccept, secondAccept };
};

// Step 5-6: Test organizational operations
const testOrganizationalOperations = async (userType: string, token: string) => {
    console.log(`\n5-6. Testing organizational operations for User ${userType}...`);
    
    try {
        // const { data: organizations } = await authClient.useListOrganizations.get();  // Bug -> returning null
        const organizations = await listOrgs(token);
        console.log(`User ${userType}'s organizations: `, JSON.stringify(organizations, null, 2));
        
        return organizations;
    } catch (error) {
        console.error(`Error listing organizations for User ${userType}:`, error);
        throw error;
    }
};

// Step 7-8: Create multiple sessions and list them
const createMultipleSessionsAndList = async (userType: string, email: string, password: string) => {
    console.log(`\n7-8. Creating multiple sessions for User ${userType}...`);
    
    // Create three sessions
    const sessions = await Promise.all([
        signInUserOrThrow(email, password),
        signInUserOrThrow(email, password),
        signInUserOrThrow(email, password)
    ]);

    // List all sessions
    const allSessions = await getAllSessionsOrThrow(String(sessions[0]?.signedInUser?.data?.token));

    console.log(`All sessions for User ${userType}:`, allSessions);
    return { sessions, allSessions };
};

// Main execution flow with .then() chaining
function main() {
    let contextData: {
        userA: { signedInUser: any } | null;
        userB: { signedInUser: any } | null;
        userC: { signedInUser: any } | null;
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
        .then(users => {
            console.log("Users created and verified successfully");
            return signInUserOrThrow(Users.A.email, Users.A.password);
        })
        .then(userASession => {
            if (!userASession?.signedInUser?.data?.token) {
                throw new Error('Failed to get valid session token for User A');
            }
            contextData.userA = userASession;
            // Create organizations with User A
            return createOrganizations(userASession.signedInUser.data.token);
        })
        .then(orgs => {
            contextData.orgs = orgs;
            // Add User B to organizations
            return addUserBToOrganizations(contextData.userA!.signedInUser.data.token, orgs);
        })
        .then(invites => {
            contextData.invites = invites;
            // Sign in as User B
            return signInUserOrThrow(Users.B.email, Users.B.password);
        })
        .then(userBSession => {
            if (!userBSession?.signedInUser?.data?.token) {
                throw new Error('Failed to get valid session token for User B');
            }
            contextData.userB = userBSession;
            return acceptInvitations(userBSession.signedInUser.data.token, contextData.invites);
        })
        .then(() => {
            // Test operations for User A
            return testOrganizationalOperations('A', contextData.userA!.signedInUser.data.token);
        })
        .then(() => {
            // Test operations for User B
            return testOrganizationalOperations('B', contextData.userB!.signedInUser.data.token);
        })
        .then(() => {
            // Sign in as User C
            return signInUserOrThrow(Users.C.email, Users.C.password);
        })
        .then(userCSession => {
            if (!userCSession?.signedInUser?.data?.token) {
                throw new Error('Failed to get valid session token for User C');
            }
            contextData.userC = userCSession;
            return testOrganizationalOperations('C', userCSession.signedInUser.data.token);
        })
        .then(() => {
            // Create multiple sessions for User A
            return createMultipleSessionsAndList('A', Users.A.email, Users.A.password);
        })
        .then(() => {
            // Create multiple sessions for User B
            return createMultipleSessionsAndList('B', Users.B.email, Users.B.password);
        })
        .then(() => {
            console.log("\nGitHub-style organization auth test completed successfully!");
        })
        .catch(error => {
            console.error("Error in main execution:", error);
            process.exit(1);
        });
}

// Execute
main();

export { main as testOrganizationalAuth };