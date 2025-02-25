import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { waitlistDefinitions, waitlistEntries } from './schema/waitlist.schema';

// Configuration should come from environment variables in production
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'saasfoundry',
});

// Create the database instance with all schemas
export const db = drizzle(pool, {
  schema: {
    waitlistDefinitions,
    waitlistEntries,
    // Add other schemas here as they're created
  },
  // Add any global configuration here
  logger: true,
});
