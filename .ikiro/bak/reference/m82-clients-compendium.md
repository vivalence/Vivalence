<!-- writer: agent · reference · TEMPORARY, m82 phase two + m86 only — delete when the demo lands · limit: 420000 chars · regenerated 2026-10-10 by scratchpad/compendium.py from the working tree after m82 closed (typology unbarreled, lighthouse slot, credentials) -->
# m82 clients — the compendium

beef, 10-10: /"I want you to write a reference. So not a quest, the reference. Just the material to load. … Extremely code heavy. And entirely temporary and for this specific task only. A compendium to this quest, basically."/

Load this, then `.ikiro/quests/done/m86-repl-loop-clients.org` and `done/m82-runtime-clients.org` `* handoff`. Everything below the rulings is VERBATIM source from the tree after the bundle landed, 10-10 (each block opens with its path). Re-read a file before editing it: the tree moves, this file does not.

## the task

Build both clients on the Loop, one client typology exported from `@vivalence/ghost`, two targets:

| client | target | renders with | today |
|---|---|---|---|
| ghost (`viva`) | `tty` | `@opentui/solid` under Deno (the opentui rig) | ink + sheets, a cut-only trajectory |
| anima | `dom` | Solid + vite, SvelteKit out | SvelteKit + drapes, its own `src/typology/` |

Same five screens on both (boot · signin · chat · buffer · navigation), same layout law, the composer first, logins that stick, chat with home, a buffer in the frame.

## rulings — 10-10, this session (AskUserQuestion, his picks)

| fork | ruling |
|---|---|
| anima's screen code | **Solid, SvelteKit out** — a new Solid app beside `systems/anima/src/`, swapped in at milestone 6; kits `@vivalence/drapes/{dom,tty,svelte,state}`; `drapes/svelte` stays for mode apps |
| the home mode | **minimal home in m82** — `commons/modes/home/home.viva.js`, HARNESSED, plain dialogue, in `runtime.modes` → `/runtime/runtime/mode/home/home`; m84 (H4) grows its harness on the same file later |
| typology additions | **`steer.trie.at`** · **argv on `Signal`** (m79 M1, `ShellSignal`/`ShellContext` die) · and, in his words, /"custom signal. replsignal."/ — the reader is **`ReplSignal`** (was the placeholder `Form`, renamed in every quest block); the precedence edit in `match.feed` was NOT picked |
| where the build starts | **land the bundle first** — milestone 0's three hunks → stage 1 → the clean slate (`lsof -nP -iTCP:2501 -sTCP:LISTEN` first), then the Loop |

Each typology addition still lands as its own diff on its own `go` (typology is HOLY). Without the precedence law, a mode's commands grafted after `/command/(.*)` lose to it: declare literals first, or graft layers before the catch-all.

## rulings carried — earlier, binding

- the client is a DIE like the runtime's: `{ controller, mask, client, loop: new Vector(), queue: new Queue() }`; its boot vector is the runtime's execution one for one; its root effect is the REPL drain where the runtime's is `keepalive` (spec below, `m82:1085-1126`).
- REPL: Read = `new ReplSignal(input)` · Eval = `steer.dispatch.invoke(die.loop, signal, evaluate)` · Print = the session atoms · Loop = `die.queue.drain(die.controller.abort.signal)`.
- channels: `Queue` in · `Pipe` through (packets fold into `live` by `Pipe.reactive(null, soma.transcript)`) · `Span` what happened (one span per signal off `die.controller.stdout`).
- errors: a `capturing` middleware on the loop, `shape.http`'s catch twin; it paints the slot (Q18 RULED).
- no `db`, no `fx`, no `Ring`, no `Loop` class; entities stay the Dataspace's; effects are middleware acting after `next()`.
- `{ …typology } from "@vivalence/ghost"` — the package ROOT, never `/typology`.
- Spacemacs: `/` the leader, which-key from the trie (`steer.trie.at`), `/,` the seated mode's branch, a layer = a mode's EXPOSED strip under `/command/<slug>` + its keys under `/key/<slug>`.
- credentials: `VIVA_CLIENT_GHOST_CREDENTIALS_FILE`, default `<ledger>/credentials.json`, rows keyed by lighthouse ORIGIN; anima keeps `localStorage`; the carrier comes from the target (`target.credentials`).
- lighthouse: its own ledger key with `traits: ["OPEN" | "INVITED" | "OPERATED"]`; `/signup` 403s without OPEN; `/lighthouse/metadata` tells the client.
- three ways on a tty: cut (inline, one-off) · captured (inline, ongoing) · chrome (fullscreen, ongoing).
- the pincer is PARKED for the demo; pane verbs (`tap · solo · remove`, `panes.js`) ride a strip and keys.
- the rings (data · concrete · event) are narrative, never code.

## the law — paladin never in a typology

beef, 10-10, on finding 1 below: /"We don't ever, ever, ever want Paladin inside of typology. Never, ever, ever."/ Any barrel named typology — `@vivalence/typology`, the `@vivalence/ghost` root, `systems/ghost/typology.js` today — reaches no file that imports `@vivalence/paladin`. A client lifecycle receives what paladin knows (the remote, the home, the credentials file) as DATA on its mask and its target; the CLI door (`mod.js`, a trajectory) reads paladin and builds that mask. Landed in `.ikiro/world/codemap/ghost.md`.

## the home dummy — written 10-10

beef: /"There is no home mode anywhere. -- create a test dummy one."/ → `commons/modes/home/home.viva.js`, lookup `@commons/home/home` (the manifest's words, `codemap/commons.md`), HARNESSED, a two-line system section. Not yet seated: the recipe needs `"modes": ["@commons/home/home"]` under `runtime` and `"home": "/runtime/runtime/mode/home/home"` on the client rows (`commons/ledger/ledger.viva.json` · `~/.viva/ledger.viva.json`) — proposed, on go (a watched runtime redeploys on a commons save). m84 H4 grows its harness on this same file.

## found while loading — facts the build stands on

1. **`@vivalence/ghost`'s root is not importable by a browser today — and breaks the law above.** `"."` → `mod.js` (`systems/ghost/deno.jsonc:5`); `typology.js` re-exports `belt/`, and `belt/config.js:3` · `lens.js:1` · `envfile.js:1` import paladin. The root becomes a paladin-free barrel (`lifecycle/client` · `prototypes` · `traits` · `gestalten`); the CLI belt stays behind `mod.js`, which `ghost.sh:11` names directly.
2. **The Loop's vocabulary is already in the client barrel** anima aliases (`systems/anima/vite.config.mjs:127` → `mod.client.js`): `Vector · Queue · Pipe · Span · Controller` (`prototypes/index.client.js:9-33`), `steer` (`gestalten/index.client.js:9`), `shard.context` · `shard.track` · `shard.transmitter` · `shard.connection` (`gestalten/shard/index.client.js`). NOT in it: `shard.datamap` · `Datamap` · mikro — the client never needs them.
3. **No home mode exists.** `/runtime/runtime/mode/home/home` is an example string (`schematics/primitives/instance.js` `Home`); `commons/ledger/ledger.viva.json` has no `runtime.modes`; hello-world's one mode is `demo/hello-world` on daemon `hello` (`commons/instances/hello-world/mode.viva.js:6-7`).
4. **Stage 1 LANDED 10-10.** Anima's `Buffer` carries `$bundle` (`systems/anima/src/typology/entities/buffer.js:16`); `Frame.svelte` takes `bundle` + `accept` and calls `bundle.load(accept)` (`subsystems/drapes/panels/Frame.svelte:5,62`); `View` is dead.
5. **`Signal` puts flags on the fin; `ShellSignal` puts params + flags on segment ZERO** (`systems/ghost/prototypes/shellsignal.js:31`) — two grammars; the argv row unifies them.
6. **`traverse` returns the position's own effect on a `nature == null` signal** (`steer/dispatch.js:20-22`) — a bare line reaches `Vector.affect`, the fall-through, with no trie edge.
7. **`Signature` coercions run with `this` bound** (`signature.js:32`); a row that returns an array loses fields set on `this` (the constructor recurses into `new this.constructor(head)`), so a payload rides a SEGMENT (the fin), the way `Signal` does flags (`signal.js:58-66`).
8. **`Queue.drain(signal)` stops on abort, `close()` ends it** (`queue.js:19-33`); `Pipe.reactive(seed, step)` is a nanostores atom fed by `tap` (`pipe.js:16-20`); `fromm.sink` writes to a Queue (`enqueue`), a Pipe (`send`) or an atom (`set`) (`fromm/index.js:5-20`).
9. **`shard.track.span(name)` branches `ctx.span` if present, else roots a new Span** (`shard/track.js:12-25`) — seed `ctx.span = die.controller.stdout` in `evaluate` and every signal is a child.
10. **the runtime's `keepalive` opens stdout then `control.hold`s** (`lifecycle/process.js:13-16`); `settle` faults and closes (`:3-11`). `run.js:17` prints `Status:RUNNING` on the root span's `open`.
11. **anima's mount sequence per daemon** is `dossier.js:93-183` (`/status` · `/metadata/{manifest,cortex,aperture,statics}` · cargo · `entities.init`, then modes · threads · intents · subscriptions · cortex) — the host lifecycle cuts it into beats, one sequence for `/runtime/<slug>` and `/daemon/<slug>`.
12. **every userspace kind is one route on the ROOT**: `/userspace/entities/{terminal,intent,thread,buffer,turn,note,activity}` (`aperture/userspace.js:11-29`); activity io is `/userspace/entities/activity/:id/{stdout,stdin/<SIG>}` (`:31-44`) — anima's `activity.js:80` reaches it through a daemon's `call` and is broken.
13. **the host strips per mode**: `/metadata/{aperture,statics,mountpoint,application,emitter,freight,harness}` (`host/aperture/metadata.js:25-49`); `/metadata/modes` lists absolute references (`:4-11`).
14. **`/lighthouse/{signup,login,password,logout,verify,refresh}`** (`lighthouse/auth.js:21-81`); signup is unconditional at `:22` today.
15. **opentui under Deno needs the preload + the `node:ffi` stand-in + the 0.5.17 patch** (`testament/prototypes/opentui/README.md`); `@opentui/solid`'s `render(() => …, renderer)` mounts, `useKeyboard` takes keys, `destroy` = `renderer.root.getChildren().forEach(c => c.destroyRecursively())` (`apps/lesson.solid.opentui.jsx`).
16. **the m80 ghost walk** (`testament/prototypes/ghost/ghost/session.js`) already has the REPL's shape on atoms: `send` → `/`-sigil → `manual` (a tool) else `turn`; `$log · $live · $line · $busy` — the session atoms the Loop formalizes.
17. **m79 is at the quests root again** (moved out of `benched/` inside `vrkoppuw`), live as m82's grammar source.

## the order — milestones, as ruled

| # | milestone | first act |
|---|---|---|
| 1 | the land: milestone 0 (3 hunks) → stage 1 → clean slate LANDED 10-10; left: lighthouse slot + OPEN · the home in the recipe · the credentials record | `lsof -nP -iTCP:2501 -sTCP:LISTEN` |
| 2 | m86 — `@vivalence/ghost` root barrel; `lifecycle/client/` + `lifecycle/host/`; `ReplSignal`; the Loop headless — `viva client --json` seats home, sends a turn, exits 0 | the three typology diffs, each on go |
| 3 | `drapes/dom` + `drapes/tty` + `dapper.tokens(theme, zone)` | probe `vite-plugin-solid` under Deno, first hour |
| 4 | ghost chrome on OpenTUI/Solid | the install patch step (Q12) |
| 5 | anima on Solid, SvelteKit out | the dom target bag |
| 6 | the swap | — |

## the client vector — what mirrors what

| runtime (`systems/runtime/`) | client (`systems/ghost/`) |
|---|---|
| `run.js` — the die, signals → `controller.kill` | `client.js` `boot(mask, target)` — the die; the target maps esc/ctrl-c → `controller.kill` |
| `lifecycle/process.js` `settle` · `keepalive` | `lifecycle/process.js` `settle` (shared) · `repl` (the drain) |
| `lifecycle/runtime/execution.js` | `lifecycle/client/execution.js` |
| `lifecycle/runtime/aperture/lighthouse.js` (the door) | `population.lighthouse` (credentials from the target, verify/refresh, signin via `target.signin`) |
| `population.datamap` (one store) | `population.dataspace` (one `Dataspace` on `/userspace/entities`) |
| `gestalten/belt/host.js` `seat · resolve · release` | `gestalten/belt/host.js` — the client dual: `wire · resolve`, a host per `/metadata/daemons` row + the runtime |
| `traits/*.js` `(mode, host)` staggered by `belt/traits.js` `stagger` | `traits/*.js` `(mode, host)`, the same `stagger` (moves to typology) |
| `contexts.host` spread onto ctx | `contexts.client` · `contexts.session` spread onto the loop's ctx |
| `integration.ledger` (spans → log) | `integration.ledger` on ghost; nothing on anima |
| `integration.serve` | `integration.target` (mounts the surfaces) |

## traps — from the codemaps, the ones this build hits

- `branch()` MUTATES the parent; `open()` silently REPLACES an effect; `affect()` on an affected node logs and returns `undefined` — never chain after it (`prototypes/vector.js:41-50`).
- `pattern.nature` has no slash; `open("/x")` → `"x"`.
- steer has NO segment-type precedence: declare literals before `:params` and before `(.*)`.
- `fire` dispatches on declared ARITY: `(input) =>` receives the CONTEXT (`steer/strategy.js:3-7`); write handlers `(input, ctx) =>`.
- a dispatch-family node's `use` wraps its DESCENDANTS (`steer/trie.js:4` `descend`), not its own effect — middleware on `die.loop` root wraps every signal.
- no eval-time `Vector`/`v` construction inside typology (barrel self-import → `undefined`; vite crashes). Same discipline in the ghost root barrel.
- `wire` DROPS `*` / `(.*)` with a warn and THROWS on a method-ambiguous leaf (`shape/connection.js:8`).
- never raw `fetch` over a Connection; SSE rides the multiplex (`lighthouse.runtime`, six HTTP/1.1 sockets per host otherwise).
- a `$`-store minted on an entity ships with a plain getter; consumers never write `x.$y?.get() ?? []`.
- law 16: no `?? {}` · `?.` · `||` default without a grep proving the absent case.
- a repo test never reads `~/.viva` or `:2501`; the client vector is tested on `@vivalence/runtime/scenarios` `bench`.
- `deno task test` never exits; one-shot `deno test -A --no-check <file>`. NEVER `deno fmt`.
- anima's localStorage key is `lighthouse:${connection.url}` (`stores/lighthouse.js:8`); keep it so a swap keeps the login.

## index — what follows, verbatim

1. the spec — m82's synthesis (`m82-runtime-clients.org:1034-1302`), QUESTIONED (`:2852-2871`), m79's law (`m79-terminal-ghost.org:201-215`)
2. runtime — the die, the boot vector, the lighthouse, userspace, metadata, the host belt, the traits the client mirrors
3. typology — Vector · Signature · Signal · Pattern · Queue · Pipe · Span · Controller · Connection · repositories · Stall · Bundle · steer · shard · fromm · shape · soma · contexts · instance
4. anima's data layer — Dataspace · Lighthouse · Terminals · the dossiers and entities that move into ghost
5. anima's shell — vite config, layout, gate, focus, Login, panel A, Dock, Frame
6. ghost — the door, `mod.js`, ShellSignal/ShellContext, help's census, `instance/user`, belt
7. kits — dapper's pipe and a theme, sheets' theme and Logo
8. rigs — opentui under Deno, Solid on opentui, the m80 ghost REPL walk
9. commons — the ledger recipe, hello-world


## the spec — m82's synthesis and demo, verbatim

### `.ikiro/quests/done/m82-runtime-clients.org:1034-1302`

```org
// .ikiro/quests/done/m82-runtime-clients.org:1034-1302
** the synthesis — a REPL process: 3's body, 1's loop, the Vector as the evaluator — Z

beef, 10-10, on reading the three: /"I'm thinking of the clients a little bit like a REPL … not as a chat interface, but as a REPL that has chat built in. So like Emacs is a client built into the Lisp REPL."/ · /"I really like the Haskell approach actually, this TEA thing. It's very close to what we already do."/ · /"I like this event ring thing. It's a nice pattern. So yeah, maybe we create a synthesis of all of this."/ · /"Then we would have modes be able to attach their own events. Which is basically the Emacs equivalent of … Control G? Or double space in Spacemacs?"/

Emacs is a C core (what opens the terminal, the files, the processes) under a Lisp command loop (one state, every keystroke an interactive command, every major mode contributing its own). The synthesis is the same cut: attempt 3's PROCESS is the core — the die, the lifecycles, what opens and closes; attempt 1's loop is the command loop; and that loop IS a Vector dispatched by Signal — the same =steer.dispatch= that routes a request on the runtime and an argv in ghost.

beef, 10-10, on the first cut (a =Ring= class with =db= · =on= · =fx=): /"we already have entities. We already have entity maps. We have the repository, remote repository … we don't need to recreate something."/ · /"I don't like ring … I don't like effects where you place it because effects is a taken name."/ · /"conceptualize what you'd call ring here as a vector itself. And then the ring is a bunch of tooling around it."/ · /"db … it's kind of like a die, it's a property of the die … as part of the execution of the ring we construct our context"/ · /"we have to be clever about the way that we differentiate the vector, the composer, aka what creates the contexts and the signal and executes them and how we traverse, that's the composer. And then what the nature of the context is, we now have in schematics … the tooling around contexts."/ · /"I'll think of a name. Continue calling it ring for now."/ · then, the same evening: /"we call it 'Loop'"/ — the name RULED: =Loop=, a prototype that IS a Vector and carries its composer.

So three things, each already in the house, no new kernel:

| piece | what it is | today |
|-------+------------+-------|
| the VECTOR | =die.loop=, a plain =Vector= on the client's die: every command, event and key an edge; a handler is its effect | =Vector= · =open= · =affect= · =branch= · =graft= |
| the COMPOSER | the die's root effect: =die.queue.drain(abort)= → one =steer.dispatch.invoke(die.loop, form, evaluate)= per form | =Queue= (=subsystems/typology/prototypes/queue.js=) · ghost's =mod.js:12= =strategy= |
| the CONTEXT | the words a handler sees — the client's words plus the session's | =schematics/primitives/contexts.js= word sets · =shard.context.spread= · a new =contexts.Loop= |

No =db=: entities stay the Dataspace's (identity map · =RemoteRepository= · =$entities=); the SESSION's words are atoms on the client (=$seat= · =$live= · =$echo= · =$slot= · =$chord=), the way =Terminal= carries =$thread= · =$buffer= · =$dock= today — surfaces subscribe to them, handlers write them. No =fx=: a handler writes ctx words (=ctx.stream = …=), and the middlewares composed BEFORE it act after =next()= — the harness's own =persisting= shape (=systems/runtime/traits/harnessed.js:102=). Effects are not data handed to a registry; they are middleware on the vector, registered by the lifecycle that owns the resource and gone with its =finally=.

| Emacs | the synthesis |
|-------+---------------|
| the C core | the die + =lifecycle/client/= (attempt 3) |
| the command loop · =M-x= | =die.loop=, a Vector, drained from =die.queue= by the die's root effect; =/= in the composer |
| global and buffer-local variables | the client's session atoms, spread onto ctx |
| an interactive command | an effect on the loop: =(input, ctx) → writes ctx= |
| =define-key= in a major mode's keymap | a mode's doors grafted under =/command/<slug>= from the strip the host published (m79 F15b); its declared keys under =/key/<slug>= |
| =C-g= =keyboard-quit= | =/abort= → =ctx.kill= the seat's activity |
| =SPC SPC= · =M-x= completion | the trie's census (ghost's =help= already walks it) in the slot |
| the minibuffer | =$slot= — what the last command painted |
| =read= · =eval= of the line you typed | =new ReplSignal(line)= then =invoke=: bare text is the root's effect (a turn), =/x= a command |
| the mode line | the crown |
| TEA: Model · Msg · update · Cmd · view | the session atoms · a Signal · an effect · a ctx word a middleware acts on · the surfaces' subscriptions |

#+BEGIN_SRC js
// subsystems/typology/schematics/primitives/contexts.js — the session's words beside the host's; a REPL handler sees both
export const client = { ...lighthouse, ...root, ...userspace, ...hosts, ...terminals, ...bridge };
export const session = { seat: v.unknown().desc("The seated terminal · thread · mode · host. Example: { terminal, thread, mode, host }"), live: v.unknown().desc("The transcript under construction, soma.transcript's fold"), echo: v.unknown(), slot: v.unknown().desc("What the last command painted"), chord: v.array(v.string()).desc('A held leader path. Example: ["terminal"]') };
export const Loop = { ...vector, ...client, ...session, ...optional(stream), ...optional(kill) };
#+END_SRC

beef, 10-10, after the first Loop prototype: /"we do already have some prototypes in typology for queuing and such. We might not have to roll our own here."/ · /"the client is still created as a die and the loop vector is a property on that die … And then we have still our … data map that we populate … as part of the boot vector, as part of the life cycle of the client, exactly the same structure as we have in the runtime. And then we have … the loop as the execution loop."/ · /"I really like the REPL paradigm. Fuck yes."/ — RULED: no =Loop= class; the name =Loop= stays for the whole (die · vector · queue · drain).

| REPL | the Loop | from |
|------+----------+------|
| Read | the reader: =new ReplSignal(x)=, coercion rows over a line · an argv · an event · a key | =Signature.coercions= (=subsystems/typology/prototypes/signature.js:31=) |
| Eval | =steer.dispatch.invoke(die.loop, form, evaluate)= | =subsystems/typology/gestalten/steer/dispatch.js:61= |
| Print | the session atoms; a stream's packets fold into =live= | =Pipe.reactive(seed, step)= (=prototypes/pipe.js:17=) |
| Loop | =for await (const input of die.queue.drain(die.controller.abort.signal))= | =Queue.drain(signal)= (=prototypes/queue.js:24=) |
| the trace | a span per form off =die.controller.stdout=; =stdout.pipe.replay(stdout.records)= is =*Messages*= | =Span= (=prototypes/span.js=) · its =Pipe= channel |

beef, 10-10, pointing at =prototypes/pipe.js= · =queue.js= · =span.js=. The three are the Loop's three channels: =Queue= holds what comes IN (a backlog, drained once, in order), =Pipe= carries what flows THROUGH (fan-out now, =replay= for a late reader, =reactive= folds it into an atom), =Span= records what HAPPENED (a journal plus a =Pipe=). =fromm.sink= already writes into a Queue (=enqueue=) and a Pipe (=send=), so any source feeds the loop with no glue: a target's key Pipe =.to(die.queue)=, a button =die.client.dispatch(x)=.

#+BEGIN_SRC js
// systems/ghost/client.js — the client's die, run.js's twin: the controller, the mask, the client, the loop and its queue
export const boot = (mask, target) => {
  const die = {
    controller: new Controller({ stdout: new Span(`client/${target.name}`) }),
    mask,
    client: new Client({ mask, target }),
    loop: new Vector(),
    queue: new Queue(),
  };
  return steer.dispatch.execute(execution, die);
};
#+END_SRC

#+BEGIN_SRC js
// systems/ghost/lifecycle/client/execution.js — the runtime's execution one for one (systems/runtime/lifecycle/runtime/execution.js); the root effect is the REPL where the runtime's is keepalive
export const execution = new Vector()
  .use(process.settle)
  .use(population.lighthouse)
  .use(population.dataspace)
  .use(population.hosts)
  .use(population.loop)
  .use(resolution.seat)
  .use(integration.ledger)
  .use(integration.target);

execution.affect(process.repl);
#+END_SRC

#+BEGIN_SRC js
// systems/ghost/lifecycle/client/process.js — the drain: one form at a time until the controller aborts; killing the die ends the for-await and every lifecycle unwinds through its finally
export const repl = async (die) => {
  die.controller.stdout.open();
  for await (const input of die.queue.drain(die.controller.abort.signal)) await steer.dispatch.invoke(die.loop, new ReplSignal(input), evaluate)(die);
};

const evaluate = (carry, effect, steps, form) => (die) =>
  carry(
    { signal: form, steps, params: fromm.match(steps).parameters, input: (form.fin ?? form).input, span: die.controller.stdout },
    (ctx) => steer.strategy.fire(effect, ctx),
  );
#+END_SRC

#+BEGIN_SRC js
// systems/ghost/lifecycle/client/population.js — the loop's middleware: the words, a span per form, the capture, then the two effects that act after next()
export const loop = async (die, next) => {
  die.loop
    .use(shard.context.spread(contexts.client, die.client))
    .use(shard.context.spread(contexts.session, die.client))
    .use(shard.track.span((ctx) => ctx.signal.pathname))
    .use(capturing)
    .use(streaming(die))
    .use(killing);
  gestalten.repl(die.loop);
  gestalten.leader(die.loop);
  die.client.dispatch = fromm.sink(die.queue).write;
  die.client.packets = new Pipe();
  die.client.live = die.client.packets.reactive(null, soma.transcript);
  await next();
};

const capturing = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.span.fault(error);
    ctx.slot.set({ fault: error.message });
  }
};

const streaming = (die) => async (ctx, next) => {
  await next();
  if (!ctx.stream) return;
  pump(die.client, die.client.root.stream(ctx.stream.path, ctx.stream.input), ctx.stream.done);
};

const pump = async (client, packets, done) => {
  for await (const packet of packets) client.packets.send(packet);
  client.dispatch({ signal: done });
};

const killing = async (ctx, next) => {
  await next();
  if (ctx.kill) await ctx.kill.stdin.stop();
};
#+END_SRC

beef, 10-10: /"error handling is quite simple … the loop itself isn't concerned with that at all … the loop gets a middleware attached that captures errors just the same way that we have it on the server."/ — =capturing= is =shape.http='s =catch= (=subsystems/typology/gestalten/shape/http.js:24=) on the loop: the server answers 500, the client paints the slot; the drain never sees a throw. /"we can use spans here extremely elegantly"/ — =shard.track.span= (=subsystems/typology/gestalten/shard/track.js:12=) branches =die.controller.stdout= per form: =/client/tty/command/terminal/new= opens, marks, faults, closes; the journal (1000 records, =prototypes/span.js:5=) is the client's =*Messages*=, a surface subscribes =die.controller.stdout.to(…)=, ghost's =integration.ledger= appends it to the ledger log the way the runtime does (=systems/runtime/lifecycle/runtime/integration.js:11=).

Atoms for the queue — no: an atom holds ONE value (the last); two dispatches in one tick are one value to a late reader, and a listener that handles the event runs it nested — the first cut's bug. =Queue= is ordered, awaitable and abortable by the controller's own signal. Atoms stay the PRINT side: the session's words the surfaces read.

*** the reader — the REPL's own signal

beef, 10-10: /"I don't think we can use the standard signal here … what we get with the event is not name and input really … what we get is the REPL input … might be just text, in which case it's sent to the mode. It might be commands … And buttons … might also invoke the loop. So the signal here needs to be very well designed."/ m79 laid the grammar (=benched/m79-terminal-ghost.org= =* the law=): /"signal must be constructed to match either different vectors or different signatures in one"/ — one trie for command · reference · yap; flags on the fin; precedence literal < parameter < wildcard < remainder, owed in typology.

| input | from | row | segments | payload on the fin |
|-------+------+-----+----------+--------------------|
| bare line | the prompt | text without =/= | none: =nature= null → the root's own effect | =[{ type: "text", text }]= |
| sigil line | the prompt | text with =/= | =command= + =Signal='s string grammar, flags on the fin | the operands |
| argv | ghost's shell | an array | =command= + m79's argv row | the operands |
| event | a button · a pump · a mode key | ={ signal, input }= | the path as given | =input= as data |
| key | a target's keydown | ={ key }= | =key= + the chord | none |

#+BEGIN_SRC js
// systems/ghost/prototypes/replsignal.js — the reader: what the REPL reads becomes one Signal; the payload rides the fin the way Signal's flags do (subsystems/typology/prototypes/signal.js:59)
export class ReplSignal extends Signal {
  static coercions = [
    [(line) => is.string(line) && !line.startsWith("/"), function (line) {
      this.nature = null;
      this.input = [{ type: "text", text: line }];
      return null;
    }],
    [(line) => is.string(line), (line) => [{ nature: "command" }, ...new Signal(line).array.map(({ nature, flags }) => ({ nature, flags }))]],
    [(argv) => is.array(argv), (argv) => [{ nature: "command" }, ...new Signal(argv).array.map(({ nature, flags }) => ({ nature, flags }))]],
    [(event) => is.object(event) && is.string(event.signal), (event) => {
      const segments = event.signal.split("/").filter((nature) => nature.length).map((nature) => ({ nature }));
      segments.at(-1).input = event.input;
      return segments;
    }],
    [(press) => is.object(press) && is.string(press.key), (press) => [{ nature: "key" }, { nature: press.key }]],
  ];
}
#+END_SRC

Why =command= prefixes the line and the argv: a typed =/turn/packet= must never reach the loop's internal events; the prompt reaches =/command= and the root only. =new Signal(argv)= assumes m79's argv row on typology =Signal= — proposed there, NOT landed (=ShellSignal= dies into it). The name =ReplSignal=, beef 10-10: /"custom signal. replsignal."/

#+BEGIN_SRC js
// systems/ghost/gestalten/repl.js — the REPL's own edges: the line, the turn, the packet, the quit; a handler writes atoms and ctx words
export const repl = (loop) =>
  loop
    .affect((parts, ctx) => ctx.dispatch({ signal: "/turn/send", input: parts }))
    .open("/command/(.*)", (operands, ctx) => ctx.slot.set({ pick: ctx.signal.pathname }))
    .open("/turn/send", (parts, ctx) => {
      const { thread, mode } = ctx.seat.get();
      const id = crypto.randomUUID();
      ctx.echo.set({ id, role: "user", parts });
      ctx.live.set(null);
      ctx.stream = { path: `${mode.reference}/harness/dialogue/stream`, input: { thread: thread.id, id, parts }, done: "/turn/done" };
    })
    .open("/turn/done", (_, ctx) => { ctx.live.set(null); ctx.echo.set(null); })
    .open("/abort", (_, ctx) => { ctx.kill = ctx.seat.get().activity; })
    .open("/slot", (painted, ctx) => ctx.slot.set(painted));
#+END_SRC

Modes attach their own events — two seams, both DATA over the wire (the client stays domain-blind):

#+BEGIN_SRC js
// systems/ghost/traits/exposed.js — (mode, host): the mode's doors become commands under its slug, each leaf calling the wired door and painting into the slot
export const EXPOSED = async (mode, host) => {
  const strip = await mode.connection.call("/metadata/aperture");
  mode.call = shape.connection.wire(mode.connection, strip);
  return () => {
    const commands = new Vector();
    for (const [name, leaf] of shape.leaves(strip)) commands.open(name, async (input, ctx) => ctx.slot.set(await leaf.call(input)));
    host.client.loop.branch(`/command/${mode.manifest.slug}`, commands);
  };
};

// systems/ghost/traits/application.js — keys a mode's application declares (data in /metadata/application) ride the loop; the view itself gets dispatch in its props
export const APPLICATION = async (mode, host) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = { url: record.url, schema: record.schema, bundle: new Bundle(record.bundle).withUrl(record.url), keys: record.keys ?? {} };
  return () => {
    const keys = new Vector();
    for (const [chord, event] of Object.entries(mode.application.keys)) keys.open(chord, (_, ctx) => ctx.dispatch(event));
    host.client.loop.branch(`/key/${mode.manifest.slug}`, keys);
  };
};
#+END_SRC

The mount contract gains one prop: =module.default(target, { …props, dispatch: client.dispatch })= — a buffer view fires =dispatch("/buffer/release")= the way an Emacs buffer calls an interactive command; =buffer.on.release= stays as the hook the stall reads. Ghost's trajectory grafts whole under =/command= (=client.loop.branch("/command", trajectory)=): =viva instance/doctor= on the argv and =/instance/doctor= in the composer are ONE trie, ONE census — m79's law, now literally one Vector. A key chord on a target (=ctrl-t=, a dom =keydown=) dispatches =/key/<chord>=, the seated mode's branch answering first.

beef, 10-10: /"spacemacs"/ — the reference is Spacemacs, not vanilla: a LEADER opens a mnemonic key tree (=SPC f f= · =SPC b b=), which-key paints the next segments as you go, =SPC SPC= is =M-x=, =,= is the seated major mode's own leader, a layer is what contributes keys and commands. The trie already is that tree; the client only needs the leader and the hint.

| Spacemacs | the synthesis |
|-----------+---------------|
| =SPC= leader (normal state) | =/= in the composer; =SPC= when a frame or the navigation has focus — both dispatch =/command= |
| =SPC f f= — a mnemonic path | =/t n= → =/command/terminal/new=: segments are the trie's edges, typed or clicked |
| which-key — the popup of what comes next | the slot lists the current node's children, from the trie's own census (=systems/ghost/trajectories/help.js= =census=; m79: a bare noun lists its own children) |
| =SPC SPC= — =M-x= | =/ /= or =/ ?= — the whole census, filtered as you type |
| =,= — the major-mode leader | =/,= → =/command/<seated mode slug>/…=: the seated mode's branch, its doors as commands |
| a layer | a mode's EXPOSED strip + APPLICATION keys, grafted on seat, pruned on unseat |
| =C-g= | =esc= in a held chord: the partial path drops, the slot clears; =/abort= only on a running turn |

#+BEGIN_SRC js
// systems/ghost/gestalten/repl.js — the leader: a partial path paints which-key; a complete one dispatches; the seated mode is ","
export const leader = (loop) =>
  loop.open("/repl/chord", (segments, ctx) => {
    const path = segments[0] === "," ? [ctx.seat.get().mode.manifest.slug, ...segments.slice(1)] : segments;
    const node = steer.trie.at(ctx.loop.branch("/command"), path);
    if (!node) { ctx.chord.set(null); return ctx.slot.set({ refused: path.join(" ") }); }
    if (node.effect) { ctx.chord.set(null); return ctx.dispatch(`/command/${path.join("/")}`); }
    ctx.chord.set(path);
    ctx.slot.set({ which: node.trajectories.map((child) => ({ key: child.key, valence: child.valence })) });
  });
#+END_SRC

=steer.trie.at= is owed (today =steer.dispatch.traverse= walks a Signal to its node and ghost's =census= lists the leaves; the leader needs the node's children by path).

*** the queue — what re-frame teaches the Loop

beef, 10-10, pasting a reading of the first cut against Emacs · re-frame · Elm: /"were on to something for the client architecture here."/ It named two departures from re-frame — no queue, and effect order by key order. Both answered by shape:

| re-frame | first cut | the Loop |
|----------+-----------+----------|
| =dispatch= queued, one event per tick | awaited inside the caller, nested | =die.queue.enqueue=, one drain in the root effect |
| =:db= applied first | the handler's key order | a handler writes atoms in its body; effects act after =next()= |
| interceptor =:before= | — | =spread= · =shard.track.span= (coeffects) |
| interceptor =:after= + =reg-fx= | an =fx= registry | =capturing= · =streaming= · =killing= (effects) |
| an effect that dispatches later | the stream ran INSIDE =/turn/send= | the stream is a =Pipe=, not forms: packets fold into =live= (Elm's =Sub=); only =/turn/done= queues |
| =dispatch-sync= | — | none; a test enqueues and awaits the drain |

The pump is what the queue forces: a drain that awaited a whole stream would hold =/abort= behind it — a queue without the pump deadlocks =C-g=. The pump writes packets to =client.packets=, never to the queue: a turn is two forms (=/turn/send= · =/turn/done=), not sixty a second, and the span journal (1000 records) keeps commands, not tokens. =/abort= runs while the pipe flows, =killing= stops the activity, the stream ends, =/turn/done= queues last. The bare line hits the root's own effect (=Vector.affect=, the fall-through, =dispatch.js:20=); an unknown command hits =/command/(.*)= and paints the pick (m79: /"send to $home, retry search, open as turn"/). =steer= has no precedence yet — a mode's layer grafted after =(.*)= loses to it until typology's precedence law lands.

What each attempt gives up to the synthesis: 1's =db= and effects-as-data (entities stay the Dataspace's; effects are middleware) · 2's kernel (demand lives in lifecycles' =finally=) · 3's surfaces-as-mounts-only (a surface now subscribes the session atoms and DISPATCHES; it owns no state). The three laws kept: the session's state is the client's atoms, written only by the loop's effects · what a lifecycle opens it closes · every address is a reference.

Assess: the Loop is the runtime's die shape with a REPL for a root effect: a Vector and a =Queue= on the die, one reader (=ReplSignal=), one lifecycle and one =contexts= word set over attempt 3, no new kernel, and removes state from the surfaces (today's =Dock.svelte= holds =live · echo · sending · error · draft · pinned · unread · metaOpen · picked= as nine =$state=s — session atoms now). The seam modes get — commands from the strip, keys from the application record — costs the runtime one key (=application.keys=) and the client nothing new. The demo's estimate moves by half a session. The name: =Loop=, beef's, 10-10.
```

### `.ikiro/quests/done/m82-runtime-clients.org:2852-2871`

```org
// .ikiro/quests/done/m82-runtime-clients.org:2852-2871
* QUESTIONED — surfaced by the friction, beef's

- Q1 the client's noun for a mount: =host= (the runtime's word since m81) or another. Today =Daemon= (=typology/entities/daemon/daemon.js:4=).
- Q2 =Terminal.daemon= (=systems/runtime/entities/Terminal.ts:15=): does the column die, now that a terminal's thread names its mode and the mode its host?
- Q3 one wired root (=shape.connection.wire= over the root's =/metadata/aperture=, which already strips =/runtime/<slug>= beside =/daemon/<slug>=) or a =call= per host (=dossier.js:118=).
- Q4 the dead links (=/viva/<runtime>/<daemon>=): cut, or re-cut on references.
- Q5 rebuild in place under =typology/= or beside it, then swap; =anima-panels-cards.org= holds uncommitted pane work that reads this core.
- Q6 RULED 10-10 /"q6 yes"/: typology takes =scalars/mime.js= · =primitives/bundle.js=, =View= folded into =Bundle=, buffer key =view= → =bundle= (=schematics/entities/buffer.js:18=).
- Q7 RULED 10-10 /"q7 lets start with a"/: the model picks the medium (=tty.solid=, strand R) from the harness's =accept= line; the daemon forcing it stays a later option.
- Q8 RULED 10-10 /"q8 probe the fuck out of this."/ — PROBED, held, then KILLED by Q10 (=** ink in anima — probed 10-10 (Q8), KILLED by Q10=).
- Q9 SUPERSEDED by Q10: the client door was for ink in anima; with opentui, sheets serves ghost only (=** sheets after ink — N=).
- Q10 RULED 10-10 (strand N): /"opentui instead of ink. no ink."/ — opentui/solid for ghost; react and solid the standard targets on both hosts; anima to solid eventually.
- Q11 RULED 10-10 (strand O): /"we dont reuse apps across render targets. lets keep it simple."/ — anima never mounts =mime.tty.*=; a buffer without a =mime.dom.*= entry falls to the floor there. REJECTED: the remote stream (probed 7/7, kept as evidence) · a wasm OpenTUI core · our own browser renderer for =<box>=.
- Q12 RULED 10-10 (strand P): /"patch step in ghost/install. thats what its for."/ — =systems/ghost/install.sh= (=deno.jsonc:46=) patches =@opentui/core= after =deno task dependencies= fills =node_modules= (=deno.jsonc:29=): find the chunk by its CONTENT (=requireModule("node:ffi")=), never its hashed name; idempotent (=__opentuiNodeFfi= present → skip); the anchor absent → the install FAILS naming the opentui version. Strand Q, the version law: =@opentui/{core,solid,react}= pinned EXACT in =import_map.json= (=0.5.17=, never =^= · =~= · =@0.5=), the patch keyed to that version — the installed =@opentui/core/package.json= =version= unequal to the pin → the install FAILS before touching a byte; a bump is an act: re-pin, re-run the opentui rig (=testament/prototypes/opentui/=, 16/16 · 8/8 · 2/2), re-cut the patch. The native libs ride as =optionalDependencies= pinned exact by opentui itself (=@opentui/core-darwin-arm64= =0.5.17=); =deno.lock= holds the transitive caret (=react-reconciler ^0.33.0= under =@opentui/react=). REJECTED: a fork · an upstream PR as the fix.
- Q13 RULED 10-10 (strand R): /"kind dies."/ · /"other way round. group.target.framework"/ — one mime per row, =application/vnd.vivalence.<target>.<framework>+javascript=; =kind= leaves bundle entries, =App= sources, =bundle()= and the model's input. The target words: /"dom and tty."/ — =dom= · =tty=. REJECTED: =opentui= (beef) · =tui= · =cells= · =terminal= · =host= (both taken).
- Q15 the home mode: =/runtime/runtime/mode/home/home= is an example string only (=subsystems/typology/schematics/primitives/instance.js:58=); =~/.viva/ledger.viva.json= =runtime.modes: []=; no module of type =home= under =commons/= or =~/.viva/registry=. A HARNESSED mode in =commons/modes/home/= seated in =runtime.modes=, or the ledger's — whose?
- Q16 how the client RECORD reaches a browser: =instance.clients[].home= is read by paladin on the server; anima's static build holds only =PUBLIC_VIVA_*= (=_app/env.js=). =PUBLIC_VIVA_CLIENT_HOME= in the env, or the root serving =/metadata/clients= beside =/metadata/daemons= (=systems/runtime/lifecycle/runtime/resolution.js:93=)?
- Q17 =contexts.client= — the word list a client's ctx carries (=subsystems/typology/schematics/primitives/contexts.js:55= has =host= only): =lighthouse · root · userspace · hosts · modes · terminals · bridge · surface=? A dossier's boot vector and a surface's mount both read it.
- Q18 the Loop's fault — RULED 10-10 by beef: /"the loop itself isn't concerned with that at all … a middleware … that captures errors just the same way that we have it on the server."/ → =capturing= on =die.loop= (=* the synthesis=).
- Q14 RULED 10-10 /"q14a."/ — (a), the loss accepted: generated pages redraw on ask, no fold, no migration; the old =<hash16>.svelte.mjs= artifacts stay on disk unserved and unpruned (=viva instance/cleanup= removes them only by hand). The question as asked — what stage 1 does to the data already on disk. The column =Buffer.view= becomes =bundle= (=systems/runtime/entities/Buffer.ts:40=); mikro migrates a renamed prop as drop + create (=world/codemap/invariants.md=: never author a migration), so every generated page's buffer loses its pointer and falls to the floor. The artifacts =<hash16>.svelte.mjs= no longer match the bundler's name (=<hash16>.dom.svelte.mjs=): =serve= refuses them and =prune= never sees them. Options: (a) accept the loss — generated pages are redrawn on ask, app buffers carry =view: null= already and lose nothing; (b) a one-shot fold in =viva instance/cleanup= (=systems/ghost/trajectories/instance/cleanup.js:6=) that renames the artifacts and rewrites rows before the next boot.
```

### `.ikiro/quests/m79-terminal-ghost.org:201-215`

```org
// .ikiro/quests/m79-terminal-ghost.org:201-215
* the law

#+BEGIN_EXAMPLE
One trajectory. A command, a reference and a yap are three edges of one trie, matched by one traverse; the shell re-mounts the same trajectory as its stdin.
A reference is a literal opened at mount, never a pattern that consults a store. Precedence is literal < parameter < wildcard < remainder, by law; ambiguity is the scope, rendered.
One signal grammar: typology Signal coerces the string AND the argv; flags live on the fin segment.
Three ways ghost holds the terminal, beef 10-06: cut (inline, one-off — a command runs and is done) · captured (inline, ongoing — interactive, the head stays held) · chrome (fullscreen, captured, ongoing). The alternate screen is one escape pair in one sheets primitive, never a word in a comment.
The client never calls the runtime by object; it speaks through a Connection. Hosting changes the transport, never the client; the runtime composes every path, a client composes none.
One instance per ghost process. A ghost that hosts a runtime claims the instance lock like instance/run; an instance ALIVE is joined, never booted twice.
Authority is a ledger record keyed by lighthouse origin — anima's key law — at VIVA_CLIENT_GHOST_CREDENTIALS_FILE, default <ledger>/credentials.json; many lighthouses, one file.
The shell is a Terminal: a lighthouse row seated on a thread, rendering a dock first and buffers later — anima's verbs, no third way.
A handler sets ctx.effect; the shell renders. Nothing in a trajectory prints.
(proposed by the architecture pass, F15) A Vector is the one contribution surface: a mode's doors reach the trajectory as the strip the runtime published, rebuilt as edges under the mode's literal; the client still composes no path.
(proposed by the architecture pass, F16) In the dock bare text is a turn and a sigil opens the trajectory; in the shell argv commands win and -- ends them.
#+END_EXAMPLE
```


## runtime — the die, the boot vector, the host belt (what the client mirrors)

### `systems/runtime/run.js`

```js
// systems/runtime/run.js
import paladin, { lifecycle } from "@vivalence/paladin";
import { Aperture, Controller, Path, Span, steer } from "@vivalence/typology";
import { Runtime } from "./prototypes/index.js";
import { execution } from "./lifecycle/runtime/execution.js";

if (import.meta.main) {
  await lifecycle.mount(paladin.instance);

  const die = {
    aperture: new Aperture(),
    controller: new Controller({ stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`) }),
    mask: paladin.instance.runtime,
    runtime: new Runtime({ instance: paladin.instance, slug: paladin.instance.runtime.manifest.slug, reference: new Path(paladin.instance.runtime.reference) }),
  };

  die.controller.stdout.to((record) => console.log(`[${record.path}] ${record.verb}`, record.data ?? record.message ?? ""));
  die.controller.stdout.to((record) => record.verb === "open" && record.span === die.controller.stdout.id && console.log(die.controller.status));
  for (const signal of ["SIGTERM", "SIGINT", "SIGQUIT"]) Deno.addSignalListener(signal, () => die.controller.kill("SIGTERM", signal));

  await steer.dispatch.execute(execution, die);
  Deno.exit(die.controller.status.is("STOPPED") ? 0 : 1);
}
```

### `systems/runtime/lifecycle/process.js`

```js
// systems/runtime/lifecycle/process.js
import { control } from "@vivalence/typology";

export const settle = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};

export const keepalive = async (die) => {
  die.controller.stdout.open();
  await control.hold(die.controller);
};
```

### `systems/runtime/lifecycle/runtime/execution.js`

```js
// systems/runtime/lifecycle/runtime/execution.js
import { Vector } from "@vivalence/typology";
import * as process from "../process.js";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import * as aperture from "./aperture/index.js";
import * as host from "../host/index.js";
import { execution as daemon } from "../daemon/execution.js";
import { execution as service } from "../service/execution.js";
import { execution as mode } from "../mode/execution.js";

export const execution = new Vector()
  .use(process.settle)
  .use(population.validate)
  .use(population.registry)
  .use(population.datamap)
  .use(population.aperture)
  .use(population.acid)
  .use(aperture.lighthouse)
  .use(aperture.userspace)
  .use(population.modes)
  .use(resolution.modes(mode))
  .use(host.aperture.metadata)
  .use(host.aperture.cortex)
  .use(population.services)
  .use(population.daemons)
  .use(resolution.services(service))
  .use(resolution.daemons(daemon))
  .use(resolution.attach)
  .use(resolution.expose)
  .use(resolution.metadata)
  .use(integration.prune)
  .use(integration.ledger)
  .use(integration.patrol)
  .use(integration.serve);

execution.affect(process.keepalive);
```

### `systems/runtime/lifecycle/runtime/population.js`

```js
// systems/runtime/lifecycle/runtime/population.js
import paladin from "@vivalence/paladin";
import { contexts, Cortex, shard } from "@vivalence/typology";
import { Daemon, DaemonSchema } from "../../prototypes/daemon.js";
import { Service, ServiceSchema } from "../../prototypes/service.js";
import { ActivityEntity, ActivityRepository, ProcessRepository, ProcessSchema, kernel, sets } from "../../entities/index.ts";
import { assemble, host, mint, strike } from "../../gestalten/belt/index.js";
import * as schematics from "../../schematics/index.js";
import * as traits from "../../traits/index.js";

export const validate = async (die, next) => {
  paladin.check.instance(die.runtime.instance).throw();
  const faults = schematics.Instance.faults(die.runtime.instance);
  if (faults.length) throw new Error(`runtime: ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
  await next();
};

export const registry = async (die, next) => {
  await paladin.ledger.registry.supply();
  await next();
};

export const datamap = async (die, next) => {
  const citizen = await paladin.ledger.registry.accio(die.runtime.instance.datamap?.module ?? "@commons/datamap/libsql");
  die.runtime.processes.datamap = await citizen.provider(
    { statics: { context: { name: `runtime/${die.mask.manifest.slug}/processes` } } },
    { entities: [ProcessSchema, ServiceSchema, DaemonSchema] },
  );
  die.runtime.processes.service = new ProcessRepository(die.runtime.processes.datamap.orm.em, Service);
  die.runtime.processes.daemon = new ProcessRepository(die.runtime.processes.datamap.orm.em, Daemon);
  const { entities, twitch } = assemble([sets.identity, sets.composition, sets.kernel, sets.userspace, sets.transient]);
  die.runtime.datamap = await citizen.provider(
    { mountpoint: paladin.scope.mountpoint, statics: { db: { file: `${die.runtime.instance.manifest.slug}.viva.db` }, context: { name: `runtime/${die.mask.manifest.slug}` } } },
    { entities: entities.map((descriptor) => descriptor.schema) },
  );
  die.runtime.entities = { ...die.runtime.datamap.entities };
  die.runtime.entities.activity = new ActivityRepository(die.runtime.datamap.entities.em, ActivityEntity);
  die.runtime.twitch.use(shard.context.spread(contexts.host, die.runtime));
  for (const held of twitch) die.runtime.twitch.graft(held);
  die.runtime.twitch.branch("/after").use(shard.datamap.detached(die.runtime.datamap));
  die.runtime.datamap.registerSubscriber(die.runtime.twitch);
  die.runtime.minted = mint({ slug: null, kinds: { note: sets.kernel.note, mode: sets.kernel.mode }, traits: { note: kernel.note, mode: kernel.mode } });
  Object.assign(die.runtime.entities, strike(die.runtime.minted, die.runtime.datamap.entities.em, sets.kernel));
  die.aperture.use(shard.datamap.inject(die.runtime.datamap));
  try {
    await next();
  } finally {
    await die.runtime.entities.activity.remove({});
    await die.runtime.datamap.close();
    await die.runtime.processes.datamap.close();
  }
};

export const aperture = async (die, next) => {
  die.aperture.open("/status", () => die.controller.status);
  await next();
};

export const acid = async (die, next) => {
  die.runtime.cortex = new Cortex();
  const citizens = await Promise.all((die.runtime.instance.hallucinators ?? []).map((query) => paladin.ledger.registry.accio(query)));
  for (const [index, citizen] of citizens.entries()) {
    try {
      const faculties = await citizen.provider(citizen);
      die.runtime.cortex.register(faculties.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
    } catch (error) {
      console.warn(`[provider] hallucinators[${index}] ${citizen.manifest.slug} refused — ${error.message}`);
    }
  }
  await next();
};

export const modes = async (die, next) => {
  die.runtime.register = await paladin.ledger.registry.wire(die.mask);
  die.runtime.domain = die.runtime.register.domain;
  die.runtime.controller = die.controller;
  die.runtime.manifest = die.mask.manifest;
  die.runtime.url = die.mask.url;
  die.runtime.attach = die.mask.attach;
  die.runtime.mountpoint = die.mask.mountpoint;
  die.runtime.statics = die.mask.statics ?? null;
  const { DATASET, DATASINK, ...admitted } = traits;
  die.traits = admitted;
  die.host = host.seat(host.host(die.runtime), die.runtime.register.modes);
  await next();
};

export const services = async (die, next) => {
  const masks = await Promise.all(die.runtime.instance.services.map((query) => paladin.ledger.registry.accio(query)));
  await die.runtime.processes.datamap.shard.scope(() =>
    Promise.all(
      masks.map((mask) => {
        if (!mask.manifest.traits.includes("ATTACHED")) {
          return die.runtime.instance.dormant.push({ at: `service[${mask.manifest.slug}]`, module: mask.identifier, empty: [], why: "not ATTACHED — consumed only" });
        }
        return die.runtime.processes.service.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.reference.absolute) });
      }),
    ),
  );
  try {
    await next();
  } finally {
    await die.runtime.processes.service.remove();
  }
};

export const daemons = async (die, next) => {
  const prune = paladin.env.get("VIVA_RUNTIME_PRUNE") === "1";
  const repository = die.runtime.entities.daemon;
  const declared = new Map(die.runtime.instance.daemons.map((mask) => [mask.manifest.slug, mask]));
  await die.runtime.datamap.shard.scope(async () => {
    const orphans = (await repository.find({})).filter((row) => !declared.has(row.slug));
    if (orphans.length && !prune)
      throw new Error(`instance: ${orphans.map((row) => row.slug).join(", ")} held in the datamap but absent from instance.viva.json — viva instance/start --prune to drop them`);
    for (const row of orphans) await repository.removeOne({ slug: row.slug });
    for (const [slug, mask] of declared)
      await repository.ensure({ slug, mask: die.runtime.instance.raw.daemons.find((entry) => entry.manifest.slug === slug), traits: mask.manifest.traits ?? [] });
    await die.runtime.entities.em.flush();
  });
  await die.runtime.processes.datamap.shard.scope(() =>
    Promise.all(
      die.runtime.instance.daemons.map((mask) =>
        die.runtime.processes.daemon.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.reference.absolute) }),
      ),
    ),
  );
  try {
    await next();
  } finally {
    await die.runtime.processes.daemon.remove();
  }
};
```

### `systems/runtime/lifecycle/runtime/resolution.js`

```js
// systems/runtime/lifecycle/runtime/resolution.js
import paladin from "@vivalence/paladin";
import { Cargo, contexts, fromm, shape, shard } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";
import { cargo } from "../../gestalten/shard/index.js";

export const services = (execution) => async (die, next) => {
  try {
    for (const service of await die.runtime.processes.service.find()) await service.execute(execution);
    await next();
  } finally {
    await die.runtime.processes.service.kill({}, "SIGTERM");
  }
};

export const daemons = (execution) => async (die, next) => {
  try {
    for (const daemon of await die.runtime.processes.daemon.find()) await daemon.execute(execution, { runtime: die.runtime });
    await next();
  } finally {
    await die.runtime.processes.daemon.kill({}, "SIGTERM");
  }
};

export const modes = (execution) => async (die, next) => {
  die.runtime.aperture.use(die.runtime.lighthouse.authenticate).use(die.runtime.lighthouse.bind);
  try {
    await host.resolve(die.host, execution, die.traits);
    die.runtime.cargo = new Cargo(() => fromm.modes(die.runtime.modes).flat.filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED")).map((mode) => mode.freight));
    await next();
  } finally {
    await host.release(die.host);
  }
};

const hosts = async (die) => [...(await die.runtime.processes.daemon.find()), die.host];

export const attach = async (die, next) => {
  for (const service of await die.runtime.processes.service.find()) {
    die.aperture.branch(service.reference.absolute, service.attachment);
  }

  for (const bearer of await hosts(die)) {
    for (const mode of fromm.modes(bearer.modes).flat) {
      if (!mode.implements("APPLICATION") && !mode.implements("GENERATIVE")) continue;
      const bundler = paladin.bundler(mode.bundles.absolute);
      die.aperture
        .branch("/attached/bundle")
        .branch(bearer.reference.absolute)
        .branch(mode.reference.absolute)
        .open("/(.*)", async (input, ctx) => {
          const served = await bundler.serve(fromm.params(ctx.params).path.absolute);
          if (!served) {
            ctx.response.status = 404;
            return null;
          }
          ctx.response.type = served.type;
          ctx.response.headers.set("x-viva-integrity", `sha256-${served.integrity}`);
          return served.text;
        });
    }

    const fraught = fromm.modes(bearer.modes).flat.filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED"));
    if (!fraught.length) continue;
    die.aperture
      .branch("/attached/cargo")
      .branch(bearer.reference.nature)
      .use(shard.context.spread(contexts.host, bearer))
      .open("/(.*)", cargo.serve(() => fraught));
  }

  await next();
};

export const expose = async (die, next) => {
  const runtime = die.aperture.branch(die.runtime.reference.nature, die.runtime.aperture);
  runtime.branch("/status", shard.nano.atom(die.runtime.controller.status.$transient));
  runtime.open("/batch", shard.batch.route(runtime));
  for (const daemon of await die.runtime.processes.daemon.find()) {
    const branch = die.aperture.branch(daemon.reference.nature, daemon.aperture);
    branch.branch("/status", shard.nano.atom(daemon.$status));
    branch.open("/batch", shard.batch.route(branch));
  }
  await next();
};

export const metadata = async (die, next) => {
  const root = die.aperture.branch("/metadata");

  root.open("/manifest", () => die.mask.manifest);
  root.open("/aperture", () => shape.strip(die.aperture));
  root.open("/datamap", () => shard.datamap.strip(die.runtime.datamap.getMetadata()));

  root.open("/daemons", async () =>
    (await die.runtime.processes.daemon.find()).map((daemon) => ({
      slug: daemon.slug,
      reference: daemon.reference.nature,
      modes: fromm.modes(daemon.modes).flat.length,
      metadata: `${daemon.reference.nature}/metadata`,
    })),
  );

  root.open("/services", async () =>
    (await die.runtime.processes.service.find()).map((service) => ({
      type: service.manifest.type,
      slug: service.slug,
      reference: service.reference.absolute,
      metadata: `${service.reference.absolute}/metadata`,
    })),
  );

  await next();
};
```

### `systems/runtime/lifecycle/runtime/integration.js`

```js
// systems/runtime/lifecycle/runtime/integration.js
import paladin from "@vivalence/paladin";
import { shard, shape } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";

export const prune = async (die, next) => {
  await host.prune(die.host);
  await next();
};

export const ledger = async (die, next) => {
  const log = paladin.ledger.log(die.runtime.instance.manifest.slug);
  die.controller.stdout.to((record) => log.append({ json: record }));
  await next();
};

export const patrol = async (die, next) => {
  const beat = setInterval(
    () => die.controller.stdout.note({ service: die.runtime.processes.service.census(), daemon: die.runtime.processes.daemon.census() }),
    60000,
  );
  try {
    await next();
  } finally {
    clearInterval(beat);
  }
};

export const serve = async (die, next) => {
  const url = die.mask.statics.serve;
  die.aperture.open("/multiplex", shard.serve.multiplex(die.aperture));
  const server = Deno.serve(
    { port: Number(url.port), hostname: url.hostname, signal: die.controller.abort.signal, onListen() {} },
    shard.cors.wrap(shape.http(die.aperture)),
  );
  try {
    await next();
  } finally {
    await server.shutdown();
  }
};
```

### `systems/runtime/lifecycle/runtime/aperture/lighthouse.js`

```js
// systems/runtime/lifecycle/runtime/aperture/lighthouse.js
import { authenticate } from "../lighthouse/signer.js";
import { auth } from "../lighthouse/auth.js";

export const lighthouse = async (die, next) => {
  const door = die.runtime.instance.lighthouse;
  die.runtime.lighthouse = {
    secret: door.secrets.jwt,
    traits: door.traits,
    users: die.runtime.entities.user,
    authenticate: authenticate({ secret: door.secrets.jwt, users: die.runtime.entities.user }),
    bind: die.runtime.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })),
  };
  die.aperture.branch("/lighthouse", auth(die.runtime.lighthouse));
  await next();
};
```

### `systems/runtime/lifecycle/runtime/aperture/userspace.js`

```js
// systems/runtime/lifecycle/runtime/aperture/userspace.js
import { shard, v } from "@vivalence/typology";

const own = (ctx) => ({ user: ctx.user.id });
const viaThread = (ctx) => ({ thread: { user: ctx.user.id } });

export const userspace = async (die, next) => {
  const { entities, twitch, lighthouse } = die.runtime;
  const kernel = die.runtime.datamap.entities;
  const owned = die.aperture.branch("/userspace").use(lighthouse.authenticate).use(lighthouse.bind).branch("/entities");

  const routes = [
    ["terminal", entities.terminal, own, { scope: own, filter: "user" }],
    ["intent", entities.intent, null, {}],
    ["thread", entities.thread, own, {}],
    ["buffer", entities.buffer, viaThread, { scope: own }],
    ["turn", entities.turn, viaThread, { scope: own }],
    ["note", kernel.note, null, { scope: own }],
  ];
  for (const [kind, repository, scope, reactive] of routes) {
    const branch = owned.branch(`/${kind}`);
    if (scope) branch.use(shard.datamap.scope(scope));
    branch.graft(shard.datamap.repository(repository)).graft(shard.datamap.reactive(repository, twitch, reactive));
  }

  const activity = owned
    .branch("/activity")
    .use(shard.datamap.scope(own))
    .graft(shard.datamap.repository(entities.activity, { only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"] }))
    .graft(shard.datamap.reactive(entities.activity, twitch));

  const one = activity.branch("/:id").use(async (ctx, next) => {
    ctx.activity = await entities.activity.findOneOrFail({ id: ctx.params.id, user: ctx.user.id });
    await next();
  });
  one.open({ nature: "stdout", yields: v.primitives.controller.Record }, (ctx) => {
    ctx.output = ctx.activity.stdout(ctx.request.raw?.signal);
  });
  const stdin = one.branch("/stdin");
  for (const name of Object.keys(v.primitives.controller.MACHINE.signals)) {
    stdin.open(name, async (ctx) => {
      await ctx.activity.stdin[name](ctx.input);
      return ctx.activity.controller.toJSON();
    });
  }

  await next();
};
```

### `systems/runtime/lifecycle/runtime/lighthouse/auth.js`

```js
// systems/runtime/lifecycle/runtime/lighthouse/auth.js
import { Vector, shard } from "@vivalence/typology";
import { wrap } from "@mikro-orm/core";
import * as argon2 from "argon2";
import { bearer, identify, signer } from "./signer.js";

const respond = {
  success: (data = {}) => ({ status: "SUCCESS", ...data }),
  error: (ctx, code, message, httpStatus = 400) => {
    ctx.response.status = httpStatus;
    return { status: "ERROR", error: { code, message } };
  },
};

const card = (user) => ({ id: user.id, slug: user.slug, traits: user.traits, trait: user.trait });

const authority = async (ctx, user) => {
  const sign = signer(ctx.lighthouse.secret);
  return { access: await sign.access(user), refresh: await sign.refresh(user) };
};

export const auth = (lighthouse) => new Vector().use(shard.context.bind("lighthouse", lighthouse))
  .open("/metadata", (_, ctx) => ({ traits: ctx.lighthouse.traits }))
  .open("/signup", async ({ username, password }, ctx) => {
    if (!ctx.lighthouse.traits.includes("OPEN")) return respond.error(ctx, "CLOSED", "This lighthouse does not take signups", 403);
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const existing = await ctx.lighthouse.users.byUsername(username);
    if (existing) return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");

    const user = ctx.lighthouse.users.create({ slug: username });
    await ctx.lighthouse.users.em.flush();
    const tokens = await authority(ctx, user);
    wrap(user).assign({
      authentication: { provider: "password", credentials: { username, password: await argon2.hash(password) }, tokens },
    });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ user: card(user), authority: tokens });
  })
  .open("/login", async ({ username, password }, ctx) => {
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const user = await identify(ctx.lighthouse, { username, password });
    if (!user) return respond.error(ctx, "INVALID_CREDENTIALS", "Invalid username or password", 401);
    const tokens = await authority(ctx, user);
    wrap(user).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ authority: tokens, user: card(user) });
  })
  .open("/password", async ({ operator, username, password }, ctx) => {
    if (!operator || !username || !password) return respond.error(ctx, "INVALID_INPUT", "Operator token, username and password required");
    if (!(await signer(ctx.lighthouse.secret).verify(operator, "operator"))) return respond.error(ctx, "INVALID_TOKEN", "Invalid operator token", 401);
    const user = await ctx.lighthouse.users.byUsername(username);
    if (!user) return respond.error(ctx, "USER_NOT_FOUND", "User not found", 404);
    wrap(user).assign(
      { authentication: { credentials: { password: await argon2.hash(password) }, tokens: { access: null, refresh: null } } },
      { merge: true, mergeObjectProperties: true },
    );
    await ctx.lighthouse.users.em.flush();
    return respond.success({ user: card(user) });
  })
  .open("/logout", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const user = await bearer(ctx.lighthouse, refresh);
    if (!user) return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
    wrap(user).assign({ authentication: { tokens: { access: null, refresh: null } } }, { mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ message: "Logged out" });
  })
  .open("/verify", async ({ access }, ctx) => {
    if (!access) return respond.error(ctx, "MISSING_TOKEN", "Access token required");
    const payload = await signer(ctx.lighthouse.secret).verify(access, "access");
    if (!payload) return respond.error(ctx, "INVALID_TOKEN", "Invalid or expired token", 401);
    const user = await ctx.lighthouse.users.findOne({ id: payload.id }, { filters: { user: false } });
    if (!user) return respond.error(ctx, "USER_NOT_FOUND", "User not found", 401);
    return respond.success({ user: card(user) });
  })
  .open("/refresh", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const user = await bearer(ctx.lighthouse, refresh);
    if (!user) return respond.error(ctx, "INVALID_TOKEN", "Invalid or revoked refresh token", 401);
    const access = await signer(ctx.lighthouse.secret).access(user);
    wrap(user).assign({ authentication: { tokens: { access } } }, { merge: true, mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ access });
  });
```

### `systems/runtime/lifecycle/host/aperture/metadata.js`

```js
// systems/runtime/lifecycle/host/aperture/metadata.js
import paladin from "@vivalence/paladin";
import { cortex, fromm, shape, shard } from "@vivalence/typology";

const listed = (bearer) => (mode) => ({
  type: mode.manifest.type,
  slug: mode.manifest.slug,
  name: mode.manifest.name ?? mode.manifest.slug,
  traits: mode.manifest.traits,
  reference: `${bearer.reference.nature}${mode.reference.nature}`,
  metadata: `${bearer.reference.nature}${mode.reference.nature}/metadata`,
});

export const metadata = async (die, next) => {
  const root = die.host.aperture.branch("/metadata");

  root.open("/manifest", () => die.host.manifest);
  root.open("/statics", () => die.host.statics ?? {});
  root.open("/cargo", () => die.host.cargo);
  root.open("/datamap", () => shard.datamap.strip(die.host.datamap.getMetadata()));
  root.open("/aperture", () => shape.strip(die.host.aperture));

  root.open("/cortex", () => (die.host.cortex ? cortex.strip(die.host.cortex) : []));
  root.open("/modes", () => fromm.modes(die.host.modes).flat.map(listed(die.host)));

  for (const mode of fromm.modes(die.host.modes).flat) {
    const meta = die.host.aperture.branch(mode.reference.nature).branch("/metadata");

    meta.open("/aperture", () => shape.strip(mode.aperture));
    if (mode.statics) meta.open("/statics", () => mode.statics);
    if (mode.mountpoint) meta.open("/mountpoint", () => mode.mountpoint.absolute);

    if (mode.implements("APPLICATION"))
      meta.open("/application", async () => {
        if (paladin.is.dev) await mode.application.compile();
        return {
          url: die.host.attach.branch("/bundle").branch(die.host.reference.absolute).branch(mode.reference.absolute).absolute,
          bundle: mode.application.bundle.json,
          schema: mode.application.schema ?? null,
        };
      });

    if (mode.implements("EMITTER")) meta.open("/emitter", () => shape.strip(mode.module.emitter));

    if (mode.implements("FRAUGHT") || mode.implements("MOUNTED")) meta.open("/freight", () => mode.freight.catalog);

    if (mode.implements("HARNESSED")) {
      meta.open("/harness", () => shape.strip(mode.aperture.branch("/harness")));
    }
  }
  await next();
};
```

### `systems/runtime/lifecycle/host/aperture/cortex.js`

```js
// systems/runtime/lifecycle/host/aperture/cortex.js
// @beef
// -- // @beef expose cortex.hallucinate.[faculty][via](xyz)!
// -- // @beef strip wire into anima daemon who branches and aims deamon connection.
const faculty = (cortex, type, via) => async (ctx) => {
  const { tune, ...request } = ctx.input;
  const held = cortex.findOne({ type, tune, via });
  if (!held?.via?.[via]) throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
  ctx.output = await held.via[via](request);
};

export const cortex = async (die, next) => {
  if (die.host.cortex) {
    const root = die.host.aperture.branch("/cortex");
    for (const type of ["dialogue", "object", "choice", "verbatim", "vocal"]) {
      root.branch(type).open("/render", faculty(die.host.cortex, type, "render")).open("/stream", faculty(die.host.cortex, type, "stream"));
    }
  }
  await next();
};
```

### `systems/runtime/gestalten/belt/host.js`

```js
// systems/runtime/gestalten/belt/host.js
import { fromm, Mode, steer } from "@vivalence/typology";

export const HOST = ["type", "slug", "reference", "attach", "controller", "aperture", "entities", "datamap", "twitch", "cortex", "modes", "services", "domain"];

export const host = (bearer) => {
  const missing = HOST.filter((word) => !(word in bearer));
  if (missing.length) throw new Error(`host ${bearer.slug} lacks ${missing.join(" ")}`);
  return bearer;
};

export const seat = (bearer, masks) => {
  for (const mask of masks) {
    (bearer.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = Object.assign(new Mode(mask), { stdout: bearer.controller.stdout.branch(mask.reference.absolute) });
  }
  return bearer;
};

export const resolve = async (bearer, execution, traits) => {
  for (const mode of fromm.modes(bearer.modes).flat) {
    await steer.dispatch.execute(execution, { mask: mode.module, mode, host: bearer, traits });
  }
  await bearer.datamap.shard.scope(() => Promise.all(fromm.modes(bearer.modes).flat.flatMap((mode) => mode.finalizers).map((finalize) => finalize())));
  for (const mode of fromm.modes(bearer.modes).flat) {
    bearer.aperture.branch(mode.reference.nature, mode.aperture);
  }
};

export const release = async (bearer) => {
  for (const mode of fromm.modes(bearer.modes).flat) {
    for (const terminate of mode.terminators ?? []) await terminate();
    mode.stdout.close();
  }
};

const typeSlug = (item) => `${item.type}:${item.slug}`;

const orphans = (em, rows, keep, keyOf, label) => {
  for (const row of rows) {
    if (keep.has(keyOf(row))) continue;
    em.remove(row);
    console.log(`pruned ${label}:`, row.slug);
  }
};

export const prune = async (bearer) => {
  await bearer.datamap.shard.scope(async () => {
    const modes = fromm.modes(bearer.modes).flat;
    const installed = new Set(modes.map((mode) => typeSlug(mode.manifest)));
    orphans(bearer.entities.em, await bearer.entities.mode.find({}), installed, typeSlug, "mode");
    await bearer.entities.em.flush();
    for (const mode of modes) {
      const slugs = new Set((mode.module.dataset?.intent ?? []).map((intent) => intent.slug));
      orphans(bearer.entities.em, await bearer.entities.intent.find({ mode: mode.entity.id }, { filters: false }), slugs, (intent) => intent.slug, "intent");
    }
    await bearer.entities.em.flush();
  });
};
```

### `systems/runtime/gestalten/belt/traits.js`

```js
// systems/runtime/gestalten/belt/traits.js
import { is, traits as trait } from "@vivalence/typology";

export async function stagger(bearer, context, traits) {
  const finalizers = [];
  for (const name of bearer.manifest.traits) {
    const result = await traits[name]?.(bearer, context);
    if (is.fn(result)) finalizers.push(result);
    else if (is.object(result)) {
      if (is.fn(result.finalize)) finalizers.push(result.finalize);
      if (is.fn(result.terminate)) {
        (bearer.terminators ??= []).push(result.terminate);
      }
    }
  }
  return finalizers;
}

const named = (name, Class) => Object.defineProperty(Class, "name", { value: name });
const capitalize = (word) => (word ?? "runtime").charAt(0).toUpperCase() + (word ?? "runtime").slice(1).replace(/-(\w)/g, (_, c) => c.toUpperCase());

export const gather = (kernel, domain, modes, kind) =>
  trait.collide(
    [...kernel[kind], ...(domain?.traits?.[kind] ?? []), ...modes.flatMap((mode) => mode.traits?.[kind] ?? [])].filter(
      (held, index, all) => all.findIndex((other) => other.name === held.name) === index,
    ),
  );

export const mint = ({ slug, kinds, traits }) =>
  Object.fromEntries(
    Object.entries(kinds).map(([kind, descriptor]) => {
      const held = traits[kind] ?? [];
      const schematics = Object.fromEntries(held.filter((each) => each.schematic).map((each) => [each.name, each.schematic]));
      const Repository = named(
        `${capitalize(slug)}${capitalize(kind)}Repository`,
        class extends descriptor.repository {
          scope(options = {}) {
            return { ...options, filters: { ...(options.filters ?? {}), daemon: { daemon: slug } } };
          }
          find(where, options) { return super.find(where, this.scope(options)); }
          findOne(where, options) { return super.findOne(where, this.scope(options)); }
          findOneOrFail(where, options) { return super.findOneOrFail(where, this.scope(options)); }
          findAll(options) { return super.findAll(this.scope(options)); }
          findAndCount(where, options) { return super.findAndCount(where, this.scope(options)); }
          findByCursor(where, options) { return super.findByCursor(where, this.scope(options)); }
          count(where, options) { return super.count(where, this.scope(options)); }
          nativeUpdate(where, data, options) { return super.nativeUpdate(where, data, this.scope(options)); }
          nativeDelete(where, options) { return super.nativeDelete(where, this.scope(options)); }
          create(data, options) { return super.create({ ...data, daemon: slug }, options); }
          upsert(data, options) { return super.upsert({ ...data, daemon: slug }, options); }
          unique(query) { return { ...super.unique(query), daemon: slug }; }
          claim(row, name) { return trait.claim(row, name, schematics); }
        },
      );
      trait.repository(Repository, held);
      Object.defineProperties(Repository.prototype, { daemon: { value: slug }, schematics: { value: schematics } });
      return [kind, { repository: Repository, traits: held, schematics }];
    }),
  );

export const strike = (minted, em, kinds) => {
  const struck = Object.fromEntries(Object.entries(minted).map(([kind, held]) => [kind, new held.repository(em, kinds[kind].entity.name)]));
  for (const [kind, held] of Object.entries(minted)) {
    trait.entity(kinds[kind].entity, held.traits, struck[kind].daemon);
    Object.defineProperty(struck[kind], "entities", { value: struck });
  }
  return struck;
};
```

### `systems/runtime/lifecycle/daemon/population.js`

```js
// systems/runtime/lifecycle/daemon/population.js
import paladin from "@vivalence/paladin";
import { contexts, shard, Twitch } from "@vivalence/typology";
import { kernel, sets, wrap } from "../../entities/index.ts";
import { gather, host, mint, strike } from "../../gestalten/belt/index.js";
import * as traits from "../../traits/index.js";

export const core = async (die, next) => {
  die.register = await paladin.ledger.registry.wire(die.mask);
  die.daemon.domain = die.register.domain;
  die.traits = traits;
  die.daemon.entity = await die.runtime.datamap.shard.scope(async () =>
    wrap(await die.runtime.entities.daemon.findOneOrFail({ slug: die.daemon.slug })).toPOJO(),
  );
  await next();
};

export const wiring = async (die, next) => {
  die.daemon.statics = die.mask.statics;
  die.daemon.mountpoint = die.mask.mountpoint;
  await next();
};

export const datamap = async (die, next) => {
  const { datamap } = die.runtime;
  die.daemon.datamap = datamap;
  const traits = Object.fromEntries(Object.keys(sets.kernel).map((kind) => [kind, gather(kernel, die.daemon.domain, die.register.modes, kind)]));
  die.daemon.minted = mint({ slug: die.daemon.slug, kinds: sets.kernel, traits });
  die.daemon.entities = { ...datamap.entities, ...strike(die.daemon.minted, datamap.entities.em, sets.kernel), activity: die.runtime.entities.activity };
  die.daemon.twitch = new Twitch().use(shard.context.spread(contexts.host, die.daemon)).use(shard.datamap.owned());
  die.daemon.twitch.branch("/after").use(shard.datamap.detached(datamap));
  if (die.daemon.domain.twitch) die.daemon.twitch.graft(die.daemon.domain.twitch);
  datamap.registerSubscriber(die.daemon.twitch);
  die.daemon.aperture.use(shard.datamap.inject(datamap));
  await next();
};

export const acid = async (die, next) => {
  const faculties = [];
  for (const [index, citizen] of die.register.hallucinators.entries()) {
    try {
      const supplied = await citizen.provider(citizen);
      faculties.push(...supplied.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
    } catch (error) {
      const at = `daemon[${die.daemon.slug}].hallucinators[${index}]`;
      console.warn(`[provider] ${at} ${citizen.manifest.slug} refused — ${error.message}`);
    }
  }
  die.daemon.cortex = die.runtime.cortex.split(faculties);
  await next();
};

export const services = async (die, next) => {
  for (const [slug, citizen] of Object.entries(die.register.consume)) {
    die.daemon.services[slug] = await citizen.provider(citizen); //@beef pass cortex or something??? maybe service provider should be a vector?
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      die.daemon.services[slug].tools = citizen.tools;
    }
  }
  await next();
};

export const modes = async (die, next) => {
  die.host = host.seat(host.host(die.daemon), die.register.modes);
  await next();
};
```

### `systems/runtime/lifecycle/mode/execution.js`

```js
// systems/runtime/lifecycle/mode/execution.js
import { Vector } from "@vivalence/typology";
import * as population from "./population.js";
import * as resolution from "./resolution.js";

export const execution = new Vector().use(population.stdout).use(population.core);

execution.affect(resolution.traits);
```

### `systems/runtime/lifecycle/mode/population.js`

```js
// systems/runtime/lifecycle/mode/population.js
import { wrap } from "@mikro-orm/core";
import { Aperture, contexts, shard, Vector } from "@vivalence/typology";

export const stdout = async (die, next) => {
  try {
    await next();
    die.mode.stdout.open();
  } catch (error) {
    die.mode.stdout.fault(error);
    throw error;
  }
};

export const core = async (die, next) => {
  die.mode.aperture = new Aperture()
    .use(shard.context.spread(contexts.host, die.host))
    .use(shard.context.bind("mode", die.mode))
    .open("/status", (_, ctx) => ctx.mode.status.reflection)
    .open("/manifest", (_, ctx) => ctx.mode.manifest);
  if (die.mode.module.aperture) die.mode.aperture.graft(die.mode.module.aperture);

  die.mode.tools = new Vector().use(shard.context.spread(contexts.host, die.host)).use(shard.context.bind("mode", die.mode));

  await die.host.datamap.shard.scope(async () => {
    const entity = await die.host.entities.mode.ensure({ ...die.mode.manifest });
    entity.traits = [...die.mode.manifest.traits];
    await die.host.entities.em.flush();
    die.mode.entity = wrap(entity).toPOJO();
    die.mode.id = die.mode.entity.id;
  });
  await next();
};
```

### `systems/runtime/lifecycle/mode/resolution.js`

```js
// systems/runtime/lifecycle/mode/resolution.js
import { stagger } from "../../gestalten/belt/index.js";
import { stamp } from "../../traits/dataset.js";

export const traits = async (die) => {
  await die.host.datamap.shard.scope(async () => {
    const held = die.mode.entity.installed;
    const fresh = await stamp(die.mode);
    if (typeof held === "string" && held && held !== fresh) {
      console.log(`[DATASET] ${die.mode.manifest.type}/${die.mode.manifest.slug} dataset files differ from the installed stamp — reinstalling`);
      die.mode.entity.installed = "";
    }

    die.mode.finalizers = await stagger(die.mode, die.host, die.traits);

    for (const name of die.mode.manifest.traits.filter((name) => !die.traits[name])) {
      console.warn(`[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} declares ${name}, which ${die.host.reference.absolute} does not offer`);
    }

    if (die.mode.module.aperture && !die.mode.implements("EXPOSED")) {
      console.warn(`[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports aperture without EXPOSED`);
    }
    if (die.mode.module.datasink && !die.mode.implements("DATASINK")) {
      console.warn(`[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports datasink without DATASINK`);
    }

    die.mode.entity.installed = fresh;
    await die.host.entities.mode.nativeUpdate({ id: die.mode.entity.id }, { installed: fresh });
  });
};
```

### `systems/runtime/prototypes/runtime.js`

```js
// systems/runtime/prototypes/runtime.js
import { Aperture, Cargo, Twitch } from "@vivalence/typology";

export class Runtime {
  type = "runtime";
  manifest = null;
  slug = null;
  reference = null;
  url = null;
  attach = null;
  mountpoint = null;
  call = null;
  statics = null;
  cargo = new Cargo();
  controller = null;
  instance = null;
  register = null;
  datamap = null;
  entities = {};
  minted = {};
  cortex = null;
  lighthouse = null;
  processes = {};
  modes = {};
  services = {};
  domain = null;
  aperture = new Aperture();
  twitch = new Twitch();

  constructor(fields) {
    Object.assign(this, fields);
  }

}
```

### `systems/runtime/traits/harnessed.js`

```js
// systems/runtime/traits/harnessed.js
import { contexts, shape, shard, soma, steer, ToolCall, v, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { TurnEntity } from "@vivalence/runtime";
import * as skills from "../gestalten/skills/index.js";

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
    ? await ctx.entities.thread.findOneOrFail({ id: ctx.input.thread })
    : null;
  ctx.user ??= ctx.thread?.user ?? null;
  ctx.intelligent = v.thread.trait(ctx.thread, "INTELLIGENT");
  ctx.vocal = v.thread.trait(ctx.thread, "VOCAL");
  await next();
};

const activating = async (ctx, next) => {
  if (!ctx.input.controller) {
    ctx.activity = await ctx.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread?.id ?? null });
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
    .graft(skills.entity.entity)
    .graft(skills.buffer.buffer)
    .graft(skills.thread.thread)
    .graft(skills.mode.mode)
    .graft(paladin.skills.fs.fs)
    .graft(paladin.skills.shell.shell);
  for (const [slug, service] of Object.entries(ctx.services ?? {})) {
    if (service.tools) {
      armed.branch(`/service/${slug}`).use(shard.context.bind("service", service)).graft(service.tools);
    }
  }
  if (ctx.domain?.tools) armed.branch(ctx.domain.manifest.slug, ctx.domain.tools);
  if (ctx.mode.tools) armed.graft(ctx.mode.tools);
  if (ctx.mode.generator?.tools) armed.branch("/generator", ctx.mode.generator.tools);
  for (const [name, supplied] of Object.entries(ctx.input.tools ?? {})) {
    const { execute, ...edge } = typeof supplied === "function" ? { execute: supplied } : supplied;
    armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
  }
  armed.use(shard.context.spread(contexts.host, ctx));
  armed.use(shard.context.bind("mode", ctx.mode));
  if (ctx.user) armed.use(shard.context.bind("user", ctx.user)); //@beef both nonoptional in near future
  if (ctx.input.thread) armed.use(shard.context.bind("thread", ctx.input.thread));
  return armed;
};

const chaining = async (ctx, next) => {
  ctx.hallucination.turns = await ctx.entities.turn.history({ thread: ctx.input.thread });
  ctx.turn = await ctx.entities.turn.chain({
    id: ctx.input.id,
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

async function* recording(ctx, packets) {
  const em = ctx.entities.em.fork();
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
    thread: ctx.thread?.id,
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
  if (ctx.thread) {
    ctx.hallucination.policy.cache = { marks: [...Object.keys(ctx.hallucination.system).slice(-1), "tools"] };
    ctx.hallucination.system.thread = await skills.thread.summary(ctx);
  }
  await next();
};

export const HARNESSED = (mode, host) => {
  if (!host.cortex) throw new Error("HARNESSED: host has no cortex");

  //@beef thread and user soon required.
  const harness = new Vector()
    .use(shard.context.spread(contexts.host, host))
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

  if (host.domain?.harness) harness.graft(host.domain.harness);
  if (mode.module.harness) harness.graft(mode.module.harness);

  harness.use(summarizing);

  for (const type of ["dialogue", "object"]) {
    harness
      .branch(type)
      .open("render", (ctx) => ctx.cortex.hallucinate[type].render(ctx.hallucination))
      .open({ nature: "stream", yields: Packet.Response }, (ctx) =>
        ctx.cortex.hallucinate[type].stream(ctx.hallucination),
      );
  }

  harness
    .branch("choice")
    .open("render", (ctx) =>
      ctx.cortex.hallucinate.choice.render({
        controller: ctx.controller,
        policy: ctx.hallucination.policy,
        primer: ctx.input.primer,
        questions: ctx.input.questions,
      }),
    );

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness", harness);
  };
};
```

### `systems/runtime/traits/application.js`

```js
// systems/runtime/traits/application.js
import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { App, Bundle } from "@vivalence/typology";

export const APPLICATION = async (mode, host) => {
  const declared = mode.module.application;
  const bundler = paladin.bundler(mode.bundles.absolute);
  mode.application = new App(declared.sources, declared.schema);

  mode.application.buffer = (desc = {}) =>
    host.entities.buffer.create({
      mode: mode.entity.id,
      bundle: null,
      ...desc,
      data: mode.application.fill(desc),
    });

  let compiling = null;
  mode.application.compile = () => {
    compiling ??= Promise.all(
      mode.application.sources.map(({ mime, mount, source }) =>
        bundler.bundle(source ? { mime, source } : { mime, entry: resolve(mode.module.source.dirname, mount) })),
    ).then((bundles) => (mode.application.bundle = Bundle.merge(...bundles)))
      .finally(() => (compiling = null));
    return compiling;
  };

  return () => mode.application.compile();
};
```

### `systems/runtime/traits/exposed.js`

```js
// systems/runtime/traits/exposed.js
import { shape } from "@vivalence/typology";

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.manifest.type}/${mode.manifest.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.proxy(mode.aperture);
  };
};
```

### `systems/runtime/entities/Terminal.ts`

```ts
// systems/runtime/entities/Terminal.ts
import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataSchema, DataRepository } from "@vivalence/typology/entities";
import { UserEntity, DaemonEntity, ThreadEntity } from "./index.ts";

export class TerminalRepository extends DataRepository {
  async create({ user, ...fields }: any) {
    const owner = await this.em.findOneOrFail(UserEntity, user);
    const index = await this.count({ user: owner });
    return super.create({ ...fields, user: owner, index });
  }
}

export class TerminalEntity extends DataEntity {
  user!: Rel<UserEntity>;
  daemon: Rel<DaemonEntity> | null & Opt = null;
  thread: Rel<ThreadEntity> | null & Opt = null;
  index: number & Opt = 0;
  traits: string[] & Opt = [];
  trait: any & Opt = {};
}

export const TerminalSchema = new EntitySchema({
  class: TerminalEntity,
  extends: DataSchema,
  repository: () => TerminalRepository,
  name: "Terminal",
  tableName: "Terminal",
  filters: {
    user: {
      cond: (args: any) => ({ user: args.user }),
      default: true,
    },
  },
  properties: {
    user: { kind: "m:1", entity: () => UserEntity, updateRule: "cascade", deleteRule: "cascade" },
    daemon: { kind: "m:1", entity: () => DaemonEntity, nullable: true, updateRule: "cascade", deleteRule: "set null" },
    thread: { kind: "m:1", entity: () => ThreadEntity, nullable: true, updateRule: "cascade", deleteRule: "set null" },
    index: { type: types.integer, default: 0 },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },
  },
});

export default {
  type: "terminal",
  schema: TerminalSchema,
  entity: TerminalEntity,
  repository: TerminalRepository,
};
```


## typology — the vocabulary the Loop is built from

### `subsystems/typology/mod.client.js`

```js
// subsystems/typology/mod.client.js
export * from "./prototypes/index.client.js";
export * from "./gestalten/index.client.js";
export * from "./schematics/index.js";

export * as prototypes from "./prototypes/index.client.js";
export * as gestalten from "./gestalten/index.client.js";
export * as schematics from "./schematics/index.js";
// export { trait } from "./entities/base/trait.js";
```

### `subsystems/typology/prototypes/index.client.js`

```js
// subsystems/typology/prototypes/index.client.js
export * from "./env.js";
export * from "./errors/index.js";
export * as errors from "./errors/index.js";
// export * from "./scope/index.js";

// export * from "./production/index.js";
export * from "./request.js";
export * from "./response.js";
export * from "./vector.js";
export * from "./context.js";

export * from "./status.js";
export * from "./scope.js";
export * from "./connection.js";
export * from "./socket.js";
export * from "./aperture.js";
export * from "./broadcaster.js";
export * from "./blacklist.js";
export * from "./url.js";
export * from "./path.js";
export * from "./filepath.js";
export * from "./pattern.js";
export * from "./signature.js";
export * from "./signal.js";
export * from "./toolcall.js";
export * from "./app.js";
export * from "./bundle.js";

export * from "./span.js";
export * from "./pipe.js";
export * from "./queue.js";
export * from "./controller.js";
export * from "./cortex.js";
export * from "./conversation.js";

export * from "./wafer.js";
export * from "./stall.js";
export * from "./remote-repository.js";
export * from "./local-repository.js";
export * from "./entity-manager.js";

// export * from "./feature.js";
// export * from "./mode.js";
// export * from "./call/index.js";
// export * from "./agent/index.js";
// export * from "./blacklist/index.js";
// export * from "./remedy/index.ts";
// export * from "./daemon.js";

// export * from "./prototypes/pattern.js";
// export * from "./prototypes/signal.js";
// export * from "./prototypes/signature.js";
// export * from "./prototypes/url.js";
// export * from "./prototypes/path.js";
// export * from "./prototypes/status.js";
// export * from "./prototypes/connection.js";
//
```

### `subsystems/typology/gestalten/index.client.js`

```js
// subsystems/typology/gestalten/index.client.js
export * as is from "./is/index.js";
export * as cast from "./cast/index.js";
export { not } from "./not/index.js";
export * as fromm from "./fromm/index.js";
export * as shard from "./shard/index.client.js";
// export * as shards from "./shard/index.js";
export * as belt from "./belt/index.js";
export * from "./belt/index.js";
export * as steer from "./steer/index.js";
export * as shape from "./shape/index.js";
```

### `subsystems/typology/gestalten/shard/index.client.js`

```js
// subsystems/typology/gestalten/shard/index.client.js
export * as transmitter from "./transmitter.js";
export * as context from "./context.js";
export * as connection from "./connection.js";
export * as cors from "./cors.js";
export * as caching from "./caching.js";
export * as serve from "./serve.js";
export * as batch from "./batch.js";
export * as track from "./track.js";
export * as nano from "./nano.js";
export * as hallucinate from "./hallucinate.js";
```

### `subsystems/typology/prototypes/vector.js`

```js
// subsystems/typology/prototypes/vector.js
import { Pattern } from "./pattern.js";
import { Signature } from "./signature.js";

export class Vector {
  constructor(ancestor, signature = Pattern) {
    this.effect = null;
    this.trie = new Map();
    this.carry = [];
    if (ancestor) this.ancestor = ancestor;
    this.signature = signature;
  }

  withSignature(signature) {
    this.signature = signature;
    return this;
  }

  use(middleware) {
    this.carry.push(middleware);
    return this;
  }

  branch(signature, vector) {
    const pattern = new this.signature(signature);

    if (pattern.nature == null && !pattern.heir) return this;

    let edge = this.trie.get(pattern.nature);
    if (!edge) {
      edge = { pattern, trajectory: (!pattern.heir && vector) || new this.constructor(this, this.signature) };
      this.trie.set(pattern.nature, edge);
    } else if (vector && !pattern.heir) {
      edge.trajectory.graft(vector);
    }

    if (pattern.heir) {
      return edge.trajectory.branch(pattern.heir, vector);
    }
    return edge.trajectory;
  }

  open(signature, effect) {
    this.branch(signature).effect = effect;
    return this;
  }

  affect(effect) {
    if (this.effect) return console.log("vector already affected");
    this.effect = effect;
    return this;
  }

  graft(vector) {
    if (vector === this) return this;
    if (vector.effect) this.effect = vector.effect;

    for (const [nature, edge] of vector.trie) {
      const existing = this.trie.get(nature);
      const branch = existing?.trajectory ?? new this.constructor(this, this.signature);
      branch.graft(edge.trajectory);
      if (existing) existing.pattern = edge.pattern;
      else this.trie.set(nature, { pattern: edge.pattern, trajectory: branch });
    }

    this.carry.push(...vector.carry);

    return this;
  }

  get patterns() {
    return [...this.trie.values()].map((edge) => edge.pattern);
  }
  get descendants() {
    return [...this.trie.values()].map((edge) => edge.trajectory);
  }
  get root() {
    let position = this;
    while (position.ancestor) position = position.ancestor;
    return position;
  }
  get heir() {
    return this.descendants[0];
  }

  survey(visit = (node) => node) {
    const trajectories = [...this.trie.values()] //
      .map((edge) => visit({ signature: edge.pattern, ...edge.trajectory.survey(visit) }));
    return { effect: this.effect, trajectories };
  }
}
```

### `subsystems/typology/prototypes/signature.js`

```js
// subsystems/typology/prototypes/signature.js
import * as array from "../gestalten/belt/array.js";
import * as hash from "../gestalten/belt/hash.js";
import * as is from "../gestalten/is/scalars.js";

export class Signature {
  // nature = null; trace = null; gauges = [];
  static coercions = [];
  #hash = null;
  // [Symbol.for("nodejs.util.inspect.custom")]() {return `${this.constructor.name}:${this.absolute} [${this.nature}]`;}

  constructor(signature = null, trace = null) {
    if (!is.array(this.gauges)) this.gauges = [];
    signature = this.coerce(signature);

    if (is.fn(signature)) signature = this.coerce(signature(this.constructor));
    if (signature instanceof this.constructor) return signature.from(trace);
    if (signature instanceof Signature) this.nature = signature.nature;
    else if (is.string(signature)) this.nature = signature;
    else if (is.signature(signature)) Object.assign(this, signature);
    else if (is.array(signature)) {
      // recursion if coerce returns array
      const [head, ...heirs] = signature;
      const root = new this.constructor(head).from(trace);
      if (!is.empty(heirs)) root.branch(heirs);
      return root;
    }

    if (trace) this.from(trace);
  }

  coerce(signature) {
    for (const [test, transform] of this.constructor.coercions) {
      // if (test(signature)) return transform(signature);
      if (test.call(this, signature)) return transform.call(this, signature);
      // recursion error if coerce returns array.
    }
    return signature;
  }

  from(trace, anon = false) {
    this.#hash = null;
    this.trace = trace;
    if (!anon) this.trace?.gauges.push(this);
    // if (is.fn(trace?.nature) && !this.nature) {this.nature = trace.nature; this.filter = trace.nature;}
    return this;
  }

  get absolute() {
    return this.array.map((s) => s.nature);
  }

  get json() {
    const json = { nature: this.nature, absolute: this.absolute };
    if (this.trace?.json) json.trace = this.trace.json;
    return json;
  }

  toJSON() {
    return this.json;
  }

  clone() {
    return new this.constructor(this); // recursive? maybe implement as new this.constructor().withJson(this.json)
  }

  branch(signature) {
    return new this.constructor(signature, this);
  }

  hasher() {
    return hash.array([this.nature]);
  }

  get hash() {
    return (this.#hash ??= this.hasher());
  }

  //
  get array() {
    const array = [];
    for (const trace of this.heritage()) array.unshift(trace);
    for (const trace of this.finn()) array.push(trace);
    return array;

    // const result = [];
    // for (const node of this.heritage()) result.unshift(node);
    // return result;
  }

  *ancestory() {
    for (const gauge of this.gauges) {
      yield gauge;
      yield* gauge.ancestory(); // if is? avoid depth first!
    }
  }

  *heritage() {
    let position = this;
    while (position) {
      yield position;
      position = position.trace;
    }
  }

  *descendants() {
    for (const gauge of this.gauges) {
      yield gauge;
      yield* gauge.descendants();
    }
  }

  *finn() {
    let position = this;
    while (position.heir) {
      yield position.heir;
      position = position.heir;
    }
  }

  get heir() {
    return this.gauges[0];
  }

  get fin() {
    let position = this;
    while (position.heir) position = position.heir;
    return position === this ? null : position;
  }

  get root() {
    let position = this;
    while (position.trace) position = position.trace;
    return position;
  }

  get depth() {
    let maxDepth = 0;
    for (const gauge of this.gauges) {
      // ...??? lol.
      maxDepth = Math.max(maxDepth, 1 + gauge.depth);
    }
    return maxDepth;
  }

  get length() {
    return this.array.length;
    // return this.tilde.depth;
  }

  get index() {
    let count = 0;
    let position = this.trace;
    while (position) {
      count++;
      position = position.trace;
    }
    return count;
  }

  stick(signature) {
    this.branch(signature);
    return this;
  }

  yeet(signature) {
    this.fin?.branch(signature) ?? this.branch(signature);
    return this;
  }

  barf() {
    return new this.constructor(this.nature);
  }

  rebase(signature) {
    return new this.constructor(this.absolute, new this.constructor(signature));
  }

  // graft(signature) {return new this.constructor(this.heritage, signature);}

  pop() {
    if (this.trace) {
      this.trace.drop(this);
      this.trace = null;
      delete this.trace;
    }
    return this;
  }

  drop(gauge) {
    this.gauges = this.gauges.filter(({ hash }) => hash !== gauge.hash);
    return this;
  }
  // shift(){//}

  grab(gauge, drop = true) {
    const found = this.gauges.find(({ hash }) => hash === gauge.hash);
    if (drop && found) this.drop(found);
    return found;
  }
  //   // snatch // severe(brats) {return cast .array(this.ancestory()) .map((s) => this.grab(s)) .filter((f) => !!f);}
  // last universal ancestor
  get lua() {
    let position = this;
    while (position?.gauges.length === 1) position = position.trace;
    return position;
  }
  // last universal common ancestor
  luca(common = null) {
    if (!common) return this.lua;
    return console.log("todo common luca");
  }

  get ghost() {
    return !this.nature && this.heir;
  }
}
```

### `subsystems/typology/prototypes/signal.js`

```js
// subsystems/typology/prototypes/signal.js
import { Signature } from "./signature.js";
import * as hash from "../gestalten/belt/hash.js";
import * as is from "../gestalten/is/scalars.js";

export class Signal extends Signature {
  static coercions = [
    [
      (s) => is.string(s),
      function (s) {
        const tokens = tokenize(s);
        const segments = [];
        const flags = {};
        let terminated = false;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];

          if (terminated || token === "-") {
            const parts = token.split("/").filter((part) => part.length > 0);
            for (const part of parts) segments.push({ nature: part });
            continue;
          }

          if (token === "--") {
            terminated = true;
            continue;
          }

          if (token.startsWith("--")) {
            const key = token.slice(2);
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length === 2) {
            const key = token.slice(1);
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length > 2) {
            for (const character of token.slice(1)) {
              flags[character] = true;
            }
          } else {
            const parts = token.split("/").filter((part) => part.length > 0);
            for (const part of parts) segments.push({ nature: part });
          }
        }

        const hasFlags = Object.keys(flags).length > 0;

        if (segments.length && hasFlags) {
          segments[segments.length - 1].flags = flags;
        }

        if (!segments.length && hasFlags) {
          this.nature = null;
          this.flags = flags;
          return null;
        }

        return segments;
      },
    ],
  ];

  hasher() {
    return hash.array([this.index, this.nature]);
  }

  get pathname() {
    return "/" + this.absolute.join("/");
  }

  get json() {
    return {
      signal: this.pathname,
      parts: this.absolute,
      flags: (this.fin ?? this).flags ?? {},
    };
  }
}

function tokenize(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const character of input) {
    if (quote) {
      if (character === quote) { quote = null; continue; }
      current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === " " || character === "\t") {
      if (current.length) { tokens.push(current); current = ""; }
    } else {
      current += character;
    }
  }

  if (current.length) tokens.push(current);

  return tokens.flatMap((token) => {
    if (token === "-" || token === "--") return [token];
    if (token.startsWith("--") && token.includes("=")) {
      const eq = token.indexOf("=", 2);
      return [token.slice(0, eq), token.slice(eq + 1)];
    }
    if (token.startsWith("-") && !token.startsWith("--") && token.includes("=")) {
      const eq = token.indexOf("=");
      return [token.slice(0, eq), token.slice(eq + 1)];
    }
    return [token];
  });
}
```

### `subsystems/typology/prototypes/pattern.js`

```js
// subsystems/typology/prototypes/pattern.js
import * as object from "../gestalten/belt/object.js";
import * as is from "../gestalten/is/scalars.js";
import * as hash from "../gestalten/belt/hash.js";

import { Signature } from "./signature.js";

export class Pattern extends Signature {
  get json() {
    const chain = this.array;
    return {
      pattern: "/" + chain.map((node) => node.nature).join("/"),
      parts: chain.map((node) => node.nature),
      types: chain.map((node) => node.type),
    };
  }

  static coercions = [
    [
      (s) => is.object(s) && is.string(s.nature) && !is.fn(s.filter),
      function (s) {
        const { nature, ...valence } = s;
        const segments = nature
          .split("/")
          .filter((s) => s.length > 0)
          .map((signature) => {
            const [type, , filter] = probe(signature);
            if (type && filter) return { type, nature: signature, filter };
          })
          .filter(Boolean);
        if (segments.length > 0) Object.assign(segments[segments.length - 1], valence);
        return segments;
      },
    ],
    [
      (s) => is.string(s),
      (s) => {
        return s
          .split("/")
          .filter((s) => s.length > 0)
          .map((signature) => {
            const [type, , filter] = probe(signature);
            if (type && filter) return { type, nature: signature, filter };
          })
          .filter(Boolean);
      },
    ],
  ];

  hasher() {
    return hash.array([this.index, this.type, this.nature, this.trace?.hash]);
  }

  apply(signal) {
    const match = this.filter ? this.filter(signal, this) : null;
    if (match) {
      if (this.input) match.input = this.input;
      if (this.output) match.output = this.output;
    }
    return match;
  }
}

const probe = (signature) => patternmap.find(([, probe]) => probe(signature));

const patternmap = [
  [
    "wildcard",
    (signature) => signature === "*",
    (signal) => object.assign(signal, { type: "wildcard" }),
  ],
  [
    "remainder",
    (signature) => signature === "(.*)",
    (signal) => object.assign(signal, { type: "remainder" }),
  ],
  [
    "parameter",
    (signature) => signature.startsWith(":"),
    (signal, pattern) => {
      const parameter = pattern.nature.slice(1);
      return object.assign(signal, {
        parameter,
        parameters: { [parameter]: signal.nature },
      });
    },
  ],
  [
    "literal",
    (signature) => true,
    (signal, pattern) => (signal.nature === pattern.nature ? signal : null),
  ],
];
// import { is } from "@vivalence/typology";
// import { Signature } from "./signature.js";

// export class Pattern extends Signature {
//   // filter = null;
//   hasher() {
//     return hash.array([this.index, this.type, this.nature, this.trace?.hash]);
//     // i could make the hash reactive for shits and giggles.
//   }

//   ought(thing) {
//     return is.pattern(thing);
//   }

//   parse(string) {
//     const segments = string
//       .split("/")
//       .filter((s) => s.length > 0)
//       .map((signature) => {
//         const [type, , filter] = probe(signature);
//         if (type && filter) return { type, nature: signature, filter };
//       })
//       .filter((segment) => segment);
//     return segments;
//   }

//   apply(signal) {
//     // assert constraints. // ie this: this.filter = signature; // TODO wrap for asserting filter in output.
//     // yeah i need to do some stuff here.
//     return this.filter ? this.filter(signal, this) : null;
//   }
//   from(trace) {
//     this.trace = trace;
//     this.trace?.gauges.push(this);
//     if (is.fn(trace?.nature) && !this.nature) {
//       this.nature = trace.nature;
//       this.filter = trace.nature;
//     }
//     return this;
//   }
// }

// const probe = (signature) => patternmap.find(([, probe]) => probe(signature));

// const patternmap = [
//   ["wildcard", (signature) => signature === "*", (signal) => signal],
//   ["remainder", (signature) => signature === "(.*)", (signal) => signal],
//   [
//     "parameter",
//     (signature) => signature.startsWith(":"),
//     (signal, pattern) => {
//       const parameter = pattern.nature.slice(1);
//       return {
//         ...signal,
//         parameter,
//         parameters: { [parameter]: signal.nature },
//       };
//     },
//   ],
//   [
//     "literal",
//     (signature) => true,
//     (signal, pattern) => (signal.nature === pattern.nature ? signal : null),
//   ],
// ];
```

### `subsystems/typology/prototypes/queue.js`

```js
// subsystems/typology/prototypes/queue.js
import * as fromm from "../gestalten/fromm/index.js";
import * as promise from "../gestalten/belt/promise.js";

export class Queue {
  backlog = [];
  closed = false;
  gate = promise.waiter();

  enqueue(value) {
    this.backlog.push(value);
    this.gate.wake();
    return this;
  }

  flush() {
    this.backlog.length = 0;
    return this;
  }

  close() {
    this.closed = true;
    this.gate.wake();
  }

  async *drain(signal) {
    while (!signal?.aborted) {
      if (this.backlog.length) {
        yield this.backlog.shift();
        continue;
      }
      if (this.closed) return;
      await this.gate.wait(signal);
    }
  }

  get depth() {
    return this.backlog.length;
  }

  to(...sinks) {
    const writes = sinks.map((target) => fromm.sink(target).write);
    (async () => {
      for await (const value of this.drain()) for (const write of writes) write(value);
    })();
    return this;
  }

  [Symbol.asyncIterator]() {
    return this.drain();
  }
}
```

### `subsystems/typology/prototypes/pipe.js`

```js
// subsystems/typology/prototypes/pipe.js
import * as fromm from "../gestalten/fromm/index.js";
import * as promise from "../gestalten/belt/promise.js";
import { atom } from "nanostores";

export class Pipe {
  listeners = new Set();

  send(value) {
    for (const listener of this.listeners) listener(value);
  }

  tap(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reactive(seed = null, step = (_, value) => value) {
    const store = atom(seed);
    this.tap((value) => store.set(step(store.get(), value)));
    return store;
  }

  to(...sinks) {
    for (const target of sinks) this.tap(fromm.sink(target).write);
    return this;
  }

  from(...sources) {
    for (const origin of sources)
      (async () => {
        for await (const value of fromm.source(origin).read) this.send(value);
      })();
    return this;
  }

  observe() {
    const controller = new AbortController();
    const iterator = this.stream(controller.signal);
    iterator.unsubscribe = () => controller.abort();
    return iterator;
  }

  subscribe(callback) {
    return this.tap(callback);
  }

  stream(signal) {
    return this.replay([], signal);
  }

  async *replay(backlog, signal) {
    const buffer = [];
    const gate = promise.waiter();
    const untap = this.tap((value) => {
      buffer.push(value);
      gate.wake();
    });
    try {
      yield* backlog;
      while (!signal?.aborted) {
        if (buffer.length) {
          yield buffer.shift();
          continue;
        }
        await gate.wait(signal);
      }
    } finally {
      untap();
    }
  }

  [Symbol.asyncIterator]() {
    return this.stream();
  }
}
```

### `subsystems/typology/prototypes/span.js`

```js
// subsystems/typology/prototypes/span.js
import { Signature } from "./signature.js";
import { Pipe } from "./pipe.js";

const CONFIG = {
  journal: 1000,
};

export class Span extends Signature {
  static tally = 0;

  constructor(signature = null, trace = null) {
    super(signature, trace);
    this.id ??= Span.tally++;
    if (!this.trace) {
      this.journal ??= [];
      this.channel ??= new Pipe();
    }
  }

  hasher() {
    return this.id;
  }

  from(trace) {
    return super.from(trace, true);
  }

  get records() {
    return this.root.journal;
  }

  get pipe() {
    return this.root.channel;
  }

  get absolute() {
    const natures = [];
    for (const node of this.heritage()) if (node.nature) natures.unshift(node.nature);
    return ("/" + natures.join("/")).replace(/\/{2,}/g, "/");
  }

  to(...sinks) {
    this.pipe.to(...sinks);
    return this;
  }

  mark(verb, data) {
    const record = {
      span: this.id,
      trace: this.trace?.id ?? null,
      path: this.absolute,
      verb,
      at: performance.now(),
    };
    if (data !== undefined) record.data = data;
    const journal = this.records;
    journal.push(record);
    if (journal.length > CONFIG.journal) journal.splice(0, journal.length - CONFIG.journal);
    this.pipe.send(record);
    return this;
  }

  open() {
    return this.mark("open");
  }

  close() {
    return this.mark("close");
  }

  note(data) {
    return this.mark("note", data);
  }

  fault(error) {
    return this.mark("fault", { message: error?.message ?? String(error), code: error?.code ?? null });
  }
}
```

### `subsystems/typology/prototypes/controller.js`

```js
// subsystems/typology/prototypes/controller.js
import { Failure } from "./errors/controller.js";
import * as is from "../gestalten/is/index.js";
import * as promise from "../gestalten/belt/promise.js";
import { Signal } from "./signal.js";
import { Span } from "./span.js";
import { Status } from "./status.js";
import * as steer from "../gestalten/steer/index.js";
import { v } from "../schematics/index.js";
import { Vector } from "./vector.js";

const said = (input) => (is.string(input) && input.length ? input : undefined);

export class Controller {
  children = new Set();
  status = new Status("IDLE");
  gate = promise.waiter();
  settled = null;

  constructor({ stdout = new Span("controller"), stdin = new Vector(), abort = new AbortController(), parent = null } = {}) {
    Object.assign(this, { stdout, stdin, abort, parent });
    const { MACHINE } = v.primitives.controller;

    this.settled = new Promise((fulfil) => {
      const untap = this.stdout.pipe.tap((record) => {
        if (record.span !== this.stdout.id) return;
        const from = this.status.reflection.code;
        const code = MACHINE.transitions[record.verb]?.[from] ?? from;
        if (code === from) return;
        const { error } = MACHINE.verbs[record.verb];
        this.status.set({ code, ...(error && { error: new Failure(error, record) }) });
        this.gate.wake();
        if (!MACHINE.states[code].settled) return;
        untap();
        this.parent?.children.delete(this);
        for (const child of this.children) child.abort.abort(`parent ${code}`);
        fulfil(this.toJSON());
      });
    });

    const aborted = () => this.stdout.mark("abort", { ...(said(this.abort.signal.reason) && { reason: this.abort.signal.reason }) });
    this.abort.signal.aborted ? aborted() : this.abort.signal.addEventListener("abort", aborted, { once: true });

    for (const [name, verb] of Object.entries(MACHINE.signals))
      this.stdin.open(name, async (ctx) => {
        verb === "abort"
          ? this.abort.abort(said(ctx.input) ?? name)
          : this.stdout.mark(verb, { signal: name, ...(said(ctx.input) && { reason: ctx.input }) });
        for (const child of this.children) await child.kill(name, ctx.input);
      });
    this.parent?.children.add(this);
  }

  branch(name) {
    return new Controller({ parent: this, stdout: this.stdout.branch(name) });
  }

  kill(name, input) {
    return steer.dispatch.invoke(this.stdin, new Signal(name), steer.strategy.echo)(input);
  }

  async proceed() {
    while (this.status.is("PAUSED")) await this.gate.wait(this.abort.signal);
    return this.status.is("RUNNING");
  }

  toJSON() {
    return {
      path: this.stdout.absolute,
      span: this.stdout.id,
      ...this.status.reflection,
      children: [...this.children].map((child) => child.toJSON()),
    };
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Controller(${this.stdout.absolute}):${this.status.reflection.code}`;
  }
}
```

### `subsystems/typology/prototypes/context.js`

```js
// subsystems/typology/prototypes/context.js
import { Request } from "./request.js";
import { Response } from "./response.js";

export class Context {
  constructor(context = {}) {
    Object.assign(this, context);
    this.request = this.request instanceof Request ? this.request : new Request(this.request ?? {});
    this.response = this.response ?? new Response();
    this.params = this.params ?? {};
    this.state = this.state ?? {};
  }

  get input() { return this.request.body; }
  set input(v) { this.request.body = v; }

  get output() { return this.response.body; }
  set output(v) { this.response.body = v; }
}
```

### `subsystems/typology/prototypes/connection.js`

```js
// subsystems/typology/prototypes/connection.js
import { atom, computed, onMount } from "nanostores";
import * as string from "../gestalten/belt/string.js";
import * as transmitter from "../gestalten/shard/transmitter.js";
import * as sse from "../gestalten/belt/sse.js";
import { Url } from "./url.js";
import { Request } from "./request.js";
import { Response } from "./response.js";
import * as middleware from "../gestalten/belt/middleware.js";
import * as promise from "../gestalten/belt/promise.js";
import * as object from "../gestalten/belt/object.js";
import { Socket } from "./socket.js";

const CONFIG = {
  backoff: 1000,
  ceiling: 30000,
};

export class Connection {
  $state = atom("IDLE");
  $error = atom(null);

  carry = [];
  children = new Map();

  constructor(url, transport = transmitter.fetcher) {
    this.url = url instanceof Url ? url : new Url(url);
    this.transport = transport;
  }

  use(fn) {
    this.carry.push(fn);
    return this;
  }

  dispatch(ctx) {
    return middleware.compose(this.carry)(ctx, this.transport);
  }

  child(segment) {
    let next = this.children.get(segment);
    if (!next) {
      next = new this.constructor(this.url.branch(`/${segment}`), (ctx) => this.dispatch(ctx));
      this.children.set(segment, next);
    }
    return next;
  }

  branch(path) {
    let node = this;
    for (const segment of string.split(path)) node = node.child(segment);
    return node;
  }

  clone() {
    return new this.constructor(this.url, this.transport);
  }

  async request(request) {
    if (!(request instanceof Request)) {
      request = new Request({
        ...request,
        url: this.url.branch(request.url || "/"),
      });
    }

    const ctx = {
      request,
      response: new Response(),
      state: {},
    };

    await this.dispatch(ctx);

    return ctx.response;
  }

  resolve(endpoint) {
    let node = this;
    for (const segment of string.split(endpoint)) {
      const next = node.children.get(segment);
      if (!next) break;
      node = next;
    }
    return node;
  }

  async fetch(endpoint, body = {}, options = {}) {
    const node = this.resolve(endpoint);
    const request = new Request({
      url: this.url.branch(endpoint),
      body,
      ...options,
    });
    return node.request(request);
  }

  async call(endpoint, body = {}, options = {}) {
    const response = await this.fetch(endpoint, body, options);

    if (response.error) {
      response.error.message = `${response.error.message} @ ${this.url.branch(endpoint).pathname}`;
      throw response.error;
    }

    return response.body;
  }

  aim(endpoint, bodyBase = {}, optionsBase = {}) {
    return (body = {}, options = {}) => {
      return this.call(endpoint, object.merge(body, bodyBase), object.merge(options, optionsBase));
    };
  }

  async *stream(endpoint, signal, { method = "GET", body, headers, opened, raw } = {}) {
    const response = await this.fetch(endpoint, body ?? {}, {
      method,
      headers: { accept: "text/event-stream", ...headers },
      signal,
      ...(raw && { raw }),
    });
    if (response.error) throw response.error;
    if (response.body?.[Symbol.asyncIterator] && !response.body.getReader) {
      if ("onArrival" in response.body) response.body.onArrival = opened ?? null;
      else opened?.();
      yield* response.body;
      return;
    }
    if (!response.body?.getReader)
      throw new Error(`SSE stream expected ReadableStream, got ${typeof response.body}`);
    opened?.();
    yield* sse.frames(response.body);
  }

  converse(endpoint, source, { input, signal, headers, opened } = {}) {
    return this.stream(endpoint, signal, {
      method: "POST",
      body: input ?? {},
      headers,
      opened,
      raw: { body: sse.encode(source) },
    });
  }

  observe(endpoint, options = {}) {
    const controller = new AbortController();
    const iterator = this.stream(endpoint, controller.signal, options);
    iterator.unsubscribe = () => controller.abort();
    return iterator;
  }

  subscribe(endpoint, callback, options = {}) {
    const { backoff = CONFIG.backoff, resumed, ...streaming } = options;
    const controller = new AbortController();
    (async () => {
      for (let attempt = 0, round = 0; !controller.signal.aborted; attempt++, round++) {
        const heal = round;
        try {
          for await (const event of this.stream(endpoint, controller.signal, {
            ...streaming,
            opened: () => {
              if (heal > 0) resumed?.();
            },
          })) {
            attempt = 0;
            callback(event);
          }
          if (controller.signal.aborted) return;
        } catch (error) {
          if (controller.signal.aborted || error.name === "AbortError") return;
        }
        const gate = promise.waiter();
        const timer = setTimeout(gate.wake, Math.min(backoff * 2 ** attempt, CONFIG.ceiling));
        await gate.wait(controller.signal);
        clearTimeout(timer);
      }
    })();
    return () => controller.abort();
  }

  nanoatom(endpoint, initial = null) {
    const $store = atom(initial);
    onMount($store, () => this.subscribe(`${endpoint}/subscribe`, (value) => $store.set(value)));
    return $store;
  }

  async publish(endpoint, source, options = {}) {
    const response = await this.fetch(endpoint, options.input ?? {}, {
      method: "POST",
      headers: { ...options.headers },
      signal: options.signal,
      raw: { body: sse.encode(source) },
    });
    return response.body;
  }

  socket(endpoint, vector, query = {}) {
    const base = this.url.branch(endpoint).with(query);
    const ws = base.scheme(base.secure ? "wss" : "ws");
    return new Socket(new WebSocket(ws.absolute), vector);
  }

  get $isConnected() {
    return computed(this.$state, (s) => s === "CONNECTED");
  }

  get $isError() {
    return computed(this.$state, (s) => s === "ERROR");
  }
}
// import { atom, computed } from "nanostores";
// import { shards } from "@vivalence/typology";
// import { Url, Status, Request, Response } from "@vivalence/typology";

// export class Connection {
//   status = new Status(null, this);
//   $state = atom("UNRESOLVED");
//   $error = atom(null);

//   constructor(url, transport = transmitter.fetcher) {
//     this.url = url instanceof Url ? url : new Url(url);
//     this.transport = transport;
//     this.use(track(this));
//   }

//   use(fn) {
//     const inner = this.transport;
//     this.transport = (ctx) => fn(ctx, () => inner(ctx));
//     return this;
//   }

//   branch(path) {
//     return new this.constructor(this.url.branch(path), this.transport);
//   }

//   clone() {
//     return new this.constructor(this.url, this.transport);
//   }

//   async request(request) {
//     if (!(request instanceof Request)) {
//       console.warn(
//         "@prototype/connection:/request] conceptually unsupported to pass non request.",
//       );
//       request = new Request({
//         ...request,
//         url: this.url.branch(request.url || "/"),
//       });
//     }

//     // retry on the request object itself.!

//     const ctx = {
//       request,
//       response: new Response(),
//       state: {},
//     };

//     await this.transport(ctx);

//     return ctx.response;
//   }

//   async fetch(endpoint, body = {}, options = {}) {
//     const request = new Request({
//       url: this.url.branch(endpoint),
//       body,
//       ...options,
//     });

//     const response = await this.request(request);

//     return response;
//   }

//   async call(endpoint, body = {}, options = {}) {
//     const response = await this.fetch(endpoint, body, options);

//     if (!response.ok) {
//       // NEED: prototype.CallError ~ not.xzy
//       const error = new Error(`Request failed: ${response.status}`);
//       error.response = response;
//       console.error({ endpoint, response });
//       throw error;
//     }

//     return response.body;
//   }

//   aim(endpoint, bodyI = {}, optionsI = {}) {
//     return (bodyII = {}, optionsII = {}) => {
//       return this.call(
//         endpoint,
//         object.merge(bodyII, bodyI),
//         object.merge(optionsII, optionsI),
//       );
//     };
//     //
//   }

//   get isHealthy() {
//     return computed(this.$state, (state) => state === "HEALTHY");
//   }

//   get isFaulty() {
//     return computed(this.$state, (state) => state === "FAULTY");
//   }

//   setActive() {
//     this.status.set({ code: "ACTIVE" });
//   }

//   setHealthy() {
//     this.$state.set("HEALTHY");
//     this.status.set({ code: "SUCCESS", label: "connected" });
//     this.$error.set(null);
//   }

//   setFaulty(error) {
//     this.$state.set("FAULTY");
//     this.status.set({ code: "ERROR", error });
//     this.$error.set(error);
//   }
// }

// const track = (connection) => async (ctx, next) => {
//   try {
//     connection.setActive();
//     await next();
//     connection.setHealthy();
//   } catch (error) {
//     connection.setFaulty(error);
//     throw error;
//   }
// };

// export class Connection {
//   constructor(url, carry) {
//     this.url = url;
//     // this.carry = [carry, track(this)];
//   }

//   branch(path) {
//     return new this.constructor(
//       this.url.branch(path),
//       // (ctx) => compose(this.carry)(ctx), // whatever to compose the dispatch of this connections carry at this moment.
//     );
//   }

//   async call(endpoint, body = {}, params = {}) {
//     // const url = this.url.branch(endpoint).absolute;

//     // const composed = compose(carry);
//     const ctx = {};
//     await composed(ctx, vtransport);

//     // return ctx.response.body;
//   }

//   // TODO LATER ctx.request.retry = async () => {if (!ctx.state.isRetry === true) {ctx.state.isRetry = true; ctx.response.body = await instance(endpoint, body, params);}};
//   use(middleware) {
//     this.carry.push(middleware);
//     return this;
//   }

// }
```

### `subsystems/typology/prototypes/remote-repository.js`

```js
// subsystems/typology/prototypes/remote-repository.js
import * as object from "../gestalten/belt/object.js";

export class RemoteRepository {
  schema = {};
  subscriptions = new Set();

  constructor(kind) {
    this.kind = kind;
  }

  connect(connection) {
    this.connection = connection;
    return this;
  }

  manage(entityManager, name) {
    this.entityManager = entityManager;
    this.managedName = name;
    this.$entities = entityManager.stores[name];
    return this;
  }

  persist() {
    this.persisted = true;
    this.storageKey = this.connection.url.absolute;
    const repo = this;
    this.encode = (entities) => {
      const props = repo.schema?.properties ?? {};
      return JSON.stringify(entities, function (k, v) {
        if (typeof v === "function") return undefined;
        if (v instanceof Set || v instanceof Map) return undefined;
        const spec = props[k];
        if (spec) {
          if (spec.kind === "m:1") return v?.id ? { id: v.id } : v;
          if (spec.kind === "1:m" || spec.kind === "m:n") {
            return Array.isArray(v) ? v.map((e) => (e?.id ? { id: e.id } : e)) : v;
          }
        }
        if (v != null && typeof v === "object" && !Array.isArray(v) && v.constructor !== Object) {
          return undefined;
        }
        return v;
      });
    };
    const existing = this.$entities.get();
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        for (const raw of JSON.parse(stored)) this.entityManager.merge(this.managedName, raw, this.kind);
      } catch (error) {
        // corrupt cache: discard the poisoned key so it can't re-break the next boot,
        // then fall through to the network (find revalidates). Logged, never silent.
        console.warn(`[repo] discarding corrupt cache @ ${this.storageKey}`, error);
        localStorage.removeItem(this.storageKey);
      }
    }
    if (existing.length > 0) {
      for (const raw of existing) this.entityManager.merge(this.managedName, raw, this.kind);
    }
    return this;
  }

  // ── queries ──────────────────────────────────────────────────────

  epoch(work) {
    return this.entityManager ? this.entityManager.epoch(work) : work();
  }

  async find(where = {}, options = {}) {
    const local = this.$entities.get();
    if (this.persisted && local.length > 0) {
      this.revalidating = this.connection
        .call("/find", { where, options })
        .then((fresh) => this.epoch(async () => {
          const freshIds = new Set(fresh.map((r) => r.id));
          for (const e of this.$entities.get()) {
            if (!freshIds.has(e.id)) this.drop(e.id);
          }
          await Promise.all(fresh.map((raw) => this.cast(raw)));
        }))
        .catch((e) => console.error("[repo] revalidate", e));
      return this.epoch(() =>
        Promise.all(local.filter((e) => object.match(e, where)).map((e) => this.cast(e))),
      );
    }
    const results = await this.connection.call("/find", { where, options });
    return this.epoch(() => Promise.all(results.map((raw) => this.cast(raw))));
  }

  findOneLocal(where = {}) {
    return this.$entities.get().find((e) => object.match(e, where)) ?? null;
  }

  async findOne(where = {}, options = {}) {
    const local = this.findOneLocal(where);
    if (local) return local;
    const result = await this.connection.call("/findOne", { where, options });
    return result ? await this.cast(result) : null;
  }

  async findAndCount(where = {}, options = {}) {
    const [entities, count] = await this.connection.call("/findAndCount", { where, options });
    return [await this.epoch(() => Promise.all(entities.map((raw) => this.cast(raw)))), count];
  }

  async count(where = {}, options = {}) {
    return this.connection.call("/count", { where, options });
  }

  // ── mutations ────────────────────────────────────────────────────

  async create(data = {}) {
    const result = await this.connection.call("/create", { data });
    return await this.merge(result);
  }

  async upsert(data = {}) {
    const result = await this.connection.call("/upsert", { data });
    return await this.merge(result);
  }

  async ensure(data = {}) {
    const result = await this.connection.call("/ensure", { data });
    return await this.merge(result);
  }

  async updateOne(where = {}, data = {}) {
    const result = await this.connection.call("/updateOne", { where, data });
    return await this.merge(result);
  }

  async update(where = {}, data = {}) {
    const results = await this.connection.call("/update", { where, data });
    return this.epoch(() => Promise.all(results.map((r) => this.merge(r))));
  }

  async removeOne(where = {}) {
    await this.connection.call("/removeOne", { where });
    if (where.id) this.drop(where.id);
  }

  async remove(where = {}) {
    const { ids } = await this.connection.call("/remove", { where });
    for (const id of ids) this.drop(id);
  }

  // ── subscription ─────────────────────────────────────────────────

  subscribe(where = {}, callback) {
    const repo = this;
    const options = {
      headers: { "x-filter": JSON.stringify(where) },
      body: { where },
      resumed: () => {
        repo.find(where).catch((error) => console.warn(`[probe] resync failed`, error));
      },
    };

    const handle = async (event) => {
      if (event.op === "delete") {
        repo.drop(event.entity?.id ?? event.entity);
        if (callback) callback(null, event);
      } else {
        const merged = await repo.merge(event.entity);
        if (callback) callback(merged, event);
      }
    };

    const unsubscribe = this.connection.subscribe("/subscribe", handle, options);
    this.subscriptions.add(unsubscribe);
    const teardown = () => {
      unsubscribe();
      this.subscriptions.delete(unsubscribe);
    };
    return teardown;
  }

  // ── identity ─────────────────────────────────────────────────────

  async merge(raw) {
    if (!raw) return null;
    const result = await this.entityManager.integrate(this.managedName, raw, this.kind);
    this.store();
    return result;
  }

  async cast(raw) {
    return this.merge(raw);
  }

  drop(id) {
    this.entityManager.drop(this.managedName, id);
    this.store();
  }

  store() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, this.encode(this.$entities.get()));
    } catch (error) {
      // persistence is best-effort: quota/availability failures must not break the
      // in-memory store. Logged, never silent.
      console.warn(`[repo] persist failed @ ${this.storageKey}`, error);
    }
  }
}
```

### `subsystems/typology/prototypes/entity-manager.js`

```js
// subsystems/typology/prototypes/entity-manager.js
import { atom, computed } from "nanostores";

// RemoteEntityManager — sits below repositories.
//
// Owns the identity map and unit of work.
// RemoteRepository delegates merge/put/drop to the EM when managed.
//
// Receives an authorized connection. Auth is a property of the connection.

export class RemoteEntityManager {
  constructor(connection, schema = {}) {
    this.connection = connection;
    this.schema = schema;

    // Identity map: all entity types, keyed by "name:id".
    this.identities = new Map();

    // Snapshots for dirty tracking.
    this.snapshots = new Map();

    // Reactive store per entity type.
    this.stores = {};

    // Unit of work.
    this.dirty = new Set();
    this.removed = new Set();

    // Registered repos + their compiled integrators.
    this.repositoryMap = {};
    this.integrators = {};

    // (name:id) keys whose integrator has already run. Claimed synchronously
    // at the top of integrate() so that nested/concurrent integrates on the
    // same id dedupe the install even when cast() does awaited resolution
    // of back-referencing children.
    this.installed = new Set();

    this.epochDepth = 0;
    this.epochTouched = new Set();
  }

  // ── repository access ────────────────────────────────────────────

  repo(name) {
    if (this.repositoryMap[name]) return this.repositoryMap[name];
    throw new Error(`No repository registered for: ${name}`);
  }

  // Register an existing RemoteRepository to be managed by this EM.
  // Optional integrate fn: runs once per (name, id) on first sight.
  register(name, repository, integrate = null) {
    if (!this.stores[name]) this.stores[name] = atom([]);
    repository.manage(this, name);
    this.repositoryMap[name] = repository;
    this.integrators[name] = integrate;
    return repository;
  }

  // ── identity map ─────────────────────────────────────────────────

  key(name, id) { return `${name}:${id}`; }

  identity(name, reference) {
    if (!reference) return null;
    const id = typeof reference === "object" ? reference.id : reference;
    return this.identities.get(this.key(name, id)) ?? null;
  }

  // Merge raw data into identity map. Returns canonical entity reference.
  merge(name, raw, kind) {
    if (!raw?.id) return raw;

    const props = this.schema[name]?.properties;
    const mapKey = this.key(name, raw.id);
    const existing = this.identities.get(mapKey);

    if (existing) {
      for (const field of Object.keys(raw)) {
        let incoming = raw[field];
        if (incoming === undefined) continue;
        const spec = props?.[field];
        if (spec?.target && incoming != null) {
          if (spec.kind === "m:1") {
            const id = typeof incoming === "object" ? incoming.id : incoming;
            incoming = this.identity(spec.target, id) ?? (existing[field]?.id === id ? existing[field] : incoming);
          } else if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(incoming)) {
            incoming = incoming.map((item) => this.identity(spec.target, item) ?? item);
          }
        }
        if (Array.isArray(incoming) && incoming.length === 0 && Array.isArray(existing[field]) && existing[field].length > 0) continue;
        existing[field] = incoming;
      }
      this.refreshStore(name);
      this.snapshot(name, existing);
      return existing;
    }

    const entity = kind ? Object.assign(new kind(), raw) : raw;
    this.identities.set(mapKey, entity);
    this.stores[name].get().push(entity);
    this.refreshStore(name);
    this.snapshot(name, entity);
    return entity;
  }

  async epoch(work) {
    this.epochDepth++;
    try {
      return await work();
    } finally {
      if (--this.epochDepth === 0) {
        const touched = [...this.epochTouched];
        this.epochTouched.clear();
        for (const name of touched) this.refreshStore(name);
      }
    }
  }

  // Identity-gated install. Install runs exactly once per (name, id):
  // first-sight passes through cast (relation walk) then runs the registered
  // integrator. Re-sight is just cast. The claim is synchronous so a nested
  // integrate on the same id (e.g. a child back-referencing its parent)
  // observes the parent as already-installed and does not re-fire.
  async integrate(name, raw, kind) {
    if (!raw?.id) return raw;
    const mapKey = this.key(name, raw.id);
    if (this.installed.has(mapKey)) return this.merge(name, raw, kind);
    this.installed.add(mapKey);
    try {
      const entity = await this.cast(name, raw, kind);
      const install = this.integrators[name];
      if (install) await install(entity, raw);
      return entity;
    } catch (error) {
      this.installed.delete(mapKey);
      throw error;
    }
  }

  async disintegrate(name, id) {
    this.drop(name, id);
  }

  async resolve(name, reference) {
    if (reference == null) return null;
    if (typeof reference === "string") return this.identity(name, reference) ?? reference;
    if (reference.id) {
      const repository = this.repositoryMap[name];
      if (!repository) return reference;
      return await repository.merge(reference);
    }
    return reference;
  }

  async cast(name, raw, kind) {
    const props = this.schema[name]?.properties;

    // Resolve relation refs into a fresh payload BEFORE merging. The reactive
    // store only ever sees fully-upgraded entity references, so any computed
    // filters fire on the final shape — not on pre-resolution string ids.
    const resolved = props ? { ...raw } : raw;
    if (props) {
      for (const [field, spec] of Object.entries(props)) {
        if (!spec.target || raw[field] == null) continue;
        if (spec.kind === "m:1") {
          resolved[field] = await this.resolve(spec.target, raw[field]);
        }
        if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(raw[field])) {
          resolved[field] = await Promise.all(raw[field].map((item) => this.resolve(spec.target, item)));
        }
      }
    }

    const entity = this.merge(name, resolved, kind);
    if (!props) return entity;

    for (const [field, spec] of Object.entries(props)) {
      if (spec.kind !== "1:m" || !spec.mappedBy) continue;
      const childRepo = this.repositoryMap[spec.target];
      if (!childRepo) continue;
      const mappedBy = spec.mappedBy;
      const hadExplicitArray = Array.isArray(resolved[field]);

      // When the parent cast received an explicit children array, enforce
      // the inverse on each child so the reactive collection agrees with
      // the explicit intake.
      if (hadExplicitArray) {
        for (const child of resolved[field]) {
          if (child && typeof child === "object" && child[mappedBy] !== entity) {
            child[mappedBy] = entity;
          }
        }
        this.refreshStore(spec.target);
      }

      if (!entity["$" + field]) {
        entity["$" + field] = computed(childRepo.$entities, (entities) =>
          entities.filter((child) =>
            child[mappedBy] === entity ||
            child[mappedBy]?.id === entity.id ||
            child[mappedBy] === entity.id,
          ),
        );
      }

      // Only route reads through the computed when the parent wasn't seeded
      // with an explicit array — otherwise preserve the direct assignment
      // merge() just made from `resolved[field]`.
      if (!hadExplicitArray) {
        Object.defineProperty(entity, field, {
          get() { return entity["$" + field].get(); },
          set() {},
          configurable: true,
        });
      }
    }
    return entity;
  }

  drop(name, id) {
    const mapKey = this.key(name, id);
    this.identities.delete(mapKey);
    this.snapshots.delete(mapKey);
    this.installed.delete(mapKey);
    if (this.stores[name]) {
      this.stores[name].set(this.stores[name].get().filter((entity) => entity.id !== id));
    }
  }

  // ── unit of work ─────────────────────────────────────────────────

  persist(entity) {
    this.removed.delete(entity);
    this.dirty.add(entity);
    const { name } = this.repositoryForEntity(entity);
    if (name) this.refreshStore(name);
  }

  remove(entity) {
    this.dirty.delete(entity);
    this.removed.add(entity);
  }

  async flush() {
    const operations = [];

    for (const entity of this.dirty) {
      const { name, repository } = this.repositoryForEntity(entity);
      if (!repository) continue;
      const diff = this.changes(name, entity);
      if (diff) {
        operations.push({
          path: `${repository.link.url.pathname}/updateOne`,
          body: { where: { id: entity.id }, data: diff },
          method: "POST",
        });
      }
    }

    for (const entity of this.removed) {
      const { name, repository } = this.repositoryForEntity(entity);
      if (!repository) continue;
      operations.push({
        path: `${repository.link.url.pathname}/removeOne`,
        body: { where: { id: entity.id } },
        method: "POST",
      });
    }

    if (operations.length) {
      await this.connection.call("/batch", operations);

      for (const entity of this.dirty) {
        const { name } = this.repositoryForEntity(entity);
        if (name) this.snapshot(name, entity);
      }

      for (const entity of this.removed) {
        const { name } = this.repositoryForEntity(entity);
        if (name) this.drop(name, entity.id);
      }
    }

    this.dirty.clear();
    this.removed.clear();
  }

  // ── snapshots ────────────────────────────────────────────────────

  snapshot(name, entity) {
    if (!entity?.id) return;
    try {
      const plain = entity.toJSON ? entity.toJSON() : { ...entity };
      this.snapshots.set(this.key(name, entity.id), structuredClone(plain));
    } catch {
      // Entity contains non-cloneable values (functions, closures).
      // Skip snapshot — dirty tracking won't work for this entity.
    }
  }

  changes(name, entity) {
    if (!entity?.id) return null;
    const original = this.snapshots.get(this.key(name, entity.id));
    if (!original) return null;

    const current = entity.toJSON ? entity.toJSON() : { ...entity };
    const diff = {};
    let hasDiff = false;

    for (const [field, value] of Object.entries(current)) {
      if (field === "id" || field === "createdAt" || field === "updatedAt") continue;
      if (JSON.stringify(value) !== JSON.stringify(original[field])) {
        diff[field] = value;
        hasDiff = true;
      }
    }
    return hasDiff ? diff : null;
  }

  // ── fork ─────────────────────────────────────────────────────────

  fork() {
    return new RemoteEntityManager(this.connection, this.schema);
  }

  // ── internals ────────────────────────────────────────────────────

  refreshStore(name) {
    if (this.epochDepth > 0) {
      this.epochTouched.add(name);
      return;
    }
    if (this.stores[name]) {
      this.stores[name].set([...this.stores[name].get()]);
    }
  }

  repositoryForEntity(entity) {
    for (const [name, repository] of Object.entries(this.repositoryMap)) {
      if (repository.kind && entity instanceof repository.kind) return { name, repository };
    }
    for (const [name] of Object.entries(this.repositoryMap)) {
      if (this.identities.has(this.key(name, entity.id))) return { name, repository: this.repositoryMap[name] };
    }
    return { name: null, repository: null };
  }
}
```

### `subsystems/typology/prototypes/stall.js`

```js
// subsystems/typology/prototypes/stall.js
export const Phase = Object.freeze({
  INERT: "inert",
  MANUAL: "manual",
  CONTINUOUS: "continuous",
  ESCORT: "escort",
});

export function Stall({ source, active, phase, pull = null, depth = () => 1 }) {
  const teardowns = [];
  const wired = new WeakSet();
  const hooks = {
    release: [
      (that, old) => {
        console.log("Stall on release", { that, old });
      },
    ],
  };
  let locked = false;

  const stall = {
    $source: source,
    $active: active,
    $phase: phase,
    on: { release: (callback) => (hooks.release.push(callback), stall) },
    filter: () => true,

    items: () => source.get().filter(stall.filter),
    active: () => active.get(),
    only(predicate) {
      stall.filter = predicate;
      return stall;
    },
    refill() {
      const current = phase.get();
      if (current === Phase.CONTINUOUS) stall.pull();
      if (current === Phase.ESCORT && !stall.items().length)
        active.set(source.get().find((buffer) => !stall.filter(buffer)) ?? null);
    },

    advance() {
      const list = stall.items();
      if (!list.length) return active.set(null);
      const at = list.findIndex((buffer) => buffer.id === stall.active()?.id);
      active.set(list[at + 1] ?? list[0]);
    },

    settle() {
      const list = stall.items();
      if (list.length) {
        if (!list.some((buffer) => buffer.id === stall.active()?.id)) stall.advance();
        return;
      }
      const current = stall.active();
      if (!current || !source.get().some((buffer) => buffer.id === current.id)) active.set(null);
    },

    async pull() {
      if (locked || !pull || stall.items().length >= depth()) return;
      locked = true;
      try {
        await pull(stall);
      } catch (error) {
        console.log("[STALL ERROR]", { error });
      } finally {
        locked = false;
      }
    },

    release(buffer) {
      if (phase.get() === Phase.INERT) return;
      if (stall.active()?.id === buffer.id) stall.advance();
      for (const hook of hooks.release) hook(buffer);
      stall.refill();
    },

    deactivate() {
      while (teardowns.length) teardowns.pop()();
      return stall;
    },

    toJSON: () => ({
      phase: phase.get(),
      active: stall.active()?.id ?? null,
      items: stall.items().map((buffer) => buffer.id),
      depth: depth(),
    }),
  };

  const react = () => {
    if (phase.get() === Phase.INERT) return;
    stall.settle();
    stall.refill();
  };

  const observe = () => {
    const step = () => {
      for (const buffer of stall.items()) {
        if (wired.has(buffer)) continue;
        wired.add(buffer);
        buffer.on.release(() => stall.release(buffer));
      }
      react();
    };
    teardowns.push(source.subscribe(step), active.subscribe(step));
  };

  phase.subscribe((current) => {
    stall.deactivate();
    if (current === Phase.INERT) return;
    observe();
  });

  return stall;
}
```

### `subsystems/typology/prototypes/bundle.js`

```js
// subsystems/typology/prototypes/bundle.js
import { digest } from "../gestalten/belt/crypto.js";

const verified = new Map();

export class Bundle {
  url = null;
  entries = [];

  constructor(record = {}) {
    if (record instanceof Bundle) return record;
    this.entries = record.entries ?? [];
    this.url = record.url ?? null;
  }

  static merge(...bundles) {
    const entries = new Map();
    for (const bundle of bundles) for (const entry of new Bundle(bundle).entries) entries.set(entry.mime, entry);
    return new Bundle({ entries: [...entries.values()] });
  }

  withUrl(url) {
    this.url = url;
    return this;
  }

  entry(type) {
    return this.entries.find((candidate) => candidate.mime === type);
  }

  negotiate(accept) {
    return accept.map((type) => this.entry(type)).find(Boolean) ?? null;
  }

  async load(accept) {
    const entry = this.negotiate(accept);
    if (!entry) throw new Error(`bundle offers none of ${accept.join(" · ")}: ${this.entries.map((held) => held.mime).join(" · ")}`);
    if (verified.has(entry.integrity)) return verified.get(entry.integrity);
    const response = await fetch(this.url + entry.mount);
    if (!response.ok) throw new Error(`bundle fetch ${response.status}`);
    const text = await response.text();
    const digested = await digest(text);
    if (digested !== entry.integrity)
      throw new Error(`integrity sha256 ${digested.slice(0, 12)} is not ${entry.integrity.slice(0, 12)}`);
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    try {
      const module = await import(/* @vite-ignore */ url);
      verified.set(entry.integrity, module);
      return module;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  get json() {
    return { entries: this.entries };
  }

  toJSON() {
    return this.json;
  }
}
```

### `subsystems/typology/prototypes/mode.js`

```js
// subsystems/typology/prototypes/mode.js
import { Status } from "./status.js";
import { Path } from "./path.js";


// live citizen constructed from a registry module (read.viva result).
export class Mode {
  // connection // entity: <em.Module> // url // view? // call

  status = new Status("<uninitialized>", this);
  aperture = null;
  stdout = null;

  constructor(module) {
    Object.assign(this, module);
    this.module = module;
  }

  implements(trait) {
    return this.manifest.traits.includes(trait.toUpperCase());
  }
}
```

### `subsystems/typology/gestalten/steer/dispatch.js`

```js
// subsystems/typology/gestalten/steer/dispatch.js
import { Signal } from "../../prototypes/signal.js";
import { Signature } from "../../prototypes/signature.js";
import { Long, Short, NotFound } from "../../prototypes/errors/vector.js";
import * as middleware from "../belt/middleware.js";
import { scope, feed } from "./match.js";
import { request, resolve } from "./strategy.js";
import { descend } from "./trie.js";

export const execute = (vector, context, signal = new Signal()) => {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return carry(context, resolve(effect));
};

export function traverse(vector, signals) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    if (signal.nature == null) {
      carry = descend(carry, position);
      return [position.effect ?? null, carry, steps, position];
    }

    let match, trajectory, effect;
    try {
      [match, trajectory, effect] = feed(scope(position, signal), signal);
    } catch (error) {
      if (error instanceof NotFound) return [null, carry, steps, position];
      throw error;
    }

    steps.push(match);

    if (match.type === "remainder") {
      match.parameter = String(remainder);
      match.parameters = { [remainder]: match.nature };
      remainder++;

      if (signals.length === steps.length) {
        carry = descend(carry, position);
        if (effect) return [effect, carry, steps, position];
      }

      continue;
    }

    carry = descend(carry, position);

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, carry, steps, position];
    if (trajectory) position = trajectory;
  }

  return [position.effect ?? null, carry, steps, position];
}

export function invoke(vector, signal, execute = request) {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}

export function shotgun(vector, signal, execute = request) {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  let position = vector;
  let carry = middleware.forward;
  let steps = [];

  for (let i = 0; i < signal.array.length; i++) {
    const seg = signal.array[i];
    const matches = scope(position, seg);

    carry = descend(carry, position);

    if (i === signal.array.length - 1) {
      return matches
        .filter(([, , effect]) => effect)
        .map(([match, , effect]) => execute(carry, effect, [...steps, match], signal));
    }

    const trajectory = matches.find(([, t]) => t);
    if (!trajectory) return [];
    steps.push(trajectory[0]);
    position = trajectory[1];
  }

  return [];
}

export async function walk(vector, more) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let signal;

  while (position.patterns.length) {
    if (steps.length >= 20) throw new Long();
    if (!signal?.nature) signal = await more(position.patterns);
    if (!signal.nature) throw new Short(position);

    const [effect, luggage, path, trajectory] = traverse(position, signal);
    if (!effect && path.length < signal.array.length) throw new NotFound(signal);

    carry = middleware.chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
```

### `subsystems/typology/gestalten/steer/strategy.js`

```js
// subsystems/typology/gestalten/steer/strategy.js
import * as is from "../is/index.js";
import * as fromm from "../fromm/index.js";
import { Context } from "../../prototypes/context.js";
import { ValidationError } from "../../prototypes/errors/vector.js";

export function fire(effect, context) {
  if (effect.length === 0) return effect();
  if (effect.length === 1) return effect(context);
  return effect(context.input, context);
}

export const resolve = (effect) => async (context) => {
  const result = await fire(effect, context);
  if (!context.output && !is.undefined(result)) context.output = result;
  return context.output;
};

export const direct = (carry, effect) => async (context) => {
  await carry(context, resolve(effect));
  return context.output;
};

export const bare = (carry, effect, steps) => async (input) => {
  const context = { input, output: undefined, steps };
  await carry(context, resolve(effect));
  return context.output;
};

export const echo = (carry, effect, steps, signal) => async (input) => {
  const ctx = { input, output: undefined, signal, steps, params: {}, state: {} };
  await carry(ctx, resolve(effect));
  return ctx.output;
};

export const request = (carry, effect, steps, signal) => async (input) => {
  const ctx = new Context({
    request: { body: input, url: signal, method: "*" },
    params: fromm.match(steps).parameters,
    signal,
    steps,
  });
  await carry(ctx, resolve(effect));
  return ctx.output;
};

export const guarded = (carry, effect, steps, signal) => async (input) => {
  // for (const step of steps) step.input?.cast(ctx.input);
  for (const step of steps) {
    if (step.input) {
      input = step.input.cast(input);
      const errors = [...step.input.errors(input)];
      if (errors.length) throw new ValidationError(errors, signal);
    }
  }
  const ctx = new Context({
    request: { body: input, url: signal, method: "*" },
    params: fromm.match(steps).parameters,
    signal,
    steps,
  });

  await carry(ctx, resolve(effect));

  // for (const step of steps) {if (step.output) {step.output.cast(ctx.output); const errors = [...step.input.errors(ctx.output)]; if (errors.length) throw new ValidationError(errors, signal);}}

  return ctx.output;
};
```

### `subsystems/typology/gestalten/steer/trie.js`

```js
// subsystems/typology/gestalten/steer/trie.js
import { Signal } from "../../prototypes/signal.js";
import * as middleware from "../belt/middleware.js";
import { request } from "./strategy.js";

export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie.values()].map(({ pattern, trajectory }) =>
    fold(trajectory, step, {
      ...here,
      signature: pattern,
      steps: [...here.steps, pattern],
      signal: here.signal.branch(pattern.nature),
    }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}

export function survey(vector, visit = (node) => node, execute) {
  return fold(vector, {
    node: (f) =>
      visit({
        signature: f.signature,
        effect: f.effect,
        invoke:
          f.effect !== undefined && execute
            ? execute(f.carry, f.effect, f.steps, route(f.steps))
            : undefined,
        trajectories: f.trajectories,
        path: f.steps,
      }),
  });
}

export function rollup(vector, execute = request) {
  const entries = [];
  fold(vector, {
    node: (f) => {
      if (f.effect !== undefined)
        entries.push({
          pattern: f.signature,
          steps: f.steps,
          fn: execute(f.carry, f.effect, f.steps, route(f.steps)),
        });
      return null;
    },
  });
  return entries;
}
```

### `subsystems/typology/gestalten/steer/match.js`

```js
// subsystems/typology/gestalten/steer/match.js
import { NotFound } from "../../prototypes/errors/vector.js";

export function feed(matches, signal) {
  if (!matches.length) throw new NotFound(signal);
  if (signal.heir) return matches[0];
  return matches.find(([, , effect]) => effect) ?? matches[0];
}

export function greedy(vector, signal) {
  for (const { pattern, trajectory } of vector.trie.values()) {
    const match = pattern.apply(signal);
    if (match) return [[match, trajectory, trajectory.effect ?? null]];
  }

  return [];
}

export function scope(vector, signal) {
  const scope = [];

  for (const { pattern, trajectory } of vector.trie.values()) {
    const match = pattern.apply(signal);
    if (match) scope.push([match, trajectory, trajectory.effect ?? null]);
  }

  return scope;
}
```

### `subsystems/typology/gestalten/shard/context.js`

```js
// subsystems/typology/gestalten/shard/context.js
import * as contexts from "../../schematics/primitives/contexts.js";
import { v } from "../../schematics/index.js";
import { ValidationError } from "../../prototypes/errors/vector.js";

export const bind = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
};

export const scope = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
  ctx[key] = null;
  delete ctx[key];
};

export const attach = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
  ctx[key] = null;
  delete ctx[key];
};

export const lift = (set, bearer) => Object.fromEntries(Object.keys(set).map((word) => [word, bearer[word]]));

export const spread = (set, bearer) => async (ctx, next) => {
  Object.assign(ctx, lift(set, bearer));
  await next();
};

export const conform = (...sets) => {
  const schema = contexts.of(...sets);
  return async (ctx, next) => {
    const faults = v.faults(schema, ctx);
    if (faults.length) throw new ValidationError(faults, ctx.signal);
    await next();
  };
};
```

### `subsystems/typology/gestalten/shard/track.js`

```js
// subsystems/typology/gestalten/shard/track.js
import { Span } from "../../prototypes/span.js";

const wire = (message) => {
  const shape = {};
  if (message.method) shape.method = message.method;
  const path = message.url?.pathname ?? message.path;
  if (path) shape.path = path;
  if (message.status) shape.status = message.status;
  return shape;
};

export function span(name, pipe) {
  return async (ctx, next) => {
    const nature = typeof name === "function" ? name(ctx) : name;
    const parent = ctx.span;
    ctx.span = parent ? parent.branch(nature) : new Span(nature).to(pipe);
    ctx.span.open();
    try {
      await next();
    } finally {
      ctx.span.close();
      ctx.span = parent ?? ctx.span;
    }
  };
}

export function request() {
  return async (ctx, next) => {
    if (ctx.span && ctx.request) ctx.span.mark("request", wire(ctx.request));
    await next();
    if (ctx.span && ctx.response) ctx.span.mark("response", wire(ctx.response));
  };
}

export function subject(schema, id) {
  return async (ctx, next) => {
    if (ctx.span)
      ctx.span.mark("subject", {
        schema: typeof schema === "function" ? schema(ctx) : schema,
        id: typeof id === "function" ? id(ctx) : id,
      });
    await next();
  };
}

export function fault() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.span?.fault(error);
      throw error;
    }
  };
}
```

### `subsystems/typology/gestalten/shard/connection.js`

```js
// subsystems/typology/gestalten/shard/connection.js
import { Url } from "../../prototypes/url.js";

export const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.set("Authorization", `Bearer ${auth.access}`);
  }
  await next();
};

export const timeout = (ms) => async (ctx, next) => {
  const duration = ms ?? ctx.request.options.timeout;
  if (!duration) return next();
  // a stream's lifetime is not a request timeout — SSE connects exempt
  if (ctx.request.headers.get("accept") === "text/event-stream") return next();

  const timer = setTimeout(() => ctx.request.abort(), duration);

  try {
    await next();
  } finally {
    clearTimeout(timer);
  }
};

export const batch = (options = {}) => {
  const { hatch, endpoint = "/batch", filter } = options;
  let queue = null;
  const basePath = hatch?.pathname ?? "";

  return async (ctx, next) => {
    if (filter && !filter(ctx)) return next();

    const fullPath = ctx.request.url.pathname;
    const path =
      basePath && fullPath.startsWith(basePath) ? fullPath.slice(basePath.length) || "/" : fullPath;
    const body = ctx.request.body;
    const method = ctx.request.method;

    if (!queue) {
      queue = [];
      const q = queue;

      queueMicrotask(() => {
        queue = null;

        if (q.length === 1) {
          const entry = q[0];
          entry.next().then(entry.resolve, entry.reject);
          return;
        }

        const lead = q[0];
        lead.ctx.request.body = q.map((e) => ({ path: e.path, body: e.body, method: e.method }));
        lead.ctx.request.url = hatch
          ? hatch.branch(endpoint)
          : new Url(`${lead.ctx.request.url.origin}${endpoint}`);
        lead.ctx.request.method = "POST";

        lead
          .next()
          .then(() => {
            const results = lead.ctx.response.body;
            if (!Array.isArray(results)) {
              console.warn(`[probe] batch response not array @ ${lead.ctx.request.url.pathname}`);
              lead.ctx.response.setError();
              for (const entry of q) entry.reject(lead.ctx.response.error);
              return;
            }
            for (let i = 0; i < q.length; i++) {
              const entry = q[i];
              const result = results[i];
              if (!result || result.status >= 400) {
                console.warn(`[probe] batch entry failed ${entry.path} status ${result?.status ?? "none"}`);
                entry.ctx.response.status = result?.status ?? 500;
                entry.ctx.response.body = result?.body ?? null;
                entry.ctx.response.setError();
                entry.reject(entry.ctx.response.error);
              } else {
                entry.ctx.response.status = result.status;
                entry.ctx.response.body = result.body;
                entry.resolve();
              }
            }
          })
          .catch((err) => {
            console.warn(`[probe] batch transport failed (${q.length} entries)`, err);
            for (const entry of q) entry.reject(err);
          });
      });
    }

    return new Promise((resolve, reject) => {
      queue.push({ ctx, path, body, method, next, resolve, reject });
    });
  };
};

export const track = (connection) => async (ctx, next) => {
  connection.$state.set("CONNECTING");

  try {
    await next();

    if (ctx.response.error) {
      connection.$state.set("ERROR");
      connection.$error.set(ctx.response.error);
    } else {
      connection.$state.set("CONNECTED");
      connection.$error.set(null);
    }
  } catch (error) {
    connection.$state.set("ERROR");
    connection.$error.set(error);
    throw error;
  }
};
```

### `subsystems/typology/gestalten/shard/transmitter.js`

```js
// subsystems/typology/gestalten/shard/transmitter.js
import { atom } from "nanostores";
import { ConnectionError } from "../../prototypes/errors/connection.js";
import { Response } from "../../prototypes/response.js";
import { Socket } from "../../prototypes/socket.js";
import { Url } from "../../prototypes/url.js";
import { Vector } from "../../prototypes/vector.js";

const stamp = () => new Date().toISOString().slice(11, 23);

// used in connections

// multiplex — base transport. One WebSocket per origin, lazily established and
// reused; every exchange rides a frame over that shared socket. Class-free: the
// keeper is closed-over state. Compose under retry() exactly like fetcher.
export function multiplex({ authority, mount = "/multiplex", vector, connect } = {}) {
  // span = new Span('multiplex')
  const open = connect ?? ((address) => new WebSocket(address));
  const pools = new Map(); // origin → { socket, opening, $state }

  const keeper = (origin) => {
    let keep = pools.get(origin);
    if (!keep) pools.set(origin, (keep = { socket: null, opening: null, $state: atom("IDLE") }));
    return keep;
  };

  async function establish(origin) {
    const keep = keeper(origin);
    if (keep.socket && keep.socket.ws.readyState === 1) return keep.socket;
    if (!keep.opening) {
      keep.$state.set("CONNECTING");
      keep.opening = new Promise((resolve, reject) => {
        const token = authority?.get()?.access;
        const base = new Url(origin).branch(mount);
        const armed = token ? base.with({ token }) : base;
        const address = armed.scheme(armed.secure ? "wss" : "ws").absolute;
        const socket = new Socket(open(address), vector ?? new Vector());
        //@beef  vector = new Vector(().use(this.span.trace *shard).slurp(vector)
        socket.ws.addEventListener(
          "open",
          () => {
            keep.socket = socket;
            keep.opening = null;
            keep.$state.set("CONNECTED");
            resolve(socket);
          },
          { once: true },
        );
        socket.ws.addEventListener(
          "error",
          () => {
            keep.opening = null;
            keep.$state.set("ERROR");
            reject(ConnectionError.network(`multiplex refused ${origin}`));
          },
          { once: true },
        );
        socket.ws.addEventListener("close", () => {
          if (keep.socket === socket) keep.socket = null;
          keep.opening = null;
          keep.$state.set("CLOSED");
          reject(ConnectionError.network(`multiplex closed ${origin}`));
        });
      });
    }
    return keep.opening;
  }

  const transport = async (ctx) => {
    const { request, response } = ctx;
    try {
      const origin = request.url.origin;
      const keep = keeper(origin);
      const cold = !(keep.socket && keep.socket.ws.readyState === 1);
      const opened = cold ? Date.now() : 0;
      if (cold)
        ctx.span?.note({
          message: `multiplex ${keep.opening ? "joining" : "establishing"}`,
          origin,
        });
      let deny;
      const socket = await Promise.race([
        establish(origin),
        new Promise((_, reject) => {
          deny = () =>
            reject(ConnectionError.timeout(`multiplex establish aborted ${origin}`, { request }));
          if (request.signal.aborted) deny();
          else request.signal.addEventListener("abort", deny, { once: true });
        }),
      ]).finally(() => request.signal.removeEventListener("abort", deny));
      if (cold) ctx.span?.note({ message: "multiplex connected", origin, ms: Date.now() - opened });
      const upstream = request.stream();

      const frame = await socket.open(request.url, {
        query: request.url.search || undefined,
        input: request.body,
        verb: request.method,
        token: authority?.get()?.access,
        stream: upstream ? true : undefined,
      });

      const abort = () => socket.shut(frame);
      request.signal.addEventListener("abort", abort, { once: true });
      if (upstream) socket.feed(frame, upstream);

      if (request.headers.get("accept") === "text/event-stream") {
        response.status = 200;
        response.body = follow(socket, frame, request, abort);
        return;
      }

      try {
        for await (const output of socket.flow(frame)) {
          response.status = 200;
          response.body = output;
          return;
        }
        if (request.signal.aborted) {
          response.status = 0;
          response.error = ConnectionError.timeout("Request aborted", { request });
          response.body = { request };
          return;
        }
        response.status = 200;
        response.body = null;
      } finally {
        request.signal.removeEventListener("abort", abort);
        socket.forget(frame);
      }
    } catch (error) {
      if (request.signal.aborted) {
        response.status = 0;
        response.error = ConnectionError.timeout("Request aborted", { request });
      } else {
        response.status = error?.status ?? 0;
        response.error =
          error instanceof ConnectionError
            ? error
            : ConnectionError.network(`multiplex failed ${request.url.absolute}`, {
                request,
                error,
              });
      }
      response.body = { request, error };
    }
  };

  transport.close = () => {
    for (const keep of pools.values()) keep.socket?.close();
    pools.clear();
  };
  transport.$state = (origin) => keeper(origin).$state;
  return transport;
}

function follow(socket, frame, request, abort) {
  let settled = false;
  const conclude = () => {
    if (settled) return;
    settled = true;
    request.signal.removeEventListener("abort", abort);
    socket.forget(frame);
  };

  const body = (async function* () {
    let confirmed = false;
    try {
      for await (const output of socket.flow(frame, {
        arrived: () => {
          confirmed = true;
          body.onArrival?.();
        },
      })) {
        if (!confirmed) {
          confirmed = true;
          body.onArrival?.();
        }
        yield output;
      }
    } finally {
      if (!frame.closed) socket.shut(frame);
      conclude();
    }
  })();

  body.onArrival = null;
  return body;
}

// transport combinator — wraps a transport with retry policy. Lives at the effect
// boundary because compose's dispatch guard forbids re-entering next(); the wrapper
// owns the inner call, so attempts loop freely without touching the onion.
export const retry = (transport, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (ctx) => ctx.response.error?.isRetryable,
  } = options;
  const wrapped = async (ctx) => {
    for (let attempt = 0; ; attempt++) {
      ctx.request._attempt = attempt;
      await transport(ctx);
      if (!ctx.response.error || ctx.request.aborted || attempt >= maxRetries || !shouldRetry(ctx))
        return;
      const delay = Math.round(Math.min(baseDelay * 2 ** attempt + Math.random() * 500, maxDelay));
      ctx.span?.note({
        message: `retry ${attempt + 1}/${maxRetries} after ${ctx.response.error.type}`,
        delay,
      });
      console.log(
        `[probe ${stamp()}] retry ${attempt + 1}/${maxRetries} ${ctx.request.url.pathname} after ${ctx.response.error.type} — ${delay}ms backoff`,
      );
      ctx.response = new Response();
      ctx.request._controller = null;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (ctx.request.aborted) return;
    }
  };
  return wrapped;
};

export const inline = (serve) => async (ctx) => {
  const req = new Request(ctx.request.url.absolute, {
    method: ctx.request.method,
    headers: {
      "content-type": "application/json",
      ...Object.fromEntries(ctx.request.headers),
    },
    body:
      ctx.request.method !== "GET" && ctx.request.body !== undefined
        ? JSON.stringify(ctx.request.body)
        : undefined,
  });

  const res = await serve(req);

  ctx.response.status = res.status;
  res.headers.forEach((v, k) => ctx.response.headers.set(k, v));

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    ctx.response.body = await res.json().catch(() => null);
  } else if (contentType.includes("event-stream")) {
    ctx.response.body = res.body;
  } else if (contentType.startsWith("text/") || contentType.includes("/javascript")) {
    ctx.response.body = await res.text();
  } else if (res.body) {
    ctx.response.body = new Uint8Array(await res.arrayBuffer());
  }

  if (!res.ok) ctx.response.setError();
};

export const fetcher = async (ctx) => {
  const { request, response } = ctx;

  const options = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(request.headers),
    },
    credentials: request.options.credentials,
    signal: request.signal,
  };

  const upstream = request.stream();
  if (upstream) {
    if (request.body && Object.keys(request.body).length)
      throw new ConnectionError(
        "TRANSPORT",
        "plain HTTP cannot carry input beside an upstream body — converse rides the multiplex transport",
        { url: request.url.absolute },
      );
    options.body = upstream;
    options.duplex = "half";
    options.headers["Content-Type"] = "text/event-stream";
  } else if (request.method !== "GET" && request.body !== undefined) {
    options.body = JSON.stringify(request.body);
  }

  try {
    const res = await fetch(request.url.absolute, options);

    response.status = res.status;

    res.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      response.body = res.body;
    } else {
      response.body = contentType.includes("application/json")
        ? await res.json()
        : await res.text();
    }

    if (!res.ok) {
      response.setError(ConnectionError.fromStatus(res.status, response));
    }
  } catch (error) {
    console.warn(`[probe ${stamp()}] fetch failed ${request.url.absolute} — ${error.cause?.message ?? error.message}`);
    response.status = 0;
    response.error = ConnectionError.fromFetch(error, request);
    response.body = { request, error };
  }
};
// import { Response } from "@vivalence/typology";

// // should use response object explicitly.
// export const fetcher = async (ctx) => {
//   const { request } = ctx;

//   const options = {
//     method: request.method,
//     headers: {
//       "Content-Type": "application/json",
//       ...request.headers,
//     },
//     credentials: "include",
//   };

//   if (request._signal) {
//     options.signal = request._signal;
//   }

//   if (request.method !== "GET" && request.body !== undefined) {
//     options.body = JSON.stringify(request.body);
//   }

//   console.log("REQUEST", request.url.absolute, options);
//   let response;
//   try {
//     response = await fetch(request.url.absolute, options);
//   } catch (error) {
//     console.log("ERROR", request.url.absolute, error);
//     console.error(error, JSON.stringify({ error }));
//   }
//   console.log("RESPONSE", request.url.absolute, response);

//   const headers = {};
//   response.headers.forEach((value, key) => {
//     headers[key] = value;
//   });

//   let body;
//   const contentType = response.headers.get("content-type") || "";
//   if (contentType.includes("application/json")) {
//     body = await response.json();
//   } else {
//     body = await response.text();
//   }

//   ctx.response.status = response.status;
//   ctx.response.headers = new Map(Object.entries(headers));
//   ctx.response.body = body;
// };
```

### `subsystems/typology/gestalten/fromm/index.js`

```js
// subsystems/typology/gestalten/fromm/index.js
import { not } from "../not/index.js";
import * as cast from "../cast/index.js";
import * as is from "../is/index.js";
import { Path } from "../../prototypes/path.js";

export * from "./yield.js";

export const sink = (target) => {
  return {
    get write() {
      if (is.fn(target)) return target;
      if (target?.send) return (value) => target.send(value);
      if (target?.enqueue) return (value) => target.enqueue(value);
      if (target?.set) return (value) => target.set(value);
      if (target?.getWriter) {
        const writer = target.getWriter();
        const encoder = new TextEncoder();
        return (value) => writer.write(typeof value === "string" ? encoder.encode(value) : value);
      }
      throw not.is("sink", target);
    },
  };
};

export const source = (origin) => {
  return {
    get read() {
      if (origin?.[Symbol.asyncIterator]) return origin; // ReadableStream, Queue, generator
      if (origin?.observe) return origin.observe(); // Pipe
      if (Array.isArray(origin)) return (async function* () { yield* origin; })();
      throw not.is("source", origin);
    },
  };
};

export const url = (thing) => {
  if (!is.url(thing)) throw not.is("url", thing);
  const url = cast.url(thing);
  return {
    get path() {
      const [file, ...dir] = url.absolute
        .replace(/^file:\/\//, "")
        .split("/")
        .reverse();

      return new Path(file) //
        .from(new Path(dir.reverse().join("/")));
    },
  };
};

export const match = (steps) => {
  return {
    get parameters() {
      return steps
        .filter((step) => !!step.parameter)
        .reduce((acc, step) => ({ ...acc, ...step.parameters }), {});
    },
  };
};

export const signal = (signal) => {
  return {
    get flags() {
      return signal.array.reduce(
        (acc, node) => (node.flags ? { ...acc, ...node.flags } : acc),
        {},
      );
    },
  };
};

export const params = (params) => {
  return {
    get path() {
      const segments = [];
      while (params[segments.length] !== undefined) segments.push(params[segments.length]);
      if (!segments.length) return new Path("/");
      const path = new Path(segments);
      return path.fin ?? path;
    },
  };
};

export const modes = (modes) => {
  return {
    get flat() {
      return Object.values(modes).flatMap((type) => Object.values(type));
    },
  };
};

export const slugmap = (slugmap) => {
  return {
    get array() {
      return Object.entries(slugmap) //
        .map(([slug, map]) => ({ slug, ...map }));
    },
  };
};
```

### `subsystems/typology/gestalten/shape/http.js`

```js
// subsystems/typology/gestalten/shape/http.js
import { Signal } from "../../prototypes/signal.js";
import { Context } from "../../prototypes/context.js";
import * as fromm from "../fromm/index.js";
import * as steer from "../steer/index.js";
import * as trace from "../belt/trace.js";
import { NotFound } from "../../prototypes/errors/vector.js";

export function http(vector) {
  return async (req) => {
    const ct = req.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await req.json().catch(() => null) : null;
    const ctx = new Context({
      request: { body, url: req.url, method: req.method, headers: Object.fromEntries(req.headers), raw: req },
    });

    try {
      const signal = new Signal(new URL(req.url).pathname);
      const [effect, carry, steps] = steer.dispatch.traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = fromm.match(steps).parameters;
      ctx.signal = signal;
      ctx.steps = steps;

      await carry(ctx, async (c) => {
        const result = await steer.strategy.fire(effect, c);
        if (result !== undefined) c.output = result;
      });
    } catch (e) {
      if (e instanceof NotFound || e.code === "NOT_FOUND") return respond(ctx, 404);
      console.error(e);
      ctx.output = { code: "INTERNAL", message: e.message };
      return respond(ctx, 500);
    }

    return respond(ctx);
  };
}

function respond(ctx, status) {
  let body = ctx.response.body;

  // Bare async generators (e.g. ctx.output from cortex stream leaves) get
  // auto-framed as SSE. ReadableStream and Uint8Array are already-wrapped
  // response bodies — leave them for the native Response path below.
  if (
    body != null
    && typeof body[Symbol.asyncIterator] === "function"
    && !(body instanceof ReadableStream)
    && !(body instanceof Uint8Array)
  ) {
    ctx.response.publish(body);
    body = ctx.response.body;
  }

  if (body instanceof Response) return body;

  const s = status || ctx.response.status || (body != null ? 200 : 404);
  const type = ctx.response.type || "application/json";
  const headers = Object.fromEntries(ctx.response.headers);
  headers["content-type"] = type;
  if (ctx.span) {
    const header = trace.timing(trace.chronicle(ctx.span.records));
    if (header) headers["server-timing"] = header;
  }

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers });
  }

  if (type !== "application/json") {
    return new Response(body ?? "", { status: s, headers });
  }

  return new Response(JSON.stringify(body), { status: s, headers });
}
```

### `subsystems/typology/gestalten/shape/connection.js`

```js
// subsystems/typology/gestalten/shape/connection.js
export function wire(connection, node) {
  const api = {};
  let parameter;

  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    if (segment.startsWith(":")) { parameter = child; continue; }
    if (segment === "*" || segment === "(.*)") {
      console.warn(`[shape.connection.wire] pattern branch "${segment}" not compiled`);
      continue;
    }
    api[segment] = wire(connection.branch(`/${segment}`), child);
  }

  let result = node?.effect ? Object.assign(aim(connection, node.effect), api) : api;

  if (parameter)
    result = new Proxy(result, {
      get(target, key) {
        if (typeof key === "symbol" || key === "then" || key in target) return target[key];
        return wire(connection.branch(`/${key}`), parameter);
      },
    });

  return result;
}

function aim(connection, effect) {
  if (effect.methods && effect.methods.length > 1)
    throw new Error(
      `shape.connection.wire: method-ambiguous (${effect.methods.join(", ")}) — no transparent projection`,
    );

  const method = effect.methods?.[0];

  if (effect.feeds !== undefined)
    return (source, options = {}) => connection.converse("", source, options);

  if (effect.yields !== undefined)
    return (input = {}, options = {}) =>
      connection.stream("", options.signal, {
        method: method ?? "POST",
        body: input,
        headers: options.headers,
      });

  return method
    ? connection.aim("", {}, { method })
    : connection.aim("");
}
```

### `subsystems/typology/gestalten/shape/object.js`

```js
// subsystems/typology/gestalten/shape/object.js
import * as steer from "../steer/index.js";
import { Signal } from "../../prototypes/signal.js";

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export const object = (vector, execute = steer.strategy.request) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const namespace = {};
      for (const child of f.trajectories) namespace[child.key] = child.namespace;
      const compiled = f.effect !== undefined ? execute(f.carry, f.effect, f.steps, route(f.steps)) : undefined;
      const value = compiled !== undefined ? Object.assign(compiled, namespace) : namespace;
      return f.signature ? { key: f.signature.nature, namespace: value } : value;
    },
  });

export function proxy(vector, execute = steer.strategy.request) {
  return chart(vector, execute, vector, []);
}

const chart = (root, execute, position, segments) =>
  new Proxy(function () {}, {
    get(_, key) {
      if (typeof key === "symbol") return undefined;
      const [step] = new Signal(key).array;
      if (!step) return undefined;
      const matches = steer.match.scope(position, step);
      if (!matches.length) return undefined;
      const [match, trajectory] = steer.match.feed(matches, step);
      const next = match.type === "remainder" ? position : trajectory;
      return chart(root, execute, next, [...segments, key]);
    },
    apply(_, __, args) {
      return steer.dispatch.invoke(root, segments.join("/"), execute)(...args);
    },
  });
```

### `subsystems/typology/gestalten/belt/soma.js`

```js
// subsystems/typology/gestalten/belt/soma.js
import { waiter } from "./promise.js";

export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
    case "/part/open":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "/part/delta": {
      const part = turn.parts[packet.index];
      for (const [key, value] of Object.entries(packet.delta)) {
        part[key] =
          typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
      }
      break;
    }
    case "/part/close": {
      const part = turn.parts[packet.index];
      if (part?.type === "tool_use" && typeof part.input === "string")
        part.input = part.input ? JSON.parse(part.input) : {};
      break;
    }
    case "/turn/close":
      turn.meta = packet.meta;
      break;
    case "/turn/full":
      return packet.turn;
  }
  return turn;
}

export function transcript(state, record) {
  const current = state ?? {
    open: null,
    condition: null,
    turns: [],
    output: {},
    meta: undefined,
  };
  switch (record.event) {
    case "/turn/open":
      return { ...current, open: pour(null, record) };
    case "/turn/close": {
      const sealed = pour(current.open, record);
      const next = { ...current, turns: [...current.turns, sealed], open: null };
      if (sealed.role === "assistant") {
        const text = sealed.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ");
        const data = sealed.object ?? sealed.parts.find((part) => part.type === "object")?.data;
        if (text || data !== undefined) next.output = { ...next.output };
        if (text) next.output.message = text;
        if (data !== undefined) next.output.object = data;
      }
      return next;
    }
    case "/turn/full":
      return { ...current, turns: [...current.turns, record.turn] };
    case "/tool/yield": {
      const output = { ...current.output };
      for (const [key, value] of Object.entries(record.result.output ?? {})) {
        if (key === "message" || key === "object") {
          if (value != null) output[key] = value;
          continue;
        }
        output[key] = [...(output[key] ?? []), ...(Array.isArray(value) ? value : [value])];
      }
      return { ...current, output };
    }
    case "/response/close":
      return {
        ...current,
        meta: record.meta,
        condition: record.meta?.state === "complete" ? "NOMINAL" : "ERROR",
      };
    case "/tool/call":
      return current;
    default:
      return { ...current, open: pour(current.open, record) };
  }
}

export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
    const part = turn.parts[index];
    const shell = {};
    const delta = {};
    for (const [key, value] of Object.entries(part)) {
      if (key === "type") {
        shell.type = value;
        continue;
      }
      if (typeof value === "string") {
        shell[key] = "";
        delta[key] = value;
      } else {
        delta[key] = value;
      }
    }
    yield { event: "/part/open", index, part: shell };
    if (Object.keys(delta).length) yield { event: "/part/delta", index, delta };
    yield { event: "/part/close", index };
  }
  yield { event: "/turn/close", meta: turn.meta ?? {} };
}

export function attend(stream, onSealed) {
  let turn = null;
  return (async function* () {
    for await (const packet of stream) {
      turn = pour(turn, packet);
      yield packet;
    }
    if (onSealed) await onSealed(turn);
  })();
}

export async function bridge(stream) {
  let turn = null;
  for await (const packet of stream) {
    turn = pour(turn, packet);
  }
  return turn;
}

// three ways to consume a packet stream — one core (pour), thin cases by output shape:
// bridge → the awaited final turn · attend → packets + on-seal callback · scan → the running turn per packet
export async function* scan(stream) {
  let turn = null;
  for await (const packet of stream) {
    turn = pour(turn, packet);
    yield turn;
  }
}

export function tee(source) {
  const aBuffer = [];
  const bBuffer = [];
  const aGate = waiter();
  const bGate = waiter();
  let done = false;

  (async () => {
    try {
      for await (const item of source) {
        aBuffer.push(item);
        bBuffer.push(item);
        aGate.wake();
        bGate.wake();
      }
    } finally {
      done = true;
      aGate.wake();
      bGate.wake();
    }
  })();

  const branch = (buffer, gate) => ({
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      while (true) {
        if (buffer.length) return { value: buffer.shift(), done: false };
        if (done) return { value: undefined, done: true };
        await gate.wait();
      }
    },
  });

  return [branch(aBuffer, aGate), branch(bBuffer, bGate)];
}

export async function* textFromPackets(packets) {
  for await (const packet of packets) {
    if (packet.event === "/part/delta" && typeof packet.delta?.text === "string") {
      yield packet.delta.text;
    }
  }
}

export async function* channel(source, name) {
  for await (const packet of source) yield { ...packet, channel: name };
}

export async function* merge(...sources) {
  const iterators = sources.map((source) => source[Symbol.asyncIterator]());
  const pending = new Map(
    iterators.map((iterator, index) => [
      index,
      iterator.next().then((result) => ({ index, result })),
    ]),
  );
  try {
    while (pending.size) {
      const { index, result } = await Promise.race(pending.values());
      if (result.done) {
        pending.delete(index);
        continue;
      }
      yield result.value;
      pending.set(
        index,
        iterators[index].next().then((next) => ({ index, result: next })),
      );
    }
  } finally {
    for (const iterator of iterators) iterator.return?.();
  }
}
```

### `subsystems/typology/gestalten/belt/atom.js`

```js
// subsystems/typology/gestalten/belt/atom.js
const noop = () => {};
const isStore = (value) => typeof value?.subscribe === "function";

function bind(value, path, emit) {
  if (isStore(value)) {
    let inner = noop;
    const off = value.subscribe((next) => {
      inner();
      inner = bind(next, path, emit);
    });
    return () => {
      inner();
      off();
    };
  }
  if (!path.length) {
    emit(value ?? null);
    return noop;
  }
  const [head, ...rest] = path;
  const next = typeof head === "function" ? head(value) : value?.[head];
  return bind(next, rest, emit);
}

export function chain(root, ...path) {
  return {
    subscribe(run) {
      return bind(root, path, run);
    },
  };
}
```

### `subsystems/typology/gestalten/belt/middleware.js`

```js
// subsystems/typology/gestalten/belt/middleware.js
export function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError("Middleware stack must be an array!");

  return function (context, next) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));

      index = i;

      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve(context);

      try {
        return Promise.resolve(fn(context, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

export const chain = (first, second) => (context, next) =>
  first(context, () => second(context, next));

export const forward = (_, n) => n();
```

### `subsystems/typology/gestalten/belt/control.js`

```js
// subsystems/typology/gestalten/belt/control.js
export const controlled = (controller, check = (status) => status.code === "RUNNING") =>
  new Promise((resolve, reject) => {
    const judge = (status) => (check(status) ? resolve(controller) : reject(status.error ?? new Error(status.code)));
    if (!controller.status.is("IDLE")) return judge(controller.status.reflection);
    const stop = controller.status.$transient.listen((status) => {
      stop();
      judge(status);
    });
  });

export const hold = (controller) =>
  new Promise((resolve) => {
    const live = () => controller.status.is(["IDLE", "RUNNING", "PAUSED"]);
    if (!live()) return resolve();
    const stop = controller.status.$transient.listen(() => {
      if (live()) return;
      stop();
      resolve();
    });
  });
```

### `subsystems/typology/gestalten/belt/promise.js`

```js
// subsystems/typology/gestalten/belt/promise.js
import { array } from "./index.js";

export const retry =
  (fn, { attempts = 3, delay = 200, backoff = 2 } = {}) =>
  async (...args) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn(...args);
      } catch (e) {
        if (i === attempts - 1) throw e;
        await new Promise((r) => setTimeout(r, delay * backoff ** i));
      }
    }
  };

export const resilient = async (
  thunks,
  { attempts = 3, delay = 200, backoff = 2, onEach } = {},
) => {
  const results = [];
  const failures = [];
  for (const [i, thunk] of thunks.entries()) {
    let lastError;
    for (let a = 0; a < attempts; a++) {
      try {
        results.push(await thunk());
        lastError = null;
        break;
      } catch (e) {
        // console.log("resilient error"); console.error(e);
        lastError = e;
        if (a < attempts - 1) await new Promise((r) => setTimeout(r, delay * backoff ** a));
      }
    }
    if (lastError) failures.push({ index: i, error: lastError });
    onEach?.(results.length + failures.length, thunks.length);
  }
  return { results, failures };
};

export const batched = async (thunks, size, { delay = 0, onChunk, afterChunk } = {}) => {
  const results = [];
  for (const chunk of array.chunk(thunks, size)) {
    results.push(...(await Promise.all(chunk.map((f) => f()))));
    await afterChunk?.();
    onChunk?.(results.length, thunks.length);
    if (delay) await new Promise((r) => setTimeout(r, delay));
  }
  return results;
};

export const linear = async (thunks, { onEach } = {}) => {
  const results = [];
  for (const thunk of thunks) {
    results.push(await thunk());
    onEach?.(results.length, thunks.length);
  }
  return results;
};

// async-CONTROL atom (debt #2, .ikiro/CLAUDE.md ## code). Single-slot wake/suspend
// gate: the wake-suspend dance was hand-rolled across Queue.drain / Pipe.stream /
// soma.tee / Broadcaster. Lifted here so those channels share the atom while keeping
// their distinct characters. No wake buffering — wake() before wait() is a no-op, so
// every caller guards with a buffer/done check before awaiting wait(). wait(signal)
// also resolves on abort, and immediately if the signal is already aborted.
export const waiter = () => {
  let resolve = null;
  return {
    wake() {
      if (resolve) {
        resolve();
        resolve = null;
      }
    },
    wait(signal) {
      return new Promise((r) => {
        if (signal?.aborted) return r();
        resolve = r;
        signal?.addEventListener(
          "abort",
          () => {
            if (resolve === r) resolve = null;
            r();
          },
          { once: true },
        );
      });
    },
  };
};

// PROPOSED (not wired) — a promise with its resolve/reject exposed. Lands when a
// consumer needs it (the many `let resolve; new Promise` sites). See ## code.
// export const deferred = () => {
//   let resolve, reject;
//   const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
//   return { promise, resolve, reject };
// };
```

### `subsystems/typology/schematics/primitives/contexts.js`

```js
// subsystems/typology/schematics/primitives/contexts.js
import { v } from "../v.js";
import { Mountpoint } from "./instance.js";
import { Hallucination, Policy, Turn } from "./hallucination.js";

export const input = { input: v.unknown().desc("The step's payload, request.body. Example: { text: 'ciao' }") };
export const output = { output: v.unknown().optional().desc("The step's result, response.body; set by the effect. Example: { id: 42 }") };
export const request = { request: v.unknown().desc("is.Request — { body, url, method, raw? }") };
export const response = { response: v.unknown().desc("is.Response — { body, status, headers }") };
export const params = { params: v.record(v.string(), v.string()).desc("Path parameters matched off the signal. Example: { slug: 'dojo' }") };
export const steps = { steps: v.array(v.unknown()).desc("The matched trajectory, root first") };
export const signal = { signal: v.unknown().desc("The Signal that fired. Example: new Signal('/dialogue/render')") };

export const entities = { entities: v.record(v.string(), v.unknown()).desc("The host's repositories by entity name. Example: { note, mode } on the runtime; { literal, em, buffer } on a daemon") };
export const call = { call: v.unknown().optional().desc("The host's aperture as a callable object, shape.object(aperture). Example: ctx.call.rules.position({ fen })") };
export const cortex = { cortex: v.unknown().optional().desc("The host's Cortex, a Pool of faculties. Example: ctx.cortex.findOne({ type: 'dialogue', tune: 'fast', via: 'stream' })") };
export const modes = { modes: v.record(v.string(), v.record(v.string(), v.unknown())).desc("Sibling modes on the host, modes.<type>.<slug>. Example: ctx.modes.game.dojo") };
export const services = { services: v.record(v.string(), v.unknown()).desc("Live services on the host by slug. Example: ctx.services.nlp") };
export const statics = { statics: v.unknown().optional().desc("The host's declared statics. Example: { language: 'it' }") };
export const domain = { domain: v.unknown().optional().desc("The host's domain module, if any") };
export const controller = { controller: v.unknown().desc("is.Controller — the host's stdout branch and signal") };
export const mountpoint = { mountpoint: Mountpoint.desc("The host's data directory on disk. Example: '/viva/instances/chess/mountpoint/daemon_chess' · '/viva/instances/chess/mountpoint' on the runtime") };
export const reference = { reference: v.unknown().desc("is.Path — the host's computed reference, /<type>/<slug>. Example: new Path('/daemon/chess') · new Path('/runtime/runtime') on the runtime") };
export const cargo = { cargo: v.unknown().desc("The host's Cargo — every fraught mode's catalog by slug. Example: ctx.cargo['sentences/ho-fame.mp3']") };

export const mode = { mode: v.unknown().desc("The live Mode the step runs in. Example: ctx.mode.id · ctx.mode.application.buffer") };
export const user = { user: v.unknown().desc("The authenticated user, lighthouse-signed. Example: { id: 'u1', roles: ['player'] }") };
export const lighthouse = { lighthouse: v.unknown().desc("The Lighthouse that signed this request") };
export const service = { service: v.unknown().desc("The live Service a tool branch belongs to") };
export const mask = { mask: v.unknown().desc("The service's record mask, { module, statics?, secrets? }") };

export const thread = { thread: v.unknown().desc("The Thread this exchange belongs to. Example: { id: 't9', mode: 7 }") };
export const turn = { turn: Turn.desc("The user Turn chained for this request") };
export const hallucination = { hallucination: v.union([Hallucination.dialogue, Hallucination.verbatim, Hallucination.speech, Hallucination.choice]).desc("The request under construction, cortex.hallucinate.<type>.<via>(ctx.hallucination)") };
export const policy = { policy: v.union([Policy.dialogue, Policy.verbatim, Policy.speech, Policy.choice]).desc("The record's policy, lifted off the hallucination") };
export const tools = { tools: v.unknown().desc("The armed Vector the model may call, never domain.tools") };
export const intelligent = { intelligent: v.boolean().desc("The mode's harness.intelligent flag, lifted") };
export const vocal = { vocal: v.boolean().desc("The mode's harness.vocal flag, lifted") };
export const activity = { activity: v.unknown().desc("The Activity row this exchange is written to") };
export const screen = { screen: v.unknown().desc("A guide harness's current screen. Example: { id: 'intro', fields: [] }") };

export const pool = { pool: v.unknown().desc("The emitter's Pool; yield into it. Example: ctx.pool.add(literal)") };
export const scope = { scope: v.record(v.string(), v.unknown()).desc("The datamap scope narrowing reads and stamping writes. Example: { user: 'u1' }") };

export const optional = (set) => Object.fromEntries(Object.entries(set).map(([key, schema]) => [key, schema.optional()]));
export const of = (...sets) => v.object(Object.assign({}, ...sets));

export const vector = { ...input, ...output, ...request, ...response, ...params, ...steps, ...signal };
export const host = { ...entities, ...call, ...cortex, ...modes, ...services, ...statics, ...domain, ...mountpoint, ...reference, ...cargo };

export const Aperture = { ...vector, ...host, ...mode, ...optional(user) };
export const Tool = { ...vector, ...host, ...mode, ...user, ...optional(thread), ...optional(service) };
export const Harness = { ...vector, ...host, ...mode, ...user, ...optional(thread), ...optional(turn), ...hallucination, ...tools, ...controller, ...intelligent, ...vocal, ...optional(activity), ...optional(screen) };
export const Emitter = { ...vector, ...host, ...mode, ...pool, ...optional(thread), ...optional(user) };
export const Twitch = { ...vector, ...entities, ...call, ...cortex, ...services, ...statics, ...domain, ...mountpoint, ...reference, ...optional(scope), ...optional(mode) };
export const Service = { ...vector, ...service, ...mask, ...tools };
```

### `subsystems/typology/schematics/primitives/instance.js`

```js
// subsystems/typology/schematics/primitives/instance.js
import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Path, Url } from "../prototypes/signatures.js";

const Statics = (known = {}) => v.object(known, { additionalProperties: true });
const Secrets = v.record(v.string(), v.unknown());

export const Mountpoint = Path({ pattern: "^/.*$", title: "an absolute path" }).$id("Mountpoint");

export const Mask = v.object(
  { module: v.string(), statics: Statics().optional(), secrets: Secrets.optional() },
  { additionalProperties: true },
);

export const Datamap = v.object(
  {
    module: v.string(),
    statics: Statics({ db: v.object({ file: v.string() }).optional() }).default({}),
    mountpoint: Mountpoint.desc('Where the db and its migrations live. Declared wins; otherwise the mounting\'s seat. Example: "/viva/lighthouse"').optional(),
  },
  { additionalProperties: true },
);

export const Mode = v.object(
  {
    module: v.string(),
    manifest: v.object({}, { additionalProperties: true }).optional(),
    mountpoint: v.union([Mountpoint, v.null()]).optional(),
    statics: Statics().optional(),
    secrets: Secrets.optional(),
    reference: Path().desc('The mode\'s path under its daemon. Declared wins; otherwise /mode/<type>/<slug>. Example: "/mode/game/board"').optional(),
    url: Url().desc("Where a consumer reaches the mode: the daemon's url + reference. Example: https://runtime.vivalence.com/daemon/chess/mode/game/board").optional(),
    bundles: Mountpoint.desc('Where its compiled views live. Declared wins; otherwise <daemon mountpoint>/bundles/<type>/<slug>. Example: "/viva/instances/chess/mountpoint/daemon_chess/bundles/game/board"').optional(),
  },
  { additionalProperties: true },
);

export const Modes = v.array(v.union([v.string(), Mode]));

export const Runtime = v.object(
  {
    manifest: v.object({ slug: Slug }, { additionalProperties: true }).default({ slug: "runtime" }),
    statics: Statics({
      serve: Url().desc("Where this runtime BINDS. Example: http://0.0.0.0:2501"),
      remote: Url().desc("Where a consumer REACHES this runtime; daemons announce under it. Example: https://runtime.vivalence.com/").optional(),
    }),
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("The lighthouse slot's secret until every recipe says lighthouse; paladin folds it there. Example: a 32-char base64 string from openssl rand -base64 24") }).optional(),
    mountpoint: Mountpoint.desc('Where the runtime\'s own modes persist. Declared wins; otherwise the scope mountpoint. Example: "/viva/instances/chess/mountpoint"').optional(),
    reference: Path().desc('The runtime\'s reference as a host, /runtime/<slug>; paladin writes it. Example: "/runtime/runtime"').optional(),
    url: Url().desc("Where a consumer reaches the runtime host: statics.remote + reference. Example: https://runtime.vivalence.com/runtime/runtime").optional(),
    attach: Url().desc("Where the runtime serves its own bundles and cargo: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: Modes.optional(),
  },
  { additionalProperties: true },
);

export const LighthouseTraitsEnum = ["OPEN", "INVITED", "OPERATED"];
export const Lighthouse = v.object(
  {
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("Signs every user's tokens. Example: a 32-char base64 string from openssl rand -base64 24") }),
    traits: v.array(v.enum(LighthouseTraitsEnum)).default([]).desc('What the door allows. OPEN: anyone may sign up. INVITED: signup takes an invite token. OPERATED: only the operator JWT mints users. Example: ["OPEN"]'),
  },
  { additionalProperties: false },
);

export const Home = v.string().desc('The mode a thread on this client enters when its user names no HOME — an absolute reference. Example: "/runtime/runtime/mode/home/home"');

export const Client = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    statics: Statics({ serve: Url().optional() }).default({}),
    home: Home.optional(),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: Mountpoint.desc('Where the service persists. Declared wins; otherwise <mountpoint scope>/service_<slug>. Example: "/viva/lighthouse"'),
    statics: Statics().default({}),
    reference: Path().desc('Where the runtime attaches the service: /attached/process/service/<type>/<slug>, the folded manifest after the static segment. Example: "/attached/process/service/lighthouse/multiplayer"').optional(),
    secrets: Secrets.optional(),
    datamap: Datamap,
  },
  { additionalProperties: true },
);

export const Daemon = v.object(
  {
    manifest: Manifest,
    mountpoint: Mountpoint,
    statics: Statics().default({}),
    reference: Path().desc('The daemon\'s path under the runtime. Declared wins; otherwise /daemon/<slug>. Example: "/daemon/chess"').optional(),
    url: Url().desc("Where a consumer reaches the daemon: runtime.statics.remote + reference. Example: https://runtime.vivalence.com/daemon/chess").optional(),
    attach: Url().desc("Where the runtime serves this daemon's bundles and cargo: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: Modes.default([]),
    consume: v.record(v.string(), Mask).default({}),
    hallucinators: v.array(Mask).default([]),
  },
  { additionalProperties: true },
);

export const Instance = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }),
    runtime: Runtime.optional(),
    lighthouse: Lighthouse.optional(),
    clients: v.array(Client).default([]),
    datamap: Datamap.optional(),
    hallucinators: v.array(Mask).optional(),
    services: v.array(Service).default([]),
    daemons: v.array(Daemon).default([]),
  },
  { additionalProperties: true },
);

const Reference = (prefix) => v.string({ pattern: `^\\$\\{${prefix}[A-Z0-9_]+\\}$`, title: `a "\${${prefix}…}" reference to an env key` });
const MaskStatics = v.object({}, { additionalProperties: true });
const MaskSecrets = v.record(v.string(), Reference("SECRET_"));
const MaskOf = v.object({ module: v.string(), statics: MaskStatics.optional(), secrets: MaskSecrets.optional() }, { additionalProperties: true });
const ModeMask = v.object(
  {
    module: v.string(),
    manifest: v.object({}, { additionalProperties: true }).optional(),
    mountpoint: v.union([v.string(), v.null()]).optional(),
    statics: MaskStatics.optional(),
    secrets: MaskSecrets.optional(),
  },
  { additionalProperties: false },
);
const Environment = v.object(
  {
    type: v.const("object"),
    properties: v.record(v.string(), v.object({}, { additionalProperties: true })),
    required: v.array(v.string()).optional(),
    additionalProperties: v.boolean().optional(),
  },
  { additionalProperties: false },
);

export const DaemonMask = v.object(
  {
    manifest: Manifest,
    mountpoint: v.string().optional(),
    statics: MaskStatics.optional(),
    reference: v.string().optional(),
    modes: v.array(v.union([v.string(), ModeMask])).optional(),
    consume: v.record(v.string(), MaskOf).optional(),
    hallucinators: v.array(MaskOf).optional(),
  },
  { additionalProperties: false },
);

export const InstanceMask = v.object(
  {
    manifest: Manifest,
    environment: Environment.optional(),
    runtime: v.object(
      { manifest: v.object({ slug: Slug }, { additionalProperties: true }).optional(), statics: MaskStatics.optional(), secrets: v.object({ jwt: Reference("SECRET_") }).optional(), modes: v.array(v.union([v.string(), ModeMask])).optional() },
      { additionalProperties: false },
    ).optional(),
    lighthouse: v.object({ secrets: v.object({ jwt: Reference("SECRET_") }), traits: v.array(v.enum(LighthouseTraitsEnum)).optional() }, { additionalProperties: false }).optional(),
    datamap: MaskOf.optional(),
    hallucinators: v.array(MaskOf).optional(),
    clients: v.array(v.object({ manifest: Manifest, module: v.string().optional(), statics: MaskStatics.optional(), home: Home.optional() }, { additionalProperties: false })).optional(),
    services: v.array(v.object({ manifest: Manifest, module: v.string(), mountpoint: v.string().optional(), statics: MaskStatics.optional(), secrets: MaskSecrets.optional(), datamap: MaskOf.optional() }, { additionalProperties: false })).optional(),
    daemons: v.array(DaemonMask).optional(),
  },
  { additionalProperties: false },
);

// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot
// itself. no daemons — a daemon is what an instance IS. services are declared seatless here and
// seated per instance by resolve.mountpoints, so this shape is FOLDED into an Instance, never cast
// on its own. the slot list paladin folds is Object.keys(Ledger.properties) minus manifest.
export const Ledger = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }).optional(),
    runtime: Runtime.optional(),
    lighthouse: Lighthouse.optional(),
    datamap: Datamap.optional(),
    hallucinators: v.array(Mask).optional(),
    clients: v.array(Client).optional(),
    services: v.array(Service).optional(),
  },
  { additionalProperties: true },
);

export const Tapped = v.record(
  v.string(),
  v.object(
    {
      slug: Slug.desc("The package's slug — key, package and slug name it whole: @chess/package/chess. Example: chess"),
      mount: v.string().desc("Where the package lives — relative to the record file, or absolute. Example: ./registry/chess"),
      remote: v.string().desc("The git remote tap cloned it from. Example: git@github.com:vivalence/registry-chess.git").optional(),
    },
    { additionalProperties: false },
  ),
).desc("The registry record — one row per tapped package, keyed by its owner");

export const Requirement = v.object({
  at: v.string(),
  read: v.array(v.string()),
  unset: v.array(v.string()),
});
```


## anima today — the data layer that moves into @vivalence/ghost

### `systems/anima/src/typology/mod.js`

```js
// systems/anima/src/typology/mod.js
export * from "./gestalten/index.js";
export * from "./prototypes/index.js";
export * from "./stores/index.js";
export * from "./entities/index.js";

export * as entities from "./entities/index.js";
export * as stores from "./stores/index.js";
```

### `systems/anima/src/typology/prototypes/dataspace.js`

```js
// systems/anima/src/typology/prototypes/dataspace.js
import { RemoteEntityManager, Vector, shape, shard } from "@vivalence/typology";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

// ugly retarded slop
export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, runtime, seed }) {
    this.connection = connection;
    this.runtime = runtime;
    this.em = new RemoteEntityManager(connection, {});

    for (const dossier of entities) {
      const repository = dossier.repository(dossier, this);

      const boot = new Vector()
        .use(shard.context.attach("dossier", dossier))
        .use(shard.context.attach("repository", repository))
        .use(shard.context.attach("dataspace", this));

      if (seed) seed(boot);
      if (dossier.boot) boot.graft(dossier.boot);

      for (const fn of dossier.use ?? []) boot.use(fn);
      boot.affect(async () => {});

      const integrate = shape.selbstbestimmt(boot, strategy);
      if (repository.manage) this.em.register(dossier.name, repository, integrate);
      else repository.integrate = integrate;

      this.schemas.set(dossier.name, dossier);
      this[dossier.name] = repository;
    }
  }

  async init() {
    if (!this.connection) return;
    this.datamap = await this.connection.call("/metadata/datamap");
    this.em.schema = this.datamap;
  }

  async populate(names = []) {
    await Promise.all(
      names
        .filter((name) => this.em.repositoryMap[name])
        .map((name) => this.em.repositoryMap[name].find()),
    );
  }

  fork() {
    return this.em.fork();
  }
}
```

### `systems/anima/src/typology/prototypes/entity.js`

```js
// systems/anima/src/typology/prototypes/entity.js
export class Entity {
  toJSON() {
    const props = this.constructor.schema?.properties ?? {};
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;

      const spec = props[key];
      if (spec) {
        if (spec.kind === "m:1") {
          out[key] = value?.id ? { id: value.id } : value;
          continue;
        }
        if (spec.kind === "1:m" || spec.kind === "m:n") {
          out[key] = Array.isArray(value)
            ? value.map((element) => (element?.id ? { id: element.id } : element))
            : value;
          continue;
        }
      }

      if (
        value != null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.constructor !== Object
      )
        continue;
      out[key] = value;
    }
    return out;
  }
}
```

### `systems/anima/src/typology/prototypes/cargo.js`

```js
// systems/anima/src/typology/prototypes/cargo.js
import { fn } from "@vivalence/typology";

export class Cargo {
  catalog = {};
  sought = new Set();

  constructor(connection) {
    this.connection = connection;
    this.refresh = fn.debounce(() => this.refetch(), 2000);
  }

  async refetch() {
    this.catalog = await this.connection.call("/metadata/cargo");
  }

  resolve(asset) {
    if (!asset) return null;
    if (asset.path) {
      const found = this.catalog[asset.path] ?? null;
      if (!found && !this.sought.has(asset.path)) {
        this.sought.add(asset.path);
        this.refresh();
      }
      return found;
    }
    if (asset.slug) {
      const entry = Object.entries(this.catalog).find(
        ([key]) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
  }
}
```

### `systems/anima/src/typology/stores/lighthouse.js`

```js
// systems/anima/src/typology/stores/lighthouse.js
import { map, atom, computed, effect } from "nanostores";
import { Connection, shard, v } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Dataspace } from "../prototypes/dataspace.js";
import { DaemonDossier } from "../entities/daemon/index.js";
import { TerminalDossier } from "../entities/terminal.js";

const STORAGE_KEY = (url) => `lighthouse:${url}`;

export const STANDINGS = ["IDLE", "AUTHENTICATING", "AUTHENTICATED", "VERIFYING", "REFRESHING", "REFRESHED", "POPULATING", "VERIFIED", "OFFLINE", "ERROR", "SESSION_EXPIRED", "LOGGED_OUT"];

export class Lighthouse {
  $authority = map({});
  $user = map({});
  $status = atom({ code: "IDLE" });

  $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a?.refresh);
  $isIdentified = computed(this.$user, (user) => !!user?.id);

  $daemons = atom([]);
  manifest = null;

  get authority() {
    return this.$authority.get();
  }
  get user() {
    return this.$user.get();
  }
  get status() {
    return this.$status.get();
  }
  get isAuthorized() {
    return this.$isAuthorized.get();
  }
  get isIdentified() {
    return this.$isIdentified.get();
  }

  // get daemons() {return this.dataspace.daemon;}

  constructor(connection, { channel = null } = {}) {
    this.channel = channel;
    this.connection = connection
      .use(shard.track.request())
      .use(shard.track.fault())
      .use(shard.connection.authorize(this.$authority))
      .use(shard.connection.timeout())
      .use(shard.connection.track(connection));

    this.multiplex = shard.transmitter.multiplex({ authority: this.$authority });
    this.runtime = new Connection(connection.url, shard.transmitter.retry(this.multiplex, { maxRetries: 2 }))
      .use(shard.track.request())
      .use(shard.track.fault())
      .use(shard.connection.timeout(8000));

    this.dataspace = new Dataspace({
      entities: [DaemonDossier, TerminalDossier],
      connection: this.connection,
      runtime: this.runtime,
      seed: seedLighthouse(this),
    });
  }

  signup(username, password) {
    return this.enter("/lighthouse/signup", { username, password });
  }

  login(username, password) {
    return this.enter("/lighthouse/login", { username, password });
  }

  async enter(route, credentials) {
    this.$status.set({ code: "AUTHENTICATING" });

    const response = await this.connection.fetch(route, credentials);

    if (response.error) {
      this.$status.set({
        code: "ERROR",
        message: response.error.message,
        type: response.error.type,
      });
      return { status: "ERROR", error: response.error };
    }

    const { authority, user } = response.body;
    if (authority) this.$authority.set(authority);
    if (user) this.$user.set(user);

    this.$status.set({ code: "AUTHENTICATED" });
    return { status: "OK", user };
  }

  async verify() {
    const auth = this.$authority.get();
    if (!auth?.access) {
      return { status: "NO_TOKEN" };
    }

    this.$status.set({ code: "VERIFYING" });

    const response = await this.connection.fetch("/lighthouse/verify", { access: auth.access });

    if (response.isNetworkError) {
      this.$status.set({
        code: "OFFLINE",
        message: "Network unavailable",
        canRetry: true,
      });
      return { status: "NETWORK_ERROR", canRetry: true };
    }

    if (response.isAuthError) {
      const refreshResult = await this.refresh();
      return refreshResult;
    }

    if (response.error) {
      this.$status.set({ code: "ERROR", message: response.error.message });
      return { status: "ERROR", error: response.error };
    }

    if (response.body.status === "SUCCESS") {
      if (response.body.user) this.$user.set(response.body.user);
      return { status: "OK" };
    }

    return { status: "INVALID" };
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) {
      return { status: "NO_REFRESH_TOKEN" };
    }

    this.$status.set({ code: "REFRESHING" });

    const response = await this.connection.fetch("/lighthouse/refresh", { refresh: auth.refresh });

    if (response.isNetworkError) {
      this.$status.set({
        code: "OFFLINE",
        message: "Network unavailable",
        canRetry: true,
      });
      return { status: "NETWORK_ERROR", canRetry: true };
    }

    if (response.isAuthError) {
      this.logout();
      this.$status.set({ code: "SESSION_EXPIRED" });
      return { status: "SESSION_EXPIRED" };
    }

    if (response.error) {
      this.logout();
      this.$status.set({ code: "ERROR", message: response.error.message });
      return { status: "ERROR", error: response.error };
    }

    const { access } = response.body;
    if (access) {
      this.$authority.set({ ...auth, access });
      this.$status.set({ code: "REFRESHED" });
      return { status: "OK" };
    }

    this.logout();
    return { status: "REFRESH_FAILED" };
  }

  logout() {
    const auth = this.$authority.get();
    this.$authority.set(null);
    this.$user.set(null);
    this.$status.set({ code: "LOGGED_OUT" });
    this.multiplex.close();

    if (auth?.refresh) {
      this.connection.fetch("/lighthouse/logout", { refresh: auth.refresh }).catch(() => {});
    }
  }

  get json() {
    return {
      status: this.$status.get(),
      isIdentified: this.$isIdentified.get(),
      isAuthorized: this.$isAuthorized.get(),
      user: this.$user.get(),
      authority: this.$authority.get(),
    };
  }

  toJSON() {
    return {
      ...this.json,
      daemons: this.$daemons.get().map((daemon) => daemon.slug),
    };
  }
}

export function hydrate(lighthouse) {
  const hydration = logger.entry("authority").open();
  const key = STORAGE_KEY(lighthouse.connection.url);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const held = JSON.parse(stored);
      const faults = v.primitives.credentials.Credential.faults(held);
      if (faults.length) throw new Error(faults.map(({ at, reason }) => `${at} ${reason}`).join(" · "));
      lighthouse.$authority.set(held.authority);
      lighthouse.$user.set(held.user);
    } catch {
      hydration.note({ message: "cached credential is not one — discarded" });
      localStorage.removeItem(key);
    }
  }

  const user = lighthouse.$user.get()?.id ?? null;
  hydration.note({
    message: user ? "authority restored from cache" : "no cached authority",
    user,
    refresh: !!lighthouse.$authority.get()?.refresh,
  });
  hydration.close();

  effect([lighthouse.$authority, lighthouse.$user], (authority, user) => {
    if (authority || user) {
      localStorage.setItem(key, JSON.stringify({ user, authority, at: new Date().toISOString() }));
    } else {
      localStorage.removeItem(key);
    }
  });
}

function seedLighthouse(lighthouse) {
  return (vector) =>
    vector
      .use(shard.context.attach("lighthouse", lighthouse))
      .use(shard.context.attach("channel", lighthouse.channel));
}

export async function verifyAuth(lighthouse) {
  const result = await lighthouse.verify();
  if (result.status === "OK" || result.status === "NETWORK_ERROR") {
    if (!lighthouse.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
  }
  return result;
}

export async function boot(lighthouse) {
  await verifyAuth(lighthouse);
  if (!lighthouse.$isAuthorized.get()) return false;
  await populate(lighthouse);
  return true;
}

export async function populate(lighthouse) {
  if (lighthouse.$populating) return lighthouse.$populating;
  if (lighthouse.$daemons.get().length) return lighthouse.$status.set({ code: "VERIFIED" });

  lighthouse.$status.set({ code: "POPULATING" });
  lighthouse.$populating = (async () => {
    lighthouse.manifest = await lighthouse.connection.call("/metadata/manifest");
    await lighthouse.dataspace.init();
    const mounting = logger.entry("daemons").open();
    await lighthouse.dataspace.populate(["daemon", "terminal"]);
    lighthouse.dataspace.terminal.subscribe();
    lighthouse.$daemons.set([...lighthouse.dataspace.daemon.$entities.get()]);
    for (const daemon of lighthouse.$daemons.get()) {
      let code = daemon.status.reflection.code;
      daemon.status.$transient.listen((reflection) => {
        if (reflection.code === code) return;
        code = reflection.code;
        lighthouse.$daemons.set([...lighthouse.$daemons.get()]);
      });
    }
    const mounted = lighthouse.$daemons.get();
    mounting.note({
      message: `${mounted.length} daemon${mounted.length === 1 ? "" : "s"} found — mounting in background`,
      daemons: mounted.map((daemon) => daemon.slug).join(","),
    });
    mounting.close();
  })();
  try {
    await lighthouse.$populating;
  } finally {
    lighthouse.$populating = null;
    lighthouse.$status.set({ code: "VERIFIED" });
  }
}
```

### `systems/anima/src/typology/stores/terminals.js`

```js
// systems/anima/src/typology/stores/terminals.js
import { atom, computed } from "nanostores";
import { logger } from "$telemetry";

export class Terminals {
  $active = atom(null);

  constructor(repository) {
    this.repository = repository;
    this.$entities = computed(repository.$entities, (entities) => [...entities].sort((a, b) => a.index - b.index));
  }

  get entities() {
    return this.$entities.get();
  }
  get active() {
    return this.$active.get();
  }
  set active(terminal) {
    this.$active.set(terminal);
  }

  async create(seat = {}) {
    const terminal = await this.repository.create(seat);
    this.$active.set(terminal);
    return terminal;
  }

  settle(id) {
    if (this.active) return this.active;
    const seat = this.entities.find((terminal) => terminal.id === id) ?? this.entities[0] ?? null;
    this.$active.set(seat);
    return seat;
  }

  activate(id) {
    this.$active.set(this.entities.find((terminal) => terminal.id === id));
  }

  async remove(id) {
    if (this.active?.id === id) this.$active.set(this.entities.filter((terminal) => terminal.id !== id).at(-1) ?? null);
    this.repository.drop(id);
    await this.repository.removeOne({ id }).catch((error) => logger.entry(`terminals/remove/${id}`).fault(error));
  }
}
```

### `systems/anima/src/typology/entities/daemon/dossier.js`

```js
// systems/anima/src/typology/entities/daemon/dossier.js
import {
  object,
  Connection,
  Cortex,
  Url,
  Path,
  RemoteRepository,
  Span,
  shape,
  shard, cortex } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Daemon } from "./daemon.js";
import { Cargo } from "../../prototypes/cargo.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { ModeDossier } from "../mode/index.js";
import { IntentDossier } from "../intent.js";
import { ThreadDossier } from "../thread/index.js";
import { BufferDossier } from "../buffer.js";
import { TurnDossier } from "../turn.js";
import { ActivityDossier } from "../activity.js";
import { LiteralDossier } from "../literal.js";
import { SymbolDossier } from "../symbol.js";

const entities = [
  ModeDossier,
  IntentDossier,
  ThreadDossier,
  BufferDossier,
  TurnDossier,
  ActivityDossier,
  LiteralDossier,
  SymbolDossier,
];

function seedDaemon(daemon) {
  return (vector) => vector.use(shard.context.bind("daemon", daemon));
}

export const DaemonDossier = {
  name: "daemon",
  kind: () => Daemon,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/metadata/daemons"));
    repo.find = async () => {
      const roster = await dataspace.connection.call("/metadata/daemons");
      const origin = new Url(dataspace.connection.url);
      return repo.epoch(() =>
        Promise.all(roster.map((row) => repo.cast({ id: row.slug, slug: row.slug, reference: row.reference, remote: origin.branch(row.reference).absolute }))),
      );
    };
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      // console.log("daemon/dossier ctx.entity", ctx.entity);

      const daemon = ctx.entity;
      const url = new Url(daemon.remote);

      const multiplex = shard.transmitter.multiplex({ authority: ctx.lighthouse.$authority });
      daemon.connection = new Connection(url, shard.transmitter.retry(multiplex, { maxRetries: 2 }))
        .use(shard.track.span((call) => call.request.url.pathname, ctx.channel))
        .use(shard.track.request())
        .use(shard.track.fault())
        .use(shard.connection.timeout(8000));

      daemon.lighthouse = ctx.lighthouse;
      daemon.release = multiplex.close;
      daemon.entities = new Dataspace({
        connection: daemon.connection,
        runtime: ctx.lighthouse.runtime,
        entities,
        seed: seedDaemon(daemon),
      });
      daemon.cargo = new Cargo(daemon.connection);
      daemon.mounting = (async () => {
        for (let attempt = 1; ; attempt++) {
          const outcome = await mount(daemon, { multiplex, url, attempt });
          if (outcome !== "unreachable") return outcome;
          const delay = Math.min(RETRY.base * 2 ** (attempt - 1), RETRY.ceiling);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      })();
    },
  ],
};

const RETRY = { base: 5000, ceiling: 60000 };

async function mount(daemon, { multiplex, url, attempt }) {
  const mounting = logger.entry(`daemon/${daemon.slug ?? daemon.remote}`).open();
  const probing = Date.now();
  daemon.status.set("mounting");
  mounting.note({ message: "probing", url: url.absolute, attempt });
  const offState = multiplex
    .$state(url.origin)
    .listen((state) => mounting.note({ message: `multiplex → ${state}` }));

  try {
    const [status, manifest, stripped, aperture, statics] = await Promise.all([
      daemon.connection.call("/status"),
      daemon.connection.call("/metadata/manifest"),
      daemon.connection.call("/metadata/cortex"),
      daemon.connection.call("/metadata/aperture"),
      daemon.connection.call("/metadata/statics"),
      daemon.cargo.refetch(),
      daemon.entities.init(),
    ]);
    daemon.status.set(status);
    daemon.manifest = manifest;
    daemon.statics = statics;
    daemon.reference = new Path(`/daemon/${manifest.slug}`);
    daemon.link = new Path(`/${daemon.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva");
    daemon.call = shape.connection.wire(daemon.connection, aperture);
    // await daemon.entities.populate(["mode", "intent", "thread"]);

    // await daemon.entities.thread.find({}, { populate: ["mode","buffers"] });
    // daemon.entities.buffer.find({}, { populate: ["literals", "symbols"] });

    const modes = await daemon.entities.mode.find({}, { populate: [] });
    const [threads, intents] = await Promise.all([
      daemon.entities.thread.find({}, { populate: [] }),
      daemon.entities.intent.find({}, { populate: [] }),
    ]);
    daemon.entities.intent.subscribe();
    daemon.entities.thread.subscribe();
    daemon.entities.buffer.subscribe();
    daemon.entities.turn.subscribe();
    const activity = new Span(`daemon/${manifest.slug}/activity`).to(logger.channel);
    daemon.entities.activity.subscribe({}, (row, event) => {
      const id = row?.id ?? event.entity?.id ?? event.entity;
      activity.mark(event.op, { id, status: row?.status, step: row?.steps.at(-1) });
      if (event.op === "create") (async () => {
        for await (const record of await row.stdout()) activity.mark("stdout", { id, ...record });
      })().catch(() => {});
    });

    daemon.cortex = new Cortex().register(
      cortex.wire(daemon.connection.branch("/cortex"), stripped),
    );

    for (const mode of modes) {
      object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
    }

    daemon.status.set("healthy");
    daemon.connection
      .branch("/status")
      .subscribe("/subscribe", (reflection) =>
        daemon.status.set(reflection?.code === "RUNNING" ? "healthy" : "unavailable"),
      );
    mounting.note({
      message: `${manifest.slug} mounted`,
      modes: modes.length,
      threads: threads.length,
      intents: intents.length,
      ms: Date.now() - probing,
    });
    mounting.close();
    return "mounted";
  } catch (error) {
    if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
      daemon.status.set({ code: "error", error });
      mounting.fault(error);
      mounting.close();
      return "error";
    }
    daemon.status.set({ code: "unavailable", error });
    mounting.note({
      message: `${daemon.slug ?? daemon.remote} unreachable (${error.type}) — will retry`,
      attempt,
      ms: Date.now() - probing,
    });
    mounting.fault(error);
    mounting.close();
    return "unreachable";
  } finally {
    offState();
  }
}
```

### `systems/anima/src/typology/entities/daemon/daemon.js`

```js
// systems/anima/src/typology/entities/daemon/daemon.js
import { Entity } from "../../prototypes/entity.js";
import { Status } from "@vivalence/typology";

export class Daemon extends Entity {
  id = null;
  slug = null;
  remote = null;
  reported = null;
  manifest = null;
  reference = null;
  connection = null;
  entities = null;
  mounting = null;
  lighthouse = null;
  cargo = null;
  statics = {};
  status = new Status();
  modes = {};

  getAsset(asset) {
    return this.cargo?.resolve(asset) ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      remote: this.remote,
      reported: this.reported,
      reference: this.reference?.nature ?? null,
      manifest: this.manifest,
    };
  }
}
```

### `systems/anima/src/typology/entities/terminal.js`

```js
// systems/anima/src/typology/entities/terminal.js
import { atom } from "nanostores";
import { Stall, Blacklist, RemoteRepository } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Entity } from "../prototypes/entity.js";
import { pull } from "./thread/traits/aimed.js";
import { depth } from "./thread/traits/queueing.js";
import { defaultDock } from "../stores/bridge/dock.js";

const DOCK_DEBOUNCE_MS = 250;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class Terminal extends Entity {
  id = null;
  user = null;
  daemon = null;
  thread = null;
  index = 0;
  traits = [];
  trait = {};

  $thread = atom(null);
  $buffer = atom(null);
  $dock = atom(defaultDock());
  $settling = atom(null);
  stall = null;
  repository = null;
  docking = null;
  derivedDock = null;

  get label() {
    return this.trait.LABELED?.name ?? null;
  }
  get dock() {
    return this.$dock.get();
  }
  get settling() {
    return this.$settling.get();
  }

  toJSON() {
    const kept = (key) => !key.startsWith("$") && !["stall", "repository", "docking", "derivedDock"].includes(key);
    return Object.fromEntries(Object.entries(super.toJSON()).filter(([key]) => kept(key)));
  }

  write(data) {
    return this.repository
      .updateOne({ id: this.id }, data)
      .catch((error) => logger.entry(`terminals/write/${this.id}`).fault(error));
  }

  seat(thread) {
    return this.write({ daemon: thread?.daemon?.id ?? null, thread: thread?.id ?? null });
  }

  persistDock() {
    clearTimeout(this.docking);
    this.docking = setTimeout(() => {
      const value = this.$dock.get();
      if (same(value, this.trait.DOCKED) || same(value, this.derivedDock)) return;
      const traits = this.traits.includes("DOCKED") ? this.traits : [...this.traits, "DOCKED"];
      this.write({ traits, trait: { ...this.trait, DOCKED: value } });
    }, DOCK_DEBOUNCE_MS);
  }

}

export function mountSeat(terminal, user) {
  let bound = null;
  let unbind = [];
  terminal.$dock.listen(() => terminal.persistDock());

  const bind = (daemon) => {
    if (daemon === bound) return;
    unbind.forEach((off) => off());
    bound = daemon;
    unbind = daemon
      ? [daemon.entities?.thread?.$entities.listen(derive), daemon.status?.$transient?.listen(derive)].filter(Boolean)
      : [];
  };

  const derive = () => {
    const docked = terminal.trait.DOCKED ?? user?.trait?.DOCKED;
    terminal.derivedDock = docked ?? null;
    if (docked && !same(docked, terminal.$dock.get())) terminal.$dock.set({ ...docked });

    const daemon = terminal.daemon;
    bind(daemon);
    const id = terminal.thread;
    if (!id) {
      terminal.$settling.set(null);
      if (terminal.$thread.get()) terminal.$thread.set(null);
      return;
    }
    const store = daemon?.entities?.thread;
    if (!daemon?.status?.is?.("healthy") || !store) {
      terminal.$settling.set({ thread: id });
      if (terminal.$thread.get()) terminal.$thread.set(null);
      return;
    }
    const found = store.findOneLocal({ id });
    terminal.$settling.set(null);
    if (found) {
      if (terminal.$thread.get() !== found) terminal.$thread.set(found);
      return;
    }
    if (terminal.$thread.get()) terminal.$thread.set(null);
    logger.entry("terminal/unseat").note({ terminal: terminal.id, thread: id, daemon: daemon.slug });
    terminal.write({ daemon: null, thread: null });
  };

  const offRows = terminal.repository.$entities.listen(derive);
  derive();
  return () => {
    offRows();
    unbind.forEach((off) => off());
  };
}

export function mountStall(terminal) {
  let threadVigil = null;
  let bufferVigil = null;

  const vigil = (entity, repository, clear) =>
    repository?.$entities?.listen((entities) => {
      if (!entities.some((candidate) => candidate.id === entity.id)) clear();
    }) ?? null;

  terminal.$buffer.subscribe((buffer) => {
    bufferVigil?.();
    bufferVigil = buffer ? vigil(buffer, terminal.$thread.get()?.daemon?.entities?.buffer, () => terminal.$buffer.set(null)) : null;
  });

  let seated = null;
  terminal.$thread.subscribe((thread) => {
    if ((thread?.id ?? null) !== seated) terminal.$buffer.set(null);
    seated = thread?.id ?? null;
    threadVigil?.();
    threadVigil = thread ? vigil(thread, thread.daemon?.entities?.thread, () => terminal.$thread.set(null)) : null;
    terminal.stall?.deactivate();
    terminal.stall =
      thread &&
      Stall({
        source: thread.$buffers,
        active: terminal.$buffer,
        phase: thread.$phase,
        pull: () => pull(thread, { blacklist: new Blacklist().absorb(thread.$buffers.get()) }),
        depth: () => depth(thread),
      });
    terminal.stall?.on.release((buffer) => {
      thread.daemon.entities.buffer.drop(buffer.id);
      thread.daemon.entities.buffer
        .removeOne({ id: buffer.id })
        .catch((error) => logger.entry(`buffers/release/${buffer.id}`).fault(error));
    });
  });
}

export const TerminalDossier = {
  name: "terminal",
  kind: () => Terminal,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/terminal"));
    return repo;
  },
  use: [
    async (ctx, next) => {
      await next();
      const terminal = ctx.entity;
      if (terminal.repository) return;
      terminal.repository = ctx.repository;
      mountStall(terminal);
      mountSeat(terminal, ctx.lighthouse.user);
    },
  ],
};
```

### `systems/anima/src/typology/entities/thread/dossier.js`

```js
// systems/anima/src/typology/entities/thread/dossier.js
import { computed } from "nanostores";
import { RemoteRepository, is } from "@vivalence/typology";
import { Thread } from "./thread.js";
import * as labeled from "./traits/labeled.js";

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    // no run-all resolver: each trait's capability is invoked where its responsibility lives.
    // behavior (AIMED.pull) is imported at its call-sites; markers (QUEUEING) are read live;
    // only LABELED's one-shot normalization belongs here, called explicitly.
    async (ctx, next) => {
      await next();
      const thread = ctx.entity;
      thread.daemon = ctx.daemon;

      thread.$buffers = computed(ctx.daemon.entities.buffer.$entities, (buffers) =>
        buffers.filter((buffer) => (buffer.thread?.id ?? buffer.thread) === thread.id),
      );
      thread.$turns = computed(ctx.daemon.entities.turn.$entities, (turns) =>
        turns
          .filter((turn) => (turn.thread?.id ?? turn.thread) === thread.id)
          .sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)),
      );

      if (!thread.traits.includes("LABELED")) thread.traits = [...thread.traits, "LABELED"];
      labeled.label(thread); // one-shot: derive the display label from intent/mode

      thread.$mode.subscribe((mode, previous) => {
        const shouldMask =
          thread.mode?.implements?.("APPLICATION") && !is.empty(thread.mode?.application?.schema);
        const has = thread.traits.includes("MASKED");
        if (shouldMask && !has) thread.traits = [...thread.traits, "MASKED"];
        else if (!shouldMask && has)
          thread.traits = thread.traits.filter((trait) => trait !== "MASKED");
      });

      thread.$mode.subscribe((mode, previous) => {
        if (previous && mode && mode.id !== previous.id)
          ctx.daemon.entities.thread.updateOne({ id: thread.id }, { mode: mode.id });
      });
    },
  ],
};
```

### `systems/anima/src/typology/entities/thread/thread.js`

```js
// systems/anima/src/typology/entities/thread/thread.js
import { atom, deepMap, computed } from "nanostores";
import { Entity } from "../../prototypes/entity.js";
import * as aimed from "./traits/aimed.js";
import * as queueing from "./traits/queueing.js";

// A phase requires a set of trait-validity rules to hold before it can engage. The phase owns
// the SET; each trait module owns its rule (composition + implementation, not presence).
// inert/manual/escort have no config contract; continuous fetches, so it folds AIMED + QUEUEING.
const PHASES = {
  inert: [],
  manual: [],
  continuous: [aimed.valid, queueing.valid],
  escort: [],
};

// fold a phase's rules over the live thread → the violation list (empty = honourable).
const violations = (name, thread) =>
  (PHASES[name] ?? []).map((rule) => rule(thread)).filter(Boolean);

export class Thread extends Entity {
  // user = null;
  $mode = atom(null);
  // intent = null;
  // counter = 0;

  $phase = atom("manual"); // render phase — the terminal's stall mirrors this (ThreadPhaseEnum)
  $traits = atom([]);
  $trait = deepMap({});
  // $buffer = atom(null);
  $label = atom("");

  // the LIVE integrity of every phase: { phase → problems[] }, refolded whenever the thread's
  // composition (traits/config/mode) changes. drivers read it (chip disabled + why); engage
  // gates on it. continuous + escort errors face — what the M5 reporters surface.
  $errors = atom([]);
  $integrity = computed([this.$traits, this.$trait, this.$mode], () =>
    Object.fromEntries(Object.keys(PHASES).map((name) => [name, violations(name, this)])),
  );

  get mode() {
    return this.$mode.get();
  }
  set mode(value) {
    this.$mode.set(value);
  }


  get phase() {
    return this.$phase.get();
  }
  set phase(value) {
    this.$phase.set(value);
  }

  // the ONE phase gate every driver flows through: validate the phase's data contract live,
  // record the violations ($errors), and only engage an honourable phase. a non-functional
  // phase never reaches the stall. returns false (refused) so the driver can skip persistence.
  engage(name) {
    const problems = violations(name, this);
    this.$errors.set(problems);
    if (problems.length) return false;
    this.$phase.set(name);
    return true;
  }

  get traits() {
    return this.$traits.get();
  }
  set traits(value) {
    this.$traits.set(value);
  }

  get trait() {
    return this.$trait.get();
  }
  set trait(value) {
    this.$trait.set(value);
  }

  // get buffer() {
  //   return this.$buffer.get();
  // }
  // set buffer(value) {
  //   this.$buffer.set(value);
  // }

  get label() {
    return this.$label.get();
  }
  set label(value) {
    this.$label.set(value);
  }
}
```

### `systems/anima/src/typology/entities/thread/traits/aimed.js`

```js
// systems/anima/src/typology/entities/thread/traits/aimed.js
import { object } from "@vivalence/typology";

// AIMED points a thread at an emitter. Its capabilities are FREE functions over the thread,
// not methods stamped onto it: nothing to install, nothing to go stale — every call reads
// live config. The thread's `trait.AIMED.mount` + `trait.MASKED` shape each fetch.

// fetch buffers from the AIMED mount. pure over (thread, args); reads the live mount + mask.
export const pull = async (thread, args = {}) => {
  const emission = await thread.mode.connection.call(
    thread.trait.AIMED.mount,
    object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
  );
  const buffers = emission?.output?.buffer ?? [];
  return Promise.all(buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)));
};

// the composition rule: a mount must be declared AND resolve to a real emitter leaf. A phase
// that fetches (continuous) folds this; the violation string is what the integrity face shows.
export const valid = (thread) =>
  !thread.trait?.AIMED?.mount
    ? "AIMED has no mount"
    : !Object.keys(thread.mode?.metadata?.emitter?.branches ?? {}).length
      ? "AIMED mount resolves to no emitter"
      : null;
```

### `systems/anima/src/typology/entities/thread/traits/queueing.js`

```js
// systems/anima/src/typology/entities/thread/traits/queueing.js
// import { computed } from "nanostores";
// import { object, Span, Blacklist } from "@vivalence/typology";
// import { Stall } from "../../../prototypes/stall.js";
// import { telemetry } from "$telemetry";

// QUEUEING is a marker trait: it carries no behavior to install, only config (the queue
// depth) its consumers read live. The Stall is terminal-owned; it reads `depth` each tick.

// how many buffers the stall keeps queued. defaults to 1 when QUEUEING is absent.
export const depth = (thread) => thread.trait?.QUEUEING?.depth ?? 1;

// the composition rule: if QUEUEING is configured, its depth must be usable (≥ 1). Absent →
// depth defaults to 1 → passes; only a misconfigured depth: 0 fails.
export const valid = (thread) => (depth(thread) >= 1 ? null : "QUEUEING depth < 1");

// export const QUEUEING = (thread, ctx) => {
//   // if (thread.queue) thread.queue.close();
//
//   const config = object.merge({ depth: 1 }, thread.trait.QUEUEING);
//   // const $pending = computed(thread.$buffers, (buffers) => buffers.filter((b) => !b.status || b.status === "PENDING"),);
//   thread.queue = new Stall(thread.$buffers, thread.$buffer);
//
//   // const persist = (buffer) => thread.daemon.entities.em.persist(buffer);
//   // const enlist = (buffer) => {buffer.on.mount(() => {buffer.status = "ACTIVE"; persist(buffer);}); buffer.on.release(() => {buffer.status = "DONE"; persist(buffer); thread.queue.next();});};
//
//   thread.queue.withPull(async (queue) => {
//     const span = new Span("pull").to(telemetry).begin();
//     span.track.transition().depart(thread.queue.$status.get());
//     span.track.subject().target("buffer", thread.id);
//
//     try {
//       const blacklist = new Blacklist().absorb(thread.$buffers.get());
//       const result = await thread.pull({ blacklist });
//
//       const buffers = await Promise.all(
//         result.buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)),
//       );
//       // for (const buffer of buffers.filter(Boolean)) enlist(buffer);
//
//       const condition = buffers.length ? "NOMINAL" : "EXHAUSTED";
//       span.track.transition().arrive(condition);
//       span.drain();
//
//       return { buffers, condition };
//     } catch (error) {
//       span.track.fault().raise(error.message, error.code ?? "PULL_ERROR");
//       span.track.transition().arrive("ERROR");
//       span.drain();
//       throw error;
//     }
//   }, config.depth);
//
//   thread.queue.$status.subscribe((status) => {
//     if (status === "ERROR") {
//       const error = thread.queue.$error.get();
//       const span = new Span("stall.error").to(telemetry).begin();
//       span.track.fault().raise(error?.message ?? "unknown", error?.code ?? "STALL_ERROR");
//       span.track.subject().target("thread", thread.id);
//       span.drain();
//     }
//   });
//   // return () => {};
// };
```

### `systems/anima/src/typology/entities/mode/mode.js`

```js
// systems/anima/src/typology/entities/mode/mode.js
import { RemoteRepository, Status, is } from "@vivalence/typology";
import { atom } from "nanostores";
import { Entity } from "../../prototypes/entity.js";
import * as traits from "./traits/index.js";
import { applyTraits } from "../../gestalten/belt/index.js";

export class Mode extends Entity {
  status = new Status();
  metadata = {};

  $application = atom(null);

  get application() {
    return this.$application.get();
  }

  set application(value) {
    this.$application.set(value ?? null);
  }

  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }

  toJSON() {
    const { $application, ...base } = super.toJSON();
    return { ...base, application: this.application };
  }
}

export const ModeDossier = {
  name: "mode",
  kind: () => Mode,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/entities/mode"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      try {
        await next();
        ctx.entity.status.set("healthy");
      } catch (error) {
        if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
          ctx.entity.status.set({ code: "error", error });
          throw error;
        }
        ctx.entity.status.set({ code: "unavailable", error });
      }
    },

    // @beef: choice pending.
    // async (ctx, next) => {await next(); ctx.entity.connection.use(async (rqx, rext) => {await rext(); return; const body = rqx.response?.body; if (body?.entities && is.yieldish(body)) {for (const [name, pojos] of Object.entries(body.entities)) {const repository = ctx.daemon.entities[name]; if (!repository) continue; body.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));}}});},

    applyTraits(traits),

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;
      ctx.entity.reference = ctx.daemon.reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = ctx.daemon.connection.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.link = ctx.daemon.link.branch(`/${ctx.entity.type}/${ctx.entity.slug}`);
    },
  ],
};
```

### `systems/anima/src/typology/entities/mode/traits/index.js`

```js
// systems/anima/src/typology/entities/mode/traits/index.js
export * from "./application.js";
// export * from "./procedural.js";
export * from "./emitter.js";
export * from "./exposed.js";
export * from "./harnessed.js";
export * as standalone from "./standalone.js";
```

### `systems/anima/src/typology/entities/mode/traits/harnessed.js`

```js
// systems/anima/src/typology/entities/mode/traits/harnessed.js
import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode, ctx) => {
  // output entity keys are entity names — merge every kind a local repo exists for,
  // so the fold accumulates managed instances, never wire pojos
  const merge = async (yielded) => {
    for (const [name, pojos] of Object.entries(yielded.output)) {
      if (name === "message" || name === "object") continue;
      if (!Array.isArray(pojos)) continue;
      const repository = ctx.daemon.entities[name];
      if (!repository) continue;
      yielded.output[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
    }
  };

  const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
    await next();

    const body = rqx.response?.body;

    if (body?.[Symbol.asyncIterator] && !body.getReader) {
      rqx.response.body = (async function* () {
        for await (const packet of body) {
          if (packet?.event === "/tool/yield" && is.yieldish(packet.result)) {
            await merge(packet.result);
          }
          yield packet;
        }
      })();
      return;
    }

    if (!is.yieldish(body)) return;

    await merge(body);
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");
  mode.harness = shape.connection.wire(harness, mode.metadata.harness);
};
```

### `systems/anima/src/typology/entities/mode/traits/application.js`

```js
// systems/anima/src/typology/entities/mode/traits/application.js
import { Bundle } from "@vivalence/typology";

export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = {
    url: record.url,
    schema: record.schema,
    bundle: new Bundle(record.bundle).withUrl(record.url),
  };
};

export const GENERATIVE = () => {};
```

### `systems/anima/src/typology/entities/mode/traits/exposed.js`

```js
// systems/anima/src/typology/entities/mode/traits/exposed.js
import { shape } from "@vivalence/typology";

export const EXPOSED = async (mode) => {
  mode.metadata.aperture = await mode.connection.call("/metadata/aperture");
  mode.call = shape.connection.wire(mode.connection, mode.metadata.aperture);
};
```

### `systems/anima/src/typology/entities/mode/traits/emitter.js`

```js
// systems/anima/src/typology/entities/mode/traits/emitter.js
import { shape, is } from "@vivalence/typology";

export const EMITTER = async (mode, ctx) => {
  const emit = mode.connection.branch("/emit");
  //.use(async (rqx, next) => {
  //   moved to mode.connection level - TESTWISE
  //   await next();
  //   const body = rqx.response?.body;
  //   console.log("[connection/emit]", { body }, is.yieldish(body));
  //   if (is.yieldish(body)) {
  //     for (const [name, pojos] of Object.entries(body.entities)) {
  //       const repository = ctx.daemon.entities[name];
  //       console.log({ repository });
  //       if (!repository) continue;
  //       body.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
  //     }
  //   }
  // });
  // const emit = mode.connection.branch("/emit").use(async (rqx, next) => {
  //   await next();
  //   const list = rqx.response?.body?.buffers;
  //   console.log("rqx", rqx, list);
  //   if (list) {
  //     rqx.response.body.buffers = await Promise.all(list.map((pojo) => buffers.merge(pojo)));
  //     console.log("rqx.response.body.buffers", rqx.response.body.buffers);
  //   }
  // });

  mode.metadata.emitter = await mode.connection.call("/metadata/emitter");
  mode.emit = shape.connection.wire(emit, mode.metadata.emitter);
};

// intent.emit = mode.connection
//   .clone()
//   .use(async (context, next) => {
//     await next();
//     const body = context.response.body;
//     if (body?.buffers) {
//       body.buffers = body.buffers.map((pojo) => {
//         pojo.mode = modeRepo.findOneLocal({ id: is.id(pojo.mode) ? pojo.mode : pojo.mode?.id }) ?? pojo.mode;
//         return pojo;
//       });
//     }
//   })
//   .aim(intent.trait.QUEUEING.mount, { intent: intent.id, ...(intent.trait.QUEUEING.mask ?? {}) });

// for (const mode of modes) {
//   object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
// }
```

### `systems/anima/src/typology/entities/buffer.js`

```js
// systems/anima/src/typology/entities/buffer.js
import { atom, computed, deepMap } from "nanostores";
import { fn, Bundle, RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Buffer extends Entity {
  $data = atom({});

  get data() {
    return this.$data.get();
  }

  set data(value) {
    this.$data.set(value ?? {});
  }

  $bundle = atom(null);

  get bundle() {
    return this.$bundle.get();
  }

  set bundle(record) {
    this.$bundle.set(!record || record instanceof Bundle ? record : new Bundle(record));
  }

  $traits = atom([]);

  get traits() {
    return this.$traits.get();
  }

  set traits(value) {
    this.$traits.set(value ?? []);
  }

  $trait = deepMap({});

  get trait() {
    return this.$trait.get();
  }

  set trait(value) {
    this.$trait.set(value ?? {});
  }

  $label = computed(this.$trait, (trait) => trait.LABELED ?? null);

  get label() {
    return this.$label.get();
  }

  // base toJSON walks own enumerable props — the $data atom (a plain object)
  // leaks through and the accessors don't appear at all; drop the backing
  // fields, re-add the plain values.
  toJSON() {
    const { $data, $bundle, $traits, $trait, ...base } = super.toJSON();
    return { ...base, data: this.data, bundle: this.bundle, traits: this.traits, trait: this.trait };
  }

  context = null;
  hooks = { mount: [], unmount: [], release: [] };

  on = {
    mount: (callback) => {
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
    unmount: (callback) => {
      this.hooks.unmount.push(fn.once(callback));
      return this;
    },
    release: (callback) => {
      this.hooks.release.push(fn.once(callback));
      return this;
    },
  };

  mount() {
    for (const hook of this.hooks.mount) hook(this);
  }
  unmount() {
    for (const hook of this.hooks.unmount) hook(this);
  }
  release(...a) {
    for (const hook of this.hooks.release) hook(this, ...a);
  }
}

export const BufferDossier = {
  name: "buffer",
  kind: () => Buffer,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/buffer"));
    return repo;
  },

  use: [],
};
```

### `systems/anima/src/typology/entities/turn.js`

```js
// systems/anima/src/typology/entities/turn.js
import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Turn extends Entity {
  role = null;
  parts = [];
  meta = null;
  thread = null;
  mode = null;
  parent = null;
}

export const TurnDossier = {
  name: "turn",
  kind: () => Turn,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/turn"));
    return repo;
  },

  use: [],
};
```

### `systems/anima/src/typology/entities/activity.js`

```js
// systems/anima/src/typology/entities/activity.js
import { atom, computed } from "nanostores";
import { RemoteRepository, v } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Activity extends Entity {
  user; mode; thread; buffer; turn;
  type;
  $status = atom("IDLE");
  get status() {
    return this.$status.get();
  }
  set status(value) {
    this.$status.set(value ?? "IDLE");
  }
  error = null;
  steps = [];

  stdin = null;
  stdout = null;

  toJSON() {
    const { stdin: _stdin, stdout: _stdout, ...base } = super.toJSON();
    return { ...base, status: this.status };
  }
}

const idOf = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? null;

// the roster a surface reads: every live activity on one thread. the dock header, the
// shoulder and the F section all ask the same question, so they ask it in one place.
export const roster = (thread) =>
  computed(
    thread?.daemon?.entities?.activity?.$entities ?? atom([]),
    (rows) => rows.filter((row) => idOf(row.thread) === thread?.id),
  );

// what an indicator shows for a set of rows: the loudest live state, else NONE.
const RANK = ["RUNNING", "STOPPING", "PAUSED", "IDLE"];
export const loudest = (rows = []) =>
  RANK.find((code) => rows.some((row) => row.status === code)) ?? "NONE";

export const TONES = {
  IDLE: "idle",
  RUNNING: "primary",
  PAUSED: "caution",
  STOPPING: "caution",
  DONE: "positive",
  STOPPED: "idle",
  FAILED: "negative",
  ABORTED: "negative",
  NONE: "none",
};

export const settled = (code) => Boolean(v.primitives.controller.MACHINE.states[code]?.settled);

export function owed(signal, rows = [], sent = new Set()) {
  const { MACHINE } = v.primitives.controller;
  const from = MACHINE.transitions[MACHINE.signals[signal]] ?? {};
  return rows.filter((row) => {
    const key = `${signal}:${row.id}`;
    if (!Object.hasOwn(from, row.status) || sent.has(key)) return false;
    sent.add(key);
    return true;
  });
}

export const ActivityDossier = {
  name: "activity",
  kind: () => Activity,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/activity"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      const { id } = ctx.entity;
      ctx.entity.stdin = ctx.daemon.call.userspace.entities.activity[id].stdin;
      ctx.entity.stdout = ctx.daemon.call.userspace.entities.activity[id].stdout;
    },
  ],
};
```

### `systems/anima/src/typology/entities/intent.js`

```js
// systems/anima/src/typology/entities/intent.js
import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const IntentDossier = {
  name: "intent",
  kind: () => Intent,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/intent"));
    return repo;
  },

  use: [],
};
```

### `systems/anima/src/typology/gestalten/belt/index.js`

```js
// systems/anima/src/typology/gestalten/belt/index.js
export * as narrow from "./narrow.js";
export * from "./runner.js";
export * from "./chain.js";
```

### `systems/anima/src/typology/gestalten/belt/chain.js`

```js
// systems/anima/src/typology/gestalten/belt/chain.js
const noop = () => {};
const isStore = (value) => typeof value?.subscribe === "function";

function bind(value, path, emit) {
  if (isStore(value)) {
    let inner = noop;
    const off = value.subscribe((next) => {
      inner();
      inner = bind(next, path, emit);
    });
    return () => {
      inner();
      off();
    };
  }
  if (!path.length) {
    emit(value ?? null);
    return noop;
  }
  const [head, ...rest] = path;
  const next = typeof head === "function" ? head(value) : value?.[head];
  return bind(next, rest, emit);
}

export function chain(root, ...path) {
  return {
    subscribe(run) {
      return bind(root, path, run);
    },
  };
}
```

### `systems/anima/src/typology/stores/bridge/panes.js`

```js
// systems/anima/src/typology/stores/bridge/panes.js
export const PANE_BAR = 44;
export const PANE_HEAD = 32;
export const PANE_MIN = 60;
export const PANE_NAMES = ["terminal", "threads", "modes", "thread", "mode", "buffers", "buffer", "harness"];
export const LABELS = { terminal: "terminals" };
export const SHORTS = { terminal: "trm", threads: "all", modes: "mds", thread: "thr", mode: "mod", buffers: "bfs", buffer: "buf", harness: "hrn" };
export const FOLDS = ["page", "stack", "accordion", "free"];
export const RATIO_MIN = 0.15;
export const RATIO_MAX = 0.85;

const WHOLE = { x: 0, y: 0, w: 100, h: 100 };
const CORE = [0.3, 0.7];
const PAGED = ["page", "accordion"];

const leaf = (pane) => ({ type: "leaf", pane });
const split = (dir, ratio, a, b) => ({ type: "split", dir, ratio, a, b });
const within = (value) => value > CORE[0] && value < CORE[1];

const BESIDE = {
  left: (held, fresh) => split("h", 0.5, fresh, held),
  right: (held, fresh) => split("h", 0.5, held, fresh),
  top: (held, fresh) => split("v", 0.5, fresh, held),
  bottom: (held, fresh) => split("v", 0.5, held, fresh),
};

export const grain = ({ width, height }) => (width > height ? "h" : "v");

export const leaves = (tree) => (!tree ? [] : tree.type === "leaf" ? [tree.pane] : [...leaves(tree.a), ...leaves(tree.b)]);

export const remove = (tree, pane) => {
  if (!tree) return null;
  if (tree.type === "leaf") return tree.pane === pane ? null : tree;
  const a = remove(tree.a, pane);
  const b = remove(tree.b, pane);
  return !a ? b : !b ? a : { ...tree, a, b };
};

export const open = (tree, pane, dir = "v") => {
  if (!tree) return leaf(pane);
  if (leaves(tree).includes(pane)) return tree;
  if (pane === "terminal") return split(dir, 0.3, leaf(pane), tree);
  return split(dir, 0.5, tree, leaf(pane));
};

export const reveal = ({ tree }, pane, dir) => ({ tree: open(tree, pane, dir), expanded: pane });

export const swap = (tree, first, second) => {
  if (!tree) return tree;
  if (tree.type === "leaf") return tree.pane === first ? leaf(second) : tree.pane === second ? leaf(first) : tree;
  return { ...tree, a: swap(tree.a, first, second), b: swap(tree.b, first, second) };
};

export const insert = (tree, target, pane, edge) => {
  if (!tree) return leaf(pane);
  if (tree.type === "leaf") return tree.pane === target ? BESIDE[edge](tree, leaf(pane)) : tree;
  return { ...tree, a: insert(tree.a, target, pane, edge), b: insert(tree.b, target, pane, edge) };
};

export const move = (tree, pane, target, zone) => (zone === "center" ? swap(tree, pane, target) : insert(remove(tree, pane), target, pane, zone));

export const setRatio = (tree, path, ratio) =>
  path.length === 0
    ? { ...tree, ratio: Math.min(RATIO_MAX, Math.max(RATIO_MIN, ratio)) }
    : { ...tree, [path[0]]: setRatio(tree[path[0]], path.slice(1), ratio) };

export const solo = (tree, pane, previous) => (tree?.type === "leaf" && previous ? { tree: previous, previous: null } : { tree: leaf(pane), previous: tree });

export const zone = (rect, x, y) => {
  const across = (x - rect.x) / rect.w;
  const down = (y - rect.y) / rect.h;
  if (within(across) && within(down)) return "center";
  const edges = { left: across, right: 1 - across, top: down, bottom: 1 - down };
  return Object.keys(edges).sort((first, second) => edges[first] - edges[second])[0];
};

export const under = (held, x, y) => held.find((leaf) => x >= leaf.x && x <= leaf.x + leaf.w && y >= leaf.y && y <= leaf.y + leaf.h) ?? null;

const LANDING = {
  center: ({ x, y, w, h }) => ({ x: x + w * 0.2, y: y + h * 0.2, w: w * 0.6, h: h * 0.6 }),
  left: ({ x, y, w, h }) => ({ x, y, w: w / 2, h }),
  right: ({ x, y, w, h }) => ({ x: x + w / 2, y, w: w / 2, h }),
  top: ({ x, y, w, h }) => ({ x, y, w, h: h / 2 }),
  bottom: ({ x, y, w, h }) => ({ x, y: y + h / 2, w, h: h / 2 }),
};

export const landing = (rect, edge) => LANDING[edge](rect);

export const layout = (tree, rect = WHOLE, path = "") => {
  if (!tree) return { leaves: [], splits: [] };
  if (tree.type === "leaf") return { leaves: [{ pane: tree.pane, ...rect, path }], splits: [] };
  const { x, y, w, h } = rect;
  const first = tree.dir === "h" ? { x, y, w: w * tree.ratio, h } : { x, y, w, h: h * tree.ratio };
  const second = tree.dir === "h" ? { x: x + first.w, y, w: w - first.w, h } : { x, y: y + first.h, w, h: h - first.h };
  const seam = tree.dir === "h" ? { path, dir: "h", x: second.x, y, h, parent: rect } : { path, dir: "v", x, y: second.y, w, parent: rect };
  const a = layout(tree.a, first, `${path}a`);
  const b = layout(tree.b, second, `${path}b`);
  return { leaves: [...a.leaves, ...b.leaves], splits: [...a.splits, seam, ...b.splits] };
};

export const arrange = (tree, fold, expanded, heights = {}) => {
  if (fold === "free") return layout(tree);
  const order = leaves(tree);
  const shown = order.includes(expanded) ? expanded : order[0];
  if (fold === "page") return { leaves: shown ? [{ pane: shown, ...WHOLE }] : [], splits: [] };
  if (fold === "stack") return { leaves: order.map((pane) => ({ pane, flow: true, height: heights[pane] ?? null })), splits: [] };
  const at = order.indexOf(shown);
  return {
    leaves: order.map((pane, index) => ({ pane, folded: index !== at, heads: order.length - 1, above: index <= at ? index : null, below: index > at ? order.length - index : null })),
    splits: [],
  };
};

export const shown = (tree, expanded) => (leaves(tree).includes(expanded) ? expanded : (leaves(tree)[0] ?? null));

export const latched = ({ tree, fold, expanded }, pane) => (PAGED.includes(fold) ? shown(tree, expanded) === pane : leaves(tree).includes(pane));

export const tap = ({ tree, fold, dir }, pane) => {
  if (!leaves(tree).includes(pane)) return reveal({ tree }, pane, dir);
  return PAGED.includes(fold) ? { expanded: pane } : { tree: remove(tree, pane) };
};

export const available = ({ terminals = 0, thread = false, buffers = 0, application = false, harnessed = false }) => ({
  terminal: true,
  threads: terminals > 0,
  modes: terminals > 0,
  thread,
  mode: thread,
  buffers: thread && (buffers > 0 || application),
  buffer: thread && (buffers > 0 || application),
  harness: thread && harnessed,
});

export const prune = (tree, allowed) => leaves(tree).filter((pane) => !allowed[pane]).reduce(remove, tree);

export const DEFAULT = { tree: leaf("threads"), fold: "page", expanded: "threads", heights: {}, previous: null };

export const KEYS = ["tree", "fold", "expanded", "heights"];

export const arrangement = ({ names, folds, DEFAULT }) => ({
  names,
  folds,
  DEFAULT,
  restore: (saved) =>
    saved?.tree && folds.includes(saved.fold) && leaves(saved.tree).every((pane) => names.includes(pane))
      ? { tree: saved.tree, fold: saved.fold, expanded: saved.expanded ?? leaves(saved.tree)[0], heights: saved.heights ?? {}, previous: null }
      : structuredClone(DEFAULT),
});

export const SECTION_NAMES = ["config", "auth", "box", "dock"];

export const PANELS = {
  b: arrangement({
    names: SECTION_NAMES,
    folds: ["page", "stack"],
    DEFAULT: { tree: SECTION_NAMES.reduce(open, null), fold: "page", expanded: "config", heights: {}, previous: null },
  }),
  c: arrangement({ names: PANE_NAMES, folds: FOLDS, DEFAULT }),
};

export const restore = PANELS.c.restore;
```


## anima today — the shell, the gate, the dock (what the chrome replaces)

### `systems/anima/vite.config.mjs`

```js
// systems/anima/vite.config.mjs
import deno from "@deno/vite-plugin";
import { Url, Status } from "@vivalence/typology";
import { sveltekit } from "@sveltejs/kit/vite";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../");
const __ss = join(__repo, "./subsystems");

async function serverConfig() {
  const { default: paladin, lifecycle } = await import("@vivalence/paladin");
  await lifecycle.mount(paladin.instance);
  paladin.check.instance(paladin.instance).throw();
  const client = paladin.instance.clients.find((held) => held.manifest.slug === "anima");
  // console.log("paladin.env", paladin.env);
  // const client = {slug: "anima", module: "@vivalence/anima", statics: {serve: new Url("http://0.0.0.0:1794"), lighthouse: {remote: new Url("http://100.71.241.160:2501/attached/process/lighthouse/multiplayer"),},},};
  // console.log({ client });

  // let allowedHosts = paladin.is.dev;
  // if (client.statics.remote) allowedHosts = [client.statics.remote.hostname];
  // if (paladin.env.has("VIVA_CLIENT_ANIMA_ALLOWEDHOSTS")) allowedHosts = [paladin.env.get("VIVA_CLIENT_ANIMA_ALLOWEDHOSTS")];

  return {
    cors: { origin: client.statics.remote?.absolute },
    origin: client.statics.remote?.absolute,
    // allowedHosts,

    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),

    strictPort: true,
    fs: { allow: ["./", "../..", "../../node_modules"] },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/#*", "**/bak/**"],
      include: [
        "./src/**/*",
        "../../commons/**/*.{html,svelte,js,css}",
        "../../subsystems/typology/**/*",
        "../../subsystems/dapper/**/*",
        "../../subsystems/drapes/**/*",
      ],
    },
  };
}

const UNKNOWN = { change: "unknown", commit: "unknown", authored: null, built: null };

const TEMPLATE =
  'change_id.short(8) ++ " " ++ commit_id.short(8) ++ " " ++ committer.timestamp().format("%+")';

function stamp() {
  const read = (bin, args) => {
    try {
      const { code, stdout } = new Deno.Command(bin, {
        args,
        cwd: __repo,
        stdout: "piped",
        stderr: "null",
      }).outputSync();
      if (code !== 0) return null;
      return new TextDecoder().decode(stdout).trim() || null;
    } catch {
      return null;
    }
  };
  try {
    if (typeof Deno === "undefined") return UNKNOWN;
    const working = Deno.env.get("VIVA_STAMP")?.trim() ||
      read("jj", [
        "log",
        "--no-pager",
        "--ignore-working-copy",
        "--color=never",
        "-r",
        "@",
        "--no-graph",
        "-T",
        TEMPLATE,
      ]);
    const built = new Date().toISOString();
    if (working) {
      const [change, commit, authored] = working.split(" ");
      return { change: change ?? UNKNOWN.change, commit: commit ?? UNKNOWN.commit, authored: authored ?? null, built };
    }
    return {
      change: UNKNOWN.change,
      commit: read("git", ["rev-parse", "--short=8", "HEAD"]) ?? UNKNOWN.commit,
      authored: read("git", ["log", "-1", "--format=%cI"]),
      built,
    };
  } catch {
    return UNKNOWN;
  }
}

function beacon() {
  return {
    name: "viva-status-beacon",
    configureServer(server) {
      server.httpServer?.once("listening", () => console.log(new Status("running")));
    },
  };
}

export default async ({ command }) => ({
  plugins: [sveltekit(), deno(), beacon()],
  logLevel: "info",
  define: {
    __VIVA_BUILD__: JSON.stringify(stamp()),
  },
  build: {
    target: "es2022",
    rollupOptions: { treeshake: { moduleSideEffects: (id) => !id.includes("/subsystems/typology/") } },
  },
  server: command === "serve" ? await serverConfig() : {},
  preview: command === "serve" ? await serverConfig() : {},
  ssr: {
    noExternal: true,
  },
  resolve: {
    alias: {
      // STABLE
      $telemetry: join(__dirname, "./src/telemetry/index.js"),
      $client: join(__dirname, "./src/client.js"),
      "@vivalence/anima": join(__dirname, "./src/typology/mod.js"),

      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),
      "@vivalence/typology/schematics": join(__ss, "./typology/schematics/index.js"),

      "@vivalence/dapper/font.css": join(__repo, "./subsystems/dapper/primitives/font.css"),
      "@vivalence/dapper/bsp.css": join(__repo, "./subsystems/dapper/primitives/bsp.css"),

      "@vivalence/dapper/contrast": join(__repo, "./subsystems/dapper/lib/contrast.js"),
      "@vivalence/dapper": join(__repo, "./subsystems/dapper/mod.js"), // ? needed ?
      "@vivalence/drapes": join(__repo, "./subsystems/drapes/mod.js"), // ? needed ?

      // TBD
      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // i want to access to $viva_config_dir/assets present as @client/assets
      // "@static/icons/": join(__dirname, "./static/icons/"),
      // "$static/images/": join(__dirname, "./static/images/"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
});
```

### `systems/anima/src/app/+layout.svelte`

```svelte
// systems/anima/src/app/+layout.svelte
<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";

  import { env } from "$env/dynamic/public";
  import { page } from "$app/state";

  import { onMount, setContext } from "svelte";
  import { computed } from "nanostores";

  import { Connection, Url, shard } from "@vivalence/typology";
  import { logger } from "$telemetry";
  import { LIGHTHOUSE, TERMINALS, BRIDGE, BOX } from "$client";
  import { stores } from "@vivalence/anima";
  import { Key } from "@vivalence/drapes";
  import { gateFor } from "./gate.js";
  import * as focusEffects from "./focus.js";

  import Login from "./widgets/Login.svelte";
  import Boot from "./widgets/Boot.svelte";

  let { children } = $props();

  let gate = $state("boot");

  let terminalCount = $state(0); // refactor away

  const connection = new Connection(
    new Url(env.PUBLIC_VIVA_RUNTIME_REMOTE),
    shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }),
  );
  connection.use(shard.track.span((call) => call.request.url.pathname, logger.channel));
  const lighthouse = new stores.lighthouse.Lighthouse(connection, { channel: logger.channel });
  stores.lighthouse.hydrate(lighthouse);
  setContext(LIGHTHOUSE, lighthouse);

  const bridge = new stores.bridge.Bridge();
  setContext(BRIDGE, bridge);

  const terminals = new stores.terminals.Terminals(lighthouse.dataspace.terminal);
  setContext(TERMINALS, terminals);

  const box = new stores.box.Box();
  setContext(BOX, box);

  if (typeof window !== "undefined") { // @beef Temporary devtools hack.
    window.__viva = { lighthouse, terminals, bridge, box };
  }

  if (import.meta.env.DEV) {
    logger.channel.tap((record) =>
      console.debug(
        `[${(record.at / 1000).toFixed(3).padStart(8)}]`,
        record.path,
        record.verb,
        record.data ?? "",
      ),
    );
  }

  onMount(() => {
    stores.lighthouse.boot(lighthouse).catch((error) => logger.entry("lighthouse").fault(error));

    const unsubscribeGate = computed(
      [lighthouse.$isAuthorized, lighthouse.$status],
      gateFor,
    ).subscribe((value) => {
      gate = value;
      logger.entry("gate").note({ message: `gate → ${value}` });
    });

    const unsubscribeTerminals = terminals.$entities.subscribe((entities) => {
      terminalCount = entities.length;
      terminals.settle(bridge.layout.terminal);
    });
    const unsubscribeActive = terminals.$active.subscribe((terminal) => {
      if (!terminal || bridge.layout.terminal === terminal.id) return;
      bridge.layout.terminal = terminal.id;
      bridge.save();
    });

    const unfocus = focusEffects.focus({ terminals });

    return () => {
      unfocus();
      unsubscribeGate();
      unsubscribeTerminals();
      unsubscribeActive();
    };
  });

  async function onLogin() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => logger.entry("lighthouse/login").fault(error));
  }

  async function onRetry() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => logger.entry("lighthouse/retry").fault(error));
  }

  function onOpenTerminal() {
    terminals.create().catch((error) => logger.entry("terminals/create").fault(error));
  }
</script>

{#if page.url.pathname.startsWith("/design")}
  {@render children()}
{:else if gate === "ready"}
  {@render children()}
  {#if terminalCount === 0}
    <div class="empty-overlay" onclick={onOpenTerminal} role="presentation">
      <Key label="open terminal" />
    </div>
  {/if}
{:else if gate === "signin"}
  <div class="gate">
    <Login {lighthouse} onConnected={onLogin} {onRetry} />
  </div>
{:else}
  <Boot {gate} />
{/if}

<style>
  .gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100svh;
    box-sizing: border-box;
    padding: calc(10vh + var(--safe-area-top, 0px)) 16px calc(48px + var(--safe-area-bottom, 0px));
    overflow-y: auto;
    background: var(--surface);
    color: var(--text-strong);
  }
  .empty-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    place-items: center;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    cursor: pointer;
  }
</style>
```

### `systems/anima/src/app/gate.js`

```js
// systems/anima/src/app/gate.js
export const gateFor = (authorized, status) => {
  if (!authorized) return "signin";
  if (status.code === "OFFLINE" || status.code === "ERROR") return "signin";
  if (status.code === "POPULATING") return "populating";
  if (status.code !== "VERIFIED") return "verifying";
  return "ready";
};
```

### `systems/anima/src/app/focus.js`

```js
// systems/anima/src/app/focus.js
import { logger } from "$telemetry";

export function focus({ terminals }) {
  const hydrated = new Map();

  const engage = async (thread) => {
    if (!thread?.daemon?.entities || hydrated.has(thread.id)) return;
    hydrated.set(thread.id, null);
    const focusing = logger.entry(`focus/${thread.id}`).open();
    const { buffer, turn } = thread.daemon.entities;
    try {
      const [buffers, turns] = await Promise.all([
        buffer.find({ thread: thread.id }, { populate: ["literals", "symbols"] }),
        turn.find({ thread: thread.id }, { populate: [] }),
      ]);
      const offBuffer = buffer.subscribe({ thread: thread.id });
      const offTurn = turn.subscribe({ thread: thread.id });
      hydrated.set(thread.id, () => {
        offBuffer();
        offTurn();
      });
      focusing.note({
        message: `thread focused`,
        buffers: buffers.length,
        turns: turns.length,
      });
    } catch (error) {
      hydrated.delete(thread.id);
      focusing.fault(error);
    }
    focusing.close();
  };

  let inner = [];
  const offEntities = terminals.$entities.subscribe((entities) => {
    inner.forEach((unsubscribe) => unsubscribe());
    inner = entities.map((terminal) => terminal.$thread.subscribe((thread) => engage(thread)));
  });

  return () => {
    offEntities();
    inner.forEach((unsubscribe) => unsubscribe());
    hydrated.forEach((teardown) => teardown?.());
  };
}
```

### `systems/anima/src/app/widgets/Login.svelte`

```svelte
// systems/anima/src/app/widgets/Login.svelte
<script>
  import { Card, Input, Key, Pip, Pressed, Section, Spinner } from "@vivalence/drapes";

  let { lighthouse, onConnected, onRetry } = $props();

  const status = lighthouse.$status;
  const authorized = lighthouse.$isAuthorized;
  const remote = lighthouse.connection.url.href;
  const host = URL.canParse(remote) ? new URL(remote).host : remote;

  let username = $state("");
  let password = $state("");
  let helping = $state(false);

  const busy = $derived($status.code === "AUTHENTICATING");
  const failed = $derived(["ERROR", "OFFLINE", "SESSION_EXPIRED"].includes($status.code));
  const standing = $derived($status.code.replaceAll("_", " ").toLowerCase());
  const tone = $derived(failed ? "danger" : busy ? "primary" : $status.code === "VERIFIED" ? "success" : "muted");

  const prompt = $derived(
    `anima signin at ${remote} shows "${standing}` +
      `${$status.message ? `: ${$status.message}` : ""}". ` +
      "diagnose it: run `viva instance/doctor`, check PUBLIC_VIVA_RUNTIME_REMOTE " +
      "in the instance .env, docs at https://docs.vivalence.org. " +
      "look in the repository in .ikiro for orientation and solutions.",
  );

  async function submit(event) {
    event.preventDefault();
    const result = await lighthouse.login(username, password);
    if (result.status === "OK") onConnected(lighthouse);
  }
</script>

<div class="signin">
  <div class="brand">
    <span class="brand-name">vivalence/anima</span>
  </div>

  <Card>
    <Section label="lighthouses" count={1} />
    <div class="row">
      <span class="row-name">{lighthouse.user?.slug ?? host}</span>
      <span class="row-address">{remote}</span>
      <span class="row-state">
        {#if busy}<Spinner />{:else}<Pip size={7} {tone} pulse={busy} />{/if}
        {standing}
      </span>
    </div>
    {#if $status.message}<span class="detail">{$status.message}</span>{/if}
    <Pressed>
      <form class="credentials" onsubmit={submit}>
        <Input bind:value={username} placeholder="username" autocomplete="username" />
        <Input bind:value={password} type="password" placeholder="password" autocomplete="current-password" />
        <div class="verbs">
          {#if $authorized && failed}<Key size="field" label="retry" onclick={onRetry} />{/if}
          <Key size="field" tone="primary" type="submit" label="connect" disabled={busy} />
        </div>
      </form>
    </Pressed>
  </Card>

  <Card sunk>
    <Section label="help" open={helping} ontoggle={() => (helping = !helping)} />
    {#if helping}
      <p>there is no signup ui — accounts are created from the shell:</p>
      <code>viva instance/user signup &lt;username&gt; &lt;password&gt;</code>
      <p>docs: <a href="https://docs.vivalence.org" target="_blank">docs.vivalence.org</a></p>
      <p>stuck? paste this to your llm:</p>
      <code class="prompt">{prompt}</code>
    {/if}
  </Card>
</div>

<style>
  .signin {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
    max-width: 420px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-name {
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-xl);
    letter-spacing: -0.01em;
    color: var(--text-header);
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 2px 12px;
    padding: 10px 12px;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), 0 var(--size-depth) 0 var(--boundary);
    margin-bottom: var(--size-depth);
  }
  .row-name {
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-sm);
    font-weight: 600;
  }
  .row-address {
    grid-column: 1;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--control-on-muted);
  }
  .row-state {
    grid-column: 2;
    grid-row: 1 / 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .detail {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--signal-negative-ink);
  }
  .credentials {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .verbs {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-bottom: var(--size-depth);
  }
  p {
    margin: 0;
    font-size: var(--size-type-xs);
    color: var(--text-ink);
  }
  a {
    color: var(--text-link);
  }
  code {
    display: block;
    padding: 6px 10px;
    border-radius: var(--shape-radius-key);
    background: var(--surface-lift);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-code);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .prompt {
    user-select: all;
  }
</style>
```

### `systems/anima/src/app/panels/a/a.svelte`

```svelte
// systems/anima/src/app/panels/a/a.svelte
<script>
  import { getContext } from "svelte";
  import { BRIDGE, TERMINALS } from "$client";
  import { chain, stores } from "@vivalence/anima";
  import { mime } from "@vivalence/typology";
  import { Empty, Frame } from "@vivalence/drapes";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();


  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);

  const terminal = terminals.$active;
  const thread = chain(terminals, "$active", "$thread");
  const buffer = chain(terminals, "$active", "$buffer");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const phase = chain(terminals, "$active", "$thread", "$phase");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const dock = chain(terminals, "$active", "$dock");
  const settling = chain(terminals, "$active", "$settling");
  const application = chain(terminals, "$active", "$buffer", "mode", "$application");
  const record = chain(terminals, "$active", "$buffer", "$bundle");
  const modeStatus = chain(terminals, "$active", "$buffer", "mode", "status", "$transient");

  const ACCEPT = [mime.dom.svelte, mime.dom.html];

  const bundle = $derived.by(() => {
    const active = $buffer;
    if (!active) return null;
    const base = $application?.url ?? null;
    const drawn = $record;
    if (drawn) return base ? drawn.withUrl(base) : drawn;
    return $application?.bundle ?? null;
  });

  const dockable = $derived($mode?.implements?.("HARNESSED") ?? false);
  const full = $derived($dock?.full ?? false);
  const geom = $derived(
    dockable && rect.width > 0 && rect.height > 0 ? stores.bridge.resolve($dock, rect) : null,
  );

  const conversational = $derived(dockable && !($mode?.implements?.("APPLICATION") ?? false));
  const reason = $derived(
    $phase === "inert"
      ? "inert · open a buffer or engage a phase"
      : $buffers?.length
        ? "cursor empty"
        : "no buffers · open or pull",
  );
  const refusal = $derived(
    [
      `mode ${$buffer?.mode?.slug ?? "—"}`,
      `application ${$application ? "present" : "pending"}`,
      $modeStatus?.code && $modeStatus.code !== "HEALTHY" ? `mode ${$modeStatus.code.toLowerCase()}` : null,
      $modeStatus?.code && $modeStatus.code !== "HEALTHY" && $modeStatus.error
        ? `${$modeStatus.error.message ?? $modeStatus.error}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  );
  const consult = (name) => {
    if (!name) return;
    bridge.panels.c.tree = stores.bridge.panes.open(bridge.panels.c.tree, "harness", stores.bridge.railGrain(bridge));
    bridge.panels.c.expanded = "harness";
    bridge.save();
  };
  let last = null;
  function onSeamDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    last = { x: event.clientX, y: event.clientY };
  }
  function onSeamMove(event) {
    if (!last || !geom) return;
    const deltaPx = geom.vertical ? event.clientX - last.x : event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    stores.bridge.dragDock(terminals.active?.$dock, rect, deltaPx);
  }
  function onSeamUp(event) {
    if (!last) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    last = null;
    stores.bridge.dropDock(terminals.active?.$dock, rect);
  }
</script>

{#snippet vacant()}
  <div class="standing">
    {#if $settling}
      <Empty spinner verb="settling · thread" />
    {:else if !$thread}
      <Empty verb="no thread" trace="pick a mode in navigation · or a thread" />
    {:else if conversational}
      <Empty verb="conversational · no application" trace="the dock is the surface" />
    {:else}
      <Empty verb="resolving buffer" trace={reason} />
    {/if}
  </div>
{/snippet}

{#if rect.width > 0 && rect.height > 0}
  <div
    data-zone="1"
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
    style:flex-direction={geom?.direction ?? "row"}>
    <div class="stage">
      {#if $terminal}
        <Frame terminal={$terminal} {bundle} accept={ACCEPT}>
          {#if $buffer && !bundle}
            <div class="standing">
              {#if conversational}
                <Empty verb="conversational · no application" trace="the dock is the surface" />
              {:else}
                <Empty tone="negative" verb="buffer has no bundle" trace={refusal} />
              {/if}
            </div>
          {:else}
            {@render vacant()}
          {/if}
        </Frame>
      {:else}
        {@render vacant()}
      {/if}
    </div>

    {#if geom && $thread && !$dock?.collapsed}
      {#if !full}
        <div
          class="seam"
          class:vertical={geom.vertical}
          onpointerdown={onSeamDown}
          onpointermove={onSeamMove}
          onpointerup={onSeamUp}
          onpointercancel={onSeamUp}>
          <span class="grip"></span>
        </div>
      {/if}
      <div
        class="dock-slot"
        class:full
        style:width={full || !geom.vertical ? "100%" : `${geom.size}px`}
        style:height={full || geom.vertical ? "100%" : `${geom.size}px`}>
        <Dock thread={$thread} onconsole={consult} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    overflow: hidden;
    background: var(--surface);
    color: var(--text-strong);
  }
  .stage {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .standing {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: grid;
    place-items: center;
  }
  .seam {
    flex: 0 0 7px;
    display: grid;
    place-items: center;
    cursor: ns-resize;
    touch-action: none;
  }
  .seam.vertical {
    cursor: ew-resize;
  }
  .seam:hover {
    background: var(--control-selected);
  }
  .grip {
    width: 26px;
    height: 3px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .seam.vertical .grip {
    width: 3px;
    height: 26px;
  }
  .dock-slot {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .dock-slot.full {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
</style>
```

### `systems/anima/src/app/panels/a/widgets/Dock.svelte`

```svelte
// systems/anima/src/app/panels/a/widgets/Dock.svelte
<script>
  import { getContext, untrack } from "svelte";
  import { chain, stores, dictation } from "@vivalence/anima";
  import { soma } from "@vivalence/typology";
  import { TERMINALS, BRIDGE, BOX } from "$client";
  import { Empty } from "@vivalence/drapes";
  import { TONES, loudest, roster as activityRoster } from "@vivalence/anima";
  import Composer from "./Composer.svelte";
  import DockHead from "./DockHead.svelte";
  import LiveTurn from "./LiveTurn.svelte";
  import Turn from "./Turn.svelte";
  import { stopper } from "./stop.svelte.js";
  import { spliceAt } from "./dictate.js";
  import { bufferLabel, enrich, project, turnClipboard, turnText, usages } from "./turns.js";

  let { thread, onconsole = null } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  const box = getContext(BOX);

  const turnsStore = chain(terminals, "$active", "$thread", "$turns");
  const modeStore = chain(terminals, "$active", "$thread", "$mode");
  const dockStore = chain(terminals, "$active", "$dock");
  const buffersStore = chain(terminals, "$active", "$thread", "$buffers");
  const traitStore = chain(terminals, "$active", "$thread", "$trait");
  const traitsStore = chain(terminals, "$active", "$thread", "$traits");
  const labelStore = chain(terminals, "$active", "$thread", "$label");
  const seatedStore = chain(terminals, "$active", "$buffer");
  const composerStore = bridge.$composer;

  let turns = $derived($turnsStore ?? []);
  let thinkMode = $derived($traitStore?.INTELLIGENT?.thinking);
  let harnessed = $derived($modeStore?.implements?.("HARNESSED") ?? false);
  let verbatim = $derived(harnessed && ($modeStore?.daemon?.cortex?.find({ type: "verbatim", via: "stream" }).length ?? 0) > 0);
  const tunable = $derived(($traitsStore ?? []).includes("INTELLIGENT"));
  const agent = $derived($labelStore?.name ?? "agent");

  let activities = $state([]);
  $effect(() => {
    if (!thread) return void (activities = []);
    untrack(() => control.disarm());
    return activityRoster(thread).subscribe((held) => (activities = held));
  });
  const activityCode = $derived(loudest(activities));
  const control = stopper(() => ({ activities, sending }));

  const recorder = dictation({ terminals, box });
  const dictating = recorder.$active;
  const level = box.device.microphone.$level;
  let anchor = 0;
  const listening = $derived($dictating !== "idle");
  let full = $derived($dockStore?.full ?? false);
  const side = $derived(stores.bridge.normalizeSide($dockStore?.side));

  let live = $state(null);
  let echo = $state(null);
  let sending = $state(false);
  let error = $state(null);

  let draft = $state("");
  let textareaEl = $state(null);
  let dockHeight = $state(0);
  let logEl = $state(null);
  let pinned = $state(true);
  let unread = $state(0);

  let metaOpen = $state(false);
  let picked = $state(null);
  let elapsed = $state(0);

  const CONSOLES = ["context", "meter", "activity"];

  function openConsole(name) {
    picked = picked === name ? null : name;
    onconsole?.(picked);
  }

  function toggleMeta() {
    metaOpen = !metaOpen;
    if (!metaOpen && picked) openConsole(picked);
  }

  function launch(row) {
    const terminal = terminals.active;
    const buffer = ($buffersStore ?? []).find((candidate) => candidate.id === row.id);
    if (!terminal || !buffer) return;
    terminal.$buffer.set(buffer);
    if (full) stores.bridge.setDockFull(terminal.$dock, false);
  }

  function launchLabel(row) {
    const managed = ($buffersStore ?? []).find((candidate) => candidate.id === row.id) ?? row;
    return bufferLabel(managed);
  }

  const launches = (item) =>
    item.buffers.map((row) => {
      const managed = ($buffersStore ?? []).find((candidate) => candidate.id === row.id);
      return {
        id: row.id,
        label: launchLabel(row),
        line: [thread?.daemon?.slug, managed?.mode?.slug ?? thread?.mode?.slug].filter(Boolean).join(" › "),
        runnable: Boolean(managed),
        seated: !full && $seatedStore?.id === row.id,
      };
    });

  const coarsePointer = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  const enterSends = $derived(!coarsePointer && ($composerStore?.enterSends ?? true));
  const hint = $derived(coarsePointer ? "message…" : enterSends ? "message… (shift+enter for newline)" : "message… (enter for newline, shift+enter sends)");

  const isStreaming = $derived(!!live);
  const isThinking = $derived(sending && !live);
  const busy = $derived(sending || !!live);
  const showEcho = $derived(!!echo && !turns.some((t) => t.id === echo.id));

  const liveItem = $derived(live ? { ...project(live), turn: live, date: null } : null);
  const liveCall = $derived(liveItem?.tools.find((tool) => tool.status === "running")?.name ?? null);
  const liveWord = $derived(liveCall ? `calling ${liveCall}` : isStreaming ? "streaming" : "thinking");
  const elapsedLabel = $derived(`${elapsed.toFixed(1)}s`);

  $effect(() => {
    if (!busy) return;
    const begun = Date.now();
    elapsed = 0;
    const ticker = setInterval(() => (elapsed = (Date.now() - begun) / 1000), 100);
    return () => clearInterval(ticker);
  });

  function dictate() {
    anchor = textareaEl?.selectionStart ?? draft.length;
    recorder.start();
  }

  async function settle() {
    recorder.stop();
    await recorder.settled();
    const text = recorder.$committed.get();
    if (!text) return;
    const spliced = spliceAt(draft, anchor, text);
    draft = spliced.draft;
    requestAnimationFrame(() => {
      textareaEl?.focus();
      if (textareaEl) textareaEl.selectionStart = textareaEl.selectionEnd = spliced.caret;
    });
  }

  $effect(() => {
    const unswitch = chain(terminals, "$active", "$thread").subscribe(() => recorder.cancel());
    return () => {
      unswitch();
      recorder.cancel();
    };
  });

  async function send() {
    if (!draft.trim() || !harnessed || sending) return;
    control.disarm();
    const parts = [{ type: "text", text: draft.trim() }];
    draft = "";
    error = null;
    const id = crypto.randomUUID();
    echo = { id, role: "user", parts, createdAt: new Date().toISOString() };
    sending = true;
    pinned = true;
    pinBottom();
    textareaEl?.focus();

    try {
      for await (const turn of soma.scan(
        thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }),
      )) {
        live = { ...turn };
        pinBottom();
      }
    } catch (err) {
      error = err.message;
    } finally {
      live = null;
      echo = null;
      sending = false;
    }
  }


  function lastUserText() {
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      if (turns[i]?.role === "user") return turnText(turns[i]);
    }
    return null;
  }

  function recallLastUser() {
    const text = lastUserText();
    if (!text) return;
    draft = text;
    if (textareaEl) {
      textareaEl.focus();
      requestAnimationFrame(() => {
        textareaEl.selectionStart = textareaEl.selectionEnd = draft.length;
      });
    }
  }

  function onKey(event) {
    if (event.key === "Enter") {
      const wantsSend = enterSends ? !event.shiftKey : event.shiftKey;
      if (wantsSend) {
        event.preventDefault();
        send();
        return;
      }
    } else if (event.key === "ArrowUp" && draft === "") {
      event.preventDefault();
      recallLastUser();
    } else if (event.key === "Escape" && listening) {
      event.preventDefault();
      recorder.cancel();
    } else if (event.key === "Escape" && (isStreaming || sending || activities.length)) {
      event.preventDefault();
      control.stop();
    }
  }

  let copied = $state(null);

  async function toClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const done = document.execCommand ? document.execCommand("copy") : false;
    area.remove();
    return done;
  }

  async function copyTurn(turn, tools) {
    copied = (await toClipboard(turnClipboard(turn, tools))) ? turn.id : null;
    setTimeout(() => (copied = null), 1200);
  }

  function retryUser(turn) {
    const text = turnText(turn);
    if (!text) return;
    draft = text;
    send();
  }

  function isAtBottom(el) {
    if (!el) return true;
    const slack = 24;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - slack;
  }

  let lastScrollTop = 0;
  function onScroll() {
    if (!logEl) return;
    const top = logEl.scrollTop;
    if (isAtBottom(logEl)) {
      pinned = true;
      unread = 0;
    } else if (top < lastScrollTop) {
      pinned = false;
    }
    lastScrollTop = top;
  }

  let pinQueued = false;
  function pinBottom() {
    if (pinQueued) return;
    pinQueued = true;
    requestAnimationFrame(() => {
      pinQueued = false;
      if (pinned && logEl) logEl.scrollTop = logEl.scrollHeight;
    });
  }

  function repin() {
    pinned = true;
    pinBottom();
    unread = 0;
  }

  let lastCount = 0;
  $effect(() => {
    const len = enrichedTurns.filter((item) => item.kind === "turn").length + (isStreaming ? 1 : 0);
    if (pinned) pinBottom();
    else if (len > lastCount) unread = untrack(() => unread) + len - lastCount;
    lastCount = len;
  });

  $effect(() => {
    if (!logEl) return;
    const observer = new ResizeObserver(pinBottom);
    observer.observe(logEl);
    return () => observer.disconnect();
  });

  const spoken = $derived(showEcho ? [...turns, echo] : turns);
  const enrichedTurns = $derived(enrich(spoken));
  const spent = $derived(usages(enrichedTurns, spoken));
</script>

<div class="dock" class:full bind:clientHeight={dockHeight}>
  <DockHead
    label={$labelStore?.name ?? "session"}
    tone={activityCode === "NONE" ? (busy ? "primary" : harnessed ? "idle" : "none") : TONES[activityCode]}
    word={activityCode === "NONE" ? null : activityCode.toLowerCase()}
    pulse={busy || activityCode === "RUNNING"}
    {side}
    sides={stores.bridge.DOCK_SIDES}
    {full}
    meta={metaOpen}
    consoles={CONSOLES}
    {picked}
    onmeta={toggleMeta}
    onconsole={openConsole}
    onside={(name) => stores.bridge.setDockSide(terminals.active?.$dock, name)}
    onfull={() => stores.bridge.setDockFull(terminals.active?.$dock)}
    oncollapse={() => stores.bridge.setDockCollapsed(terminals.active?.$dock)} />

  <div class="dock-log" bind:this={logEl} onscroll={onScroll}>
    {#each enrichedTurns as item, index (item.id ?? item.turn?.id ?? index)}
      <Turn
        {item}
        {agent}
        thinking={thinkMode}
        usage={spent.get(item.turn?.id) ?? null}
        launches={item.kind === "turn" ? launches(item) : []}
        copied={item.kind === "turn" && copied === item.turn.id}
        onlaunch={launch}
        oncopy={copyTurn}
        onretry={retryUser}
        onfold={pinBottom} />
    {/each}

    {#if liveItem || isThinking}
      <LiveTurn
        item={liveItem}
        {agent}
        word={liveWord}
        elapsed={elapsedLabel}
        thinking={thinkMode}
        launches={liveItem ? launches(liveItem) : []}
        onlaunch={launch}
        onfold={pinBottom} />
    {/if}

    {#if !turns.length && !live && !isThinking}
      <div class="dock-begin"><Empty verb={harnessed ? "begin" : "no harness"} /></div>
    {/if}

    <div class="dock-anchor"></div>
  </div>

  <Composer
    bind:draft
    bind:field={textareaEl}
    {thread}
    {harnessed}
    {hint}
    ceiling={Math.max(112, Math.round(dockHeight * 0.6))}
    {error}
    {pinned}
    {unread}
    stoppable={sending || activities.length > 0}
    {sending}
    {control}
    {tunable}
    tune={$traitStore?.INTELLIGENT?.tune}
    {verbatim}
    {recorder}
    {level}
    coarse={coarsePointer}
    onkeydown={onKey}
    onsend={send}
    onpin={repin}
    ondictate={dictate}
    onsettle={settle} />
</div>

<style>
  .dock {
    --dock-gutter: 14px;
    --dock-head-gutter: 6px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: var(--surface-lift);
    color: var(--text-strong);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-sans-text);
  }
  .dock.full {
    --dock-gutter: clamp(24px, 8%, 120px);
    --dock-head-gutter: clamp(18px, 6%, 96px);
  }
  .dock-log {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px max(var(--dock-gutter), calc((100% - 640px) / 2)) 10px;
    font-size: var(--size-type-sm);
    line-height: var(--size-leading-loose);
  }
  .dock-begin {
    padding: 24px 0;
    overflow-anchor: none;
  }
  .dock-anchor {
    overflow-anchor: auto;
    height: 1px;
    flex-shrink: 0;
    margin-top: -14px;
  }
</style>
```

### `subsystems/drapes/panels/Frame.svelte`

```svelte
// subsystems/drapes/panels/Frame.svelte
<script>
  import { onDestroy } from "svelte";
  import Empty from "../display/Empty.svelte";

  let { terminal, bundle = null, accept = [], children } = $props();

  const buffer = $derived(terminal.$buffer);
  const bufferId = $derived($buffer?.id);
  const address = $derived(bundle ? `${bundle.url ?? ""}${bundle.negotiate(accept)?.mount ?? ""}` : "");
  let component = $state(null);
  let dom = $state(null);
  let fault = $state(null);
  let live = null;
  let shown = null;
  let seated = null;

  function identity(record) {
    if (!record) return null;
    return `${record.url}${record.negotiate(accept)?.mount ?? ""}`;
  }

  let standing = $state(null);

  function teardown() {
    live?.unmount();
    component?.destroy();
    live = null;
    shown = null;
    seated = null;
    component = null;
    fault = null;
    standing = null;
  }

  $effect(() => {
    const next = $buffer;
    const key = identity(bundle);
    const target = dom;
    if (next === live && key === shown && terminal === seated) return;
    teardown();
    if (!next) return;
    // A not-yet-resolved buffer (e.g. a persisted id-string awaiting rehydrate) has no
    // entity methods — skip until it becomes a real Buffer, so live/teardown never see a string.
    if (typeof next.mount !== "function") {
      standing = "resolving";
      return;
    }
    if (!bundle) {
      live = next;
      shown = key;
      seated = terminal;
      next.mount();
      return;
    }
    standing = "loading";
    if (!target) return;
    live = next;
    shown = key;
    seated = terminal;
    (async () => {
      try {
        const module = await bundle.load(accept);
        if (live !== next || shown !== key) return;
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
          buffer: next,
        });
        next.mount();
        standing = "ready";
      } catch (error) {
        console.error(`[Frame] bundle refused for buffer ${next.id}`, error);
        if (live === next) {
          fault = error.message;
          standing = null;
        }
      }
    })();
  });

  onDestroy(teardown);
</script>

{#key bufferId}
  <div class="viewport">
    {#if fault}
      <div class="fault">
        <Empty tone="negative" verb="bundle refused" trace={fault} />
        {#if bundle}<span class="fault-trace">{address}</span>{/if}
      </div>
    {:else if bundle}
      <div class="stage" bind:this={dom}></div>
      {#if standing === "loading"}
        <div class="standing">
          <Empty spinner verb="loading bundle" trace={address} />
        </div>
      {/if}
    {:else if standing === "resolving"}
      <div class="standing">
        <Empty spinner verb="resolving buffer" trace={typeof $buffer === "string" ? $buffer : ($buffer?.id ?? "")} />
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </div>
{/key}

<style>
  .viewport {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
  }
  .stage {
    width: 100%;
    height: 100%;
    max-width: 100vw;
  }
  .standing {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .fault {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 1rem 1.5rem;
    max-width: 80%;
    border-radius: var(--shape-radius-key);
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-negative);
    font-family: var(--font-family-code);
    color: var(--signal-negative-ink);
  }
  .fault-trace {
    font-size: var(--size-type-2xs);
    word-break: break-all;
    text-align: center;
  }
</style>
```


## ghost today — the door, the trajectory, the signal

### `systems/ghost/deno.jsonc`

```jsonc
// systems/ghost/deno.jsonc
{
  "name": "@vivalence/ghost",
  "version": "0.0.1",
  "exports": {
    ".": "./mod.js",
    "./typology": "./typology.js",
  },
  "publish": {
    "exclude": ["tests/"],
  },
  "tasks": {
    "run": "deno run -A mod.js",
    "watch": "deno run -A --watch mod.js",
    "test": "deno test -A --no-check --watch tests/**/*.test.js",
    "test/shellsignal": "deno test -A --no-check --watch tests/shellsignal.test.js",
  },
}
```

### `systems/ghost/ghost.sh`

```sh
// systems/ghost/ghost.sh
#!/bin/sh

ENV="${XDG_CONFIG_HOME:-$HOME/.config}/viva/env"
[ -f "$ENV" ] && . "$ENV"

# the shell that INVOKED viva owns the session. $$ here is this script's own pid — fresh on every
# invocation, so a selection written under it could never be read back. the invoker is our parent.
VIVA_PROCESS_ID="${VIVA_PROCESS_ID:-$PPID}"
export VIVA_PROCESS_ID

exec deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc" -A "$VIVA_REPOSITORY_MOUNT/systems/ghost/mod.js" "$@"
```

### `systems/ghost/install.sh`

```sh
// systems/ghost/install.sh
#!/bin/sh
REPO="${1:-$(pwd)}"
CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/viva"
ENV="$CONFIG/env"
mkdir -p "$CONFIG"
{ grep -v '^export VIVA_REPOSITORY_MOUNT=' "$ENV" 2>/dev/null; echo "export VIVA_REPOSITORY_MOUNT=\"$REPO\""; } > "$ENV.tmp" && mv "$ENV.tmp" "$ENV"
chmod +x "$REPO/systems/ghost/ghost.sh"
ln -sf "$REPO/systems/ghost/ghost.sh" "$HOME/.deno/bin/viva"
"${SHELL:-sh}" -lic 'command -v viva' >/dev/null 2>&1 || echo "viva: a fresh shell does not find viva — add to your rc: export PATH=\"\$HOME/.deno/bin:\$PATH\""
echo "viva → $REPO  ·  config: $ENV"
```

### `systems/ghost/typology.js`

```js
// systems/ghost/typology.js
// export process from "./belt/process.js";
export * from "./belt/index.js";
export * from "./prototypes/index.js";
// export * from "./prototypes/shellsignal.js";
// export * from "./prototypes/shellcontext.js";

export * as prototypes from "./prototypes/index.js";
export * as belt from "./belt/index.js";
```

### `systems/ghost/mod.js`

```js
// systems/ghost/mod.js
import paladin, { lifecycle } from "@vivalence/paladin";
import { is, object, Vector, Span, Path, steer, shard } from "@vivalence/typology";
import { view, JsonTree, Effect } from "@vivalence/sheets";
import * as dotenv from "@std/dotenv";
import { resolve } from "@std/path";
import { ShellSignal, ShellContext } from "./typology.js";
import { config, path } from "./belt/index.js";

import trajectories, { flags } from "./trajectories/index.js";
import { accepts, census } from "./trajectories/help.js";

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => {
    const result = await effect(ctx);
    ctx.effect ??= result;
  });
  return context.effect;
};

const trajectory = new Vector();

trajectory
  .use(async (ctx, next) => {
    // const pipe = new Pipe()
    // pipe.tap(span=> paladin.ledger.pipe[...probably paladin.ledger.log()])

    ctx.span = new Span("ghost");
    // ctx.span.to(paladin.instance.logs);

    ctx.span.open();
    ctx.span.mark("subject", { schema: "signal", id: ctx.signal.absolute.join(" ") });

    try {
      await next();
    } finally {
      if (ctx.error) ctx.span.fault(ctx.error);
      ctx.span.close();
    }
  })

  // .use(async (ctx, next) => {ctx.span = new Span("ghost.invoke").to(paladin.ledger.pipe).begin(); ctx.span.track.subject({ schema: "signal", id: ctx.signal.absolute.join(" ") }); await next(); if (ctx.error) ctx.span.track.fault().raise(ctx.error.message, ctx.error.code); ctx.span.drain();})
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.error = error;
    }
  })
  .use(async (ctx, next) => {
    // was: hand-inlined strategy with a swapped `[apply, effect]` — traverse returns [effect, carry, …],
    // so the leaf ran as middleware and the fold ran as a leaf; span + error-catch never wrapped sub-calls.
    // collapsed onto steer.dispatch.invoke — the same combinator the entrypoint uses at the bottom of this file.
    // ctx.call = async (args) => {
    //   const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
    //   const [apply, effect] = steer.dispatch.traverse(trajectory, signal); // @beef validate
    //   const context = new ShellContext({ signal });
    //   await apply(context, async (_ctx) => {
    //     // @beef try catch pipe bubble!
    //     const result = await effect(_ctx);
    //     if (!_ctx.effect && result) _ctx.effect = result;
    //   });
    //   return context.effect;
    // };
    ctx.call = (args) => {
      const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
      const inner = new ShellContext({ signal });
      inner.rendered = true;
      return steer.dispatch.invoke(trajectory, signal, strategy)(inner);
    };

    await next();
  })
  .use(async (ctx, next) => {
    // shell cwd — deno task rewrites Deno.cwd() to repo root; INIT_CWD preserves user shell cwd
    const cwd = path.cwd();
    const recipe = await Deno.stat(new Path(cwd).branch("instance.viva.json").absolute).catch(() => null);
    if (recipe?.isFile) {
      paladin.env.set("VIVA_INSTANCE_MOUNT", cwd, "cwd");
      ctx.instance = await lifecycle.mount(paladin.instance);
    }
    await next();
  })
  // view surface dispatch :: --buffer hijacks scroll into a Chrome shell.
  // post-body :: --json dumps effect; --tree walks effect interactively.
  .use(async (ctx, next) => {
    const flags = ctx.signal.flags ?? {};
    let shell = null;

    // one ruling on whether this shell can prompt at all — pickers and wizards read it, never re-derive it.
    ctx.interactive = !flags.json && Deno.stdin.isTerminal() && Deno.stdout.isTerminal();

    const marking = (verb) => (...args) => {
      ctx.rendered = true;
      return view.scroll[verb](...args);
    };

    if (flags.buffer) {
      shell = view.buffer.shell();
      ctx.view = view.hijack(shell);
      ctx.rendered = true;
    } else {
      const emit = flags.json ? async () => (ctx.rendered = true) : marking("emit");
      const nature = ctx.signal.array.map((segment) => segment.nature).join("/");
      const render = ctx.interactive
        ? marking("render")
        : () => {
          throw new Error(`${nature}: needs a terminal — run it in one, or pass its inputs as parameters (viva help ${nature})`);
        };
      ctx.view = { ...view, scroll: { ...view.scroll, emit, render } };
    }

    // emission is the success path — a throw leaves through the exit site below, with nothing emitted here.
    try {
      await next();
      if (shell) await shell.untilExit(); // hold alt-screen until user presses esc/return
      if (flags.json) {
        console.log(JSON.stringify(ctx.effect, null, 2));
      } else if (!ctx.rendered && ctx.effect != null && !ctx.effect.error) {
        await view.scroll.emit({ data: ctx.effect }, null, Effect);
      }
    } finally {
      if (shell) shell.release();
    }
  });

trajectories(trajectory);

const argv = Deno.args.length ? [...Deno.args] : ["help"];
if (argv[0] === "--help") argv[0] = "help";

let signal = new ShellSignal(argv);
if (signal.flags?.help) {
  const nature = signal.array.map((segment) => segment.nature).join("/");
  const carried = Object.entries(signal.flags)
    .filter(([key]) => key !== "help")
    .map(([key, value]) => (value === true ? `--${key}` : `--${key}=${value}`));
  signal = new ShellSignal(["help", ...(nature ? [nature] : []), ...carried]);
}
const context = new ShellContext({ signal });

// the one exit: every failure — thrown, caught into ctx.error, or returned as an { error } effect —
// leaves through here with a status. one line for a human, the stack under --verbose, json under --json.
const fail = (error, { printed = false } = {}) => {
  if (error.code === "NOT_FOUND") {
    console.error("ghost: no handler for", signal.absolute.join(" "));
    console.error("try: viva help");
    Deno.exit(127);
  }
  if (!printed) {
    if (signal.flags?.json) console.log(JSON.stringify({ error: error.message }, null, 2));
    else console.error(signal.flags?.verbose ? error : `ghost: ${error.message}`);
  }
  Deno.exit(1);
};

try {
  const nature = signal.array.map((segment) => segment.nature).join("/");
  const node = census(trajectory).find((row) => row.nature === nature)?.params ?? [];
  // a bare flag is legal only where a boolean is declared — by the shell, or by the nature itself.
  const bare = new Set([
    ...Object.entries(flags.properties).filter(([, held]) => accepts(held, "boolean")).map(([name]) => name),
    ...node.filter((param) => param.type === "boolean").map((param) => param.name),
  ]);
  const demand = (name, shape, example) => {
    if (signal.flags?.[name] === true && !bare.has(name))
      throw new Error(`--${name} needs a value: --${name}=${shape}\ntry: viva ${nature} --${name}=${example}`);
  };

  for (const [name, held] of Object.entries(flags.properties)) demand(name, held.description, held.examples?.[0]);

  for (const [name, held] of Object.entries(config.mounts)) {
    demand(name, held.shape, held.example);
    const token = signal.flags?.[name];
    if (!is.string(token)) continue;
    const pinned = name === "instance" ? (await paladin.ledger.instances.resolve(token)).mount : path.pin(token);
    paladin.env.set(held.key, pinned, "flag");
  }

  for (const param of node) {
    if (param.group === "flags" && param.type !== "boolean") demand(param.name, param.description, param.examples[0]);
  }

  if (is.string(signal.flags?.env)) {
    const vars = await dotenv.load({ envPath: resolve(path.cwd(), signal.flags.env) });
    const keys = {
      public: (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"),
      secret: (key) => key.startsWith("SECRET_VIVA_"),
    };
    const held = object.filter(vars, keys.public);
    const secrets = object.filter(vars, keys.secret);
    if (!Object.keys(held).length && !Object.keys(secrets).length)
      throw new Error(`--env ${signal.flags.env}: no VIVA_* knowledge in it`);
    paladin.env.assign(held, ".env");
    paladin.secret.assign(secrets, ".env");
  }

  await steer.dispatch.invoke(trajectory, signal, strategy)(context);
  if (context.error) fail(context.error);
  if (context.effect?.error) fail(new Error(context.effect.error), { printed: signal.flags?.json === true });
} catch (error) {
  fail(error);
}
```

### `systems/ghost/prototypes/index.js`

```js
// systems/ghost/prototypes/index.js
export * from "./shellsignal.js";
export * from "./shellcontext.js";
```

### `systems/ghost/prototypes/shellsignal.js`

```js
// systems/ghost/prototypes/shellsignal.js
import { Signature, is } from "@vivalence/typology";

export class ShellSignal extends Signature {
  static coercions = [
    [
      (input) => is.array(input) && is.string(input[0]),
      function (input) {
        const [head, ...rest] = input;
        const segments = head
          .split("/")
          .filter((part) => part.length > 0)
          .map((nature) => ({ nature }));

        const params = [];
        const flags = {};

        for (const token of rest) {
          if (token.startsWith("--")) {
            const equals = token.indexOf("=");
            if (equals > 2) {
              flags[token.slice(2, equals)] = token.slice(equals + 1);
            } else {
              flags[token.slice(2)] = true;
            }
            continue;
          }
          params.push(token);
        }

        if (segments.length) {
          segments[0].params = params;
          segments[0].flags = flags;
        }

        return segments;
      },
    ],
  ];

  get absolute() {
    const path = this.array.map((segment) => segment.nature).join("/");
    const params = this.params ?? [];
    const flags = this.flags ?? {};

    const argv = [path];
    for (const param of params) argv.push(param);
    for (const [key, value] of Object.entries(flags)) {
      if (value === true) argv.push("--" + key);
      else argv.push("--" + key + "=" + value);
    }
    return argv;
  }

  get json() {
    const json = { nature: this.nature, absolute: this.absolute };
    if (this.params) json.params = [...this.params];
    if (this.flags) json.flags = { ...this.flags };
    if (this.trace?.json) json.trace = this.trace.json;
    return json;
  }
}
```

### `systems/ghost/prototypes/shellcontext.js`

```js
// systems/ghost/prototypes/shellcontext.js
import { ShellSignal } from "./shellsignal.js";

export class ShellContext {
  constructor(context = {}) {
    Object.assign(this, context);
    this.signal =
      this.signal instanceof ShellSignal ? this.signal : new ShellSignal(this.signal ?? []);
    this.effect = this.effect ?? null;
  }
}
```

### `systems/ghost/trajectories/help.js`

```js
// systems/ghost/trajectories/help.js
import { steer } from "@vivalence/typology";

export function census(trajectory) {
  return steer.trie.fold(trajectory, {
    node: (frame) => {
      const rows = frame.trajectories.flat();
      if (frame.effect === undefined) return rows;
      const nature = frame.steps.map((step) => step.nature).join("/");
      const params = Object.entries(frame.signature?.schema?.properties ?? {}).map(
        ([name, property]) => ({
          name,
          type: property.type ?? "string",
          group: property.group ?? null,
          examples: property.examples ?? [],
          description: property.description ?? "",
        }),
      );
      return [{ nature, valence: frame.signature?.valence ?? "", params }, ...rows];
    },
  });
}

export const accepts = (held, type) => held.type === type || (held.anyOf ?? []).some((one) => one.type === type);

// a flag that carries nothing prints bare; one that carries a value prints its shape.
export function flagged(schema) {
  return Object.entries(schema.properties).map(([name, held]) =>
    accepts(held, "boolean") && !accepts(held, "string") ? `--${name}` : `--${name}=${held.description}`
  );
}
```

### `systems/ghost/trajectories/instance/user.js`

```js
// systems/ghost/trajectories/instance/user.js
import paladin, { lifecycle } from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import * as jose from "jose";

const ACTIONS = ["signup", "login", "password"];

const operator = (secret) =>
  new jose.SignJWT({ type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

export async function user(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!ACTIONS.includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /instance/user <signup|login|password> <username> <password>" });
  }
  await lifecycle.mount(paladin.instance);
  const proof = action === "password" ? { operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) } : {};
  ctx.effect = await new Connection(paladin.instance.runtime.statics.remote).call(`/lighthouse/${action}`, {
    ...proof,
    username,
    ...(password && { password }),
  });
}
```

### `systems/ghost/belt/index.js`

```js
// systems/ghost/belt/index.js
export * as clone from "./clone.js";
export * as config from "./config.js";
export * as envfile from "./envfile.js";
export * as lens from "./lens.js";
export * as path from "./path.js";
export { pick } from "./pick.js";
export * as shape from "./shape.js";
export * as recipe from "./recipe.js";
```

### `systems/ghost/belt/config.js`

```js
// systems/ghost/belt/config.js
import { join } from "@std/path";

import paladin from "@vivalence/paladin";

// --instance is VIVA_INSTANCE_MOUNT at the flag stratum: the key, shorn of VIVA_ and _MOUNT.
const flag = (key) => key.slice("VIVA_".length, -"_MOUNT".length).toLowerCase();

// a MOUNT is always a path; --instance alone also takes a slug, resolved against the record at the pinhole (mod.js).
const WIDENED = { instance: { shape: "<slug|path>", example: "vivalence" } };

export const mounts = Object.fromEntries(
  Object.entries(paladin.mounts.properties).map(([key, held]) => {
    const name = flag(key);
    return [name, { key, shape: "<path>", example: held.examples[0], ...WIDENED[name] }];
  }),
);

// the shell config is a .env that must keep its `export ` prefix — so it upserts here, by line,
// the same way paladin.state.env does for every other .env in the system.
export async function writeShellConfig(key, value) {
  const dir = join(Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"), "viva");
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });

  const held = await Deno.readTextFile(file).catch(() => "");
  const line = `export ${key}="${value}"`;
  const pattern = new RegExp(`^[ \\t]*export[ \\t]+${key}[ \\t]*=.*$`, "m");
  const text = pattern.test(held)
    ? held.replace(pattern, () => line)
    : `${held ? held.replace(/\n*$/, "\n") : ""}${line}\n`;

  await Deno.writeTextFile(file, text);
  return file;
}
```


## kits — dapper tokens, sheets today

### `subsystems/dapper/mod.js`

```js
// subsystems/dapper/mod.js
export { design } from "./lib/system.js";
export { theme } from "./lib/theme.js";
export { emit, declarations } from "./lib/emit.js";
export { contrast } from "./lib/contrast.js";
export { TOKENS, scales } from "./lib/tokens.js";
export { THEMES } from "./themes/index.js";

export { plugin as postcssPlugin } from "./lifecycle/index.js";
export { tailwindClasses } from "./belt/tailwind-theme.js";
```

### `subsystems/dapper/lib/system.js`

```js
// subsystems/dapper/lib/system.js
import { scales } from "./tokens.js";
import { emit } from "./emit.js";
import { THEMES } from "../themes/index.js";

export const design = async () => ({
  themes: THEMES,
  output: { css: [scales(), ...Object.entries(THEMES).map(([name, held]) => emit(name, held))].join("\n") },
});
```

### `subsystems/dapper/lib/emit.js`

```js
// subsystems/dapper/lib/emit.js
import { v } from "@vivalence/typology";

const { STEPS, SIGNALS, ZONES, ground } = v.primitives.theme;

const NAME = /^[a-z][a-z0-9-]*$/;

const kebab = (key) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const bare = (number) => String(number).replace(/^0\./, ".");
const times = (factor) => `calc(var(--size-unit) * ${bare(factor)})`;
const space = (step) => `var(--size-space-${step})`;
const corner = (step) => `var(--shape-radius-${step})`;

const earth = (zone) =>
  Object.keys(ground).map((key) => [`--${kebab(key)}`, typeof zone[key] === "number" ? bare(zone[key]) : zone[key]]);

const shape = ({ shape: held, shadow }) => [
  ["--shape-relief", held.relief],
  ...[...STEPS, "full"].map((step) => [`--shape-radius-${step}`, held.radius[step]]),
  ...["key", "field", "card", "pill", "disc"].map((entity) => [`--shape-radius-${entity}`, corner(held.radius[entity])]),
  ["--shape-label-case", held.label.case],
  ["--shape-label-track", held.label.track],
  ["--shape-lift", `${held.lift} ${shadow}`],
  ["--shape-sunk", `${held.sunk} ${shadow}`],
];

const size = ({ size: held }) => [
  ["--size-unit", held.unit],
  ...STEPS.map((step) => [`--size-space-${step}`, times(held.space[step])]),
  ...STEPS.map((step) => [`--size-type-${step}`, held.type[step]]),
  ["--size-gap", space(held.gap)],
  ...Object.keys(held.pad).map((side) => [`--size-pad-${side}`, space(held.pad[side])]),
  ...["icon", "field"].map((role) => [`--size-${role}`, space(held[role])]),
  ["--size-row", times(held.row)],
  ["--size-key", times(held.key)],
  ["--size-leading-tight", bare(held.leading.tight)],
  ["--size-leading-loose", bare(held.leading.loose)],
  ["--size-ring", held.ring],
  ["--size-depth", held.depth],
];

const text = ({ text: held }) =>
  Object.keys(held).map((key) => [`--text-${kebab(key)}`, typeof held[key] === "number" ? bare(held[key]) : held[key]]);

const control = ({ control: held }) => Object.keys(held).map((key) => [`--control-${kebab(key)}`, held[key]]);

const signal = ({ signal: held }) =>
  SIGNALS.flatMap((name) => [
    [`--signal-${name}`, held[name].fill],
    [`--signal-${name}-ink`, held[name].ink],
    [`--signal-${name}-tint`, held[name].tint],
    [`--signal-${name}-on`, held[name].on],
  ]);

const brand = ({ brand: held }) => Object.keys(held).map((key) => [`--brand-${key}`, held[key]]);

const font = ({ font: held }) => Object.keys(held.family).map((key) => [`--font-family-${kebab(key)}`, held.family[key]]);

export const declarations = (zone) => [...earth(zone), ...shape(zone), ...size(zone), ...text(zone), ...control(zone), ...signal(zone), ...brand(zone), ...font(zone)];

const block = (selector, zone) =>
  `${selector} {\n${declarations(zone).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;

export const emit = (name, held) => {
  if (typeof name !== "string" || !NAME.test(name)) throw new Error(`[emit] not a theme name: ${JSON.stringify(name)}`);
  const root = `:root[data-theme="${name}"]`;
  return [block(root, held.zones[1]), ...ZONES.map((index) => block(`${root} [data-zone="${index}"]`, held.zones[Number(index)]))].join("\n");
};

export default emit;
```

### `subsystems/dapper/themes/index.js`

```js
// subsystems/dapper/themes/index.js
import northsea from "./northsea/theme.js";
import parchment from "./parchment/theme.js";
import porcelain from "./porcelain/theme.js";
import datasette from "./datasette/theme.js";

export const THEMES = { northsea, parchment, porcelain, datasette };
```

### `subsystems/dapper/themes/northsea/theme.js`

```js
// subsystems/dapper/themes/northsea/theme.js
import { theme } from "../../lib/theme.js";
import { iron, deep, aqua, moss, amber, rust } from "./gradients.js";

export default theme({
  shape:   { relief: "lift", radius: { key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs" } },
  text:    { header: iron[50], strong: iron[100], ink: iron[300], light: iron[400], muted: iron[500], link: aqua[200], code: amber[200] },
  control: { contrast: iron[700], contrastHover: iron[600], contrastPressed: iron[800], on: iron[100], onMuted: iron[400], onPressed: aqua[200],
             field: iron[950], fieldPlaceholder: iron[500], fieldCaret: aqua[300], focus: aqua[200], scrollbar: iron[700], divider: iron[800] },
  signal:  { primary:  { fill: aqua[300],  ink: aqua[200],  on: iron[950] },
             positive: { fill: moss[300],  ink: moss[200],  on: iron[950] },
             caution:  { fill: amber[300], ink: amber[200], on: iron[950] },
             negative: { fill: rust[300],  ink: rust[200],  on: iron[950] } },
  brand:   { glow: "inset 0 0 12px rgba(30, 188, 181, 0.2)", filter: `drop-shadow(0 0 4px ${aqua[300]})` },
  zones: {
    0: { surface: iron[900], surfaceSunk: iron[950], surfaceLift: iron[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    1: { surface: deep[900], surfaceSunk: deep[950], surfaceLift: deep[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    2: { surface: iron[950], surfaceSunk: deep[950], surfaceLift: iron[900], boundary: iron[850], boundaryStrong: iron[700], divider: iron[900], inverse: iron[200], dim: .5 },
    3: { surface: iron[850], surfaceSunk: iron[900], surfaceLift: iron[800], boundary: iron[700], boundaryStrong: iron[500], divider: iron[800],
         signal: { negative: { ink: rust[100] } } },
  },
});
```

### `subsystems/sheets/theme.js`

```js
// subsystems/sheets/theme.js
export const theme = {
  brand: "magenta",
  accent: "cyan",
  dim: "gray",
  ok: "green",
  warn: "yellow",
  bad: "red",
  name: "vivalence",
  short: "viva",
  tagline: "language learning OS",
  glyph: { mark: "✦", gutter: "│", active: "◆", done: "◇", pending: "○" },
};
```

### `subsystems/sheets/components/Logo.jsx`

```jsx
// subsystems/sheets/components/Logo.jsx
import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";

const Mark = () => (
  <Text color={theme.brand} bold>
    {theme.glyph.mark}
  </Text>
);

const Word = () => (
  <Text bold>
    <Text color={theme.brand}>viva</Text>
    <Text color={theme.accent}>lence</Text>
  </Text>
);

export function Logo({ variant = "word" }) {
  if (variant === "mark") return <Mark />;

  if (variant === "word") {
    return (
      <Box gap={1}>
        <Mark />
        <Word />
      </Box>
    );
  }

  if (variant === "banner") {
    return (
      <Box flexDirection="column">
        <Box gap={2}>
          <Text color={theme.brand} bold>
            {theme.glyph.mark} V I V A
          </Text>
          <Text color={theme.accent} bold>
            L E N C E
          </Text>
        </Box>
        <Text color={theme.dim}>{theme.tagline}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Mark />
        <Word />
      </Box>
      <Text color={theme.dim}>{theme.tagline}</Text>
    </Box>
  );
}
```

### `subsystems/sheets/components/Chrome.jsx`

```jsx
// subsystems/sheets/components/Chrome.jsx
import React from "react";
import { Background } from "./Background.jsx";
import { Logo } from "./Logo.jsx";

// chrome for view.buffer.render — bg + logo. Field/video bg later.
export function Chrome({ children }) {
  return (
    <Background>
      <Logo />
      {children}
    </Background>
  );
}
```


## rigs — opentui under Deno, Solid on both hosts, the m80 ghost walk

### `testament/prototypes/opentui/README.md`

````markdown
// testament/prototypes/opentui/README.md
# opentui — the m82 strand M · N probe rig (10-10)

```sh
cd testament/prototypes/opentui
npm i && npm i bun@1.3.0
patch -p0 node_modules/@opentui/core/chunk-node-tfvyz31s.js < opentui-core.patch   # 0.5.17 only
ln -sfn ../../ink-in-anima/node_modules/playwright-core node_modules/playwright-core

# strand M — React on OpenTUI
./node_modules/.bin/bun suite.jsx                                   # 16 scenarios, Bun
deno run -A suite.deno.jsx                                          # the same 16 under Deno, via deno-preload.js
deno run -A md.deno.jsx                                             # <markdown> · <code> (tree-sitter worker)
deno run -A remote.deno.jsx 4810 & node drive-remote.mjs 4810       # Deno → WebSocket → xterm.js (rejected route, Q11)

# strand N — Solid and React on both hosts
deno run -A solid/bundle.js solid/suite.jsx out/suite.solid.mjs solid opentui
deno run -A --config deno.mapped.json out/run.js                    # Solid × opentui, 16; --config deno.json shows the server-build freeze
for k in solid react; do for h in opentui dom; do deno run -A solid/bundle.js apps/lesson.$k.$h.jsx out/lesson.$k.$h.mjs $k $h; done; done
python3 -m http.server 4811 & deno run -A --config deno.ghost.json ghost/host.js http://127.0.0.1:4811   # ghost host, 8
node build-vendor.mjs …  && node drive-dom.mjs                      # anima host, 10 (vendor commands: m82 changelog)
```

`deno-ffi.js` is a `node:ffi` stand-in over `Deno.dlopen`; `deno-preload.js` installs it and makes `Worker` a module worker. The patch hands opentui the stand-in through `globalThis.__opentuiNodeFfi`.
````

### `testament/prototypes/opentui/deno.ghost.json`

```json
// testament/prototypes/opentui/deno.ghost.json
{
 "nodeModulesDir": "manual",
 "imports": {
  "solid-js": "./node_modules/solid-js/dist/solid.js",
  "solid-js/store": "./node_modules/solid-js/store/dist/store.js",
  "@opentui/solid": "npm:@opentui/solid@0.5.17",
  "@opentui/react": "npm:@opentui/react@0.5.17",
  "@opentui/core": "npm:@opentui/core@0.5.17",
  "@opentui/core/testing": "npm:@opentui/core@0.5.17/testing",
  "react": "npm:react@19.2.0"
 }
}
```

### `testament/prototypes/opentui/deno-preload.js`

```js
// testament/prototypes/opentui/deno-preload.js
import ffi from "./deno-ffi.js";
globalThis.__opentuiNodeFfi = ffi;
const WebWorker = globalThis.Worker;
globalThis.Worker = class ModuleWorker extends WebWorker {
  constructor(url, options = {}) {
    super(typeof url === "string" && url.startsWith("/") ? `file://${url}` : url, { type: "module", ...options });
  }
};
```

### `testament/prototypes/opentui/deno-ffi.js`

```js
// testament/prototypes/opentui/deno-ffi.js
const TYPES = {
  char: "i8", i8: "i8", u8: "u8", i16: "i16", u16: "u16", i32: "i32", u32: "u32", i64: "i64", u64: "u64",
  f32: "f32", f64: "f64", bool: "bool", pointer: "pointer", void: "void", string: "pointer",
  usize: "usize", isize: "isize",
};
const deno = (type) => {
  if (!(type in TYPES)) throw new Error(`deno-ffi: no Deno type for "${type}"`);
  return TYPES[type];
};
const encoder = new TextEncoder();

const address = (pointer) => (pointer === null ? 0n : BigInt(Deno.UnsafePointer.value(pointer)));
const pointerOf = (value) => {
  if (value == null) return null;
  if (typeof value === "bigint" || typeof value === "number") return value === 0n || value === 0 ? null : Deno.UnsafePointer.create(BigInt(value));
  if (typeof value === "string") return Deno.UnsafePointer.of(encoder.encode(`${value}\0`));
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return Deno.UnsafePointer.of(value);
  if (typeof value === "object") return value;
  throw new TypeError(`deno-ffi: not a pointer: ${typeof value}`);
};
const argument = (type) => (type === "pointer" || type === "string" ? pointerOf : type === "bool" ? Boolean : (value) => value);
const result = (type) => (type === "pointer" ? address : (value) => value);

export const suffix = Deno.build.os === "darwin" ? "dylib" : Deno.build.os === "windows" ? "dll" : "so";

export function dlopen(path, definitions) {
  const symbols = Object.fromEntries(Object.entries(definitions).map(([name, definition]) => [name, {
    parameters: definition.arguments.map(deno),
    result: deno(definition.return),
  }]));
  const library = Deno.dlopen(path, symbols);
  const callbacks = new Map();
  const functions = Object.fromEntries(Object.entries(definitions).map(([name, definition]) => {
    const native = library.symbols[name];
    const into = definition.arguments.map(argument);
    const out = result(definition.return);
    return [name, (...args) => out(native(...args.map((value, index) => into[index](value))))];
  }));
  const lib = {
    registerCallback(definition, callback) {
      const into = definition.arguments.map((type) => (type === "pointer" ? address : (value) => value));
      const unsafe = new Deno.UnsafeCallback(
        { parameters: definition.arguments.map(deno), result: deno(definition.return) },
        (...args) => {
          const value = callback(...args.map((each, index) => into[index](each)));
          return definition.return === "pointer" ? pointerOf(value) : value;
        },
      );
      const pointer = address(unsafe.pointer);
      callbacks.set(pointer, unsafe);
      return pointer;
    },
    unregisterCallback(pointer) {
      callbacks.get(pointer)?.close();
      callbacks.delete(pointer);
    },
    close() {
      for (const unsafe of callbacks.values()) unsafe.close();
      callbacks.clear();
      library.close();
    },
  };
  return { lib, functions };
}

export function toArrayBuffer(pointer, length) {
  return Deno.UnsafePointerView.getArrayBuffer(Deno.UnsafePointer.create(BigInt(pointer)), length);
}

export function getRawPointer(buffer) {
  return address(Deno.UnsafePointer.of(buffer));
}

export default { dlopen, toArrayBuffer, getRawPointer, suffix };
```

### `testament/prototypes/opentui/ghost/host.js`

```js
// testament/prototypes/opentui/ghost/host.js
import "../deno-preload.js";
import { createTestRenderer } from "@opentui/core/testing";

const origin = Deno.args[0];
const check = (name, pass, detail = "") => console.log(`${pass ? "PASS" : "FAIL"} ${name} :: ${String(detail).replaceAll("\n", " ⏎ ").slice(0, 170)}`);
const settle = async (setup) => {
  for (let index = 0; index < 4; index++) {
    await setup.renderOnce();
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const digest = async (bytes) => "sha256-" + btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))));

for (const kind of ["solid", "react"]) {
  const mount = `${origin}/out/lesson.${kind}.opentui.mjs`;
  const bytes = await (await fetch(mount)).arrayBuffer();
  const integrity = await digest(bytes);
  const { default: entry } = await import(mount);
  const setup = await createTestRenderer({ width: 60, height: 14 });
  const handle = entry(setup.renderer, { title: "ghost lesson" });
  await settle(setup);
  check(`${kind} × opentui: remote import + mount(renderer, props)`, setup.captureCharFrame().includes(`ghost lesson · ${kind}`), setup.captureCharFrame().trim().split("\n").slice(0, 3).join("\n"));
  setup.mockInput.pressArrow("down");
  setup.mockInput.pressArrow("down");
  await settle(setup);
  setup.mockInput.pressEnter();
  await setup.mockInput.typeText("bb");
  await settle(setup);
  const frame = setup.captureCharFrame();
  check(`${kind} × opentui: keys reach the component`, frame.includes("picked=japanese beats=2"), frame.trim().split("\n").filter((line) => line.includes("picked")).join(""));
  handle.destroy();
  await settle(setup);
  check(`${kind} × opentui: destroy empties the frame`, !setup.captureCharFrame().includes("ghost lesson"), setup.captureCharFrame().trim().slice(0, 60) || "(empty)");
  check(`${kind} × opentui: integrity computed over the served bytes`, integrity.startsWith("sha256-"), integrity);
  setup.renderer.destroy();
}
Deno.exit(0);
```

### `testament/prototypes/opentui/solid/bundle.js`

```js
// testament/prototypes/opentui/solid/bundle.js
import * as esbuild from "npm:esbuild@0.25.0";
import { transformAsync } from "npm:@babel/core@7.29.7";
import solid from "npm:babel-preset-solid@1.9.12";

const babel = (generate, moduleName) => ({
  name: `solid-${generate}`,
  setup(build) {
    build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
      const source = await Deno.readTextFile(args.path);
      const result = await transformAsync(source, {
        filename: args.path,
        configFile: false,
        babelrc: false,
        presets: [[solid, { generate, moduleName }]],
      });
      return { contents: result.code, loader: "js" };
    });
  },
});

const ROWS = {
  "solid opentui": { external: ["solid-js", "solid-js/store", "@opentui/solid", "@opentui/core"], plugins: [babel("universal", "@opentui/solid")] },
  "solid dom": { external: ["solid-js", "solid-js/web", "solid-js/store"], plugins: [babel("dom", "solid-js/web")] },
  "react opentui": { external: ["react", "@opentui/react", "@opentui/core"], jsx: "transform" },
  "react dom": { external: ["react", "react-dom", "react-dom/client"], jsx: "transform" },
};

const [entry, outfile, kind, host] = Deno.args;
const row = ROWS[`${kind} ${host}`];
if (!row) throw new Error(`no row for ${kind} × ${host}`);

const started = performance.now();
const result = await esbuild.build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: row.external,
  plugins: row.plugins ?? [],
  jsx: row.jsx ?? "preserve",
  metafile: true,
  minify: Deno.env.get("MINIFY") === "1",
  logLevel: "warning",
});
const bytes = Object.values(result.metafile.outputs).reduce((sum, output) => sum + output.bytes, 0);
console.log(`${kind} × ${host} → ${outfile} ${bytes} bytes ${Math.round(performance.now() - started)} ms`);
esbuild.stop();
```

### `testament/prototypes/opentui/apps/lesson.solid.opentui.jsx`

```jsx
// testament/prototypes/opentui/apps/lesson.solid.opentui.jsx
import { createSignal } from "solid-js";
import { render, useKeyboard } from "@opentui/solid";

const options = ["french", "german", "japanese"].map((name) => ({ name, description: name, value: name }));

function Lesson(props) {
  const [picked, setPicked] = createSignal("none");
  const [beats, setBeats] = createSignal(0);
  useKeyboard((key) => key.sequence === "b" && setBeats((n) => n + 1));
  return (
    <box style={{ flexDirection: "column", border: true, padding: 1, height: 12 }}>
      <text>{props.title} · solid</text>
      <select focused options={options} style={{ height: 6 }} onSelect={(_, option) => setPicked(option.value)} />
      <text>picked={picked()} beats={beats()}</text>
    </box>
  );
}

export default (renderer, props) => {
  render(() => <Lesson {...props} />, renderer);
  return { destroy: () => renderer.root.getChildren().forEach((child) => child.destroyRecursively()) };
};
```

### `testament/prototypes/ghost/ghost/session.js`

```js
// testament/prototypes/ghost/ghost/session.js
import { atom } from "nanostores";
import { call, parse } from "../runtime/tools.js";
import { greeting, script, speak } from "../runtime/harness.js";
import { id, place, wait } from "../runtime/runtime.js";

export class Session {
  $log = atom([]);
  $live = atom(null);
  $line = atom("");
  $busy = atom(false);
  $rail = atom("runtime");
  history = [];
  control = null;
  capture = null;

  constructor(rt) {
    this.rt = rt;
  }

  get thread() {
    return this.terminal.$thread.get();
  }

  get ctx() {
    return { terminal: this.terminal };
  }

  start() {
    const { rt } = this;
    const { instance } = rt;
    this.terminal = rt.terminal("ghost", rt.open());
    const hosting = instance.launch === "joined" ? `joined · pid ${instance.pid}` : `started inline · pid ${Deno.pid} · stops when you leave`;
    this.note(`✦ ${instance.slug} · ${instance.remote} · ${hosting} · ${rt.user.slug}`, "head");
    this.note(`── terminal ${this.terminal.id} · new thread ${this.thread.id} · on the runtime: no daemon, no mode`);
    this.note("   type to talk to the runtime · / its tools — the harness holds the same ones", "hint");
  }

  arrived(thread) {
    const turns = thread.$turns.get();
    this.note(`── on "${thread.$label.get() ?? "untitled"}" · ${place(null, thread.$mode.get())} · ${turns.length} turn${turns.length === 1 ? "" : "s"}${turns.length > 4 ? " · the last 4" : ""}`);
    for (const turn of turns.slice(-4)) this.log({ kind: "turn", turn, past: true });
  }

  log(entry) {
    this.$log.set([...this.$log.get(), { id: id() + id(), ...entry }]);
  }

  note(text, tone = "dim") {
    this.log({ kind: "note", text, tone });
  }

  async send(typed) {
    const text = typed.trim();
    if (!text) return;
    this.history.push(text);
    if (this.$busy.get()) return this.note("✕ a turn is still streaming — ctrl-c stops it", "bad");
    this.$busy.set(true);
    try {
      if (text.startsWith("/")) await this.manual(text);
      else await this.turn(text);
    } finally {
      this.$busy.set(false);
    }
  }

  async manual(text) {
    if (text === "/" || text === "/help") return this.log({ kind: "census" });
    const thread = this.thread;
    const before = thread.$mode.get();
    const { nature, input } = parse(text);
    const use = { type: "tool_use", id: id(), name: nature, input, manual: true };
    let result;
    try {
      result = { type: "tool_result", tool_use_id: use.id, content: await call(this.rt, this.ctx, nature, input) };
    } catch (error) {
      result = { type: "tool_result", tool_use_id: use.id, is_error: true, content: { message: error.message } };
    }
    this.log({ kind: "turn", turn: this.rt.append(thread, { role: "user", mode: before, parts: [use, result] }) });
    if (this.thread !== thread) return this.arrived(this.thread);
    await this.follow(thread, before);
  }

  async turn(text) {
    const thread = this.thread;
    const before = thread.$mode.get();
    this.log({ kind: "turn", turn: this.rt.append(thread, { role: "user", mode: before, parts: [{ type: "text", text }] }) });
    if (/\berror\b|\b500\b/.test(text)) {
      await wait(400);
      return this.note("✕ 500 — [hallucination] SECRET_VIVA_ANTHROPIC_API_KEY is blank, the anthropic hallucinator is dormant — viva instance/doctor", "bad");
    }
    await this.stream(script(before, text));
    await this.follow(thread, before);
  }

  async stream(segments) {
    const thread = this.thread;
    this.control = { stopped: false };
    let last = null;
    for await (const turn of speak(this.rt, this.ctx, segments, this.control)) {
      last = turn;
      this.$live.set(turn);
    }
    this.$live.set(null);
    if (last?.parts.length) this.log({ kind: "turn", turn: this.rt.append(thread, last) });
    if (this.control.stopped) this.note("   ▪ stopped");
    this.control = null;
    if (this.thread !== thread) this.arrived(this.thread);
  }

  async follow(thread, before) {
    if (this.thread !== thread) return;
    const after = thread.$mode.get();
    if (after && after !== before && greeting(after)) await this.stream(greeting(after));
  }

  stop() {
    if (!this.control) return false;
    this.control.stopped = true;
    return true;
  }

  leave() {
    const thread = this.thread;
    this.rt.release(this.terminal);
    const anima = this.rt.$anima.get();
    return {
      thread: thread.$label.get() ?? `untitled ${thread.id}`,
      turns: thread.$turns.get().length,
      anima: anima.status === "RUNNING" ? `anima still running · ${anima.remote}` : null,
      runtime: this.rt.instance.launch === "joined" ? `${this.rt.instance.slug} still running` : `${this.rt.instance.slug} stopped`,
    };
  }
}
```

### `testament/prototypes/ghost/ghost/Dock.jsx`

```jsx
// testament/prototypes/ghost/ghost/Dock.jsx
import { Box, React, Text, TextInput, theme, useInput, useState } from "@vivalence/sheets";
import { tool, TOOLS } from "../runtime/tools.js";
import { useStore } from "./store.js";

const hints = (held) => held.params.map((param) => param.hint).join(" ");

export function palette(rt, typed) {
  if (!typed.startsWith("/")) return { rows: [], complete: null };
  const space = typed.indexOf(" ");
  if (space < 0) {
    const hits = TOOLS.filter((held) => held.nature.startsWith(typed));
    const loose = hits.length ? hits : TOOLS.filter((held) => held.nature.includes(typed.slice(1)));
    return { rows: loose.map((held) => ({ word: held.nature, sign: hints(held), says: held.valence })), complete: loose[0] ? `${loose[0].nature} ` : null };
  }
  const held = tool(typed.slice(0, space));
  if (!held) return { rows: [{ word: `✕ ${typed.slice(0, space)}`, sign: "", says: "no such tool — / lists them" }], complete: null };
  const rest = typed.slice(space + 1);
  const candidates = (held.suggest?.(rt) ?? []).filter((candidate) => !rest || candidate.startsWith(rest) || candidate.includes(rest));
  if (!candidates.length || candidates[0] === rest) return { rows: [{ word: held.nature, sign: hints(held), says: held.valence }], complete: null };
  return { rows: candidates.map((candidate) => ({ word: candidate, sign: "", says: "" })), complete: `${held.nature} ${candidates[0]}` };
}

const HINT = {
  captured: "⏎ send · / tools · tab complete · ↑ history · ctrl-f chrome · esc leave",
  chrome: "⏎ send · / tools · ↑↓ on an empty line walks the rail, ⏎ acts · esc captured",
  live: "ctrl-c stop · esc leave",
};

export function Dock({ session, controller, face, shift }) {
  const { rt, terminal } = session;
  const daemon = useStore(terminal.$daemon);
  const thread = useStore(terminal.$thread);
  const mode = useStore(thread?.$mode);
  const live = useStore(session.$live);
  const line = useStore(session.$line, "") ?? "";
  const [generation, setGeneration] = useState(0);
  const [back, setBack] = useState(0);
  const options = palette(rt, line);

  const put = (value) => {
    session.$line.set(value);
    setGeneration((at) => at + 1);
  };

  useInput((input, key) => {
    if (key.ctrl && input === "f") return shift(face === "chrome" ? "captured" : "chrome");
    if (key.ctrl && input === "c") return session.stop() || controller.kill("SIGTERM", "ctrl-c");
    if (key.escape) return face === "chrome" ? shift("captured") : controller.kill("SIGTERM", "esc");
    if (key.tab && options.complete) return put(options.complete);
    if (face === "chrome" && !line) return;
    if (key.upArrow && session.history.length) {
      const next = Math.min(back + 1, session.history.length);
      setBack(next);
      return put(session.history.at(-next));
    }
    if (key.downArrow && back) {
      setBack(back - 1);
      return put(back - 1 ? session.history.at(-(back - 1)) : "");
    }
  });

  const submit = (typed) => {
    if (!typed.trim()) return;
    put("");
    setBack(0);
    session.send(typed);
  };

  const shown = options.rows.slice(0, 6);
  const width = Math.max(0, ...shown.map((row) => `${row.word} ${row.sign}`.length));
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={theme.accent}>{mode ? `${mode.daemon}/${mode.slug}` : daemon ?? "runtime"} › </Text>
        <TextInput key={generation} value={line} onChange={(value) => session.$line.set(value)} onSubmit={submit} prompt="" />
      </Box>
      {shown.length ? (
        <Box flexDirection="column">
          {shown.map((row, at) => (
            <Text key={row.word} wrap="truncate-end">
              <Text color={at ? theme.dim : theme.accent}>{at ? "  " : "⇥ "}{row.word}</Text>
              <Text color={theme.dim}>{` ${row.sign}`.padEnd(width - row.word.length + 2)}{row.says}</Text>
            </Text>
          ))}
          {options.rows.length > 6 ? <Text color={theme.dim}>  … {options.rows.length - 6} more</Text> : null}
        </Box>
      ) : <Text color={theme.dim}>{live ? HINT.live : HINT[face]}</Text>}
    </Box>
  );
}
```


## commons — the recipe and the one harnessed mode the demo talks to

### `commons/ledger/ledger.viva.json`

```json
// commons/ledger/ledger.viva.json
{
  "instances": "./instances.json",
  "registry": "./registry.json",
  "environment": "./environment.json",
  "runtime": {
    "statics": { "serve": "${VIVA_RUNTIME_SERVE}", "remote": "${PUBLIC_VIVA_RUNTIME_REMOTE}" },
    "modes": ["@commons/home/home"]
  },
  "lighthouse": { "secrets": { "jwt": "${SECRET_VIVA_JWT}" }, "traits": ["OPEN"] },
  "datamap": { "module": "@commons/datamap/libsql" },
  "hallucinators": [
    { "module": "@commons/hallucinator/anthropic", "secrets": { "key": "${SECRET_VIVA_ANTHROPIC_API_KEY}" } },
    { "module": "@commons/hallucinator/openrouter", "secrets": { "key": "${SECRET_VIVA_OPENROUTER_API_KEY}" } }
  ],
  "clients": [{ "manifest": { "type": "client", "slug": "anima" }, "statics": { "serve": "${VIVA_CLIENT_ANIMA_SERVE}" }, "home": "/runtime/runtime/mode/home/home" }]
}
```

### `commons/instances/hello-world/instance.viva.json`

```json
// commons/instances/hello-world/instance.viva.json
{
  "manifest": { "type": "instance", "slug": "hello-world", "version": "0.0.1" },
  "daemons": [
    {
      "manifest": { "type": "daemon", "slug": "hello", "version": "0.0.1" },
      "modes": ["./mode.viva.js"],
      "consume": { "reader": { "module": "@commons/service/reader" } }
    }
  ]
}
```

### `commons/instances/hello-world/mode.viva.js`

```js
// commons/instances/hello-world/mode.viva.js
import { App, Vector, shard } from "@vivalence/typology";
import { doctor, doors, persona, research, web } from "./tools/index.js";
import { harness as voice } from "./harness.js";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: [
    "HARNESSED",      // mode has access to the daemon's harness
    "CONVERSATIONAL", // mode can be chatted with
    "TOOLING",         // mode provides agentic tools

    "EMITTER",        // mode renders ad-hoc buffers
    "APPLICATION",    // buffers from static svelte
    "GENERATIVE",     // buffers hallucinated at runtime

    "EXPOSED",        // mode serves http endpoints
  ],
};

export const tools = new Vector()
  .graft(doctor)
  .graft(web)
  .graft(research);

export const application = new App("./app/App.svelte");

export const aperture = new Vector()
  .use(async (ctx, next) => {
    console.log(ctx.user.id, "calling", ctx.mode.manifest.slug);
    await next();
  })
  .open("/hello/bot", () => ({ greeting: "Bot says high." }))
  .open("/hello/agent", persona)
  .graft(doors);

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "capable", rounds: 10 }, settings: { effort: "low" } }))
  .graft(voice);
export { emitter, generator } from "./page/index.js";
```

### `commons/instances/hello-world/harness.js`

````js
// commons/instances/hello-world/harness.js
import { Vector } from "@vivalence/typology";
import { machine, standing } from "./tools/index.js";
import { RENDER } from "./page/style.js";

export const HELLO = [
  "You are the vivalence hello-world demo, talking to the operator of this machine.",
  "Two or three plain sentences unless the answer genuinely needs more.",
  "",
  "Every reply is a budget: at most THREE tool calls, then answer. A call that returned nothing useful is an answer too — say so, do not call again with the same input. Never repeat a call you already made in this thread.",
  "",
  "Work each reply in this order:",
  "1. LOOK. What this machine IS you already have below. For anything deeper — a variable, another instance, a registered module, a dormant slot — pull the whole record with viva_doctor, ONCE. For a fact about the world, web_search ONCE, then web_read the one article that is the subject if you mean to quote it. That is the whole lookup: at most two calls.",
  "2. DECIDE. No tool. Is this an answer, a page, or research? An answer is prose. A page is one draw. Research is when the operator wants something looked into AND kept — read up on X, write me a page about Y.",
  "3. ACT, one call. Answer in prose. Or draw ONCE with generator_view_render — the HOUSE RULES below are the whole contract for what it may contain; do not draw unasked. Or hand research to the research tool in ONE call with the whole brief: it searches, reads and draws by itself and returns what it learned, so answer from that. One research call per subject, never one per question, never in a loop.",
  "4. CHANGE, only when asked. A page the operator wants changed — more detail, a section, a fix — is ONE generator_view_revise on the same page, never a second draw; generator_view_inspect gives you its source back, generator_view_list the pages on this thread.",
  "",
  "Anything about the world comes from Wikipedia: web_search finds the article, web_read opens it and hands you its links and images. Quote only an article you opened, and name it. Never guess a slug, a mount or a key.",
  "A picture on a page is a src copied BYTE FOR BYTE from web_read's `images` — a Wikimedia thumbnail is served only at the width you saw it at.",
].join("\n");

// everything drapes' Markdown parses, and nothing it does not — markdown.js:6-12.
export const FORMAT = [
  "The dock renders markdown: # heading through ######, **bold**, *italic* or _italic_, `code`, [text](https://url), > quote, - bullet or 1. numbered, --- rule, ```lang fenced blocks, and | pipe | tables | above a |---|---| row.",
  "Nothing else renders — no images, no HTML, no strikethrough, no footnotes, no task boxes — so reach for a list or a table only when the answer is genuinely shaped like one.",
].join("\n");

export const harness = new Vector();

harness.use(async (ctx, next) => {
  ctx.hallucination.system.hello = HELLO;
  ctx.hallucination.system.machine = machine(standing(ctx));
  ctx.hallucination.system.render = RENDER;
  await next();
});

// the dock is the only reader of prose — an object or verbatim call has no markdown to render.
harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.format = FORMAT;
  await next();
});
````

### `commons/modes/home/home.viva.js`

```js
// commons/modes/home/home.viva.js
import { Vector } from "@vivalence/typology";

export const manifest = {
  type: "home",
  slug: "home",
  name: "Home",
  description: "The runtime's home — a plain dialogue a client lands in when no mode is picked. A test dummy until m84 grows its harness.",
  version: "0.0.1",
  traits: ["HARNESSED"],
};

export const HOME = [
  "You are the home of this vivalence runtime, talking to its user.",
  "Two or three plain sentences unless the answer genuinely needs more.",
].join("\n");

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.home = HOME;
  await next();
});
```
