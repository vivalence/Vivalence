import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "judge",
  name: "Judge",
  description: "Timed true/false on translation pairs. Swipe or tap. Batch flow through items list.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
};

const buffer = new BufferView(
  "buffer/Judge.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: show learning text + judge known, KNOWN: reversed"),
      gameplay: v.string({ default: "visual" }).desc("visual: text only, audio: text + audio, audio-only: audio + translation only"),
      speed: v.object({
        rate: v.string().desc("Preset: FAST (1500ms base), NORMAL (2500ms), SLOW (3500ms)").optional(),
        base: v.number().desc("Base time in ms. Overrides preset base. With multiplier=0, acts as absolute time.").optional(),
        multiplier: v.number({ default: 0 }).desc("Extra ms per character of shown text. 0 = base is absolute."),
      }).desc("Per-item timing. Computed as base + shown.length × multiplier.").optional(),
      items: v.array(
        v.object({
          target: v.number().desc("Index into literals — the literal being tested"),
          shown: v.string().desc("Translation text displayed — may be correct or a distractor's"),
          correct: v.boolean().desc("Whether shown text is the real translation"),
          distractor: v.number().desc("Index into literals — source of the wrong translation").optional(),
        }),
        { description: "Sequence of judgments. Component works through the list." },
      ),
    },
  }),
);

const emitter = new Vector().open("/literal", async (ctx) => {
  const target = ctx.input.literal;
  const recall = ctx.input.recall ?? "LEARNING";
  const t = target.trait?.TRANSLATED;
  const targetText = recall === "LEARNING" ? t?.known : t?.learning;

  const pool = ctx.input.distractors ?? await ctx.daemon.entities.literal.feed({ user: ctx.user.id, take: 1, blacklist: ctx.input.blacklist });
  const distractor = pool[0];
  const d = distractor?.trait?.TRANSLATED;
  const distractorText = recall === "LEARNING" ? d?.known : d?.learning;

  const coinFlip = Math.random() > 0.5;
  const canDistract = distractor && distractorText && distractorText !== targetText;
  const correct = coinFlip || !canDistract;

  return ctx.mode.buffer({
    data: {
      recall,
      gameplay: ctx.input.gameplay ?? "visual",
      speed: ctx.input.speed ?? null,
      items: [{
        target: 0,
        shown: correct ? targetText : distractorText,
        correct,
        distractor: correct ? undefined : 1,
      }],
    },
    literals: canDistract && !correct ? [target, distractor] : [target],
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
