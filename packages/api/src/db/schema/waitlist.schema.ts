import { pgTable, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { timestamps, genericUUID, primaryKeyUUID, requiredEmail } from './common';

export const definitionStatusEnum = pgEnum('waitlist_status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const entryStatusEnum = pgEnum('waitlist_entry_status', ['PENDING', 'APPROVED', 'REJECTED']);

// WaitList Definition table
export const waitlistDefinitions = pgTable('waitlist_definitions', {
    id: primaryKeyUUID(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
    // waitlistType: varchar('waitlist_type').notNull(),
    status: definitionStatusEnum('status').notNull(),
    // fields: jsonb('fields').notNull(),
    ...timestamps
});

// WaitList Entry table
export const waitlistEntries = pgTable('waitlist_entries', {
  id: primaryKeyUUID(),
  definitionId: genericUUID('definition_id').references(() => waitlistDefinitions.id),
  email: requiredEmail("email"),
  status: entryStatusEnum('status').notNull(),
  // metadata: jsonb('metadata').notNull(),
  // fieldValues: jsonb('field_values').notNull()
    ...timestamps
});

export type WaitListDefinition = typeof waitlistDefinitions.$inferSelect;
export type NewWaitListDefinition = typeof waitlistDefinitions.$inferInsert;
export type WaitListEntry = typeof waitlistEntries.$inferSelect;
export type NewWaitListEntry = typeof waitlistEntries.$inferInsert;