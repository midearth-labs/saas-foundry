import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    getTRPCClient,
} from '../../utils';

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate random x-digit number for unique usernames
const rand = () => Math.floor(Math.random() * 9000 + 100);

// Define test users
const Users = {
    Admin: {
        name: `Admin User`,
        email: `admin_${rand()}@example.com`.toLowerCase(),
        password: `AdminPass!${rand()}`
    },
    Regular: {
        name: `Regular User`,
        email: `user_${rand()}@example.com`.toLowerCase(),
        password: `UserPass!${rand()}`
    }
};

// Utility to truncate error messages
const truncateError = (error: any, maxLength: number = 150): string => {
    const errorMessage = error?.message || String(error);
    return errorMessage.length > maxLength 
        ? `${errorMessage.substring(0, maxLength)}...` 
        : errorMessage;
};

function main() {
    let contextData: {
        adminUser: { token: string } | null;
        regularUser: { token: string } | null;
        waitlistDefinition: any;
    } = {
        adminUser: null,
        regularUser: null,
        waitlistDefinition: null
    };

    // Step 1: Create both users
    return createUserOrThrow(Users.Admin.name, Users.Admin.email, Users.Admin.password)
        .then(() => createUserOrThrow(Users.Regular.name, Users.Regular.email, Users.Regular.password))
        .then(() => {
            console.log("\nBoth users created successfully");
        })
        // Step 2: Sign in admin user
        .then(() => signInUserOrThrow(Users.Admin.email, Users.Admin.password))
        .then(({ signedInUser }) => {
            contextData.adminUser = { token: signedInUser.data!.token };
        })
        // Step 3: Sign in regular user
        .then(() => signInUserOrThrow(Users.Regular.email, Users.Regular.password))
        .then(({ signedInUser }) => {
            contextData.regularUser = { token: signedInUser.data!.token };
        })
        // Step 4: Create TRPC clients
        .then(() => {
            const adminTrpc = getTRPCClient(contextData.adminUser!.token);
            const regularTrpc = getTRPCClient(contextData.regularUser!.token);
            const unauthenticatedTrpc = getTRPCClient("");

            console.log("\nTesting waitlist definition creation...");
            
            // Step 5: Test waitlist definition creation with all clients
            return adminTrpc.waitlist.definition.create.mutate({ 
                name: 'Admin Created Waitlist', 
                description: 'Test waitlist definition by admin', 
                status: 'ACTIVE' 
            })
            .then(definition => {
                contextData.waitlistDefinition = definition;
                console.log("\nAdmin successfully created waitlist definition");
                
                // Regular user attempt (authenticated but not admin)
                return regularTrpc.waitlist.definition.create.mutate({ 
                    name: 'Regular User Waitlist', 
                    description: 'Should fail - authenticated but not admin', 
                    status: 'ACTIVE' 
                })
                .catch(error => {
                    console.log("\nRegular user (authenticated, non-admin) failed to create definition (expected):", 
                        truncateError(error));
                    return Promise.resolve(); // Continue to next attempt
                })
                .then((regValue) => {
                    console.log("\nRegular user waitlist definition creation attempt:", regValue);
                    // Unauthenticated attempt (not even logged in)
                    return unauthenticatedTrpc.waitlist.definition.create.mutate({ 
                        name: 'Unauthenticated Waitlist', 
                        description: 'Should fail - not even authenticated', 
                        status: 'ACTIVE' 
                    })
                    .catch(error => {
                        console.log("\nUnauthenticated client failed to create definition (expected):", 
                            truncateError(error));
                        return Promise.resolve(); // Continue to next step
                    });
                });
            })
            // Step 6: Test waitlist entry creation with all clients (should succeed)
            .then(() => {
                console.log("\nTesting waitlist entry creation...");
                return Promise.all([
                    adminTrpc.waitlist.entry.create.mutate({
                        definitionId: contextData.waitlistDefinition.id,
                        email: "test1@example.com"
                    }),
                    regularTrpc.waitlist.entry.create.mutate({
                        definitionId: contextData.waitlistDefinition.id,
                        email: "test2@example.com"
                    }),
                    unauthenticatedTrpc.waitlist.entry.create.mutate({
                        definitionId: contextData.waitlistDefinition.id,
                        email: "test3@example.com"
                    })
                ]);
            })
            .then(results => {
                console.log("\nAll clients successfully created waitlist entries:", 
                    results.map(r => r.id));
            });
        })
        .catch(error => {
            console.error("\nFatal error in main execution:", truncateError(error));
            process.exit(1);
        });
}

main(); 