#!/bin/bash

# HARS Web Deployment Script
# This script automates the deployment process according to DEPLOYMENT.md

set -e  # Exit on error

echo "=========================================="
echo "HARS Web Deployment Script"
echo "=========================================="
echo ""

# Load AWS credentials from terraform.tfvars
TERRAFORM_DIR="$(dirname "$0")/../terraform"
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    echo "❌ Error: terraform.tfvars not found"
    exit 1
fi

# Extract AWS credentials
AWS_ACCESS_KEY=$(grep 'aws_access_key' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2)
AWS_SECRET_KEY=$(grep 'aws_secret_key' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2)
AWS_REGION=$(grep 'aws_region' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2)

# Get ECR URLs from terraform output
cd "$TERRAFORM_DIR"
ECR_CLIENT_URL=$("C:\terraform\terraform.exe" output -raw ecr_client_repository_url 2>/dev/null || echo "")
ECR_SERVER_URL=$("C:\terraform\terraform.exe" output -raw ecr_server_repository_url 2>/dev/null || echo "")
EC2_IP=$("C:\terraform\terraform.exe" output -raw ec2_public_ip 2>/dev/null || echo "52.78.232.37")

if [ -z "$ECR_CLIENT_URL" ] || [ -z "$ECR_SERVER_URL" ]; then
    echo "❌ Error: Could not get ECR URLs from terraform"
    exit 1
fi

cd ..

echo "✅ AWS Credentials loaded"
echo "   Region: $AWS_REGION"
echo "   ECR Client: $ECR_CLIENT_URL"
echo "   ECR Server: $ECR_SERVER_URL"
echo "   EC2 IP: $EC2_IP"
echo ""

# Step 1: Configure AWS CLI
echo "Step 1/6: Configuring AWS CLI..."
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY"
export AWS_DEFAULT_REGION="$AWS_REGION"

# Verify credentials
if ! "C:\Program Files\Amazon\AWSCLIV2\aws.exe" sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Error: AWS credentials are invalid or expired"
    exit 1
fi
echo "✅ AWS credentials verified"
echo ""

# Step 2: Build Docker images locally
echo "Step 2/6: Building Docker images locally..."
echo "  Building client..."
docker build -t hars-client:latest -f client/Dockerfile client
echo "  Building server..."
docker build -t hars-server:latest -f server/Dockerfile server
echo "✅ Docker images built successfully"
echo ""

# Step 3: Login to ECR
echo "Step 3/6: Logging in to ECR..."
AWS_ACCOUNT_ID=$(echo "$ECR_CLIENT_URL" | cut -d'.' -f1)
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo "✅ ECR login successful"
echo ""

# Step 4: Tag and push images to ECR
echo "Step 4/6: Tagging and pushing images to ECR..."
echo "  Tagging client..."
docker tag hars-client:latest "$ECR_CLIENT_URL:latest"
echo "  Pushing client..."
docker push "$ECR_CLIENT_URL:latest"

echo "  Tagging server..."
docker tag hars-server:latest "$ECR_SERVER_URL:latest"
echo "  Pushing server..."
docker push "$ECR_SERVER_URL:latest"
echo "✅ Images pushed to ECR successfully"
echo ""

# Step 5: Deploy to EC2
echo "Step 5/6: Deploying to EC2..."
SSH_KEY="terraform/hars-key"
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    exit 1
fi

echo "  Pulling latest code and images on EC2..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" \
    "cd hars-web && git pull origin main && docker-compose pull && docker-compose up -d"
echo "✅ Deployment to EC2 successful"
echo ""

# Step 6: Verify deployment
echo "Step 6/6: Verifying deployment..."
sleep 5
if curl -f "http://$EC2_IP" > /dev/null 2>&1; then
    echo "✅ Website is responding: http://$EC2_IP"
else
    echo "⚠️  Warning: Website may not be responding yet. Check logs:"
    echo "   ssh -i $SSH_KEY ubuntu@$EC2_IP 'cd hars-web && docker-compose logs'"
fi
echo ""

echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Website: http://$EC2_IP"
echo "API: http://$EC2_IP/api"
echo ""
