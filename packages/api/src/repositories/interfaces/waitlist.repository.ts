import * as wl from '../../models/waitlist.model';

/**
 * Repository type for managing waitlist definitions
 */
export type WaitListDefinitionRepository = {
  findAll(): Promise<wl.WaitListDefinitionDto[]>;
  findById(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null>;
  isDefinitionRegistrationOpen(data: wl.WaitListDefinitionIdDto): Promise<boolean>;
  create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto>;
}

/**
 * Repository type for managing waitlist entries
 */
export type WaitListEntryRepository = {
  create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
}
