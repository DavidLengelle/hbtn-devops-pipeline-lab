'use strict';

const { healthPayload } = require('../../src/routes/health');

describe('health payload', () => {
  test('reports the ok status', () => {
    expect(healthPayload()).toEqual({ status: 'ok' });
  });

  test('serialises to exactly {"status":"ok"}', () => {
    expect(JSON.stringify(healthPayload())).toBe('{"status":"ok"}');
  });

  test('returns a fresh object on every call', () => {
    const first = healthPayload();
    const second = healthPayload();

    expect(first).not.toBe(second);

    first.status = 'tampered';
    expect(second.status).toBe('ok');
  });
});
