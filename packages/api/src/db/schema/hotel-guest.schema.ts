import { pgTable, pgEnum, varchar, date, text } from 'drizzle-orm/pg-core';
import { timestamps, primaryKeyUUID, requiredEmail } from './common';

// Status enum for hotel guests
export const hotelGuestStatusEnum = pgEnum('hotel_guest_status', [
    'CHECKED_IN',
    'CHECKED_OUT',
    'RESERVED',
    'CANCELLED'
]);

export const hotelGuestTable = pgTable('hotel_guests', {
    // Primary Key
    id: primaryKeyUUID(),
    
    // Required Fields
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    // @TODO: @Awwal this could have used requiredEmail from common.ts
    email: requiredEmail("email"),
    phone: varchar('phone', { length: 20 }).notNull(),
    status: hotelGuestStatusEnum('status').notNull(),
    
    // Optional Fields
    roomNumber: varchar('room_number', { length: 20 }),
    checkInDate: date('check_in_date'),
    checkOutDate: date('check_out_date'),
    specialRequests: text('special_requests'),
    
    // Timestamps
    ...timestamps
});

export type HotelGuest = typeof hotelGuestTable.$inferSelect;
export type NewHotelGuest = typeof hotelGuestTable.$inferInsert; 