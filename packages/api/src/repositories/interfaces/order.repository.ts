import * as o from '../../models/bookstore.model';

/**
 * Repository interface for managing orders
 */
export type OrderRepository = {
  findAll(): Promise<o.OrderDto[]>;
  findById(data: o.OrderIdDto): Promise<o.OrderWithItemsDto | null>;
  create(data: o.CreateOrderDto): Promise<o.OrderIdDto>;
  updateStatus(id: string, data: o.UpdateOrderStatusDto): Promise<o.OrderIdDto>;
}; 