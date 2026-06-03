-- =============================================================
-- harusense Stories Gallery — seed data
-- 한국 wing · 무료 gallery. 모든 narrative 는 익명·합성(composite)·교육용.
-- 실제 환자 기록/문진 원문 아님. PHI 없음.
-- =============================================================

INSERT INTO stories_clinics (slug, name, region) VALUES
  ('newsense-mapo', '뉴센스 라운지', '서울 마포'),
  ('harusense-archive', '하루센스 아카이브', '온라인');

INSERT INTO stories_archetypes (slug, title, description) VALUES
  ('first-month',  '첫 한 달',     '시작 직후 4주, 몸이 적응하는 시기의 이야기'),
  ('plateau',      '정체기',       '체중이 멈춘 구간을 지나가는 이야기'),
  ('restart',      '다시 시작',    '중단했다가 다시 돌아온 이야기'),
  ('maintenance',  '유지기',       '감량 이후 일상으로 안착하는 이야기');

-- ── Story 1 : 첫 한 달, 메스꺼움과 친해지기 ───────────────────
INSERT INTO stories_published
  (slug, market, access, clinic_id, archetype_id, title, excerpt, body_markdown, read_minutes, cover_emoji, accent, status)
VALUES (
  'first-month-nausea', 'ko', 'free',
  (SELECT id FROM stories_clinics WHERE slug='newsense-mapo'),
  (SELECT id FROM stories_archetypes WHERE slug='first-month'),
  '첫 한 달, 메스꺼움과 친해지기',
  '시작 첫 주의 울렁거림은 대개 ‘잘못된 신호’가 아니라 ‘적응 중’이라는 신호입니다. 무엇을 줄이고 무엇을 기다려야 했는지에 대한 이야기.',
  '## 첫 주는 거의 다 같은 모습이었습니다

처음 주사를 맞은 분들이 가장 많이 떠올리는 단어는 ‘울렁거림’입니다. 아침엔 괜찮다가 점심을 조금 많이 먹으면 속이 차오르는 느낌, 기름진 음식 뒤의 더부룩함. 많은 분이 이걸 “약이 안 맞나?” 하고 받아들이지만, 첫 한 달의 메스꺼움은 대부분 **몸이 위 배출 속도 변화에 적응하는 과정**에 가깝습니다.

## 줄여서 도움이 된 것들

- 한 번에 먹는 양을 평소의 2/3로
- 튀김·크림처럼 기름진 음식은 첫 2주만 잠깐 미루기
- 물은 식사 중간보다 식사 전후로 나눠서

특별한 비법이라기보다, **천천히·적게·자주**라는 오래된 원칙이 이 시기엔 유독 잘 맞았습니다.

## 기다려야 했던 것

가장 어려운 건 음식이 아니라 ‘조급함’이었습니다. 첫 2~3주는 체중보다 몸의 신호를 읽는 연습 기간에 가깝습니다. 숫자가 빨리 안 움직여도, 식사량과 공복감이 조금씩 바뀌고 있다면 그 자체가 적응의 신호였습니다.

> 첫 달의 목표는 ‘많이 빼는 것’이 아니라 ‘끝까지 가는 리듬을 찾는 것’이었습니다.

증상이 일상생활을 방해할 만큼 심하거나, 구토가 반복되거나, 물도 못 마실 정도라면 그건 적응이 아니라 점검이 필요한 신호입니다. 그럴 땐 다음 진료를 앞당겨 상의하는 편이 좋습니다.',
  4, '🌿', 'sage', 'published'
);

-- ── Story 2 : 정체기는 실패가 아니다 ─────────────────────────
INSERT INTO stories_published
  (slug, market, access, clinic_id, archetype_id, title, excerpt, body_markdown, read_minutes, cover_emoji, accent, status)
VALUES (
  'plateau-is-not-failure', 'ko', 'free',
  (SELECT id FROM stories_clinics WHERE slug='newsense-mapo'),
  (SELECT id FROM stories_archetypes WHERE slug='plateau'),
  '정체기는 실패가 아니다',
  '잘 빠지던 체중이 3주째 같은 자리에 멈췄을 때, 가장 흔한 반응은 자책입니다. 하지만 정체는 종종 ‘몸이 새 무게를 학습하는 구간’이었습니다.',
  '## 멈춘 저울 앞에서

순조롭게 줄던 숫자가 어느 날부터 같은 자리에 머뭅니다. 2주, 3주… 많은 분이 이 지점에서 “역시 나는 안 되나 봐” 하고 마음이 꺾입니다. 하지만 체중 곡선은 직선이 아니라 **계단**에 가깝습니다. 내려가다 잠시 평평해지고, 다시 내려갑니다.

## 정체기에 실제로 일어나는 일

- 근육량이 유지되면서 체성분이 먼저 바뀌는 시기
- 활동대사가 새 체중에 맞춰 재조정되는 시기
- 식사 패턴이 느슨해지기 쉬운 ‘방심 구간’

특히 세 번째가 핵심이었습니다. 초반의 긴장이 풀리면서 조금씩 양이 늘고, 기록을 멈추는 일이 겹칩니다.

## 다시 움직이게 한 것

거창한 변화가 아니라 **기록의 복귀**였습니다. 며칠치 식사를 다시 적어보면, 멈춘 이유가 대개 그 안에 있었습니다. 거기에 가벼운 근력 활동을 더하면 계단의 다음 칸으로 내려가는 경우가 많았습니다.

> 정체기는 멈춤이 아니라, 몸이 새 무게를 ‘기본값’으로 받아들이는 시간이었습니다.

체중이 멈춘 김에 약을 임의로 늘리거나 끊는 선택은 권하지 않습니다. 정체가 길어지면 용량·생활 패턴을 함께 점검하는 진료가 더 안전한 길이었습니다.',
  3, '⛰️', 'ink', 'published'
);

-- ── Story 3 : 약을 멈춘 뒤, 다시 시작하기 ────────────────────
INSERT INTO stories_published
  (slug, market, access, clinic_id, archetype_id, title, excerpt, body_markdown, read_minutes, cover_emoji, accent, status)
VALUES (
  'restart-after-pause', 'ko', 'free',
  (SELECT id FROM stories_clinics WHERE slug='harusense-archive'),
  (SELECT id FROM stories_archetypes WHERE slug='restart'),
  '약을 멈춘 뒤, 다시 시작하기',
  '여러 사정으로 중단했다가 돌아오는 분들이 가장 두려워하는 건 ‘처음부터 다시’라는 느낌입니다. 하지만 다시 시작은 리셋이 아니라 이어 붙이기였습니다.',
  '## 돌아오는 길은 늘 머뭇거림에서 시작됩니다

여행, 비용, 바쁜 일정, 혹은 “이만하면 됐다”는 마음. 중단의 이유는 다양합니다. 그리고 다시 오시는 분들의 표정엔 공통점이 있습니다. **다시 처음으로 돌아간 것 같은 막막함.**

## 다시 시작이 ‘처음’과 다른 이유

- 한 번 경험한 식사 감각이 몸에 남아 있습니다
- 어떤 음식이 나를 무너뜨리는지 이미 압니다
- 무엇보다, 끝까지 가본 리듬을 기억합니다

그래서 재시작은 보통 처음보다 적응이 빠릅니다. 용량도 무조건 예전 수치로 돌아가는 게 아니라, 멈춰 있던 기간에 맞춰 다시 조정하는 편이 안전했습니다.

## 가장 중요한 한 가지

자책을 내려놓는 것이었습니다. 중단은 실패가 아니라 잠깐의 쉼표였고, 돌아온 것 자체가 이미 절반의 성공이었습니다.

> 다시 시작은 리셋(reset)이 아니라, 멈췄던 문장을 이어 쓰는 일이었습니다.

오래 쉬었다가 재개할 때는 용량·부작용을 처음처럼 다시 살펴야 합니다. 임의로 예전 용량부터 시작하지 말고, 재개 시점의 상태를 기준으로 진료에서 맞추는 것이 안전했습니다.',
  3, '🔁', 'clay', 'published'
);

-- ── i18n 예시 (일본 wing 확장 데모, 1건만) ───────────────────
INSERT INTO stories_published_i18n (story_id, locale, title, excerpt, body_markdown)
VALUES (
  (SELECT id FROM stories_published WHERE slug='first-month-nausea'),
  'ja',
  '最初の1か月、吐き気と仲良くなる',
  '最初の週のむかつきは「失敗のサイン」ではなく「適応中」のサインであることが多いです。',
  '## 最初の週はほとんど同じでした\n\n（※ 日本 wing 公開時に正式翻訳を差し替え。現在はデモ用プレースホルダー。）'
);

-- ── 드래프트 샘플 (작업장 스키마 동작 확인용, 공개 API 미노출) ──
INSERT INTO stories_story_drafts
  (draft_slug, market, access, archetype_id, title, excerpt, body_markdown, read_minutes, review_state, curator, source_note)
VALUES (
  'maintenance-routine-draft', 'ko', 'free',
  (SELECT id FROM stories_archetypes WHERE slug='maintenance'),
  '유지기, 저울에서 내려오기 (초안)',
  '감량 이후 일상으로 돌아가는 루틴에 대한 초안.',
  '## (작성 중)\n\n유지기의 핵심은 ‘감량 모드의 종료’가 아니라 ‘새 기본값으로의 전환’...',
  3, 'in_review', '큐레이션 사무실', '익명 합성 narrative. PHI 미포함 확인 필요.'
);
