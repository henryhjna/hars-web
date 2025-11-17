# HARS Web - Deployment Makefile
# Single entry point for all deployment operations
#
# USAGE:
#   make check   - Check prerequisites before deployment
#   make deploy  - Deploy to AWS EC2 (full automation)
#
# IMPORTANT RULES:
# - ONLY use 'make deploy' for deployment
# - NEVER run individual docker commands
# - NEVER change credential paths
# - NEVER bypass standard procedures

.PHONY: check deploy help clean logs status

# Default target
.DEFAULT_GOAL := help

# Shell
SHELL := /bin/bash

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

# ==============================================================================
# Help
# ==============================================================================
help:
	@echo ""
	@echo -e "$(GREEN)HARS Web - Deployment Commands$(NC)"
	@echo ""
	@echo "Available targets:"
	@echo "  make check   - Check prerequisites (Docker, AWS CLI, .env, etc.)"
	@echo "  make deploy  - Full deployment to AWS EC2"
	@echo "  make logs    - View deployment logs from EC2"
	@echo "  make status  - Check deployment status"
	@echo "  make clean   - Clean local Docker images"
	@echo ""
	@echo -e "$(YELLOW)STANDARD DEPLOYMENT PROCESS:$(NC)"
	@echo "  1. make check    - Verify everything is ready"
	@echo "  2. make deploy   - Deploy to production"
	@echo "  3. make status   - Verify deployment succeeded"
	@echo ""

# ==============================================================================
# Prerequisites Check
# ==============================================================================
check:
	@echo -e "$(YELLOW)Checking prerequisites...$(NC)"
	@echo ""

	@# Check .env file
	@if [ ! -f ".env" ]; then \
		echo -e "$(RED) .env file not found$(NC)"; \
		echo "  Copy .env.example to .env and configure your values"; \
		exit 1; \
	else \
		echo -e "$(GREEN) .env file exists$(NC)"; \
	fi

	@# Check Docker
	@if command -v docker &> /dev/null; then \
		echo -e "$(GREEN) Docker is installed$(NC)"; \
	else \
		echo -e "$(RED) Docker is not installed$(NC)"; \
		exit 1; \
	fi

	@# Check if Docker is running
	@if docker info &> /dev/null; then \
		echo -e "$(GREEN) Docker is running$(NC)"; \
	else \
		echo -e "$(RED) Docker is not running$(NC)"; \
		echo "  Please start Docker Desktop"; \
		exit 1; \
	fi

	@# Check AWS CLI (try multiple possible locations)
	@if command -v aws &> /dev/null || [ -f "/c/Program Files/Amazon/AWSCLIV2/aws.exe" ]; then \
		echo -e "$(GREEN) AWS CLI is installed$(NC)"; \
	else \
		echo -e "$(RED) AWS CLI is not installed$(NC)"; \
		exit 1; \
	fi

	@# Check Terraform
	@if [ -d "terraform" ]; then \
		echo -e "$(GREEN) terraform directory exists$(NC)"; \
	else \
		echo -e "$(RED) terraform directory not found$(NC)"; \
		exit 1; \
	fi

	@# Check SSH key
	@if [ -f "terraform/hars-key" ]; then \
		echo -e "$(GREEN) SSH key exists$(NC)"; \
	else \
		echo -e "$(RED) SSH key not found at terraform/hars-key$(NC)"; \
		exit 1; \
	fi

	@# Check deploy script
	@if [ -f "scripts/deploy.sh" ]; then \
		echo -e "$(GREEN) Deployment script exists$(NC)"; \
	else \
		echo -e "$(RED) scripts/deploy.sh not found$(NC)"; \
		exit 1; \
	fi

	@echo ""
	@echo -e "$(GREEN)All prerequisites met! Ready to deploy.$(NC)"
	@echo ""

# ==============================================================================
# Deploy to AWS EC2
# ==============================================================================
deploy: check
	@echo ""
	@echo -e "$(GREEN)========================================$(NC)"
	@echo -e "$(GREEN)  Starting Deployment$(NC)"
	@echo -e "$(GREEN)========================================$(NC)"
	@echo ""
	@bash scripts/deploy.sh

# ==============================================================================
# View Logs from EC2
# ==============================================================================
logs:
	@echo -e "$(YELLOW)Fetching logs from EC2...$(NC)"
	@# Get EC2 IP from Terraform
	@EC2_IP=$$(cd terraform && /c/terraform/terraform.exe output -raw ec2_public_ip 2>/dev/null || echo "52.78.232.37"); \
	ssh -i terraform/hars-key -o StrictHostKeyChecking=no ubuntu@$$EC2_IP \
		"cd hars-web && docker-compose -f docker-compose.prod.yml logs --tail=100 -f"

# ==============================================================================
# Check Deployment Status
# ==============================================================================
status:
	@echo -e "$(YELLOW)Checking deployment status...$(NC)"
	@echo ""
	@# Get EC2 IP from Terraform
	@EC2_IP=$$(cd terraform && /c/terraform/terraform.exe output -raw ec2_public_ip 2>/dev/null || echo "52.78.232.37"); \
	echo -e "EC2 IP: $(GREEN)$$EC2_IP$(NC)"; \
	echo ""; \
	echo -e "$(YELLOW)Running containers:$(NC)"; \
	ssh -i terraform/hars-key -o StrictHostKeyChecking=no ubuntu@$$EC2_IP \
		"docker ps --filter name=hars --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"; \
	echo ""; \
	echo -e "$(YELLOW)Application URLs:$(NC)"; \
	echo -e "  Frontend: $(GREEN)http://$$EC2_IP$(NC)"; \
	echo -e "  API Health: $(GREEN)http://$$EC2_IP:5000/health$(NC)"

# ==============================================================================
# Clean Local Docker Images
# ==============================================================================
clean:
	@echo -e "$(YELLOW)Cleaning local Docker images...$(NC)"
	@docker rmi hars-client:latest hars-server:latest 2>/dev/null || true
	@echo -e "$(GREEN) Local images cleaned$(NC)"
