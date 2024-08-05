import { join } from "$std/path/mod.ts";

export async function getTactic(tacticId, ctx) {
  const { data: tactic, error } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .select(
      `*, _GameToTactic (Game: A (*)), _TacticToUnit (Unit: B (*)), _TacticToTag (Tag: B (*))`
    )
    .eq("id", tacticId)
    .single();

  if (error) throw error;

  tactic.units = tactic._TacticToUnit.map(({ Unit }) => Unit);
  delete tactic._TacticToUnit;
  tactic.tags = tactic._TacticToTag.map(({ Tag }) => Tag);
  delete tactic._TacticToTag;
  tactic.games = tactic._GameToTactic.map(({ Game }) => Game);
  delete tactic._GameToTactic;

  return tactic;
}

export function buildRelations(tactic, ctx) {
  function buildGameHandler(relationKey, game) {
    return {
      ...game,
      call: (path, input) => {
        const mask = { ...(game.mask || {}), ...(tactic.masks[relationKey] || {}) };
        input = { gameId: game.id, mask, ...input };
        return ctx.runtime.call(join("/g", game.slug, path), input);
      },
    };
  }

  return tactic.relations.reduce(
    (relations, relation) => {
      const key = relation.key.trim();
      relations[relation.with][key] =
        relation.type === "array"
          ? relation.value
              .map((id) => tactic[relation.with].find((obj) => obj.id === id))
              .filter(Boolean)
          : tactic[relation.with].find((obj) => obj.id === relation.value);

      if (relation.with === "games") {
        relations.games[key] = buildGameHandler(key, relations.games[key]);
      }
      return relations;
    },
    { games: {}, units: {}, tags: {} }
  );
}
