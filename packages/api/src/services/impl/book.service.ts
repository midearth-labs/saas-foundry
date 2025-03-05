import { TRPCError } from '@trpc/server';
import { BookService } from '../interfaces/book.service';

export const bookService: BookService = {
  async create({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    try {
      // Check if book with ISBN already exists
      const existingBook = await bookRepository.findByIsbn(input.isbn);
      if (existingBook) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A book with this ISBN already exists'
        });
      }
      
      return await bookRepository.create(input);
    } catch (error) {
      console.log(error)
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create book',
        cause: error
      });
    }
  },
  
  async get({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    try {
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
    } catch (error) {
      console.log(error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve book',
        cause: error
      });
    }
  },
  
  async list({ ctx: { bookstoreContext: { bookRepository } } }) {
    try {
      const books = await bookRepository.findAll();
      
      // Convert undefined to null for optional fields in each book
      return books.map(book => ({
        ...book,
        description: book.description ?? null,
        pageCount: book.pageCount ?? null,
        publisher: book.publisher ?? null,
        publishedYear: book.publishedYear ?? null
      }));
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list books',
        cause: error
      });
    }
  },
  
  async update({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    try {
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
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update book',
        cause: error
      });
    }
  },
  
  async remove({ input, ctx: { bookstoreContext: { bookRepository } } }) {
    try {
      // Check if book exists
      const book = await bookRepository.findById(input);
      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found'
        });
      }
      
      return await bookRepository.remove(input);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove book',
        cause: error
      });
    }
  }
}; 