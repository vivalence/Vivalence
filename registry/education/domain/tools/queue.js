import { v, Vector } from "@vivalence/typology";
import { STATUS } from "../types.js";
import { line } from "./line.js";

export const queue = new Vector().open(
  {
    nature: "/queue",
    valence: [
      "Draw study items from the learner's queue. One pick per call:",
      "due — items scheduled for review now. Open every session with this.",
      "feed — due items topped up with novel ones; the default study set.",
      "novel — never-studied items, course order.",
      "weakest — items with the weakest retention first.",
      "status — a random sample filtered to the given statuses.",
      "Always draw before planning an exercise — work with real items, never remembered ones.",
    ].join("\n"),
    input: v.object({
      pick: v.enum(["due", "feed", "novel", "weakest", "status"], { default: "due" }),
      symbols: v
        .array(v.string())
        .desc("Symbol slugs scoping the draw — they AND together.")
        .optional(),
      status: v.array(v.enum(STATUS)).desc("Status filter for the status pick.").optional(),
      limit: v.integer({ minimum: 1, maximum: 50 }).default(12),
    }),
  },
  async (ctx) => {
    const literal = ctx.daemon.entities.literal;
    const where = ctx.input.symbols?.length ? { symbols: ctx.input.symbols } : {};
    const limit = ctx.input.limit;

    const picks = {
      due: () => literal.due(where, { limit }),
      feed: () => literal.feed(where, { limit }),
      novel: () => literal.novel(where, { limit }),
      weakest: () => literal.byStrength(where, { limit }),
      status: () => literal.sample(where, { status: ctx.input.status, limit }),
    };
    const literals = await picks[ctx.input.pick]();

    if (!literals.length) {
      return { message: "nothing matches — the queue is empty for these filters." };
    }

    return {
      message: literals.map(line).join("\n"),
      entities: { literal: literals },
      object: { slugs: literals.map((literal) => literal.slug) },
    };
  },
);
