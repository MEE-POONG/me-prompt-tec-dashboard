#!/bin/bash

# ========================================
# Manual Deployment Script
# ========================================
# This script manually deploys the latest Docker image to production
# Use this when GitHub Actions deployment doesn't work

set -e  # Exit on error

echo "🚀 Manual Deployment Script"
echo "================================"
echo ""

# Configuration
CONTAINER_NAME="me-prompt-tec-dashboard"
IMAGE_NAME="chunwarayut/me-prompt-tec-dashboard"
TAG="${1:-latest}"  # Use argument or default to 'latest'

echo "📋 Configuration:"
echo "  Container: $CONTAINER_NAME"
echo "  Image: $IMAGE_NAME:$TAG"
echo ""

# Step 1: Pull latest image
echo "⬇️  Step 1: Pulling latest Docker image..."
docker pull $IMAGE_NAME:$TAG
echo "✅ Image pulled successfully"
echo ""

# Step 2: Stop existing container
echo "🛑 Step 2: Stopping existing container..."
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    docker stop $CONTAINER_NAME
    echo "✅ Container stopped"
else
    echo "ℹ️  Container not running"
fi
echo ""

# Step 3: Remove existing container
echo "🗑️  Step 3: Removing existing container..."
if docker ps -a -q -f name=$CONTAINER_NAME | grep -q .; then
    docker rm $CONTAINER_NAME
    echo "✅ Container removed"
else
    echo "ℹ️  Container not found"
fi
echo ""

# Step 4: List current images
echo "🖼️  Step 4: Current images on server:"
docker images | grep $CONTAINER_NAME || echo "No images found"
echo ""

# Step 5: Start new container
echo "🚀 Step 5: Starting new container..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with all required environment variables"
    exit 1
fi

# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

docker run --name $CONTAINER_NAME \
  --label io.portainer.accesscontrol.teams=discord \
  --restart=always -d -p 7077:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e EXT_PUBLIC_SOCKET_URL="$EXT_PUBLIC_SOCKET_URL" \
  -e REDIS_URL="$REDIS_URL" \
  -e NODE_ENV="production" \
  -e BASE_URL="$BASE_URL" \
  -e NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
  -e CLOUDFLARE_KEY="$CLOUDFLARE_KEY" \
  -e CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
  -e CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
  -e MAIL_USER="$MAIL_USER" \
  -e MAIL_PASS="$MAIL_PASS" \
  --memory=512m --memory-swap=512m --cpus=1.5 \
  --log-opt max-size=10m --log-opt max-file=3 \
  $IMAGE_NAME:$TAG

echo "✅ Container started"
echo ""

# Step 6: Wait for container to start
echo "⏳ Step 6: Waiting for container to start..."
sleep 5
echo ""

# Step 7: Verify container is running
echo "🔍 Step 7: Verifying container status..."
if docker ps | grep $CONTAINER_NAME; then
    echo "✅ Container is running!"
else
    echo "❌ Container failed to start!"
    echo "Checking logs..."
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi
echo ""

# Step 8: Show container logs
echo "📋 Step 8: Container logs (last 20 lines):"
docker logs $CONTAINER_NAME --tail 20
echo ""

# Step 9: Clean up old images
echo "🧹 Step 9: Cleaning up old images..."
docker image prune -a -f
echo "✅ Cleanup complete"
echo ""

# Step 10: Final status
echo "================================"
echo "✅ Deployment successful!"
echo "================================"
echo ""
echo "📊 Container Info:"
docker ps | grep $CONTAINER_NAME
echo ""
echo "🌐 Access your application at:"
echo "   http://49.231.43.177:7077"
echo ""
echo "🔍 Check version at:"
echo "   http://49.231.43.177:7077/api/version"
echo ""
echo "📝 View logs:"
echo "   docker logs $CONTAINER_NAME -f"
echo ""
