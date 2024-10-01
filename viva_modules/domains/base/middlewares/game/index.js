export default (game) => {
  game.router.middleware.push(async (ctx, next) => {
    const perf = performance.now();
    await next();
    const time = performance.now() - perf;
    console.log(`[GAME] method - ${time}ms`);
  });

  game.router.middleware.push(async (ctx, next) => {
    const url = new URL(ctx.request.url).pathname.split("/");
    const slug = url[url.indexOf("g") + 1];
    ctx.state.game = ctx.runtime.games.get(slug).manifest;
    await next();
  });

  game.router.middleware.post((body, ctx) => {
    if (body && typeof body !== "string") {
      if (body.instruction) {
        body.type = "GAME";
        body.game = {
          id: ctx.state.game.id,
          slug: ctx.state.game.slug,
          url: ctx.state.game.url,
          bundle: ctx.state.game.bundle,
        };
      }
    }
    return body;
  });
};
