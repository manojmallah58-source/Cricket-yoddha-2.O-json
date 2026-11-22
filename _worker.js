export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const ALLOWED = new Set([
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev",
        "cricket-yoddha-2-o-json.pages.dev"
      ]);

      const getHost = (h) => {
        if (!h) return "";
        try {
          return new URL(h).hostname.toLowerCase();
        } catch {
          return "";
        }
      };

      const refHost = getHost(request.headers.get("referer") || "");
      const origHost = getHost(request.headers.get("origin") || "");
      const mode = request.headers.get("sec-fetch-mode") || "";
      const site = request.headers.get("sec-fetch-site") || "";

      // Direct browser open (address bar) ya allowed domain ke bahar -> turant 403 error
      const isDirectOpen = mode === "navigate" && !refHost;
      const isAllowedDomain =
        (refHost && ALLOWED.has(refHost)) || (origHost && ALLOWED.has(origHost));
      const isValidBrowserFetch =
        (mode === "cors" || mode === "same-origin") &&
        (!site || site === "same-origin" || site === "same-site");

      if (isDirectOpen || !isAllowedDomain || !isValidBrowserFetch) {
        return new Response(
          JSON.stringify({
            error: true,
            status: 403,
            message: "Error: Access denied."
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
      headers.set("Content-Type", "application/json; charset=utf-8");
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
