'use strict';

const { validateItemName, MAX_NAME_LENGTH } = require('../../src/routes/items');

describe('validateItemName', () => {
  test('accepts a normal name and returns it trimmed', () => {
    expect(validateItemName('  Gamma Item  ')).toEqual({
      valid: true,
      value: 'Gamma Item',
    });
  });

  test('rejects a missing name', () => {
    const result = validateItemName(undefined);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  test('rejects a name that is not a string', () => {
    const result = validateItemName(42);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/string/);
  });

  test('rejects an empty or whitespace-only name', () => {
    expect(validateItemName('').valid).toBe(false);
    expect(validateItemName('    ').valid).toBe(false);
    expect(validateItemName('\t\n').error).toMatch(/empty/);
  });

  test(`rejects a name longer than ${MAX_NAME_LENGTH} characters`, () => {
    const tooLong = 'x'.repeat(MAX_NAME_LENGTH + 1);
    const result = validateItemName(tooLong);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(new RegExp(String(MAX_NAME_LENGTH)));
    expect(validateItemName('x'.repeat(MAX_NAME_LENGTH)).valid).toBe(true);
  });
});
