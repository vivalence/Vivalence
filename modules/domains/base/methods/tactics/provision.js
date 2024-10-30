import { join } from "$std/path/mod.ts";

import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

// import getData from "./lib/data.js";

// everything here can / ought to be moved into tactic middlewares.
export default async function ({ masks, relations, scope, blacklist }, ctx) {
  const start = performance.now();
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

  let { data: tactic, error } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .select(`*`)
    .eq("id", scope.tactic.id)
    .single();
  if (error) throw error;

  tactic = deepMerge(tactic, { masks, relations });
  tactic.relations = await buildRelations({ tactic, scope }, ctx);

  const inputs = {
    language: { learning: "spanish", known: "english" },
    tactic,
    scope,
    blacklist,
  };

  const instructions = await ctx.runtime.call(join("/t", tactic.slug), inputs);

  const end = performance.now();
  console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
  return instructions;
}

// this must be massively cleaned.
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
