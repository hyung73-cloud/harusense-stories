// functions/stories/api/feed.js
// GET /stories/api/feed?market=ko&access=free
import { json, pickMarket, pickAccess } from "./_lib.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const market = pickMarket(url.searchParams.get("market"));
    const access = pickAccess(url.searchParams.get("access"));
    if (!market || !access) return json({ ok: false, error: "invalid_params" }, 400);

    const { results } = await env.STORIES_DB.prepare(
      `SELECT p.slug, p.market, p.access, p.title, p.excerpt, p.read_minutes,
              p.published_at, p.cover_emoji, p.accent, p.like_count,
              a.slug  AS archetype_slug, a.title AS archetype_title,
              c.name  AS clinic_name
         FROM stories_published p
         LEFT JOIN stories_archetypes a ON a.id = p.archetype_id
         LEFT JOIN stories_clinics    c ON c.id = p.clinic_id
        WHERE p.status = 'published' AND p.market = ? AND p.access = ?
        ORDER BY p.published_at DESC
        LIMIT 50`
    )
      .bind(market, access)
      .all();

    return json({ ok: true, market, access, count: results.length, stories: results });
  } catch (e) {
    return json({ ok: false, error: "server_error" }, 500);
  }
}
