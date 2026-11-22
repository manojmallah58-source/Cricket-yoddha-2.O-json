export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const ALLOWED_HOSTS = new Set([
      "cricket-yoddha-2-0.pages.dev",
      "cricket-tv.pages.dev",
      "cricket-yoddha-2-o-json.pages.dev"
    ]);

    const getHost = (val) => {
      if (!val) return "";
      try {
        return new URL(val).hostname.toLowerCase();
      } catch {
        return "";
      }
    };

    const deny = (msg) =>
      new Response(JSON.stringify({ error: true, status: 403, message: msg }), {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          "X-Content-Type-Options": "nosniff"
        }
      });

    // 1. Koi bhi JSON file khole ya call kare -> hamesha error
    if (url.pathname.endsWith(".json")) {
      return deny("Error: JSON access blocked.");
    }

    // 2. Har request ke liye strict domain check
    const refererHost = getHost(request.headers.get("referer") || "");
    const originHost = getHost(request.headers.get("origin") || "");
    const secFetchSite = request.headers.get("sec-fetch-site") || "";

    const isAllowed =
      (refererHost && ALLOWED_HOSTS.has(refererHost)) ||
      (originHost && ALLOWED_HOSTS.has(originHost));

    // Direct browser open (empty referer + no origin) ya cross-site block
    if (!isAllowed || secFetchSite === "cross-site") {
      return deny("Error: Unauthorized domain.");
    }

    return env.ASSETS.fetch(request);
  }
};
