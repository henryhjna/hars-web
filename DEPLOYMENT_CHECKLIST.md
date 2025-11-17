# HARS Web - 배포 체크리스트 및 표준 프로세스

**Last Updated**: 2025-01-17

---

## ⚠️ 반드시 지켜야 할 원칙

### 🚫 절대 금지 사항
1. ❌ **EC2에서 직접 빌드하지 말 것** (t2.micro는 너무 느림!)
2. ❌ **AWS 콘솔에서 수동으로 인프라 변경하지 말 것**
3. ❌ **terraform.tfvars 파일을 Git에 커밋하지 말 것**
4. ❌ **AWS 자격 증명을 .env 파일에 저장하지 말 것**
5. ❌ **배포 스크립트 없이 수동으로 배포하지 말 것**

### ✅ 반드시 따라야 할 규칙
1. ✅ **모든 배포는 `scripts/deploy.sh` 또는 `scripts/deploy.bat` 사용**
2. ✅ **AWS 자격 증명은 `terraform/terraform.tfvars`에만 저장**
3. ✅ **인프라 변경은 Terraform으로만 수행**
4. ✅ **코드 변경은 반드시 Git에 커밋 후 배포**
5. ✅ **배포 전 로컬에서 테스트 완료 확인**

---

## 📋 표준 배포 프로세스

### 1단계: 코드 변경 및 로컬 테스트

```bash
# 로컬 개발 서버 실행
cd c:/projects/hars-web/server && npm run dev  # Terminal 1
cd c:/projects/hars-web/client && npm run dev  # Terminal 2

# 브라우저에서 테스트
# http://localhost:3000
```

**체크리스트**:
- [ ] 로컬에서 코드 변경 완료
- [ ] 로컬 개발 서버에서 정상 동작 확인
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 확인

---

### 2단계: Git 커밋 및 푸시

```bash
cd c:/projects/hars-web

# 변경사항 확인
git status
git diff

# 스테이징
git add .

# 커밋 (의미 있는 메시지 작성)
git commit -m "feat: Add faculty photo upload functionality"

# 푸시
git push origin main
```

**커밋 메시지 규칙**:
- `feat:` - 새로운 기능
- `fix:` - 버그 수정
- `refactor:` - 코드 리팩토링
- `docs:` - 문서 변경
- `style:` - 코드 스타일 변경 (포맷팅 등)
- `test:` - 테스트 추가/수정
- `chore:` - 빌드 프로세스, 도구 설정 등

**체크리스트**:
- [ ] 변경된 파일 모두 확인
- [ ] 의미 있는 커밋 메시지 작성
- [ ] GitHub에 푸시 완료

---

### 3단계: 자동 배포 스크립트 실행

```bash
cd c:/projects/hars-web

# Windows Command Prompt / PowerShell
scripts\deploy.bat

# Git Bash / Linux / Mac
bash scripts/deploy.sh
```

**스크립트가 자동으로 수행하는 작업**:
1. ✅ terraform.tfvars에서 AWS 자격 증명 자동 로드
2. ✅ Terraform output에서 ECR URL, EC2 IP 추출
3. ✅ AWS CLI 자동 설정 및 자격 증명 검증
4. ✅ 로컬에서 Docker 이미지 빌드 (client, server)
5. ✅ ECR 로그인
6. ✅ Docker 이미지 태그 및 ECR 푸시
7. ✅ EC2에서 최신 코드 pull (git pull)
8. ✅ EC2에서 최신 이미지 pull (docker-compose pull)
9. ✅ 컨테이너 재시작 (docker-compose up -d)
10. ✅ 배포 검증 (HTTP 응답 확인)

**체크리스트**:
- [ ] 스크립트 실행 완료
- [ ] 모든 단계에서 ✅ 표시 확인
- [ ] 에러 메시지 없음

---

### 4단계: 배포 검증

```bash
# 웹사이트 접속 확인
curl http://52.78.232.37

# 브라우저에서 확인
# http://52.78.232.37
```

**검증 항목**:
- [ ] 웹사이트가 정상적으로 로드됨
- [ ] 변경사항이 반영됨
- [ ] 기존 기능이 정상 동작함
- [ ] 데이터베이스 연결 정상

**문제 발생 시 로그 확인**:
```bash
# EC2 SSH 접속
ssh -i "terraform/hars-key" ubuntu@52.78.232.37

# 컨테이너 상태 확인
docker ps

# 로그 확인
cd hars-web
docker-compose logs --tail=100 server
docker-compose logs --tail=100 client
docker-compose logs --tail=100 db
```

---

## 🔧 트러블슈팅

### 문제: 스크립트 실행 중 "AWS credentials are invalid" 에러

**원인**: terraform.tfvars의 AWS 자격 증명이 만료되었거나 잘못됨

**해결**:
1. AWS Console에서 새로운 Access Key 생성
2. `terraform/terraform.tfvars` 파일 업데이트:
```hcl
aws_access_key = "NEW_ACCESS_KEY"
aws_secret_key = "NEW_SECRET_KEY"
```
3. 스크립트 재실행

---

### 문제: EC2 SSH 연결 실패 "Connection timed out"

**원인**: EC2 인스턴스가 중지되었거나 보안 그룹 설정 문제

**해결**:
1. AWS Console에서 EC2 인스턴스 상태 확인
2. 인스턴스가 "stopped"면 시작
3. 보안 그룹에서 SSH 포트 22 허용 확인
4. Elastic IP 연결 상태 확인

---

### 문제: Docker 빌드 실패

**원인**: 로컬 코드에 TypeScript 에러 또는 의존성 문제

**해결**:
1. 로컬에서 빌드 테스트:
```bash
cd c:/projects/hars-web/server
npm run build

cd c:/projects/hars-web/client
npm run build
```
2. 에러 수정 후 다시 배포

---

### 문제: ECR 푸시 실패 "denied: Your authorization token has expired"

**원인**: ECR 로그인 토큰 만료

**해결**:
1. 스크립트 재실행 (자동으로 재로그인됨)
2. 또는 수동 로그인:
```bash
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 025158345480.dkr.ecr.ap-northeast-2.amazonaws.com
```

---

## 📊 배포 현황 추적

### 배포 로그 기록

매 배포 시 다음 정보를 기록할 것을 권장:

| 날짜 | 커밋 해시 | 변경 내용 | 배포자 | 결과 | 비고 |
|------|-----------|-----------|--------|------|------|
| 2025-01-17 | 0438d8f | Fix faculty.model.ts profile_url bug | henryhjna | ✅ 성공 | - |
| 2025-01-17 | 2c02fa0 | Add automated deployment scripts | henryhjna | ⏸️ 대기 | EC2 SSH 이슈 |

---

## 🎯 배포 빈도 및 타이밍

### 권장 배포 시간
- **평일**: 오후 3-5시 (한국 시간)
- **주말**: 언제든지 가능
- **긴급 수정**: 즉시

### 배포 전 확인사항
- [ ] 로컬 테스트 완료
- [ ] Git 커밋 완료
- [ ] 데이터베이스 마이그레이션 필요 시 준비
- [ ] 배포 후 테스트 계획 수립

---

## 📚 관련 문서

- **DEPLOYMENT.md**: 상세 배포 가이드 및 인프라 정보
- **README.md**: 프로젝트 개요 및 로컬 개발 가이드
- **terraform/README.md**: Terraform 사용법
- **scripts/deploy.sh**: 배포 자동화 스크립트

---

## 🔐 보안 주의사항

### Git에 절대 커밋하지 말 것
- ❌ `terraform/terraform.tfvars` (AWS 자격 증명)
- ❌ `terraform/*.pem` or `terraform/hars-key` (SSH 키)
- ❌ `.env` 파일 (환경 변수)
- ❌ AWS Access Keys, Secret Keys
- ❌ Database 패스워드

### .gitignore 확인
```bash
# 정기적으로 확인
cat .gitignore | grep terraform
cat .gitignore | grep .env
```

---

## 📝 체크리스트 요약

### 배포 전
- [ ] 로컬 테스트 완료
- [ ] TypeScript 에러 없음
- [ ] Git 커밋 및 푸시 완료
- [ ] terraform/terraform.tfvars 파일 존재 확인
- [ ] SSH 키 파일 존재 확인

### 배포 중
- [ ] `scripts/deploy.sh` 실행
- [ ] 모든 단계 ✅ 확인
- [ ] 에러 없이 완료

### 배포 후
- [ ] 웹사이트 접속 확인
- [ ] 변경사항 반영 확인
- [ ] 기존 기능 정상 동작 확인
- [ ] 배포 로그 기록

---

**이 문서는 모든 배포 시 참조해야 합니다.**
**표준 프로세스를 따르지 않으면 예상치 못한 문제가 발생할 수 있습니다.**
