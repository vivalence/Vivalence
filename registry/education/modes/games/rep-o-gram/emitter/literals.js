import { cast } from "@vivalence/typology";
import { buffer } from "./buffer.js";
import { distractors } from "./distractors.js";

const DISTRACTOR_POOL = 6;

export const literals = async (ctx) => {
  const set = ctx.input.literals ?? cast.array(ctx.input.literal);
  if (!set.length) return [];
  if (ctx.input.gameplay !== "PICK" || set.length > 1) return buffer(ctx, { literals: set });

  const [target] = set;
  const pool =
    ctx.input.distractors ??
    (await ctx.daemon.entities.literal.feed(
      { ontology: target.ontology },
      { limit: DISTRACTOR_POOL, blacklist: ctx.input.blacklist },
    ));

  const options = distractors(target, pool, ctx.input.recall);
  return buffer(ctx, { data: { target: target.id }, literals: [target, ...options] });
};
