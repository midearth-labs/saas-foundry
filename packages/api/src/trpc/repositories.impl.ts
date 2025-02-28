import * as waitlist from '../repositories/impl/waitlist.repository';
import { createDrizzleHotelGuestRepository } from '../repositories/impl/hotel-guest.repository';
import { Repositories } from './repositories';
import { createDBConnection } from "../db";

// @TODO: Consider lazy loading these repositories and using memoization
export const createRepositories = (): Repositories => {
  const db = createDBConnection();
  return {
    waitlist: {
      definition: waitlist.createDrizzleWaitListDefinitionRepository(db),
      entry: waitlist.createDrizzleWaitListEntryRepository(db),
    },
    hotelGuest: createDrizzleHotelGuestRepository(db),
  }
} 