import { TRPCError } from '@trpc/server';
import { BookService } from '../interfaces/book.service';

export const bookService: BookService = {
  async create({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    // Check if book with ISBN already exists
    const existingBook = await bookRepository.findByIsbn(input.isbn);
    if (existingBook) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A book with this ISBN already exists'
      });
    }
    
    return await bookRepository.create(input);
  },
  
  async get({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    const book = await bookRepository.findById(input);
    if (!book) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Book not found'
      });
    }
    
    // Convert undefined to null for optional fields
    return {
      ...book,
      description: book.description ?? null,
      pageCount: book.pageCount ?? null,
      publisher: book.publisher ?? null,
      publishedYear: book.publishedYear ?? null
    };
  },
  
  async list({ ctx: { bookstoreContext: { bookRepository } } }) {
    const books = await bookRepository.findAll();
    
    // Convert undefined to null for optional fields in each book
    return books.map(book => ({
      ...book,
      description: book.description ?? null,
      pageCount: book.pageCount ?? null,
      publisher: book.publisher ?? null,
      publishedYear: book.publishedYear ?? null
    }));
  },
  
  async update({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    const { id, data } = input;
    
    // Check if book exists
    const book = await bookRepository.findById({ id });
    if (!book) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Book not found'
      });
    }
    
    // If ISBN is being updated, check if it's unique
    if (data.isbn && data.isbn !== book.isbn) {
      const existingBook = await bookRepository.findByIsbn(data.isbn);
      if (existingBook) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A book with this ISBN already exists'
        });
      }
    }
    
    return await bookRepository.update(id, data);
  },
  
  async remove({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    // Check if book exists
    const book = await bookRepository.findById(input);
    if (!book) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Book not found'
      });
    }
    
    return await bookRepository.remove(input);
  }
}; 