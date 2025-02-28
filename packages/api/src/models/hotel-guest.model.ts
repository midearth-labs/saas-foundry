import { TimestampsDto, StringIdDto } from "./common";

export enum HOTEL_GUEST_STATUS {
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",
    RESERVED = "RESERVED",
    CANCELLED = "CANCELLED"
}

export type HotelGuestStatus = keyof typeof HOTEL_GUEST_STATUS;

/**
 * Base DTO for hotel guest creation
 */
export type CreateHotelGuestDto = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: HotelGuestStatus;
    roomNumber?: string;
    checkInDate?: Date;
    checkOutDate?: Date;
    specialRequests?: string;
}

export type HotelGuestIdDto = StringIdDto;

/**
 * Complete hotel guest DTO including ID and timestamps
 */
export type HotelGuestDto = HotelGuestIdDto & CreateHotelGuestDto & TimestampsDto; 