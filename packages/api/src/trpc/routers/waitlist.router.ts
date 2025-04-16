import { WaitlistServiceRouter, EntryServiceRouter, DefinitionServiceRouter } from "../../services/interfaces/waitlist.service";
import { waitListDefinitionService, waitListEntryService } from "../../services/impl/waitlist.service";
import { waitlistAdminProcedure, waitlistPublicProcedure, waitlistAnalysisProcedure } from "../base-procedures/waitlist";
import { DefinitionRoutesConfiguration } from "../../api/schema/waitlist/definition.schema";
import { EntryRoutesConfiguration } from "../../api/schema/waitlist/entry.schema";

const definitionRouter: DefinitionServiceRouter = {
    create: waitlistAdminProcedure
        .meta({ permission: { waitlistDefinition: ["create"] } })
        .input(DefinitionRoutesConfiguration.create.input)
        .mutation(waitListDefinitionService.create),

    get: waitlistAdminProcedure
        .meta({ permission: { waitlistDefinition: ["get"] } })
        .input(DefinitionRoutesConfiguration.get.input)
        .query(waitListDefinitionService.get),

    list: waitlistAdminProcedure
        .meta({ permission: { waitlistDefinition: ["list"] } })
        .input(DefinitionRoutesConfiguration.list.input)
        .query(waitListDefinitionService.list),

    getStats: waitlistAdminProcedure
        .meta({ permission: { waitlistDefinition: ["getStats"] } })
        .input(DefinitionRoutesConfiguration.getStats.input)
        .query(waitListDefinitionService.getStats),

    getActiveCount: waitlistPublicProcedure
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

    searchEntries: waitlistAnalysisProcedure
        .meta({ permission: { waitlistEntry: ["searchEntries"] } })
        .input(EntryRoutesConfiguration.searchEntries.input)
        .query(waitListEntryService.searchEntries),
};

export const waitlistRouterConfiguration: WaitlistServiceRouter = {
    definition: definitionRouter,
    entry: entryRouter,
};
