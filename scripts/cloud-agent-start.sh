#!/usr/bin/env bash
# Per-boot startup for the Cloud Agent / local development environment.
# Idempotent: safe to run repeatedly. Brings up local Postgres + the dev
# WebSocket proxy and applies the Drizzle schema when using the local database.
set -euo pipefail

cd "$(dirname "$0")/.."
# shellcheck source=/dev/null
source scripts/cloud-agent-env.sh

if [ "${SSP_USE_LOCAL_DB:-0}" != "1" ]; then
  echo "[start] DATABASE_URL provided externally; skipping local Postgres setup."
  exit 0
fi

echo "[start] Ensuring PostgreSQL cluster is running..."
if ! sudo pg_lsclusters -h 2>/dev/null | grep -q online; then
  sudo pg_ctlcluster 16 main start || true
fi

# Wait for Postgres to accept connections.
for _ in $(seq 1 30); do
  if pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "[start] Ensuring database role and database exist..."
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='ssp'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ssp LOGIN PASSWORD 'ssp' SUPERUSER;"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='sspdealflow'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE sspdealflow OWNER ssp;"

echo "[start] Ensuring dev Neon WebSocket proxy is running on port ${PG_WS_PROXY_PORT}..."
if ! (exec 3<>"/dev/tcp/127.0.0.1/${PG_WS_PROXY_PORT}") 2>/dev/null; then
  nohup node scripts/dev-neon-proxy.mjs >/tmp/dev-neon-proxy.log 2>&1 &
  sleep 1
fi

echo "[start] Applying Drizzle schema (db:push)..."
npm run db:push -- --force

echo "[start] Environment ready. Postgres + proxy up, schema applied."
