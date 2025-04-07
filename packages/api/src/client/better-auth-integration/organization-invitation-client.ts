import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    promoteUserToAdminOrThrow
} from '../utils';
import readline from 'readline';
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate unique credentials for this run
const timestamp = Date.now();
const INVITER_EMAIL = `inviter${timestamp}@example.com`;
const INVITEE_EMAIL = `invitee${timestamp}@example.com`;
const COMMON_PASSWORD = `SecurePass!${timestamp}`;
const ORG_NAME = `Test Organization ${timestamp}`;
const ORG_SLUG = `test-org-${timestamp}`;

const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
    plugins: [
        organizationClient(),
        adminClient()
    ]
});

// Step 1: Create inviter user
const createInviterUser = async () => {
    console.log("\n1. Creating inviter user...");
    const { createdUser } = await createUserOrThrow(
        "Inviter User",
        INVITER_EMAIL,
        COMMON_PASSWORD
    );
    return createdUser;
};

// Step 2: Wait for verification
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

// Step 3: Sign in inviter
const signInInviter = async () => {
    console.log("\n3. Signing in inviter...");
    const { signedInUser } = await signInUserOrThrow(INVITER_EMAIL, COMMON_PASSWORD);
    if (!signedInUser.data?.token) {
        throw new Error("Failed to get authentication token for inviter");
    }
    return signedInUser;
};

// Step 3.5: Promote to admin
const promoteToAdmin = async () => {
    console.log("\n3.5. Promoting user to admin...");
    await promoteUserToAdminOrThrow(INVITER_EMAIL);
    console.log("User promoted to admin successfully!");
};

// Step 4: Create organization
const createOrg = async (token: string) => {
    console.log("\n4. Creating organization...");
    return await authClient.organization.create({
        name: ORG_NAME,
        slug: ORG_SLUG,
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

// Step 5: Send invitation
const sendInvitation = async (token: string, organizationId: string) => {
    console.log("\n5. Sending invitation...");
    return await authClient.organization.inviteMember({
        email: INVITEE_EMAIL,
        role: "member",
        organizationId,
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

// Step 6: Create invitee user
const createInviteeUser = async () => {
    console.log("\n6. Creating invitee user...");
    const { createdUser } = await createUserOrThrow(
        "Invitee User",
        INVITEE_EMAIL,
        COMMON_PASSWORD
    );
    return createdUser;
};

// Step 7: Sign in invitee
const signInInvitee = async () => {
    console.log("\n7. Signing in invitee...");
    const { signedInUser } = await signInUserOrThrow(INVITEE_EMAIL, COMMON_PASSWORD);
    if (!signedInUser.data?.token) {
        throw new Error("Failed to get authentication token for invitee");
    }
    return signedInUser;
};

// Step 8: Accept invitation
const acceptInvitation = async (token: string, invitationId: string) => {
    console.log("\n8. Accepting invitation...");
    return await authClient.organization.acceptInvitation({
        invitationId,
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

async function createOrganizationInvitationFlow() {
    return createInviterUser()
        .then(() => waitForVerification(INVITER_EMAIL))
        .then(() => signInInviter())
        .then(inviterSession => {
            return promoteToAdmin()
                .then(() => createOrg(inviterSession.data.token))
                .then(organization => ({
                    inviterSession,
                    organization
                }));
        })
        .then(({ inviterSession, organization }) => {
            return sendInvitation(inviterSession.data.token, organization?.data?.id ?? '')
                .then(invitation => ({
                    inviterSession,
                    organization,
                    invitation
                }));
        })
        .then(({ inviterSession, organization, invitation }) => {
            return createInviteeUser()
                .then(() => waitForVerification(INVITEE_EMAIL))
                .then(() => signInInvitee())
                .then(inviteeSession => ({
                    inviterSession,
                    organization,
                    invitation,
                    inviteeSession
                }));
        })
        .then(({ inviterSession, organization, invitation, inviteeSession }) => {
            return acceptInvitation(inviteeSession.data.token, invitation?.data?.id ?? '')
                .then(acceptedInvitation => ({
                    organization,
                    invitation: acceptedInvitation,
                    inviter: inviterSession.data,
                    invitee: inviteeSession.data
                }));
        })
        .catch(error => {
            console.error("Error in organization invitation process:", error);
            throw error;
        });
}

// Execute
function main() {
    createOrganizationInvitationFlow()
        .then(result => {
            console.log("\nProcess completed successfully!");
            console.log("Organization and Invitation details:", JSON.stringify(result, null, 2));
        })
        .catch(console.error);
}

main();

export { createOrganizationInvitationFlow };
