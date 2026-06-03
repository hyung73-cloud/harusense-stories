// functions/stories/api/like.js
// POST /stories/api/like  body: { slug, visitor_key }
// 같은 visitor_key 가 다시 호출하면 토글(좋아요 해제).
import { json, safeSlug, safeKey } from "./_lib.js";

export async function onRequestPost({ request, env }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "bad_json" }, 400);
    }

    const slug = safeSlug(body.slug);
    const visitorKey = safeKey(body.visitor_key);
    if (!slug || !visitorKey) return json({ ok: false, error: "missing_params" }, 400);

    const story = await env.STORIES_DB.prepare(
      `SELECT id FROM stories_published WHERE slug = ? AND status = 'published'`
    )
      .bind(slug)
      .first();
    if (!story) return json({ ok: false, error: "not_found" }, 404);

    const existing = await env.STORIES_DB.prepare(
      `SELECT id FROM stories_likes WHERE story_id = ? AND visitor_key = ?`
    )
      .bind(story.id, visitorKey)
      .first();

    let liked;
    if (existing) {
      await env.STORIES_DB.prepare(`DELETE FROM stories_likes WHERE id = ?`)
        .bind(existing.id)
        .run();
      liked = false;
    } else {
      await env.STORIES_DB.prepare(
        `INSERT OR IGNORE INTO stories_likes (story_id, visitor_key) VALUES (?, ?)`
      )
        .bind(story.id, visitorKey)
        .run();
      liked = true;
      // 새 좋아요만 이벤트로 기록 (해제는 이벤트 미기록)
      await env.STORIES_DB.prepare(
        `INSERT INTO stories_events (type, story_id, story_slug, visitor_key)
         VALUES ('like', ?, ?, ?)`
      )
        .bind(story.id, slug, visitorKey)
        .run();
    }

    const cnt = await env.STORIES_DB.prepare(
      `SELECT COUNT(*) AS n FROM stories_likes WHERE story_id = ?`
    )
      .bind(story.id)
      .first();

    await env.STORIES_DB.prepare(`UPDATE stories_published SET like_count = ? WHERE id = ?`)
      .bind(cnt.n, story.id)
      .run();

    return json({ ok: true, liked, like_count: cnt.n });
  } catch (e) {
    return json({ ok: false, error: "server_error" }, 500);
  }
}
