// !!! CURRENTLY UNRUNNABLE !!!
// This needs further analysis and design

import * as dotenv from "dotenv";
import path from "path";
import { 
    createEmailUserOrThrow, 
    signInUserOrThrow,
    getTRPCClient,
    getAllSessionsOrThrow,
    setActiveOrganizationOrThrow,
    createOrgOrThrow,
    CreateOrgResult
} from '../utils';

type Userss = Awaited<ReturnType<typeof signInUserOrThrow>>["signedInUser"];

/**
 * Implementation of the OrganizationPermissionsClientInterface
 * Tests organization permissions with various user roles
 */
export class OrganizationPermissionsClient {
    private contextData: {
        users?: {
            owner: Userss;
            testOwner: Userss;
            admin: Userss;
            analyst: Userss;
            member: Userss;
        };
        organization: CreateOrgResult | null;
        waitlistDefinitionIDs: Array<{id: string}>;
        waitlistEntries: Array<{id: string}>;
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
    private readonly TIMESTAMP: string = new Date().toISOString().replace(/[-:Z]/g, '');
    
    /**
     * Creates a new OrganizationPermissionsClient
     */
    constructor() {
        // Load environment variables
        dotenv.config({
            path: path.resolve(process.cwd(), '.env')
        });

        // Initialize user data
        this.Users = {
            Owner: {
                name: 'Creator Owner',
                email: `admin_creator_owner_${this.TIMESTAMP}@example.com`.toLowerCase(),
                password: `CreatorPass!${this.TIMESTAMP}`
            },
            TestOwner: {
                name: 'Test Owner',
                email: `admin_test_owner_${this.TIMESTAMP}@example.com`.toLowerCase(),
                password: `TestOwnerPass!${this.TIMESTAMP}`
            },
            Admin: {
                name: 'Admin User',
                email: `admin_${this.TIMESTAMP}@example.com`.toLowerCase(),
                password: `AdminPass!${this.TIMESTAMP}`
            },
            Analyst: {
                name: 'Analyst User',
                email: `analyst_${this.TIMESTAMP}@example.com`.toLowerCase(),
                password: `AnalystPass!${this.TIMESTAMP}`
            },
            Member: {
                name: 'Member User',
                email: `member_${this.TIMESTAMP}@example.com`.toLowerCase(),
                password: `MemberPass!${this.TIMESTAMP}`
            }
        };

        // Organization details
        this.ORG_NAME = `Test Organization ${this.TIMESTAMP}`;
        this.ORG_SLUG = `test-org-${this.TIMESTAMP}`;

        // Initialize state
        this.contextData = {
            organization: null,
            waitlistDefinitionIDs: [],
            waitlistEntries: []
        };
    }

    /**
     * Truncate error messages
     * @param error Error to truncate
     * @param maxLength Maximum length
     * @returns Truncated error message
     */
    private truncateError(error: Error, maxLength: number = 300): string {
        const errorMessage = error?.message || String(error);
        return errorMessage.length > maxLength 
            ? `${errorMessage.substring(0, maxLength)}...` 
            : errorMessage;
    }

    /**
     * Create users with different roles
     * @returns Promise with the created users
     */
    public createUsers() {
        console.log("\n1. Creating users...");
        return createEmailUserOrThrow(this.Users.Owner.name, this.Users.Owner.email, this.Users.Owner.password)
            .then(() => createEmailUserOrThrow(this.Users.TestOwner.name, this.Users.TestOwner.email, this.Users.TestOwner.password))
            .then(() => createEmailUserOrThrow(this.Users.Admin.name, this.Users.Admin.email, this.Users.Admin.password))
            .then(() => createEmailUserOrThrow(this.Users.Analyst.name, this.Users.Analyst.email, this.Users.Analyst.password))
            .then(() => createEmailUserOrThrow(this.Users.Member.name, this.Users.Member.email, this.Users.Member.password));
    }

    /**
     * Sign in users to get their tokens
     * @returns Promise with the signed in users
     */
    public signInUsers() {
        console.log("\n2. Signing in users...");
        return Promise.all([
            signInUserOrThrow(this.Users.Owner.email, this.Users.Owner.password),
            signInUserOrThrow(this.Users.TestOwner.email, this.Users.TestOwner.password),
            signInUserOrThrow(this.Users.Admin.email, this.Users.Admin.password),
            signInUserOrThrow(this.Users.Analyst.email, this.Users.Analyst.password),
            signInUserOrThrow(this.Users.Member.email, this.Users.Member.password)
        ])
        .then(([ownerSession, testOwnerSession, adminSession, analystSession, memberSession]) => {
            this.contextData.users = {
                owner: ownerSession?.signedInUser,
                testOwner: testOwnerSession?.signedInUser,
                admin: adminSession?.signedInUser,
                analyst: analystSession?.signedInUser,
                member: memberSession?.signedInUser
            }
            
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
    public setupOrganization() {
        console.log("\n3. Creating organization...");

        const userDetails = [
            { userId: this.contextData.users!.testOwner.data!.user.id, role: ["ownerRole"] },
            { userId: this.contextData.users!.admin.data!.user.id, role: ["adminRole"] },
            { userId: this.contextData.users!.analyst.data!.user.id, role: ["analystRole"] },
            { userId: this.contextData.users!.member.data!.user.id, role: ["memberRole"] }
        ];

        return createOrgOrThrow(this.contextData.users!.owner.data!.token, this.ORG_NAME, this.ORG_SLUG, {addUsers: userDetails})
            .then((org) => {
                this.contextData.organization = org;
                console.log(`Organization created: ${this.ORG_NAME} (${this.ORG_SLUG})`);
                
                // Set active organization for all user sessions
                return this.setActiveOrganizationForAllSessions(this.contextData.users!.owner.data!.token, String(org?.id))
                    .then(() => {
                        // Add members with different roles
                        console.log("\n4. Adding users to organization with different roles...");
                        return this.setActiveOrganizationForAllUsers(org);
                    });
            });
    }

    /**
     * Add all users to the organization with their respective roles
     * @param org Organization
     * @returns Promise with results
     */
    private setActiveOrganizationForAllUsers(org: CreateOrgResult) {
        const userDetails = [
            { token: this.contextData.users!.testOwner.data!.token },
            { token: this.contextData.users!.admin.data!.token },
            { token: this.contextData.users!.analyst.data!.token },
            { token: this.contextData.users!.member.data!.token }
        ];

        // Get the user IDs
        return Promise.all(
            userDetails.map(user =>
                 setActiveOrganizationOrThrow(user.token, String(org?.id)))
            );
    }

    /**
     * Test permissions for different user roles
     * @returns Promise with the test results
     */
    public testRolePermissions() {
        console.log("\n5. Testing role-specific permissions...");
        
        // Create TRPC clients for each user
        const ownerTrpc = getTRPCClient(this.contextData.users!.owner.data!.token);
        const testOwnerTrpc = getTRPCClient(this.contextData.users!.testOwner.data!.token);
        const adminTrpc = getTRPCClient(this.contextData.users!.admin.data!.token);
        const analystTrpc = getTRPCClient(this.contextData.users!.analyst.data!.token);
        const memberTrpc = getTRPCClient(this.contextData.users!.member.data!.token);
        
        // Create test resources
        return testOwnerTrpc.waitlist.definition.create.mutate({
            name: 'Test Permissions Waitlist',
            description: 'A waitlist for testing permissions',
            status: 'ACTIVE'
        })
        .then(definition => {
            this.contextData.waitlistDefinitionIDs = [definition];
            const definitionId = definition.id;
            
            // Test member creating an entry
            return memberTrpc.waitlist.entry.create.mutate({
                definitionId,
                email: `entry_${this.TIMESTAMP}@example.com`
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
    public setActiveOrganizationForAllSessions(token: string, organizationId: string) {
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
    public async execute(): Promise<JSON> {
        const execution = await this.createUsers()
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

        return JSON.parse(JSON.stringify(execution));
    }
} 