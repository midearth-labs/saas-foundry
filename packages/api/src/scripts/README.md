# Bookstore API Test Scripts

This directory contains shell scripts for testing the Bookstore API endpoints. These scripts are designed to work on macOS and Linux systems.

## Prerequisites

- Bash shell
- `curl` for making HTTP requests
- `jq` for JSON parsing (install with `brew install jq` on macOS or `apt-get install jq` on Ubuntu)
- The Bookstore API server running on http://localhost:3005

## Available Shell Tests

- **test-book-create.sh**: Tests creating a new book
- **test-book-get.sh**: Tests retrieving a book by ID
- **test-book-list.sh**: Tests listing all books
- **test-book-update.sh**: Tests updating a book
- **test-book-remove.sh**: Tests removing a book
- **test-order-create.sh**: Tests creating a new order
- **test-order-get.sh**: Tests retrieving an order by ID
- **test-order-list.sh**: Tests listing all orders
- **test-order-update-status.sh**: Tests updating an order's status

## Running the Shell Tests

1. Make the scripts executable:
   ```
   chmod +x *.sh
   ```

2. Run individual tests:
   ```
   ./test-book-create.sh
   ```

3. Or run all tests:
   ```
   ./run-all-tests.sh
   ```

## PowerShell Tests

Equivalent PowerShell scripts are available in the `../powershell-api-tests/` directory for Windows users:

- **test-book-create.ps1**: Tests creating a new book
- **test-book-get.ps1**: Tests retrieving a book by ID
- **test-book-list.ps1**: Tests listing all books
- **test-book-update.ps1**: Tests updating a book
- **test-book-remove.ps1**: Tests removing a book
- **test-order-create.ps1**: Tests creating a new order
- **test-order-get.ps1**: Tests retrieving an order by ID
- **test-order-list.ps1**: Tests listing all orders
- **test-order-update-status.ps1**: Tests updating an order's status

## Database Scripts

The project also includes several database management scripts in the `../db-scripts/` directory:

### Setup Scripts
- **setup-db.js**: Creates the database if it doesn't exist
- **setup-schema.js**: Creates the necessary tables and types
- **reset-db.js**: Drops and recreates the database

### Table Creation Scripts
- **create-tables-direct.js**: Creates tables using direct SQL
- **create-tables-drizzle-compatible.js**: Creates tables compatible with Drizzle ORM

### Seed Scripts
- **seed-books.js**: Seeds the database with sample books
- **seed-direct.js**: Seeds the database with sample data using direct connection
- **seed-env-fix.js**: Seeds the database using environment variables

### Web Client
- **bookstore-test-client.html**: A simple web client for testing the API in a browser

## Notes

- The shell scripts use ANSI color codes for better readability in terminal
- Each script is independent and can be run separately
- The scripts handle error cases and provide detailed output
- The database scripts require Node.js and the necessary dependencies installed