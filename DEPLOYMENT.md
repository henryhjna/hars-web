# HARS Web - AWS Deployment Guide

**Last Updated**: 2025-01-19
**Deployment Strategy**: Local Build → ECR Push → EC2 Pull (**NEVER BUILD ON EC2!**)

---

## 🏗️ 배포 아키텍처 (실제 사용)

```
┌─────────────┐                    ┌─────────────┐
│ 로컬 개발   │  1. Docker Build   │   AWS ECR   │
│ 환경        │     & Push         │  (Registry) │
│             │ ────────────────>  │             │
└─────────────┘                    └─────────────┘
                                         │
                            2. Pull      │
                               Images    │
                                         ▼
                                  ┌─────────────┐
                                  │   AWS EC2   │
                                  │ 52.78.232.37│
                                  │             │
                                  │ 3. Run      │
                                  │ Containers  │
                                  │ (NO BUILD!) │
                                  └─────────────┘
                                         │
                            4. 서비스    │
                               제공      │
                                         ▼
                                  ┌─────────────┐
                                  │   사용자    │
                                  │  브라우저   │
                                  └─────────────┘
```

**핵심 원칙**:
1. **로컬**: 코드 작성 → Docker build → ECR push → Git commit/push
2. **EC2**: ECR login → Pull images → Container restart (**절대 빌드하지 말 것!**)
3. **이유**: t2.micro에서 빌드는 너무 느리고 리소스 낭비. 로컬에서 빌드하고 레지스트리에 푸시하는 것이 정석

---

## ⚠️ CRITICAL: 배포 규칙 (MUST FOLLOW!)

**절대 규칙**:
1. **로컬에서만 Docker 이미지 빌드 (EC2에서 빌드 절대 금지!)**
2. **ECR에 이미지 푸시 후 EC2에서 pull만 수행**
3. **모든 코드 변경은 반드시 Git commit & push**
4. **인프라 변경은 반드시 Terraform으로만 수행**
5. **절대 AWS 콘솔에서 수동으로 변경하지 말 것**
6. **EC2에서 `--build` 플래그 사용 금지!**

---

## 🔴 표준 배포 프로세스 (자동화)

### 📋 배포 전 체크리스트
- [ ] 로컬에서 코드 변경 완료
- [ ] Git commit 완료
- [ ] SSH 키 존재 확인 (terraform/hars-key)

---

## 1️⃣ 자동 배포 (권장)

### 단일 명령어로 배포

```bash
cd c:/projects/hars-web
bash scripts/deploy.sh
```

**자동으로 수행되는 작업**:
1. Git commit 확인
2. Git push to GitHub
3. 로컬에서 Docker 이미지 빌드
4. ECR에 이미지 푸시
5. EC2에 SSH 접속
6. EC2에서 git pull
7. EC2에서 docker-compose pull
8. EC2에서 docker-compose up -d (빌드 없이 pull한 이미지 사용)
9. 배포 검증

---

## 2️⃣ 인프라 변경이 있는 경우

### Step 1: Terraform 변경사항 확인

```bash
cd c:/projects/hars-web/terraform
cmd.exe /c "C:	erraform	erraform.exe plan"
```

**확인 사항**:
- 변경될 리소스 확인 (보안 그룹, EC2, ECR 설정 등)
- 삭제될 리소스가 있는지 확인 (⚠️ 주의!)

### Step 2: Terraform 적용 (변경사항이 있을 때만)

```bash
cmd.exe /c "C:	erraform	erraform.exe apply"
```
- `-auto-approve` 플래그는 신중하게 사용
- 변경사항을 한 번 더 확인 후 `yes` 입력

### Step 3: 인프라 적용 확인

```bash
# 보안 그룹 확인
cmd.exe /c "C:	erraform	erraform.exe state show aws_security_group.hars_sg"

# ECR 리포지토리 확인
cmd.exe /c "C:	erraform	erraform.exe state show aws_ecr_repository.hars_client"
cmd.exe /c "C:	erraform	erraform.exe state show aws_ecr_repository.hars_server"
```

### Step 4: 코드 배포

위의 "1️⃣ 코드만 변경한 경우" 프로세스 따르기

### 인프라 변경 예시
- ✅ 보안 그룹 포트 추가/제거 (terraform/main.tf)
- ✅ EC2 인스턴스 타입 변경
- ✅ ECR 리포지토리 설정 변경
- ✅ VPC, 서브넷 설정 변경
- ✅ S3 버킷 생성/삭제
- ✅ IAM Role/Policy 변경

---

## 🚫 절대 하지 말 것

1. ❌ EC2에서 `docker-compose up -d --build` (빌드하지 말 것!)
2. ❌ AWS 콘솔에서 보안 그룹 수정
3. ❌ EC2 인스턴스 수동 재시작/변경
4. ❌ ECR 리포지토리 수동 생성/삭제
5. ❌ S3 버킷 수동 생성/삭제
6. ❌ `docker-compose down -v` 사용 (데이터베이스 데이터 삭제됨!)
7. ❌ EC2에서 직접 코드 수정 (항상 Git으로 관리)
8. ❌ Terraform과 AWS 콘솔 혼용

---

## 📂 중요 파일 위치

### 로컬 PC
- **Terraform 실행 파일**: `C:	erraform	erraform.exe`
- **Terraform 설정**: `terraform/main.tf`
- **SSH 키**: `terraform/hars-key` (gitignore됨)
- **환경 변수**: `terraform/terraform.tfvars` (gitignore됨)

### AWS
- **EC2 IP**: `52.78.232.37` (Elastic IP, 고정됨)
- **ECR 리포지토리**:
  - `hars-client`: `<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client`
  - `hars-server`: `<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server`
- **S3 버킷**: `hars-submissions-henryhjna`

### EC2 서버
- **프로젝트 디렉토리**: `/home/ubuntu/hars-web`
- **환경 변수 파일**: `/home/ubuntu/hars-web/.env` (gitignore됨)
- **Docker Compose**: `/home/ubuntu/hars-web/docker-compose.yml`

## 🏗️ Terraform이 관리하는 인프라

### 컴퓨팅
- ✅ AWS EC2 인스턴스 (t2.micro, ap-northeast-2a)
- ✅ Elastic IP (52.78.232.37)

### 네트워크
- ✅ VPC, 서브넷, Internet Gateway, Route Table
- ✅ 보안 그룹 (포트: 22, 80, 443, 5000)
- ✅ SSH 키 페어 (hars-key)

### 스토리지 & 레지스트리
- ✅ AWS ECR (Elastic Container Registry)
  - hars-client 리포지토리
  - hars-server 리포지토리
- ✅ S3 버킷 (hars-submissions-henryhjna)

### 권한
- ✅ IAM Role & Instance Profile (EC2 → ECR, S3 접근)

---

## 🌐 접속 정보

- **웹사이트**: http://52.78.232.37 (포트 80)
- **API**: http://52.78.232.37:5000/api
- **SSH**: `ssh -i "terraform/hars-key" ubuntu@52.78.232.37`
- **ECR 로그인**: `aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com`

---

## 🔧 트러블슈팅

### ECR 로그인 실패

```bash
# AWS CLI 설정 확인
aws configure list

# ECR 로그인 재시도
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com
```

### EC2에서 ECR 이미지 pull 실패

```bash
# EC2에 SSH 접속
ssh -i "terraform/hars-key" ubuntu@52.78.232.37

# EC2에서 ECR 로그인 확인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 수동으로 이미지 pull
docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest
docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest
```

### 컨테이너가 시작되지 않는 경우

```bash
# 로그 확인
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-server"
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-client"
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-db"

# 전체 로그 확인
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose logs"
```

### 데이터베이스 초기화가 필요한 경우 (⚠️ 데이터 삭제됨!)

```bash
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose down -v && docker-compose up -d"
```

### 환경 변수 업데이트

```bash
# EC2 서버에 SSH 접속
ssh -i "terraform/hars-key" ubuntu@52.78.232.37

# .env 파일 수정
cd hars-web
nano .env

# 수정 후 컨테이너 재시작
docker-compose restart
```

### 특정 컨테이너만 재시작

```bash
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose restart server"
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose restart client"
```

### 이미지 버전 불일치

```bash
# EC2에서 오래된 이미지 제거
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker image prune -a -f"

# 최신 이미지 다시 pull
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose pull && docker-compose up -d"
```

---

## 3️⃣ 배포 검증

### ECR 이미지 확인

```bash
# ECR 리포지토리 이미지 목록 확인
aws ecr list-images --repository-name hars-client --region ap-northeast-2
aws ecr list-images --repository-name hars-server --region ap-northeast-2
```

### EC2 컨테이너 상태 확인

```bash
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker ps"
```

**예상 출력**:
```
CONTAINER ID   IMAGE                                                    COMMAND                  STATUS
xxxxxxxxx      <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest   "/docker-entrypoint.…"   Up X seconds
xxxxxxxxx      <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest   "docker-entrypoint.s…"   Up X seconds (healthy)
xxxxxxxxx      postgres:15                                              "docker-entrypoint.s…"   Up X seconds (healthy)
```

### 웹사이트 접속 확인

```bash
curl -s -o /dev/null -w "%{http_code}" http://52.78.232.37
```
- 예상 결과: `200`

### API 확인

```bash
curl -s http://52.78.232.37:5000/api/events | python -m json.tool | head -20
```
- 예상 결과: JSON 데이터 반환

### 이미지 버전 확인

```bash
# EC2에서 실행 중인 이미지 확인
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "docker images | grep hars"
```

---

## 📊 배포 체크리스트

### 배포 전
- [ ] 로컬에서 코드 변경 완료 및 테스트
- [ ] AWS CLI 설정 확인 (`aws configure`)
- [ ] ECR 로그인 확인
- [ ] 인프라 변경 여부 확인

### 배포 중
- [ ] 로컬에서 Docker 이미지 빌드
- [ ] ECR에 이미지 푸시 완료
- [ ] Git commit & push 완료
- [ ] Terraform plan 확인 (인프라 변경 시)
- [ ] Terraform apply 실행 (인프라 변경 시)
- [ ] EC2에서 ECR 이미지 pull
- [ ] 컨테이너 시작 완료 확인

### 배포 후
- [ ] `docker ps` 로 컨테이너 상태 확인
- [ ] ECR 이미지 버전 확인
- [ ] 웹사이트 접속 확인 (http://52.78.232.37)
- [ ] API 엔드포인트 테스트
- [ ] 로그에 에러 없는지 확인

---

## 🎯 배포 예시

### 예시 1: 프론트엔드 코드 수정 후 배포 (전체 프로세스)

```bash
# ========== 로컬 PC ==========

# 1. 코드 수정 후 Docker 이미지 빌드
cd c:/projects/hars-web
docker build -t hars-client:latest -f client/Dockerfile client

# 2. ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. 이미지 태그 및 푸시
docker tag hars-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest

# 4. Git 커밋
git add .
git commit -m "Update homepage UI"
git push origin main

# 5. EC2 배포
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose pull && docker-compose up -d"

# 6. 검증
curl -s -o /dev/null -w "%{http_code}" http://52.78.232.37
# 200 확인
```

### 예시 2: 백엔드 API 수정 후 배포

```bash
# 1. Server 이미지 빌드
cd c:/projects/hars-web
docker build -t hars-server:latest -f server/Dockerfile server

# 2. ECR 로그인 (필요시)
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. 이미지 태그 및 푸시
docker tag hars-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest

# 4. Git 커밋
git add .
git commit -m "Add new API endpoint"
git push origin main

# 5. EC2 배포
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose pull && docker-compose up -d"
```

### 예시 3: Client & Server 동시 수정 후 배포

```bash
# 1. 양쪽 이미지 모두 빌드
cd c:/projects/hars-web
docker build -t hars-client:latest -f client/Dockerfile client
docker build -t hars-server:latest -f server/Dockerfile server

# 2. ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. 양쪽 이미지 태그 및 푸시
docker tag hars-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest
docker tag hars-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest

docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-server:latest

# 4. Git 커밋
git add .
git commit -m "Update client and server"
git push origin main

# 5. EC2 배포
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose pull && docker-compose up -d"
```

### 예시 4: ECR 리포지토리 추가 (인프라 변경)

```bash
# 로컬에서 terraform/main.tf 수정 (새 ECR 리포지토리 추가)
git add terraform/main.tf
git commit -m "Add new ECR repository"
git push origin main

# Terraform 적용
cd c:/projects/hars-web/terraform
cmd.exe /c "C:\terraform\terraform.exe plan"
# 변경사항 확인 후
cmd.exe /c "C:\terraform\terraform.exe apply"

# ECR 리포지토리 생성 확인
aws ecr describe-repositories --region ap-northeast-2
```

### 예시 5: 환경 변수만 업데이트

```bash
# EC2 접속
ssh -i "terraform/hars-key" ubuntu@52.78.232.37

# .env 수정
cd hars-web
nano .env
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 등 수정

# 컨테이너 재시작 (이미지 pull 불필요)
docker-compose restart
```

---

## 💡 Best Practices

### 1. 이미지 태그 전략
```bash
# latest 태그 외에 버전 태그도 사용
docker tag hars-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:v1.2.3
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/hars-client:v1.2.3
```

### 2. 배포 전 로컬 테스트
```bash
# 로컬에서 먼저 docker-compose로 테스트
cd c:/projects/hars-web
docker-compose up -d
# 테스트 후
docker-compose down
```

### 3. ECR 이미지 정리
```bash
# 오래된 이미지 삭제 (수동)
aws ecr batch-delete-image --repository-name hars-client --region ap-northeast-2 --image-ids imageTag=old-tag
```

### 4. 롤백 전략
```bash
# 이전 버전으로 롤백 (ECR에 버전 태그가 있는 경우)
# docker-compose.yml에서 이미지 태그를 이전 버전으로 변경 후
ssh -i "terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose pull && docker-compose up -d"
```

---

## 📝 배포 성공 기록

- **2025-01-14**: ECR 기반 배포 아키텍처로 전환
  - 변경사항: EC2 로컬 빌드 → AWS ECR 기반 배포
  - 프로세스: 로컬 빌드 → ECR 푸시 → EC2 pull 방식

- **2024-11-13**: 포트 80 배포 성공
  - Git commit: `8c71dc7`
  - 변경사항: client 포트 3000 → 80
  - 검증: curl http://52.78.232.37 → 200 OK
