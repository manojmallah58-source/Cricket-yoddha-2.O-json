export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";
      const userAgent = request.headers.get("user-agent") || "";
      const secFetchSite = request.headers.get("sec-fetch-site") || "";
      const secFetchMode = request.headers.get("sec-fetch-mode") || "";
      const secFetchDest = request.headers.get("sec-fetch-dest") || "";

      // 1. Sirf aapke exact allowed domains
      const allowedHosts = new Set([
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev"
      ]);

      const extractHostname = (value) => {
        if (!value) return "";
        try {
          return new URL(value).hostname.toLowerCase();
        } catch {
          return "";
        }
      };

      const refererHost = extractHostname(referer);
      const originHost = extractHostname(origin);

      // Direct address bar mein open karne par aksar navigate + empty referer hota hai
      const isDirectOpen = secFetchMode === "navigate" && !referer;

      // Exact domain match (substrings like evil.com?cricket-tv.pages.dev ko rokega)
      const isAllowedHost =
        (refererHost && allowedHosts.has(refererHost)) ||
        (originHost && allowedHosts.has(originHost));

      // Browser fetch mode check (direct document/script/iframe open block)
      const isValidMode =
        secFetchMode === "cors" || secFetchMode === "same-origin";

      const isValidSite =
        !secFetchSite ||
        secFetchSite === "same-origin" ||
        secFetchSite === "same-site";

      const isValidDest =
        !secFetchDest ||
        secFetchDest === "empty" ||
        secFetchDest === "fetch";

      // Automated tools / scrapers / headless browsers block
      const isBotOrScraper =
        !userAgent ||
        /python|curl|wget|postman|insomnia|axios|node-fetch|undici|go-http-client|scrapy|headless|phantom|selenium|playwright|puppeteer|httrack|mechanize/i.test(
          userAgent
        );

      // Agar koi bhi check fail ho toh empty/blocked response
      if (
        isDirectOpen ||
        isBotOrScraper ||
        !isAllowedHost ||
        !isValidMode ||
        !isValidSite ||
        !isValidDest
      ) {
        return new Response(
          JSON.stringify({
            status: 403,
            error: "Forbidden",
            channels: []
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
              "X-Content-Type-Options": "nosniff",
              "Cross-Origin-Resource-Policy": "same-site"
            }
          }
        );
      }

      // Allowed request ke liye asset fetch aur strict headers
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      headers.set("Content-Type", "application/json; charset=utf-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Cross-Origin-Resource-Policy", "same-site");

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
