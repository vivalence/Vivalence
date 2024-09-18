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
  tactic.relations = await buildRelations({ tactic, scope }, ctx);

  return { tactic, strategy };
}

// this can be massively cleaned.
async function buildRelations({ tactic, scope }, ctx) {
  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(
        relation.map(async ({ slug }) =>
          slug ? await ctx.runtime.call(`/${resourceType}/fromSlug`, { slug }) : relation,
        ),
      );
    } else if (typeof relation === "object" && relation.slug) {
      return relation.slug
        ? await ctx.runtime.call(`/${resourceType}/fromSlug`, relation)
        : relation;
    } else {
      return relation;
    }
  }

  async function resolveResource(resourceType, relations) {
    const richRelations = await Object.entries(relations).reduce(
      async (acc, [relationName, relationDetail]) => {
        acc = await acc;
        acc[relationName] = await resolveRelation(resourceType, relationDetail, ctx);
        if (resourceType === "games" && acc[relationName].mask) {
          // resolve tags units and games defined in game mask.
          Object.entries(acc[relationName].mask).forEach(async ([maskType, mask]) => {
            if (typeof mask === "object") {
              acc[relationName].mask[maskType] = await resolveResource(maskType, mask);
            }
          });
        }
        return acc;
      },
      {},
    );

    return richRelations;
  }

  const relations = await Object.entries(tactic.relations).reduce(
    async (acc, [resourceType, relation]) => {
      acc = await acc;
      acc[resourceType] = await resolveResource(resourceType, relation, ctx);
      return acc;
    },
    { games: {}, units: {}, tags: {} },
  );

  return relations;
}
