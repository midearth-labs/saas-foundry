import { waitListDefinitionService, waitListEntryService } from "../../services/impl/waitlist.service";
import { waitlistAdminProcedure, waitlistPublicProcedure, waitlistAnalysisProcedure, waitlistSubscriptionProtectedProcedure } from "../base-procedures/waitlist";
import { DefinitionServiceRouter, DefinitionRoutesConfiguration, EntryServiceRouter, EntryRoutesConfiguration, WaitlistServiceRouter } from "@saas-foundry/api-model/waitlist";
import { PRO_PLAN } from "../../auth/stripe";
 
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
    
    // dummy endpoint for testing Stripe integration
    subscriptionWaitlistDummy: waitlistSubscriptionProtectedProcedure
        .meta({ subscription: { [PRO_PLAN]: "active" } })
        .input(EntryRoutesConfiguration.subscriptionWaitlistDummy.input)
        .query(waitListEntryService.getSubscriptionDummyData),
};

export const waitlistRouterConfiguration: WaitlistServiceRouter = {
    definition: definitionRouter,
    entry: entryRouter,
};
