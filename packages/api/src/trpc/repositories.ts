import * as waitlist from '../repositories/interfaces/waitlist.repository';
import { HotelGuestRepository } from '../repositories/interfaces/hotel-guest.repository';

export interface Repositories {
    waitlist: {
      definition: waitlist.WaitListDefinitionRepository;
      entry: waitlist.WaitListEntryRepository;
    };
    hotelGuest: HotelGuestRepository;
}
