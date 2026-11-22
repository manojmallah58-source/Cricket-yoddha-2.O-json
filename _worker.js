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

    const blockError = (msg = "Error: Access denied.") =>
      new Response(
        JSON.stringify({
          error: true,
          status: 403,
          message: msg
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

    // 1. JSON hamesha error dega - koi bhi open kare
    if (url.pathname === "/links.json" || url.pathname.endsWith(".json")) {
      return blockError("Error: JSON access is blocked.");
    }

    // 2. Stream / channel / proxy routes par doosri site ka access block
    const isStreamRoute =
      url.pathname.startsWith("/hls") ||
      url.pathname.startsWith("/proxy") ||
      url.pathname.startsWith("/stream") ||
      url.pathname.startsWith("/K");

    if (isStreamRoute) {
      const refererHost = getHost(request.headers.get("referer") || "");
      const originHost = getHost(request.headers.get("origin") || "");
      const secFetchSite = request.headers.get("sec-fetch-site") || "";
      const userAgent = request.headers.get("user-agent") || "";

      const isAllowedSite =
        (refererHost && ALLOWED_HOSTS.has(refererHost)) ||
        (originHost && ALLOWED_HOSTS.has(originHost));

      const isCrossSite =
        secFetchSite === "cross-site" || secFetchSite === "none";

      const isBot =
        !userAgent ||
        /python|curl|wget|postman|insomnia|axios|node-fetch|undici|go-http-client|scrapy|headless|phantom|selenium|playwright|puppeteer/i.test(
          userAgent
        );

      if (!isAllowedSite || isCrossSite || isBot) {
        return blockError("Error: Stream blocked for unauthorized domain.");
      }
    }

    return env.ASSETS.fetch(request);
  }
};
