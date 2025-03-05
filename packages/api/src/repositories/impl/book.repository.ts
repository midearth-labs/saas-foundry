import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as b from '../../models/bookstore.model';
import { BookRepository } from '../interfaces/book.repository';
import { booksTable } from '../../db/schema/bookstore.schema';
import { eq } from 'drizzle-orm';

/**
 * Repository implementation for managing books
 */
export const createDrizzleBookRepository = (db: NodePgDatabase<any>): BookRepository => {
  return {
    async findAll(): Promise<b.BookDto[]> {
      const books = await db.select().from(booksTable);
      return books.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        status: book.status as b.BookStatus,
        description: book.description || undefined,
        price: Number(book.price),
        pageCount: book.pageCount || undefined,
        publisher: book.publisher || undefined,
        publishedYear: book.publishedYear || undefined,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      }));
    },

    async findById(data: b.BookIdDto): Promise<b.BookDto | null> {
      const [book] = await db.select().from(booksTable).where(eq(booksTable.id, data.id));
      
      if (!book) return null;
      
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        status: book.status as b.BookStatus,
        description: book.description || undefined,
        price: Number(book.price),
        pageCount: book.pageCount || undefined,
        publisher: book.publisher || undefined,
        publishedYear: book.publishedYear || undefined,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      };
    },

    async create(data: b.CreateBookDto): Promise<b.BookIdDto> {
      const idDto: b.BookIdDto = { id: crypto.randomUUID() };
      const now = new Date();
      
      await db.insert(booksTable).values({
        id: idDto.id,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        status: data.status,
        description: data.description,
        price: String(data.price),
        pageCount: data.pageCount,
        publisher: data.publisher,
        publishedYear: data.publishedYear,
        createdAt: now,
        updatedAt: now
      });

      return idDto;
    },

    async update(id: string, data: b.UpdateBookDto): Promise<b.BookIdDto> {
      const updatedData: any = { ...data, updatedAt: new Date() };
      
      if (updatedData.price !== undefined) {
        updatedData.price = String(updatedData.price);
      }
      
      await db.update(booksTable)
        .set(updatedData)
        .where(eq(booksTable.id, id));
      
      return { id };
    },

    async remove(data: b.BookIdDto): Promise<b.BookIdDto> {
      await db.delete(booksTable).where(eq(booksTable.id, data.id));
      return data;
    },

    async findByIsbn(isbn: string): Promise<b.BookDto | null> {
      const [book] = await db.select().from(booksTable).where(eq(booksTable.isbn, isbn));
      
      if (!book) return null;
      
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        status: book.status as b.BookStatus,
        description: book.description || undefined,
        price: Number(book.price),
        pageCount: book.pageCount || undefined,
        publisher: book.publisher || undefined,
        publishedYear: book.publishedYear || undefined,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      };
    }
  };
}; 