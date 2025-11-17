# HARS Web - 시스템 전체 점검 보고서

**Date**: 2025-01-17
**Auditor**: System Review Agent
**Scope**: 비즈니스 로직, CRUD, 데이터베이스, 코드 로직 전체

---

## ✅ 완료된 수정 사항

### 1. Critical 버그 수정 (즉시 적용됨)

#### 1.1 resendVerification 토큰 버그 수정 ✅
**문제**: 이메일 인증 재발송 시 비밀번호 재설정 토큰 메서드를 잘못 사용
**파일**: [server/src/controllers/auth.controller.ts:315-317](server/src/controllers/auth.controller.ts#L315-L317)

**Before**:
```typescript
await UserModel.setResetPasswordToken(user.id, token, new Date(...));  // 잘못된 메서드
```

**After**:
```typescript
await UserModel.setEmailVerificationToken(user.id, token);  // 올바른 메서드
```

**영향**: 이메일 인증 시스템이 제대로 작동하지 않았음. 이제 정상 작동.

---

#### 1.2 Reviewer 권한 우회 취약점 수정 ✅
**문제**: Reviewer role만 있으면 모든 제출물 조회 가능 (할당 여부 무관)
**파일**: [server/src/controllers/submission.controller.ts:78-91](server/src/controllers/submission.controller.ts#L78-L91)

**Before**:
```typescript
const isReviewer = req.user!.roles.includes('reviewer');
if (!isOwner && !isAdmin && !isReviewer) {
  throw new ApiError('Access denied', 403);
}
```

**After**:
```typescript
// Reviewer must be assigned to this submission
let isAssignedReviewer = false;
if (req.user!.roles.includes('reviewer')) {
  const { ReviewAssignmentModel } = await import('../models/review.model');
  isAssignedReviewer = await ReviewAssignmentModel.isAssigned(id, req.user!.id);
}
if (!isOwner && !isAdmin && !isAssignedReviewer) {
  throw new ApiError('Access denied', 403);
}
```

**영향**: 보안 취약점 제거. 이제 할당된 reviewer만 해당 제출물 조회 가능.

---

#### 1.3 데이터베이스 스키마 통합 ✅
**문제**: init.sql과 migration 파일 간 불일치
**파일**: [db/init.sql](db/init.sql)

**추가된 컬럼**:
- `users.preferred_name` VARCHAR(100)
- `users.prefix` VARCHAR(10)
- `users.academic_title` VARCHAR(100)
- `users.photo_url` TEXT
- `events.status` VARCHAR(20) DEFAULT 'upcoming'
- `faculty_members` 테이블 전체 추가

**추가된 인덱스**:
- `idx_users_prefix`
- `idx_users_academic_title`
- `idx_events_status`
- `idx_faculty_display_order`
- `idx_faculty_is_active`

---

### 2. 보안 개선

#### 2.1 .gitignore 업데이트 ✅
- `.claude/settings.local.json` 추가 (AWS credentials 노출 방지)
- GitHub Secret Scanning에 의한 푸시 거부 해결

---

## ⚠️ 발견된 문제 (수정 필요)

### Priority: HIGH (빠른 시일 내 수정)

#### H1. 리뷰 완료 시 Submission 상태 자동 업데이트 누락
**파일**: `server/src/controllers/review.controller.ts:68-79`

**문제**:
- 한 명의 reviewer만 완료해도 submission이 'under_review'로 변경됨
- 모든 reviewer가 완료해도 'under_review'에서 변경 안됨 (accepted/rejected로 가야 함)

**권장 수정**:
```typescript
// 모든 assignments 완료 여부 확인
const allAssignments = await ReviewAssignmentModel.findBySubmission(submissionId);
const allCompleted = allAssignments.every(a => a.status === 'completed');

if (allCompleted) {
  // 모든 리뷰의 recommendation을 확인하여 최종 결정
  const reviews = await ReviewModel.findBySubmission(submissionId);
  const acceptCount = reviews.filter(r => r.recommendation === 'accept').length;
  const rejectCount = reviews.filter(r => r.recommendation === 'reject').length;

  // 다수결 또는 admin 수동 결정 필요
  // 현재는 'revision_requested'로 설정하고 admin이 최종 결정
  await SubmissionModel.updateStatus(submissionId, 'revision_requested');
}
```

---

#### H2. S3 업로드 실패 시 롤백 없음
**파일**: `server/src/controllers/submission.controller.ts:135`

**문제**:
- PDF 업로드 → DB 저장 순서
- DB 저장 실패 시 S3에 파일 남음 (저장소 낭비)

**권장 수정**:
```typescript
let pdfUrl = null;
try {
  // Upload PDF to S3
  pdfUrl = await uploadPdfToS3(req.file);

  // Create submission
  const submission = await SubmissionModel.create({...});

  res.status(201).json({success: true, data: submission});
} catch (error) {
  // Cleanup: delete uploaded file from S3
  if (pdfUrl) {
    try {
      await deleteFileFromS3(pdfUrl);
    } catch (cleanupError) {
      console.error('Failed to cleanup S3 file:', cleanupError);
    }
  }
  throw error;
}
```

---

#### H3. Event 날짜 순서 검증 누락
**파일**: `server/src/models/event.model.ts`

**문제**:
- `submission_start_date > submission_end_date` 가능
- `submission_end_date > event_date` 가능
- `review_deadline < submission_end_date` 가능

**권장 수정**:
```typescript
static validateEventDates(data: any): void {
  const start = new Date(data.submission_start_date);
  const end = new Date(data.submission_end_date);
  const eventDate = new Date(data.event_date);

  if (start >= end) {
    throw new ApiError('Submission start date must be before end date', 400);
  }
  if (end >= eventDate) {
    throw new ApiError('Submission end date must be before event date', 400);
  }
  if (data.review_deadline && new Date(data.review_deadline) <= end) {
    throw new ApiError('Review deadline must be after submission end date', 400);
  }
}
```

---

#### H4. Admin 권한 상승 공격 가능
**파일**: `server/src/models/user.model.ts:192-200`

**문제**:
- `updateRoles()` 메서드를 누구나 호출 가능하면 자신을 admin으로 만들 수 있음
- 라우트 레벨에서 admin 검증 필요

**권장 수정**:
```typescript
// Route에서 admin 권한 체크 추가
router.put('/users/:id/roles', requireAuth, requireAdmin, UserController.updateRoles);
```

---

#### H5. 제출물 삭제 시 리뷰 데이터 보호 필요
**파일**: `server/src/controllers/submission.controller.ts:253-284`

**문제**:
- 리뷰 진행 중인 제출물을 사용자가 삭제 가능
- Cascade delete로 모든 reviews 삭제됨

**권장 수정**:
```typescript
// 리뷰 상태 확인
if (submission.status !== 'draft' && submission.status !== 'submitted') {
  throw new ApiError('Cannot delete submission that is under review or has been reviewed', 400);
}

// 또는 soft delete 구현
await SubmissionModel.softDelete(id);  // is_deleted = true
```

---

### Priority: MEDIUM (계획적 개선)

#### M1. Cascade Delete → Soft Delete 변경
**파일**: `db/init.sql`

**현재 문제**:
- Event 삭제 → 모든 submissions 삭제
- User 삭제 → 모든 submissions 삭제
- Submission 삭제 → 모든 reviews 삭제

**권장 변경**:
```sql
-- Add is_deleted columns
ALTER TABLE events ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Change CASCADE to RESTRICT
ALTER TABLE submissions DROP CONSTRAINT submissions_event_id_fkey;
ALTER TABLE submissions ADD CONSTRAINT submissions_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;
```

---

#### M2. Event 상태 관리 혼란
**파일**: `server/src/models/event.model.ts:6-18`

**문제**:
- DB에 `events.status` 컬럼이 있지만 사용되지 않음
- 쿼리에서 항상 event_date 기준으로 재계산

**권장 수정**:
1. DB status 컬럼 제거 (쿼리에서만 계산)
2. 또는 트리거로 자동 업데이트:
```sql
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  IF CURRENT_DATE < NEW.event_date THEN
    NEW.status = 'upcoming';
  ELSIF CURRENT_DATE = NEW.event_date THEN
    NEW.status = 'ongoing';
  ELSE
    NEW.status = 'past';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

#### M3. 리뷰 통계 SQL 오류
**파일**: `server/src/models/review.model.ts:124-138`

**문제**:
- `major_revision`, `minor_revision` 카운트 시도
- DB schema에는 'accept', 'reject'만 허용 (CHECK constraint)

**수정 필요**:
```typescript
// Remove major/minor revision counts
const sql = `
  SELECT
    COUNT(*) as total_reviews,
    COUNT(CASE WHEN is_completed = TRUE THEN 1 END) as completed_reviews,
    AVG(overall_score) as average_score,
    COUNT(CASE WHEN recommendation = 'accept' THEN 1 END) as accept_count,
    COUNT(CASE WHEN recommendation = 'reject' THEN 1 END) as reject_count
  FROM reviews
  WHERE submission_id = $1
`;
```

---

#### M4. JSONB 부분 업데이트 불가
**파일**: `server/src/models/event.model.ts:228-229`

**문제**:
- `highlight_stats`, `event_content` 전체 교체만 가능
- 일부 필드만 업데이트 불가

**권장 수정**:
```typescript
// PostgreSQL jsonb_set 사용
const sql = `
  UPDATE events SET
    highlight_stats = jsonb_set(
      COALESCE(highlight_stats, '{}'::jsonb),
      '{participants}',
      $1::text::jsonb
    )
  WHERE id = $2
`;
```

---

### Priority: LOW (점진적 개선)

#### L1. 구조화된 로깅 부족
- Winston 또는 Pino 도입 권장
- Request ID tracking 추가

#### L2. API 페이지네이션 불일치
- `getAllSubmissions`: 페이지네이션 지원
- `getAllEvents`: 페이지네이션 미지원
- 일관성 필요

#### L3. JWT Refresh Token 미구현
- 현재 access token만 사용
- 만료 시 재로그인 필요

#### L4. Rate Limiting 없음
- 로그인, 비밀번호 재설정에 제한 없음
- express-rate-limit 추가 권장

#### L5. 이메일 전송 실패 처리
- 현재 console.error만 출력
- 재시도 메커니즘 없음

---

## 📊 통계

### 코드 품질

| 항목 | 개수 |
|------|------|
| 전체 Controller 파일 | 10개 |
| 전체 Model 파일 | 10개 |
| Critical 버그 수정 | 2개 |
| High 우선순위 이슈 | 5개 |
| Medium 우선순위 이슈 | 4개 |
| Low 우선순위 이슈 | 5개 |

### 데이터베이스

| 항목 | 개수 |
|------|------|
| 테이블 | 11개 (faculty_members 추가) |
| 인덱스 | 17개 |
| Foreign Keys | 9개 |
| Triggers | 6개 |

---

## 🎯 권장 조치 사항

### 즉시 조치 (이번 주)
1. ✅ resendVerification 버그 수정 (완료)
2. ✅ Reviewer 권한 제한 (완료)
3. ⚠️ 리뷰 완료 시 submission 상태 자동 업데이트
4. ⚠️ S3 업로드 실패 시 롤백
5. ⚠️ Event 날짜 순서 검증

### 단기 조치 (이번 달)
1. Admin 권한 상승 방지
2. 제출물 삭제 시 리뷰 보호
3. Soft delete 구현
4. 리뷰 통계 SQL 수정
5. Rate limiting 추가

### 중기 조치 (분기별)
1. JWT Refresh token 구현
2. 구조화된 로깅 도입
3. API 페이지네이션 통일
4. 이메일 재시도 메커니즘
5. JSONB 부분 업데이트 지원

---

## 📝 변경 이력

| 날짜 | 변경 사항 | 커밋 |
|------|-----------|------|
| 2025-01-17 | resendVerification 버그 수정 | f2e91e8 |
| 2025-01-17 | Reviewer 권한 제한 | f2e91e8 |
| 2025-01-17 | init.sql 스키마 업데이트 | f2e91e8 |
| 2025-01-17 | .gitignore 보안 개선 | f2e91e8 |

---

## 🔒 보안 체크리스트

- [x] AWS credentials git에 커밋 방지
- [x] Reviewer 권한 우회 취약점 수정
- [ ] Admin 권한 상승 방지
- [ ] Rate limiting 추가
- [ ] JWT 토큰 만료 시간 검토
- [ ] SQL Injection 방지 (현재 parameterized query 사용중 ✅)
- [ ] XSS 방지 (input sanitization 필요)

---

**이 보고서는 시스템 전체 점검 결과를 요약한 것입니다.**
**우선순위에 따라 순차적으로 수정을 진행하시기 바랍니다.**
