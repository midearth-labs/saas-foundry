import { TRPCError } from '@trpc/server';
import { OrderService } from '../interfaces/order.service';

export const orderService: OrderService = {
  async create({ input, ctx: { bookstoreContext: { orderRepository, bookRepository } } }) {
    // Validate that all books exist
    for (const item of input.items) {
      const book = await bookRepository.findById({ id: item.bookId });
      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Book with ID ${item.bookId} not found`
        });
      }
      
      // Check if book is available
      if (book.status !== 'AVAILABLE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Book "${book.title}" is not available for purchase`
        });
      }
    }
    
    return await orderRepository.create(input);
  },
  
  async get({ input, ctx: { bookstoreContext: { orderRepository } } }) {
    const order = await orderRepository.findById(input);
    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found'
      });
    }
    return order;
  },
  
  async list({ ctx: { bookstoreContext: { orderRepository } } }) {
    return await orderRepository.findAll();
  },
  
  async updateStatus({ input, ctx: { bookstoreContext: { orderRepository } } }) {
    const { id, status } = input;
    
    // Check if order exists
    const order = await orderRepository.findById({ id });
    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found'
      });
    }
    
    return await orderRepository.updateStatus(id, { status });
  }
}; 