#!/bin/bash
# HARS Web 빠른 배포 스크립트
# 로컬 빌드 + Docker Hub 푸시 + EC2 배포

set -e  # 에러 발생 시 중단

echo "🚀 HARS Web 배포 시작..."
echo ""

# 1. Docker 이미지 빌드
echo "📦 Step 1/5: Docker 이미지 빌드 중..."
docker build -t henryhjna/hars-client:latest -f client/Dockerfile client
docker build -t henryhjna/hars-server:latest -f server/Dockerfile server
echo "✅ 빌드 완료"
echo ""

# 2. Docker Hub에 푸시
echo "☁️ Step 2/5: Docker Hub에 이미지 푸시 중..."
docker push henryhjna/hars-client:latest
docker push henryhjna/hars-server:latest
echo "✅ 푸시 완료"
echo ""

# 3. Git 최신 변경사항 푸시
echo "📤 Step 3/5: Git 변경사항 푸시 중..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main
echo "✅ Git 푸시 완료"
echo ""

# 4. EC2에서 최신 코드 가져오기
echo "🔄 Step 4/5: EC2에서 최신 코드 가져오는 중..."
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main"
echo "✅ 코드 업데이트 완료"
echo ""

# 5. EC2에서 Docker 이미지 pull 및 재시작
echo "🐳 Step 5/5: EC2에서 컨테이너 재시작 중..."
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
echo "✅ 컨테이너 재시작 완료"
echo ""

echo "🎉 배포 완료!"
echo "🌐 사이트 접속: http://52.78.232.37"
