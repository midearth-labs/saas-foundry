import * as waitlist from '../repositories/impl/waitlist.repository';
import { Repositories } from './repositories';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// @TODO: Consider lazy loading these repositories and using memoization
export const createRepositories = (db: NodePgDatabase<any>): Repositories => {
  return {
    waitlist: {
      definition: waitlist.createDrizzleWaitListDefinitionRepository(db),
      entry: waitlist.createDrizzleWaitListEntryRepository(db),
    },
  }
} 