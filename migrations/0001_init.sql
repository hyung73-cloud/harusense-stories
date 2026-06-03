-- =============================================================
-- harusense Stories Gallery — stories-db schema (D1 / SQLite)
-- 모든 테이블은 stories_ prefix. care-db 와 물리적으로 완전 분리.
-- care-db 를 참조하는 외래키/연결은 존재하지 않는다. (단방향: 큐레이터 수동 입력)
-- =============================================================

-- 장기 클리닉 room (가로 wing 확장 대비)
CREATE TABLE IF NOT EXISTS stories_clinics (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  region      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- archetype: slug + 제목 (정체기, 첫 한 달, 부작용 적응 등)
CREATE TABLE IF NOT EXISTS stories_archetypes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 공개 published 만. 환자 DB/문진 원문 없음. 큐레이션 확정본 only.
CREATE TABLE IF NOT EXISTS stories_published (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT UNIQUE NOT NULL,
  market        TEXT NOT NULL DEFAULT 'ko',       -- ko | ja | intl
  access        TEXT NOT NULL DEFAULT 'free',     -- free | paid
  clinic_id     INTEGER REFERENCES stories_clinics(id),
  archetype_id  INTEGER REFERENCES stories_archetypes(id),
  title         TEXT NOT NULL,
  excerpt       TEXT,
  body_markdown TEXT NOT NULL,
  read_minutes  INTEGER NOT NULL DEFAULT 3,
  -- 표현(presentation)용 보조 컬럼 (PHI 아님, 갤러리 카드 렌더용)
  cover_emoji   TEXT DEFAULT '🌿',
  accent        TEXT DEFAULT 'sage',              -- sage | gold | clay | ink
  like_count    INTEGER NOT NULL DEFAULT 0,       -- 캐시 카운트 (likes 테이블이 원천)
  published_at  TEXT NOT NULL DEFAULT (datetime('now')),
  status        TEXT NOT NULL DEFAULT 'published' -- published | hidden
);

CREATE INDEX IF NOT EXISTS idx_stories_pub_feed
  ON stories_published (market, access, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_pub_slug
  ON stories_published (slug);

-- 다국어 본문 (일본/인터 wing 확장 대비). 없으면 stories_published 원문 사용.
CREATE TABLE IF NOT EXISTS stories_published_i18n (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id      INTEGER NOT NULL REFERENCES stories_published(id) ON DELETE CASCADE,
  locale        TEXT NOT NULL,                    -- ko | ja | en
  title         TEXT NOT NULL,
  excerpt       TEXT,
  body_markdown TEXT NOT NULL,
  UNIQUE(story_id, locale)
);

-- 익명 행동 이벤트 (PHI 절대 없음). visitor_key 는 클라이언트 난수.
CREATE TABLE IF NOT EXISTS stories_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL,   -- feed_view | story_view | like | share_copy | save | dwell_30s
  story_id    INTEGER,
  story_slug  TEXT,
  visitor_key TEXT,
  market      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stories_events_type
  ON stories_events (type, created_at DESC);

-- 좋아요 (visitor_key + story 유니크). 토글 가능.
CREATE TABLE IF NOT EXISTS stories_likes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id    INTEGER NOT NULL REFERENCES stories_published(id) ON DELETE CASCADE,
  visitor_key TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(story_id, visitor_key)
);

-- 경량 rate limit 버킷 (IP × 1분 윈도우). 쓰기(POST) 보호용.
CREATE TABLE IF NOT EXISTS stories_rate (
  bucket       TEXT PRIMARY KEY,   -- "<ip>:<minute_window>"
  n            INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

-- =============================================================
-- 큐레이션 작업장 (스키마만). 공개 API 에서 절대 read/write 금지.
-- 2단계 인증 어드민에서만 사용. PHI(환자 식별자) 입력 금지 정책.
-- =============================================================
CREATE TABLE IF NOT EXISTS stories_story_drafts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_slug    TEXT UNIQUE,
  market        TEXT NOT NULL DEFAULT 'ko',
  access        TEXT NOT NULL DEFAULT 'free',
  clinic_id     INTEGER,
  archetype_id  INTEGER,
  title         TEXT,
  excerpt       TEXT,
  body_markdown TEXT,
  read_minutes  INTEGER DEFAULT 3,
  cover_emoji   TEXT DEFAULT '🌿',
  accent        TEXT DEFAULT 'sage',
  source_note   TEXT,                             -- 큐레이터 자유 메모 (PHI 금지)
  -- care 원문 추적용 약한 참조. 큐레이터 내부 메모일 뿐 care-db FK 아님.
  -- 절대 규칙 #6: 공개 JSON 에 절대 포함 금지. 어떤 공개 API 도 이 컬럼을 SELECT 하지 않는다.
  care_submission_ref TEXT,
  review_state  TEXT NOT NULL DEFAULT 'drafting', -- drafting | in_review | approved | published | rejected
  curator       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
