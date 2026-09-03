#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-latest}"
GIT_BRANCH="${GIT_BRANCH:-main}"
HEALTH_ENDPOINT="/api/health"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "========================================"
echo "Starting storage API deployment"
echo "========================================"
echo "Directory  : $SCRIPT_DIR"
echo "Image tag  : $IMAGE_TAG"
echo "Git branch : $GIT_BRANCH"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed or not in PATH"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "docker compose / docker-compose not found"
  exit 1
fi

if [ ! -f .env ] && [ -f ../.env ]; then
  cp ../.env .env
fi

if [ ! -f .env ]; then
  echo "Missing .env in $SCRIPT_DIR — create it on the server before deploying."
  exit 1
fi

echo "Pulling latest code..."
git fetch origin "$GIT_BRANCH"
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"

set -a
# shellcheck disable=SC1091
source .env
set +a

APP_PORT="${PORT:-4000}"

free_host_port() {
  local port="$1"
  local ids
  ids="$(docker ps -q --filter "publish=${port}" || true)"
  if [ -n "${ids}" ]; then
    echo "Port ${port} already allocated; stopping old container(s)"
    # shellcheck disable=SC2086
    docker stop ${ids}
    # shellcheck disable=SC2086
    docker rm ${ids}
  fi
}

echo ""
echo "Pulling Docker image..."
IMAGE_TAG="$IMAGE_TAG" "${COMPOSE[@]}" pull

echo ""
echo "Restarting containers..."
free_host_port "${APP_PORT}"
IMAGE_TAG="$IMAGE_TAG" "${COMPOSE[@]}" up -d

echo ""
echo "Waiting for application to start..."
sleep 5

echo ""
echo "Running health check..."

if HEALTH_RESPONSE=$(curl --silent --fail "http://localhost:${APP_PORT}${HEALTH_ENDPOINT}"); then
  echo ""
  echo "Health check passed"
  echo "$HEALTH_RESPONSE"
else
  echo ""
  echo "Health check failed"
  echo ""
  "${COMPOSE[@]}" ps
  echo ""
  "${COMPOSE[@]}" logs --tail=100 api
  exit 1
fi

echo ""
docker image prune -f

echo ""
"${COMPOSE[@]}" ps

echo ""
echo "========================================"
echo "Deployment successful"
echo "========================================"
echo "Image      : akash131/storage-server:$IMAGE_TAG"
echo "Health URL : http://localhost:${APP_PORT}${HEALTH_ENDPOINT}"
echo "========================================"
