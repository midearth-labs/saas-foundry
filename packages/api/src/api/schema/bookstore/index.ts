import { InferredServiceRoutes, ZodRoutes } from "../../types/schema.zod.configuration";
import { OrderRoutesConfiguration } from "./order.schema";
import { BookRoutesConfiguration } from "./book.schema";

export const BookstoreRoutesConfiguration = {
  book: BookRoutesConfiguration,
  order: OrderRoutesConfiguration,
} satisfies ZodRoutes;

export type BookstoreServiceRouter = InferredServiceRoutes<typeof BookstoreRoutesConfiguration>

