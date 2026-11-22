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

    const block403 = (reason) =>
      new Response(
        JSON.stringify({
          blocked: true,
          status: 403,
          error: reason
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "X-Content-Type-Options": "nosniff"
          }
        }
      );

    // 1. Koi bhi .json khole, copy kare, ya code mein daale -> turant block
    if (url.pathname.endsWith(".json")) {
      return block403("JSON is blocked.");
    }

    // 2. Allowed domains ke alawa har request block
    const refererHost = getHost(request.headers.get("referer") || "");
    const originHost = getHost(request.headers.get("origin") || "");
    const secFetchSite = request.headers.get("sec-fetch-site") || "";

    const isAllowed =
      (refererHost && ALLOWED_HOSTS.has(refererHost)) ||
      (originHost && ALLOWED_HOSTS.has(originHost));

    if (!isAllowed || secFetchSite === "cross-site") {
      return block403("Domain is blocked.");
    }

    return env.ASSETS.fetch(request);
  }
};
