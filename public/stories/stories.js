/* =========================================================================
   harusense Stories Gallery — stories.js  (바닐라 JS, care 자산 미사용)
   ========================================================================= */
(function () {
  "use strict";

  const API = "/stories/api";

  /* ── 익명 visitor_key (PHI 아님, 로컬 난수) ───────────────── */
  function visitorKey() {
    try {
      let k = localStorage.getItem("hs_vk");
      if (!k) {
        k = "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("hs_vk", k);
      }
      return k;
    } catch (_) {
      return "anon";
    }
  }

  /* ── 이벤트 전송 (best-effort, 실패 무시) ─────────────────── */
  function sendEvent(type, slug, market) {
    const payload = JSON.stringify({ type, slug: slug || null, visitor_key: visitorKey(), market: market || null });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API + "/event", new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch (_) {}
    fetch(API + "/event", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
  }

  /* ── 토스트 ───────────────────────────────────────────────── */
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  /* ── HTML escape ──────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ── 안전한 미니 markdown → HTML ──────────────────────────── */
  // 지원: ## h2, ### h3, **bold**, *italic*, > quote, - 리스트, [text](url), 문단
  function renderMarkdown(md) {
    const lines = String(md == null ? "" : md).split(/\r?\n/);
    let html = "";
    let inList = false;
    function closeList() { if (inList) { html += "</ul>"; inList = false; } }

    function inline(raw) {
      let t = esc(raw);
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      // 링크: 텍스트와 https URL 만 허용
      t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_m, txt, url) {
        return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + txt + "</a>";
      });
      return t;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed === "") { closeList(); continue; }
      if (/^###\s+/.test(trimmed)) { closeList(); html += "<h3>" + inline(trimmed.replace(/^###\s+/, "")) + "</h3>"; continue; }
      if (/^##\s+/.test(trimmed)) { closeList(); html += "<h2>" + inline(trimmed.replace(/^##\s+/, "")) + "</h2>"; continue; }
      if (/^#\s+/.test(trimmed)) { closeList(); html += "<h2>" + inline(trimmed.replace(/^#\s+/, "")) + "</h2>"; continue; }
      if (/^>\s?/.test(trimmed)) { closeList(); html += "<blockquote>" + inline(trimmed.replace(/^>\s?/, "")) + "</blockquote>"; continue; }
      if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + inline(trimmed.replace(/^[-*]\s+/, "")) + "</li>";
        continue;
      }
      closeList();
      html += "<p>" + inline(trimmed) + "</p>";
    }
    closeList();
    return html;
  }

  /* ── 날짜 포맷 ────────────────────────────────────────────── */
  function fmtDate(s) {
    if (!s) return "";
    const d = new Date(s.replace(" ", "T") + "Z");
    if (isNaN(d)) return "";
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  }

  /* ── 좋아요 토글 ──────────────────────────────────────────── */
  async function toggleLike(slug) {
    try {
      const r = await fetch(API + "/like", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slug, visitor_key: visitorKey() }),
      });
      return await r.json();
    } catch (_) {
      return { ok: false };
    }
  }

  /* ── 공유(클립보드) ───────────────────────────────────────── */
  async function copyShare(slug) {
    const url = location.origin + "/stories/story?slug=" + encodeURIComponent(slug);
    try {
      if (navigator.share) {
        await navigator.share({ url: url, title: document.title });
      } else {
        await navigator.clipboard.writeText(url);
        toast("링크를 복사했어요");
      }
    } catch (_) {
      try { await navigator.clipboard.writeText(url); toast("링크를 복사했어요"); } catch (e) { toast("복사에 실패했어요"); }
    }
    sendEvent("share_copy", slug);
  }

  /* ── 로컬 좋아요/저장 상태 ───────────────────────────────── */
  function localSet(key, slug, on) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      const set = new Set(raw);
      on ? set.add(slug) : set.delete(slug);
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch (_) {}
  }
  function localHas(key, slug) {
    try { return JSON.parse(localStorage.getItem(key) || "[]").indexOf(slug) >= 0; }
    catch (_) { return false; }
  }

  window.HS = {
    API, visitorKey, sendEvent, toast, renderMarkdown, fmtDate, esc,
    toggleLike, copyShare, localSet, localHas,
  };
})();
