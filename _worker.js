export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";
      const origin = request.headers.get("origin") || "";

      // Yeh dono domains allowed hain (cricket-tv ke aage chahe jo bhi naam ho, sab chalega)
      const allowedDomains = [
        "cricket-yoddha-2-0.pages.dev",
        "cricket-tv.pages.dev"
      ]; 

      // Check karega ki request in domains se aa rahi hai ya nahi
      const isAllowed = allowedDomains.some(domain => 
        referer.includes(domain) || origin.includes(domain)
      );

      // Agar list mein se koi match nahi hua, toh ekdum BLANK (khali) bhej do
      if (!isAllowed) {
        return new Response("", { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // Cloudflare Pages ke liye yeh sahi tareeka hai links aur files ko load karne ka
    return env.ASSETS.fetch(request);
  }
};
