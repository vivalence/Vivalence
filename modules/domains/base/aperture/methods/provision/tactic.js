import { join } from "$std/path/mod.ts";
import { deepMerge, Scope, Blacklist } from "@vivalence/shared";

export default async function (body, ctx) {
  const user = await ctx.runtime.services.identity.getUser();

  const tactic = await ctx.runtime.entities.tactic.findOneOrFail({ slug: body.tactic.slug });
  const scope = new Scope({ ...body.scope, user: { id: user.id }, tactic: { id: tactic.id } });
  const blacklist = await new Blacklist(body.blacklist).fromQueue(scope, ctx);

  let { masks = {}, relations = {} } = body;
  masks = deepMerge({}, tactic.masks, masks);
  relations = deepMerge({}, tactic.relations, relations);
  relations = await buildRelations(relations, ctx);
  relations = injectGameCaller({ relations, masks, scope }, ctx);

  const input = { tactic: { ...tactic, relations, masks }, scope, blacklist };
  const instructions = await ctx.runtime.call(`/tactic/${tactic.slug}/provision`, input);

  if (
    instructions?.length > 0 &&
    !instructions.find((i) => i.type === "SIGNAL" && i.signal === "COMPLETED")
  ) {
    instructions.push({ type: "SIGNAL", signal: "REPETITION" });
  }

  return instructions;
}

const relationsToEntitiesMap = {
  tags: "tag",
  units: "unit",
  games: "game",
};

async function buildRelations(relations, ctx) {
  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(relation.map(async (r) => await resolveRelation(resourceType, r)));
    } else if (typeof relation === "object" && relation.slug) {
      const entity = ctx.runtime.entities[relationsToEntitiesMap[resourceType]];
      return await entity.findOneOrFail(relation);
    } else if (typeof relation === "object" && relation.id) {
      console.log("Not implemented - tacti middleware buildRelation");
      return relation;
    } else {
      return relation;
    }
  }

  async function resolveResource(resourceType, relation) {
    const richRelations = {};
    for (const [relationName, relationDetail] of Object.entries(relation)) {
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

  for (const [resourceType, relation] of Object.entries(relations)) {
    relations[resourceType] = await resolveResource(resourceType, relation);
  }

  return relations;
}

function injectGameCaller({ relations, masks, scope }, ctx) {
  if (!relations && !relations.games) throw new Error("Invalid tactic");

  Object.entries(relations.games).forEach(([relationName, game]) => {
    relations.games[relationName].call = (path, input) => {
      return ctx.runtime.call(
        join(game.url.modulename, path),
        deepMerge(
          { mask: deepMerge(game.mask, masks[relationName]) },
          { scope: deepMerge(scope, { game: { id: game.id } }) },
          input,
        ),
      );
    };

    relations.games[relationName].provision = (input) => {
      return relations.games[relationName].call("/provision", input);
    };
  });

  return relations;
}
