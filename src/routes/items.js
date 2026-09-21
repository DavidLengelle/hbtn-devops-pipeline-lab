'use strict';

const express = require('express');

const { query } = require('../db/connection');

const MAX_NAME_LENGTH = 255;

/**
 * Validate the `name` field of an item.
 *
 * Pure function, no database, no I/O — which is exactly why the unit suite can
 * exercise it without any external service.
 *
 * @returns {{valid: boolean, value?: string, error?: string}}
 */
function validateItemName(name) {
  if (typeof name !== 'string') {
    return { valid: false, error: 'name is required and must be a string' };
  }

  const value = name.trim();

  if (value.length === 0) {
    return { valid: false, error: 'name must not be empty' };
  }

  if (value.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `name must be at most ${MAX_NAME_LENGTH} characters` };
  }

  return { valid: true, value };
}

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name, created_at FROM items ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const check = validateItemName(req.body && req.body.name);
  if (!check.valid) {
    res.status(400).json({ error: check.error });
    return;
  }

  try {
    const result = await query(
      'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
      [check.value]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = { router, validateItemName, MAX_NAME_LENGTH };
