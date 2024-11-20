import patchGameToInstruction from "./patchGameToInstruction.js";
import loadGameData from "./loadGameData.js";

export default (game) => {
  game.router.middleware.push(async (ctx, next) => {
    const perf = performance.now();
    await next();
    const time = performance.now() - perf;
    console.log(`[GAME] method - ${time}ms`);
  });

  game.router.middleware.push(async (ctx, next) => {
    const url = ctx.request.url.pathname.split("/");
    const slug = url[url.indexOf("g") + 1];
    ctx.state.game = ctx.runtime.games.find((game) => game.manifest.slug === slug).manifest;
    await next();
  });

  game.router.middleware.pre(loadGameData);
  game.router.middleware.post(patchGameToInstruction);
};
