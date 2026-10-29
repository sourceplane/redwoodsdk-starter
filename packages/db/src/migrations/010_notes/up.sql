-- The notes' one table: what the home page lists and its server functions
-- write (apps/web/src/app/notes). Applied by db-migrate before the Worker
-- deploys; locally, by `pnpm run db:migrate:local` in apps/web. IF NOT
-- EXISTS, so applying it again is a no-op.
-- Owner: app
CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
