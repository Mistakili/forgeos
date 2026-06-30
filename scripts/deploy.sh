#!/usr/bin/env bash
set -euo pipefail

echo "Building ForgeOS production image..."
docker compose build

echo "Starting ForgeOS on http://localhost:8000"
docker compose up -d

echo "Health check..."
sleep 3
curl -sf http://localhost:8000/api/health | python -m json.tool

echo ""
echo "ForgeOS is live. Open http://localhost:8000"