import patchGameToInstruction from "./patchGameToInstruction.js";
import loadGameData from "./loadGameData.js";

export default (game) => {
  game.router.middleware.push(async (ctx, next) => {
    const perf = performance.now();
    await next();
    const time = performance.now() - perf;
    // console.log(`[GAME] method - ${time}ms`);
  });

  game.router.middleware.push(async (ctx, next) => {
    const url = ctx.request.url.pathname.split("/");
    const slug = url[url.indexOf("game") + 1];
    // console.log(Object.keys(ctx.runtime), Object.keys(ctx.runtime.modules));
    ctx.state.game = ctx.runtime.modules.games.find((game) => game.entity.slug === slug).entity;
    // todo throw 404 if no
    if (!ctx.state.game) throw new Error("404 game no skibidi");
    await next();
  });

  game.router.middleware.pre(loadGameData);
  game.router.middleware.post(patchGameToInstruction);
};
