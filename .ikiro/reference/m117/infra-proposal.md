<!-- limit: 40000 chars · m117 infra proposal 2026-11-07, moved whole from the quest on his /"the infra is already there. i want a hanress. not code."/ · reference, read-only -->

* the proposal — the root after

** the assembly

#+BEGIN_SRC text
root       spread(contexts.host) · bind("mode")
           normalizing · claiming · activating · requesting          SLOTS — replaceable by name
           ── context.domain.harness · mode.module.harness grafted ──
           ── mode.manifest.exclude pruned from the armory ──
/verbatim  stream
/dialogue  chaining · facting · pruning · [compacting] · persisting · render · stream
/object    render · stream
/choice    render
#+END_SRC

#+BEGIN_SRC text
armory, root default — paladin owns all three

subsystems/paladin/gestalten/tools/fs.js     /fs/tree · find · grep · read · edit · write · stat · move · delete    kind on each
subsystems/paladin/gestalten/tools/shell.js  /shell/run                                                            kind: execute
subsystems/paladin/gestalten/tools/web.js    /web/search · /web/fetch                                              kind: search · fetch
systems/runtime/gestalten/tools/primer.js    /primer/read   (when lazy nodes exist — as today)
#+END_SRC

#+BEGIN_SRC text
primer, root default

tools        one section: each armed edge's guidelines, sorted by nature          owned by the edges
environment  one row, delta on /dialogue: cwd · os · date                         context part, never system
#+END_SRC

** harnessed.js — whole, after

#+BEGIN_SRC js
// systems/runtime/subjects/mode/traits/harnessed.js

import { contexts, shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
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
  await next();
};

const activating = async (ctx, next) => {
  if (!ctx.input.controller) {
    ctx.activity = await ctx.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread.id });
  }
  ctx.controller = ctx.input.controller ?? ctx.activity.controller;
  await next();
};

const priming = (ctx) => {
  const primer = new Vector();
  if (ctx.mode.primer) primer.graft(ctx.mode.primer);
  if (ctx.domain?.primer) primer.branch(ctx.domain.manifest.slug).graft(ctx.domain.primer);
  if (ctx.input.system) for (const [nature, effect] of Object.entries(ctx.input.system)) primer.open(nature, effect);
  return primer;
};

const arming = (ctx) => {
  const armed = new Vector()
    .graft(paladin.tools.fs.fs)
    .graft(paladin.tools.shell.shell)
    .graft(paladin.tools.web.web);
  for (const [slug, provider] of Object.entries(ctx.providers)) {
    if (provider.tools) armed.branch(`/service/${slug}`).use(shard.context.bind("service", provider)).graft(provider.tools);
  }
  if (ctx.domain?.tools) armed.branch(ctx.domain.manifest.slug, ctx.domain.tools);
  if (ctx.mode.tools) armed.graft(ctx.mode.tools);
  if (ctx.mode.generator?.tools) armed.graft(ctx.mode.generator.tools);
  for (const [name, supplied] of Object.entries(ctx.input.tools ?? {})) {
    const { execute, ...edge } = typeof supplied === "function" ? { execute: supplied } : supplied;
    armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
  }
  for (const nature of ctx.mode.manifest.exclude ?? []) {
    if (!shape.prune(armed, nature)) throw new Error(`HARNESSED: ${ctx.mode.manifest.slug} excludes ${nature}, which is not armed`);
  }
  armed.use(shard.context.spread(contexts.host, ctx));
  armed.use(shard.context.bind("mode", ctx.mode));
  armed.use(gating(ctx.mode.module.policy ?? [[() => true, "allow"]]));
  armed.use(spilling(ctx.mode.mountpoint));
  if (ctx.user) armed.use(shard.context.bind("user", ctx.user));
  armed.use(shard.context.bind("thread", ctx.input.thread));
  return armed;
};

const requesting = async (ctx, next) => {
  const { prompt, turns, output, tune, config } = ctx.input;
  const primer = priming(ctx);
  const armed = arming(ctx);
  if (ctx.mode.looping) armed.branch("/repl").graft(await ctx.mode.looping(ctx));
  if (shape.primer.lazy(primer).length) armed.graft(tools.primer.primer);
  primer.open("tools", () => shape.primer.guidelines(armed));
  const intelligent = ctx.thread.trait.INTELLIGENT;
  ctx.hallucination = {
    controller: ctx.controller,
    policy: {
      ...config,
      ...(intelligent.tune && { tune: intelligent.tune }),
      ...(intelligent.rounds && { rounds: intelligent.rounds }),
      ...(tune && { tune }),
    },
    ...(intelligent.effort && { settings: { effort: intelligent.effort } }),
    primer,
    turns: turns ?? (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
    tools: armed,
    ...(output && { output: { schema: output } }),
  };
  await next();
};

const gating = (rules) => async (ctx, next) => {
  const verdict = rules.find(([test]) => test(ctx.signal, ctx.input))[1];
  if (verdict === "deny") return { condition: "ERROR", output: { message: `${ctx.signal.nature} denied by ${ctx.mode.manifest.slug}` } };
  if (verdict === "ask") await ctx.controller.consent(ctx.signal, ctx.input);
  return next();
};

const SPILL = 16_000;

const spilling = (mountpoint) => async (ctx, next) => {
  const result = await next();
  const text = result?.output?.message;
  if (typeof text !== "string" || text.length <= SPILL) return result;
  const path = await paladin.fs.spill(mountpoint, ctx.signal.nature, text);
  return { ...result, output: { ...result.output, message: `${text.slice(0, 4096)}\n\n[… ${text.length} chars; full output at ${path} — fs_read it]\n\n${text.slice(-1024)}` } };
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

const facting = async (ctx, next) => {
  const now = { cwd: ctx.mode.mountpoint.absolute, os: Deno.build.os, date: new Date().toISOString().slice(0, 10), mode: ctx.mode.reference.nature };
  const before = soma.context(ctx.hallucination.turns);
  const delta = Object.fromEntries(Object.entries(now).filter(([key, value]) => before?.[key] !== value));
  if (Object.keys(delta).length) ctx.turn.parts.push(soma.contextPart(delta, before === null ? "initial" : "changed"));
  await next();
};

const PRUNE = { threshold: 8192, head: 4096, tail: 1024 };

const pruning = async (ctx, next) => {
  const guarded = ctx.hallucination.turns.slice(-6);
  ctx.hallucination.turns = ctx.hallucination.turns.map((turn) => guarded.includes(turn) ? turn : soma.clip(turn, PRUNE));
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
        parent = em.create(TurnEntity, { id: v7(), role: packet.turn.role, parts: [], parent, thread: ctx.thread.id, mode: ctx.mode.id });
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
  return em.create(TurnEntity, { role: "assistant", parts: [], meta: close, parent, thread: ctx.thread.id, mode: ctx.mode.id });
};

const appending = async (ctx, turns) => {
  let parent = ctx.turn;
  for (const turn of turns) {
    parent = await ctx.entities.turn.chain({ role: turn.role, parts: turn.parts, meta: turn.meta, parent, thread: ctx.input.thread, mode: ctx.mode.id });
  }
};

const primed = async (ctx) => {
  const { primer, ...hallucination } = ctx.hallucination;
  const system = await shape.primer.load(primer, ctx);
  hallucination.policy.cache = { marks: [Object.keys(system).at(-1), "tools"] };
  return { ...hallucination, system };
};

const SLOTS = [normalizing, claiming, activating, requesting];
const DIALOGUE = [chaining, facting, pruning, persisting];

const replaced = (slots, brought) =>
  slots.map((slot) => brought.find((candidate) => candidate.name === slot.name) ?? slot);

export const HARNESSED = (mode, context) => {
  if (!context.cortex) throw new Error(`HARNESSED: ${context.reference.absolute} has no cortex`);
  const brought = [...(context.domain?.harness?.carry ?? []), ...(mode.module.harness?.carry ?? [])];

  const harness = new Vector()
    .use(shard.context.spread(contexts.host, context))
    .use(shard.context.bind("mode", mode));
  for (const slot of replaced(SLOTS, brought)) harness.use(slot);

  harness.branch("/verbatim").open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, shard.hal.verbatim({ polish: POLISH, tune: "fast" }));

  const dialogue = harness.branch("/dialogue");
  for (const slot of replaced(DIALOGUE, brought)) dialogue.use(slot);
  dialogue.open({ nature: "render", input: v.primitives.harness.Request }, async (ctx) => ctx.cortex.hallucinate.dialogue.render(await primed(ctx)));
  dialogue.open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.dialogue.stream(await primed(ctx)));
  harness.branch("/object").open({ nature: "render", input: v.primitives.harness.Request }, async (ctx) => ctx.cortex.hallucinate.object.render(await primed(ctx)));
  harness.branch("/object").open({ nature: "stream", input: v.primitives.harness.Request, yields: Packet.Response }, async (ctx) => ctx.cortex.hallucinate.object.stream(await primed(ctx)));
  harness.branch("/choice").open("render", (ctx) =>
    ctx.cortex.hallucinate.choice.render({ controller: ctx.controller, policy: ctx.hallucination.policy, system: ctx.input.system, questions: ctx.input.questions }),
  );

  if (context.domain?.harness) harness.graft(shape.unnamed(context.domain.harness, [...SLOTS, ...DIALOGUE]));
  if (mode.module.harness) harness.graft(shape.unnamed(mode.module.harness, [...SLOTS, ...DIALOGUE]));

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness", harness);
  };
};
#+END_SRC

What left the root, and where it went:

| was | goes |
|-----+------|
| =tools.entity · buffer · thread · mode= armed in =arming()= :78–81 | imported by the home mode (R2); =@vivalence/runtime= keeps exporting them |
| =summarizing= :199 (the thread summary) | =tools.thread.primer=, grafted by the mode that imports =tools.thread= |
| =siblings()= · AGENTIC lazy peer primers :43–51 | the AGENTIC trait grafts them into =mode.primer= — its own file |
| =ctx.intelligent= / =ctx.vocal= double-read :30–31 | =ctx.thread.trait.INTELLIGENT= straight (m105 Q4′); =shard.hal.verbatim= reads =ctx.thread.trait.VOCAL= |
| =marking()= :204 | =[last system key, "tools"]= — the =tools= section is last by construction |
| =choice= :249 registered after the grafts | =/choice=, with the others, before the grafts |
| =//@beef= :16–17 · :219 · :101 | treated → the shards; both nonoptional lands with =claiming= |

** the edge — kind · guidelines

#+BEGIN_SRC diff
// subsystems/paladin/gestalten/tools/fs.js:37
   .open(
     {
       nature: "/fs/tree",
+      kind: "read",
+      guidelines: ["Ground with fs_tree before reading; never guess a path."],
       valence:
         "The directory tree under an absolute path. Ground here before reading: your mode's places " +
-        "(source · mountpoint · files) are in the mode section of your context, every mode's come " +
-        'from mode_find. Example: { path: "/home/operator/jdex", depth: 2 }.',
+        'Example: { path: "/home/operator/jdex", depth: 2 }.',
…
// subsystems/paladin/gestalten/tools/fs.js:132
   .open(
     {
       nature: "/fs/write",
+      kind: "edit",
…
// subsystems/paladin/gestalten/tools/shell.js:22
 export const shell = new Vector().open(
   {
     nature: "/shell/run",
+    kind: "execute",
+    guidelines: ["A nonzero exit code is information; read it before the next call."],
#+END_SRC

#+BEGIN_SRC js
// subsystems/paladin/gestalten/tools/fs.js — two new edges, whole

  .open(
    {
      nature: "/fs/edit",
      kind: "edit",
      guidelines: ["Each edits[].old must occur exactly once in the file; fs_read first."],
      valence: "Exact-text replacement inside one file. Pass one or more { old, new } pairs; each old must match " +
        'exactly once. On a miss the nearest candidate is returned. Example: { path: "/x/a.js", edits: [{ old: "foo(1)", new: "foo(2)" }] }',
      input: v.object({
        path: PATH("the file"),
        edits: v.array(v.object({ old: v.string(), new: v.string() }), { minItems: 1 }),
      }),
    },
    async (ctx) => {
      let text = await Deno.readTextFile(absolute(ctx.input.path));
      for (const { old, new: replacement } of ctx.input.edits) {
        const hits = text.split(old).length - 1;
        if (hits !== 1) return { condition: "ERROR", output: { message: `${hits} matches for ${JSON.stringify(old.slice(0, 80))} — nearest: ${nearest(text, old)}` } };
        text = text.replace(old, replacement);
      }
      await Deno.writeTextFile(absolute(ctx.input.path), text);
      return { output: { message: `edited ${ctx.input.path} · ${ctx.input.edits.length} replacement(s)` } };
    },
  )
  .open(
    {
      nature: "/fs/grep",
      kind: "search",
      valence: 'Rows matching a regular expression under a path, as path:row:text, capped. Example: { pattern: "TODO", path: "/x", glob: "*.js" }',
      input: v.object({ pattern: v.string(), path: PATH("a directory"), glob: v.string().optional(), limit: v.integer({ minimum: 1, maximum: 500 }).default(100) }),
    },
    grep,
  )
#+END_SRC

#+BEGIN_SRC js
// subsystems/paladin/gestalten/tools/web.js — new file, whole

import { v, Vector } from "@vivalence/typology";
import { url } from "@vivalence/typology/schematics/scalars/url.js";

const BYTES = 250_000;

export const web = new Vector()
  .open(
    {
      nature: "/web/search",
      kind: "search",
      guidelines: ["web_search ONCE per subject, then web_fetch the one page you mean to cite."],
      valence: 'Search the web through the host\'s search provider. Returns rows of title · url · snippet. Example: { query: "deno 2 import map" }',
      input: v.object({ query: v.string(), limit: v.integer({ minimum: 1, maximum: 20 }).default(8) }),
    },
    async (ctx) => {
      const provider = Object.values(ctx.providers).find((candidate) => candidate.search);
      if (!provider) return { condition: "ERROR", output: { message: "no search provider on this host — a service with `search` must be seated" } };
      return { output: { rows: await provider.search(ctx.input.query, ctx.input.limit) } };
    },
  )
  .open(
    {
      nature: "/web/fetch",
      kind: "fetch",
      valence: `GET one http(s) URL, text only, capped at ${BYTES} bytes; private addresses refused. Example: { url: "https://deno.com/blog" }`,
      input: v.object({ url: url(), timeout: v.integer({ minimum: 1000, maximum: 60000 }).default(15000) }),
    },
    async (ctx) => {
      const target = new URL(ctx.input.url);
      if (isPrivate(target.hostname)) return { condition: "ERROR", output: { message: `${target.hostname} is a private address` } };
      const response = await fetch(target, { signal: AbortSignal.timeout(ctx.input.timeout), redirect: "follow" });
      const text = (await response.text()).slice(0, BYTES);
      return { output: { message: text, status: response.status, type: response.headers.get("content-type") } };
    },
  );
#+END_SRC

#+BEGIN_SRC js
// subsystems/typology/gestalten/shape/primer.js — the tools section, appended

export const guidelines = (armed) =>
  steer.trie.rollup(armed, (edge) => edge.guidelines ?? [])
    .flat()
    .sort()
    .map((row) => `- ${row}`)
    .join("\n");
#+END_SRC

** the loop — belt/hallucinate.js, three hunks

#+BEGIN_SRC diff
// subsystems/typology/gestalten/belt/hallucinate.js:108
-// @beef serial: a round's calls share one em fork and a failed flush strands mikro's queued flushes — might in the future change to parallel
 export async function dispatch(policy, parts) {
   const settled = [];
-  for (const call of parts.filter((part) => part.type === "tool_use")) settled.push(await settle(policy, call));
-  return settled;
+  const calls = parts.filter((part) => part.type === "tool_use");
+  const [reads, writes] = partition(calls, (call) => READ_ONLY.includes(edgeOf(policy.tools, call).kind));
+  settled.push(...(await Promise.all(reads.map((call) => settle(policy, call)))));
+  for (const call of writes) settled.push(await settle(policy, call));
+  return settled;
 }
+
+const READ_ONLY = ["read", "search", "fetch"];
…
// subsystems/typology/gestalten/belt/hallucinate.js:77
-    await new Promise((resolve) => setTimeout(resolve, delay));
+    await new Promise((resolve, reject) => {
+      const timer = setTimeout(resolve, delay);
+      signal.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
+    });
…
// subsystems/typology/gestalten/belt/hallucinate.js:129
     while (rounds < policy.rounds) {
+      const closing = rounds === policy.rounds - 1;
       if (!(await controller.proceed())) {
…
-      for await (const packet of pump[streamOrRender](faculty, { ...request, turns }, signal)) {
+      for await (const packet of pump[streamOrRender](faculty, { ...request, turns, ...(closing && { toolChoice: "none" }) }, signal)) {
#+END_SRC

Serial stays for every =edit= · =execute= call — his mark holds: those touch the em fork. Reads never flush.

** the instance — what one brings, hello-world as the exemplar

#+BEGIN_SRC js
// commons/instances/hello-world/harness.js — after

import { Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";
import { brief, choose, doctor, doors, research, wikipedia } from "./tools/index.js";

export const manifest = { type: "demo", slug: "hello-world", traits: ["HARNESSED", "PRIMER", "TOOLING", "CONVERSATIONAL"], exclude: ["/shell/run"] };

export const primer = new Vector()
  .open("soul", read("SOUL.md"))
  .graft(gestalten.tools.thread.primer);

export const tools = new Vector()
  .graft(gestalten.tools.entity.entity)
  .graft(gestalten.tools.buffer.buffer)
  .graft(gestalten.tools.thread.thread)
  .graft(gestalten.tools.mode.mode)
  .graft(doctor, doors, research, wikipedia, brief, choose);

export const policy = [
  [(signal) => signal.nature.startsWith("/fs/write"), "ask"],
  [() => true, "allow"],
];

export const harness = new Vector().use(async function pruning(ctx, next) { await next(); });
#+END_SRC

The last row shows the replace-by-name seam: a brought middleware named =pruning= replaces the root's; an unnamed or differently named one stacks after the root's as today.

