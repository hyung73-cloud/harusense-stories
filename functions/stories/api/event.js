// functions/stories/api/event.js
// POST /stories/api/event  body: { type, slug?, visitor_key?, market? }
// 자유형 meta 는 받지 않는다 → PHI 유입 경로 원천 차단.
import { json, EVENT_TYPES, safeSlug, safeKey, pickMarket } from "./_lib.js";

export async function onRequestPost({ request, env }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "bad_json" }, 400);
    }

    const type = String(body.type || "");
    if (!EVENT_TYPES.includes(type)) return json({ ok: false, error: "invalid_type" }, 400);

    const slug = safeSlug(body.slug);
    const visitorKey = safeKey(body.visitor_key);
    const market = pickMarket(body.market) || null;

    let storyId = null;
    if (slug) {
      const r = await env.STORIES_DB.prepare(
        `SELECT id FROM stories_published WHERE slug = ?`
      )
        .bind(slug)
        .first();
      storyId = r ? r.id : null;
    }

    await env.STORIES_DB.prepare(
      `INSERT INTO stories_events (type, story_id, story_slug, visitor_key, market)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(type, storyId, slug, visitorKey, market)
      .run();

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "server_error" }, 500);
  }
}
