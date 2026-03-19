#!/bin/bash

# HARS Web - Automated Deployment Script
# Deployment strategy: Local Build → ECR Push → EC2 Pull (NO BUILD ON EC2!)

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# AWS Account ID (extracted from existing ECR repo)
AWS_ACCOUNT_ID="025158345480"
AWS_REGION="ap-northeast-2"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HARS Web Deployment Automation${NC}"
echo -e "${GREEN}  Local Build → ECR Push → EC2 Pull${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ==============================================================================
# STEP 1: Prerequisites Check
# ==============================================================================
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}ERROR: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes first:"
    echo "  git status"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    exit 1
fi

# Check Terraform (try multiple locations)
if command -v terraform &> /dev/null; then
    TERRAFORM_CMD="terraform"
elif [ -f "/c/terraform/terraform.exe" ]; then
    TERRAFORM_CMD="/c/terraform/terraform.exe"
else
    echo -e "${RED}ERROR: Terraform is not installed${NC}"
    echo "Install from: https://www.terraform.io/downloads"
    exit 1
fi

if [ ! -d "terraform" ]; then
    echo -e "${RED}ERROR: terraform directory not found${NC}"
    exit 1
fi

# Check SSH key
SSH_KEY="terraform/hars-key"
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# ==============================================================================
# STEP 2: Push to GitHub
# ==============================================================================
echo -e "${YELLOW}[2/7] Pushing changes to GitHub...${NC}"

git push origin main || {
    echo -e "${RED}ERROR: Failed to push to GitHub${NC}"
    exit 1
}

echo -e "${GREEN}✓ Pushed to GitHub successfully${NC}"
echo ""

# ==============================================================================
# STEP 3: Build Docker Images for ARM64 (EC2 is ARM-based)
# ==============================================================================
echo -e "${YELLOW}[3/7] Building Docker images for ARM64...${NC}"

# Create buildx builder if it doesn't exist
docker buildx create --name hars-builder --use 2>/dev/null || docker buildx use hars-builder

echo "Building client image for ARM64..."
docker buildx build --no-cache --platform linux/arm64 -t hars-client:latest -f client/Dockerfile client --load

echo "Building server image for ARM64..."
docker buildx build --no-cache --platform linux/arm64 -t hars-server:latest -f server/Dockerfile server --load

echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# ==============================================================================
# STEP 4: Login to ECR and Push Images
# ==============================================================================
echo -e "${YELLOW}[4/7] Logging in to ECR and pushing images...${NC}"

# ECR Login
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Tag and push client
echo "Pushing client image to ECR..."
docker tag hars-client:latest $ECR_REGISTRY/hars-client:latest
docker push $ECR_REGISTRY/hars-client:latest

# Tag and push server
echo "Pushing server image to ECR..."
docker tag hars-server:latest $ECR_REGISTRY/hars-server:latest
docker push $ECR_REGISTRY/hars-server:latest

echo -e "${GREEN}✓ Images pushed to ECR successfully${NC}"
echo ""

# ==============================================================================
# STEP 5: Get EC2 IP from Terraform
# ==============================================================================
echo -e "${YELLOW}[5/7] Getting EC2 IP from Terraform...${NC}"

EC2_IP=$(cd terraform && "$TERRAFORM_CMD" output -raw ec2_public_ip 2>/dev/null || echo "")
if [ -z "$EC2_IP" ]; then
    echo -e "${RED}ERROR: Could not get EC2 IP from Terraform${NC}"
    echo "Run 'cd terraform && terraform apply' first"
    exit 1
fi

echo -e "${GREEN}✓ EC2 IP: $EC2_IP${NC}"
echo ""

# ==============================================================================
# STEP 6: Deploy to EC2 (Pull images from ECR, NO BUILD!)
# ==============================================================================
echo -e "${YELLOW}[6/7] Deploying to EC2 (pulling images from ECR)...${NC}"

# Set proper permissions on SSH key (Windows Git Bash compatible)
chmod 600 "$SSH_KEY" 2>/dev/null || true

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "Connecting to EC2 instance at $EC2_IP..."
echo ""

# Deploy commands: ECR login → git pull → pull images → restart containers (NO BUILD!)
ssh $SSH_OPTS ubuntu@$EC2_IP << ENDSSH
set -e

echo "[EC2] Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

echo "[EC2] Pulling latest code from GitHub..."
cd hars-web
git pull origin main

echo "[EC2] Pulling latest images from ECR..."
docker-compose pull

echo "[EC2] Restarting containers (NO BUILD!)..."
docker-compose down
docker-compose up -d

echo "[EC2] Waiting for database to be ready..."
sleep 5

echo "[EC2] Checking migration tracking table..."
if docker exec hars-db psql -U postgres -d hars_db -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='schema_migrations'" 2>/dev/null | grep -q 1; then
  echo "[EC2] Migration tracking exists. Running pending migrations..."
  docker exec hars-server npm run migrate:prod 2>&1 || echo "[EC2] Warning: Migration failed or no pending migrations"
else
  echo "[EC2] First-time migration setup. Marking existing migrations as applied..."
  docker exec hars-server npm run migrate:init-existing:prod 2>&1 || echo "[EC2] Warning: Migration init failed"
fi

echo "[EC2] Deployment complete!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Successfully deployed to EC2${NC}"
    echo ""

    # Wait for containers to fully start
    echo "Waiting for containers to start (10 seconds)..."
    sleep 10

    # ==============================================================================
    # STEP 7: Verify Deployment
    # ==============================================================================
    echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"

    # Check container status
    echo -e "${YELLOW}Container Status:${NC}"
    ssh $SSH_OPTS ubuntu@$EC2_IP "docker ps --filter name=hars --format 'table {{.Names}}\t{{.Status}}'" || true

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Application URL: ${GREEN}http://$EC2_IP${NC}"
    echo -e "API Health Check: ${GREEN}http://$EC2_IP:5000/health${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test the application in your browser: http://$EC2_IP"
    echo "2. Check logs: ssh -i terraform/hars-key ubuntu@$EC2_IP 'cd hars-web && docker-compose logs -f'"
    echo "3. Monitor containers: ssh -i terraform/hars-key ubuntu@$EC2_IP 'docker ps'"
    echo ""
else
    echo ""
    echo -e "${RED}ERROR: Deployment to EC2 failed${NC}"
    echo "Check logs: ssh -i terraform/hars-key ubuntu@$EC2_IP 'cd hars-web && docker-compose logs'"
    exit 1
fi
