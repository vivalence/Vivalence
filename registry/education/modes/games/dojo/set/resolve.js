import * as types from "../types.js";
import { audible } from "../emitter/audible.js";
import { conjugate } from "../emitter/conjugate.js";
import { picks, cap } from "./picks.js";

const forms = async (ctx, paradigms, listening) => {
  if (!paradigms.length) return [];
  const populated = await ctx.daemon.entities.literal.find(
    { id: { $in: paradigms.map((paradigm) => paradigm.id) } },
    { populate: ["uses", "symbols"] },
  );
  const resolved = await conjugate(ctx, populated);
  return resolved.filter((knowable) => !listening || knowable.asset);
};

export const resolve = async (ctx, { set = [] } = {}, { prompt, blacklist = [] } = {}) => {
  const listening = types.listening(prompt);
  const taken = new Set(blacklist);
  const clauses = [];

  for (const clause of set) {
    const pick = picks[clause.pick];
    if (!pick) {
      clauses.push({ literals: [], paradigms: [], knowables: [], count: 0 });
      continue;
    }
    const limit = cap(clause);
    const drawn = await pick(ctx, clause, {
      blacklist: [...taken],
      limit: listening ? limit * types.OVERFETCH : limit,
    });
    const fresh = drawn.literals.filter((literal) => !taken.has(literal.id));
    const paradigms = fresh.filter((literal) => literal.ontology === "conjugation").slice(0, limit);
    const expanded = await forms(ctx, paradigms, listening);
    const covered = new Set(expanded.map((knowable) => knowable.literal).filter(Boolean));
    const spoken = fresh
      .filter((literal) => literal.ontology !== "conjugation")
      .filter((literal) => !covered.has(literal.id))
      .filter((literal) => !listening || audible(ctx.daemon, literal))
      .slice(0, limit);
    const knowables = [
      ...(drawn.knowables ?? []),
      ...expanded.filter((knowable) => !knowable.literal || !taken.has(knowable.literal)),
    ];
    for (const literal of [...spoken, ...paradigms]) taken.add(literal.id);
    for (const id of covered) taken.add(id);
    clauses.push({
      literals: spoken,
      paradigms,
      knowables,
      count: drawn.count ?? spoken.length + paradigms.length + (drawn.knowables?.length ?? 0),
    });
  }

  return {
    clauses,
    literals: clauses.flatMap((entry) => entry.literals),
    knowables: clauses.flatMap((entry) => entry.knowables),
  };
};

export const empty = (resolved) => !resolved.literals.length && !resolved.knowables.length;
