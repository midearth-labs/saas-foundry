import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow,
    signInUserOrThrow,
} from '../utils';
import readline from 'readline';
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
    USER_NAME = process.env.USER_NAME || "Admin User",
    USER_EMAIL = process.env.USER_EMAIL || "admin_123@example.com",
    USER_PASSWORD = process.env.USER_PASSWORD || "Adm!n123Secure",
    ORG_NAME = process.env.ORG_NAME || "My Organization",
    ORG_SLUG = process.env.ORG_SLUG || "my-org";

const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
    plugins: [
        adminClient(),
        organizationClient(),
    ]
});

// Step 1: Create user
const createInitialUser = async () => {
    console.log("\n1. Creating new user...");
    const { createdUser } = await createUserOrThrow(
        USER_NAME,
        USER_EMAIL,
        USER_PASSWORD
    );
    return createdUser;
};

// Step 2: Wait for verification
const waitForVerification = async () => {
    console.log("\n2. Please verify your email and press any key to continue...");
    
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

// Step 3: Sign in user
const signInUser = async () => {
    console.log("\n4. Signing in user...");
    const { signedInUser } = await signInUserOrThrow(USER_EMAIL, USER_PASSWORD);
    if (!signedInUser.data?.token) {
        throw new Error("Failed to get authentication token");
    }
    return signedInUser;
};

// Step 5: Get latest session token
const getLatestSessionToken = async (token: string) => {
    const { data } = await authClient.listSessions({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
    const session = data?.[0];
    if (!session) {
        throw new Error("Unable to create organization because no session was found");
    }
    return session.token;
};

// Step 6: Create organization
const createOrg = async (token: string) => {
    console.log("\n6. Creating organization...");
    return await authClient.organization.create({ // auth.api.createOrganization({
        name: ORG_NAME,
        slug: ORG_SLUG,
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    });
};

async function createVerifiedAdminWithOrganization(): Promise<{
    user: { token: string };
    organization: any;
}> {
    return createInitialUser()
        .then(() => waitForVerification())
        .then(() => signInUser())
        .then(signedInUser => {
            return getLatestSessionToken(signedInUser.data.token)
                .then(latestToken => createOrg(latestToken))
                .then(organization => ({
                    user: signedInUser.data,
                    organization
                }));
        })
        .catch(error => {
            console.error("Error in organization creation process:", error);
            throw error;
        });
}

// Execute
function main() {
    createVerifiedAdminWithOrganization()
        .then(result => {
            console.log("\nProcess completed successfully!");
            console.log("User and Organization details:", JSON.stringify(result, null, 2));
        })
        .catch(console.error);
}

main();

export { createVerifiedAdminWithOrganization };
