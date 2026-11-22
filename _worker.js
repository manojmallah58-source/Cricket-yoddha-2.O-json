export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      // Yahan apne base domains rakhein (in par aur inke kisi bhi subdomain par chalega)
      const allowedBaseDomains = [
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev",
        "https://cricket-yoddha-2-o-json.pages.dev/links.json"
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
      const secFetchSite = request.headers.get("sec-fetch-site") || "";

      const matchesAllowed = (host) => {
        if (!host) return false;
        return allowedBaseDomains.some(
          (base) => host === base || host.endsWith("." + base)
        );
      };

      const isAllowedHost = matchesAllowed(refHost) || matchesAllowed(origHost);

      if (!isAllowedHost || secFetchSite === "cross-site") {
        return new Response(
          JSON.stringify({
            error: true,
            status: 403,
            message: "Blocked: Sirf allowed domain par hi chalega."
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
