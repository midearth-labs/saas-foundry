import * as waitlist from '../repositories/interfaces/waitlist.repository';

export interface Repositories {
    waitlist: {
      definition: waitlist.WaitListDefinitionRepository;
      entry: waitlist.WaitListEntryRepository;
    };
}
