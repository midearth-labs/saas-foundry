import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the root of the API package
//dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

async function resetDatabase() {
  console.log("Resetting database...");

  // First connect to default postgres database
  const adminClient = new pg.Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres",
  });

  try {
    await adminClient.connect();

    // Disconnect all users from the database
    await adminClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'saasfoundry'
        AND pid <> pg_backend_pid();
    `);

    // Drop and recreate the database
    console.log("Dropping saasfoundry database...");
    await adminClient.query("DROP DATABASE IF EXISTS saasfoundry");
    console.log("Recreating saasfoundry database...");
    await adminClient.query("CREATE DATABASE saasfoundry");
    const [dbAdrStart, dbAdrLen] = [process.env.DATABASE_URL.indexOf("@"), process.env.DATABASE_URL.length];
    console.log(`All tables in <DB>${process.env.DATABASE_URL.slice(dbAdrStart, dbAdrLen)} dropped!`);
    "dd".indexOf("@")
  } catch (error) {
    console.error("Error deleting database:", error);
  } finally {
    await adminClient.end();
  }
}

resetDatabase();
