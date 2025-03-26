import * as dotenv from "dotenv";
import path from "path";
import pg from "pg";

// Load environment variables from the root of the API package
//dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

async function resetDatabase() {
  console.log("Resetting database...");

  let [
    user,
    password,
    host,
    port,
    database] = [
      process.env.DATABASE_USERNAME || "postgres",
      process.env.DATABSE_PASSWORD || "postgres",
      process.env.DATABASE_HOST || "localhost",
      process.env.DATABASE_PORT || 5432,
      process.env.DATABASE_NAME || "saasfoundry"]

  // Connect to postgres database instead of the target database
  const adminClient = new pg.Client({
    user,
    password,
    host,
    port,
    database: 'postgres'  // Connect to postgres database instead of the target
  });

  try {
    await adminClient.connect();

    try {
      // Disconnect all users from the database
      console.log(`Disconnecting all users from ${database}...`);
      await adminClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity 
        WHERE datname = $1 
          AND pid <> pg_backend_pid()
      `, [database]);

      // Drop and recreate the database
      console.log(`Dropping ${database} database...`);
      await adminClient.query(`DROP DATABASE IF EXISTS "${database}"`);
      console.log(`Creating ${database} database...`);
      await adminClient.query(`CREATE DATABASE "${database}"`);
      console.log(`Database ${database} has been reset successfully!`);
    } catch (err) {
      if (err.code === '3D000') {
        // Database doesn't exist, just create it
        console.log(`Database ${database} doesn't exist, creating...`);
        await adminClient.query(`CREATE DATABASE "${database}"`);
        console.log(`Database ${database} created successfully!`);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Error resetting database:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    process.exit(1);
  } finally {
    try {
      await adminClient.end();
    } catch (err) {
      console.error("Error closing connection:", err.message);
    }
  }
}

// Run the function
resetDatabase().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
