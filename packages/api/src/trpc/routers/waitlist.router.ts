import { waitlistAdminProcedure, waitlistPublicProcedure } from '../base-procedures/waitlist';
import { DefinitionServiceRouter, DefinitionRoutesConfiguration } from '../../api/schema/waitlist/definition.schema';
import { EntryServiceRouter, EntryRoutesConfiguration } from '../../api/schema/waitlist/entry.schema';
import { waitListDefinitionService, waitListEntryService } from '../../services/impl/waitlist.service';
import { WaitlistServiceRouter } from "../../api/schema/waitlist";

const definitionRouter: DefinitionServiceRouter = {
  list: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration.list.input)
    .query(waitListDefinitionService.list),

  get: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration.get.input)
    .query(waitListDefinitionService.get),

  create: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration.create.input)
    .mutation(waitListDefinitionService.create),
};

const entryRouter: EntryServiceRouter = {
  create: waitlistPublicProcedure
    .input(EntryRoutesConfiguration.create.input)
    .mutation(waitListEntryService.create),
};

export const waitlistRouterConfiguration: WaitlistServiceRouter  = {
    definition: definitionRouter,
    entry: entryRouter,
}