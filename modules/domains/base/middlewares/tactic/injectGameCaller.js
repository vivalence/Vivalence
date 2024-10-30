import { join } from "$std/path/mod.ts";
import { deepMerge } from "@vivalence/shared";

export default async function injectGameCaller(body, ctx) {
  const { tactic, scope } = body;

  if (!tactic.relations && !body.tactic.relations.games) throw new Error("Invalid tactic");

  Object.entries(body.tactic.relations.games).forEach(([relationName, game]) => {
    body.tactic.relations.games[relationName].call = (path, input) => {
      return ctx.runtime.call(
        join("/g", game.slug, path),
        deepMerge(
          { mask: deepMerge(game.mask, tactic.masks[relationName]) },
          { scope: deepMerge(scope, { game: { id: game.id } }) },
          input,
        ),
      );
    };

    body.tactic.relations.games[relationName].provision = (input) => {
      return body.tactic.relations.games[relationName].call("/provision", input);
    };
  });

  return body;
}
