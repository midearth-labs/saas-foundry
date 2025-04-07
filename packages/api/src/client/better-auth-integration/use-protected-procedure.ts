import * as dotenv from "dotenv";
import path from "path";
import { createInterface } from 'readline';
import { Writable } from 'stream';
import { getTRPCClient } from '../utils';

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

function useProtectedProcedure(token: string) {
  console.log(`Using token to access protected procedure: ${token.slice(0, 10)}...[TRUNCATED]...`);
  const protectedTRPCClient = getTRPCClient(token);
  
  return protectedTRPCClient
    .waitlist
    .definition
    .create
    .mutate({ 
      name: 'Test Email Password Verification', 
      description: 'Email Password Verification Waitlist definition', 
      status: 'ACTIVE' 
    });
}

// Create a muted output stream
const muted = new Writable({
  write: function(chunk, encoding, callback) {
    callback();
  }
});

// Create readline interface with muted output
const rl = createInterface({
  input: process.stdin,
  output: muted,
  terminal: true
});

process.stdout.write('Please enter your token (input will be hidden): ');

// Get token with hidden input
rl.question('', (token) => {
  process.stdout.write('\n'); // New line after hidden input
  rl.close();
  
  if (!token) {
    console.error("No token provided");
    process.exit(1);
  }
  
  // Use the token
  useProtectedProcedure(token)
    .then((result) => {
      console.info("\nSuccess! Output:", JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error in protected procedure:", error);
      process.exit(1);
    });
}); 