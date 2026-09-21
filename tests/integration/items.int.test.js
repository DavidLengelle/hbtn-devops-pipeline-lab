'use strict';

const request = require('supertest');

const { app } = require('../../src/server');
const { runMigrations } = require('../../src/db/migrate');
const { closePool } = require('../../src/db/connection');

/**
 * These three tests need a live Postgres reachable through DATABASE_URL.
 *
 * Locally:  docker compose up -d && docker compose run --rm app npm run test:integration
 * In CI:    a Postgres service container, with DATABASE_URL pointing at it.
 *
 * Without the connection string they fail immediately, and on purpose: the
 * error names the missing variable rather than timing out.
 */
beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closePool();
});

describe('items API (requires Postgres)', () => {
  test('GET /items returns the stored items', async () => {
    const response = await request(app).get('/items');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  test('POST /items stores a new item and answers 201', async () => {
    const name = `integration-${Date.now()}`;
    const response = await request(app).post('/items').send({ name });

    expect(response.status).toBe(201);
    expect(typeof response.body.id).toBe('number');
    expect(response.body.name).toBe(name);
    expect(response.body.created_at).toBeDefined();
  });

  test('an item created through the API is returned by GET /items', async () => {
    const name = `roundtrip-${Date.now()}`;
    const created = await request(app).post('/items').send({ name });
    expect(created.status).toBe(201);

    const listed = await request(app).get('/items');

    expect(listed.status).toBe(200);
    expect(listed.body.map((item) => item.name)).toContain(name);
  });
});
