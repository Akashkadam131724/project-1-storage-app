#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-latest}"
CLIENT_PORT="${CLIENT_PORT:-3002}"
API_PORT="${API_PORT:-4000}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
  echo "Missing .env in $SCRIPT_DIR"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "docker compose not found"
  exit 1
fi

echo "Pulling akash131/storage-server:$IMAGE_TAG and akash131/storage-client:$IMAGE_TAG"
IMAGE_TAG="$IMAGE_TAG" "${COMPOSE[@]}" pull
IMAGE_TAG="$IMAGE_TAG" "${COMPOSE[@]}" up -d

echo "Waiting for health..."
sleep 8

if ! curl --silent --fail "http://localhost:${API_PORT}/api/health" >/dev/null; then
  echo "API health check failed on :${API_PORT}"
  "${COMPOSE[@]}" logs --tail=80 server
  exit 1
fi

if ! curl --silent --fail "http://localhost:${CLIENT_PORT}/" >/dev/null; then
  echo "Client check failed on :${CLIENT_PORT}"
  "${COMPOSE[@]}" logs --tail=80 client
  exit 1
fi

docker image prune -f
"${COMPOSE[@]}" ps
echo "Storage client http://localhost:${CLIENT_PORT}"
echo "Storage API    http://localhost:${API_PORT}/api/health"
