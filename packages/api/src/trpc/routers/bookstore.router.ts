import { BookServiceRouter } from '../../api/schema/bookstore/book.schema';
import { OrderServiceRouter } from '../../api/schema/bookstore/order.schema';
import { BookRoutesConfiguration } from '../../api/schema/bookstore/book.schema';
import { OrderRoutesConfiguration } from '../../api/schema/bookstore/order.schema';
import { bookService } from '../../services/impl/book.service';
import { orderService } from '../../services/impl/order.service';
import { bookstoreAdminProcedure, bookstorePublicProcedure } from '../base-procedures/bookstore';
import { BookstoreServiceRouter } from '../../api/schema/bookstore';

export const bookRouterConfiguration: BookServiceRouter = {
  create: bookstoreAdminProcedure
    .input(BookRoutesConfiguration.create.input)
    .mutation(bookService.create),
  
  get: bookstorePublicProcedure
    .input(BookRoutesConfiguration.get.input)
    .query(bookService.get),
  
  list: bookstorePublicProcedure
    .input(BookRoutesConfiguration.list.input)
    .query(bookService.list),
  
  update: bookstoreAdminProcedure
    .input(BookRoutesConfiguration.update.input)
    .mutation(bookService.update),
  
  remove: bookstoreAdminProcedure
    .input(BookRoutesConfiguration.remove.input)
    .mutation(bookService.remove),
};

export const orderRouterConfiguration: OrderServiceRouter = {
  create: bookstorePublicProcedure
    .input(OrderRoutesConfiguration.create.input)
    .mutation(orderService.create),
    
  get: bookstorePublicProcedure
    .input(OrderRoutesConfiguration.get.input)
    .query(orderService.get),
    
  list: bookstoreAdminProcedure
    .input(OrderRoutesConfiguration.list.input)
    .query(orderService.list),
    
  updateStatus: bookstoreAdminProcedure
    .input(OrderRoutesConfiguration.updateStatus.input)
    .mutation(orderService.updateStatus),
};


export const bookstoreRouterConfigurations: BookstoreServiceRouter = {
  book: bookRouterConfiguration,
  order: orderRouterConfiguration
}
