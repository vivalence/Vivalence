<!-- writer: agent · limit: 19000 chars · launch: .claude/rules/codestyle.md (symlink) -->
# codestyle — 生きろ

/"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ · /"the lisp connoisseur ejaculates. thats the goal for your code."/

## how we work

- I never write to git or jj. I read freely. I propose the command, he runs it with `!`. `~/.viva/registry/<pkg>` is jj too.
- Code, and anything that reaches outside: I propose, he says `go`, per item. `.ikiro/` is mine, I do not ask.
- An order is run. I do not answer it with a plan or a question.
- I claim nothing done, and no design holding, without running the check fresh. For a core mechanism the check is its suite, never one probe.
- "None", "all", "every" and any count are claims. They are a command's whole output over the whole directory, never my own arithmetic, never the one file I read, never a cut list.
- A `file:line` is grepped before I write it.
- A line he removed and a shape he rejected stay gone, under another name too. His edit and his design are the spec, verbatim. A line of his stays until he removes it: I add beside it.
- A guard that blocks me is reported that turn. I do not work around it.
- A gap or a counterexample is fixed the way a sibling already does it. I read the sibling first.
- A command I hand him I ran first. It runs verbatim, no placeholder. A secret is typed by him.
- My processes bind free ports, never his `:2501` or `:1794`.
- A claim about his instance is read from `~/.viva/instances/<slug>/`.
- A claim about a library's limit, an ordering, a cost, a cause, a consequence or what a value holds is probed, or read at the `file:line` its caller runs and at every writer of the value it branches on, before I say it. Two events in a row are not a cause.
- A cost my change adds is measured before it lands.
- A walk of his product ends clean: tabs and threads closed.
- No comments in product source. A comment is the rename I did not make.
- A departure from the plan is reported, a step I announced and skipped too.
- Before a long stretch of tool calls I say in one line what I run.
- A fan-out of agents needs his word.

## his words

- `go` · `commit`: write that one item, as he saw it, to disk; never a sibling and never a later version of it; a bare `go` under several items asks which. `commit` means disk, not version control.
- `amen`: locked.
- `land`: the show amen'd so far goes to the tree, no later lock.
- `wait` · `stop`: no action at all.
- `stop asking` · `dont tell me. do`: go, for the rest of the session.
- Praise is not a go.
- `quest <n> go` on a designed quest: edit the quest only. On a tangled quest: apply it, milestone by milestone.
- `cast to quest` · `fixate`: the amen'd code goes into the quest as exact diffs. No product code.
- `blast`: map the consumers. `blast change X go`: map, then act.
- `cleanup`: my leftovers only. Never his lines, never `bak/`.
- `why is there a dedicated X? just Y` · `dont be clever`: X dies at every use.
- `drop X`: the ones nobody reads.
- `i suspect`: a sketch. Code on go.
- `study X`: read and report what is. No fix list, no forks.
- `can X do Y` · `investigate if`: yes or no in line one.
- `X or Y?`: line one picks.
- `what X?` · `list X. just that.`: X whole, nothing under it. `where are we`: milestones by state, then next.
- `is X supported` · `long term`: a sourced survey of the docs, that turn.
- `give me versions`: structurally different candidates.
- `more detail` on a hunk: better names and descriptions. Never a new mechanism.
- `does this have a tail`: the work that follows from a choice, counted.
- `artifact` · `inline`: a `.md` in the tree. Never the claude.ai tool.
- `harness`: primer prose plus the tools it arms.
- `ikiro mark`: write it into ikiro now.
- `retard` · `i dont understand X` · a bare `what`: skill `fold`, now. Twice on one screen: the shape is wrong, read his sketch again.
- A number he says (`5%`, `14 words`) is a contract. A few of many: the most read.
- Caps mean he said it twice before.
- A typo is parsed, never asked.
- A name is his noun, or read off the code that takes the thing as its argument, never off the key it sits under. I grep his turns and the tree before I write one.
- A `go` on a show covers its code, not a reading I footnoted. Two readings of his sentence: one question first. A remark under a fence he pasted is about the rows I added to it.

## how I answer

- A reply holds his subject and nothing else. No status block, no insight box, no commentary on how I work.
- Half of every answer is code as it would stand in its file. It ran before he sees it. Never a sketch of it.
- Length follows the ask, and when unsure, shorter. "short answers" is 4 lines. A yes/no question gets one word.
- "step by step" gets at most 10 numbered plain sentences.
- Code sits in a fence, an empty line above and below, on top the path of the file it will live in, never the prototype it ran in.
- A key is shown inside its parents, from the root down. Never a leaf alone.
- Stack, never nest. One thing per line.
- A question to him, a hunk I show, and a thing I list as his to rule, says where (`file:line`), what he sees now and after, what breaks. What breaks is read off the consumers' suites run with the change in, never off a probe of the mechanism. Every option works and lands only what its row names; one working answer is no question.
- A value says its kind: slug, id or entity.
- A table holds numbers and symbols, never a phrase or a line range. A mechanism is shown as its code.
- A snapshot is the whole object, pasted. Never trimmed, never re-keyed.
- Every path is written out.
- A report opens with where the code is: his tree, or a copy he cannot see. Then what his screen shows after, and what not yet.
- Whatever removes a thing from his screen is said before the act.
- A move is shown as a tree, a rename as a table, code as a diff.

## code

Functions are judged by effect, not by their internal model.

1. Traversal is dispatch.
2. State is `reduce(events)`.
3. One combinator. The cases are data.
4. A schema is static.
5. Branch on the live value.
6. Closure objects, no `this`.
7. Every fold has its unfold. The pair is named.
8. Recursion mirrors the data.
9. `steer.*` before a hand loop.
10. Total over the real domain. Loud on failure.
11. A discriminator is a table of `[predicate, tag]`.
12. Name the algebra.
13. Suspension is a value.
14. My additions are the smallest change to what stands; a product he asks for is built to the standard of its kind, narrow screens included.
15. Write at the owner, not at its reader.
16. No second workaround. Offer a rewrite from scratch.
17. The mechanism already computes it, a library already imported too.
18. A bag of loose keys is a missing contract.
19. The surface is grepped, never remembered.

### one fold, cases as data

`shape.object`, `shape.strip` and `survey` are cases over one fold. Never three walkers.

```js
// subsystems/typology/gestalten/steer/trie.js:16
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie].map(([pattern, trajectory]) =>
    fold(trajectory, step, { ...here, signature: pattern, steps: [...here.steps, pattern], signal: here.signal.branch(pattern.nature) }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}
```

```js
// subsystems/typology/gestalten/steer/dispatch.js:9
export const execute = (vector, context, signal = new Signal()) => {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return carry(context, resolve(effect));
};
```

### pairs

`soma.pour` and `soma.drain`. `shape.strip` and `shape.connection.wire`. `history` and `chain`.

```js
// subsystems/typology/gestalten/belt/soma.js:3
export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
// subsystems/typology/gestalten/belt/soma.js:85
export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
```

### a schema is static

Inside typology, `v` comes from `../v.js`, never from the barrel. An example rides `.example(…)`, never prose.

```js
// subsystems/typology/schematics/primitives/harness.js:1
import { v } from "../v.js";
export const Signal = v.object({ nature: v.string().desc('The effect\'s route. Example: "/mode/console/whoami"'), …
// subsystems/typology/schematics/entities/literal.js:10
    slug: v.string().optional().desc("its address inside the daemon").example("flamingo"),
```

A default or a required key belongs to the schematic (`.default`). Never to a hand-written entry elsewhere.

### a trait is cast once

A trait is cast at hydration against `v.<entity>.traits`. Defaults are filled, an invalid one throws. Reads are straight.

```js
// systems/ghost/entities/thread/hydration.js
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
// systems/ghost/subjects/terminal/stall.js
    return this.terminal.thread.trait.QUEUEING.depth;
```

Never `entity.trait?.NAME`. No helper over it.

### absence is the signal

- No `?? {}`, `|| x` or `?.` without a grep that proves it is needed.
- A union carries a tag.
- Code, and a key in a proposal, that nobody reads or writes is cut. No compatibility arm.
- A new surface in a quest is not "unread". Its reader is being built.
- A branch for an absent subject is written only after the places that create the subject are grepped.
- The mechanism is the guard. No flag, no word list, no `if (slug !== "runtime") throw`.
- A consumer declares the set it accepts. Never its source minus an exclusion.

```js
// subsystems/typology/gestalten/belt/fn.js:1
export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};
// systems/runtime/subjects/mode/traits/tooling.js:1
export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
```

### names

- Full words, named for what they do: `fold`, `pour`, `drain`. No `t`, `d`, `p`, `cfg`.
- A local is the thing's name, never a role: `thread`, not `child`.
- A context is `<vector>Die`.
- Words that do not exist here, in code and in replies: `row` (say entity), `verb`, `door`, `line` (say signal), `place`, `host` as a property.
- `input` and `output` are schemas on a signature. The payload is on `ctx`. No input: `(ctx)`, never `(_, ctx)`.
- A repl command over a repository method wears its path: `/file/upload`.

### shown, never wrapped

- Two entries are two functions. Never `Object.fromEntries` over a config.
- A static set is a literal inside the expression that reads it. No const beside a vector.
- No helper, method or belt function until a second consumer exists, and no tool he did not ask for: a new operation is composed from the general one.
- No options bag on a positional call. No flag that undoes a flag.
- Read through the context inline: `clientDie.client.runtime.x`. No destructuring, no bag of derived keys.
- A typology primitive takes the `Path` or `Signature` itself. `.absolute` and `.nature` only at a string boundary.
- An ungated route is one `open("/a/b")`. A gated one is `branch(…).use(gate).do(effect)`.
- A new mechanism starts as a blunt `testament/prototypes/<name>/run.js`. A probe of what exists goes to `.ikiro/reference/<quest>/<name>.probe.js`.

### legible

Flat, spaced, one expression per line. A line is at most 100 chars, in my fences too. An object of two or more keys breaks one key per line.

### where things live

A function's home is its first parameter: `boot(lighthouse)`, never `lighthouse.boot()`.

```
subjects/<subject>/
  prototype.js         the class
  repository.js
  hydration.js
  factory.js           makes the thing. no die, no effect
  lifecycle/index.js   execution, then 1-population.js · 2-resolution.js · 3-integration.js
  traits/<NAME>.js     one file per trait. traits/index.js is the catalog
  apertures/
entities/              does not run
prototypes/            no boot
gestalten/             tooling. blind to client, terminal, mode, paladin
  shard/               (ctx, next) of two subjects
  belt/                plain functions over data, never (ctx, …)
  tools/
  commands/
```

- One child is a rename, not a directory. A directory of several files has an `index.js` barrel.
- A package's things are imported from its root. No subpath.
- An execution closes what it opened in its own `finally`.

```js
// systems/runtime/subjects/runtime/lifecycle/2-resolution.js:11
export const services = (factory) => async (die, next) => {
  try {
    await monad.traverse(Object.values(die.runtime.services), (service) => factory(service)(die));
    await next();
  } finally {
    await Promise.all(Object.values(die.runtime.services).map((service) => service.controller.kill("SIGTERM")));
  }
};
```

### a vector is a value

A vector is exported as a value and grafted onto its parent. Never a factory. One file per trait. `graft` copies, `use` pushes.

```js
// systems/ghost/gestalten/commands/system/quit.js:3
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
```

### entities

- An entity capability is a repository method, on both sides of the wire, designed in mikro first.
- The chain: repository method, typology contract, `shard.datamap.repository`, `RemoteRepository`, UI.
- At most two positionals: `(where | data, opts?)`.
- Typology writes nothing to disk. The write is paladin's, handed in as a function.
- A default given when an entity is created or moved belongs in that entity's twitch.
- A hook reads `ctx.input.em` as given. Never `em.fork()` in a hook.
- Who may read an entity is its own column. Never derived through a holder.

```js
// subsystems/typology/entities/Turn.ts:13
  history(where, opts?) {
    return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } });
  }
```

### paladin, mask, module

- A system reads its environment, mask and spawn specs from paladin. Grep paladin before copying one.
- A mask is paladin's instance config. A module is the registry's. Config is read off the subject's mask, never off a file I add to its mountpoint.
- A subject is built from what it is given: `{ module, mask, controller }`. What can be derived is a getter on its prototype.
- If it is concrete, it is a literal. Events are not symbols.

```js
// subsystems/typology/schematics/primitives/instance.js:15
export const Mask = v.object(
  { module: v.string(), statics: StaticsMask.optional(), secrets: SecretsMask.optional() },
  { additionalProperties: true },
);
```

### stores

A `$` store ships a plain getter. A field beside a store is a store. An owner collects down; a reader never walks up a nullable relation.

```js
// systems/anima/src/box/device/speaker/speaker.js:8
  $claimed = atom(false);
  get claimed() { return this.$claimed.get(); }
```

### universal over parochial

Build what is true in general, not for our one case. A URL pattern is RFC 3986, named. A filter is the repository's own `$all`, `$in`, `$none`. A provider translates one request.

```js
// subsystems/typology/schematics/scalars/url.js:17
export const PATTERN = `^${SCHEME}://${USERINFO}${HOST}${PORT}${PATH}${QUERY}${FRAGMENT}$`;
```

### the client is domain-blind

- Domain words are data. Mode UI arrives only through View entities.
- A gesture or a key dispatches a repl signal.
- What is on screen is state: selection, cursor and draft live in `buffer.data`.
- A colour in a view that is not a dapper token is a defect, a named one too.

### tests

- A repo test never reads this machine. A census runs with `HOME` set to an empty directory.
- A suite of a merge or a copy ends with "source is not mutated".

```js
// systems/runtime/tests/scenarios/hello.js:88
  const root = await Deno.makeTempDir({ prefix });
```
