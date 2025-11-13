# HARS Web Deployment Guide

## Overview
This guide covers deploying the HARS Web Platform to AWS EC2 using Docker Compose.

## Prerequisites
- AWS Account with credentials
- Terraform installed (optional, for automated infrastructure)
- SSH client

## Deployment Options

### Option 1: Terraform (Recommended)
Automated infrastructure setup with Terraform.

See [terraform/README.md](terraform/README.md) for detailed instructions.

**Quick Start:**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**What gets created:**
- VPC with public subnet
- EC2 t2.micro instance (free tier)
- Security groups (ports 22, 80, 443)
- Elastic IP
- S3 bucket for PDF uploads
- IAM roles for EC2-S3 access

### Option 2: Manual AWS Setup
If you prefer manual setup or don't have Terraform:

1. **Create EC2 Instance:**
   - Type: t2.micro (free tier)
   - AMI: Ubuntu 22.04 LTS
   - Storage: 30GB gp2
   - Security Group: Allow ports 22, 80, 443

2. **Create S3 Bucket:**
   - Name: `hars-submissions-henryhjna`
   - Region: ap-northeast-2
   - Block public access

3. **Create IAM Role:**
   - Service: EC2
   - Policy: S3 read/write for your bucket
   - Attach to EC2 instance

4. **Allocate Elastic IP:**
   - Associate with EC2 instance

## Post-Deployment Setup

### 1. Connect to EC2
```bash
ssh -i terraform/hars-key ubuntu@<EC2_PUBLIC_IP>
```

### 2. Install Docker & Docker Compose
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/henryhjna/hars-web.git
cd hars-web
```

### 4. Create Production Environment File
```bash
cat > .env.production <<EOF
# Database
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD

# JWT
JWT_SECRET=YOUR_SECURE_JWT_SECRET

# AWS
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=hars-submissions-henryhjna

# SMTP (configure with your email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@hanyanghars.com

# Frontend URL
FRONTEND_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
VITE_API_BASE_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api
EOF
```

### 5. Start Application
```bash
# Use production docker-compose file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check status
docker ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Verify Deployment
```bash
# Check if containers are running
docker ps

# Check application health
curl http://localhost/api/health

# Access from browser
# http://<EC2_PUBLIC_IP>
```

## Domain Setup (Optional)

### 1. Configure DNS
1. Go to AWS Route 53
2. Create hosted zone for `hanyanghars.com`
3. Note the nameservers
4. Update nameservers at Gabia (your domain registrar)
5. Create A record pointing to Elastic IP

### 2. Setup SSL Certificate (Let's Encrypt)
```bash
# SSH into EC2
ssh -i terraform/hars-key ubuntu@<EC2_PUBLIC_IP>

# Stop containers
cd /home/ubuntu/hars-web
docker-compose -f docker-compose.prod.yml down

# Install Certbot
sudo apt-get install -y certbot

# Get certificate
sudo certbot certonly --standalone \
  -d hanyanghars.com \
  -d www.hanyanghars.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/hanyanghars.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/hanyanghars.com/privkey.pem nginx/ssl/
sudo chown -R ubuntu:ubuntu nginx/ssl

# Update nginx/nginx.conf to enable HTTPS (uncomment HTTPS section)

# Restart with SSL
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3. Auto-renew SSL Certificate
```bash
# Create renewal script
cat > /home/ubuntu/renew-cert.sh <<'EOF'
#!/bin/bash
docker-compose -f /home/ubuntu/hars-web/docker-compose.prod.yml down
certbot renew
cp /etc/letsencrypt/live/hanyanghars.com/fullchain.pem /home/ubuntu/hars-web/nginx/ssl/
cp /etc/letsencrypt/live/hanyanghars.com/privkey.pem /home/ubuntu/hars-web/nginx/ssl/
docker-compose -f /home/ubuntu/hars-web/docker-compose.prod.yml --env-file /home/ubuntu/hars-web/.env.production up -d
EOF

chmod +x /home/ubuntu/renew-cert.sh

# Add to crontab (runs monthly)
sudo crontab -e
# Add: 0 0 1 * * /home/ubuntu/renew-cert.sh
```

## Maintenance

### Update Application
```bash
cd /home/ubuntu/hars-web

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Backup Database
```bash
# Backup
docker exec hars-db pg_dump -U postgres hars_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20241113.sql | docker exec -i hars-db psql -U postgres hars_db
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f server
docker-compose -f docker-compose.prod.yml logs -f client
docker-compose -f docker-compose.prod.yml logs -f db
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart server
```

## Monitoring

### Check Resource Usage
```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -m
```

### AWS CloudWatch (Optional)
Set up CloudWatch agent for EC2 monitoring.

## Troubleshooting

### Application not accessible
```bash
# Check if containers are running
docker ps

# Check nginx logs
docker logs hars-client

# Check server logs
docker logs hars-server

# Check database
docker logs hars-db
```

### Database connection issues
```bash
# Check database is healthy
docker exec hars-db pg_isready -U postgres

# Check connection from server
docker exec hars-server nc -zv db 5432
```

### File upload issues
```bash
# Check S3 bucket permissions
aws s3 ls s3://hars-submissions-henryhjna/

# Check EC2 IAM role
aws sts get-caller-identity
```

## Security Checklist

- [ ] Change default database password
- [ ] Generate strong JWT secret
- [ ] Configure SMTP with app-specific password
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up AWS budget alerts
- [ ] Enable CloudWatch monitoring
- [ ] Configure automated backups
- [ ] Review security group rules
- [ ] Keep system and Docker images updated

## Cost Management

### Free Tier Limits
- EC2 t2.micro: 750 hours/month (first 12 months)
- EBS: 30GB storage
- S3: 5GB storage, 20,000 GET, 2,000 PUT requests/month
- Data Transfer: 15GB/month outbound

### Cost Optimization
1. Stop EC2 when not needed (development)
2. Clean up old S3 files periodically
3. Use S3 lifecycle policies for old files
4. Monitor with AWS Cost Explorer
5. Set up billing alerts

### Estimated Costs
- **First 12 months**: $0 (free tier)
- **After free tier**: ~$10-15/month
  - EC2 t2.micro: ~$8.5/month
  - EBS 30GB: ~$3/month
  - S3: ~$0.50/month (assuming low usage)

## Support

For issues or questions:
- GitHub: https://github.com/henryhjna/hars-web/issues
- Email: henryhjna@gmail.com
