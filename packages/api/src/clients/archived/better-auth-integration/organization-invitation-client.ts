import * as dotenv from "dotenv";
import path from "path";
import { 
    acceptOrgInvitationOrThrow,
    createOrgOrThrow,
    createUserOrThrow, 
    inviteUserToOrgOrThrow, 
    signInUserOrThrow,
} from '../../utils';


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate unique credentials for this run
const timestamp = Date.now();
const INVITER_EMAIL = `admin_inviter${timestamp}@example.com`;
const INVITEE_EMAIL = `invitee${timestamp}@example.com`;
const COMMON_PASSWORD = `SecurePass!${timestamp}`;
const ORG_NAME = `Test Organization ${timestamp}`;
const ORG_SLUG = `test-org-${timestamp}`;

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

// Step 3: Sign in inviter
const signInInviter = async () => {
    console.log("\n3. Signing in inviter...");
    const { signedInUser } = await signInUserOrThrow(INVITER_EMAIL, COMMON_PASSWORD);
    if (!signedInUser.data?.token) {
        throw new Error("Failed to get authentication token for inviter");
    }
    return signedInUser;
};

// Step 4: Create organization
const createOrg = async (token: string) => {
    console.log("\n4. Creating organization...");
    return await createOrgOrThrow(token, ORG_NAME, ORG_SLUG);
};

// Step 5: Send invitation
const sendInvitation = async (token: string, organizationId: string) => {
    console.log("\n5. Sending invitation...");
    return await inviteUserToOrgOrThrow(token, INVITEE_EMAIL, "member", organizationId);
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
    return await acceptOrgInvitationOrThrow(token, invitationId);
};

async function createOrganizationInvitationFlow() {
    return createInviterUser()
        .then(() => signInInviter())
        .then(inviterSession => {
            return createOrg(inviterSession.data.token)
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
