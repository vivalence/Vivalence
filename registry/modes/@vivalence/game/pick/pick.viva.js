import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "pick",
  name: "Pick",
  description: "Multiple choice from distractors. One tap. Wrong pick penalizes both target and distractor.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
};

const buffer = new BufferView(
  "buffer/Pick.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: known→pick learning, KNOWN: learning→pick known"),
    },
  }),
);

const emitter = new Vector().open("/literal", async (ctx) => {
  let distractors = ctx.input.distractors ?? [];
  if (!distractors.length) {
    distractors = await ctx.daemon.entities.literal.feed({
      user: ctx.user.id,
      take: 3,
      blacklist: ctx.input.blacklist,
    });
  }
  return ctx.mode.buffer({
    data: { recall: ctx.input.recall ?? "LEARNING" },
    literals: [ctx.input.literal, ...distractors],
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
