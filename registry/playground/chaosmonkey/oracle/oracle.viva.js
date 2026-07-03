import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "chaosmonkey",
  slug: "oracle",
  name: "Oracle",
  description: "Aperture calls harness.object.render — the chaosmonkey demo case.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "HARNESSED", "EXPOSED"],
};

// the hub is a control surface — its buffer carries nothing, the ask/answer
// round-trip is ephemeral (AXIS 2 style: no turn/thread persistence).
export const app = new App("buffer/Oracle.svelte", v.buffer({ data: {} }));

// an exposed aperture — a plain leaf on the mode's own aperture tree
// (resolution.js slurps mode.module.aperture straight in, daemon/mode already
// ambient via shard.context.attach). Not harness (harness stays the fixed
// dialogue/object × render/stream lexicon), not emitter (no pool/buffer here).
export const aperture = new Vector().open(
  { nature: "/ask", input: v.object({ prompt: v.string() }) },
  async (ctx) => {
    const render = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
      config: { schema: v.object({ answer: v.string() }) },
    });
    console.log({ input: ctx.input, render });
    const { object } = render;
    return { answer: object?.answer ?? "" };
  },
);
