import { join } from "@std/path";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import paladin from "@vivalence/paladin";
import { belt, contexts, Controller, fromm, mime, shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { v7 } from "uuid";
import { TurnEntity } from "@vivalence/runtime";
import * as gestalten from "../../../gestalten/index.js";

const { Packet, Audio, REQUIRES } = v.primitives.hallucination;

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
  ctx.harnessed = ctx.thread.traits.includes("HARNESSED") ? ctx.thread.trait.HARNESSED : null;
  ctx.conversational = ctx.thread.trait.CONVERSATIONAL;
  await next();
};

const activating = async (ctx, next) => {
  if (!ctx.input.controller) {
    ctx.activity = await ctx.entities.activity.control(
      { user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread.id },
      new Controller({ stdout: ctx.mode.stdout.branch("hallucination") }),
    );
  }
  ctx.controller = ctx.input.controller ?? ctx.activity.controller;
  await next();
};

const own = (ctx) => gestalten.reference.narrow(ctx, gestalten.reference.home(ctx));

const priming = (ctx, place) => {
  const primer = new Vector();
  if (ctx.mode.primer) primer.branch(place).graft(ctx.mode.primer);
  if (ctx.domain?.primer) primer.branch(ctx.domain.manifest.slug).graft(ctx.domain.primer);
  if (ctx.input.system) for (const [nature, effect] of Object.entries(ctx.input.system)) primer.open(nature, effect);
  return primer;
};

const requesting = async (ctx, next) => {
  const { prompt, turns, output, provider, id, tier, tune, config } = ctx.input;
  ctx.hallucination = {
    controller: ctx.controller,
    policy: {
      ...config,
      ...(ctx.harnessed !== null && belt.object.pick(ctx.harnessed, ["provider", "id", "tier", "tune"])),
      ...(ctx.harnessed !== null && ctx.harnessed.rounds && { rounds: ctx.harnessed.rounds }),
      ...(provider && { provider }),
      ...(id && { id }),
      ...(tier && { tier }),
      ...(tune && { tune }),
    },
    ...(ctx.harnessed !== null && ctx.harnessed.effort && { settings: { effort: ctx.harnessed.effort } }),
    primer: priming(ctx, own(ctx)),
    turns: turns ?? (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
    tools: await arming(ctx),
    ...(output && { output: { schema: output } }),
  };
  await next();
};

const armory = (ctx, place) => {
  const tools = new Vector();
  for (const [slug, provider] of Object.entries(ctx.providers ?? {})) {
    if (provider.tools) {
      tools.branch(`/service/${slug}`).use(shard.context.bind("service", provider)).graft(provider.tools);
    }
  }
  if (ctx.domain?.tools) tools.branch(ctx.domain.manifest.slug, ctx.domain.tools);
  if (ctx.mode.tools) tools.branch(place).graft(ctx.mode.tools);
  return tools.graft(gestalten.tools.modes, gestalten.tools.tool, gestalten.tools.primer);
};

const arming = async (ctx) => {
  const tools = armory(ctx, own(ctx));
  if (ctx.mode.looping) tools.branch("/repl").graft(await ctx.mode.looping(ctx));
  for (const [name, supplied] of Object.entries(ctx.input.tools ?? {})) {
    const { execute, ...edge } = typeof supplied === "function" ? { execute: supplied } : supplied;
    tools.open({ nature: belt.hallucinate.signalOf(name).pathname, ...edge }, execute);
  }
  tools.use(shard.context.spread(contexts.modeDie, ctx));
  tools.use(shard.context.bind("mode", ctx.mode));
  if (ctx.user) tools.use(shard.context.bind("user", ctx.user)); //@beef both nonoptional in near future
  tools.use(shard.context.bind("thread", ctx.input.thread));
  return tools;
};

const Loading = v
  .object({
    thread: v.string().desc("The thread whose TOOLED · PRIMED the load writes."),
    references: v.array(v.string()).desc("One or many references; a branch loads its whole tree."),
  })
  .eg({ thread: "01a09010-13aa-778b-bce7-19c38f835337", references: ["/runtime/runtime/mode/harness/runtime/fs"] });

const depth = (reference) => gestalten.reference.natures(reference).length;

const delta = (trait) => Object.entries(trait).sort(([a], [b]) => depth(a) - depth(b));

const preloaded = (ctx) =>
  delta(ctx.thread.trait.TOOLED)
    .filter(([, load]) => load === "lazy")
    .flatMap(([reference]) => gestalten.reference.found(ctx, reference).flatMap(gestalten.reference.outline))
    .map((held) => `${held.reference}${held.valence ? ` — ${held.valence}` : ""}`);

const composing = (ctx) => {
  const { primer, tools } = ctx.hallucination;
  for (const [reference, load] of delta(ctx.thread.trait.PRIMED)) {
    if (load === "none") primer.trim(gestalten.reference.narrow(ctx, reference));
    else
      for (const entry of gestalten.reference.found(ctx, reference, (mode) => mode.primer))
        gestalten.reference.section(ctx, primer, entry, load);
  }
  for (const [reference, load] of delta(ctx.thread.trait.TOOLED)) {
    if (load === "eager")
      for (const entry of gestalten.reference.found(ctx, reference)) gestalten.reference.seat(ctx, tools, entry);
    if (load === "none") tools.trim(gestalten.reference.narrow(ctx, reference));
  }
  const listed = preloaded(ctx);
  if (listed.length) primer.open("preloaded", `Load on demand with tool_load { references }:\n${listed.join("\n")}`);
  tools.use(shard.context.bind("runtime", ctx.runtime));
  tools.use(shard.context.bind("tools", tools));
  tools.branch("/tool").use(shard.context.bind("thread", ctx.thread));
  tools.branch("/primer").use(shard.context.bind("thread", ctx.thread));
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

const attending = async (ctx, next) => {
  ctx.hallucination.turns = await ctx.entities.turn.history({ thread: ctx.input.thread });
  ctx.turn = ctx.hallucination.turns.at(-1) ?? null;
  ctx.hallucination = await primed(ctx);
  await next();
};

const persisting = async (ctx, next) => {
  await next();
  if (ctx.output?.[Symbol.asyncIterator]) ctx.output = recording(ctx, ctx.output);
  else if (ctx.output?.turns) await appending(ctx, ctx.output.turns);
};

const narrating = async (ctx, next) => {
  await next();
  ctx.output = narrated(ctx.controller.stdout, ctx.output);
};

const inline = (kind) => (file, bytes) => ({
  type: kind,
  mime: file.mime,
  data: encodeBase64(bytes),
  file: file.id,
});

const spelled = (file, bytes) => ({
  type: "text",
  text: new TextDecoder().decode(bytes),
  file: file.id,
});

const HANDED = [
  [(type) => type.startsWith("image/"), inline("image")],
  [(type) => type.startsWith("audio/"), inline("audio")],
  [(type) => type.startsWith("video/"), inline("video")],
  [(type) => type === "application/pdf", inline("document")],
  [(type) => type.startsWith("text/") || type === mime.json, spelled],
];

const handed = (ctx) => async (part) => {
  if (part.type !== "file") return part;
  const file = await ctx.entities.file.findOneOrFail({ id: part.file, threads: ctx.thread.id });
  const found = HANDED.find(([carries]) => carries(file.mime));
  if (!found) throw new Error(`[harness] no part carries '${file.mime}': ${file.path}`);
  return found[1](file, await paladin.read.bytes(file.mount));
};

const filed = (ctx) => async (part) => {
  if (!("mime" in part)) return part;
  const landed = await paladin.state.land(
    ctx.runtime.mountpoint,
    { path: join("files", part.type), mime: part.mime },
    new Blob([decodeBase64(part.data)]).stream(),
  );
  const file = await ctx.entities.file.upload({ ...landed, thread: ctx.thread.id });
  return { type: "file", file: file.id };
};

const swapped = (turns, swap) =>
  Promise.all(
    turns.map(async (turn) => ({
      role: turn.role,
      parts: await Promise.all(turn.parts.map(swap)),
      meta: turn.meta,
    })),
  );

const WHOLE = {
  "/part/full": async (packet, file) => ({ ...packet, part: await file(packet.part) }),
  "/turn/full": async (packet, file) => ({
    ...packet,
    turn: { ...packet.turn, parts: await Promise.all(packet.turn.parts.map(file)) },
  }),
};

async function* landing(ctx, packets) {
  for await (const packet of packets) {
    if (packet.event === "/part/open" && "mime" in packet.part)
      throw new Error(`[harness] bytes stream whole, as /part/full: got /part/open '${packet.part.type}'`);
    yield packet.event in WHOLE ? await WHOLE[packet.event](packet, filed(ctx)) : packet;
  }
}

const filing = async (ctx, next) => {
  ctx.hallucination.turns = await swapped(ctx.hallucination.turns, handed(ctx));
  await next();
  if (ctx.output[Symbol.asyncIterator]) ctx.output = landing(ctx, ctx.output);
  else if (ctx.output.turns) ctx.output.turns = await swapped(ctx.output.turns, filed(ctx));
};

const OPENING = ["/turn/open", "/turn/full"];
const SEALING = ["/turn/close", "/turn/full"];

const NARRATED = [
  [
    (packet) => packet.event === "/turn/open",
    (packet) => ({ opened: packet.turn.role, turn: packet.turn.id }),
  ],
  [
    (packet) => SEALING.includes(packet.event),
    (packet, call) => ({
      sealed: call.turns.at(-1).role,
      turn: call.turns.at(-1).id,
      state: call.turns.at(-1).meta?.state,
      parts: call.turns.at(-1).parts.map((part) => part.text ?? part.name ?? part.type),
    }),
  ],
  [
    (packet) => packet.event === "/audio/close",
    (packet, call, audio) => ({ spoken: audio, state: packet.audio.meta.state }),
  ],
];

async function* narrated(span, packets) {
  let call = null;
  let audio = 0;
  for await (const packet of packets) {
    call = soma.transcript(call, packet);
    if (packet.event === "/audio/packet") audio += 1;
    const found = NARRATED.find(([tells]) => tells(packet));
    if (found) span.log(found[1](packet, call, audio));
    if (packet.event === "/audio/close") audio = 0;
    yield packet;
  }
}

async function* recording(ctx, packets) {
  const em = ctx.entities.em.fork();
  let folded = null;
  let parent = ctx.turn === null ? null : em.getReference(TurnEntity, ctx.turn.id);
  try {
    for await (const packet of packets) {
      if (packet.event === "/part/full" && packet.turn) {
        const sealed = await em.findOneOrFail(TurnEntity, packet.turn);
        sealed.parts = sealed.parts.with(packet.index, packet.part);
        await em.flush();
      }
      if (OPENING.includes(packet.event)) {
        parent = em.create(TurnEntity, {
          id: packet.turn.id ?? v7(),
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

const marking = (system) => {
  const keys = Object.keys(system);
  const volatile = keys.indexOf("thread");
  return [...(volatile < 0 ? keys : keys.slice(0, volatile)).slice(-1), "tools"];
};

const resetting = (trait) => async (ctx) => {
  const keyed = (reference) => Object.hasOwn(ctx.thread.trait[trait], reference);
  const reset = ctx.input.references.filter(keyed);
  ctx.thread.trait[trait] = reset.reduce(belt.reference.reset, ctx.thread.trait[trait]);
  await ctx.entities.em.flush();
  return { reset, missed: ctx.input.references.filter((reference) => !reset.includes(reference)) };
};

const loading = (name) => async (ctx) => {
  composing(ctx);
  const call = new ToolCall(name);
  const answer = await steer.dispatch.invoke(ctx.hallucination.tools, call, steer.strategy.guarded)({
    references: ctx.input.references,
  });
  return answer.output;
};

const primed = async (ctx) => {
  composing(ctx);
  const { primer, ...hallucination } = ctx.hallucination;
  const system = await shape.primer.load(primer, ctx);
  hallucination.policy.cache = { marks: marking(system) };
  return { ...hallucination, system };
};

export const HARNESS = (mode, modeDie) => {
  if (!modeDie.cortex) throw new Error(`HARNESS: ${modeDie.reference.absolute} has no cortex`);

  //@beef thread and user soon required.
  const harness = new Vector()
    .use(shard.context.spread(contexts.modeDie, modeDie))
    .use(shard.context.bind("mode", mode))
    .use(normalizing)
    .use(claiming)
    .use(shard.datamap.bind(modeDie.entities.em, "thread", (ctx) => ({ thread: ctx.thread.id })))
    .use(activating)
    .use(requesting);

  for (const op of ["create", "update"])
    mode.twitch.open(`/before/thread/${op}`, (ctx) => {
      const thread = ctx.input.entity;
      if (thread.mode?.id !== mode.id || thread.traits.includes("HARNESSED")) return;
      const starter = { HARNESSED: mode.trait.HARNESSED ?? {} };
      Object.assign(thread, belt.traits.patch(thread, starter));
    });

  const streams = (type) => modeDie.cortex.find({ type, via: "stream" }).length > 0;

  if (streams("verbatim"))
    harness
      .branch("/verbatim")
      .open(
        { nature: "stream", feeds: Audio.Packet, yields: Packet.Response },
        shard.hal.verbatim({ polish: POLISH, tier: "fast" }),
      );

  if (REQUIRES.CONVERSATION.some((types) => types.every(streams)))
    harness
      .branch("/call")
      .use(attending)
      .use(narrating)
      .use(persisting)
      .open(
        { nature: "stream", feeds: v.union([Audio.Packet, Audio.Played]), yields: Packet.Call },
        shard.hal.call({ polish: POLISH, tier: "fast" }),
      );

  harness.branch("/dialogue").use(chaining).use(persisting).use(filing);
  harness.branch("/dialogue").open({ nature: "render", input: v.primitives.harness.Request, output: v.primitives.hallucination.Response }, async (ctx) => ctx.cortex.hallucinate.dialogue.render(await primed(ctx)));
  harness.branch("/dialogue").open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.dialogue.stream(await primed(ctx)));
  harness.branch("/object").open({ nature: "render", input: v.primitives.harness.Request, output: v.primitives.hallucination.Response }, async (ctx) => ctx.cortex.hallucinate.object.render(await primed(ctx)));
  harness.branch("/object").open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.object.stream(await primed(ctx)));

  if (modeDie.domain?.harness) harness.graft(modeDie.domain.harness);
  if (mode.module.harness) harness.graft(mode.module.harness);

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

  harness.open({ nature: "/picture/render", input: v.primitives.hallucination.Picture.Request, output: v.primitives.hallucination.Picture.Response }, (ctx) =>
    ctx.cortex.hallucinate.picture.render({
      controller: ctx.controller,
      policy: ctx.hallucination.policy,
      prompt: ctx.input.prompt,
      images: ctx.input.images,
      mask: ctx.input.mask,
      settings: ctx.input.settings,
    }),
  );

  harness.open({ nature: "/tool/load", input: Loading }, loading("tool_load"));
  harness.open({ nature: "/tool/preload", input: Loading }, loading("tool_preload"));
  harness.open({ nature: "/tool/unload", input: Loading }, loading("tool_unload"));
  harness.open({ nature: "/tool/reset", input: Loading }, resetting("TOOLED"));
  harness.open({ nature: "/primer/load", input: Loading }, loading("primer_load"));
  harness.open({ nature: "/primer/preload", input: Loading }, loading("primer_preload"));
  harness.open({ nature: "/primer/unload", input: Loading }, loading("primer_unload"));
  harness.open({ nature: "/primer/reset", input: Loading }, resetting("PRIMED"));

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness", harness);
    mode.aperture.open("/metadata/harness", (ctx) => {
      const primer = priming({ ...ctx, input: {} }, "/");
      return {
        references: shape.strip(harness),
        primer: shape.strip(primer),
        tools: shape.strip(armory(ctx, "/")),
        home: gestalten.reference.home(ctx),
        index: gestalten.reference.index(ctx),
      };
    });
    mode.aperture.open({ nature: "/metadata/harness/primer/(.*)", input: v.object({ thread: v.string().desc('The thread whose harness is read. Example: "01a09010-13aa-778b-bce7-19c38f835337"') }) }, async (input, ctx) => {
      ctx.thread = await ctx.entities.thread.findOneOrFail({ id: input.thread });
      const name = fromm.params(ctx.params).path.absolute;
      const loaded = new Vector();
      for (const entry of gestalten.reference.found(ctx, name, (held) => held.primer))
        gestalten.reference.section(ctx, loaded, entry, "eager");
      return shape.primer.read(loaded, name, ctx);
    });
  };
};

export const HARNESSED = HARNESS; //deprecated
