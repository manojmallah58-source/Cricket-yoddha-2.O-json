export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const allowedDomains = [
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev",
        "cricket-yoddha-2-o-json.pages.dev"
      ];

      const getHost = (val) => {
        if (!val) return "";
        try {
          return new URL(val).hostname.toLowerCase();
        } catch {
          return "";
        }
      };

      const refHost = getHost(request.headers.get("referer") || "");
      const origHost = getHost(request.headers.get("origin") || "");
      const fetchMode = request.headers.get("sec-fetch-mode") || "";

      const isAllowed = (host) => {
        if (!host) return false;
        return allowedDomains.some(
          (d) => host === d || host.endsWith("." + d)
        );
      };

      const domainOk = isAllowed(refHost) || isAllowed(origHost);
      const isDirectOpen = fetchMode === "navigate" && !refHost;

      if (!domainOk || isDirectOpen) {
        return new Response(
          JSON.stringify({
            error: true,
            status: 403,
            message: "Blocked: Sirf allowed domains ke liye."
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

      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      const activeOrigin =
        request.headers.get("origin") || (refHost ? `https://${refHost}` : "");

      if (activeOrigin && isAllowed(getHost(activeOrigin))) {
        headers.set("Access-Control-Allow-Origin", activeOrigin);
        headers.set("Vary", "Origin");
      }
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      headers.set("X-Content-Type-Options", "nosniff");

      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
