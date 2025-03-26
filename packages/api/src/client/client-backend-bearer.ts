import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from '../api/schema/root';
import { APIError } from 'better-auth/api';
import path from 'path';
import * as dotenv from "dotenv";
import { auth } from '../auth';


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

async function main() {
  // Also, we should not use cookies but Bearer tokens for authentication.
  // https://www.better-auth.com/docs/plugins/bearer
  console.log("Signing up: ")
  try {
      let userCreation = await auth.api.signUpEmail({
        body: {
          name: "Oladipo Fasoro",
          email: "dfasoro@gmail.com",
          password: "TheBestPassWordInTheUniverseNot",
        },
      });
      console.info("User created successfully");
      console.log(JSON.stringify(userCreation, null, 2));
  } catch (error) {
    console.error("Failed to create user.")
    if (error instanceof APIError) {
      console.error([error.message, error.body, error.headers, error.statusCode]
        .map(v => JSON.stringify(v, null, 2))
        .join("\n"));
    } else {
      console.error(error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "USER_ALREADY_EXISTS") {
        console.error("User already exists.");
        console.log(JSON.stringify(error, null, 2));
      }
    }
  }

  // Also, we should not use cookies but Bearer tokens for authentication.
  // https://www.better-auth.com/docs/plugins/bearer
  try {
    let userSignin = await auth.api.signInEmail({
      // asRequest: true,
      body: {
        email: "dfasoro@gmail.com",
        password: "TheBestPassWordInTheUniverseNot",
      }
    });

    let sessions = await auth.api.listSessions({
      headers: {
        Authorization: `Bearer ${userSignin.token}`  // Subsequent requests are automatically authenticated.
      }
    });

    //console.log("Headers: ", JSON.stringify(headers, null, 2));
    console.log("User signin: ", JSON.stringify(userSignin, null, 2));
    console.log("Sessions: ", JSON.stringify(sessions, null, 2));
    if (userSignin) {
      console.info("Signed in successfully: token=" + userSignin!.token)
    } else {
      console.error("Failed to sign in: ")
    }

  } catch (error) {
    console.error("Failed to sign in.")
    if (error instanceof APIError) {
      console.error(error.message, error.body, error.headers, error.statusCode);
    } else {
      console.error(error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "INVALID_EMAIL_OR_PASSWORD") {
        console.error("Invalid credentials.")
      }
    }
  }

  // Sign-in with bad password
  console.log("Signing in with bad password: ")
  let userSigninBadPassword;
  try {
    userSigninBadPassword = await auth.api.signInEmail({
      body: {
        email: "dfasoro@gmail.com",
        password: "TheBestPassWordInTheUniverse",
      },
    });
  } catch (error) {
    console.error("Failed to sign in.");
    console.log(JSON.stringify(userSigninBadPassword, null, 2));
    if (error instanceof APIError) {
      console.error(error.message, error.body, error.headers, error.statusCode);
    } else {
      console.error(error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "INVALID_EMAIL_OR_PASSWORD") {
        console.error("Invalid credentials.")
      }
    }
  }

  return;


  // Example usage
  const output1 = await client2.waitlist.definition.create.mutate({ name: 'Test', description: 'Test', status: 'ACTIVE' });
  const output2 = await client2.waitlist.entry.create.mutate({ definitionId: output1.id, email: 'test@test.com' });

  console.log(output1);
  console.log(output2);
}

main();