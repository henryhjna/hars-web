#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt-get install -y git

# Clone repository
cd /home/ubuntu
git clone https://github.com/henryhjna/hars-web.git
chown -R ubuntu:ubuntu hars-web

# Create production environment file
cat > /home/ubuntu/hars-web/.env.production <<EOF
# Database
DB_PASSWORD=${db_password}

# JWT
JWT_SECRET=${jwt_secret}

# AWS (will use IAM role)
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=hars-submissions-henryhjna

# SMTP (configure later)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@hanyanghars.com

# Frontend URL (will be updated with domain)
FRONTEND_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
VITE_API_BASE_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api
EOF

chown ubuntu:ubuntu /home/ubuntu/hars-web/.env.production

# Create systemd service for Docker Compose
cat > /etc/systemd/system/hars-web.service <<EOF
[Unit]
Description=HARS Web Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/hars-web
ExecStart=/usr/local/bin/docker-compose --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable hars-web.service

# Start the application
cd /home/ubuntu/hars-web
sudo -u ubuntu docker-compose --env-file .env.production up -d

echo "HARS Web deployment completed!"
