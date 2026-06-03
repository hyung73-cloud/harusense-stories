# Stories Gallery 아키텍처

## 1. 3층 구조 속 위치
```
harusense.com        가격지도        (harusense-db)        ← 수정 금지
care.harusense.com   의료 workflow    (care-db)             ← FREEZE
stories.harusense.com 스토리 갤러리    (stories-db)          ← 이번 작업 (별관)
```
세 프로젝트는 **repo·DB·배포가 분리**됩니다. 갤러리는 care 의 파일을 한 줄도 변경하지 않고, care-db 를 조회/JOIN 하지 않습니다.

## 2. 단방향 데이터 흐름 (변하지 않는 원칙)
```
care-db (PHI·문진 원문, backstage)
        │   ※ 자동 연결 없음. DB FK 없음.
        ▼   [사람] 큐레이션 사무실: 검토 · 익명화 · 확정
stories_published (+ i18n)  ← 확정된 educational narrative 만 insert
        ▼
공개 갤러리  ← stories_published / stories_published_i18n 만 read-only
```
- 공개 API가 읽는 테이블: **`stories_published`, `stories_published_i18n`** 뿐.
- `care_submission_ref` 는 `stories_story_drafts` 에만 존재하며 **어떤 공개 JSON에도 포함되지 않음**(절대 규칙 #6).
- `stories_story_drafts` 는 공개 API에서 read/write 금지.

## 3. 가로 wing 구조 (세로 3층 금지)
갤러리는 아래로 유료층을 쌓지 않고 **옆으로 wing 이 늘어나는 박물관 단지**입니다.

| wing | 무료 개방 (`access=free`) | 유료 전시실 (`access=paid`) |
|------|--------------------------|-----------------------------|
| **ko** (오늘 풀스택) | 교육 narrative feed | 클리닉별 큐레이션·지역·가격 유입 *(예약)* |
| **ja** (예약) | 한국과 동일 구조, UX·콘텐츠만 일본화 | 동일 *(예약)* |
| **intl** (장기) | 인터내셔널 무료 | 동일 *(예약)* |

- **「명품」 = 별도 최상위 유료층이 아님.** 갤러리 전체가 회자·유입되면 성공. 일본 wing이 붐비면 성공 지표.
- `market` / `access` / `clinic_id` / `locale` 은 DB·라우트에 **예약만** 되어 있고, 오늘은 `ko`+`free` 만 콘텐츠가 채워집니다.

## 4. care FREEZE 경계 (위반 시 실패)
- 변경 금지: care 의 `index.html`, `login/`, `dashboard/`, `assets/care.*`, care `functions/api/*`, care migrations
- `care.css` import / dashboard·EMR UI 재사용 금지 → 갤러리는 **`stories.css` 만**
- care-db 연결·JOIN 금지 / SNS형(자유 게시·팔로우·DM·긴 댓글) 금지 / stories 에서 OpenAI 미사용

## 5. 표면(surface) 격리 요약
| 자원 | care | stories |
|------|------|---------|
| repo/디렉터리 | care 루트 | `stories-annex/` only |
| D1 | care-db | stories-db (`STORIES_DB`) |
| CSS | care.css | stories.css |
| 도메인 | care.harusense.com | stories.harusense.com |
| 인증 | care 로그인 | 공개 갤러리 = 로그인 없음 / admin = Cloudflare Access(권장) |

## 6. 확장 로드맵
1. **2단계:** 인증 draft 워크플로(작성→검토→승인→발행) + `stories_story_drafts` 쓰기 API + admin 풀 UI
2. **ja wing:** `stories_published_i18n` 채우기, `?locale=ja` 라우트 활성, UX 일본화
3. **paid 전시실:** `access=paid` 권한·결제·클리닉 room 라우트
4. **intl wing:** locale 확장
5. care → AI draft 자동화는 **care 측 변경이 필요하므로 FREEZE 해제 시점까지 보류** (`docs/INTEGRATION.md` 참조)
