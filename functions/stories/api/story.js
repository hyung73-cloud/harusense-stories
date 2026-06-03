// functions/stories/api/story.js
// GET /stories/api/story?slug=first-month-nausea[&locale=ja]
import { json, safeSlug } from "./_lib.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const slug = safeSlug(url.searchParams.get("slug"));
    const locale = (url.searchParams.get("locale") || "").toLowerCase();
    if (!slug) return json({ ok: false, error: "missing_slug" }, 400);

    const row = await env.STORIES_DB.prepare(
      `SELECT p.id, p.slug, p.market, p.access, p.title, p.excerpt, p.body_markdown,
              p.read_minutes, p.published_at, p.cover_emoji, p.accent, p.like_count,
              a.slug  AS archetype_slug, a.title AS archetype_title,
              c.name  AS clinic_name
         FROM stories_published p
         LEFT JOIN stories_archetypes a ON a.id = p.archetype_id
         LEFT JOIN stories_clinics    c ON c.id = p.clinic_id
        WHERE p.slug = ? AND p.status = 'published'`
    )
      .bind(slug)
      .first();

    if (!row) return json({ ok: false, error: "not_found" }, 404);

    // locale 요청 시 i18n 본문으로 덮어쓰기 (없으면 원문 유지)
    if (locale && /^[a-z]{2}$/.test(locale)) {
      const tr = await env.STORIES_DB.prepare(
        `SELECT title, excerpt, body_markdown
           FROM stories_published_i18n WHERE story_id = ? AND locale = ?`
      )
        .bind(row.id, locale)
        .first();
      if (tr) {
        row.title = tr.title;
        row.excerpt = tr.excerpt;
        row.body_markdown = tr.body_markdown;
        row.locale = locale;
      }
    }

    delete row.id; // 내부 id 비노출
    return json({ ok: true, story: row });
  } catch (e) {
    return json({ ok: false, error: "server_error" }, 500);
  }
}
