import { shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import * as skills from "../skills/index.js";

const { Packet, Verbatim, Audio } = v.primitives.hallucination;

const POLISH = [
  "You repair the formatting of a machine transcription of dictated speech.",
  "Fix punctuation and casing; normalize numbers, dates and units the way a careful typist would.",
  "Preserve every word as spoken, in whatever language it was spoken — never translate, never correct grammar or word choice, never add, remove or reorder content, never answer or comment.",
  "Output only the corrected transcript.",
].join(" ");

//@beef i think it might make sense to isolate some of the middlewares into
// ... shards.hal.["xyz"]() which would become our source of truth for cohesion in turn, hallucination etc implementation. nifty.

// the harness ASSEMBLES a Request record on ctx.hallucination — the projection of
// the thread — and spawns hal at the terminal leaf. Middlewares (domain, mode)
// write keyed sections and tools onto the record; nothing mutates a hallucination.
export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");

  const harness = new Vector();

  harness.use(shard.context.bind("daemon", daemon));
  harness.use(shard.context.bind("mode", mode));

  harness.use(async (ctx, next) => {
    const input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {});
    const { system, prompt, turns, output, tune, config } = input;

    // thread.trait.INTELLIGENT — claim-gated, validated, projected field-by-field.
    // Precedence: invocation > thread > mode default (modes default with ??=).
    const row = input.thread ? await daemon.entities.thread.findOne({ id: input.thread }) : null;
    const iq = shard.trait.claimed(row, "INTELLIGENT", v.entities.INTELLIGENT);
    ctx.vocal = shard.trait.claimed(row, "VOCAL", v.entities.VOCAL);

    // keyed layers, later wins: ① daemon skills → ② paladin skills → ③ domain tools → ④ mode tools
    const armed = new Vector();
    if (daemon.entities) armed.slurp(skills.entity);
    if (daemon.entities?.buffer) armed.slurp(skills.buffer);
    if (daemon.entities?.thread) armed.slurp(skills.thread);
    if (mode.module?.mount?.dirname) {
      armed.use(shard.context.bind("root", mode.module.mount.dirname));
      armed.slurp(paladin.skills.fs);
      armed.slurp(paladin.skills.shell);
    }
    for (const [slug, service] of Object.entries(daemon.services ?? {})) {
      if (!service.tools) continue;
      const mounted = armed.branch(`/service/${slug}`);
      mounted.use(shard.context.bind("service", service));
      mounted.slurp(service.tools);
    }
    if (daemon.domain?.tools) {
      armed.branch("/" + daemon.domain.manifest.slug).slurp(daemon.domain.tools);
    }
    if (mode.tools) armed.slurp(mode.tools);
    if (input.tools) {
      for (const [name, supplied] of Object.entries(input.tools)) {
        const { execute, ...edge } = typeof supplied === "function"
          ? { execute: supplied }
          : supplied;
        armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
      }
    }
    armed.use(shard.context.bind("daemon", daemon));
    armed.use(shard.context.bind("mode", mode));
    if (ctx.user) armed.use(shard.context.bind("user", ctx.user));
    if (input.thread) armed.use(shard.context.bind("thread", input.thread));

    ctx.hallucination = {
      policy: {
        ...config,
        ...(iq.tune && { tune: iq.tune }),
        ...(iq.rounds && { rounds: iq.rounds }),
        ...(tune && { tune }),
      },
      ...(iq.effort && { settings: { effort: iq.effort } }),
      system: typeof system === "string" ? { system } : { ...system },
      turns: turns ??
        (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
      tools: armed,
      ...(output && { output: { schema: output } }),
    };
    ctx.input = input;
    await next();
  });

  harness
    .branch("/verbatim")
    .open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, shard.hal.verbatim({ polish: POLISH, tune: "fast" }));

  // DIALOGUE
  harness
    .branch("/dialogue")
    // .use(shard.hal.voice()) @@beef not yet
    .use(async (ctx, next) => {
      const history = await ctx.daemon.entities.turn.history({ thread: ctx.input.thread });
      ctx.turn = await ctx.daemon.entities.turn.chain({
        id: ctx.input.id, // optional — client-minted for identity reconciliation; repo mints if absent
        role: "user",
        parts: ctx.input.parts,
        parent: history.at(-1) ?? null,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
      ctx.hallucination.turns = [...history, ctx.turn];
      await next();
    })
    .use(async (ctx, next) => {
      await next();

      if (ctx.output?.[Symbol.asyncIterator]) {
        const source = ctx.output;
        let folded = null;
        let parent = ctx.turn;
        let persisted = 0;
        const created = [];
        ctx.output = (async function* () {
          try {
            for await (const record of source) {
              folded = soma.transcript(folded, record);
              while (persisted < folded.turns.length) {
                const sealed = folded.turns[persisted++];
                parent = ctx.daemon.entities.turn.create({
                  role: sealed.role,
                  parts: sealed.parts,
                  meta: sealed.meta,
                  parent,
                  thread: ctx.input.thread,
                  mode: ctx.mode.id,
                });
                created.push(parent);
              }
              yield record;
            }
            await ctx.daemon.entities.em.flush();
          } catch (error) {
            for (const entity of created) ctx.daemon.entities.em.remove(entity);
            throw error;
          }
        })();
      } else if (ctx.output?.turns) {
        let parent = ctx.turn;
        for (const sealed of ctx.output.turns) {
          parent = await ctx.daemon.entities.turn.chain({
            role: sealed.role,
            parts: sealed.parts,
            meta: sealed.meta,
            parent,
            thread: ctx.input.thread,
            mode: ctx.mode.id,
          });
        }
      }
    });

  if (daemon.domain?.harness) harness.slurp(daemon.domain.harness);
  if (mode.module.harness) harness.slurp(mode.module.harness);

  for (const type of ["dialogue", "object"]) {
    harness
      .branch(type)
      .open("render", (ctx) => daemon.cortex.hallucinate[type].render(ctx.hallucination))
      .open(
        { nature: "stream", yields: Packet.Response },
        (ctx) => daemon.cortex.hallucinate[type].stream(ctx.hallucination),
      );
  }

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness").slurp(harness);
  };
};
