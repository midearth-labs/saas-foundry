import * as wl from '../../models/waitlist.model';
/**
 * Service interface for managing waitlist definitions
 */
export type WaitListDefinitionService = {
  /**
   * Create a new waitlist definition
   */
  create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto>;

  /**
   * Get all waitlist definitions
   */
  list(): Promise<wl.WaitListDefinitionDto[]>;

  /**
   * Get a waitlist definition by ID
   * Throws a domain notfound error if the definition is not found
   */
  get(id: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto>;
}

/**
 * Service interface for managing waitlist entries
 */
export type WaitListEntryService = {
  /**
   * Create a new waitlist entry
   */
  create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
}
