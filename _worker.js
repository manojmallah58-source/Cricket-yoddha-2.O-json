export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const allowedDomains = [
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev"
      ];

      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";
      const userAgent = request.headers.get("user-agent") || "";

      const getHost = (val) => {
        if (!val) return "";
        try {
          return new URL(val).hostname.toLowerCase();
        } catch {
          return "";
        }
      };

      const refHost = getHost(referer);
      const origHost = getHost(origin);

      const isAllowed =
        (refHost && allowedDomains.includes(refHost)) ||
        (origHost && allowedDomains.includes(origHost));

      const isBot =
        !userAgent ||
        /python|curl|wget|postman|axios|node-fetch|scraping/i.test(userAgent);

      if (!isAllowed || isBot) {
        return new Response(
          JSON.stringify({
            status: 403,
            error: "Forbidden",
            message: "Access Denied! Sirf allowed domains ke liye."
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
    }

    return env.ASSETS.fetch(request);
  }
};
