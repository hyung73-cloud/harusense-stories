# Stories Gallery 배포 — 10단계 체크리스트

> care(`harusense-care`) 프로젝트·repo·`care-db` 는 **이 절차 동안 단 한 번도 건드리지 않습니다.**
> 모든 명령은 `stories-annex/` 디렉터리 기준입니다.

## 사전 준비
- Cloudflare 계정 + `wrangler` CLI 로그인 (`npx wrangler login`)
- repo 에 `stories-annex/` 가 포함되어 있어야 함

---

### 1. D1 데이터베이스 생성
```bash
npx wrangler d1 create stories-db
```
출력된 `database_id` 를 복사합니다. (care-db 와 다른 새 DB)

### 2. wrangler.toml 에 database_id 기입
`stories-annex/wrangler.toml` 의 `REPLACE_WITH_STORIES_DB_ID` 를 1단계 값으로 교체.

### 3. 스키마 마이그레이션 실행
```bash
npx wrangler d1 execute stories-db --remote --file=migrations/0001_init.sql
```
- 로컬 점검: `--local` 로 먼저 한 번 실행해 봐도 좋습니다.

### 4. 시드 데이터 주입 (ko·free 교육용 3건)
```bash
npx wrangler d1 execute stories-db --remote --file=migrations/0002_seed.sql
```
확인:
```bash
npx wrangler d1 execute stories-db --remote \
  --command="SELECT slug,title FROM stories_published WHERE market='ko' AND access='free';"
```
→ 3건이 보이면 정상.

### 5. Pages 프로젝트 생성 (별도, care와 분리)
- 대시보드: **Workers & Pages → Create → Pages → Connect to Git → 동일 repo 선택**
- **Project name:** `harusense-stories`
- **Root directory(고급):** `stories-annex`  ← care 루트와 격리되는 핵심
- **Build command:** 비움 / **Build output directory:** `public`

> CLI 직접 배포 대안: `npx wrangler pages deploy public --project-name=harusense-stories`

**Workers Builds(Git) + Deploy command `npx wrangler deploy` 사용 시**
- `src/index.js` 가 `/stories/api/*` 를 처리하고, 정적 파일은 `[assets]` 로 서빙합니다.
- `wrangler deploy` 만 쓰고 `main` 이 없으면 API 가 **404** → 갤러리에 「네트워크 오류」가 납니다.

### 6. D1 바인딩 연결
- Pages 프로젝트 → **Settings → Functions → D1 database bindings**
- Variable name: `STORIES_DB` / D1 database: `stories-db`
- **Production + Preview 둘 다** 추가 후 재배포.

### 7. 첫 배포 확인 (`*.pages.dev`)
- `https://harusense-stories.pages.dev/stories/` → 모바일에서 카드 **3개** 표시
- `…/stories/api/feed?market=ko&access=free` → `{"ok":true,...}` JSON

### 8. 커스텀 도메인 연결 — `stories.harusense.com`
- Pages 프로젝트 → **Custom domains → Set up a custom domain**
- `stories.harusense.com` 입력 → Cloudflare DNS 가 CNAME 자동 생성
- (대안) 같은 도메인 내 경로로 쓰려면 `harusense.com/stories/*` 라우팅이 필요하므로 **서브도메인 권장.**

### 9. 어드민 경로 보호 (선택, 권장)
- `/stories/admin/*` 는 **Cloudflare Access**(Zero Trust)로 이메일 게이팅.
- 현재 admin 은 쓰기 API가 없어 위험 표면이 낮지만, backstage 노출 방지를 위해 권장.

### 10. 동작 점검 체크
- [ ] `/stories/` 카드 3개 + 카드 진입 → 상세 markdown 본문
- [ ] 좋아요 버튼 토글 → 숫자 증가/감소, 새로고침 후 유지
- [ ] 공유 버튼 → 링크 복사 토스트
- [ ] 30초 체류 후 `stories_events` 에 `dwell_30s` 적재
  ```bash
  npx wrangler d1 execute stories-db --remote \
    --command="SELECT type,COUNT(*) FROM stories_events GROUP BY type;"
  ```
- [ ] care 사이트(`care.harusense.com`)는 **무변화** 확인

---

## 발행 운영 (큐레이터)
1. `/stories/admin/` 에서 폼 작성 → **SQL 생성 → 복사**
2. Cloudflare D1 Console (또는 `wrangler d1 execute stories-db --remote --command="..."`) 에 붙여 실행
3. `/stories/` 새로고침 → 새 액자 노출

## 롤백
- 특정 글 숨김: `UPDATE stories_published SET status='hidden' WHERE slug='...';`
- 전체 비우기(주의): `DELETE FROM stories_published;` 후 4단계 재실행
