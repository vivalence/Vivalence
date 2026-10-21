import { contexts, fromm, shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { v7 } from "uuid";
import { TurnEntity } from "@vivalence/runtime";
import * as tools from "../../../gestalten/tools/index.js";

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
  ctx.thread = await ctx.entities.thread.findOneOrFail({ id: ctx.input.thread });
  ctx.terminal = ctx.input.terminal
    ? await ctx.entities.terminal.findOneOrFail({ id: ctx.input.terminal, thread: ctx.thread })
    : null;
  ctx.user ??= ctx.thread.user;
  ctx.intelligent = ctx.thread.traits.includes("INTELLIGENT") ? ctx.thread.trait.INTELLIGENT : null;
  ctx.vocal = ctx.thread.traits.includes("VOCAL") ? ctx.thread.trait.VOCAL : null;
  await next();
};

const activating = async (ctx, next) => {
  if (!ctx.input.controller) {
    ctx.activity = await ctx.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread.id });
  }
  ctx.controller = ctx.input.controller ?? ctx.activity.controller;
  await next();
};

const siblings = (ctx) =>
  fromm.modes(ctx.modes).flat.filter((sibling) => sibling !== ctx.mode && sibling.manifest.type !== "domain" && sibling.primer);

const priming = (ctx) => {
  const primer = new Vector();
  if (ctx.mode.primer) primer.graft(ctx.mode.primer);
  if (ctx.domain?.primer) primer.branch(ctx.domain.manifest.slug).graft(ctx.domain.primer);
  if (ctx.mode.implements("AGENTIC"))
    for (const sibling of siblings(ctx)) primer.branch({ nature: sibling.manifest.slug, load: "lazy" }).graft(sibling.primer);
  if (ctx.input.system) for (const [nature, effect] of Object.entries(ctx.input.system)) primer.open(nature, effect);
  return primer;
};

const requesting = async (ctx, next) => {
  const { prompt, turns, output, tune, config } = ctx.input;
  const primer = priming(ctx);
  ctx.hallucination = {
    controller: ctx.controller,
    policy: {
      ...config,
      ...(ctx.intelligent !== null && ctx.intelligent.tune && { tune: ctx.intelligent.tune }),
      ...(ctx.intelligent !== null && ctx.intelligent.rounds && { rounds: ctx.intelligent.rounds }),
      ...(tune && { tune }),
    },
    ...(ctx.intelligent !== null && ctx.intelligent.effort && { settings: { effort: ctx.intelligent.effort } }),
    primer,
    turns: turns ?? (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
    tools: await arming(ctx, primer),
    ...(output && { output: { schema: output } }),
  };
  await next();
};

const arming = async (ctx, primer) => {
  const armed = new Vector()
    .graft(tools.entity.entity)
    .graft(tools.buffer.buffer)
    .graft(tools.thread.thread)
    .graft(tools.mode.mode)
    .graft(paladin.tools.fs.fs)
    .graft(paladin.tools.shell.shell);
  for (const [slug, provider] of Object.entries(ctx.providers ?? {})) {
    if (provider.tools) {
      armed.branch(`/service/${slug}`).use(shard.context.bind("service", provider)).graft(provider.tools);
    }
  }
  if (ctx.domain?.tools) armed.branch(ctx.domain.manifest.slug, ctx.domain.tools);
  if (ctx.mode.tools) armed.graft(ctx.mode.tools);
  if (ctx.mode.generator?.tools) armed.graft(ctx.mode.generator.tools);
  if (ctx.mode.looping) armed.branch("/repl").graft(await ctx.mode.looping(ctx));
  if (shape.primer.lazy(primer).length) armed.graft(tools.primer.primer);
  for (const [name, supplied] of Object.entries(ctx.input.tools ?? {})) {
    const { execute, ...edge } = typeof supplied === "function" ? { execute: supplied } : supplied;
    armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
  }
  armed.use(shard.context.spread(contexts.host, ctx));
  armed.use(shard.context.bind("mode", ctx.mode));
  armed.use(shard.context.bind("primer", primer));
  if (ctx.user) armed.use(shard.context.bind("user", ctx.user)); //@beef both nonoptional in near future
  armed.use(shard.context.bind("thread", ctx.input.thread));
  return armed;
};

const chaining = async (ctx, next) => {
  ctx.hallucination.turns = await ctx.entities.turn.history({ thread: ctx.input.thread });
  ctx.turn = await ctx.entities.turn.chain({
    id: ctx.input.turn,
    role: "user",
    parts: ctx.input.parts,
    parent: ctx.hallucination.turns.at(-1) ?? null,
    thread: ctx.input.thread,
    mode: ctx.mode.id,
  });
  ctx.hallucination.turns.push(ctx.turn);
  if (ctx.activity) await ctx.entities.activity.updateOne({ id: ctx.activity.id }, { turn: ctx.turn.id });
  await next();
};

const persisting = async (ctx, next) => {
  await next();
  if (ctx.output?.[Symbol.asyncIterator]) ctx.output = recording(ctx, ctx.output);
  else if (ctx.output?.turns) await appending(ctx, ctx.output.turns);
};

const OPENING = ["/turn/open", "/turn/full"];
const SEALING = ["/turn/close", "/turn/full"];

async function* recording(ctx, packets) {
  const em = ctx.entities.em.fork();
  let folded = null;
  let parent = em.getReference(TurnEntity, ctx.turn.id);
  try {
    for await (const packet of packets) {
      if (OPENING.includes(packet.event)) {
        parent = em.create(TurnEntity, {
          id: v7(),
          role: packet.turn.role,
          parts: [],
          parent,
          thread: ctx.thread.id,
          mode: ctx.mode.id,
        });
        packet.turn = { ...packet.turn, id: parent.id };
      }
      folded = soma.transcript(folded, packet);
      if (SEALING.includes(packet.event)) {
        Object.assign(parent, { parts: folded.turns.at(-1).parts, meta: folded.turns.at(-1).meta });
        await em.flush();
      }
      yield packet;
    }
    if (folded?.open) {
      Object.assign(parent, { parts: folded.open.parts, meta: folded.meta });
      folded = { ...folded, turns: [...folded.turns, folded.open], open: null };
    }
    parent = verdict(ctx, em, folded, parent);
    await em.flush();
  } catch (error) {
    em.clear();
    throw error;
  }
}

const verdict = (ctx, em, folded, parent) => {
  const close = folded?.meta;
  if (!close || close.state === "complete") return parent;
  const last = folded.turns.at(-1);
  if (last?.role === "assistant" && last.parts.length) return parent;
  if (last?.role === "assistant") {
    parent.meta = { ...last.meta, ...close };
    return parent;
  }
  return em.create(TurnEntity, {
    role: "assistant",
    parts: [],
    meta: close,
    parent,
    thread: ctx.thread.id,
    mode: ctx.mode.id,
  });
};

const appending = async (ctx, turns) => {
  let parent = ctx.turn;
  for (const turn of turns) {
    parent = await ctx.entities.turn.chain({
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
  ctx.hallucination.primer.open("thread", await tools.thread.summary(ctx));
  await next();
};

const marking = (system) => {
  const keys = Object.keys(system);
  return [...keys.slice(0, keys.indexOf("thread")).slice(-1), "tools"];
};

const primed = async (ctx) => {
  const { primer, ...hallucination } = ctx.hallucination;
  const system = await shape.primer.load(primer, ctx);
  hallucination.policy.cache = { marks: marking(system) };
  return { ...hallucination, system };
};

export const HARNESSED = (mode, context) => {
  if (!context.cortex) throw new Error(`HARNESSED: ${context.reference.absolute} has no cortex`);

  //@beef thread and user soon required.
  const harness = new Vector()
    .use(shard.context.spread(contexts.host, context))
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
  harness.branch("/dialogue").open({ nature: "render", input: v.primitives.harness.Request }, async (ctx) => ctx.cortex.hallucinate.dialogue.render(await primed(ctx)));
  harness.branch("/dialogue").open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.dialogue.stream(await primed(ctx)));
  harness.branch("/object").open({ nature: "render", input: v.primitives.harness.Request }, async (ctx) => ctx.cortex.hallucinate.object.render(await primed(ctx)));
  harness.branch("/object").open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.object.stream(await primed(ctx)));

  if (context.domain?.harness) harness.graft(context.domain.harness);
  if (mode.module.harness) harness.graft(mode.module.harness);

  harness.use(summarizing);



  harness
    .branch("choice")
    .open("render", (ctx) =>
      ctx.cortex.hallucinate.choice.render({
        controller: ctx.controller,
        policy: ctx.hallucination.policy,
        system: ctx.input.system,
        questions: ctx.input.questions,
      }),
    );

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness", harness);
  };
};
