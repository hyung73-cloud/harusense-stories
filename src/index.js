/**
 * Workers + Assets 배포용 엔트리.
 * Cloudflare Pages Functions(functions/stories/api/*)와 동일 핸들러를 재사용한다.
 */
import { onRequest as apiMiddleware } from "../functions/stories/api/_middleware.js";
import { onRequestGet as feedGet } from "../functions/stories/api/feed.js";
import { onRequestGet as storyGet } from "../functions/stories/api/story.js";
import { onRequestPost as eventPost } from "../functions/stories/api/event.js";
import { onRequestPost as likePost } from "../functions/stories/api/like.js";
import { json } from "../functions/stories/api/_lib.js";

async function dispatchApi(request, env) {
  const path = new URL(request.url).pathname;

  if (path === "/stories/api/feed" && request.method === "GET") {
    return feedGet({ request, env });
  }
  if (path === "/stories/api/story" && request.method === "GET") {
    return storyGet({ request, env });
  }
  if (path === "/stories/api/event" && request.method === "POST") {
    return eventPost({ request, env });
  }
  if (path === "/stories/api/like" && request.method === "POST") {
    return likePost({ request, env });
  }

  return json({ ok: false, error: "not_found" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/stories/api/")) {
      return apiMiddleware({
        request,
        env,
        next: () => dispatchApi(request, env),
      });
    }

    return env.STATIC.fetch(request);
  },
};
