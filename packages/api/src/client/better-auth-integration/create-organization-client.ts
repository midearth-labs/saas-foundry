import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    promoteUserToAdminOrThrow, 
    getTokenSilently,
    authClient,
    verifyEmailWithToken,
    signInUserOrThrow,
    createOrganizationOrThrow
} from '../utils';
import { auth } from "../../auth";
import { organization } from "better-auth/plugins";

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const
    USER_NAME = process.env.USER_NAME || "Admin User",
    USER_EMAIL = process.env.USER_EMAIL || "admin@example.com",
    USER_PASSWORD = process.env.USER_PASSWORD || "Adm!n123Secure",
    ORG_NAME = process.env.ORG_NAME || "My Organization",
    ORG_SLUG = process.env.ORG_SLUG || "my-org";

async function createVerifiedAdminWithOrganization(): Promise<{
    user: { token: string };
    organization: any;
}> {
    try {
        // Step 1: Create the user
        console.log("\n1. Creating new user...");
        const { createdUser } = await createUserOrThrow(
            USER_NAME,
            USER_EMAIL,
            USER_PASSWORD
        );

        // Step 2: Wait for verification token
        console.log("\n2. Please verify your email...");
        console.log("Check your email or server logs for the verification token");
        const verificationToken = await getTokenSilently("Enter verification token: ");

        // Step 3: Verify the email
        console.log("\n3. Verifying email...");
        await verifyEmailWithToken(verificationToken);
        console.log("Email verified successfully!");

        // Step 4: Sign in the user to get authentication token
        console.log("\n4. Signing in user...");
        const { signedInUser } = await signInUserOrThrow(USER_EMAIL, USER_PASSWORD);
        if (!signedInUser.data?.token) {
            throw new Error("Failed to get authentication token");
        }

        // Step 5: Promote user to admin
        console.log("\n5. Promoting user to admin...");
        await promoteUserToAdminOrThrow(USER_EMAIL);
        console.log("User promoted to admin successfully!");

        // Step 6: Create organization
        console.log("\n6. Creating organization...");
        const organization = await authClient.organization.create({
            name: ORG_NAME,
            slug: ORG_SLUG,
            // logo: "https://example.com/logo.png" // Optional
        });

        console.log("\nOrganization created successfully:", organization);
        return { user: signedInUser.data, organization };

    } catch (error) {
        console.error("Error in organization creation process:", error);
        throw error;
    }
}

// Execute
if (require.main === module) {
    createVerifiedAdminWithOrganization()
        .then(result => {
            console.log("\nProcess completed successfully!");
            console.log("User and Organization details:", JSON.stringify(result, null, 2));
        })
        .catch(console.error);
}

export { createVerifiedAdminWithOrganization };
