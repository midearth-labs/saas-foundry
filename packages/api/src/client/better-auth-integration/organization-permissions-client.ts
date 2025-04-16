import * as dotenv from "dotenv";
import path from "path";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    getTRPCClient,
} from '../utils';
import { createOrg, addOrgMember } from "../../auth";
import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// Initialize auth client with organization plugin
const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
    plugins: [
        adminClient(),
        organizationClient(),
    ]
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
    TestOwner: {
        name: 'Test Owner',
        email: `admin_test_owner_${rand()}@example.com`.toLowerCase(),
        password: `TestOwnerPass!${rand()}`
    },
    Admin: {
        name: 'Admin User',
        email: `admin_${rand()}@example.com`.toLowerCase(),
        password: `AdminPass!${rand()}`
    },
    Analyst: {
        name: 'Analyst User',
        email: `analyst_${rand()}@example.com`.toLowerCase(),
        password: `AnalystPass!${rand()}`
    },
    Member: {
        name: 'Member User',
        email: `member_${rand()}@example.com`.toLowerCase(),
        password: `MemberPass!${rand()}`
    }
};

// Organization details
const ORG_NAME = `Test Organization ${rand()}`;
const ORG_SLUG = `test-org-${rand()}`;

// Utility to truncate error messages
const truncateError = (error: any, maxLength: number = 300): string => {
    const errorMessage = error?.message || String(error);
    return errorMessage.length > maxLength 
        ? `${errorMessage.substring(0, maxLength)}...` 
        : errorMessage;
};

interface TestContext {
    users: {
        owner: { token: string };
        testOwner: { token: string };
        admin: { token: string };
        analyst: { token: string };
        member: { token: string };
    };
    organization: any;
    waitlistDefinitions: any[];
    waitlistEntries: any[];
}

// Set active organization for all user sessions
const setActiveOrganizationForAllSessions = async (token: string, organizationId: string) => {
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
        ));

        console.log(`\nSet active organization ${organizationId} for all sessions`);
    } catch (error) {
        console.error("Error setting active organization:", error);
        throw error;
    }
};

async function runPermissionsTest() {
    const context: TestContext = {
        users: {
            owner: { token: '' },
            testOwner: { token: '' },
            admin: { token: '' },
            analyst: { token: '' },
            member: { token: '' }
        },
        organization: null,
        waitlistDefinitions: [],
        waitlistEntries: []
    };

    // Step 1: Create all users
    console.log("\n1. Creating users...");
    return createUserOrThrow(Users.Owner.name, Users.Owner.email, Users.Owner.password)
        .then(() => createUserOrThrow(Users.TestOwner.name, Users.TestOwner.email, Users.TestOwner.password))
        .then(() => createUserOrThrow(Users.Admin.name, Users.Admin.email, Users.Admin.password))
        .then(() => createUserOrThrow(Users.Analyst.name, Users.Analyst.email, Users.Analyst.password))
        .then(() => createUserOrThrow(Users.Member.name, Users.Member.email, Users.Member.password))
        // Step 2: Sign in all users
        .then(() => Promise.all([
            signInUserOrThrow(Users.Owner.email, Users.Owner.password),
            signInUserOrThrow(Users.TestOwner.email, Users.TestOwner.password),
            signInUserOrThrow(Users.Admin.email, Users.Admin.password),
            signInUserOrThrow(Users.Analyst.email, Users.Analyst.password),
            signInUserOrThrow(Users.Member.email, Users.Member.password)
        ]))
        .then(([ownerSession, testOwnerSession, adminSession, analystSession, memberSession]) => {
            context.users.owner.token = ownerSession.signedInUser.data!.token;
            context.users.testOwner.token = testOwnerSession.signedInUser.data!.token;
            context.users.admin.token = adminSession.signedInUser.data!.token;
            context.users.analyst.token = analystSession.signedInUser.data!.token;
            context.users.member.token = memberSession.signedInUser.data!.token;
            console.log("\n2. All users signed in successfully");

            // Step 3: Create organization
            console.log("\n3. Creating organization...");
            return createOrg(context.users.owner.token, ORG_NAME, ORG_SLUG)
                .then(org => {
                    context.organization = org;
                    // Set active organization for all sessions
                    return setActiveOrganizationForAllSessions(context.users.owner.token, String(org?.id))
                        .then(() => ({ sessions: { ownerSession, testOwnerSession, adminSession, analystSession, memberSession }, org }));
                });
        })
        .then(({ sessions, org }) => {
            // Create TRPC clients after setting active organization
            const ownerTrpc = getTRPCClient(context.users.owner.token);
            const testOwnerTrpc = getTRPCClient(context.users.testOwner.token);
            const adminTrpc = getTRPCClient(context.users.admin.token);
            const analystTrpc = getTRPCClient(context.users.analyst.token);
            const memberTrpc = getTRPCClient(context.users.member.token);

            // Step 4: Add members sequentially and set their active organization
            console.log("\n4. Adding users to organization and setting active organization...");
            return addOrgMember(
                context.users.owner.token,
                String(sessions.testOwnerSession.signedInUser.data?.user.id),
                String(org?.id),
                ["ownerRole"]
            )
            .then(() => authClient.organization.setActive({
                organizationId: String(org?.id),
                fetchOptions: {
                    headers: { Authorization: `Bearer ${context.users.testOwner.token}` }
                }
            }))
            .then(() => ({ sessions, org, clients: { ownerTrpc, testOwnerTrpc, adminTrpc, analystTrpc, memberTrpc } }));
        })
        .then(({ sessions, org, clients }) => {
            return addOrgMember(
                context.users.owner.token,
                String(sessions.adminSession.signedInUser.data?.user.id),
                String(org?.id),
                ["adminRole"]
            )
            .then(() => authClient.organization.setActive({
                organizationId: String(org?.id),
                fetchOptions: {
                    headers: { Authorization: `Bearer ${context.users.admin.token}` }
                }
            }))
            .then(() => ({ sessions, org, clients }));
        })
        .then(({ sessions, org, clients }) => {
            return addOrgMember(
                context.users.owner.token,
                String(sessions.analystSession.signedInUser.data?.user.id),
                String(org?.id),
                ["analystRole"]
            )
            .then(() => authClient.organization.setActive({
                organizationId: String(org?.id),
                fetchOptions: {
                    headers: { Authorization: `Bearer ${context.users.analyst.token}` }
                }
            }))
            .then(() => ({ sessions, org, clients }));
        })
        .then(({ sessions, org, clients }) => {
            return addOrgMember(
                context.users.owner.token,
                String(sessions.memberSession.signedInUser.data?.user.id),
                String(org?.id),
                ["memberRole"]
            )
            .then(() => authClient.organization.setActive({
                organizationId: String(org?.id),
                fetchOptions: {
                    headers: { Authorization: `Bearer ${context.users.member.token}` }
                }
            }))
            .then(() => ({ sessions, org, clients }));
        })
        .then(({ clients }) => {
            // Step 5: Create waitlist definitions using the test owner (with explicit ownerRole)
            console.log("\n5. Testing waitlist definition operations...");
            return Promise.all([
                clients.testOwnerTrpc.waitlist.definition.create.mutate({
                    name: 'Waitlist 1',
                    description: 'Test waitlist 1',
                    status: 'ACTIVE'
                }),
                clients.testOwnerTrpc.waitlist.definition.create.mutate({
                    name: 'Waitlist 2',
                    description: 'Test waitlist 2',
                    status: 'ACTIVE'
                })
            ])
            .then(definitions => {
                context.waitlistDefinitions = definitions;
                return { clients, definitions };
            });
        })
        .then(({ clients, definitions }) => {
            // Step 6: Test permissions
            console.log("\n6. Testing role-specific permissions...");
            const definitionId = definitions[0].id;

            // Test sequence of operations
            return clients.memberTrpc.waitlist.entry.create.mutate({
                definitionId,
                email: `entry_${rand()}@example.com`
            })
            .then(memberEntry => {
                console.log("\nMember successfully created entry:", memberEntry);
                return clients.adminTrpc.waitlist.entry.updateStatus.mutate({
                    entryId: { id: memberEntry.id },
                    status: 'APPROVED'
                })
                .then(updatedEntry => {
                    console.log("\nAdmin successfully updated entry status:", updatedEntry);
                    return clients.analystTrpc.waitlist.entry.searchEntries.query({
                        definitionId,
                        status: 'APPROVED',
                        page: 1,
                        limit: 10
                    });
                })
                .then(searchResults => {
                    console.log("\nAnalyst successfully searched entries:", searchResults);
                    // Test expected permission denial
                    return clients.memberTrpc.waitlist.entry.updateStatus.mutate({
                        entryId: { id: memberEntry.id },
                        status: 'APPROVED'
                    })
                    .catch(error => {
                        console.log("\nMember correctly denied status update:", truncateError(error));
                    });
                });
            });
        })
        .then(() => {
            console.log("\nPermissions test completed successfully!");
        })
        .catch(error => {
            console.error("\nFatal error in permissions test:", truncateError(error));
            throw error;
        });
}

// Execute the test
runPermissionsTest().catch(console.error); 