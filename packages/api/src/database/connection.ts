import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { todos } from './schema/todo.schema';

// Configuration should come from environment variables in production
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'saasfoundry',
});

// Create the database instance with all schemas
export const db = drizzle(pool, {
  schema: {
    todos // Add other schemas here as they're created
  },
  // Add any global configuration here
  logger: process.env.NODE_ENV === 'development',
});

// Export the schema type for use in repositories
export type Schema = typeof todos;