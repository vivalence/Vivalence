import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "listen",
  name: "Listen",
  description: "Audio-first recall. Pick or type the meaning/transcription. Requires VOCALIZED literal.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
};

const buffer = new BufferView(
  "buffer/Listen.svelte",
  v.buffer({
    data: {
      recall: v.union([v.string(), v.array(v.string())], {
        description: "LEARNING: audio → produce known, KNOWN: audio → transcribe learning. Array for per-literal, omit for random.",
      }).optional(),
      gameplay: v.string({ default: "pick" }).desc("pick: select from candidates, type: free text input"),
      forgiving: v.boolean({ default: true }).desc("Normalize diacritics and case when evaluating typed input"),
    },
  }),
);

const emitter = new Vector().open("/literal", async (ctx) => {
  const gameplay = ctx.input.gameplay ?? "pick";
  let literals = [ctx.input.literal];

  if (gameplay === "pick") {
    const distractors = ctx.input.distractors ?? await ctx.daemon.entities.literal.feed({
      user: ctx.user.id,
      take: 3,
      blacklist: ctx.input.blacklist,
    });
    literals = [ctx.input.literal, ...distractors];
  }

  return ctx.mode.buffer({
    data: {
      recall: ctx.input.recall ?? "LEARNING",
      gameplay,
      forgiving: ctx.input.forgiving ?? true,
    },
    literals,
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
