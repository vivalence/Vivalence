import { join } from "$std/path/mod.ts";
import { deepMerge } from "@vivalence/shared";

async function injectGameHandler(ctx, next) {
  const body = await ctx.request.body.json();
  let { tactic, scope } = body;
  Object.entries(body.tactic.relations.games).forEach(([relationName, game]) => {
    body.tactic.relations.games[relationName] = {
      ...game,
      call: (path, input) => {
        const mask = deepMerge(game.mask, tactic.masks[relationName]);
        scope = deepMerge(scope, { game: { id: game.id } }, input.scope);
        input = deepMerge({ scope, mask }, input);
        return ctx.runtime.call(join("/g", game.slug, path), input);
      },
    };
  });
  ctx.request.body.json = async () => body;
  await next();
}

async function flattenRuntimeGames(ctx, next) {
  const body = await ctx.request.body.json();
  const games = {};
  for (const [key, game] of ctx.runtime.games.entries()) {
    game.call = body.tactic.relations.games[key].call;
    games[key] = game;
  }
  ctx.runtime.games = games;
  ctx.request.body.json = async () => body;
  await next();
}

export default [injectGameHandler, flattenRuntimeGames];
