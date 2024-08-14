import { deepMerge } from "@vivalence/shared";
import { join } from "$std/path/mod.ts";

export default async function getData({ scope }, ctx) {
  let { data: strategy, error: es } = await ctx.runtime.locals.supabase
    .from("Strategy")
    .select(`*`)
    .eq("id", scope.strategy.id)
    .single();

  let { data: tactic, error: et } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .select(`*`)
    .eq("id", scope.tactic.id)
    .single();
  if (es || et) throw es || et;

  tactic = deepMerge(tactic, strategy.session.find((step) => step.tactic.id === tactic.id).tactic);

  const relations = await buildRelations({ tactic, scope }, ctx);
  tactic.relations = relations;

  return { tactic, strategy };
}

async function buildRelations({ tactic, scope }, ctx) {
  function buildGameHandler(relationName, game) {
    return {
      ...game,
      call: (path, input) => {
        const mask = deepMerge(game.mask, tactic.masks[relationName]);
        scope = deepMerge(scope, { game: { id: game.id } }, input.scope);
        input = deepMerge({ scope, mask }, input);
        return ctx.runtime.call(join("/g", game.slug, path), input);
      },
    };
  }

  async function resolveResource(resourceType, relations) {
    const richRelations = await Object.entries(relations).reduce(
      async (acc, [relationName, relationDetail]) => {
        acc = await acc;
        const resource = await resolveRelation(resourceType, relationDetail, ctx);

        if (resourceType === "games") {
          acc[relationName] = buildGameHandler(relationName, resource);
        } else acc[relationName] = resource;

        return acc;
      },
      {}
    );

    return richRelations;
  }

  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(
        relation.map(async (slug) => await ctx.runtime.call(`/${resourceType}/fromSlug`, slug))
      );
    } else if (typeof relation === "object" && relation.slug) {
      return await ctx.runtime.call(`/${resourceType}/fromSlug`, relation);
    } else {
      throw new Error("Invalid relation");
    }
  }

  const relations = await Object.entries(tactic.relations).reduce(
    async (acc, [resourceType, relation]) => {
      acc = await acc;
      acc[resourceType] = await resolveResource(resourceType, relation, ctx);
      return acc;
    },
    { games: {}, units: {}, tags: {} }
  );
  return relations;
}
