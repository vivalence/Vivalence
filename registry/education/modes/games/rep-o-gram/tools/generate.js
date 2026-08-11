import { v, Vector } from "@vivalence/typology";
import * as types from "../types.js";

export const generate = new Vector().open(
  {
    nature: "/generate",
    valence: "Compose FRESH sentences from the learner's known vocabulary and put them on screen " +
      "as a rep session — new material, not corpus rows. Steer the composition with " +
      'instructions. Example: { count: 4, instructions: "present tense -ere verbs, home ' +
      'vocabulary" }.',
    input: v.object({
      count: types.count,
      where: v
        .record(v.string(), v.unknown())
        .desc("Literal filter narrowing the vocabulary pool the sentences draw from.")
        .optional(),
      instructions: v
        .string()
        .desc("Freeform steering, appended verbatim to the composition prompt.")
        .optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game?.["rep-o-gram"];
    if (!game) return { condition: "ERROR", message: "rep-o-gram is not mounted" };

    const emission = await game.emit.generate({
      count: ctx.input.count,
      ...(ctx.input.where && { where: ctx.input.where }),
      ...(ctx.input.instructions && { instructions: ctx.input.instructions }),
      ...(ctx.thread ? { thread: ctx.thread } : {}),
    });

    const buffers = emission.output.buffer ?? [];
    return {
      message: buffers.length
        ? "generated session on screen — fresh sentences from the learner's vocabulary."
        : "generation drew no vocabulary for these filters.",
      ...emission.output,
    };
  },
);
