import { shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
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

//@beef i think it might make sense to isolate some of the middlewares into
//@beef ... shards.hal.["xyz"]() which would become our source of truth for cohesion in turn, hallucination etc implementation. nifty.

const normalizing = async (ctx, next) => {
  ctx.input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {});
  await next();
};

const claiming = async (ctx, next) => {
  ctx.thread = ctx.input.thread
    ? await ctx.daemon.entities.thread.findOneOrFail({ id: ctx.input.thread })
    : null;
  ctx.user ??= ctx.thread?.user ?? null;
  ctx.intelligent = v.thread.trait(ctx.thread, "INTELLIGENT");
  ctx.vocal = v.thread.trait(ctx.thread, "VOCAL");
  await next();
};

const activating = async (ctx, next) => {
  if (!ctx.input.controller) {
    ctx.activity = await ctx.daemon.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread?.id ?? null });
  }
  ctx.controller = ctx.input.controller ?? ctx.activity.controller;
  await next();
};

const requesting = async (ctx, next) => {
  const { system, prompt, turns, output, tune, config } = ctx.input;
  ctx.hallucination = {
    controller: ctx.controller,
    policy: {
      ...config,
      ...(ctx.intelligent.tune && { tune: ctx.intelligent.tune }),
      ...(ctx.intelligent.rounds && { rounds: ctx.intelligent.rounds }),
      ...(tune && { tune }),
    },
    ...(ctx.intelligent.effort && { settings: { effort: ctx.intelligent.effort } }),
    system: typeof system === "string" ? { system } : { ...system },
    turns: turns ?? (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
    tools: arming(ctx),
    ...(output && { output: { schema: output } }),
  };
  await next();
};

const arming = (ctx) => {
  const armed = new Vector()
    .slurp(skills.entity.entity)
    .slurp(skills.buffer.buffer)
    .slurp(skills.thread.thread)
    .slurp(skills.mode.mode)
    .slurp(paladin.skills.fs.fs)
    .slurp(paladin.skills.shell.shell);
  for (const [slug, service] of Object.entries(ctx.daemon.services ?? {})) {
    if (service.tools) {
      armed.branch(`/service/${slug}`).use(shard.context.bind("service", service)).slurp(service.tools);
    }
  }
  if (ctx.daemon.domain?.tools) armed.branch(ctx.daemon.domain.manifest.slug).slurp(ctx.daemon.domain.tools);
  if (ctx.mode.tools) armed.slurp(ctx.mode.tools);
  if (ctx.mode.generator?.tools) armed.branch("/generator").slurp(ctx.mode.generator.tools);
  for (const [name, supplied] of Object.entries(ctx.input.tools ?? {})) {
    const { execute, ...edge } = typeof supplied === "function" ? { execute: supplied } : supplied;
    armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
  }
  armed.use(shard.context.bind("daemon", ctx.daemon));
  armed.use(shard.context.bind("mode", ctx.mode));
  if (ctx.user) armed.use(shard.context.bind("user", ctx.user)); //@beef both nonoptional in near future
  if (ctx.input.thread) armed.use(shard.context.bind("thread", ctx.input.thread));
  return armed;
};

const chaining = async (ctx, next) => {
  ctx.hallucination.turns = await ctx.daemon.entities.turn.history({ thread: ctx.input.thread });
  ctx.turn = await ctx.daemon.entities.turn.chain({
    id: ctx.input.id,
    role: "user",
    parts: ctx.input.parts,
    parent: ctx.hallucination.turns.at(-1) ?? null,
    thread: ctx.input.thread,
    mode: ctx.mode.id,
  });
  ctx.hallucination.turns.push(ctx.turn);
  if (ctx.activity) await ctx.daemon.entities.activity.updateOne({ id: ctx.activity.id }, { turn: ctx.turn.id });
  await next();
};

const persisting = async (ctx, next) => {
  await next();
  if (ctx.output?.[Symbol.asyncIterator]) ctx.output = recording(ctx, ctx.output);
  else if (ctx.output?.turns) await appending(ctx, ctx.output.turns);
};

async function* recording(ctx, packets) {
  const em = ctx.daemon.entities.em.fork();
  let folded = null;
  let parent = em.getReference(TurnEntity, ctx.turn.id);
  let persisted = 0;
  try {
    for await (const packet of packets) {
      folded = soma.transcript(folded, packet);
      for (const turn of folded.turns.slice(persisted)) {
        parent = em.create(TurnEntity, {
          role: turn.role,
          parts: turn.parts,
          meta: turn.meta,
          parent,
          thread: ctx.thread?.id,
          mode: ctx.mode.id,
        });
      }
      persisted = folded.turns.length;
      yield packet;
    }
    await em.flush();
  } catch (error) {
    em.clear();
    throw error;
  }
}

const appending = async (ctx, turns) => {
  let parent = ctx.turn;
  for (const turn of turns) {
    parent = await ctx.daemon.entities.turn.chain({
      role: turn.role,
      parts: turn.parts,
      meta: turn.meta,
      parent,
      thread: ctx.input.thread,
      mode: ctx.mode.id,
    });
  }
};

const summarizing = async (ctx, next) => {
  if (ctx.thread) {
    ctx.hallucination.policy.cache = { marks: [...Object.keys(ctx.hallucination.system).slice(-1), "tools"] };
    ctx.hallucination.system.thread = await skills.thread.summary(ctx);
  }
  await next();
};

export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");

  //@beef thread and user soon required.
  const harness = new Vector()
    .use(shard.context.bind("daemon", daemon))
    .use(shard.context.bind("mode", mode))
    .use(normalizing)
    .use(claiming)
    .use(activating)
    .use(requesting);

  harness
    .branch("/verbatim")
    .open(
      { nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any },
      shard.hal.verbatim({ polish: POLISH, tune: "fast" }),
    );

  harness.branch("/dialogue").use(chaining).use(persisting);

  if (daemon.domain?.harness) harness.slurp(daemon.domain.harness);
  if (mode.module.harness) harness.slurp(mode.module.harness);

  harness.use(summarizing);

  for (const type of ["dialogue", "object"]) {
    harness
      .branch(type)
      .open("render", (ctx) => ctx.daemon.cortex.hallucinate[type].render(ctx.hallucination))
      .open({ nature: "stream", yields: Packet.Response }, (ctx) =>
        ctx.daemon.cortex.hallucinate[type].stream(ctx.hallucination),
      );
  }

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness").slurp(harness);
  };
};
