#!/bin/bash
# Force Update Script for Production Server
# Run this on your server: bash force-update-server.sh

echo "🔥 FORCE UPDATE SCRIPT v0.1.5"
echo "================================"

# Container name
CONTAINER_NAME="me-prompt-tec-dashboard"
IMAGE_NAME="chunwarayut/me-prompt-tec-dashboard:latest"

echo "🛑 Step 1: Stopping and removing old container..."
docker stop $CONTAINER_NAME 2>/dev/null || echo "Container not running"
docker rm $CONTAINER_NAME 2>/dev/null || echo "Container not found"

echo "🗑️ Step 2: Removing old image (force cache clear)..."
docker rmi $IMAGE_NAME -f 2>/dev/null || echo "Image not found"

echo "⬇️ Step 3: Pulling fresh image from Docker Hub..."
docker pull $IMAGE_NAME

echo "🚀 Step 4: Starting new container..."
docker run --name $CONTAINER_NAME \
  --label io.portainer.accesscontrol.teams=discord \
  --restart=always -d -p 7077:3000 \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e EXT_PUBLIC_SOCKET_URL="${EXT_PUBLIC_SOCKET_URL}" \
  -e REDIS_URL="${REDIS_URL}" \
  -e NODE_ENV="production" \
  -e BASE_URL="${BASE_URL}" \
  -e NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL}" \
  -e CLOUDFLARE_KEY="${CLOUDFLARE_KEY}" \
  -e CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
  -e CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" \
  -e MAIL_USER="${MAIL_USER}" \
  -e MAIL_PASS="${MAIL_PASS}" \
  --memory=512m --memory-swap=512m --cpus=1.5 \
  --log-opt max-size=10m --log-opt max-file=3 \
  $IMAGE_NAME

echo "🧹 Step 5: Cleaning up old images..."
docker image prune -a -f

echo "✅ DONE! Check http://49.231.43.177:7077/profile"
echo "You should see a RED BANNER saying 'SYSTEM UPDATED v0.1.5'"
