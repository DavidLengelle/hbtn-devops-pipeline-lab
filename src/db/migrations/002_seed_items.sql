-- A couple of rows so that GET /items is not empty on a fresh database.
-- The guard keeps the statement idempotent: seeding only happens once.
INSERT INTO items (name)
SELECT seed.name
FROM (VALUES ('Alpha Item'), ('Beta Item')) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM items);
