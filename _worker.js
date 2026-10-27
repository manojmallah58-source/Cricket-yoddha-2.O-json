export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";

      // Yahan apna domain likho
      const allowedDomain = "cricket-yoddha-2-o-json.pages.dev"; 

      // Agar request aapke domain se nahi hai, toh bilkul BLANK (khali) bhej do
      if (!referer.includes(allowedDomain)) {
        return new Response("", { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // Agar aapka khud ka domain hai, toh saare links aaram se dikhenge
    return fetch(request);
  }
};
