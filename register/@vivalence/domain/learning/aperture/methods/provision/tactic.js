import { join } from "$std/path/mod.ts";
import { deepMerge, Scope, Blacklist } from "@vivalence/shared";

export default async function (input, ctx) {
  const tactic = ctx.runtime.modules.tactics[input.tactic.slug];
  const user = await ctx.runtime.services.identity.getUser();

  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
    tactic: { slug: input.tactic.slug },
  });
  const blacklist = await new Blacklist(input.blacklist).fromQueue(scope, ctx);

  let { masks = {}, relations = {} } = input;
  masks = deepMerge({}, tactic.data.masks, masks);
  relations = deepMerge({}, tactic.data.relations, relations);
  relations = await buildRelations(relations, ctx);
  relations = injectGameCaller({ relations, masks, scope }, ctx);

  const instructions = await ctx.runtime.call(
    `/tactic/${tactic.manifest.slug}/provision`,
    { tactic: { relations, masks }, scope, blacklist },
  );

  if (
    instructions?.length > 0 &&
    !instructions.find((i) => i.type === "SIGNAL" && i.signal === "COMPLETED")
  ) {
    instructions.push({ type: "SIGNAL", signal: "REPETITION" });
  }

  let i = 0;
  for (let instruction of instructions) {
    if (instruction.type === "SIGNAL") continue;

    instruction = await ctx.runtime.entities.instruction.create({
      user: user.id,
      tactic: tactic.manifest.slug,
      game: instruction.scope.game.slug,
      data: instruction.instruction,
      bundle: instruction.bundle,
      scope: instruction.scope,
      index: i++,
    });
  }

  await ctx.runtime.entities.em.flush();

  return instructions;
}

const relationsToEntitiesMap = {
  tags: "tag",
  units: "unit",
};

async function buildRelations(relations, ctx) {
  async function resolveRelation(resourceType, relation) {
    if (Array.isArray(relation)) {
      return await Promise.all(
        relation.map(async (r) => await resolveRelation(resourceType, r)),
      );
    } else if (typeof relation === "object" && relation.slug) {
      if (resourceType === "games") {
        const game = ctx.runtime.modules[resourceType][relation.slug];
        return { ...game.manifest, ...game.data, path: game.aperture.path };
      } else {
        const entity =
          ctx.runtime.entities[relationsToEntitiesMap[resourceType]];
        return await entity.findOneOrFail(relation);
      }
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
      richRelations[relationName] = await resolveRelation(
        resourceType,
        relationDetail,
      );

      if (resourceType === "games") {
        if (richRelations[relationName].mask)
          for (const [maskType, mask] of Object.entries(
            richRelations[relationName].mask,
          )) {
            if (typeof mask === "object") {
              richRelations[relationName].mask[maskType] =
                await resolveResource(maskType, mask);
            } else if (typeof mask === "string") {
              richRelations[relationName].mask[maskType] = mask;
            } else {
              console.log(
                "@tactic middleware resolve mask type is not object",
                maskType,
                mask,
              );
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
        join(game.path.value, path),
        deepMerge(
          { mask: deepMerge(game.mask, masks[relationName]) },
          { scope: deepMerge(scope, { game: { slug: game.slug } }) },
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
