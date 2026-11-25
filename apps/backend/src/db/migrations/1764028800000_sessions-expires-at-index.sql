-- Up Migration
-- Lets the hourly expired-session cleanup (DELETE ... WHERE expires_at <= now()) use an index scan.
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

-- Down Migration
DROP INDEX sessions_expires_at_idx;
