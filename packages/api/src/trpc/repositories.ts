import * as waitlist from '../repositories/interfaces/waitlist.repository';
import { BookRepository, OrderRepository } from '../repositories/interfaces/bookstore.repository';
import { AuthRepository } from '../repositories/interfaces/auth.repository';

export interface Repositories {
    waitlist: {
      definition: waitlist.WaitListDefinitionRepository;
      entry: waitlist.WaitListEntryRepository;
    };
    bookstore: {
      book: BookRepository;
      order: OrderRepository;
    };
    auth: AuthRepository;
}
