import * as dotenv from "dotenv";
import path from "path"
import pg from "pg";

// Get the directory name of the current module
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load environment variables from the root of the API package
// dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

async function setupDatabase() {
  console.log("Setting up database...");
  
  let 
    user = process.env.DATABASE_USERNAME || "postgres",
    password = process.env.DATABSE_PASSWORD || "postgres",
    host = process.env.DATABASE_HOST || "localhost",
    port = process.env.DATABASE_PORT || 5432,
    database = process.env.DATABASE_NAME || "saasfoundry";

  // First connect to default postgres database
  const adminClient = new pg.Client({
    user,
    password,
    host,
    port,
    // database,
  });
  
  try {
    await adminClient.connect();
    
    try {
      // First connect to postgres database to be able to create new databases
      await adminClient.query('SELECT datname FROM pg_database WHERE datname = $1', [database]);
      console.log(`Creating ${database} database...`);
      // Need to use double quotes to preserve case sensitivity
      await adminClient.query(`CREATE DATABASE "${database}"`);
      console.log("Database created successfully!");
    } catch (err) {
      if (err.code === '42P04') {
        // 42P04 is the error code when database already exists
        console.log(`Database "${database}" already exists`);
      } else if (err.code === '3D000') {
        // 3D000 is invalid database error, likely means we need to connect to 'postgres' db first
        console.log('Connecting to postgres database first...');
        adminClient.database = 'postgres';
        await adminClient.query(`CREATE DATABASE "${database}"`);
        console.log("Database created successfully!");
      } else {
        throw err; // Re-throw unexpected errors
      }
    }

    console.log("Database setup completed!");
  } catch (error) {
    console.error("Error setting up database:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    process.exit(1); // Exit with error code
  } finally {
    try {
      await adminClient.end();
    } catch (err) {
      console.error("Error closing connection:", err.message);
    }
  }
}

// Run the function
setupDatabase().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
}); 