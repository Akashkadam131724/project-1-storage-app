#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-latest}"
CLIENT_PORT="${CLIENT_PORT:-3002}"

cd "$(dirname "$0")"

echo "Deploying akash131/storage-client:$IMAGE_TAG"

IMAGE_TAG="$IMAGE_TAG" docker compose pull

ids="$(docker ps -q --filter "publish=${CLIENT_PORT}" || true)"
if [ -n "${ids}" ]; then
  echo "Port ${CLIENT_PORT} already allocated; stopping old container(s)"
  # shellcheck disable=SC2086
  docker stop ${ids}
  # shellcheck disable=SC2086
  docker rm ${ids}
fi

IMAGE_TAG="$IMAGE_TAG" docker compose up -d

sleep 8

if ! curl --silent --fail "http://localhost:${CLIENT_PORT}/" >/dev/null; then
  docker compose ps
  docker compose logs --tail=100 client
  exit 1
fi

docker image prune -f
docker compose ps

echo "Done. Client: http://localhost:${CLIENT_PORT} (image tag: $IMAGE_TAG)"
