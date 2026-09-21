'use strict';

const express = require('express');

/**
 * The exact body the API answers on /health.
 *
 * A fresh object is returned on every call so that a handler mutating the
 * response cannot corrupt the next one. The health check deliberately does not
 * touch the database: it answers whether *this process* is alive, which is what
 * a container orchestrator asks, and it keeps the endpoint usable when only the
 * application container is running.
 */
function healthPayload() {
  return { status: 'ok' };
}

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json(healthPayload());
});

module.exports = { router, healthPayload };
