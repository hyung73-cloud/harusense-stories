// functions/stories/api/_middleware.js
// /stories/api/* 전체에 적용. GET(피드/상세)은 통과, POST(event/like)만 rate limit.
import { json } from "./_lib.js";

const LIMIT_PER_MIN = 60; // IP당 분당 쓰기 허용량

export async function onRequest(context) {
  const { request, env, next } = context;

  if (request.method !== "POST") return next();

  try {
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "0.0.0.0";
    const now = Date.now();
    const windowStart = Math.floor(now / 60000); // 1분 윈도우
    const bucket = `${ip}:${windowStart}`;

    await env.STORIES_DB.prepare(
      `INSERT INTO stories_rate (bucket, n, window_start) VALUES (?, 1, ?)
       ON CONFLICT(bucket) DO UPDATE SET n = n + 1`
    )
      .bind(bucket, windowStart)
      .run();

    const row = await env.STORIES_DB.prepare(
      `SELECT n FROM stories_rate WHERE bucket = ?`
    )
      .bind(bucket)
      .first();

    // 지난 윈도우 정리 (best-effort)
    await env.STORIES_DB.prepare(`DELETE FROM stories_rate WHERE window_start < ?`)
      .bind(windowStart - 1)
      .run();

    if (row && row.n > LIMIT_PER_MIN) {
      return json({ ok: false, error: "rate_limited" }, 429);
    }
  } catch (e) {
    // rate limit 인프라 실패가 정상 요청을 막지 않도록 통과
  }

  return next();
}
