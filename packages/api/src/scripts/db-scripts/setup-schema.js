import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the root of the API package
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function createTables() {
  console.log("Creating Drizzle-compatible tables...");

  // Connect to the saasfoundry database
  const client = new pg.Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "saasfoundry",
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Create enum types
    console.log("Creating enum types...");
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_status') THEN
          CREATE TYPE book_status AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
          CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
        END IF;
      END $$;
    `);
    console.log("Enum types created");

    // Create books table with exact column names from Drizzle schema
    console.log("Creating books table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        author VARCHAR(256) NOT NULL,
        isbn VARCHAR(20) NOT NULL UNIQUE,
        status book_status NOT NULL DEFAULT 'AVAILABLE',
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        "page_count" INTEGER,
        publisher VARCHAR(256),
        "published_year" INTEGER,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL
      );
    `);
    console.log("Books table created");

    // Create orders table with exact column names from Drizzle schema
    console.log("Creating orders table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        "customer_name" VARCHAR(256) NOT NULL,
        "customer_email" VARCHAR(256) NOT NULL,
        "shipping_address" TEXT NOT NULL,
        status order_status NOT NULL DEFAULT 'PENDING',
        "total_amount" DECIMAL(10, 2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL
      );
    `);
    console.log("Orders table created");

    // Create order_items table with exact column names from Drizzle schema
    console.log("Creating order_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY,
        "order_id" UUID NOT NULL REFERENCES orders(id),
        "book_id" UUID NOT NULL REFERENCES books(id),
        quantity INTEGER NOT NULL,
        "unit_price" DECIMAL(10, 2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL
      );
    `);
    console.log("Order_items table created");

    // Verify tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(
      "Tables in database:",
      tables.rows.map((row) => row.table_name)
    );

    // Verify columns in books table
    const booksColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'books'
    `);
    console.log(
      "Books table columns:",
      booksColumns.rows.map((row) => row.column_name)
    );

    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
}

createTables();
