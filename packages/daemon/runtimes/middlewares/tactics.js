import { join } from "$std/path/mod.ts";
import { deepMerge } from "@vivalence/shared";

async function gameHandler(ctx, next) {
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

  ctx.request.body = { json: async () => body };
  await next();
}
export default function apply(tactics) {
  return tactics.map((tactic) => {
    tactic.middlewares.push(gameHandler);
    return tactic;
  });
}
