-- Schema for the items resource. Written to be idempotent so that it can be
-- replayed on every boot and at the start of every integration run.
CREATE TABLE IF NOT EXISTS items (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
