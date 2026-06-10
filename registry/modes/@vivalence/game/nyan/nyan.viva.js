import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "nyan",
  name: "Nyan",
  description:
    "Standalone typing trainer. Setup, practice, review. One keystroke stream split into recall / spelling / motor. No domain, ephemeral.",
  version: "0.1.0",
  traits: ["BUFFERED", "SELFEVIDENT", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Nyan.svelte",
  v.buffer({
    data: {
      text: v.string().desc("Explicit text to type").optional(),
      length: v.number().desc("Run length in words").optional(),
      gameplay: v
        .string({ default: "PLAIN" })
        .desc("PLAIN: single pass, SUDDENDEATH: first error restarts the run"),
    },
  }),
);

const emitter = new Vector().open("/exercise", async (ctx) => {
  const { text, length, gameplay } = ctx.input;
  return ctx.mode.buffer({ data: { text, length, gameplay } });
});

export { manifest, buffer, emitter };
