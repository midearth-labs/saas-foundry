import { OrderServiceShape } from '../../api/schema/bookstore/order.schema';
import { BookstoreAdminContext, BookstorePublicContext } from '../../trpc/base-procedures/bookstore';

export type OrderService = {
  create(opts: { ctx: BookstorePublicContext, input: OrderServiceShape['create']['input'] }): Promise<OrderServiceShape['create']['output']>;
  get(opts: { ctx: BookstorePublicContext, input: OrderServiceShape['get']['input'] }): Promise<OrderServiceShape['get']['output']>;
  list(opts: { ctx: BookstoreAdminContext, input: OrderServiceShape['list']['input'] }): Promise<OrderServiceShape['list']['output']>;
  updateStatus(opts: { ctx: BookstoreAdminContext, input: OrderServiceShape['updateStatus']['input'] }): Promise<OrderServiceShape['updateStatus']['output']>;
}; 