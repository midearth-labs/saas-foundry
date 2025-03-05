import 'dotenv/config';
import * as dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';

// Load environment variables from the root of the API package
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

export const createDBConnection = () => {
  return drizzle(process.env.DATABASE_URL!);
}
