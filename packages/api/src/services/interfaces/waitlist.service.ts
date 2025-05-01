import { ConvertRoutesToType } from "../../api/types/schema.zod.configuration";
import { DefinitionRoutesConfiguration } from "../../api/schema/waitlist/definition.schema";
import { EntryRoutesConfiguration } from "../../api/schema/waitlist/entry.schema";
import { WaitlistPublicContext, WaitlistAdminContext, WaitlistAnalysisContext, WaitlistSubscriptionProtectedContext } from "../../trpc/base-procedures/waitlist";

export type DefinitionServiceShape = ConvertRoutesToType<typeof DefinitionRoutesConfiguration>;
export type EntryServiceShape = ConvertRoutesToType<typeof EntryRoutesConfiguration>;

/**
 * Service interface for managing waitlist definitions
 */
export type WaitListDefinitionService = {
    /**
     * Create a new waitlist definition
     */
    create(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['create']['input'] }): Promise<DefinitionServiceShape['create']['output']>;

    /**
     * Get a single waitlist definition
     */
    get(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['get']['input'] }): Promise<DefinitionServiceShape['get']['output']>;

    /**
     * List all waitlist definitions
     */
    list(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['list']['input'] }): Promise<DefinitionServiceShape['list']['output']>;

    /**
     * Get statistics for a waitlist definition
     */
    getStats(opts: { ctx: WaitlistAdminContext, input: DefinitionServiceShape['getStats']['input'] }): Promise<DefinitionServiceShape['getStats']['output']>;

    /**
     * Get active count for a waitlist definition
     */
    getActiveCount(opts: { ctx: WaitlistPublicContext, input: DefinitionServiceShape['getActiveCount']['input'] }): Promise<DefinitionServiceShape['getActiveCount']['output']>;
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
     * Get subscription dummy data (for testing)
     */
    getSubscriptionDummyData(opts: { ctx: WaitlistSubscriptionProtectedContext, input: EntryServiceShape['subscriptionWaitlistDummy']['input'] }): Promise<EntryServiceShape['subscriptionWaitlistDummy']['output']>;

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
    searchEntries(opts: { ctx: WaitlistAnalysisContext, input: EntryServiceShape['searchEntries']['input'] }): Promise<EntryServiceShape['searchEntries']['output']>;
}
