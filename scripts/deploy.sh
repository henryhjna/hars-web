#!/bin/bash

# HARS Web - Automated Deployment Script
# Deployment strategy: Git push → EC2 git pull → EC2 docker build

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
# STEP 1: Prerequisites Check
# ==============================================================================
echo -e "${YELLOW}[1/4] Checking prerequisites...${NC}"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}ERROR: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes first:"
    echo "  git status"
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
echo -e "${YELLOW}[2/4] Pushing changes to GitHub...${NC}"

# Push to GitHub
git push origin main || {
    echo -e "${RED}ERROR: Failed to push to GitHub${NC}"
    exit 1
}

echo -e "${GREEN}✓ Pushed to GitHub successfully${NC}"
echo ""

# ==============================================================================
# STEP 3: Get EC2 IP from Terraform
# ==============================================================================
echo -e "${YELLOW}[3/4] Getting EC2 IP from Terraform...${NC}"

EC2_IP=$(cd terraform && "$TERRAFORM_CMD" output -raw ec2_public_ip 2>/dev/null || echo "")
if [ -z "$EC2_IP" ]; then
    echo -e "${RED}ERROR: Could not get EC2 IP from Terraform${NC}"
    echo "Run 'cd terraform && terraform apply' first"
    exit 1
fi

echo -e "${GREEN}✓ EC2 IP: $EC2_IP${NC}"
echo ""

# ==============================================================================
# STEP 4: Deploy to EC2 (Git Pull + Docker Build on EC2)
# ==============================================================================
echo -e "${YELLOW}[4/4] Deploying to EC2...${NC}"

# Set proper permissions on SSH key (Windows Git Bash compatible)
chmod 600 "$SSH_KEY" 2>/dev/null || true

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "Connecting to EC2 instance at $EC2_IP..."
echo "This will take several minutes (Docker build on EC2)..."
echo ""

# Deploy commands: git pull → stop containers → build → start
ssh $SSH_OPTS ubuntu@$EC2_IP << 'ENDSSH'
set -e

echo "[EC2] Pulling latest code from GitHub..."
cd hars-web
git pull origin main

echo "[EC2] Stopping old containers..."
docker-compose down

echo "[EC2] Building and starting new containers..."
echo "This may take 5-10 minutes on t3.micro..."
docker-compose up -d --build

echo "[EC2] Deployment complete!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Successfully deployed to EC2${NC}"
    echo ""

    # Wait for containers to fully start
    echo "Waiting for containers to start (10 seconds)..."
    sleep 10

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
