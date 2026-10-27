export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      // Yahan apni pasand ki koi bhi secret key / password rakh lo
      const secretKey = "cricket2026"; 

      // Check karega ki link ke sath ?key=cricket2026 jud kar aaya hai ya nahi
      const userKey = url.searchParams.get("key");

      // Agar key match nahi hoti, toh bilkul BLANK (khali) bhej do
      if (userKey !== secretKey) {
        return new Response("", { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // Agar sahi key ke sath request aayi hai, toh links chal jayenge
    return fetch(request);
  }
};
