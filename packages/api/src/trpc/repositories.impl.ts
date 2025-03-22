import * as waitlist from '../repositories/impl/waitlist.repository';
import { Repositories } from './repositories';
import { createDBConnection } from "../db";
import { createDrizzleBookRepository } from '../repositories/impl/book.repository';
import { createDrizzleOrderRepository } from '../repositories/impl/order.repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createDrizzleAuthRepository } from '../repositories/impl/auth.repository';

// @TODO: Consider lazy loading these repositories and using memoization
export const createRepositories = (db: NodePgDatabase<any>): Repositories => {
  return {
    auth: createDrizzleAuthRepository(db),
    waitlist: {
      definition: waitlist.createDrizzleWaitListDefinitionRepository(db),
      entry: waitlist.createDrizzleWaitListEntryRepository(db),
    },
    bookstore: {
      book: createDrizzleBookRepository(db),
      order: createDrizzleOrderRepository(db),
    },
  }
} 