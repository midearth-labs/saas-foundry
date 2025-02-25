import { WaitlistServiceRouter } from "../../../api/schema/waitlist";
import { definitionRouter } from "./definition.router";
import { entryRouter } from "./entry.router";

export const waitlistRouterConfiguration: WaitlistServiceRouter  = {
    definition: definitionRouter,
    entry: entryRouter,
}