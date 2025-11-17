#!/bin/bash

# HARS Web - Automated Deployment Script
# This script automates the entire deployment process to AWS EC2
# DO NOT run individual commands - ONLY use 'make deploy'

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HARS Web Deployment Automation${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ==============================================================================
# STEP 1: Environment & Prerequisites Check
# ==============================================================================
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

# Load environment variables
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure your values."
    exit 1
fi

source .env

# Check required environment variables
REQUIRED_VARS=(
    "AWS_REGION"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "S3_BUCKET_NAME"
    "DB_PASSWORD"
    "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}ERROR: $var is not set in .env${NC}"
        exit 1
    fi
done

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed or not in PATH${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# Check AWS CLI
AWS_CMD="${AWS_CLI_PATH:-aws}"
if ! command -v "$AWS_CMD" &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    exit 1
fi

# Check Terraform
TERRAFORM_CMD="${TERRAFORM_PATH:-terraform}"
if [ ! -d "terraform" ]; then
    echo -e "${RED}ERROR: terraform directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# ==============================================================================
# STEP 2: Get Terraform Outputs
# ==============================================================================
echo -e "${YELLOW}[2/7] Getting Terraform outputs...${NC}"

# Get EC2 IP
EC2_IP=$(cd terraform && "$TERRAFORM_CMD" output -raw ec2_public_ip 2>/dev/null || echo "")
if [ -z "$EC2_IP" ]; then
    echo -e "${RED}ERROR: Could not get EC2 IP from Terraform${NC}"
    echo "Run 'cd terraform && terraform apply' first"
    exit 1
fi

# Get ECR URLs
ECR_CLIENT_URL=$(cd terraform && "$TERRAFORM_CMD" output -raw ecr_client_repository_url 2>/dev/null || echo "")
ECR_SERVER_URL=$(cd terraform && "$TERRAFORM_CMD" output -raw ecr_server_repository_url 2>/dev/null || echo "")

if [ -z "$ECR_CLIENT_URL" ] || [ -z "$ECR_SERVER_URL" ]; then
    echo -e "${RED}ERROR: Could not get ECR repository URLs from Terraform${NC}"
    exit 1
fi

echo -e "${GREEN}✓ EC2 IP: $EC2_IP${NC}"
echo -e "${GREEN}✓ ECR Client: $ECR_CLIENT_URL${NC}"
echo -e "${GREEN}✓ ECR Server: $ECR_SERVER_URL${NC}"
echo ""

# ==============================================================================
# STEP 3: Build Docker Images Locally
# ==============================================================================
echo -e "${YELLOW}[3/7] Building Docker images locally...${NC}"
echo "This may take a few minutes..."

# Build client
echo "Building client image..."
docker build -t hars-client:latest -f client/Dockerfile client || {
    echo -e "${RED}ERROR: Failed to build client image${NC}"
    exit 1
}

# Build server
echo "Building server image..."
docker build -t hars-server:latest -f server/Dockerfile server || {
    echo -e "${RED}ERROR: Failed to build server image${NC}"
    exit 1
}

echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# ==============================================================================
# STEP 4: ECR Login
# ==============================================================================
echo -e "${YELLOW}[4/7] Logging into AWS ECR...${NC}"

# Extract AWS account ID from ECR URL
AWS_ACCOUNT_ID=$(echo "$ECR_CLIENT_URL" | cut -d'.' -f1)

# ECR login
"$AWS_CMD" ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com" || {
    echo -e "${RED}ERROR: ECR login failed${NC}"
    echo "Check your AWS credentials in .env"
    exit 1
}

echo -e "${GREEN}✓ Successfully logged into ECR${NC}"
echo ""

# ==============================================================================
# STEP 5: Tag and Push Images to ECR
# ==============================================================================
echo -e "${YELLOW}[5/7] Tagging and pushing images to ECR...${NC}"

# Tag images
docker tag hars-client:latest "${ECR_CLIENT_URL}:latest"
docker tag hars-server:latest "${ECR_SERVER_URL}:latest"

# Push client
echo "Pushing client image to ECR..."
docker push "${ECR_CLIENT_URL}:latest" || {
    echo -e "${RED}ERROR: Failed to push client image${NC}"
    exit 1
}

# Push server
echo "Pushing server image to ECR..."
docker push "${ECR_SERVER_URL}:latest" || {
    echo -e "${RED}ERROR: Failed to push server image${NC}"
    exit 1
}

echo -e "${GREEN}✓ Images pushed to ECR successfully${NC}"
echo ""

# ==============================================================================
# STEP 6: Deploy to EC2
# ==============================================================================
echo -e "${YELLOW}[6/7] Deploying to EC2...${NC}"

# Check SSH key
SSH_KEY="terraform/hars-key"
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

# Set proper permissions on SSH key (Windows Git Bash compatible)
chmod 600 "$SSH_KEY" 2>/dev/null || true

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "Connecting to EC2 instance at $EC2_IP..."

# Deploy commands
ssh $SSH_OPTS ubuntu@$EC2_IP << 'ENDSSH'
set -e

echo "Pulling latest code from GitHub..."
cd hars-web
git pull origin main

echo "Logging into ECR..."
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 025158345480.dkr.ecr.ap-northeast-2.amazonaws.com

echo "Pulling latest Docker images from ECR..."
docker pull 025158345480.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest
docker pull 025158345480.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest

echo "Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

echo "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment complete!"
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully deployed to EC2${NC}"
else
    echo -e "${RED}ERROR: Deployment to EC2 failed${NC}"
    exit 1
fi

echo ""

# ==============================================================================
# STEP 7: Verification
# ==============================================================================
echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"

# Wait a few seconds for containers to start
echo "Waiting for containers to start..."
sleep 5

# Check if containers are running
ssh $SSH_OPTS ubuntu@$EC2_IP "docker ps --filter name=hars" || {
    echo -e "${RED}WARNING: Could not verify containers${NC}"
}

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application URL: ${GREEN}http://$EC2_IP${NC}"
echo -e "API Health Check: ${GREEN}http://$EC2_IP:5000/health${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the application in your browser"
echo "2. Check logs if needed: ssh -i terraform/hars-key ubuntu@$EC2_IP 'cd hars-web && docker-compose logs'"
echo "3. Monitor the application"
echo ""
