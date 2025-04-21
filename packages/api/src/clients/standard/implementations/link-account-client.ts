import * as dotenv from "dotenv";
import path from "path";
import { LinkAccountClientInterface } from "../interfaces/link-account-client.interface";
import { getAuthClient, getUserInput } from '../common/utils';

/**
 * Implementation of the LinkAccountClientInterface 
 * Tests account linking between email and social providers
 */
export class LinkAccountClient implements LinkAccountClientInterface {
    private readonly googleAuthClient: any;
    private readonly emailAuthClient: any;
    private userContext: {
        email: string;
        name: string;
        password: string;
    };

    /**
     * Creates a new LinkAccountClient
     */
    constructor() {
        // Load environment variables
        dotenv.config({
            path: path.resolve(process.cwd(), '.env')
        });

        this.googleAuthClient = getAuthClient();
        this.emailAuthClient = getAuthClient();
        this.userContext = {
            email: "",
            name: "",
            password: "Password123#$"
        };
    }

    /**
     * Create an email user
     * @param shouldSignIn Whether to sign in after creation
     * @returns Promise with the created user
     */
    public async createEmailUser(shouldSignIn?: boolean): Promise<any> {
        const name = await getUserInput("Please enter your name: ");
        const email = await getUserInput("Please enter the same Gmail address you used to sign in with Google: ");
        this.userContext.name = name;
        this.userContext.email = email;

        console.log(`\nCreating user ${name} with email ${email} and a dummy password...`);
        
        return this.emailAuthClient.signUp.email({
            email: String(this.userContext.email),
            password: String(this.userContext.password),
            name: String(this.userContext.name),
        })
        .then(async (user: any) => {
            if (user && !user.error) {
                if (shouldSignIn) {
                    const signedInUser = await this.signInEmailUser(false);
                    console.log("\nUser created and signed in successfully via email");
                    return { user, signedInUser };
                } else {
                    console.log("\nUser created successfully via email");
                    return { user };
                }
            } else {
                console.error("An error occurred signing up via email:", JSON.stringify(user, null, 2));
                throw new Error("Failed to create user via email");
            }
        });
    }

    /**
     * Sign in with email
     * @param shouldSignOut Whether to sign out after sign in
     * @returns Promise with the signed in user
     */
    public async signInEmailUser(shouldSignOut?: boolean): Promise<any> {
        console.log(`\nSigning in with email: ${this.userContext.email}`);
        
        const signInResponse = await this.emailAuthClient.signIn.email({
            email: String(this.userContext.email),
            password: String(this.userContext.password),
        });
        
        if (signInResponse && !signInResponse.error) {
            console.log("\nUser signed in successfully via email", JSON.stringify(signInResponse, null, 2));
            
            if (shouldSignOut) {
                console.log("\nSafely signing out...");
                return this.signOutUser(this.emailAuthClient);
            }
            
            return signInResponse;
        } else {
            console.error("An error occurred signing in via email:", JSON.stringify(signInResponse, null, 2));
            throw new Error("Failed to sign in via email");
        }
    }

    /**
     * Sign in with Google
     * @param shouldSignOut Whether to sign out after sign in
     * @returns Promise with the Google sign in result
     */
    public async signInGoogleUser(shouldSignOut?: boolean): Promise<any> {
        console.log("\nSigning in with Google...");
        
        const googleUser = await this.googleAuthClient.signIn.social({
            provider: "google",
        });
        
        if (googleUser && !googleUser.error) {
            console.log("\nGoogle oAuth URL was successfully generated. Follow the link to sign in:");
            console.log(JSON.stringify(googleUser, null, 2));
            
            // Return a promise that resolves only after user input and signout
            return new Promise((resolve, reject) => {
                getUserInput("\nPress any button when done...")
                .then(async () => {
                    try {
                        if (shouldSignOut) {
                            console.log("\nWill now safely sign you out...");
                            await this.signOutUser(this.googleAuthClient);
                        }
                        console.log("\nGoogle sign-in flow completed successfully");
                        resolve(googleUser);
                    } catch (error) {
                        console.error("Error during Google sign-out:", error);
                        reject(error);
                    }
                })
                .catch(error => {
                    console.error("Error getting user input:", error);
                    reject(error);
                });
            });
        } else {
            console.error("An error occurred:", JSON.stringify(googleUser, null, 2));
            throw new Error("Failed to sign in with Google");
        }
    }

    /**
     * Sign out a user
     * @param client Auth client to use
     * @returns Promise with the sign out result
     */
    public async signOutUser(client: any): Promise<any> {
        try {
            const token = await getUserInput("\nPlease enter your token: ");
            
            const signOutResponse = await client.signOut({
                fetchOptions: {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            });
            
            if (signOutResponse && !signOutResponse.error) {
                console.log("\nSign out was successful");
                return signOutResponse;
            } else {
                console.error("\nAn error occurred. Trying another method...");
                
                const session = await client.getSession();
                const alternativeSignOutResponse = await client.revokeSession({ 
                    token: String(session?.data?.session?.token) 
                });
                
                if (alternativeSignOutResponse && !alternativeSignOutResponse.error) {
                    console.log("\nSign out was successful");
                    return alternativeSignOutResponse;
                } else {
                    console.error("An error occurred while signing out: ", alternativeSignOutResponse.error);
                    throw new Error("Failed to sign out user");
                }
            }
        } catch (error) {
            console.error("Error in signOutUser:", error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param client Auth client to use
     * @returns Promise with the updated profile
     */
    public async updateUserProfile(client: any, title?: string): Promise<any> {
        const token = await getUserInput("\nPlease enter your token for updating user profile: ");
        
        const updatedUser = await client.updateUser({
            name: title ? `${title} ${this.userContext.name}` : "Mr." + this.userContext.name,
            ...(token ? { fetchOptions: { headers: { Authorization: `Bearer ${token}` } } } : {})
        });
        
        if (updatedUser && !updatedUser.error) {
            console.log("\nUser profile updated successfully:", JSON.stringify(updatedUser, null, 2));
            return updatedUser;
        } else {
            console.error("An error occurred updating user profile:", JSON.stringify(updatedUser, null, 2));
            throw new Error("Failed to update user profile");
        }
    }

    /**
     * Link accounts between providers
     * @returns Promise with the linked account
     */
    public async linkAccount(): Promise<any> {
        let session = await this.emailAuthClient.getSession();
        let token;

        if (!session) {
            console.log("\nAttempting to sign in via email...");
            const signInResponse = await this.emailAuthClient.signIn.email({
                email: this.userContext.email,
                password: this.userContext.password,
            });
            token = signInResponse?.data?.token;
        } else {
            token = session?.data?.session?.token;
        }

        token = await getUserInput("\nPlease enter your token for linking account: ");
        
        const linkedAccount = await this.emailAuthClient.linkSocial({
            provider: "google",
            ...(token ? { fetchOptions: { headers: { Authorization: `Bearer ${token}` } } } : {})
        });
        
        if (linkedAccount && !linkedAccount.error) {
            console.log("\nAccount linked successfully:", JSON.stringify(linkedAccount, null, 2));
            console.log("\nAttempting to update user profile (have email-password token ready)...");
            
            // Return a promise that completes the entire chain
            return new Promise(async (resolve) => {
                try {
                    await this.updateUserProfile(this.emailAuthClient);
                    console.log("\nUser profile updated successfully. Safely signing out...");
                    await this.signOutUser(this.emailAuthClient);
                    console.log("\nSigning in again via Google to verify profile updates...");
                    await this.signInGoogleUser();
                    resolve(linkedAccount);
                } catch (error) {
                    console.error("Error in final verification steps:", error);
                    throw error;
                }
            });
        } else {
            console.error("An error occurred linking account:", JSON.stringify(linkedAccount, null, 2));
            throw new Error("Failed to link account");
        }
    }

    /**
     * Execute the client
     * @returns Promise with the results
     */
    public execute(): Promise<any> {
        console.log("\nStarting account linking flow...");
        
        // Step 1: Create user with email and password
        console.log("\nStep 1: Creating user with email and password...");
        
        return this.createEmailUser(true) // Pass true to sign in after creation
            .then(() => {
                console.log("\nStep 1 & 2 completed: User created and signed in successfully");
                
                // Step 3: Sign out the email user
                console.log("\nStep 3: Signing out email user...");
                return this.signOutUser(this.emailAuthClient);
            })
            .then(() => {
                console.log("\nStep 3 completed: Email user signed out successfully");
                
                // Step 4: Sign in Google user
                console.log("\nStep 4: Signing in with Google...");
                return this.signInGoogleUser(true); // Pass true to sign out after Google sign-in
            })
            .then(() => {
                console.log("\nStep 4 & 5 completed: Google user signed in and signed out successfully");
                
                // Step 6: Sign in email user (maintain session)
                console.log("\nStep 6: Signing in email user again (maintaining session)...");
                return this.signInEmailUser(false); // Pass false to maintain session
            })
            .then(() => {
                console.log("\nStep 6 completed: Email user signed in successfully");
                
                // Step 7: Link account
                console.log("\nStep 7: Linking accounts...");
                return this.linkAccount();
            })
            .then(() => {
                console.log("\nStep 7 completed: Accounts linked successfully");
                
                // Step 8: Sign in with Google again
                console.log("\nStep 8: Signing in with Google again after account linking...");
                return this.signInGoogleUser(false); // Don't sign out after Google sign-in
            })
            .then(() => {
                console.log("\nStep 8 completed: Signed in with Google after account linking");
                
                // Step 9: Update profile with "Engr." title
                console.log("\nStep 9: Updating profile with 'Engr.' title...");
                return this.updateUserProfile(this.googleAuthClient, "Engr.");
            })
            .then(() => {
                console.log("\nStep 9 completed: Profile updated with 'Engr.' title");
                console.log("\nAccount linking flow completed successfully!");
                return { success: true };
            })
            .catch((error) => {
                console.error("An error occurred during the account linking flow:", error);
                throw error;
            });
    }
} 