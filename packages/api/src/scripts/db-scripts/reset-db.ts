// This script will clear all values from the tables specified below, in the database.
// It will not drop any tables or schemas or any other configs.
import { 
  user, 
  session, 
  account, 
  verification,
} from "../../db/schema/auth.schema";

import { 
  booksTable, 
  ordersTable, 
  orderItemsTable 
} from "../../db/schema/bookstore.schema";

import {
  waitlistDefinitions,
  waitlistEntries
} from "../../db/schema/waitlist.schema";

import { reset } from "drizzle-seed";
import { createDBConnection } from "../../db";
import * as dotenv from "dotenv";
import path from "path";


dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const tables = [
  user, 
  session, 
  account, 
  verification, 
  booksTable, 
  ordersTable, 
  orderItemsTable, 
  waitlistDefinitions, 
  waitlistEntries
];

async function main() {
  try {
    const db = createDBConnection();
    await reset(db, tables);
    console.log("Database reset successfully! All values cleared.");
  } catch (error) {
    console.error(`Error resetting database: ${error}`);
    process.exit(1);
  }
}

main();
