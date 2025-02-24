import { pgTable } from 'drizzle-orm/pg-core';
import { varchar, timestamp } from 'drizzle-orm/pg-core';

// Revoked Token table
export const revokedTokens = pgTable('revoked_tokens', {
  id: varchar('id').primaryKey().notNull(),
  token: varchar('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at').defaultNow().notNull()
});

export type RevokedToken = typeof revokedTokens.$inferSelect;
export type NewRevokedToken = typeof revokedTokens.$inferInsert;