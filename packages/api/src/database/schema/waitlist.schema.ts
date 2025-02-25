import { pgTable, pgEnum, jsonb, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const waitListStatusEnum = pgEnum('waitlist_status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const waitListEntryStatusEnum = pgEnum('waitlist_entry_status', ['PENDING', 'APPROVED', 'REJECTED']);

// WaitList Definition table
export const waitlistDefinitions = pgTable('waitlist_definitions', {
    id: varchar('id').primaryKey().notNull(),
    name: varchar('name').notNull(),
    description: text('description').notNull(),
    waitlistType: varchar('waitlist_type').notNull(),
    status: waitListStatusEnum('status').notNull(),
    fields: jsonb('fields').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

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

export type WaitListDefinition = typeof waitlistDefinitions.$inferSelect;
export type NewWaitListDefinition = typeof waitlistDefinitions.$inferInsert;
export type WaitListEntry = typeof waitlistEntries.$inferSelect;
export type NewWaitListEntry = typeof waitlistEntries.$inferInsert;