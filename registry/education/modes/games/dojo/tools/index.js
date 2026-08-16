import { object, v, Vector } from "@vivalence/typology";
import * as types from "../types.js";
import * as fold from "../fold.js";
import { preset } from "./preset.js";
import { conjugations } from "./conjugations.js";
import { generate } from "./generate.js";

const AXES = object.pluck(types.AXES, types.SETUP);

const AXIS_KEYS = Object.keys(AXES);

export const tools = new Vector().open(
  {
    nature: "/provision",
    valence:
      "Put a rep session on the learner's screen — one buffer, one set, every axis free to combine. " +
      "Four sources, picked in order: a declared `set` (the dojo's own clause grammar — pin exact literals " +
      "with {pick: 'literals', literals: [slugs]}, stream the weakest with byStrength, scope any clause " +
      "with a `where`; clauses union in order), authored knowables (your own pairs — they rep without " +
      "touching the retention), a symbol scope (drawn from the corpus, AND per symbol), or the plain memory feed. " +
      "Every axis the drawer offers rides here too — recall, gameplay, prompt, greedy, random, preview, " +
      "streak, anhieb, continuous, limit, forgiving. Defaults are TYPE gameplay, TEXT prompt, a single pass; " +
      "set streak for consecutive-success mastery, limit for a hard cutoff, prompt AUDIO only when the " +
      "material is vocalized. Keep count small — two or three fresh items beat nine stale ones.",
    input: v.object({
      count: types.count,
      set: types.set.optional(),
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
    const game = ctx.daemon.modes.game?.["dojo"];
    if (!game) return { condition: "ERROR", message: "dojo is not mounted" };

    const axes = object.pluck(ctx.input, AXIS_KEYS);
    const input = { ...axes, ...(ctx.thread ? { thread: ctx.thread } : {}) };

    const emission = ctx.input.set?.length
      ? await game.emit.set({ ...input, set: ctx.input.set })
      : ctx.input.knowables?.length
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
