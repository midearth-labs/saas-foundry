import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { todos } from './schema/todo.schema';

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
    todos // Add other schemas here as they're created
  },
  // Add any global configuration here
  logger: true,
});

// Export the schema type for use in repositories
export type Schema = typeof todos;