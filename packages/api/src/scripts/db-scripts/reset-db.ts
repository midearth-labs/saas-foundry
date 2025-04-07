// This script will clear all values from the tables specified below, in the database.
// It will not drop any tables or schemas or any other configs.
import { 
  user, 
  session, 
  account, 
  verification,
  organization,
  member,
  invitation,
} from "../../db/schema/auth.schema";

import {
  waitlistDefinitions,
  waitlistEntries
} from "../../db/schema/waitlist.schema";

import { reset } from "drizzle-seed";
import { DB } from "../../db";
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
  waitlistDefinitions, 
  waitlistEntries,
  organization,
  member,
  invitation,
];

async function main() {
  try {
    await reset(DB, tables);
    console.log("Database reset successfully! All values cleared.");
  } catch (error) {
    console.error(`Error resetting database: ${error}`);
    process.exit(1);
  }
}

main();
