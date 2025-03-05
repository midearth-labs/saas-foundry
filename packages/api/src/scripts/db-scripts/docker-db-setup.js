const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the root directory of the API package
const apiRoot = path.resolve(__dirname, '../../..');

function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  return execSync(command, {
    cwd: apiRoot,
    stdio: 'inherit',
    ...options
  });
}

function checkDockerInstalled() {
  try {
    runCommand('docker --version', { stdio: 'pipe' });
    runCommand('docker-compose --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('Docker or Docker Compose is not installed. Please install Docker Desktop first.');
    return false;
  }
}

function startDatabase() {
  console.log('Starting PostgreSQL in Docker...');
  runCommand('docker-compose up -d postgres');
  console.log('\nPostgreSQL is now running in Docker!');
  console.log('Connection details:');
  console.log('  Host: localhost (from your machine) or postgres (from other Docker containers)');
  console.log('  Port: 5432');
  console.log('  User: postgres');
  console.log('  Password: postgres');
  console.log('  Database: saasfoundry');
}

function stopDatabase() {
  console.log('Stopping PostgreSQL Docker container...');
  runCommand('docker-compose down');
}

function setupSchema() {
  console.log('Setting up database schema...');
  // Wait a moment for the database to be ready
  setTimeout(() => {
    try {
      // Use the existing setup-schema script
      require('./setup-schema');
    } catch (error) {
      console.error('Error setting up schema:', error);
    }
  }, 3000);
}

function showHelp() {
  console.log(`
Docker Database Management Script

Usage:
  node docker-db-setup.js [command]

Commands:
  start       Start the PostgreSQL Docker container
  stop        Stop the PostgreSQL Docker container
  restart     Restart the PostgreSQL Docker container
  setup       Set up the database schema (runs migrations)
  start-setup Start the database and set up the schema
  help        Show this help message
  `);
}

async function main() {
  if (!checkDockerInstalled()) {
    return;
  }

  const command = process.argv[2] || 'help';

  switch (command) {
    case 'start':
      startDatabase();
      break;
    case 'stop':
      stopDatabase();
      break;
    case 'restart':
      stopDatabase();
      startDatabase();
      break;
    case 'setup':
      setupSchema();
      break;
    case 'start-setup':
      startDatabase();
      setupSchema();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

main().catch(console.error); 