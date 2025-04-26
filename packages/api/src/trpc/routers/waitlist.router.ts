import { WaitlistServiceRouter, EntryServiceRouter, DefinitionServiceRouter } from "../../services/interfaces/waitlist.service";
import { waitListDefinitionService, waitListEntryService } from "../../services/impl/waitlist.service";
import { DefinitionRoutesConfiguration } from "../../api/schema/waitlist/definition.schema";
import { EntryRoutesConfiguration } from "../../api/schema/waitlist/entry.schema";
import { 
    waitlistAdminProcedure, 
    waitlistPublicProcedure, 
    waitlistAnalysisProcedure, 
    waitlistProtectedProcedure, 
    waitlistSubscriptionValidationProcedure 
} from "../base-procedures/waitlist";
import { BASIC_PLAN, PRO_PLAN, STANDARD_PLAN } from "../../auth/stripe";


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
     // .meta({ subscription: { [BASIC_PLAN]: "active" } })  // Not required: implicitly defined basic tier usage for all public procedures
        .input(EntryRoutesConfiguration.create.input)
        .mutation(waitListEntryService.create),

    createProEntry: waitlistSubscriptionValidationProcedure
        .meta({ subscription: { [PRO_PLAN]: "active" } })
        .input(EntryRoutesConfiguration.createProEntry.input)
        .mutation(waitListEntryService.createProEntry),

    createStandardEntry: waitlistSubscriptionValidationProcedure
        .meta({ subscription: { [STANDARD_PLAN]: "active" } })
        .input(EntryRoutesConfiguration.createStandardEntry.input)
        .mutation(waitListEntryService.createStandardEntry),

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
