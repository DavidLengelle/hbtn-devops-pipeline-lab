'use strict';

const express = require('express');

const health = require('./routes/health');
const items = require('./routes/items');

const PORT = Number(process.env.PORT || 3000);

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/health', health.router);
  app.use('/items', items.router);

  app.use((_req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  app.use((error, _req, res, _next) => {
    console.error(`[error] ${error.message}`);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  const { runMigrationsWithRetry } = require('./db/migrate');

  runMigrationsWithRetry()
    .then((files) => console.log(`[db] applied ${files.length} migration(s)`))
    .catch((error) => console.error(`[db] migrations failed: ${error.message}`));

  app.listen(PORT, () => console.log(`[api] listening on port ${PORT}`));
}

module.exports = { app, createApp, PORT };
