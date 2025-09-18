#!/usr/bin/env bash
set -euo pipefail

# restore-to-render.sh
# Simple one-shot script to dump a local Postgres DB and restore it into a Render Postgres DB.
# Usage:
#   LOCAL_DATABASE_URL="postgresql://user:pass@localhost:5432/local_db" \
#   RENDER_DATABASE_URL="postgresql://user:pass@render-host:5432/render_db?sslmode=require" \
#   ./restore-to-render.sh
#
# The script will:
#  - ensure citext exists on the Render DB
#  - create a custom-format pg_dump of the local DB (local_db_for_render.dump)
#  - restore the dump into the Render DB with --no-owner --no-acl
#  - write logs to pg_dump.log and pg_restore.log
#
# IMPORTANT: This will overwrite data in the Render DB. Only run if you intend to replace it.

DUMP_FILE=${DUMP_FILE:-local_db_for_render.dump}
PG_DUMP_LOG=${PG_DUMP_LOG:-pg_dump.log}
PG_RESTORE_LOG=${PG_RESTORE_LOG:-pg_restore.log}

# Helper: fail with message
fail() {
  echo "ERROR: $*" >&2
  exit 1
}

# Ensure LOCAL_DATABASE_URL is set
if [ -z "${LOCAL_DATABASE_URL:-}" ]; then
  fail "Please set LOCAL_DATABASE_URL environment variable (e.g. postgresql://user:pass@localhost:5432/dbname)"
fi

# If RENDER_DATABASE_URL isn't set, try to read server/.env for DATABASE_URL
if [ -z "${RENDER_DATABASE_URL:-}" ]; then
  if [ -f server/.env ]; then
    # extract line starting with DATABASE_URL=, remove prefix and surrounding quotes
    RENDER_DATABASE_URL=$(grep -m1 '^DATABASE_URL=' server/.env | sed 's/DATABASE_URL=//') || true
    RENDER_DATABASE_URL=$(echo "$RENDER_DATABASE_URL" | sed 's/^"//;s/"$//')
  fi
fi

if [ -z "${RENDER_DATABASE_URL:-}" ]; then
  fail "Please set RENDER_DATABASE_URL environment variable (or add DATABASE_URL to server/.env)"
fi

echo "Using LOCAL_DATABASE_URL=${LOCAL_DATABASE_URL}"
echo "Using RENDER_DATABASE_URL=${RENDER_DATABASE_URL}"

# Step 1: ensure citext exists on Render DB
echo "\n==> Creating citext extension on Render DB (if allowed)"
if ! psql "$RENDER_DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS citext;" 2>&1 | tee -a "$PG_RESTORE_LOG"; then
  echo "Warning: failed to create citext extension. If restore errors reference citext, ask Render to enable the extension or run the create-extension command from a privileged console. Continuing..."
fi

# Step 2: create dump of local DB
echo "\n==> Creating dump of local DB to $DUMP_FILE (log: $PG_DUMP_LOG)"
rm -f "$DUMP_FILE" "$PG_DUMP_LOG"
# Prefer using explicit host/user flags via PGPASSWORD to avoid URL encoding issues; detect if LOCAL_DATABASE_URL contains '://'
if [[ "$LOCAL_DATABASE_URL" == postgresql://* ]]; then
  echo "Running pg_dump using connection URL (will honor percent-encoded password if present)..."
  pg_dump --dbname="$LOCAL_DATABASE_URL" -Fc -f "$DUMP_FILE" --verbose 2>&1 | tee "$PG_DUMP_LOG"
else
  # If user set other format, just attempt pg_dump with it
  pg_dump --dbname="$LOCAL_DATABASE_URL" -Fc -f "$DUMP_FILE" --verbose 2>&1 | tee "$PG_DUMP_LOG"
fi

# Verify dump file
if [ ! -s "$DUMP_FILE" ]; then
  echo "\nDump file $DUMP_FILE is empty or missing. See $PG_DUMP_LOG for details."
  tail -n 200 "$PG_DUMP_LOG" || true
  fail "pg_dump failed or produced an empty file"
fi

echo "Dump created: $(ls -lh "$DUMP_FILE")"

# Step 3: inspect top of dump
echo "\n==> Inspecting dump contents (first 60 entries)"
pg_restore --list "$DUMP_FILE" | head -n 60 || true

# Step 4: restore into Render
echo "\n==> Restoring dump into Render DB (log: $PG_RESTORE_LOG)"
rm -f "$PG_RESTORE_LOG"
# Run pg_restore; if RENDER_DATABASE_URL contains password it'll be used. You can set PGPASSWORD env var to avoid exposing it in process list.
pg_restore --verbose --clean --no-acl --no-owner --dbname="$RENDER_DATABASE_URL" "$DUMP_FILE" 2>&1 | tee "$PG_RESTORE_LOG" || true

# Show last 200 lines of restore log
echo "\n==> Last 200 lines of pg_restore log"
tail -n 200 "$PG_RESTORE_LOG" || true

# Step 5: quick verification on Render
echo "\n==> Quick verification of Render DB"
psql "$RENDER_DATABASE_URL" -c '\dt' || true
psql "$RENDER_DATABASE_URL" -c 'SELECT COUNT(*) FROM "User";' || true
psql "$RENDER_DATABASE_URL" -c 'SELECT id, username FROM "User" LIMIT 5;' || true

echo "\nRestore script finished. Check the logs ($PG_DUMP_LOG, $PG_RESTORE_LOG) for details."