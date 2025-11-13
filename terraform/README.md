# AWS Deployment Guide

## Prerequisites

1. Terraform installed: https://www.terraform.io/downloads
2. AWS CLI configured with credentials
3. SSH key pair generated (already done: `hars-key` and `hars-key.pub`)

## Step 1: Install Terraform

### Windows
```powershell
# Using Chocolatey
choco install terraform

# Or download from https://www.terraform.io/downloads
```

### Linux/Mac
```bash
# Using package manager or download from https://www.terraform.io/downloads
```

## Step 2: Configure AWS Credentials

The `terraform.tfvars` file already contains your AWS credentials:
- Access Key: AKIAQLW4N4MEBYVPILXZ
- Region: ap-northeast-2 (Seoul)

**IMPORTANT**: This file is gitignored for security. Never commit it to git!

## Step 3: Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Apply (create infrastructure)
terraform apply
```

Type `yes` when prompted to confirm.

## Step 4: What Gets Created

### Free Tier Resources:
- **VPC** and networking (free)
- **EC2 t2.micro** instance (750 hours/month free for 12 months)
- **30GB EBS storage** (30GB free tier)
- **1 Elastic IP** (free when attached)
- **S3 bucket** (5GB storage, 20,000 GET, 2,000 PUT requests/month free)
- Security groups and IAM roles (free)

### Estimated Monthly Cost:
- **First 12 months**: $0 (within free tier)
- **After 12 months**: ~$10-15/month (EC2 + small S3 usage)

## Step 5: Post-Deployment

After terraform completes:

1. **Get EC2 IP address**:
```bash
terraform output ec2_public_ip
```

2. **Connect via SSH**:
```bash
chmod 400 hars-key
ssh -i hars-key ubuntu@<EC2_PUBLIC_IP>
```

3. **Check deployment status**:
```bash
# On EC2 instance
docker ps
docker-compose logs
```

4. **Access the application**:
- Open browser: `http://<EC2_PUBLIC_IP>`

## Step 6: Configure Domain (Optional)

1. Go to Route 53 in AWS Console
2. Create hosted zone for `hanyanghars.com`
3. Update nameservers at your domain registrar (Gabia)
4. Create A record pointing to your EC2 Elastic IP

## Step 7: Setup SSL with Let's Encrypt (Optional)

```bash
# SSH into EC2
ssh -i hars-key ubuntu@<EC2_PUBLIC_IP>

# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Stop docker containers temporarily
cd /home/ubuntu/hars-web
docker-compose down

# Get SSL certificate
sudo certbot certonly --standalone -d hanyanghars.com -d www.hanyanghars.com

# Update nginx config to use SSL
# Then restart containers
docker-compose up -d
```

## Troubleshooting

### Check EC2 instance logs:
```bash
ssh -i hars-key ubuntu@<EC2_PUBLIC_IP>
tail -f /var/log/cloud-init-output.log
```

### Check Docker status:
```bash
docker ps
docker-compose logs -f
```

### Rebuild and redeploy:
```bash
cd /home/ubuntu/hars-web
git pull origin main
docker-compose --env-file .env.production down
docker-compose --env-file .env.production up -d --build
```

## Destroy Infrastructure (when done)

**WARNING**: This will delete all resources!

```bash
cd terraform
terraform destroy
```

Type `yes` to confirm.

## Cost Monitoring

- Set up AWS Budget Alert for $1
- Monitor Free Tier usage in AWS Billing Console
- Check resources regularly to avoid unexpected charges

## Security Notes

1. **SSH Key**: Keep `hars-key` (private key) secure. Never commit to git.
2. **AWS Credentials**: Already in .gitignore. Never commit `terraform.tfvars`.
3. **Secrets**: All sensitive data is in environment variables.
4. **Security Group**: Only ports 22, 80, 443 are open.
5. **IAM**: EC2 has minimal S3-only permissions.

## Free Tier Limits

Monitor these to stay within free tier:
- EC2: 750 hours/month (one t2.micro running 24/7)
- EBS: 30GB storage
- S3: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- Data Transfer: 15GB/month outbound

After limits, you'll be charged standard rates.
