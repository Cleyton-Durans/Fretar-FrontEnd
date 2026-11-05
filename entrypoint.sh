#!/bin/sh
set -e

echo "[fretar] Aguardando o PostgreSQL ($DB_HOST:$DB_PORT)..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" >/dev/null 2>&1; do
  sleep 2
done

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
  echo "[fretar] Gerando APP_KEY..."
  php artisan key:generate --force
fi

echo "[fretar] Rodando migrations..."
php artisan migrate --force

if [ "$APP_SEED" = "true" ]; then
  echo "[fretar] Rodando seed de demonstracao..."
  php artisan db:seed --force
fi

echo "[fretar] API disponivel em http://0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000