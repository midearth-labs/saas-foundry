import { InferredServiceRoutes, ZodRoutes } from "../../types/schema.zod.configuration";
import { DefinitionRoutesConfiguration } from "./definition.schema";
import { EntryRoutesConfiguration } from "./entry.schema";

export const WaitlistRoutesConfiguration = {
    definition: DefinitionRoutesConfiguration,
    entry: EntryRoutesConfiguration,
} satisfies ZodRoutes;

export type WaitlistServiceRouter = InferredServiceRoutes<typeof WaitlistRoutesConfiguration>