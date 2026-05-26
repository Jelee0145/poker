#!/usr/bin/env bash
set -euo pipefail

mkdir -p "${DATA_DIR:-/data/poker}"

cd /app/backend
flask db upgrade
python seed.py

exec gunicorn --bind "0.0.0.0:${PORT:-8080}" --workers 2 --threads 4 --timeout 120 wsgi:app
