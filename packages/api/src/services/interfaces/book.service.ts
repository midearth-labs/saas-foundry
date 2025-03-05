import { BookServiceShape } from '../../api/schema/bookstore/book.schema';
import { BookstoreAdminContext, BookstorePublicContext } from '../../trpc/base-procedures/bookstore';

export type BookService = {
  create(opts: { ctx: BookstoreAdminContext, input: BookServiceShape['create']['input'] }): Promise<BookServiceShape['create']['output']>;
  get(opts: { ctx: BookstorePublicContext, input: BookServiceShape['get']['input'] }): Promise<BookServiceShape['get']['output']>;
  list(opts: { ctx: BookstorePublicContext, input: BookServiceShape['list']['input'] }): Promise<BookServiceShape['list']['output']>;
  update(opts: { ctx: BookstoreAdminContext, input: BookServiceShape['update']['input'] }): Promise<BookServiceShape['update']['output']>;
  remove(opts: { ctx: BookstoreAdminContext, input: BookServiceShape['remove']['input'] }): Promise<BookServiceShape['remove']['output']>;
}; 