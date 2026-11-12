import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";
import * as shard from "../../shard/index.js";

const Tiered = v.object({ tier: v.primitives.hallucination.Tier.desc('A tier. Example: "fast"') });
const Effortful = v.object({ effort: v.enum(belt.harnessed.EFFORTS).desc('Reasoning effort. Example: "high"') });
const UNPINNED = { provider: null, id: null };
const Tuned = v.object({
  intelligence: v.number({ minimum: 0, maximum: 1 }).desc("Raw capability, 1 = strongest. Example: 0.4"),
  speed: v.number({ minimum: 0, maximum: 1 }).desc("Inverse latency, 1 = fastest. Example: 0.6"),
  thrift: v.number({ minimum: 0, maximum: 1 }).desc("Cost economy, 1 = cheapest. Example: 0.6"),
});
const Rounded =v.object({ rounds: v.integer({ minimum: 1, maximum: 100 }).desc("The round budget. Example: 12") });

const Referenced = v.object({
  references: v
    .array(v.string(), { minItems: 1 })
    .desc('One or many references. Example: ["/runtime/runtime/mode/harness/runtime/fs"]'),
});

const referenced = (signal) => belt.input.cast(Referenced, { ...signal, body: [signal.body.map((datum) => String(datum))] });

const written = (nature, route) => async (ctx) => {
  const { references } = referenced(ctx.signal);
  const thread = ctx.terminal.thread;
  if (belt.harness.unchanged(thread, nature, references)) {
    throw new Error(`${nature}: already so: ${references.join(" · ")}`);
  }
  const answer = await route(thread.mode.harness)({ thread: thread.id, references });
  if (answer.missed.length === references.length) {
    throw new Error(`${nature}: matches nothing: ${answer.missed.join(" · ")}`);
  }
};

const MODEL = {
  nature: "/model",
  valence:
    "pin the seated thread's model — HARNESSED.provider · id; words that narrow to one pin it, " +
    "else the repl narrows the models; /tier unpins. Example: /model openrouter openai/gpt-5",
};

const minded = (ctx) =>
  ctx.terminal.thread.mode === null || ctx.terminal.thread.mode.daemon === null
    ? ctx.client.runtime
    : ctx.terminal.thread.mode.daemon;

const models = (ctx) =>
  minded(ctx)
    .cortex.find({ type: "dialogue", via: "stream" })
    .map((model) => `${model.provider} ${model.id}`);

export const harness = new Vector()
  .open(
    { nature: "/tier", valence: "the seated thread's model tier — HARNESSED.tier. Example: /tier fast", input: Tiered, chord: "leader/h/t" },
    async (ctx) => {
      const HARNESSED = belt.input.cast(Tiered, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne(
        { id: ctx.terminal.thread.id },
        traits.patch(ctx.terminal.thread, { HARNESSED: { ...UNPINNED, ...HARNESSED, tune: minded(ctx).cortex.tiers[HARNESSED.tier] } }),
      );
      return { HARNESSED };
    },
  )
  .open(
    {
      nature: "/tune",
      rank: "hidden",
      valence: "the seated thread's point in tune-space — HARNESSED.tune. Example: /tune 0.4 0.6 0.6",
      input: Tuned,
    },
    async (ctx) => {
      const tuned = belt.input.cast(Tuned, ctx.signal);
      const HARNESSED = { tune: [tuned.intelligence, tuned.speed, tuned.thrift] };
      await ctx.client.runtime.entities.thread.updateOne(
        { id: ctx.terminal.thread.id },
        traits.patch(ctx.terminal.thread, { HARNESSED }),
      );
      return { HARNESSED };
    },
  )
  .open(
    { nature: "/effort", valence: "the seated thread's reasoning effort — HARNESSED.effort. Example: /effort high", input: Effortful, chord: "leader/h/e" },
    async (ctx) => {
      const HARNESSED = belt.input.cast(Effortful, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { HARNESSED }));
      return { HARNESSED };
    },
  )
  .open(
    { nature: "/rounds", rank: "hidden", valence: "the seated thread's round budget — HARNESSED.rounds. Example: /rounds 12", input: Rounded, chord: "leader/h/r" },
    async (ctx) => {
      const HARNESSED = belt.input.cast(Rounded, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { HARNESSED }));
      return { HARNESSED };
    },
  );

harness
  .branch(MODEL)
  .use(shard.chooser.narrowing(MODEL, models))
  .do(async (ctx) => {
    const words = ctx.signal.body.map((datum) => String(datum));
    const [provider, id] = belt.catalog.narrowed(models(ctx), words)[0].split(" ");
    const HARNESSED = { provider, id };
    await ctx.client.runtime.entities.thread.updateOne(
      { id: ctx.terminal.thread.id },
      traits.patch(ctx.terminal.thread, { HARNESSED }),
    );
    return { HARNESSED };
  });

harness
  .open(
    {
      nature: "/tool/load",
      valence:
        "load tools into the seated thread — TOOLED eager, through the model's own tool_load; " +
        "no turn, nothing printed. " +
        "Example: /tool/load /runtime/runtime/mode/harness/runtime/fs",
      input: Referenced,
      chord: "leader/h/l",
    },
    written("/tool/load", (held) => held.tool.load),
  )
  .open(
    {
      nature: "/tool/preload",
      valence:
        "list tools on the seated thread without loading them — TOOLED lazy. " +
        "Example: /tool/preload /daemon/education/mode/tactic/harvest",
      input: Referenced,
      chord: "leader/h/p",
    },
    written("/tool/preload", (held) => held.tool.preload),
  )
  .open(
    {
      nature: "/tool/unload",
      valence:
        "take tools out of the seated thread — TOOLED none wherever a parent key " +
        "or the mode's default carries them. " +
        "Example: /tool/unload /runtime/runtime/mode/harness/runtime/fs",
      input: Referenced,
      chord: "leader/h/u",
    },
    written("/tool/unload", (held) => held.tool.unload),
  )
  .open(
    {
      nature: "/tool/reset",
      rank: "hidden",
      valence:
        "drop the seated thread's own TOOLED key — back to what the mode declares. " +
        "Example: /tool/reset /runtime/runtime/mode/harness/runtime/fs",
      input: Referenced,
    },
    written("/tool/reset", (held) => held.tool.reset),
  )
  .open(
    {
      nature: "/primer/load",
      valence:
        "load primer sections into the seated thread — PRIMED eager, in the system prompt from the next request. " +
        "Example: /primer/load /daemon/education/mode/tactic/harvest/archivist",
      input: Referenced,
      chord: "leader/h/m",
    },
    written("/primer/load", (held) => held.primer.load),
  )
  .open(
    {
      nature: "/primer/preload",
      valence:
        "list primer sections on the seated thread without loading them — PRIMED lazy, " +
        "named in the system prompt. " +
        "Example: /primer/preload /runtime/runtime/mode/harness/runtime/entity",
      input: Referenced,
    },
    written("/primer/preload", (held) => held.primer.preload),
  )
  .open(
    {
      nature: "/primer/unload",
      valence:
        "take primer sections out of the seated thread — PRIMED none. " +
        "Example: /primer/unload /runtime/runtime/mode/harness/runtime/entity",
      input: Referenced,
    },
    written("/primer/unload", (held) => held.primer.unload),
  )
  .open(
    {
      nature: "/primer/reset",
      rank: "hidden",
      valence:
        "drop the seated thread's own PRIMED key — back to what the mode declares. " +
        "Example: /primer/reset /runtime/runtime/mode/harness/runtime",
      input: Referenced,
    },
    written("/primer/reset", (held) => held.primer.reset),
  );
