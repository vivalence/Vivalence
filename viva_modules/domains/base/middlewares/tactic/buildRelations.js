import { join } from "$std/path/mod.ts";
import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

export default async function buildRelations(body, ctx) {
  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(relation.map(async (r) => await resolveRelation(resourceType, r)));
    } else if (typeof relation === "object" && relation.slug) {
      return await ctx.runtime.call(`/${resourceType}/fromSlug`, relation);
    } else if (typeof relation === "object" && relation.id) {
      // throw new Error("Not implemented");
      return relation;
    } else {
      return relation;
    }
  }

  async function resolveResource(resourceType, relations) {
    const richRelations = {};
    for (const [relationName, relationDetail] of Object.entries(relations)) {
      richRelations[relationName] = await resolveRelation(resourceType, relationDetail);

      // resolve game masks.
      if (resourceType === "games" && richRelations[relationName].mask) {
        for (const [maskType, mask] of Object.entries(richRelations[relationName].mask)) {
          if (typeof mask === "object") {
            richRelations[relationName].mask[maskType] = await resolveResource(maskType, mask);
          } else {
            console.log("@tactic middleware resolveResource");
            console.log("mask type is not object", maskType, mask);
            // throw new Error("Not implemented");
          }
        }
      }
    }

    return richRelations;
  }

  for (const [resourceType, relation] of Object.entries(body.tactic.relations)) {
    body.tactic.relations[resourceType] = await resolveResource(resourceType, relation);
  }

  return body;
}
