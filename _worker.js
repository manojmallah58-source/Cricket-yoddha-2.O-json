export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Sirf aapke apne domains ki strict list
    const ALLOWED_HOSTS = new Set([
      "cricket-yoddha-2-0.pages.dev",
      "cricket-tv.pages.dev"
    ]);

    // Naya endpoint (purana /links.json copy karne walo ko rokne ke liye)
    const PROTECTED_PATH = "/secure-feed-92x.json";
    const ENCODE_KEY = "CY_LOCK_2026_SECURE";

    const getHost = (val) => {
      if (!val) return "";
      try {
        return new URL(val).hostname.toLowerCase();
      } catch {
        return "";
      }
    };

    const denyResponse = () =>
      new Response(
        JSON.stringify({
          ok: false,
          error: "Access Denied",
          channels: []
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "X-Content-Type-Options": "nosniff",
            "Cross-Origin-Resource-Policy": "same-origin"
          }
        }
      );

    // 1. Purana /links.json hamesha block
    if (url.pathname === "/links.json") {
      return denyResponse();
    }

    // 2. Protected JSON endpoint
    if (url.pathname === PROTECTED_PATH) {
      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";
      const userAgent = request.headers.get("user-agent") || "";
      const secFetchSite = request.headers.get("sec-fetch-site") || "";
      const secFetchMode = request.headers.get("sec-fetch-mode") || "";

      const refererHost = getHost(referer);
      const originHost = getHost(origin);

      // Direct browser open (address bar / new tab) block
      const isDirectOpen = secFetchMode === "navigate" && !referer;

      // Request ka host aapke allowed domains mein hona chahiye
      const isAllowedOrigin = originHost ? ALLOWED_HOSTS.has(originHost) : false;
      const isAllowedReferer = refererHost ? ALLOWED_HOSTS.has(refererHost) : false;

      // Browser se aayi fetch request honi chahiye
      const isValidFetch =
        (secFetchMode === "cors" || secFetchMode === "same-origin") &&
        (!secFetchSite || secFetchSite === "same-origin" || secFetchSite === "same-site");

      // Scrapers / scripts / bots block
      const isBot =
        !userAgent ||
        /python|curl|wget|postman|insomnia|axios|node-fetch|undici|go-http-client|scrapy|headless|phantom|selenium|playwright|puppeteer|httrack/i.test(
          userAgent
        );

      // Agar request kisi doosre domain se aayi ho (bhale hi usne aapka code copy kiya ho),
      // toh browser origin/referer mein uska apna domain bhejega jo ALLOWED_HOSTS mein nahi hoga -> BLOCK
      const hasValidDomain = isAllowedOrigin || isAllowedReferer;

      if (isDirectOpen || isBot || !isValidFetch || !hasValidDomain) {
        return denyResponse();
      }

      // Asset se original JSON uthana
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/links.json";
      const assetRes = await env.ASSETS.fetch(
        new Request(assetUrl.toString(), { method: "GET" })
      );

      if (!assetRes.ok) {
        return denyResponse();
      }

      const rawText = await assetRes.text();

      // XOR + Base64 encode taaki plain links seedha text mein na dikhein
      const textBytes = new TextEncoder().encode(rawText);
      const keyBytes = new TextEncoder().encode(ENCODE_KEY);
      const mixed = new Uint8Array(textBytes.length);

      for (let i = 0; i < textBytes.length; i++) {
        mixed[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      let binary = "";
      for (let i = 0; i < mixed.length; i++) {
        binary += String.fromCharCode(mixed[i]);
      }

      return new Response(
        JSON.stringify({
          ok: true,
          data: btoa(binary)
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "X-Content-Type-Options": "nosniff",
            "Cross-Origin-Resource-Policy": "same-origin"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};

/* =====================================================================
   FRONTEND MEIN USE KARNE KE LIYE (APNE HTML/JS MEIN LAGAYEIN):

   async function fetchProtectedChannels() {
     const ALLOWED = ["cricket-yoddha-2-0.pages.dev", "cricket-tv.pages.dev"];
     if (!ALLOWED.includes(window.location.hostname.toLowerCase())) {
       return [];
     }

     const res = await fetch("/secure-feed-92x.json", { cache: "no-store" });
     if (!res.ok) return [];

     const json = await res.json();
     if (!json.ok || !json.data) return [];

     const bin = atob(json.data);
     const bytes = new Uint8Array(bin.length);
     const keyBytes = new TextEncoder().encode("CY_LOCK_2026_SECURE");

     for (let i = 0; i < bin.length; i++) {
       bytes[i] = bin.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
     }

     return JSON.parse(new TextDecoder().decode(bytes));
   }
===================================================================== */
