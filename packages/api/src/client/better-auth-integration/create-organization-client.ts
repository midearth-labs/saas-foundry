import * as dotenv from "dotenv";
import path from "path";
import { 
    createOrgOrThrow,
    createUserOrThrow,
    getSessionTokenOrThrow,
    signInUserOrThrow,
} from '../utils';


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
    USER_NAME = process.env.ADMIN_USER_NAME || "Admin User",
    USER_EMAIL = process.env.ADMIN_USER_EMAIL || "admin_123@example.com",
    USER_PASSWORD = process.env.USER_PASSWORD || "Adm!n123Secure",
    ORG_NAME = process.env.ORG_NAME || "My Organization",
    ORG_SLUG = process.env.ORG_SLUG || "my-org";

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

// Step 3: Sign in user
const signInUser = async () => {
    console.log("\n4. Signing in user...");
    const { signedInUser } = await signInUserOrThrow(USER_EMAIL, USER_PASSWORD);
    if (!signedInUser.data?.token) {
        throw new Error("Failed to get authentication token");
    }
    return signedInUser;
};

async function createVerifiedAdminWithOrganization(): Promise<{
    user: { token: string };
    organization: any;
}> {
    return createInitialUser()
        .then(() => signInUser())
        .then(signedInUser => {
            return getSessionTokenOrThrow(signedInUser.data.token)
                .then(latestToken => createOrgOrThrow(latestToken, ORG_NAME, ORG_SLUG))
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
