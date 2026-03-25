import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "cloze",
  name: "Cloze",
  description: "Fill blanked tokens in a sentence. Typed, picked, or audio-prompted. Per-token review.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
};

const buffer = new BufferView(
  "buffer/Cloze.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: known→learning, KNOWN: learning→known"),
      gameplay: v.string({ default: "type" }).desc("type: free input, pick: select from options, listen: audio prompt with blanks"),
      blankIndices: v.array(v.number(), { default: [] }).desc("Token positions to blank in the ANNOTATED sentence"),
      options: v.array(v.string().desc("Shuffled answer candidates for pick gameplay")).optional(),
      forgiving: v.boolean({ default: true }).desc("Normalize diacritics and case when evaluating typed input"),
    },
  }),
);

const emitter = new Vector().open("/literal", async (ctx) => {
  return ctx.mode.buffer({
    data: {
      recall: ctx.input.recall ?? "LEARNING",
      gameplay: ctx.input.gameplay ?? "type",
      blankIndices: ctx.input.blankIndices ?? [0],
      options: ctx.input.options,
      forgiving: ctx.input.forgiving ?? true,
    },
    literals: [ctx.input.literal],
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
