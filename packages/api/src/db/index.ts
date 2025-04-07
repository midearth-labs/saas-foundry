import 'dotenv/config';
import * as dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from "./schema/auth.schema";

// Load environment variables from the root of the API package
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

/*
The auth schema needs to be force passed here to address the below error:
# SERVER_ERROR:  [BetterAuthError: [# Drizzle Adapter]: The model "user" was not found in the schema object. Please pass the schema directly to the adapter options.] {
  cause: undefined
}
  https://www.answeroverflow.com/m/1346382832032813119#solution-1346388621954908180
*/
export const createDBConnection = () => {
  return drizzle(process.env.DATABASE_URL!, { schema: authSchema });
}

/**
 * @description Singleton GLOBAL instance of the database connection.
 * @see {@link createDBConnection}
 */
export const DB = createDBConnection();
