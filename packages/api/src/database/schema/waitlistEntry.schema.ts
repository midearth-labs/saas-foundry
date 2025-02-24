import { pgTable, pgEnum, jsonb, varchar } from 'drizzle-orm/pg-core';
import { waitlistDefinitions } from './waitlistDefinition.schema';

export const waitListStatusEnum = pgEnum('waitlist_status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const waitListEntryStatusEnum = pgEnum('waitlist_entry_status', ['PENDING', 'APPROVED', 'REJECTED']);

// WaitList Entry table
export const waitlistEntries = pgTable('waitlist_entries', {
  id: varchar('id').primaryKey().notNull(),
  definitionId: varchar('definition_id')
    .notNull()
    .references(() => waitlistDefinitions.id),
  email: varchar('email').notNull(),
  by: varchar('by'),
  status: waitListEntryStatusEnum('status').default('PENDING').notNull(),
  metadata: jsonb('metadata').notNull(),
  fieldValues: jsonb('field_values').notNull()
});

export type WaitListEntry = typeof waitlistEntries.$inferSelect;
export type NewWaitListEntry = typeof waitlistEntries.$inferInsert;
