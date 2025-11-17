@echo off
REM HARS Web Deployment Script for Windows
REM This script automates the deployment process according to DEPLOYMENT.md

echo ==========================================
echo HARS Web Deployment Script
echo ==========================================
echo.

cd /d "%~dp0\.."

REM Check terraform.tfvars exists
if not exist "terraform\terraform.tfvars" (
    echo Error: terraform.tfvars not found
    exit /b 1
)

REM Load ECR URLs from terraform output
cd terraform
for /f "tokens=*" %%i in ('C:\terraform\terraform.exe output -raw ecr_client_repository_url 2^>nul') do set ECR_CLIENT_URL=%%i
for /f "tokens=*" %%i in ('C:\terraform\terraform.exe output -raw ecr_server_repository_url 2^>nul') do set ECR_SERVER_URL=%%i
for /f "tokens=*" %%i in ('C:\terraform\terraform.exe output -raw ec2_public_ip 2^>nul') do set EC2_IP=%%i
cd ..

if "%ECR_CLIENT_URL%"=="" (
    echo Error: Could not get ECR URLs from terraform
    exit /b 1
)

REM Extract AWS Account ID from ECR URL
for /f "tokens=1 delims=." %%a in ("%ECR_CLIENT_URL%") do set AWS_ACCOUNT_ID=%%a

echo Loaded from Terraform:
echo   ECR Client: %ECR_CLIENT_URL%
echo   ECR Server: %ECR_SERVER_URL%
echo   EC2 IP: %EC2_IP%
echo   AWS Account: %AWS_ACCOUNT_ID%
echo.

REM Load AWS credentials from terraform.tfvars
for /f "tokens=2 delims=^" %%a in ('findstr "aws_access_key" terraform\terraform.tfvars') do (
    for /f "tokens=1 delims=^"" %%b in ("%%a") do set AWS_ACCESS_KEY=%%b
)
for /f "tokens=2 delims=^" %%a in ('findstr "aws_secret_key" terraform\terraform.tfvars') do (
    for /f "tokens=1 delims=^"" %%b in ("%%a") do set AWS_SECRET_KEY=%%b
)

REM Configure AWS CLI
echo Step 1/6: Configuring AWS CLI...
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set aws_access_key_id %AWS_ACCESS_KEY%
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set aws_secret_access_key %AWS_SECRET_KEY%
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set default.region ap-northeast-2

REM Verify credentials
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo Error: AWS credentials are invalid or expired
    exit /b 1
)
echo Credentials verified
echo.

REM Build Docker images
echo Step 2/6: Building Docker images locally...
echo   Building client...
docker build -t hars-client:latest -f client/Dockerfile client
echo   Building server...
docker build -t hars-server:latest -f server/Dockerfile server
echo Images built successfully
echo.

REM Login to ECR
echo Step 3/6: Logging in to ECR...
for /f %%i in ('"C:\Program Files\Amazon\AWSCLIV2\aws.exe" ecr get-login-password --region ap-northeast-2') do set ECR_PASSWORD=%%i
echo %ECR_PASSWORD% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.ap-northeast-2.amazonaws.com
echo ECR login successful
echo.

REM Tag and push images
echo Step 4/6: Tagging and pushing images to ECR...
echo   Tagging client...
docker tag hars-client:latest %ECR_CLIENT_URL%:latest
echo   Pushing client...
docker push %ECR_CLIENT_URL%:latest

echo   Tagging server...
docker tag hars-server:latest %ECR_SERVER_URL%:latest
echo   Pushing server...
docker push %ECR_SERVER_URL%:latest
echo Images pushed to ECR successfully
echo.

REM Deploy to EC2
echo Step 5/6: Deploying to EC2...
ssh -i "terraform/hars-key" -o StrictHostKeyChecking=no ubuntu@%EC2_IP% "cd hars-web && git pull origin main && docker-compose pull && docker-compose up -d"
echo Deployment to EC2 successful
echo.

REM Verify deployment
echo Step 6/6: Verifying deployment...
timeout /t 5 /nobreak >nul
curl -f http://%EC2_IP% >nul 2>&1
if errorlevel 1 (
    echo Warning: Website may not be responding yet
) else (
    echo Website is responding: http://%EC2_IP%
)
echo.

echo ==========================================
echo Deployment completed successfully!
echo ==========================================
echo.
echo Website: http://%EC2_IP%
echo API: http://%EC2_IP%/api
echo.

pause
