import { Vector, v, array } from "@vivalence/typology";
import { POOL_FACTOR, weightedSample } from "./sample.js";

// ontology × retention-state → the exercise mode. weak/failed → scaffolded productive
// recall; strong → fast recognition. One literal in, one game-mode buffer out.
function exercise(game, literal, thread) {
  const hard = literal.retention?.is?.weak || literal.retention?.is?.failed;
  switch (literal.ontology) {
    case "conjugation":
      return hard
        ? game["dojo"].emit.literals({ literals: [literal], gameplay: "CONJUGATE", recall: "LEARNING", thread }) // the whole table, cell by cell
        : game["dojo"].emit.literals({ literals: [literal], gameplay: "TYPE", thread }); // the same row, its forms one by one
    case "sentence":
      return hard
        ? game["dojo"].emit.shadow.literals({ literals: [literal], thread }) // flash then type
        : game["dojo"].emit.listen.literal({ literal, thread }); // audio recall
    default:
      return hard
        ? game["dojo"].emit.write.literals({ literals: [literal], thread }) // type from retention
        : game.judge.emit.literal({ literal, thread }); // fast true/false
  }
}

// drill · ONE pull of due literals, each branched to its own exercise by ontology
// × retention-state. weak/failed items get productive scaffolded recall; strong items
// get fast recognition. The branch mirrors the survival/clinic tactics, kept lean in
// the homepage. Delegation: pick here, hand each literal to the right game mode, pool
// the returned buffer (thread forwarded so the buffer binds to the caller's thread).
export const drill = new Vector().open(
  {
    nature: "/drill",
    input: v.object({
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
      thread: v.string().optional(), // binds emitted buffers to the caller's thread
    }),
  },
  async (ctx) => {
    // one read: due literals across ALL ontologies, with the retention state + the forms
    // each exercise needs (uses = sentence tokens / paradigm forms). Sort weakest-first
    // so the weighted sample favors the most-decayed items.
    const pool = (
      await ctx.daemon.entities.literal.due(
        {},
        {
          limit: ctx.input.count * POOL_FACTOR,
          populate: ["retentions", "retentions.strength", "uses"],
        },
      )
    ).sort((a, b) => (a.retention?.strength ?? 0) - (b.retention?.strength ?? 0));
    const literals = weightedSample(pool, ctx.input.count);
    if (!literals.length) return [];

    // one section, one exercise per literal, shuffled into an interleaved deck
    const deck = ctx.pool.section();
    for (const literal of literals) {
      deck.add(await exercise(ctx.daemon.modes.game, literal, ctx.input.thread));
    }
    deck.apply(array.shuffle);
  },
);
