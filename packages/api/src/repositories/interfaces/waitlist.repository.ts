import * as wl from '../../models/waitlist.model';

/**
 * Repository type for managing waitlist definitions
 */
export type WaitListDefinitionRepository = {
  findAll(): Promise<wl.WaitListDefinitionDto[]>;
  findById(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null>;
  isDefinitionRegistrationOpen(data: wl.WaitListDefinitionIdDto): Promise<boolean>;
  create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto>;
  getStats(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionStatsDto>;
  getActiveCount(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionActiveCountDto>;
}

/**
 * Repository type for managing waitlist entries
 */
export type WaitListEntryRepository = {
  create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
  createProEntry(data: wl.CreateProWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
  createStandardEntry(data: wl.CreateStandardWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
  findById(data: wl.WaitListEntryIdDto): Promise<wl.WaitListEntryDto | null>;
  updateStatus(data: wl.UpdateWaitListEntryStatusDto): Promise<wl.WaitListEntryDto>;
  search(data: wl.SearchWaitListEntriesDto): Promise<wl.SearchWaitListEntriesResultDto>;
}
