export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";
      const userAgent = request.headers.get("user-agent") || "";

      // 1. Allowed domains ki list (apne main domains yahan rakhein)
      const allowedDomains = [
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev"
      ]; 

      // Check karega ki request allowed domains se hai ya nahi
      const isAllowedDomain = allowedDomains.some(domain => 
        referer.includes(domain) || origin.includes(domain)
      );

      // 2. Automated bots aur scraping tools ko block karne ke liye (Jaise python scripts)
      const isBadBot = /python|curl|postman|axios|node-fetch|scraping/i.test(userAgent);

      // Agar domain match nahi hua YA koi bot access kar raha hai, toh block kar do
      if (!isAllowedDomain || isBadBot) {
        return new Response(JSON.stringify({ 
          status: 403,
          error: "Forbidden",
          message: "Access Denied! Unauthorized request." 
        }), { 
          status: 403, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
