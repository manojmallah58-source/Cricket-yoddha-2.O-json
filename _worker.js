export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";
      const userAgent = request.headers.get("user-agent") || "";
      const secFetchSite = request.headers.get("sec-fetch-site") || "";
      const secFetchMode = request.headers.get("sec-fetch-mode") || "";

      // 1. Exact allowed hostnames
      const allowedHosts = new Set([
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev"
      ]);

      const getHost = (headerVal) => {
        if (!headerVal) return "";
        try {
          return new URL(headerVal).hostname.toLowerCase();
        } catch {
          return "";
        }
      };

      const refererHost = getHost(referer);
      const originHost = getHost(origin);

      // Direct address bar navigation (jab koi browser mein URL daal kar kholta hai)
      // mein aksar sec-fetch-mode "navigate" hota hai aur referer khali hota hai
      const isDirectNavigation = secFetchMode === "navigate" && !referer;

      // Exact hostname match check
      const isValidReferer = refererHost && allowedHosts.has(refererHost);
      const isValidOrigin = originHost && allowedHosts.has(originHost);

      // Same-origin / same-site fetch check (browsers bhejte hain)
      const isValidFetchSite =
        secFetchSite === "same-origin" || secFetchSite === "same-site";

      // Common scraping / CLI / automation tools block
      const isBlockedAgent =
        !userAgent ||
        /python|curl|wget|postman|insomnia|axios|node-fetch|undici|go-http-client|scrapy|headless|phantom|selenium|playwright|puppeteer/i.test(
          userAgent
        );

      const isAuthorized =
        !isDirectNavigation &&
        !isBlockedAgent &&
        (isValidReferer || isValidOrigin) &&
        (!secFetchSite || isValidFetchSite);

      if (!isAuthorized) {
        return new Response(
          JSON.stringify({
            status: 403,
            error: "Forbidden",
            message: "Access Denied."
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
      }

      // Original asset fetch karke extra security headers lagana
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      headers.set("Content-Type", "application/json; charset=utf-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      headers.set("X-Content-Type-Options", "nosniff");

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
