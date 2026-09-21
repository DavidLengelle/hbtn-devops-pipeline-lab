'use strict';

const fs = require('fs');
const path = require('path');

const { query, closePool } = require('./connection');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function migrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

/**
 * Apply every migration, in file-name order. All statements are idempotent, so
 * this is safe to run on every boot and at the start of every integration run.
 */
async function runMigrations() {
  const files = migrationFiles();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await query(sql);
  }
  return files;
}

/** Retry wrapper, for the seconds where the database container is still booting. */
async function runMigrationsWithRetry(attempts = 10, delayMs = 2000) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await runMigrations();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

module.exports = { runMigrations, runMigrationsWithRetry, migrationFiles, MIGRATIONS_DIR };

if (require.main === module) {
  runMigrationsWithRetry()
    .then((files) => {
      console.log(`[db] applied ${files.length} migration(s): ${files.join(', ')}`);
      return closePool();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`[db] migrations failed: ${error.message}`);
      process.exit(1);
    });
}
