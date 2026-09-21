# hbtn-devops-pipeline-lab

This repository contains the application used in the **CI/CD Pipeline Essentials** lab. It is a small Express API backed by PostgreSQL. The application and tests are already implemented; your work is to diagnose and extend its delivery pipeline.

The supplied `.github/workflows/ci.yml` is deliberately broken. Keep those faults in place until the task asks you to diagnose them.

The archive has no Git history. Create a public repository named `hbtn-devops-pipeline-lab` in your GitHub account, initialize this directory, make the first commit, and push it to the `main` branch. Later tasks and the automatic checker use that repository name.

## Repository contents

```text
src/
  server.js                       Express app, routes, and error handling
  routes/health.js                GET /health
  routes/items.js                 GET /items, POST /items, and input validation
  db/connection.js                lazy PostgreSQL pool built from DATABASE_URL
  db/migrate.js                   idempotent migration runner
  db/migrations/*.sql             schema and seed data
tests/
  unit/health.test.js             3 unit tests
  unit/items.unit.test.js         5 unit tests
  integration/items.int.test.js  3 integration tests that require PostgreSQL
Dockerfile                        builder and production runtime stages
docker-compose.yml                local app and database services
jest.config.js                    Jest configuration; JUnit is installed but disabled
.eslintrc.json                    lint rules used by npm run lint
.github/workflows/ci.yml          deliberately broken workflow
```

The test suite contains 11 deterministic tests: 8 unit tests and 3 integration tests. Unit tests need only Node.js. Integration tests need a reachable PostgreSQL database.

## API

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/health` | Returns `200` with `{"status":"ok"}`. This is a liveness check and does not query the database. |
| `GET` | `/items` | Returns `200` with stored items ordered by creation. This route requires the database. |
| `POST` | `/items` | Creates an item and returns `201`, or returns `400` when `name` is invalid. |

The application listens on port `3000`. Database operations read the connection string from `DATABASE_URL`; there is no built-in fallback.

## Run the application in containers

You do not need Node.js or npm on the host. Run the supplied commands inside the containers:

```bash
docker compose up -d
docker compose ps

docker compose run --rm app npm run test:unit
docker compose run --rm app npm run test:integration
docker compose run --rm app npm test
docker compose run --rm app npm run lint

curl -s http://localhost:3000/health
curl -s http://localhost:3000/items
curl -s -X POST http://localhost:3000/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"Delta Item"}'

docker compose down -v
```

The Compose `app` service targets the `builder` stage, which includes Jest, Supertest, and ESLint. The pipeline builds the smaller `runtime` stage for deployment.

## Pipeline starting point

The supplied workflow contains three intentional faults of different kinds. Diagnose them from the Actions annotations and job logs, then repair them one at a time. Do not replace the workflow wholesale: the exercise is to follow each failure to its cause.

Later tasks extend the same workflow with dependency caching, JUnit artifacts, an image published to GHCR, and a staging deployment.

## Troubleshooting

| Symptom | What to check |
|---|---|
| `DATABASE_URL is not set` | Run through Docker Compose locally, or provide the connection string in the environment that executes integration tests or the deployed API. |
| Integration tests cannot connect | Confirm that the database is healthy with `docker compose ps`. |
| Changes to `package.json` are ignored | Recreate the development volume with `docker compose down -v`, then rebuild. |
| `npm ci` reports a lock-file mismatch | Regenerate dependencies inside the container, review the lock-file change, and commit both manifests. |
| Port `3000` is already in use | Stop the process using the port or change the published host port in `docker-compose.yml`. |

## License

This lab is distributed under the MIT License. See `LICENSE`.
