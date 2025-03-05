import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the root of the API package
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function setupDatabase() {
  console.log("Setting up database...");
  
  // First connect to default postgres database
  const adminClient = new pg.Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
  });
  
  try {
    await adminClient.connect();
    
    // Check if saasfoundry database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'saasfoundry'"
    );
    
    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log("Creating saasfoundry database...");
      await adminClient.query("CREATE DATABASE saasfoundry");
      console.log("Database created successfully!");
    } else {
      console.log("Database saasfoundry already exists.");
    }
    
    console.log("Database setup completed!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await adminClient.end();
  }
}

setupDatabase(); 