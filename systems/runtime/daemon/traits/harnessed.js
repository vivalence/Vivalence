import {
  shape,
  shard,
  soma,
  steer,
  ToolCall,
  v,
  Vector,
} from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { TurnEntity } from "@vivalence/runtime";
import * as skills from "../skills/index.js";

const { Packet, Verbatim, Audio } = v.primitives.hallucination;

const POLISH = [
  "You repair the formatting of a machine transcription of dictated speech.",
  "Fix punctuation and casing; normalize numbers, dates and units the way a careful typist would.",
  "Preserve every word as spoken, in whatever language it was spoken — never translate, never correct grammar or word choice, never add, remove or reorder content, never answer or comment.",
  "Output only the corrected transcript.",
].join(" ");

const named = (row) => row.trait?.LABELED?.name ?? "unlabeled";
const shown = (data, width = 320) => {
  const text = JSON.stringify(data ?? {});
  return text.length <= width ? text : `${text.slice(0, width)}… keys ${Object.keys(data).join(" ")}`;
};

const standing = async (ctx, row) => {
  const modes = new Map(
    ctx.daemon.flatmodes().map((mode) => [mode.id, `${mode.manifest.type}/${mode.manifest.slug}`]),
  );
  const buffers = await ctx.daemon.entities.buffer.find({ thread: row.id }, { orderBy: { index: "asc" } });
  const placed = skills.mode.places(ctx.mode);
  return [
    `[Thread ${row.id}] · ${named(row)} · phase ${row.phase} · buffers minted ${row.counter} · ` +
    `traits ${row.traits.join(" ") || "none"} · user ${row.user.id}`,
    `[Mode ${modes.get(ctx.mode.id)}] ${ctx.mode.manifest.name ?? ctx.mode.manifest.slug} · ` +
    `traits ${(ctx.mode.manifest.traits ?? []).join(" ") || "none"}` +
    (placed ? ` · ${placed}` : ""),
    `[Buffers on this thread] · ${buffers.length} · rows: index · id · label · mode · status · data · view — ` +
    `these ids are what buffer_update and buffer_label take, never a document slug; ` +
    `entity_find { entity: "buffer", where: { thread: "${row.id}" }, fields: "full" } for whole rows`,
    ...buffers.map((buffer) =>
      `${buffer.index} · ${buffer.id} · ${named(buffer)} · ${modes.get(buffer.mode.id)} · ${buffer.status} · ` +
      `${shown(buffer.data)}` +
      (buffer.view?.hash ? ` · view ${buffer.view.hash}` : "")
    ),
  ].join("\n");
};

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
    const input = typeof ctx.input === "string"
      ? { prompt: ctx.input }
      : (ctx.input ?? {});
    const { system, prompt, turns, output, tune, config } = input;

    // thread.trait.INTELLIGENT — claim-gated, validated, projected field-by-field.
    // Precedence: invocation > thread > mode default (modes default with ??=).
    const row = input.thread
      ? await daemon.entities.thread.findOne({ id: input.thread })
      : null;
    const iq = shard.trait.claimed(row, "INTELLIGENT", v.entities.INTELLIGENT);
    ctx.vocal = shard.trait.claimed(row, "VOCAL", v.entities.VOCAL);

    // keyed layers, later wins: ① daemon skills → ② paladin skills → ③ domain tools → ④ mode tools
    const armed = new Vector()
      .slurp(skills.entity.entity)
      .slurp(skills.buffer.buffer)
      .slurp(skills.thread.thread);
    armed.slurp(skills.mode.mode).slurp(paladin.skills.fs.fs).slurp(paladin.skills.shell.shell);
    for (const [slug, service] of Object.entries(daemon.services ?? {})) {
      if (!service.tools) continue;
      const mounted = armed.branch(`/service/${slug}`);
      mounted.use(shard.context.bind("service", service));
      mounted.slurp(service.tools);
    }
    if (daemon.domain?.tools) {
      armed.branch("/" + daemon.domain.manifest.slug).slurp(
        daemon.domain.tools,
      );
    }
    if (mode.tools) armed.slurp(mode.tools);
    if (mode.generator?.tools) armed.branch("/generator").slurp(mode.generator.tools);
    if (input.tools) {
      for (const [name, supplied] of Object.entries(input.tools)) {
        const { execute, ...edge } = typeof supplied === "function"
          ? { execute: supplied }
          : supplied;
        armed.open(
          { nature: new ToolCall(name).signal.pathname, ...edge },
          execute,
        );
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
        (prompt
          ? [{ role: "user", parts: [{ type: "text", text: prompt }] }]
          : []),
      tools: armed,
      ...(output && { output: { schema: output } }),
    };
    ctx.input = input;
    await next();
  });

  harness
    .branch("/verbatim")
    .open(
      { nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any },
      shard.hal.verbatim({ polish: POLISH, tune: "fast" }),
    );

  // DIALOGUE
  harness
    .branch("/dialogue")
    // .use(shard.hal.voice()) @@beef not yet
    .use(async (ctx, next) => {
      const history = await ctx.daemon.entities.turn.history({
        thread: ctx.input.thread,
      });
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
        // the response is ONE unit of work on its own em: a tool flushing the root em
        // mid-response cannot carry half a response out with it, and a kill persists none of it.
        const em = ctx.daemon.entities.em.fork();
        const thread = ctx.input.thread?.id ?? ctx.input.thread;
        let folded = null;
        let parent = em.getReference(TurnEntity, ctx.turn.id);
        let persisted = 0;
        ctx.output = (async function* () {
          try {
            for await (const record of source) {
              folded = soma.transcript(folded, record);
              while (persisted < folded.turns.length) {
                const sealed = folded.turns[persisted++];
                parent = em.create(TurnEntity, {
                  role: sealed.role,
                  parts: sealed.parts,
                  meta: sealed.meta,
                  parent,
                  thread,
                  mode: ctx.mode.id,
                });
              }
              yield record;
            }
            await em.flush();
          } catch (error) {
            em.clear();
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

  harness.use(async (ctx, next) => {
    if (ctx.input.thread) {
      const stable = Object.keys(ctx.hallucination.system).at(-1);
      const row = await ctx.daemon.entities.thread.findOneOrFail({ id: ctx.input.thread });
      ctx.hallucination.system.thread = await standing(ctx, row);
      ctx.hallucination.cache = { marks: [...(stable ? [stable] : []), "tools"] };
    }
    await next();
  });

  for (const type of ["dialogue", "object"]) {
    harness
      .branch(type)
      .open(
        "render",
        (ctx) => daemon.cortex.hallucinate[type].render(ctx.hallucination),
      )
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
