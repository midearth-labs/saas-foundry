import * as dotenv from "dotenv";
import path from "path";
import { OrganizationPermissionsClientInterface } from "../interfaces/organization-permissions-client.interface";
import { 
    createUserOrThrow, 
    signInUserOrThrow,
    getTRPCClient,
    getAllSessionsOrThrow,
    setActiveOrganizationOrThrow,
} from '../common/utils';
import { createOrg, addOrgMember } from "../../../auth";

/**
 * Implementation of the OrganizationPermissionsClientInterface
 * Tests organization permissions with various user roles
 */
export class OrganizationPermissionsClient implements OrganizationPermissionsClientInterface {
    private contextData: {
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
    };

    private readonly Users: {
        Owner: {
            name: string;
            email: string;
            password: string;
        };
        TestOwner: {
            name: string;
            email: string;
            password: string;
        };
        Admin: {
            name: string;
            email: string;
            password: string;
        };
        Analyst: {
            name: string;
            email: string;
            password: string;
        };
        Member: {
            name: string;
            email: string;
            password: string;
        };
    };

    // Organization details
    private readonly ORG_NAME: string;
    private readonly ORG_SLUG: string;

    /**
     * Creates a new OrganizationPermissionsClient
     */
    constructor() {
        // Load environment variables
        dotenv.config({
            path: path.resolve(process.cwd(), '.env')
        });

        // Generate random identifier
        const randId = this.generateRandomId();

        // Initialize user data
        this.Users = {
            Owner: {
                name: 'Creator Owner',
                email: `admin_creator_owner_${randId}@example.com`.toLowerCase(),
                password: `CreatorPass!${randId}`
            },
            TestOwner: {
                name: 'Test Owner',
                email: `admin_test_owner_${randId}@example.com`.toLowerCase(),
                password: `TestOwnerPass!${randId}`
            },
            Admin: {
                name: 'Admin User',
                email: `admin_${randId}@example.com`.toLowerCase(),
                password: `AdminPass!${randId}`
            },
            Analyst: {
                name: 'Analyst User',
                email: `analyst_${randId}@example.com`.toLowerCase(),
                password: `AnalystPass!${randId}`
            },
            Member: {
                name: 'Member User',
                email: `member_${randId}@example.com`.toLowerCase(),
                password: `MemberPass!${randId}`
            }
        };

        // Organization details
        this.ORG_NAME = `Test Organization ${randId}`;
        this.ORG_SLUG = `test-org-${randId}`;

        // Initialize state
        this.contextData = {
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
    }

    /**
     * Generate a random ID (3-digit number)
     * @returns Random ID
     */
    private generateRandomId(): number {
        return Math.floor(Math.random() * 900) + 100;
    }

    /**
     * Truncate error messages
     * @param error Error to truncate
     * @param maxLength Maximum length
     * @returns Truncated error message
     */
    private truncateError(error: any, maxLength: number = 300): string {
        const errorMessage = error?.message || String(error);
        return errorMessage.length > maxLength 
            ? `${errorMessage.substring(0, maxLength)}...` 
            : errorMessage;
    }

    /**
     * Create users with different roles
     * @returns Promise with the created users
     */
    public createUsers(): Promise<any> {
        console.log("\n1. Creating users...");
        return createUserOrThrow(this.Users.Owner.name, this.Users.Owner.email, this.Users.Owner.password)
            .then(() => createUserOrThrow(this.Users.TestOwner.name, this.Users.TestOwner.email, this.Users.TestOwner.password))
            .then(() => createUserOrThrow(this.Users.Admin.name, this.Users.Admin.email, this.Users.Admin.password))
            .then(() => createUserOrThrow(this.Users.Analyst.name, this.Users.Analyst.email, this.Users.Analyst.password))
            .then(() => createUserOrThrow(this.Users.Member.name, this.Users.Member.email, this.Users.Member.password));
    }

    /**
     * Sign in users to get their tokens
     * @returns Promise with the signed in users
     */
    public signInUsers(): Promise<any> {
        console.log("\n2. Signing in users...");
        return Promise.all([
            signInUserOrThrow(this.Users.Owner.email, this.Users.Owner.password),
            signInUserOrThrow(this.Users.TestOwner.email, this.Users.TestOwner.password),
            signInUserOrThrow(this.Users.Admin.email, this.Users.Admin.password),
            signInUserOrThrow(this.Users.Analyst.email, this.Users.Analyst.password),
            signInUserOrThrow(this.Users.Member.email, this.Users.Member.password)
        ])
        .then(([ownerSession, testOwnerSession, adminSession, analystSession, memberSession]) => {
            this.contextData.users.owner.token = String(ownerSession?.signedInUser?.data?.token);
            this.contextData.users.testOwner.token = String(testOwnerSession?.signedInUser?.data?.token);
            this.contextData.users.admin.token = String(adminSession?.signedInUser?.data?.token);
            this.contextData.users.analyst.token = String(analystSession?.signedInUser?.data?.token);
            this.contextData.users.member.token = String(memberSession?.signedInUser?.data?.token);
            console.log("All users signed in successfully");
            return {
                ownerSession,
                testOwnerSession,
                adminSession,
                analystSession,
                memberSession
            };
        });
    }

    /**
     * Create an organization and add users with different roles
     * @returns Promise with the created organization
     */
    public setupOrganization(): Promise<any> {
        console.log("\n3. Creating organization...");
        return createOrg(this.contextData.users.owner.token, this.ORG_NAME, this.ORG_SLUG)
            .then(org => {
                this.contextData.organization = org;
                console.log(`Organization created: ${this.ORG_NAME} (${this.ORG_SLUG})`);
                
                // Set active organization for all user sessions
                return this.setActiveOrganizationForAllSessions(this.contextData.users.owner.token, String(org?.id))
                    .then(() => {
                        // Add members with different roles
                        console.log("\n4. Adding users to organization with different roles...");
                        return this.addAllUsersToOrganization(org);
                    });
            });
    }

    /**
     * Add all users to the organization with their respective roles
     * @param org Organization
     * @returns Promise with results
     */
    private addAllUsersToOrganization(org: any): Promise<any> {
        type RoleType = "admin" | "adminRole" | "owner" | "ownerRole" | "member" | "memberRole" | "analystRole";
        
        const userSessions = [
            { token: this.contextData.users.testOwner.token, role: ["ownerRole" as RoleType] },
            { token: this.contextData.users.admin.token, role: ["adminRole" as RoleType] },
            { token: this.contextData.users.analyst.token, role: ["analystRole" as RoleType] },
            { token: this.contextData.users.member.token, role: ["memberRole" as RoleType] }
        ];

        // Get the user IDs
        return Promise.all(userSessions.map(session => 
            getAllSessionsOrThrow(session.token)
                .then(sessionsResponse => {
                    const userId = String(!sessionsResponse?.data?.[0]?.userId ? null : sessionsResponse?.data?.[0]?.userId);
                    return { userId, role: session.role, token: session.token };
                })
        ))
        .then(userDetails => {
            // Add each user to the organization
            return userDetails.reduce((promise, user) => 
                promise.then(() => 
                    addOrgMember(
                        this.contextData.users.owner.token,
                        String(user.userId),
                        String(org?.id),
                        user.role
                    )
                    .then(() => setActiveOrganizationOrThrow(user.token, String(org?.id)))
                    .then(() => {})  // Return void to maintain consistent Promise<void> type
                ), Promise.resolve());
        });
    }

    /**
     * Test permissions for different user roles
     * @returns Promise with the test results
     */
    public testRolePermissions(): Promise<any> {
        console.log("\n5. Testing role-specific permissions...");
        
        // Create TRPC clients for each user
        const ownerTrpc = getTRPCClient(this.contextData.users.owner.token);
        const testOwnerTrpc = getTRPCClient(this.contextData.users.testOwner.token);
        const adminTrpc = getTRPCClient(this.contextData.users.admin.token);
        const analystTrpc = getTRPCClient(this.contextData.users.analyst.token);
        const memberTrpc = getTRPCClient(this.contextData.users.member.token);
        
        // Create test resources
        return testOwnerTrpc.waitlist.definition.create.mutate({
            name: 'Test Permissions Waitlist',
            description: 'A waitlist for testing permissions',
            status: 'ACTIVE',
            tier: 'BASIC'
        })
        .then(definition => {
            this.contextData.waitlistDefinitions = [definition];
            const definitionId = definition.id;
            
            // Test member creating an entry
            return memberTrpc.waitlist.entry.create.mutate({
                definitionId,
                email: `entry_${this.generateRandomId()}@example.com`
            })
            .then(memberEntry => {
                console.log("\nMember successfully created entry:", memberEntry);
                
                // Test admin updating status
                return adminTrpc.waitlist.entry.updateStatus.mutate({
                    entryId: { id: memberEntry.id },
                    status: 'APPROVED'
                })
                .then(updatedEntry => {
                    console.log("\nAdmin successfully updated entry status:", updatedEntry);
                    
                    // Test analyst searching entries
                    return analystTrpc.waitlist.entry.searchEntries.query({
                        definitionId,
                        status: 'APPROVED',
                        page: 1,
                        limit: 10
                    });
                })
                .then(searchResults => {
                    console.log("\nAnalyst successfully searched entries:", JSON.stringify(searchResults, null, 2));
                    
                    // Test expected permission denial
                    return memberTrpc.waitlist.entry.updateStatus.mutate({
                        entryId: { id: memberEntry.id },
                        status: 'APPROVED'
                    })
                    .catch(error => {
                        console.log("\nMember correctly denied status update:", this.truncateError(error));
                        return { success: true, permissionDenied: true };
                    });
                });
            });
        });
    }

    /**
     * Set active organization for all user sessions
     * @param token User's token
     * @param organizationId Organization ID
     * @returns Promise with the result
     */
    public setActiveOrganizationForAllSessions(token: string, organizationId: string): Promise<any> {
        try {
            console.log(`\nSetting active organization ${organizationId} for all sessions...`);
            
            // First, list all sessions
            return getAllSessionsOrThrow(token)
                .then(sessionsResponse => {
                    // Set active organization for each session
                    return Promise.all((sessionsResponse?.data ?? []).map(session => 
                        setActiveOrganizationOrThrow(session.token, organizationId)
                    ));
                });
        } catch (error) {
            console.error("Error setting active organization:", error);
            throw error;
        }
    }

    /**
     * Execute the client
     * @returns Promise with results
     */
    public execute(): Promise<any> {
        return this.createUsers()
            .then(() => this.signInUsers())
            .then(() => this.setupOrganization())
            .then(() => this.testRolePermissions())
            .then(() => {
                console.log("\nOrganization permissions test completed successfully!");
                return { success: true };
            })
            .catch(error => {
                console.error("\nFatal error in permissions test:", this.truncateError(error));
                throw error;
            });
    }
} 