import * as dotenv from "dotenv";
import path from "path";
import { 
    getAuthClient,
    getUserInput,
} from '../utils';


// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const googleAuthClient = getAuthClient();
const emailAuthClient = getAuthClient();

let userContext = {
    email : "",
    name: "",
    password: "Password123#$"
}

const signOutUser = async (client: typeof googleAuthClient | typeof emailAuthClient) => {
    try {
        let token = await getUserInput("Please enter your token: ");
        let signOutResponse = await client.signOut({
            fetchOptions: {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        });
        if (signOutResponse && !signOutResponse.error) {
            console.info("Sign out was successful.");
            return signOutResponse;
        } else {
            console.error("An error occurred. Trying another method...");
            const session = await client.getSession();
            let alternativeSignOutResponse = await client.revokeSession({ token: String(session?.data?.session.token) });
            if (alternativeSignOutResponse && !alternativeSignOutResponse.error) {
                console.info("Sign out was successful.");
                return alternativeSignOutResponse;
            } else {
                console.error("An error occurred while signing out: ", alternativeSignOutResponse.error);
                throw new Error("Failed to sign out user");
            }
        }
    } catch (error) {
        console.error("Error in signOutUser:", error);
        throw error; // Re-throw instead of process.exit() to let the main error handler deal with it
    }
}

const signInGoogleUser = async (shouldSignOut?: boolean) => {
    try {
        console.info("Signing in with Google...");
        let googleUser = await googleAuthClient.signIn.social({
            provider: "google",
        });
        
        if (googleUser && !googleUser.error) {
            console.info("Google oAuth URL was successfully generated. Follow the link to sign in.")
            
            // Return a promise that resolves only after user input and signout
            return new Promise((resolve, reject) => {
                console.log(JSON.stringify(googleUser, null, 2));
                getUserInput("Press any button when done...")
                .then(async () => {
                    try {
                        if (shouldSignOut) {
                            console.info("Will now safely sign you out...");
                            await signOutUser(googleAuthClient);
                        }
                        console.info("Google sign-in flow completed successfully.");
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
    } catch (error) {
        console.error("Error in signInGoogleUser:", error);
        throw error;
    }
}

const createEmailUser = async(shouldSignIn?: boolean) => {
    const name = await getUserInput("Please enter your name: ");
    const email = await getUserInput("Please enter the same Gmail address you used to sign in with Google: ");
    userContext.name = name;
    userContext.email = email;
    console.info(`Creating user ${name} with email ${email} and a dummy password...`);
    await emailAuthClient.signUp.email({
        email: String(userContext.email),
        password: String(userContext.password),
        name: String(userContext.name),
    })
    .then(async (user) => {
        if (user && !user.error) {
            if (shouldSignIn) {
                let signedInUser = await signInEmailUser(true);
                console.info("User created successfully via email: ", JSON.stringify(signedInUser, null, 2));
            } else {
                console.info("User created successfully via email: ", JSON.stringify(user, null, 2));
            }
        } else {
            console.error("An error occurred signing up via email:", JSON.stringify(user, null, 2));
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("An error occurred signing up via email:", error);
        process.exit(1);
    });
}

const signInEmailUser = async(shouldSignOut?: boolean) => {
    let signInResponse = await emailAuthClient.signIn.email({
        email: String(userContext.email),
        password: String(userContext.password),
    });
    if (signInResponse && !signInResponse.error) {
        console.info("User signed in successfully via email: ", JSON.stringify(signInResponse, null, 2));
        if (shouldSignOut) {
           console.info("Safely signing out...");
            return await signOutUser(emailAuthClient); 
        }
        return signInResponse;
    } else {
        console.error("An error occurred signing in via email:", JSON.stringify(signInResponse, null, 2));
        process.exit(1);
    }
}

const updateUserProfile = async (client: typeof emailAuthClient | typeof googleAuthClient) => {
    let token = await getUserInput("Please enter your token for updating user profile: ");
    const updatedUser = await client.updateUser({
        name: "Mr./Mrs. " + userContext.name,
        ...(token ? { fetchOptions: { headers: { Authorization: `Bearer ${token}` } } } : {})
    });
    if (updatedUser && !updatedUser.error) {
        console.info("User profile updated successfully: ", JSON.stringify(updatedUser, null, 2));
    } else {
        console.error("An error occurred updating user profile:", JSON.stringify(updatedUser, null, 2));
        process.exit(1);
    }
}

const linkAccount = async() => { 
    let session = await emailAuthClient.getSession();       // User currently signed in?
    let signedIn, token;
    if (!session) {      
        console.info("Attempting to sign in via email...");                               // If not, safely sign in
        let sn = await emailAuthClient.signIn.email({
            email: userContext.email,
            password: userContext.password,
        });
        signedIn = await sn;
        token = sn?.data?.token;
    } else {
        signedIn = session;
        token = session?.data?.session?.token;
    }
    if (signedIn || session) {
        token = await getUserInput("Please enter your token for linking account: ");
        const linkedAccount = await emailAuthClient.linkSocial({
            provider: "google",
            ...(token ? { fetchOptions: { headers: { Authorization: `Bearer ${token}` } } } : {})
        });
        if (linkedAccount && !linkedAccount.error) {
            console.info("Account linked successfully: ", JSON.stringify(linkedAccount, null, 2));
            console.info("Attempting to update user profile (have email-password token ready)...");
            
            // Return a promise that completes the entire chain
            return new Promise(async (resolve) => {
                try {
                    await updateUserProfile(emailAuthClient);
                    console.info("User profile updated successfully. Safely signing out...");
                    await signOutUser(emailAuthClient);
                    console.info("Signing in again via Google to verify profile updates...");
                    await signInGoogleUser();
                    resolve(linkedAccount);
                } catch (error) {
                    console.error("Error in final verification steps:", error);
                    process.exit(1);
                }
            });
        } else {
            console.error("An error occurred linking account:", JSON.stringify(linkedAccount, null, 2));
            process.exit(1);
        }
    } else {
        console.error("Account link failed. An error occurred while checking session:", session);
        process.exit(1);
    }
}

const main = async () => {
  console.info("\nStarting authentication flow...");
  
  try {
    // Step 1: Create user with email and password
    console.info("\nStep 1: Creating user with email and password...");
    
    // Using promise chain with then() as requested
    return createEmailUser(true) // Pass true to sign in after creation
      .then(() => {
        console.info("\nStep 1 & 2 completed: User created and signed in successfully");
        
        // Step 3: Sign out the email user
        console.info("\nStep 3: Signing out email user...");
        return signOutUser(emailAuthClient);
      })
      .then(() => {
        console.info("\nStep 3 completed: Email user signed out successfully");
        
        // Step 4: Sign in Google user
        console.info("\nStep 4: Signing in with Google...");
        return signInGoogleUser(true); // Pass true to sign out after Google sign-in
      })
      .then(() => {
        console.info("\nStep 4 & 5 completed: Google user signed in and signed out successfully");
        
        // Step 6: Sign in email user (maintain session)
        console.info("\nStep 6: Signing in email user again (maintaining session)...");
        return signInEmailUser(false); // Pass false to maintain session
      })
      .then(() => {
        console.info("\nStep 6 completed: Email user signed in successfully");
        
        // Step 7: Link account
        console.info("\nStep 7: Linking accounts...");
        return linkAccount();
      })
      .then(() => {
        console.info("\nStep 7 completed: Accounts linked successfully");
        console.info("Authentication flow completed successfully!");
      })
      .catch((error) => {
        console.error("An error occurred during the authentication flow:", error);
        throw error;
      });
  } catch (error) {
    console.error("Fatal error in authentication flow:", error);
    process.exit(1);
  }
};

// Execute the main function
main().catch(error => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
