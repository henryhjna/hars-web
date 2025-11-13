# HARS Web - AWS Deployment Guide

**Last Updated**: 2024-11-13 (검증 완료)

---

## ⚠️ CRITICAL: 배포 규칙 (MUST FOLLOW!)

**절대 규칙**:
1. **인프라 변경은 반드시 Terraform으로만 수행**
2. **애플리케이션 코드 배포는 Git + Docker Compose로 수행**
3. **절대 AWS 콘솔에서 수동으로 변경하지 말 것**
4. **Terraform과 수동 변경을 섞으면 충돌 발생!**

---

## 🔴 표준 배포 프로세스 (2024-11-13 검증 완료)

### 📋 배포 전 체크리스트
- [ ] 로컬에서 코드 변경 완료
- [ ] Git commit & push to main 완료
- [ ] 인프라 변경 여부 확인 (terraform/main.tf, docker-compose.yml)

---

## 1️⃣ 코드만 변경한 경우 (가장 일반적)

### 단일 명령어로 배포
```bash
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose down && docker-compose up -d --build"
```

### 단계별 설명
1. `git pull origin main` - 최신 코드 가져오기
2. `docker-compose down` - 기존 컨테이너 중지 및 제거
3. `docker-compose up -d --build` - 새 이미지 빌드 및 컨테이너 시작

### 언제 사용
- ✅ React/TypeScript 코드 수정
- ✅ Express API 코드 수정
- ✅ 데이터베이스 스키마 변경 (db/init.sql)
- ✅ Dockerfile 변경
- ✅ nginx.conf 변경
- ✅ package.json 의존성 변경

### 주의사항
- `--build` 플래그는 항상 포함 (코드 변경사항 반영)
- 데이터베이스 데이터는 볼륨으로 유지됨 (postgres_data)
- `-v` 플래그는 절대 사용하지 말 것 (데이터 삭제됨!)

---

## 2️⃣ 인프라 변경이 있는 경우

### Step 1: Terraform 변경사항 확인
```bash
cd c:/projects/hars-web/terraform
cmd.exe /c "C:\terraform\terraform.exe plan"
```

**확인 사항**:
- 변경될 리소스 확인 (보안 그룹, EC2 설정 등)
- 삭제될 리소스가 있는지 확인 (⚠️ 주의!)

### Step 2: Terraform 적용 (변경사항이 있을 때만)
```bash
cmd.exe /c "C:\terraform\terraform.exe apply"
```
- `-auto-approve` 플래그는 신중하게 사용
- 변경사항을 한 번 더 확인 후 `yes` 입력

### Step 3: 인프라 적용 확인
```bash
cmd.exe /c "C:\terraform\terraform.exe state show aws_security_group.hars_sg"
```

### Step 4: 코드 배포
```bash
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose down && docker-compose up -d --build"
```

### 인프라 변경 예시
- ✅ 보안 그룹 포트 추가/제거 (terraform/main.tf)
- ✅ EC2 인스턴스 타입 변경
- ✅ VPC, 서브넷 설정 변경
- ✅ S3 버킷 생성/삭제
- ✅ IAM Role/Policy 변경

---

## 3️⃣ 배포 검증

### 컨테이너 상태 확인
```bash
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "docker ps"
```

**예상 출력**:
```
CONTAINER ID   IMAGE             COMMAND                  STATUS                   PORTS
xxxxxxxxx      hars-web-client   "/docker-entrypoint.…"   Up X seconds             0.0.0.0:80->80/tcp
xxxxxxxxx      hars-web-server   "docker-entrypoint.s…"   Up X seconds (healthy)   0.0.0.0:5000->5000/tcp
xxxxxxxxx      postgres:15       "docker-entrypoint.s…"   Up X seconds (healthy)   0.0.0.0:5432->5432/tcp
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

---

## 🚫 절대 하지 말 것

1. ❌ AWS 콘솔에서 보안 그룹 수정
2. ❌ EC2 인스턴스 수동 재시작/변경
3. ❌ S3 버킷 수동 생성/삭제
4. ❌ `docker-compose down -v` 사용 (데이터베이스 데이터 삭제됨!)
5. ❌ EC2에서 직접 코드 수정 (항상 Git으로 관리)
6. ❌ Terraform과 AWS 콘솔 혼용

---

## 📂 중요 파일 위치

- **Terraform 실행 파일**: `C:\terraform\terraform.exe`
- **Terraform 설정**: `terraform/main.tf`
- **SSH 키**: `terraform/hars-key` (gitignore됨)
- **환경 변수**: `terraform/terraform.tfvars` (gitignore됨)
- **EC2 IP**: `52.78.232.37` (Elastic IP, 고정됨)

---

## 🏗️ Terraform이 관리하는 인프라

- ✅ AWS EC2 인스턴스 (t2.micro, ap-northeast-2a)
- ✅ 보안 그룹 (포트: 22, 80, 443, 3000, 5000)
- ✅ SSH 키 페어 (hars-key)
- ✅ VPC, 서브넷, Internet Gateway, Route Table
- ✅ Elastic IP (52.78.232.37)
- ✅ S3 버킷 (hars-submissions-henryhjna)
- ✅ IAM Role & Instance Profile (EC2 → S3 접근)

---

## 🌐 접속 정보

- **웹사이트**: http://52.78.232.37 (포트 80, 기본)
- **API**: http://52.78.232.37:5000/api
- **SSH**: `ssh -i "terraform/hars-key" ubuntu@52.78.232.37`

---

## 🔧 트러블슈팅

### 컨테이너가 시작되지 않는 경우

```bash
# 로그 확인
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-server"
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-client"
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "docker logs hars-db"

# 전체 로그 확인
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose logs"
```

### 데이터베이스 초기화가 필요한 경우 (⚠️ 데이터 삭제됨!)

```bash
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose down -v && docker-compose up -d"
```

### 환경 변수 업데이트

```bash
# EC2 서버에 SSH 접속
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37

# .env 파일 수정 (없으면 생성)
cd hars-web
nano .env

# 수정 후 컨테이너 재시작
docker-compose restart
```

### 특정 컨테이너만 재시작

```bash
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose restart server"
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && docker-compose restart client"
```

---

## 📊 배포 체크리스트

### 배포 전
- [ ] 코드 변경사항 Git commit 완료
- [ ] Git push to main 완료
- [ ] 인프라 변경 여부 확인

### 배포 중
- [ ] Terraform plan 확인 (인프라 변경 시)
- [ ] Terraform apply 실행 (인프라 변경 시)
- [ ] 코드 배포 명령어 실행
- [ ] 컨테이너 시작 완료 확인

### 배포 후
- [ ] `docker ps` 로 컨테이너 상태 확인
- [ ] 웹사이트 접속 확인 (http://52.78.232.37)
- [ ] API 엔드포인트 테스트
- [ ] 로그에 에러 없는지 확인

---

## 🎯 배포 예시

### 예시 1: 프론트엔드 코드 수정 후 배포

```bash
# 로컬에서
git add .
git commit -m "Update homepage UI"
git push origin main

# 배포
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose down && docker-compose up -d --build"

# 검증
curl -s -o /dev/null -w "%{http_code}" http://52.78.232.37
# 200 확인
```

### 예시 2: 보안 그룹 포트 추가 후 배포

```bash
# 로컬에서 terraform/main.tf 수정
git add terraform/main.tf
git commit -m "Add port 8080 to security group"
git push origin main

# Terraform 적용
cd c:/projects/hars-web/terraform
cmd.exe /c "C:\terraform\terraform.exe plan"
# 변경사항 확인 후
cmd.exe /c "C:\terraform\terraform.exe apply"

# 코드 배포
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37 "cd hars-web && git pull origin main && docker-compose down && docker-compose up -d --build"
```

### 예시 3: 환경 변수만 업데이트

```bash
# EC2 접속
ssh -i "c:/projects/hars-web/terraform/hars-key" ubuntu@52.78.232.37

# .env 수정
cd hars-web
nano .env
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 등 수정

# 컨테이너 재시작 (빌드 불필요)
docker-compose restart
```

---

## 📝 배포 성공 기록

- **2024-11-13**: 포트 80 배포 성공 (docker-compose.yml 수정)
  - Git commit: `8c71dc7`
  - 변경사항: client 포트 3000 → 80
  - 검증: curl http://52.78.232.37 → 200 OK
