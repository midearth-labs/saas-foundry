import { HotelGuestDto, CreateHotelGuestDto, HotelGuestIdDto } from '../../models/hotel-guest.model';

export type HotelGuestRepository = {
    create(data: CreateHotelGuestDto): Promise<HotelGuestIdDto>;
    findById(data: HotelGuestIdDto): Promise<HotelGuestDto | null>;
    findAll(): Promise<HotelGuestDto[]>;
    update(id: HotelGuestIdDto, data: Partial<CreateHotelGuestDto>): Promise<HotelGuestDto>;
    delete(id: HotelGuestIdDto): Promise<void>;
}; 