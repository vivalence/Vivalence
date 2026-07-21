import { Vector, v } from "@vivalence/typology";

// start a mixed review drill — delegates to the mode's own /drill emitter, which pulls
// due literals across all ontologies and routes each to the exercise its memory state
// calls for. The tool return is the receipt, never the delivery.
export const drill = new Vector().open(
  {
    nature: "/drill",
    valence:
      "Start a review drill on the learner's screen — one pull of due vocabulary across ALL " +
      "ontologies, each item routed to the exercise its memory state calls for (weak or failed " +
      "items get scaffolded productive recall, strong items get fast recognition). The default " +
      "review session — reach for it when the learner wants to review or practice without " +
      "naming a specific game. Pick count from the learner report's due figure.",
    input: v.object({
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
    }),
  },
  async (ctx) => {
    const emission = await ctx.mode.emit.drill({ ...ctx.input, thread: ctx.thread });
    const buffers = emission.entities.buffer;
    return {
      message: buffers.length
        ? `Drill started — ${buffers.length === 1 ? "one exercise" : `${buffers.length} exercises`} on screen.`
        : "Nothing due for review right now.",
      entities: emission.entities,
    };
  },
);
