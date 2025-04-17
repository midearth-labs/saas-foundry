import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    getTRPCClient,
    setActiveOrganizationOrThrow
} from '../utils';
import { createOrg, addOrgMember } from "../../auth";
import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { adminAccessControl } from "../../auth/admin/permissions";
import { organizationAccessControl } from "../../auth/org/permissions";
import { roles as adminRoles } from "../../auth/admin/roles";
import { roles as orgRoles } from "../../auth/org/roles";


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Generate random x-digit number for unique usernames
const rand = () => Math.floor(Math.random() * 9000 + 100);

// Define test users
const Users = {
    Owner: {
        name: 'Creator Owner',
        email: `admin_creator_owner_${rand()}@example.com`.toLowerCase(),
        password: `CreatorPass!${rand()}`
    },
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

// Organization details
const ORG_NAME = `Test Organization ${rand()}`;
const ORG_SLUG = `test-org-${rand()}`;

// Utility to truncate error messages
const truncateError = (error: any, maxLength: number = 200): string => {
    const errorMessage = error?.message || String(error);
    return errorMessage.length > maxLength 
        ? `${errorMessage.substring(0, maxLength)}...` 
        : errorMessage;
};

function main() {
    let contextData: {
        ownerUser: { token: string; id: string } | null;
        adminUser: { token: string; id: string } | null;
        regularUser: { token: string; id: string } | null;
        organization: any;
        waitlistDefinition: any;
        waitlistEntries: any[];
    } = {
        ownerUser: null,
        adminUser: null,
        regularUser: null,
        organization: null,
        waitlistDefinition: null,
        waitlistEntries: []
    };

    // Step 1: Create all users
    console.log("\n1. Creating users...");
    return createUserOrThrow(Users.Owner.name, Users.Owner.email, Users.Owner.password)
        .then(() => createUserOrThrow(Users.Admin.name, Users.Admin.email, Users.Admin.password))
        .then(() => createUserOrThrow(Users.Regular.name, Users.Regular.email, Users.Regular.password))
        .then(() => {
            console.log("\nAll users created successfully");
        })
        // Step 2: Sign in owner user
        .then(() => signInUserOrThrow(Users.Owner.email, Users.Owner.password))
        .then(({ signedInUser }) => {
            contextData.ownerUser = { 
                token: signedInUser.data!.token,
                id: signedInUser.data!.user.id
            };
        })
        // Step 3: Sign in admin user
        .then(() => signInUserOrThrow(Users.Admin.email, Users.Admin.password))
        .then(({ signedInUser }) => {
            contextData.adminUser = { 
                token: signedInUser.data!.token,
                id: signedInUser.data!.user.id
            };
        })
        // Step 4: Sign in regular user
        .then(() => signInUserOrThrow(Users.Regular.email, Users.Regular.password))
        .then(({ signedInUser }) => {
            contextData.regularUser = { 
                token: signedInUser.data!.token,
                id: signedInUser.data!.user.id
            };
        })
        // Step 5: Create organization and set it as active for all users
        .then(() => {
            console.log("\n2. Creating organization...");
            return createOrg(contextData.ownerUser!.token, ORG_NAME, ORG_SLUG)
                .then(org => {
                    contextData.organization = org;
                    
                    // Set active organization for owner
                    return setActiveOrganizationOrThrow(contextData.ownerUser!.token, String(org?.id))
                    .then(() => {
                        // Add admin user to organization with adminRole
                        return addOrgMember(
                            contextData.ownerUser!.token,
                            contextData.adminUser!.id,
                            String(org?.id),
                            ["adminRole"]
                        );
                    })
                    .then(() => {
                        // Set active organization for admin
                        return setActiveOrganizationOrThrow(contextData.adminUser!.token, String(org?.id))
                    })
                    .then(() => {
                        // Add regular user to organization with memberRole
                        return addOrgMember(
                            contextData.ownerUser!.token,
                            contextData.regularUser!.id,
                            String(org?.id),
                            ["memberRole"]
                        );
                    })
                    .then(() => {
                        // Set active organization for regular user
                        return setActiveOrganizationOrThrow(contextData.regularUser!.token, String(org?.id))
                    });
                });
        })
        // Step 6: Create TRPC clients
        .then(() => {
            console.log("\n3. Creating TRPC clients and testing operations...");
            const adminTrpc = getTRPCClient(contextData.adminUser!.token);
            const regularTrpc = getTRPCClient(contextData.regularUser!.token);

            console.log("\nTesting waitlist definition creation...");
            
            // Step 7: Create a waitlist definition as admin
            return adminTrpc.waitlist.definition.create.mutate({ 
                name: 'Test Waitlist', 
                description: 'A test waitlist for feature testing', 
                status: 'ACTIVE' 
            })
            .then(definition => {
                contextData.waitlistDefinition = definition;
                console.log("\nAdmin successfully created waitlist definition:", definition);
                
                // First test regular user operations (only entry creation)
                return regularTrpc.waitlist.entry.create.mutate({
                    definitionId: definition.id,
                    email: "test1@example.com"
                })
                .then(entry => {
                    console.log("\nRegular user successfully created entry:", entry);
                    
                    // Now do admin operations with admin client
                    return adminTrpc.waitlist.definition.getStats.query({ id: definition.id })
                    .then(stats => {
                        console.log("\nAdmin retrieved waitlist stats:", stats);
                        // Continue with other admin operations...
                    });
                });
            })
            // Step 8: Create multiple entries
            .then(() => {
                console.log("\nCreating multiple waitlist entries...");
                const entries = [
                    { email: "test1@example.com" },
                    { email: "test2@example.com" },
                    { email: "test3@example.com" }
                ];

                return Promise.all(entries.map(entry => 
                    regularTrpc.waitlist.entry.create.mutate({
                        definitionId: contextData.waitlistDefinition.id,
                        email: entry.email
                    })
                ));
            })
            .then(entries => {
                contextData.waitlistEntries = entries;
                console.log("\nCreated waitlist entries:", entries.map(e => e.id));

                // Step 9: Get updated stats
                return adminTrpc.waitlist.definition.getStats.query({ id: contextData.waitlistDefinition.id })
                .then(stats => {
                    console.log("\nUpdated waitlist stats:", stats);
                });
            })
            // Step 10: Test entry status updates
            .then(() => {
                console.log("\nTesting entry status updates...");
                const [entry1, entry2] = contextData.waitlistEntries;

                return Promise.all([
                    // Approve first entry
                    adminTrpc.waitlist.entry.updateStatus.mutate({
                        entryId: { id: entry1.id },
                        status: 'APPROVED',
                    }),
                    // Reject second entry
                    adminTrpc.waitlist.entry.updateStatus.mutate({
                        entryId: { id: entry2.id },
                        status: 'REJECTED',
                    })
                ]);
            })
            .then(([approved, rejected]) => {
                console.log("\nEntry status updates completed:", {
                    approved: approved.status,
                    rejected: rejected.status
                });

                // Step 11: Search entries with various filters
                return Promise.all([
                    // Search approved entries
                    adminTrpc.waitlist.entry.searchEntries.query({
                        definitionId: contextData.waitlistDefinition.id,
                        status: 'APPROVED',
                        page: 1,
                        limit: 10
                    }),
                    // Search rejected entries
                    adminTrpc.waitlist.entry.searchEntries.query({
                        definitionId: contextData.waitlistDefinition.id,
                        status: 'REJECTED',
                        page: 1,
                        limit: 10
                    }),
                    // Search pending entries
                    adminTrpc.waitlist.entry.searchEntries.query({
                        definitionId: contextData.waitlistDefinition.id,
                        status: 'PENDING',
                        page: 1,
                        limit: 10
                    })
                ]);
            })
            .then(([approved, rejected, pending]) => {
                console.log("\nSearch results:", {
                    approved: approved.entries.length,
                    rejected: rejected.entries.length,
                    pending: pending.entries.length
                });

                // Step 12: Get active count
                return adminTrpc.waitlist.definition.getActiveCount.query({ 
                    id: contextData.waitlistDefinition.id 
                });
            })
            .then(activeCount => {
                console.log("\nActive count:", activeCount);

                // Step 13: Test regular user permissions
                console.log("\nTesting regular user permissions...");
                return Promise.all([
                    // Try to update entry status (should fail)
                    regularTrpc.waitlist.entry.updateStatus.mutate({
                        entryId: { id: contextData.waitlistEntries[0].id },
                        status: 'APPROVED'
                    }).catch(error => {
                        console.error("\nRegular user failed to update entry status (expected):", 
                            truncateError(error));
                        return null;
                    }),
                    // Try to get stats (should fail)
                    regularTrpc.waitlist.definition.getStats.query({ 
                        id: contextData.waitlistDefinition.id 
                    }).catch(error => {
                        console.error("\nRegular user failed to get stats (expected):", 
                            truncateError(error));
                        return null;
                    })
                ]);
            });
        })
        .catch(error => {
            console.error("\nFatal error in main execution:", error);
            process.exit(1);
        });
}

main(); 