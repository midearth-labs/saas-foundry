import * as waitlist from '../repositories/interfaces/waitlist.repository';

export type Repositories = {
    waitlist: {
      definition: waitlist.WaitListDefinitionRepository;
      entry: waitlist.WaitListEntryRepository;
    }
};
