const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function initDatabase() {
  const { pool } = require('./db');
  if (!pool) {
    throw new Error('Missing DATABASE_URL. Configure your Postgres connection string first.');
  }

  await pool.query(schemaSql);
  console.log('Database initialized successfully.');
}

if (require.main === module) {
  initDatabase().catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { initDatabase };
