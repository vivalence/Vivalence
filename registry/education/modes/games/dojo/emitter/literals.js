import { cast } from "@vivalence/typology";
import { buffer } from "./buffer.js";
import { distractors } from "./distractors.js";

const DISTRACTOR_POOL = 6;

const identify = (literal) => literal?.id ?? literal;

export const literals = async (ctx) => {
  const set = ctx.input.literals ?? cast.array(ctx.input.literal);
  if (!set.length) return [];
  const pickable = [].concat(ctx.input.gameplay ?? []).includes("PICK");
  if (!pickable || set.length > 1)
    return buffer(ctx, { set: [{ pick: "literals", literals: set.map(identify) }] });

  const [target] = set;
  const pool =
    ctx.input.distractors ??
    (await ctx.daemon.entities.literal.feed(
      { ontology: target.ontology },
      { limit: DISTRACTOR_POOL, blacklist: ctx.input.blacklist },
    ));

  const options = distractors(target, pool, ctx.input.recall);
  return buffer(ctx, {
    set: [{ pick: "literals", literals: [target, ...options].map(identify) }],
    data: { target: target.id },
  });
};
