import { z } from 'zod';

export const bookId = z.string().uuid();
export const orderId = z.string().uuid(); 