import { pgTable,text, jsonb, timestamp, varchar } from 'drizzle-orm/pg-core';
import { waitListStatusEnum } from './waitlistEntry.schema';

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

// Relations
export type WaitListDefinition = typeof waitlistDefinitions.$inferSelect;
export type NewWaitListDefinition = typeof waitlistDefinitions.$inferInsert;
