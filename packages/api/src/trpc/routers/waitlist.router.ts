import { waitlistAdminProcedure, waitlistPublicProcedure } from '../base-procedures/waitlist';
import { DefinitionServiceRouter, DefinitionRoutesConfiguration } from '../../api/schema/waitlist/definition.schema';
import { EntryServiceRouter, EntryRoutesConfiguration } from '../../api/schema/waitlist/entry.schema';
import { waitListDefinitionService, waitListEntryService } from '../../services/impl/waitlist.service';
import { WaitlistServiceRouter } from "../../api/schema/waitlist";

const definitionRouter: DefinitionServiceRouter = {
  list: waitlistAdminProcedure
    .meta({ permission: { waitlistDefinition: ["list"] } })
    .input(DefinitionRoutesConfiguration.list.input)
    .query(waitListDefinitionService.list),

  get: waitlistAdminProcedure
    .meta({ permission: { waitlistDefinition: ["get"] } })
    .input(DefinitionRoutesConfiguration.get.input)
    .query(waitListDefinitionService.get),

  create: waitlistAdminProcedure
    .meta({ permission: { waitlistDefinition: ["create"] } })
    .input(DefinitionRoutesConfiguration.create.input)
    .mutation(waitListDefinitionService.create),

  getStats: waitlistAdminProcedure
    .meta({ permission: { waitlistDefinition: ["getStats"] } })
    .input(DefinitionRoutesConfiguration.getStats.input)
    .query(waitListDefinitionService.getStats),

  getActiveCount: waitlistAdminProcedure
    .meta({ permission: { waitlistDefinition: ["getActiveCount"] } })
    .input(DefinitionRoutesConfiguration.getActiveCount.input)
    .query(waitListDefinitionService.getActiveCount),
};

const entryRouter: EntryServiceRouter = {
  create: waitlistPublicProcedure
    .input(EntryRoutesConfiguration.create.input)
    .mutation(waitListEntryService.create),

  updateStatus: waitlistAdminProcedure
    .meta({ permission: { waitlistEntry: ["updateStatus"] } })
    .input(EntryRoutesConfiguration.updateStatus.input)
    .mutation(waitListEntryService.updateStatus),

  getEntry: waitlistAdminProcedure
    .meta({ permission: { waitlistEntry: ["getEntry"] } })
    .input(EntryRoutesConfiguration.getEntry.input)
    .query(waitListEntryService.getEntry),

  searchEntries: waitlistAdminProcedure
    .meta({ permission: { waitlistEntry: ["searchEntries"] } })
    .input(EntryRoutesConfiguration.searchEntries.input)
    .query(waitListEntryService.searchEntries),
};

export const waitlistRouterConfiguration: WaitlistServiceRouter  = {
    definition: definitionRouter,
    entry: entryRouter,
}
