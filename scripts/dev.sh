#!/usr/bin/env bash
# Quick dev start — verifies DB is up, then starts Next.js
set -e

cd "$(dirname "$0")/.."

# Check postgres
pg_isready -h localhost -p 5432 -U qdenty 2>/dev/null \
  || { echo "⚠  PostgreSQL not running. Run: sudo systemctl start postgresql"; exit 1; }

# Check redis
redis-cli -a qdenty_redis_2024 ping 2>/dev/null | grep -q PONG \
  || { echo "⚠  Redis not running. Run: sudo systemctl start redis-server"; exit 1; }

echo "✓  PostgreSQL + Redis up"

# Run any pending migrations
npm run db:migrate --silent 2>/dev/null || true

echo "▶  Starting Next.js dev server on :3000…"
npm run dev
