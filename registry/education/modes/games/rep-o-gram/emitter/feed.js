import { object } from "@vivalence/typology";
import * as types from "../types.js";
import { audible } from "./audible.js";
import { buffer } from "./buffer.js";
import { conjugate } from "./conjugate.js";

export const draw = async (ctx) => {
  const count = ctx.input.count ?? 5;
  const listening = ctx.input.prompt === "AUDIO";

  const drawn = await ctx.daemon.entities.literal.feed(
    object.merge(ctx.input.where, { ontology: { $in: types.ONTOLOGY } }),
    {
      limit: listening ? count * types.OVERFETCH : count,
      blacklist: ctx.input.blacklist,
    },
  );

  const paradigms = drawn.filter((literal) => literal.ontology === "conjugation");
  const spoken = drawn
    .filter((literal) => literal.ontology !== "conjugation")
    .filter((literal) => !listening || audible(ctx.daemon, literal))
    .slice(0, count);

  const resolved = await conjugate(
    ctx,
    paradigms.length
      ? await ctx.daemon.entities.literal.find(
          { id: { $in: paradigms.map((paradigm) => paradigm.id) } },
          { populate: ["uses", "symbols"] },
        )
      : [],
  );

  return {
    literals: spoken,
    knowables: resolved.filter((knowable) => !listening || knowable.asset),
  };
};

export const feed = async (ctx) => {
  const set = await draw(ctx);
  if (!set.literals.length && !set.knowables.length) return [];
  return buffer(ctx, { literals: set.literals, data: { knowables: set.knowables } });
};
