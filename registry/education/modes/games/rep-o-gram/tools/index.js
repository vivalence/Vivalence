import { object, v, Vector } from "@vivalence/typology";
import * as types from "../types.js";
import * as fold from "../fold.js";
import { preset } from "./preset.js";
import { conjugations } from "./conjugations.js";
import { generate } from "./generate.js";

const AXES = {
  recall: types.recall,
  gameplay: types.gameplay.optional(),
  prompt: types.prompt.optional(),
  preview: types.preview,
  streak: types.streak,
  continuous: types.continuous,
  limit: types.limit,
  forgiving: types.forgiving.optional(),
};

const AXIS_KEYS = Object.keys(AXES);

export const tools = new Vector().open(
  {
    nature: "/provision",
    valence:
      "Put a rep session on the learner's screen — one buffer, one set of knowables, every axis free to combine. " +
      "Three sources, picked in order: authored knowables (your own pairs — they rep without touching the retention), " +
      "a symbol scope (drawn from the corpus, AND per symbol), or the plain memory feed. " +
      "Defaults are TYPE gameplay, TEXT prompt, a single pass; set streak for consecutive-success mastery, " +
      "limit for a hard cutoff, prompt AUDIO only when the material is vocalized. Keep count small — " +
      "two or three fresh items beat nine stale ones.",
    input: v.object({
      count: types.count,
      symbols: v
        .array(v.string())
        .desc(
          "Symbol slugs scoping the draw — they AND together. Omit to draw from the memory feed.",
        )
        .optional(),
      knowables: v
        .array(
          v.object({
            known: v.string().desc("The pair's face in the learner's native language."),
            learning: v.string().desc("The pair's face in the language being learned."),
          }),
        )
        .desc("Author the set yourself — reps without touching the retention, reviews skipped.")
        .optional(),
      ...AXES,
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game?.["rep-o-gram"];
    if (!game) return { condition: "ERROR", message: "rep-o-gram is not mounted" };

    const axes = object.pluck(ctx.input, AXIS_KEYS);
    const input = { ...axes, ...(ctx.thread ? { thread: ctx.thread } : {}) };

    const emission = ctx.input.knowables?.length
      ? await game.emit.knowables({ ...input, knowables: ctx.input.knowables.map(fold.authored) })
      : ctx.input.symbols?.length
      ? await game.emit.symbols({ ...input, symbols: ctx.input.symbols, count: ctx.input.count })
      : await game.emit.feed({ ...input, count: ctx.input.count });

    const buffers = emission.output.buffer ?? [];
    const [buffer] = buffers;
    const carried = buffer
      ? (buffer.literals?.getItems?.() ?? buffer.literals ?? []).length +
        (buffer.data?.knowables ?? []).length
      : 0;

    return {
      message: buffers.length
        ? `rep session on screen — ${carried} knowable${carried === 1 ? "" : "s"}, ` +
          [
            buffer.data?.gameplay ?? "TYPE",
            buffer.data?.streak ? `streak ${buffer.data.streak}` : "single pass",
          ].join(", ") +
          "."
        : "nothing to rep for these filters — the draw came back empty.",
      ...emission.output,
    };
  },
)
  .slurp(preset)
  .slurp(conjugations)
  .slurp(generate);
