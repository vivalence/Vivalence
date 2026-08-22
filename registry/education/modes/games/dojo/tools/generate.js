import { v, Vector } from "@vivalence/typology";
import * as types from "../types.js";

export const generate = new Vector().open(
  {
    nature: "/generate",
    valence: "Compose FRESH sentences and put them on screen as a rep session — new material, " +
      "not corpus rows. The vocabulary pool is the learner's own touched material, weakest " +
      "first, topped up from the feed only when history is thin. Pass anchors to force " +
      "freshly drilled items into every sentence — the integration step after components " +
      'hold. Example: { count: 3, anchors: ["dalla.contraction"], instructions: "present tense" }.',
    input: v.object({
      count: types.count,
      where: v
        .record(v.string(), v.unknown())
        .desc("Literal filter narrowing the vocabulary pool the sentences draw from.")
        .optional(),
      anchors: v
        .array(v.string())
        .desc(
          "Literal slugs or ids that every sentence must build around — use for integrating freshly drilled material into context.",
        )
        .optional(),
      instructions: v
        .string()
        .desc("Freeform steering, appended verbatim to the composition prompt.")
        .optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game?.["dojo"];
    if (!game) return { condition: "ERROR", message: "dojo is not mounted" };

    const emission = await game.emit.generate({
      count: ctx.input.count,
      ...(ctx.input.where && { where: ctx.input.where }),
      ...(ctx.input.anchors?.length && { anchors: ctx.input.anchors }),
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
