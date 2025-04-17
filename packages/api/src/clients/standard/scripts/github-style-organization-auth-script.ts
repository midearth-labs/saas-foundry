import { GithubStyleOrganizationAuthClient } from "../implementations/github-style-organization-auth-client";

/**
 * Main function to run the GitHub-style organization auth client
 */
function main() {
  const client = new GithubStyleOrganizationAuthClient();
  
  console.log("Starting GitHub-style organization auth flow...");
  return client.execute()
    .catch(error => {
      console.error("Failed to execute GitHub-style organization auth client:", error);
      process.exit(1);
    });
}

// Execute if this script is run directly
// Using ES Module compatible check
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export { main as runGithubStyleOrganizationAuthClient }; 