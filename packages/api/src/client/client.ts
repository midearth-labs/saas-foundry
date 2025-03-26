import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from '../api/schema/root';
import { createAuthClient, SuccessContext } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';
import path from 'path';
import * as dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const client2 = createTRPCClient<AppClientRouter>({
  links: [
    httpLink({
      url: process.env.API_URL || 'http://localhost:3005/api/trpc',
      headers: () => ({
        'x-tenant-id': 'your-tenant-id-2'
      })
    })
  ]
});

// Auth Client Configuration
const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3005/api/auth',
  plugins: [adminClient()]
});

async function main() {

  // @Awwal: Please note that the authClient is meant to be used in the frontend (React or Mobile).
  // Also, we should not use cookies but Bearer tokens for authentication.
  // https://www.better-auth.com/docs/plugins/bearer
  console.log("Signing up: ")
  const userCreation = await authClient.signUp.email({
      name: "Oladipo Fasoro",
      email: "dfasoro@gmail.com",
      password: "TheBestPassWordInTheUniverseNot",
    },
    {
      onError: (result) => {
        const errorMessage = JSON.stringify(result.error, null, 2);
        console.log(`Failed to sign up: ${errorMessage}`);
      },
      onSuccess: (result) => {
        console.log(JSON.stringify(result.data, null, 2));
      }
    }
  );

  if (userCreation.data) {
    console.info("User created successfully")
  } else {
    console.error("Failed to create user.")
    if (userCreation.error.code === "USER_ALREADY_EXISTS") {
      console.error("User already exists.")
    }
  }


  // Also, we should not use cookies but Bearer tokens for authentication.
  // https://www.better-auth.com/docs/plugins/bearer
  console.log("Signing in with good password: ")
  const userSignin = await authClient.signIn.email({
      email: "dfasoro@gmail.com",
      password: "TheBestPassWordInTheUniverseNot",
    },
    {
      onError: (result) => {
        const errorMessage = JSON.stringify(result.error, null, 2);
        console.log(`Failed to sign in: ${errorMessage}`);
      },
      onSuccess: (result) => {
        console.log(JSON.stringify(result.data, null, 2));
      }
    }
  );

  if (userSignin.data) {
    console.info("Signed in successfully: token=" + userSignin.data.token)
  } else {
    console.error("Failed to sign in: ")
  }

  // Sign-in with bad password
  console.log("Signing in with bad password: ")
  const userSigninBadPassword = await authClient.signIn.email({
    email: "dfasoro@gmail.com",
    password: "TheBestPassWordInTheUniverse",
  },
  {
    onError: (result) => {
      const errorMessage = JSON.stringify(result.error, null, 2);
      console.log(`Failed to sign in: ${errorMessage}`);
    },
    onSuccess: (result) => {
      console.log(JSON.stringify(result.data, null, 2));
    }
  }
);

if (userSigninBadPassword.data) {
  console.info("Signed in successfully: token=" + userSigninBadPassword.data.token)
} else {
  console.error("Failed to sign in: ")
}

  return;


  // Example usage
  const output1 = await client2.waitlist.definition.create.mutate({ name: 'Test', description: 'Test', status: 'ACTIVE' });
  const output2 = await client2.waitlist.entry.create.mutate({ definitionId: output1.id, email: 'test@test.com' });

  console.log(output1);
  console.log(output2);
}

main();