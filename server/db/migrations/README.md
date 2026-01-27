# Database Migrations

이 디렉토리는 데이터베이스 스키마 마이그레이션 파일을 포함합니다.

## 명령어

```bash
# 마이그레이션 상태 확인
npm run migrate:status

# 모든 pending 마이그레이션 실행
npm run migrate

# 새 마이그레이션 파일 생성
npm run migrate:create "migration description"

# 마이그레이션 파일 무결성 검증
npm run migrate:verify

# 기존 DB에 마이그레이션 추적 초기화 (처음 한 번만)
npm run migrate:init-existing
```

## 파일 명명 규칙

```
XXX_description.sql
```

- `XXX`: 3자리 버전 번호 (001, 002, ...)
- `description`: 소문자와 언더스코어로 구성된 설명

예시:
- `001_add_display_options.sql`
- `002_add_conference_features.sql`

## 마이그레이션 작성 가이드

### 기본 템플릿

```sql
-- Migration: Add feature X
-- Created at: 2024-01-01T00:00:00.000Z
--
-- IMPORTANT:
-- - This migration will be run in a transaction
-- - Test on a backup before running in production
-- - Migrations cannot be reversed automatically

-- Your SQL here
ALTER TABLE users ADD COLUMN new_column VARCHAR(255);
```

### 안전한 마이그레이션 작성

1. **항상 `IF NOT EXISTS` / `IF EXISTS` 사용**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);
   DROP INDEX IF EXISTS idx_users_email;
   ```

2. **컬럼 추가 시 기본값 고려**
   ```sql
   -- NOT NULL 컬럼 추가 시 기본값 필수
   ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
   ```

3. **대용량 테이블 인덱스 추가 시 CONCURRENTLY 사용**
   ```sql
   CREATE INDEX CONCURRENTLY idx_submissions_status ON submissions(status);
   ```

## 프로덕션 배포 체크리스트

1. **배포 전**
   - [ ] 프로덕션 DB 백업 완료
   - [ ] 로컬에서 마이그레이션 테스트 완료
   - [ ] `npm run migrate:status`로 pending 확인

2. **첫 배포 시 (마이그레이션 추적 초기화)**
   ```bash
   # 프로덕션 서버에서
   npm run migrate:init-existing
   ```

3. **일반 배포 시**
   ```bash
   # 마이그레이션 실행
   npm run migrate
   ```

4. **배포 후**
   - [ ] `npm run migrate:status`로 실행 확인
   - [ ] 애플리케이션 정상 동작 확인

## schema_migrations 테이블

마이그레이션 추적 테이블 구조:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | Primary key |
| version | INTEGER | 마이그레이션 버전 (001, 002, ...) |
| name | VARCHAR(255) | 마이그레이션 이름 |
| executed_at | TIMESTAMP | 실행 시간 |
| checksum | VARCHAR(64) | 파일 SHA256 해시 |
| execution_time_ms | INTEGER | 실행 소요 시간 (ms) |

## 주의사항

1. **실행된 마이그레이션 파일은 절대 수정하지 마세요**
   - checksum이 변경되어 `migrate:verify`가 실패합니다

2. **마이그레이션은 되돌릴 수 없습니다**
   - 롤백이 필요하면 새 마이그레이션을 작성하세요

3. **트랜잭션 내에서 실행됩니다**
   - 오류 발생 시 자동 롤백됩니다
