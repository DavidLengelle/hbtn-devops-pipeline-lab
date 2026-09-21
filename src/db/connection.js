'use strict';

const { Pool } = require('pg');

/**
 * The connection pool is created lazily, on the first query.
 *
 * That matters for the test suites: requiring this module (directly or through
 * a route) must never open a socket, so the unit tests can run with no database
 * anywhere in sight, while the integration tests fail loudly and immediately
 * when no connection string was provided.
 */
let pool = null;

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. The API and the integration suite need a Postgres ' +
        'connection string, for example postgres://pipeline:pipeline@db:5432/pipeline'
    );
  }
  return url;
}

function getPool() {
  if (pool === null) {
    pool = new Pool({
      connectionString: connectionString(),
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 1000,
    });
  }
  return pool;
}

function query(text, params) {
  return getPool().query(text, params);
}

async function closePool() {
  if (pool !== null) {
    const closing = pool;
    pool = null;
    await closing.end();
  }
}

module.exports = { getPool, query, closePool };
