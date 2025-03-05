import { TimestampsDto, StringIdDto } from "./common";

// 1. Enum Definitions
export enum BOOK_STATUS {
  AVAILABLE = "AVAILABLE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED"
};
export type BookStatus = keyof typeof BOOK_STATUS;

export enum ORDER_STATUS {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
};
export type OrderStatus = keyof typeof ORDER_STATUS;

/**
 * Data transfer objects for book operations
 */
export type BookIdDto = StringIdDto;

export type CreateBookDto = {
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  description?: string;
  price: number;
  pageCount?: number;
  publisher?: string;
  publishedYear?: number;
};

export type BookDto = BookIdDto & CreateBookDto & TimestampsDto;

export type UpdateBookDto = Partial<CreateBookDto>;

/**
 * Data transfer objects for order operations
 */
export type OrderIdDto = StringIdDto;

export type OrderItemDto = {
  bookId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderDto = {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDto[];
};

export type OrderDto = OrderIdDto & Omit<CreateOrderDto, 'items'> & TimestampsDto;

export type OrderWithItemsDto = OrderDto & {
  items: (OrderItemDto & StringIdDto)[];
};

export type UpdateOrderStatusDto = {
  status: OrderStatus;
}; 