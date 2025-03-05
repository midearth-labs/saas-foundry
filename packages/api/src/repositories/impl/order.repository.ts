import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as o from '../../models/bookstore.model';
import { OrderRepository } from '../interfaces/order.repository';
import { ordersTable, orderItemsTable } from '../../db/schema/bookstore.schema';
import { eq } from 'drizzle-orm';

/**
 * Repository implementation for managing orders
 */
export const createDrizzleOrderRepository = (db: NodePgDatabase<any>): OrderRepository => {
  return {
    async findAll(): Promise<o.OrderDto[]> {
      const orders = await db.select().from(ordersTable);
      
      return orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        status: order.status as o.OrderStatus,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
    },

    async findById(data: o.OrderIdDto): Promise<o.OrderWithItemsDto | null> {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, data.id));
      
      if (!order) return null;
      
      const orderItems = await db.select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, data.id));
      
      return {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        status: order.status as o.OrderStatus,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: orderItems.map(item => ({
          id: item.id,
          bookId: item.bookId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice)
        }))
      };
    },

    async create(data: o.CreateOrderDto): Promise<o.OrderIdDto> {
      const idDto: o.OrderIdDto = { id: crypto.randomUUID() };
      const now = new Date();
      
      // Start a transaction
      await db.transaction(async (tx) => {
        // Insert order
        await tx.insert(ordersTable).values({
          id: idDto.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          shippingAddress: data.shippingAddress,
          status: data.status,
          totalAmount: String(data.totalAmount),
          createdAt: now,
          updatedAt: now
        });
        
        // Insert order items
        for (const item of data.items) {
          await tx.insert(orderItemsTable).values({
            id: crypto.randomUUID(),
            orderId: idDto.id,
            bookId: item.bookId,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            createdAt: now,
            updatedAt: now
          });
        }
      });

      return idDto;
    },

    async updateStatus(id: string, data: o.UpdateOrderStatusDto): Promise<o.OrderIdDto> {
      await db.update(ordersTable)
        .set({ status: data.status })
        .where(eq(ordersTable.id, id));
      
      return { id };
    }
  };
}; 