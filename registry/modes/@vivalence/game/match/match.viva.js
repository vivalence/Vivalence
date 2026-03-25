import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "match",
  name: "Match",
  description: "Connect literal pairs across two columns. Batch mode. Failure is sticky per literal.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
};

const buffer = new BufferView(
  "buffer/Match.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: known left ↔ learning right, KNOWN: reversed"),
      gameplay: v.string({ default: "translate" }).desc("translate: match TRANSLATED pairs, describe: match descriptions to literals"),
      descriptions: v.array(v.string().desc("Parallel to literals — left-column text for describe gameplay")).optional(),
    },
  }),
);

const emitter = new Vector().open("/batch", async (ctx) => {
  return ctx.mode.buffer({
    data: {
      recall: ctx.input.recall ?? "LEARNING",
      gameplay: ctx.input.gameplay ?? "translate",
      descriptions: ctx.input.descriptions,
    },
    literals: ctx.input.literals,
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
