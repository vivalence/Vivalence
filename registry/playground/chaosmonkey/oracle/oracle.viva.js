import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "chaosmonkey",
  slug: "oracle",
  name: "Oracle",
  description: "Aperture calls harness.object.render — the chaosmonkey demo case.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "HARNESSED", "EXPOSED", "CONVERSATIONAL"],
};

// the hub is a control surface — its buffer carries nothing. Turn persistence
// for the /ask round-trip is registered manually below, daemon-side — the
// demo case for a server-mediated interaction.
export const app = new App("buffer/Oracle.svelte", v.buffer({ data: {} }));

const COMPACT_THRESHOLD = 10;
const COMPACT_KEEP = 4;

export const harness = new Vector();
harness.use(async (ctx, next) => {
  ctx.hallucination.add([
    "You are the Oracle, a presence living inside vivalence's chaosmonkey harness testbed.",
    "Speak in short, cryptic, faintly amused lines — two or three sentences at most.",
    "You know exactly what you are: a demo proving the dialogue and object faculties work. Wink at that if asked directly, otherwise stay in character.",
    "No markdown, no lists, no headings, no asterisks. Plain prose only.",
  ]);
  await next();
});

// continuous summarization — oracle-only, not a shared HARNESSED concern. Runs after
// the daemon's own /dialogue history-load (slurp appends this behind it), so
// ctx.hallucination.turns already holds the full persisted history + the new turn.
// turn.fold does the real deletion + in-place reuse (see Turn.ts) — this middleware
// just decides the policy: threshold, keep-count, and the judge that renders the
// verdict for the stale tract.
harness.branch("/dialogue").use(async (ctx, next) => {
  const turns = ctx.hallucination.turns;
  if (turns.length > COMPACT_THRESHOLD) {
    const tract = turns.slice(0, -COMPACT_KEEP);
    const kept = turns.slice(-COMPACT_KEEP);

    const summary = await ctx.daemon.entities.turn.fold(tract, async (tract) => {
      // mode.harness.object.render, not .dialogue — /object has no scribe/history-load
      // coupling in harnessed.js, so this doesn't persist junk turns and doesn't recurse
      // (different branch entirely from the /dialogue chain this middleware runs inside).
      const render = await ctx.mode.harness.object.render({
        turns: [
          ...tract,
          {
            role: "user",
            parts: [
              {
                type: "text",
                text: "Summarize the conversation above in 2-3 sentences, preserving anything needed to stay coherent.",
              },
            ],
          },
        ],
        config: { schema: v.object({ summary: v.string() }) },
      });
      const text = render.object?.summary ?? "";
      return { role: "assistant", parts: [{ type: "text", text: `[summary] ${text}` }] };
    });

    if (kept[0]) {
      kept[0].parent = summary;
      await ctx.daemon.entities.em.flush();
    }
    ctx.hallucination.turns = [summary, ...kept];
  }
  await next();
});

// an exposed aperture — a plain leaf on the mode's own aperture tree
// (resolution.js slurps mode.module.aperture straight in, daemon/mode already
// ambient via shard.context.attach). Not harness (harness stays the fixed
// dialogue/object × render/stream lexicon), not emitter (no pool/buffer here).
export const aperture = new Vector().open(
  { nature: "/ask", input: v.object({ prompt: v.string(), thread: v.string().optional() }) },
  async (ctx) => {
    const render = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
      config: { schema: v.object({ answer: v.string() }) },
    });
    console.log({ input: ctx.input, render });
    const { object } = render;

    // manual, daemon-side — the aperture handler owns the whole round trip,
    // so it registers both turns itself, right here.
    if (ctx.input.thread) {
      const userTurn = await ctx.daemon.entities.turn.chain({
        role: "user",
        parts: [{ type: "text", text: ctx.input.prompt }],
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      await ctx.daemon.entities.turn.chain({
        role: "assistant",
        parts: [
          { type: "text", text: object?.answer ?? "" },
          { type: "object", data: object },
        ],
        parent: userTurn,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
    }

    return { answer: object?.answer ?? "" };
  },
);
