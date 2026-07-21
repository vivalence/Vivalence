import { Vector, v } from "@vivalence/typology";

const DEFAULT_SYMBOLS = ["domain.weekday", "domain.month"]; // quick hack — steer explicitly via the learner report's symbol sets

// cast riddle challenges — delegates to the mode's own /riddle emitter (which hands
// off to the riddler game mode). Unsteered = weekdays + months; steer with symbol
// sets or freeform instructions.
export const riddle = new Vector().open(
  {
    nature: "/riddle",
    valence:
      "Cast riddle challenges onto the learner's screen — the Riddler character spins them " +
      "from vocabulary. Default: weekdays and months. Steer with symbol sets " +
      "(see the learner report) or freeform instructions.",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 5 }).default(1),
      symbols: v.array(v.string()).optional(),
      instructions: v.string().optional(),
    }),
  },
  async (ctx) => {
    const symbols = ctx.input.symbols?.length ? ctx.input.symbols : DEFAULT_SYMBOLS;
    const emission = await ctx.mode.emit.riddle({ ...ctx.input, symbols, thread: ctx.thread });
    const buffers = emission.entities.buffer;
    return {
      message: buffers.length
        ? `${buffers.length === 1 ? "One riddle" : `${buffers.length} riddles`} on screen.`
        : "No vocabulary matched that selection.",
      entities: emission.entities,
    };
  },
);
