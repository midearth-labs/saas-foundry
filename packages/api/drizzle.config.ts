import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Load environment variables from the root of the API package
// dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});