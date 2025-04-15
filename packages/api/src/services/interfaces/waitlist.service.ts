import { DefinitionServiceShape } from '../../api/schema/waitlist/definition.schema';
import { EntryServiceShape } from '../../api/schema/waitlist/entry.schema';
import { WaitlistAdminContext, WaitlistPublicContext } from '../../trpc/base-procedures/waitlist';

// @TODO: This type should be inferred from the schema by passing in the ctx type per operation
/**
 * Service interface for managing waitlist definitions
 */
export type WaitListDefinitionService = {
  /**
   * Create a new waitlist definition
   */
  create(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['create']['input'] }): Promise<DefinitionServiceShape['create']['output']>;

  /**
   * Get all waitlist definitions
   */
  list(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['list']['input'] }): Promise<DefinitionServiceShape['list']['output']>;

  /**
   * Get a waitlist definition by ID
   * Throws a domain notfound error if the definition is not found
   */
  get(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['get']['input'] }): Promise<DefinitionServiceShape['get']['output']>;

  /**
   * Get statistics for a waitlist definition
   */
  getStats(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['getStats']['input'] }): Promise<DefinitionServiceShape['getStats']['output']>;

  /**
   * Get active entry count for a waitlist definition
   */
  getActiveCount(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['getActiveCount']['input'] }): Promise<DefinitionServiceShape['getActiveCount']['output']>;
}

/**
 * Service interface for managing waitlist entries
 */
export type WaitListEntryService = {
  /**
   * Create a new waitlist entry
   */
  create(opts: { ctx: WaitlistPublicContext, input: EntryServiceShape['create']['input'] }): Promise<EntryServiceShape['create']['output']>;

  /**
   * Update status of a waitlist entry
   */
  updateStatus(opts: { ctx: WaitlistAdminContext, input: EntryServiceShape['updateStatus']['input'] }): Promise<EntryServiceShape['updateStatus']['output']>;

  /**
   * Get a single waitlist entry
   */
  getEntry(opts: { ctx: WaitlistAdminContext, input: EntryServiceShape['getEntry']['input'] }): Promise<EntryServiceShape['getEntry']['output']>;

  /**
   * Search waitlist entries with filters
   */
  searchEntries(opts: { ctx: WaitlistAdminContext, input: EntryServiceShape['searchEntries']['input'] }): Promise<EntryServiceShape['searchEntries']['output']>;
}
