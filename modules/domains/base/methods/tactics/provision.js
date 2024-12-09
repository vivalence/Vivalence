import { join } from "$std/path/mod.ts";
import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

export default async function (body, ctx) {
  let { tactic, scope, blacklist } = body;
  const user = await ctx.runtime.services.identity.getUser();

  scope.tactic = { id: tactic.id };
  scope.user = { id: user.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

  tactic = await buildRelations(tactic, ctx);

  const input = { tactic, scope, blacklist };
  const instructions = await ctx.runtime.call(`/t/${tactic.slug}/provision`, input);

  if (
    instructions?.length > 0 &&
    !instructions.find((i) => i.type === "SIGNAL" && i.signal === "COMPLETED")
  ) {
    instructions.push({ type: "SIGNAL", signal: "REPETITION" });
  }

  return instructions;
}

async function buildRelations(tactic, ctx) {
  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(relation.map(async (r) => await resolveRelation(resourceType, r)));
    } else if (typeof relation === "object" && relation.slug) {
      return await ctx.runtime.call(`/${resourceType}/fromSlug`, relation);
    } else if (typeof relation === "object" && relation.id) {
      console.log("Not implemented - tacti middleware buildRelation");
      return relation;
    } else {
      return relation;
    }
  }

  async function resolveResource(resourceType, relations) {
    const richRelations = {};
    for (const [relationName, relationDetail] of Object.entries(relations)) {
      richRelations[relationName] = await resolveRelation(resourceType, relationDetail);

      if (resourceType === "games") {
        if (richRelations[relationName].mask)
          for (const [maskType, mask] of Object.entries(richRelations[relationName].mask)) {
            if (typeof mask === "object") {
              richRelations[relationName].mask[maskType] = await resolveResource(maskType, mask);
            } else if (typeof mask === "string") {
              richRelations[relationName].mask[maskType] = mask;
            } else {
              console.log("@tactic middleware resolve mask type is not object", maskType, mask);
            }
          }
      }
    }

    return richRelations;
  }

  for (const [resourceType, relation] of Object.entries(tactic.relations)) {
    tactic.relations[resourceType] = await resolveResource(resourceType, relation);
  }

  return tactic;
}
