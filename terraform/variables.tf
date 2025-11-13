variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "aws_access_key" {
  description = "AWS access key"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret key"
  type        = string
  sensitive   = true
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 22.04 LTS in ap-northeast-2"
  type        = string
  default     = "ami-0c9c942bd7bf113a2" # Ubuntu 22.04 LTS
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name for submissions"
  type        = string
  default     = "hars-submissions-prod"
}
