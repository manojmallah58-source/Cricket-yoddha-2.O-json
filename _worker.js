export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      const referer = request.headers.get("referer") || "";

      // In domains ko permission di gayi hai. 
      // cricket-tv.pages.dev ke aage chahe jo bhi naam ho (jaise /talkwithshivam), sab chalega!
      const allowedDomains = [
        "cricket-yoddha-2-0.pages.dev",  // Aapki main website
        "cricket-tv.pages.dev"           // Dosto ka domain (aage ke sabhi naam isme cover ho jayenge)
      ]; 

      // Check karega ki request inme se kisi bhi authorized jagah se aa rahi hai ya nahi
      const isAllowed = allowedDomains.some(domain => referer.includes(domain));

      // Agar list me se koi match nahi hua, toh ekdum BLANK (khali) response bhej do
      if (!isAllowed) {
        return new Response("", { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // Agar allowed hai, toh links aaram se load ho jayenge
    return fetch(request);
  }
};
