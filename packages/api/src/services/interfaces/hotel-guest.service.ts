import { HotelGuestServiceShape } from '../../api/schema/hotel-guest/hotel-guest.schema';
import { HotelGuestRepository } from '../../repositories/interfaces/hotel-guest.repository';

export type HotelGuestContext = {
    hotelGuestRepository: HotelGuestRepository;
};

export type HotelGuestService = {
    create(opts: { ctx: HotelGuestContext; input: HotelGuestServiceShape['create']['input'] }): Promise<HotelGuestServiceShape['create']['output']>;
    get(opts: { ctx: HotelGuestContext; input: HotelGuestServiceShape['get']['input'] }): Promise<HotelGuestServiceShape['get']['output']>;
    list(opts: { ctx: HotelGuestContext }): Promise<HotelGuestServiceShape['list']['output']>;
    update(opts: { ctx: HotelGuestContext; input: HotelGuestServiceShape['update']['input'] }): Promise<HotelGuestServiceShape['update']['output']>;
    delete(opts: { ctx: HotelGuestContext; input: HotelGuestServiceShape['delete']['input'] }): Promise<void>;
}; 