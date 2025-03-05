import { pgTable, pgEnum, varchar, text, integer, decimal } from 'drizzle-orm/pg-core';
import { timestamps, primaryKeyUUID, genericUUID } from './common';

// 1. Enum Definitions
export const bookStatusEnum = pgEnum('book_status', ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

// 2. Table Definitions
export const booksTable = pgTable('books', {
  // Primary Key
  id: primaryKeyUUID(),
  // Required Fields
  title: varchar('title', { length: 256 }).notNull(),
  author: varchar('author', { length: 256 }).notNull(),
  isbn: varchar('isbn', { length: 20 }).notNull().unique(),
  status: bookStatusEnum('status').notNull().default('AVAILABLE'),
  // Optional Fields
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  pageCount: integer('page_count'),
  publisher: varchar('publisher', { length: 256 }),
  publishedYear: integer('published_year'),
  // Timestamps
  ...timestamps
});

export const ordersTable = pgTable('orders', {
  // Primary Key
  id: primaryKeyUUID(),
  // Required Fields
  customerName: varchar('customer_name', { length: 256 }).notNull(),
  customerEmail: varchar('customer_email', { length: 256 }).notNull(),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  // Optional Fields
  shippingAddress: text('shipping_address').notNull(),
  // Timestamps
  ...timestamps
});

export const orderItemsTable = pgTable('order_items', {
  // Primary Key
  id: primaryKeyUUID(),
  // Required Fields
  orderId: genericUUID('order_id')
    .notNull()
    .references(() => ordersTable.id),
  bookId: genericUUID('book_id')
    .notNull()
    .references(() => booksTable.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  // Timestamps
  ...timestamps
});

// 3. Type Exports
export type Book = typeof booksTable.$inferSelect;
export type NewBook = typeof booksTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert; 