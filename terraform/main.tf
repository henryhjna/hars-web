terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

# VPC
resource "aws_vpc" "hars_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "hars-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "hars_igw" {
  vpc_id = aws_vpc.hars_vpc.id

  tags = {
    Name = "hars-igw"
  }
}

# Public Subnet
resource "aws_subnet" "hars_public_subnet" {
  vpc_id                  = aws_vpc.hars_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "hars-public-subnet"
  }
}

# Route Table
resource "aws_route_table" "hars_public_rt" {
  vpc_id = aws_vpc.hars_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hars_igw.id
  }

  tags = {
    Name = "hars-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "hars_public_rta" {
  subnet_id      = aws_subnet.hars_public_subnet.id
  route_table_id = aws_route_table.hars_public_rt.id
}

# Security Group
resource "aws_security_group" "hars_sg" {
  name        = "hars-security-group"
  description = "Security group for HARS web application"
  vpc_id      = aws_vpc.hars_vpc.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # Outbound - Allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "hars-sg"
  }
}

# EC2 Key Pair (you'll need to create this manually or provide your own)
resource "aws_key_pair" "hars_key" {
  key_name   = "hars-key"
  public_key = var.ssh_public_key

  tags = {
    Name = "hars-key"
  }
}

# EC2 Instance (Free Tier: t3.micro for ap-northeast-2)
resource "aws_instance" "hars_ec2" {
  ami                    = var.ami_id # Ubuntu 22.04 LTS in ap-northeast-2
  instance_type          = "t3.micro" # Free tier eligible in ap-northeast-2
  key_name               = aws_key_pair.hars_key.key_name
  vpc_security_group_ids = [aws_security_group.hars_sg.id]
  subnet_id              = aws_subnet.hars_public_subnet.id

  root_block_device {
    volume_size           = 30 # Free tier allows up to 30GB
    volume_type           = "gp2"
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/user-data.sh", {
    db_password = var.db_password
    jwt_secret  = var.jwt_secret
  })

  tags = {
    Name = "hars-web-server"
  }
}

# Elastic IP (Free tier: 1 EIP)
resource "aws_eip" "hars_eip" {
  instance = aws_instance.hars_ec2.id
  domain   = "vpc"

  tags = {
    Name = "hars-eip"
  }
}

# S3 Bucket for PDF uploads (Free tier: 5GB storage, 20,000 GET, 2,000 PUT)
resource "aws_s3_bucket" "hars_submissions" {
  bucket = var.s3_bucket_name

  tags = {
    Name = "hars-submissions"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "hars_submissions_versioning" {
  bucket = aws_s3_bucket.hars_submissions.id

  versioning_configuration {
    status = "Disabled" # Disable to save costs
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "hars_submissions_pab" {
  bucket = aws_s3_bucket.hars_submissions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Policy for EC2 access
resource "aws_iam_role" "hars_ec2_role" {
  name = "hars-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "hars-ec2-role"
  }
}

# IAM Policy for S3 access
resource "aws_iam_role_policy" "hars_s3_policy" {
  name = "hars-s3-policy"
  role = aws_iam_role.hars_ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${aws_s3_bucket.hars_submissions.arn}",
          "${aws_s3_bucket.hars_submissions.arn}/*"
        ]
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "hars_instance_profile" {
  name = "hars-instance-profile"
  role = aws_iam_role.hars_ec2_role.name
}

# Outputs
output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.hars_eip.public_ip
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.hars_submissions.id
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i hars-key.pem ubuntu@${aws_eip.hars_eip.public_ip}"
}
