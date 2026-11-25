-- Up Migration
-- Logout marks the session revoked instead of deleting it; the weekly cleanup removes the row
-- once it expires. Refresh only accepts rows with revoked_at IS NULL.
ALTER TABLE sessions ADD COLUMN revoked_at timestamptz NULL;

-- Down Migration
ALTER TABLE sessions DROP COLUMN revoked_at;
