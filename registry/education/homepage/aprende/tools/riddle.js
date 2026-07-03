import { Vector, v } from "@vivalence/typology";

// cast riddle challenges — delegates to the mode's own /riddle emitter (which hands
// off to the riddler game mode). Unsteered = the learner's weakest vocabulary;
// steer with subject, symbol sets, or freeform instructions.
export const riddle = new Vector().open(
  {
    nature: "/riddle",
    valence:
      "Cast riddle challenges onto the learner's screen — the Riddler character spins them " +
      "from vocabulary. Default: the learner's weakest words. Steer with subject, symbol sets " +
      "(see the learner report), or freeform instructions.",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 5 }).default(1),
      subject: v.enum(["weekdays", "months"]).optional(), // the riddler owns this list
      symbols: v.array(v.string()).optional(),
      instructions: v.string().optional(),
    }),
  },
  async (ctx) => {
    const emission = await ctx.mode.emit.riddle({ ...ctx.input, thread: ctx.input.thread });
    const buffers = emission.entities.buffer;
    return {
      message: buffers.length
        ? `${buffers.length === 1 ? "One riddle" : `${buffers.length} riddles`} on screen.`
        : "No vocabulary matched that selection.",
      entities: emission.entities,
    };
  },
);
