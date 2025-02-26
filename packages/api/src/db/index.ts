import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const createDBConnection = () => {
  return drizzle(process.env.DATABASE_URL!);
}
