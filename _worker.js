export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/links.json") {
      return new Response(
        JSON.stringify({
          error: true,
          status: 403,
          message: "Blocked"
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

    return env.ASSETS.fetch(request);
  }
};
