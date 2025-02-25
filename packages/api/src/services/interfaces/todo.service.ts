import * as wl from '../../models/waitlist.model';
/**
 * Service interface for managing waitlist definitions
 */
export interface WaitListDefinitionService {
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
   */
  get(id: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null>;
}

/**
 * Service interface for managing waitlist entries
 */
export interface WaitListEntryService {
  /**
   * Create a new waitlist entry
   */
  create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto>;
}
