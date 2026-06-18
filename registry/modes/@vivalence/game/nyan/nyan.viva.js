import { Vector, View, v } from "@vivalence/typology";
import { GAMEPLAYS } from "./buffer/engine.js";

const manifest = {
  type: "game",
  slug: "nyan",
  name: "Nyan",
  description:
    "Standalone typing trainer. Setup, practice, review. One keystroke stream split into recall / spelling / motor. No domain, ephemeral.",
  version: "0.1.0",
  traits: ["VIEWABLE", "EMITTER", "SELFEVIDENT", "TOOLED"],
};

const view = new View(
  "buffer/Nyan.svelte",
  v.buffer({
    data: {
      gameplay: v.enum(Object.keys(GAMEPLAYS), { default: "PLAIN" }),
      words: v.array(v.string()).optional(),
    },
  }),
);

const emitter = new Vector().open("/play", async (ctx) => {
  const data = {};
  if (ctx.input.gameplay) data.gameplay = ctx.input.gameplay;
  if (ctx.input.words) data.words = ctx.input.words;
  return ctx.mode.buffer({ data });
});

const tools = new Vector().open(
  {
    nature: "play",
    valence:
      "Open the Nyan typing trainer. Pass `words` to drill that list now; omit to land on the setup screen. Default to plain.",
    input: v.object({
      gameplay: v
        .enum(Object.keys(GAMEPLAYS), { default: "PLAIN" })
        .desc("PLAIN: mistakes allowed. SUDDENDEATH: one wrong key ends the run."),
      words: v
        .array(v.string())
        .optional()
        .desc("Exact words to type, in order. Omit to choose in setup. Between 20-50 words."),
    }),
    output: v.object({}),
  },
  async (ctx) => ctx.mode.emit.play(ctx.input),
);

export { manifest, view, emitter, tools };
