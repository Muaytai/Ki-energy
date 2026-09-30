#!/usr/bin/env bash
set -e

echo "=== MindAvatar Backend Service Initialization ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL database at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
while ! nc -z "${POSTGRES_HOST:-db}" "${POSTGRES_PORT:-5432}"; do
  sleep 1
done
echo "PostgreSQL is reachable!"

# Apply migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Run server
echo "Starting application server..."
exec "$@"
