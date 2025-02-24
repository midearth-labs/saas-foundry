import { pgTable, pgEnum, index, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);

export const users = pgTable('users', {
    id: varchar('id').primaryKey().notNull(),
    email: varchar('email').notNull().unique(),
    password: varchar('password').notNull(),
    role: userRoleEnum('role').default('USER').notNull()
  }, (table) => ({
    emailIdx: index('email_idx').on(table.email)
  }));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
