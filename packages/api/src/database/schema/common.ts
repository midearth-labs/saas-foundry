import { timestamp, uuid as defaultUuid, varchar } from "drizzle-orm/pg-core";

export const timestamps = {
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
}

export const genericUUID = (columnName: string | undefined = 'id') => defaultUuid(columnName).notNull();
export const primaryKeyUUID = (columnName: string | undefined = 'id') => genericUUID(columnName).primaryKey();

export const requiredEmail = (columnName: string) => varchar(columnName, { length: 256 }).notNull()