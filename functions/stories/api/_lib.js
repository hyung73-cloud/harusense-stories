// functions/stories/api/_lib.js
// 언더스코어(_) 시작 파일은 Pages Functions 라우트로 노출되지 않음 → 공용 모듈.

const SECURITY_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: SECURITY_HEADERS });
}

export const MARKETS = ["ko", "ja", "intl"];
export const ACCESS = ["free", "paid"];
export const EVENT_TYPES = [
  "feed_view",
  "story_view",
  "like",
  "share_copy",
  "save",
  "dwell_30s",
];

export function pickMarket(v) {
  v = String(v || "ko").toLowerCase();
  return MARKETS.includes(v) ? v : null;
}
export function pickAccess(v) {
  v = String(v || "free").toLowerCase();
  return ACCESS.includes(v) ? v : null;
}

// visitor_key: 클라이언트 난수. PHI 아님. 길이만 안전하게 자른다.
export function safeKey(v) {
  if (typeof v !== "string") return null;
  return v.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || null;
}

export function safeSlug(v) {
  if (typeof v !== "string") return null;
  return v.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128) || null;
}
