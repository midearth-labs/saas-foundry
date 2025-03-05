import * as b from '../../models/bookstore.model';

/**
 * Repository interface for managing books
 */
export type BookRepository = {
  findAll(): Promise<b.BookDto[]>;
  findById(data: b.BookIdDto): Promise<b.BookDto | null>;
  create(data: b.CreateBookDto): Promise<b.BookIdDto>;
  update(id: string, data: b.UpdateBookDto): Promise<b.BookIdDto>;
  remove(data: b.BookIdDto): Promise<b.BookIdDto>;
  findByIsbn(isbn: string): Promise<b.BookDto | null>;
}; 