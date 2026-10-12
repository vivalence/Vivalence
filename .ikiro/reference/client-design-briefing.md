<!-- writer: agent · reference, uncapped · written 2026-10-16 against the working tree after m86 landed (`0b14b1356 snap` + uncommitted) · a DESIGN BRIEFING for a design agent: every claim cites file:line, repo-rooted (`~/.viva/registry/…` for registry packages) · re-read the code before trusting a line number · companions: reference/anima.md (dated), reference/design.md, reference/tty-render.md, reference/tui.md, quests/done/m86-repl-loop-clients.org (the law), quests/m89-telemetry.org -->
# the client — a design briefing

beef, 10-16: /"I want a coherent client architecture such that someone who works in the OpenTUI in our TUI and then switches to the Anima that it's coherent thing. They feel right at home. It makes sense to them. And then that authentication flows and such are all aligned."/

/"The reason we didn't have a cohesive UI was because we didn't have any cohesive client architecture. Now, with the REPL, we do have that."/

**How to read.** Four parts. Part I is the architecture and the story: read it whole. Part II is the two clients and the kit as they stand on 10-16, measured file by file: read §4 and §5 for the action tables, skim the rest as a dictionary. Part III is what the runtime offers a client (rows · routes · streams · auth · dev · telemetry): the designer's source of truth for what a control CAN do. Part IV is the brief proper: the gaps, the open questions, and the screens to mock. Every claim carries a `file:line`; `~/.viva/registry/…` paths are registry packages, everything else is repo-rooted. Line numbers drift: re-read before trusting one.

Census agents (10-16, each wrote its section against the live tree): `ghost-census` (§4, ran `viva --help` and all five ghost suites one-shot, green) · `anima-census` (§5, by read; anima does not build) · `drapes-census` (§6 · §7 · §12, ran the drapes suite: 24 passed, 1 failed on `./dom`) · `runtime-census` (§9 · §10 · §11 · §13) · `history-census` (§2 · §3).

| part | § | what |
|---|---|---|
| I · the architecture | 0 | the ask |
| | 1 | the ring: a REPL client |
| | 2 | the design story: timeline · his rulings · the REPL in his words |
| | 3 | the vocabulary |
| II · the clients today | 4 | ghost: boot · nouns · repl · chrome · dev · tests · every action · gaps |
| | 5 | anima: boot+auth · bones · panels · stores · entities · telemetry · keys · design system · every action · RED |
| | 6 | drapes · dapper: the kit, the Frame contract, the zone tokens, why `./dom` is red |
| | 7 | buffers: the row · the face table · compile · creation · `$data` flow · write-back · lifecycle · verbs |
| | 8 | the two-face contract: one `App`, two faces, one bag |
| III · the runtime side | 9 | entities, one block each, with a row |
| | 10 | apertures · dispatch · turn streaming |
| | 11 | auth: the lighthouse, the flows, the credential store |
| | 12 | inline components in turns · the bundler question |
| | 13 | dev modes · telemetry · logging · processes |
| | 14 | the ledger |
| IV · the brief | 15 | gaps, consolidated |
| | 16 | open questions, each tied to a ruling |
| | 17 | the screens to mock |


# I · the architecture

## 0 · the ask

Two clients exist. **ghost** (`systems/ghost/`) is the terminal client: a Deno process, an OpenTUI chrome, a REPL. It was rebuilt in m86 (landed 10-16) and IS the client architecture: one dispatch ring, nouns as directories, a dock and a frame. **anima** (`systems/anima/`) is the browser client: a SvelteKit SPA on `:1794`, built across m62–m82, rolled back 10-12, and today does not compile (`src/typology/entities/buffer.js:2` imports a `View` that left typology). It carries the richer SURFACE: panels, cards, a pincer, a crown, device controls (microphone · speaker), a telemetry inspector, a login cover.

The ask to the designer: **mockups for ONE client that wears two faces** — a TTY face (ghost) and a DOM face (anima) — over the SAME architecture: the same nouns, the same verbs, the same dock, the same frame, the same auth flow, the same development affordances. Not two apps that look alike; one app with two renderers. The mode authors already build this way: a mode ships a `dom.svelte` and a `tty.solid` face over one buffer schema (§9). The client around them must do the same.

What is settled (do not redesign): the ring (§1), the vocabulary (§3), the entities and their rows (§9), the verbs as they exist (§4 table, §10), the mode traits and the two-face App contract (§8), the ledger as the source of hosts (§14). What is measured and broken (fix, do not design around): §5 RED, §6 `./dom`, §15. What is open (design it): §16, then draw §17.

## 1 · the architecture: a REPL ring

The client is a read–eval–print loop. A line enters at the dock. It becomes a `ReplSignal`. It is dispatched through ONE composed Vector built on every line from the client's verbs, the hosted modes' verbs, the active terminal's verbs, and every mounted mode's verbs scoped under its name. The effect's output goes back to the dock as a `message`. A throw is a `fault`. The bare line (no leading `/`) is the terminal's `turn` — a chat message to the HARNESSED mode the terminal sits in — and streams back as `turn` · `stream` events. Rows (threads, turns, buffers, modes, daemons) never pass through the repl: they arrive by subscription on their own channel, and the frame and the dock render STATE.

```text
// .ikiro/quests/done/m86-repl-loop-clients.org — the ring, locked 10-15
dock signal ──▶ new ReplSignal(signal)                    bare text → { nature: "*", body: [{ type: "text", text }] } · "/x y" → verb
          ──▶ client.dispatch(signal)                   an active terminal → terminal.dispatch(line); none → the client's own line
          ──▶ terminal.dispatch(signal)                 shard.repl.dispatch(client, terminal, line)
          ──▶ shard.repl.execution                    (replDie, next): controller.open · message · resolving
                controller:    the line's branch — terminal.controller or the client's, at signal.pathname
                repl:          shard.repl.compose(client, terminal) = new Vector().graft(client.repl, …hosted[*].repl, terminal.repl, …mounted[*].repl SCOPED under /mode/<type>/<slug> AND /mode/<slug>, terminal/turn when terminal.mode is HARNESSED)
                               built ON EVERY LINE; nothing of the terminal's without a terminal
                resolving:     steer.dispatch.execute(replDie.repl, replDie, signal) → replDie.output
                message:       output !== undefined → controller.stdout.message(output)      a throw → the fault on the line's branch, the line settles FAILED
replDie = { signal · client · runtime · terminal · controller · repl · output }        contexts.Repl, nothing else
dock  = client.controller.stdout.tail("message", "fault", "turn", "stream")           every terminal's and thread's span sits under the client's; journal order
dataspace = its own channel: rows arrive by subscription, the frame and the dock render STATE; nothing of it passes the repl
```

```js
// systems/ghost/typology/gestalten/shard/repl.js:17
export const scoped = (mode) => {
  const vector = new Vector();
  vector.branch(`/mode/${mode.type}/${mode.slug}`, mode.repl);
  vector.branch(`/mode/${mode.slug}`, mode.repl);
  return vector;
};
```

Three consequences a designer must hold:

1. **Every control is a line.** A button, a key chord, a menu item, a click on a row: each is sugar for a `/verb words` line entering the ring. The dock can therefore SHOW every action as the line it was, and a user who learns the line in the browser can type it in the terminal. The `/help` verb lists the composed repl — the menu IS the help.
2. **Two channels, two surfaces.** The DOCK is the journal of the repl (messages · faults · turns · streams, in time order). The FRAME is the state of the active buffer (a mode's face mounted over a buffer row, or the Floor: a JSON tree of `buffer.data`). Rows never enter the dock; lines never enter the frame.
3. **A terminal is the seat.** One client, N terminals; each terminal sits in ONE mode and optionally holds ONE thread; its verbs come and go with the mode it sits in. Switching mode = `/mode <type>/<slug>`; starting the face = `/application/start`.

## 2 · the design story

> Written 10-16 by `history-census` for a design briefing. Sources: `.ikiro/quests/**`, `.ikiro/reference/**`, `.ikiro/world/codemap/**`, `.ikiro/codestyle.md`, `.ikiro/release.md`, `.ikiro/known-issues.org`, `jj log`. Quotes are beef's, verbatim (`/"…"/`). A `file:line` is container-rooted under `/Users/finn/vivalence/code/vivalence/`; quest paths are under `.ikiro/quests/`.

The story in one paragraph. Vivalence started with a browser client (kajuit → anima, SvelteKit) and a CLI (ghost, `viva`). Anima grew a gesture-driven chassis: a T-bone of bones (crown · spine · shoulder) around a draggable pincer, panels A–H, a dock for chat, a frame for a mode's buffer. A zoned token system (m72) and a designer's comps (m73) set its skin. Then the runtime was rebuilt under it (m80 put the lighthouse inside the runtime; m81 made modes run on the runtime too), and anima's daemon-first model stopped fitting (147 sites, m82 terrain). m82 settled the BUNDLE (mime-negotiated buffer faces, `dom`/`tty`) and in phase two ruled the client a **REPL with chat built in**, Emacs-style. m86 built that REPL in ghost on OpenTUI/Solid, five passes, ending noun-major (10-16). Anima was not migrated and does not build. The pincer and the panels are parked, not killed.

---

### timeline

| date | quest · change | decision |
|---|---|---|
| 2026-03-29 | `done/kajuit_client-layout.quest.org` | mobile-first viewport and keyboard management for the browser client (then called kajuit) |
| 2026-03-30 | `done/ghost_ghost-client.quest.org` | ghost = operator interface: /"One trajectory tree, three presentation layers: human REPL, agent JSON, MCP stdio"/; command vs session mode |
| 2026-04-05 | `done/client-typology.quest.org` | the client typology is reorganized |
| 2026-04-06 | `done/terminal-first-client.quest.org` | **terminal-first**: /"Everything is a terminal. Login is a command. The lobby is a command. … The REPL is the shell."/ The REPL is terminal 0. This is the first REPL client, six months before m86 |
| 2026-04-07 | `done/pincer.quest.org` | **the T-bone**: crown + spine + viket/pincer; panels A (header/nav) · B (left rail) · C (stage: D inspector, E work surface, F aux) · G (system tray overlay) · H (dev console overlay); a serializable layout blob; a 4-bone model `shoulder · crown · pincer · spine` |
| 2026-04-11 | `done/intent-as-template.quest.org` | intent as a template (DONE) |
| 2026-04-12 | `discarded/decorum.quest.org` | zone-based theming, first try (DESIGN, discarded; m72 later did it) |
| 2026-06-21 | `done/c-panel-rebuild.quest.org` | panel C rebuilt: D/E/F, the `/metadata` self-description surface, the masked · aimed · queueing trait controls |
| 2026-06-22 | `done/conversation-dock-recast.quest.org` | the dock moved per terminal; its gate rotated `CONVERSATIONAL` → `HARNESSED` |
| 2026-07-03 · 07-04 | `done/m16_…` · `done/m17_client_ctx_grammar.quest.org` | client provisioning; /"context is the source, props are the fallback"/ |
| 2026-07-11 · 07-12 | `done/multiplex.quest.org` · `done/m18_conversation_dissolves.quest.org` | one multiplex socket per daemon; /"a dialogue is a streaming request"/ (the Conversation prototype dies) |
| 2026-07-17 | `done/m19_generative_views.quest.org` | /"bundle is the primitive"/ (first time) |
| 2026-08-11 | `done/m30-kajuit-performance.org` | /"the client that recomputes the world"/ |
| 2026-09-07 | `benched/m54-buffer-file.org` | the desk: a FILE trait on buffer and literal; /"anima/drapes render a FILE buffer by MIME, domain-blind"/ |
| 2026-09-09 | `discarded/m56-the-pincer-turns.org` | /"a bone reads its own rect, and panel C stops being a triptych"/; beef struck the wireframes' fixed terminal: /"terminal should absolutely dock and close. bullshit"/ |
| 2026-09-17 | `benched/m55-recursive-buffer-frames.org` · `done/m58-application-noun.org` M3 | /"thread is daemon. terminal is client!! thats the surface. no overlap."/ · `kajuit` → `anima` |
| 2026-09-28 | `done/m72-zoned-designs.org` · git `72acf68d1` "new anima, pincer, tbone, dapper, and drapes" | **zones**: four numbered territories, 0 chrome · 1 body · 2 island · 3 bench, depth inside each (surface · sunk · lift) |
| 2026-09-28 → 09-30 | `done/m73-anima-and-design-system-comps.org` | the designer's Anima + Design System comps ported onto zones; a drapes kit of one part per recipe; the pincer's radial, walls, throw |
| 2026-10-01 → 10-03 | `done/m76-terminals-close-the-dataring.org` · git `05fd45086` | Terminal moves to the lighthouse beside Identity · Authentication · Authority; /"anima keeps only state, no entities"/ |
| 2026-10-03 | git `e96261a30` / jj `wpmyssqo` "client rewrite turning into runtime rewrite" | the client rewrite turned into the runtime rewrite |
| 2026-10-04 → 10-06 | `m79-terminal-ghost.org` (benched 10-10) | **viva becomes a client**: commands · references · yap on one trajectory; cut · captured · chrome; credentials file; comp `Ghost Shell.dc.html`; `reference/ghost-architecture-comparison.md` (10-05) |
| 2026-10-06 | `discarded/anima-panels-cards.org` | rails B and C as cards from `Panels.dc.html`: /"rework the b and c panels for this design. its a massive simplifiation."/ (built; discarded 10-10) |
| 2026-10-07 → 10-08 | `done/m80-lighthouseless.org` · git `0b14b1356` / jj `uzqmrktw` | **lighthouse into the runtime**, one datamap, one userspace; /"The clients are pretty shit at the moment anyways"/ |
| 2026-10-09 → 10-10 | `done/m81-runtime-harness.org` | a mode runs on either rung; the runtime's harness is its first mode; /"(ctx, next) → shard. (die, next) → lifecycle"/ |
| 2026-10-10 | `done/m82-runtime-clients.org` phase one | **the bundle**: `View` → `Bundle`, entries by mime, targets `dom` · `tty`, `kind` dead; ink killed, OpenTUI/Solid for ghost |
| 2026-10-10 | m82 phase two | three attempts → **the synthesis: a REPL process**, named `Loop`; the demo designed; the pincer PARKED |
| 2026-10-10 | jj `vrkoppuw` "m82 clients — the demo on both targets" | the demo cut on both targets |
| 2026-10-10 | `m85-tauri-clients.org` (empty) · `m87-bundled-modes.org` (one line) · `reference/tauri-deno-demo.md` | beef's strands, unopened |
| 2026-10-11 | `m86-repl-loop-clients.s1.org` LANDED | die · loop · surfaces · **dock only**; `surface` not `target`; anima from scratch on `@vivalence/ghost` + `drapes/dom` (ruled, not done) |
| 2026-10-12 | **the rollback** — `.s2.org` step 0 | every "LANDED 10-10" piece lived only in `vrkoppuw`; beef restored typology · paladin · runtime · commons · dapper · drapes · sheets from it (`Added 143 files, modified 130 files, removed 30 files`); ghost rebuilt; anima NOT (`known-issues.org` `anima-imports-view-from-typology`: /"client wasnt migrated"/); old clients under `testament/m82-clients-20261012/`; jj `mmmzqsyp` "snap" 10-12 |
| 2026-10-12 | `.s2.org` LANDED | ONE client, TWO vectors (shell · repl), chrome as the rendering of the repl; `@memo` the one fixture; lighthouse traits `OPEN` → `JOINABLE`, `+AUTOLOGIN`, `INVITED` → `INVITATIONAL` (`release.md:76-78`) |
| 2026-10-12 | `m89-telemetry.org` DESIGNED | /"telemetry we call it. not logging!"/; F1–F10 open |
| 2026-10-13 | `done/m90-signal.org` LANDED | every signal is `{ nature, body, flags }`; `Argv` · `ReplSignal` in ghost |
| 2026-10-14 | `m88-repling.org` DESIGNING | client modes; HOME; the `REPLING` trait |
| 2026-10-15 | `.s3.org` DESIGNED | the interview: the ring locked |
| 2026-10-16 | `.s4.org` HISTORY | layer-major, rulings s4-1 … s4-30, 43 marks |
| 2026-10-16 | `m86-repl-loop-clients.org` LANDED on /"go m86"/ | **noun-major**: `systems/ghost/typology/<noun>/`; rulings s4-31 … s4-42 |

---

### beef's rulings on the client, grouped

#### domain-blind client

- /"nothing domain or mode specific can be loaded rendered or run on the client"/ — `codestyle.md` (was `world/codemap/invariants.md:17`). The law: domain words arrive as DATA, mode UI only through the APPLICATION bundle.
- m82 O: /"meh fuck it. we dont reuse apps across render targets. lets keep it simple."/
- m82 R: /"i dont liike the duplicate of mime and kind. why not jsut mime?"/ · /"other way round. group.target.framework"/ · /"dom and tty."/

```js
// release.md:81 — the served artifact per mime entry
/attached/bundle/<host>/<mode>/<hash>.<target>.<framework>.mjs
```

#### the buffer row IS the screen

- /"state should include my current sleecteds!"/ — selection · cursor · draft go into `buffer.data` (`codestyle.md`).
- m82 K: /"the bundle as it lives on the buffer or mode is the JSON serialized representation of that prototype and the prototype facilitates the function of negotiation and integrity checking … It's a thing in motion"/

#### dock, and the dock as the log area

- s1 H: /"its tiling, notebook, canvas, dock we now build only dock i think."/ · /"this is way too smalll / incoherent. the views are underdeveloped rn. we stick to just dock."/
- s3 r5: /"dataspace shit like subs dont go through the fucing repl"/ · /"logging via controller.stdout. effects via dataspcae."/
- s3 r6: /"we can create a new meessage trace on spans. dock renders message spans intertwined with turns."/ · s3 #6: /"only those two now"/ (messages ⊕ turns).
- s3: /"we just pipe out of the controller at the right level with a message filter. easy."/

So in ghost the dock IS a log: every message and fault of every terminal's span, in journal order, with turns among them.

```js
// .ikiro/quests/done/m86-repl-loop-clients.org:42 (the law)
dock  = client.controller.stdout.tail("message", "fault", "turn", "stream")           every terminal's and thread's span sits under the client's; journal order
```

Old anima kept a separate bench: zone 3 = /"inspector (panel H) · logger · debug"/ (`reference/design.md` §2). In m73 beef asked: /"mark whre you DROP features. f.e. new design says nothing about telemetry panels. and the dock is losing its meta."/ The live ghost chrome toggles a console on a backtick (`.s4.org:66`). m89 owns where telemetry shows.

#### the REPL as the client architecture

- m82 Z: /"I'm thinking of the clients a little bit like a REPL … not as a chat interface, but as a REPL that has chat built in. So like Emacs is a client built into the Lisp REPL."/
- /"I really like the REPL paradigm. Fuck yes."/
- m82 T: /"the way that we will conceptualize our client should be the same way that we have in the runtime. … I like the idea of boot vectors."/ · /"I had to force that into the structure of Svelte and that was very limiting"/
- s2 B: /"the client is the entity that anima and ghost share."/
- s1 G: /"if I open the same terminal or the same thread in two terminals on different clients, then I expect them to represent each other and to react to each other's changes."/

#### what he rejected, and why

| rejected | his word | where |
|---|---|---|
| a `Ring` class with `db · on · fx` | /"we already have entities. … we don't need to recreate something."/ · /"effects is a taken name"/ | m82:1040 |
| a `Loop` class | RULED: no class; the name stays for the whole | m82:1073 |
| the ring in code | /"the ring architecture is not something that i want in code actually that is a narrative layer for us"/ | m82 U |
| ink | /"opentui instead of ink. no ink."/ | m82 N |
| keeping ink alive per milestone | /"no. erbuild. ink dies. one move. one coherent move."/ | s1 #12 |
| `session` | /"what is sessoin?! never heard of that."/ | s1 M |
| `host` as a client word | /"there is no host. host is not a real entity. doesnt exist."/ | s4-6 |
| `seat` | /"i dont like the seat term."/ | s4-26 |
| `$repl` atom, rebuild on mode change | /"repl itself isnt reactive. no $repl."/ · /"we dont rebuild the modes on repl change."/ | s3 b5 · m88 law |
| promises on entities | /"promises to be awaited on entities is an antipattern."/ | s4-7 |
| a hostname test for loopback | /"no. still wrong."/ | s4-18 |
| thread PHASES | /"ignore this entire phases system for now."/ · /"cuuuut"/ | s4-24 |
| `RUNG` | /"rung … what the fuck is this retarded word"/ | s4-22 |
| a surface `signin` intermediary | /"this intermediary makes little sense?! we have the loop. why the double abstracotin."/ | s1 #8 |
| layer-major ghost | /"i dont like the way the ghost is structured. we have the same types in prototpes/lifecycles/traits... what would that look like when we invert them."/ | s4-31 |
| `drapes/solid` | REJECTED 10-10: a kit is keyed by TARGET, never framework | m82:1458 |
| intermediary variables | /"you dont fucking use intermediary variables"/ (×6) | s3:124 |

#### up in the air

- **the pincer**: m82 S: /"We might do away with a pincer, I'm not yet sure."/ · W: /"maybe we still have the pincer in anima and no pincer in a more of a standard chatbot coding agent management framework on the TTY side"/. m82 demo: /"The pincer is PARKED for the demo"/ (`m82:1319`). Before that, m73: /"important! we have done a lot of adjustments and custom work on the pincer. right now the core placement logic works well. dont drop that. f.e the settings for mobile, ios."/
- **the bones and panels**: /"dock is dock. the bones and panels come later."/ (s3 #10).
- **anima's framework**: m82 G: /"Maybe we just look at Solid for replacing SvelteKit on Anima itself."/ → W: /"not a must."/ → s2: /"we want solid on both. opentui and vite"/ → 10-12: /"anima not in scope."/ (`.s2.org` "Four flips in his record, later word wins").

---

### the REPL architecture, in his words

#### Emacs, mapped (m82 synthesis, 10-10)

| Emacs | vivalence |
|---|---|
| the C core | the die + its execution Vector |
| the command loop · `M-x` | the repl Vector, dispatched by Signal |
| an interactive command | an effect on the repl: `(input, ctx) → writes ctx` |
| `define-key` in a major mode | a mode's `repling` grafted under `/mode/<type>/<slug>` |
| `C-g` | `/abort` → kill the activity |
| the minibuffer · the mode line | the slot · the crown |
| TEA Model · Msg · update · view | atoms · Signal · effect · surface subscriptions |

/"Then we would have modes be able to attach their own events. Which is basically the Emacs equivalent of … Control G? Or double space in Spacemacs?"/ (m82:1036).

#### the loop as he described it

s1 F, 10-11: /"we have a boot vector that constructs a loop and the loop is populated with another vector, a kind of signal handler where we can attach more vectors to extend the functionality. These vectors have a specific context, the client context … all the interactions that the clients do, they go through this loop … kind of like a reducer pattern attached to a REPL facilitated with typology prototypes. The context is the same on both clients."/

s3 r11: /"the repl vector is the result of a pipeline. like runtime apertures go through pretty elaborate composition. smae here."/ · b8: /"we attach them in order and thats that. one vector. first statics then dynamics."/

#### the ring, as landed (m86, 10-16)

```text
.ikiro/quests/done/m86-repl-loop-clients.org:30 (the ring — as locked 10-15)
dock signal ──▶ new ReplSignal(signal)        bare text → { nature: "*", body: [{ type: "text", text }] } · "/x y" → verb
          ──▶ client.dispatch(signal)         an active terminal → terminal.dispatch(line); none → the client's own line
          ──▶ shard.repl.execution            controller.open · message · resolving
replDie = { signal · client · runtime · terminal · controller · repl · output }
dataspace = its own channel: rows arrive by subscription, the frame and the dock render STATE; nothing of it passes the repl
```

```js
// systems/ghost/typology/gestalten/shard/repl.js:27
export const compose = (client, terminal) =>
  new Vector().graft(
    client.repl,
    ...fromm.modes(client.modes).flat.map((mode) => mode.repl),
    ...(terminal === null ? [] : [terminal.repl, ...client.runtime.entities.mode.$entities.get().map(scoped), ...(harnessed(terminal) ? [turn] : [])]),
  );
```

```js
// systems/ghost/typology/prototypes/replsignal.js:4
export class ReplSignal extends Argv {
  static coercions = [
    [(line) => is.string(line) && !line.startsWith("/") && !line.startsWith("--"), (line) => [{ nature: "*", body: [{ type: "text", text: line }], flags: {} }]],
```

```js
// systems/ghost/typology/client/execution.js:216
export const execution = new Vector()
  .use(shard.controller.open).use(verbs).use(modes).use(surface).use(runtime).use(connection).use(authorized)
  .use(dataspace).use(rows).use(hosts).use(terminals).use(staggered).use(thread).use(active)
  .do(shard.controller.hold);
```

#### where the client ends and the mode begins

- A mode's verbs reach the repl only through its `repl` Vector. A HOSTED mode (on the client) grafts at the root. A REMOTE mode is scoped (s4-5): /"modes and their repl vectors are scoped by mode/slug and mode/type/slug onto the terminal repl. and then we have another harness streamer specifically for the terminal on /*"/
- The bare line is a turn only when the seated mode is HARNESSED. s3 r10: /"harnessed adds the effect"/. Otherwise the route is absent and the line faults `NotFound`.
- A mode's screen is its bundle in the frame, opened by a verb and never on seat. s4-10: /"running after the clients home trait is applied??! wrong as is."/
- m88 intent: /"REPLING trait on clients on mode to serve the repl as a mcp to the runtime/mode and the wiring to close the tool loop."/ · /"repling is a export const repling = new Vector(); when a mode trait repling is in client, it gets its vector attached to terminal.repl."/
- s3 r12: /"daemon and runtime each have their scope for each mode and a repling mode exposes its functionality at that attachment."/

#### "coherent across TUI and browser", in his words

- m82 S: /"in both cases both clients should implement the same layout logic."/
- s1 F: /"The context is the same on both clients."/
- m82 V: /"ghost it gets imported by Anima and Ghost exports a typology at vivalence slash ghost and that has all of the building blocks that you need to build a client"/ · /"Anima is solid and Ghost is basically the vector that it is right now with its different phases"/
- s1 #11: /"anima from scratch. import {...typology} from @vivalence/ghost and {...dom surface} from @drapes"/
- m82 Y: /"not a cheap prototype. I want real like the design should be good, use vivalence as themes and stuff, and the logo, the fonts, and then actual interactions … the first thing that I see is the text input"/
- What is shared: the Client, the dies, the repl, the context words, dapper's tokens (`tokens(theme, zone)`; a tty reads the same values as a flat object, `m82:1321`). What differs is the surface only. One kit per TARGET: `drapes/dom` · `drapes/tty` · `drapes/svelte` (mode apps) · `drapes/state`.
- m82's five screens on both targets (`m82:1311`): boot · signin · chat · buffer · navigation.

---

## 3 · the vocabulary

| word | what it is | the ruling that locked it | where it lives |
|---|---|---|---|
| **buffer** | what a mode emits and a daemon holds; a row whose `bundle` the client negotiates by mime; on screen in the frame | m79: /"we already HAVE a buffer concept. modes emit them, daemons hold them, anima renders them into a frame."/ · m82 K: /"Buffer does not have multiple bundles, it has one bundle."/ · codestyle: /"state should include my current sleecteds!"/ | `systems/runtime/entities/Buffer.ts` · `systems/ghost/typology/buffer.js` |
| **dock** | the chat column: transcript, live turn, composer; in ghost the tail of messages ⊕ turns | s1 H: /"we now build only dock i think. where only one buffer is max open at a time. spit view. as on anima today."/ · s3 #10: /"dock is dock. the bones and panels come later."/ · s2 F15: /"move dock from terminal to client"/ | `systems/ghost/app/surface/chrome/panes/dock.jsx` · anima `panels/a/widgets/Dock.svelte` |
| **frame** | the pane beside the dock where a buffer's bundle mounts | s4-10: /"frame isnt a client primtive. frame is surface."/ | `systems/ghost/app/surface/chrome/panes/frame.jsx` · `subsystems/drapes/panels/Frame.svelte:64` (the contract) |
| **chrome** | the fullscreen, held level of the client; also `Chrome.jsx` | m79/m82: /"captured is interactive ongoing but still inline. chrome is fullscreen captured ongoing."/ · s1 #7: /"cut captured and chrome. thast teh new meta … anima of course is always chrome."/ · s2 D: /"shell repl chrome."/ | `systems/ghost/app/client/chrome.js` (`/chrome/on|off`) |
| **pane** | one region the surface mounts (signin · crown · navigation · dock · frame) | anima's pane tree, `stores/bridge/panes.js`; reduced to the dock in s1 | `systems/ghost/app/surface/chrome/panes/` |
| **surface** | the bag that differs per client (tty · dom): mount, keys, accept | s1 I: /"surface. not target."/ | `systems/ghost/app/surface/` · `subsystems/drapes/{dom,tty}` |
| **terminal** | the client's seat: holds a thread, has a controller and a repl; ephemeral | m55: /"thread is daemon. terminal is client!! thats the surface. no overlap."/ · m80 S: /"the terminal is a kind of almost ephemeral entity, and the thread is a persistent entity"/ · terminal-first (04-06): /"Terminal is the primary entity."/ | `systems/runtime/entities/Terminal.ts` · `systems/ghost/typology/terminal/` |
| **thread** | the persistent conversation; names its mode (nullable since m80) | m80 M: /"you're capable of creating turns outside of a daemon"/ | `systems/runtime/entities/Thread.ts` · `systems/ghost/typology/thread/` |
| **turn** | one message of a thread, parts poured and drained | `Turn.ts:13` `history` ⟷ `chain`; `belt/soma.js` `pour` ⟷ `drain` | `systems/runtime/entities/Turn.ts` · `systems/ghost/typology/turn.js` |
| **mode** | a module of twelve exports switched on by manifest traits; on either host | m81: /"a mode that runs straight in the runtime"/ · /"name that key just modes on both"/ | `systems/runtime/entities/Mode.ts` · `systems/ghost/typology/mode/` |
| **daemon** | a host under the runtime holding modes and a vocabulary | m80 F: /"only one lighthouse per runtime"/ | `systems/runtime/prototypes/daemon.js` · `entities/Daemon.ts` |
| **lighthouse** | the auth door, a property of the runtime | m80 F: /"It stops being a service and it's just a property of the runtime. … I think we can still call it a lighthouse"/ | `systems/runtime/lifecycle/lighthouse/` |
| **runtime** | the one process: datamap, userspace, lighthouse, daemons | m80 C: /"pull the whole lighthouse into the runtime … one data map"/ | `systems/runtime/` |
| **instance** | the JSON record a runtime boots from | m80 A: /"I want them to be probably just JSON"/ · V: /"Rows win while running, JSON wins at boot."/ | `subsystems/typology/schematics/primitives/instance.js` |
| **ledger** | `~/.viva`: the registry, the instances, the recipe | s4-18: the LEDGER decides the boot (REJECTED a hostname test, /"no. still wrong."/) | `subsystems/paladin/prototypes/ledger/` |
| **harness** | the trait-built Vector that runs chat on a mode | m81 · `systems/runtime/traits/harnessed.js:182` | `systems/runtime/traits/harnessed.js` · `systems/ghost/typology/mode/traits/` |
| **trait** | a STATE word on a manifest; its function IS the dispatch; staggered on its owner | s4-40: /"read anima and runtime for how we deal with traits. that whole function is fucked."/ · s3 #12: /"We handle traits not in one unified way dogmatically, but whatever makes sense in context."/ | `subsystems/typology/gestalten/belt/traits.js` |
| **REPL signal** | the reader: bare text → `*` with a text body; `/x y` → a verb | s1 C: /"custom signal. replsignal."/ · m90 G: /"every signal derivative becomes a way to build {nature, body, flags}"/ | `systems/ghost/typology/prototypes/replsignal.js` |
| **activity** | the transient row carrying a hallucination's controller; stdin is stripwired | m65 · s4-9: /"activity has a controller, no? if so then client version needs one too"/ | `systems/runtime/entities/Activity.ts:74-83` · `systems/ghost/typology/activity.js` |
| **intent** | anima's entity, from `intent-as-template` (04-11); NOT in ghost | — (no ruling found for the client side) | `systems/anima/src/typology/entities/intent.js` |

---

# II · the clients today

## 4 · ghost — the terminal client, measured

Read: every file under `systems/ghost/` except `bak/` `node_modules/` `out/` `tests/snapshots/` (78 files, 93.6k chars) · `.ikiro/world/codemap/ghost.md` · `.ikiro/reference/tty-render.md` · `.ikiro/reference/tui.md` §0, §5 (anima chrome). Ran on this machine:

```sh
viva --help; echo $?                       # 0 — prints "ctx.output: {branches: help · repl · chrome}"
viva hello </dev/null; echo $?             # "viva /hello: Not found" · 127
viva chrome </dev/null; echo $?            # "viva /chrome: chrome needs a terminal — run it in one, or: viva repl" · 1
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/<f>.test.js
# repl 1 passed (6 steps) · console 1 (1) · keys 2 (15) · text 4 · client 1 passed (4 steps) 4s
```

`out/panes.mjs` (Oct 16 16:12:49) is newer than every `.jsx` (latest `frame.jsx` 16:09:31) — the built bundle is current.

---

### 1 · BOOT

#### the door — `run.js`

```js
// systems/ghost/run.js:6
const instance = await lifecycle.mount(paladin.instance);
await paladin.ledger.registry.supply();

const die = {
  controller: new Controller({ stdout: new Span("ghost") }),
  signal: new Argv(Deno.args),
  instance,
  mask: instance.clients.find((client) => client.manifest.slug === "ghost"),
};
die.register = await paladin.ledger.registry.wire(die.mask);
```

- SIGINT · SIGQUIT · SIGTERM → `die.controller.kill("SIGTERM", <name>)` (`run.js:17-19`).
- Failure print: `viva ${pathname}: ${message}`, stack only on `--verbose` (`run.js:29`). Exit code `fromm.controller(die.controller).exit` (`run.js:32`).
- What paladin reads at the door (import of `@vivalence/paladin` = `subsystems/paladin/mod.js:5-13`): strata `flag · cwd · instance · .env · os · session · ledger` (`subsystems/paladin/prototypes/paladin.js:5`). `populate.env`: OS env (`populate.js:8`), `$PWD/.env` (`:10-13`), `VIVA_ENV_FILE` (`:16`). Scopes: ledger = `VIVA_LEDGER_MOUNT ?? ~/.viva` (`:30-31`), registry = `~/.viva/registry` (`:78-80`); session = `~/.viva/sessions/${VIVA_PROCESS_ID}.json` (`:85-88`); `~/.viva/.env` at stratum `ledger` (`:91-93`). `lifecycle.mount` (`subsystems/paladin/lifecycle/index.js:8`) adds the instance `.env` (`populate.js:120-125`) + recipe.
- Credentials: NOT at the door — `~/.viva/credentials.json` keyed by runtime origin, read/written by the lighthouse beat, mode `0o600` (`typology/lighthouse/execution.js:4`, `:20-36`).
- The argv flags are NEVER assigned to paladin's `flag` stratum: `run.js` hands `Deno.args` only to `Argv` (`run.js:11`).
- The mask on this machine (`~/.viva/ledger.viva.json:62-79`): `{ manifest: { type: "client", slug: "ghost", traits: ["HOME"] }, modes: ["@commons/home/console"], trait: { HOME: { reference: "/runtime/runtime/mode/harness/runtime" } } }`.

`ghost.sh` (what `viva` is): sources `${XDG_CONFIG_HOME:-~/.config}/viva/env`, sets `VIVA_PROCESS_ID=${VIVA_PROCESS_ID:-$PPID}`, `exec deno run --config $VIVA_REPOSITORY_MOUNT/deno.jsonc -A …/systems/ghost/run.js "$@"` (`ghost.sh:3-9`).

#### argv grammar — `typology/prototypes/argv.js`

```js
// systems/ghost/typology/prototypes/argv.js:8
        const terminator = argv.indexOf("--");
        const options = terminator < 0 ? argv : argv.slice(0, terminator);
        const operands = terminator < 0 ? [] : argv.slice(terminator + 1);
        const at = options.findIndex((token) => !token.startsWith("--"));
        const head = at < 0 ? "" : options[at];
        const rest = at < 0 ? options : [...options.slice(0, at), ...options.slice(at + 1)];
        const segments = head
          .split("/")
          .filter((part) => part.length > 0)
          .map((nature) => ({ nature }));
```

- head = first token not starting `--`, split on `/` → segments. Every later bare token → positional, `--k=v` → `flags[k]="v"`, `--k` → `true` (`:20-28`). After `--`: operands. `{…}`/`[…]` tokens JSON-parse (`datum`, `:52-59`).
- No head but argv non-empty → `nature = null` → root `.do` (`:30-34`). Body+flags ride segment 0 (`:36`).
- `get argv` is the inverse (`:43-49`).

#### the shell — `app/shell/index.js`

```js
// systems/ghost/app/shell/index.js:5
export const shell = new Vector()
  .use(shard.controller.open)
  .use(async (ctx, next) => {
    await next();
    if (ctx.output) console.log("ctx.output:", JSON.stringify(ctx.output, null, 2));
  })
  .use(async (ctx, next) => {
    if (ctx.signal.flags.help !== true) return next();
    ctx.output = shape.strip(shell);
  })
  .open({ nature: "/help", valence: "the shell's verbs. Example: viva help" }, () =>
    shape.strip(shell),
  )
  .open(
    { nature: "/repl", valence: "the repl as plain lines in this terminal. Example: viva repl" },
    clientFactory(surface.repl),
  )
  .open(
    {
      nature: "/chrome",
      valence: "the repl under the chrome — the dock paints. Example: viva chrome",
    },
    clientFactory(surface.chrome),
  )
  .do(clientFactory(surface.repl));
```

Every flag and verb that exists:

| argv | lands | effect |
|---|---|---|
| `viva` | root `.do` | repl surface (`shell/index.js:29`) |
| `viva --<anything>` (no head) | root `.do` | repl (`argv.js:31`) |
| `viva --help` | beat `:11-14` | strip of shell, printed `ctx.output: …` |
| `viva help` | `/help` | same strip |
| `viva repl` | `/repl` | `clientFactory(surface.repl)` |
| `viva chrome` | `/chrome` | `clientFactory(surface.chrome)`; non-TTY → throws (`chrome/index.js:9-10`) |
| `viva hello` / any other head | — | NotFound, exit 127 (measured) |
| `--verbose` | `run.js:29` | stack on failure |

No log flags, no dev flags, no `--json`, no `--watch` flag: watch is a Deno flag in the tasks (§4·5). `viva hello` in the brief does not exist as a shell verb; `/hello` exists only INSIDE the repl via the console mode (§4·2 mode).

#### the client factory — `app/client/index.js`

```js
// systems/ghost/app/client/index.js:5
export const factory = (surface) => async (shellDie) => {
  const clientDie = new ghost.Client({ controller: shellDie.controller.branch("client"), mask: shellDie.mask, register: shellDie.register, instance: shellDie.instance, surface });
  clientDie.repl.graft(chrome);
  await steer.dispatch.execute(ghost.client.execution, clientDie);
  if (clientDie.controller.status.is("FAILED")) throw clientDie.controller.status.reflection.error;
};
```

#### the client execution — exact order (`typology/client/execution.js:217-232`)

```js
// systems/ghost/typology/client/execution.js:217
export const execution = new Vector()
  .use(shard.controller.open)
  .use(verbs)
  .use(modes)
  .use(surface)
  .use(runtime)
  .use(connection)
  .use(authorized)
  .use(dataspace)
  .use(rows)
  .use(hosts)
  .use(terminals)
  .use(staggered)
  .use(thread)
  .use(active)
  .do(shard.controller.hold);
```

| # | beat | line | does | stdout record |
|---|---|---|---|---|
| 1 | `shard.controller.open` | — | opens the client controller | — |
| 2 | `verbs` | `:40-43` | grafts `/help` `/quit` onto `clientDie.repl` | — |
| 3 | `modes` | `:45-55` | each `register.modes` citizen → `new mode.Mode(citizen)` under `clientDie.modes[type][slug]`, runs `mode.execution` (REPLING etc.) | — |
| 4 | `surface` | `:57-64` | `clientDie.unmount = await clientDie.surface(clientDie)` — the SURFACE MOUNTS BEFORE THE RUNTIME IS REACHED | — |
| 5 | `runtime` | `:66-80` | `/status` probe at `instance.runtime.statics.remote`; unreachable → `ledger.instances.lookup(home)` → `ledger.boot(specs(...), {attachment:"logged"})`; `finally` disintegrates what it booted | `{booting, log: ~/.viva/logs/<slug>/runtime.out.log}` |
| 6 | `connection` | `:82-99` | `Runtime` + `Lighthouse`; multiplex transmitter, retry 2, track request/fault, authorize, timeout 8000; `/lighthouse/metadata` | `{lighthouse, traits}` |
| 7 | `authorized` | `:101-102` | composes `lighthouse.execution` (credentials · staggered · authorized) | `{user}` |
| 8 | `dataspace` | `:104-116` | `/metadata/manifest` → `reference=/runtime/<slug>`, `aperture`, `new Dataspace({entities:{activity,buffer,daemon,mode,terminal,thread,turn}})`, `init` reads `<ref>/metadata/datamap` | `{runtime}` |
| 9 | `rows` | `:118-137` | `find()` daemon · thread · buffer · turn · activity · terminal; `subscribe()` thread · buffer · turn · activity · terminal (NOT daemon) | — |
| 10 | `hosts` | `:139-143` | runtime + each daemon → `HOSTS[type]` execution, NOT awaited; error → `$status {code:"ERROR"}` | per host `{runtime|daemon, modes}` |
| 11 | `terminals` | `:145-167` | reconcile `terminal.$entities`: new row → `controller = branch("terminal/<id>")` + `terminal.execution`; removed row → abort | `{terminal}` |
| 12 | `staggered` | `:169-176` | `traits.stagger(mask, clientDie, {HOME})` | `{home, thread}` |
| 13 | `thread` | `:178-209` | follows `$active` → `active.$thread`; runs `thread.execution` under `active.controller.branch("thread/<id>")` | — |
| 14 | `active` | `:211-215` | `$active = rows[0]` or `terminal.create({})` | — |
| 15 | `.do(shard.controller.hold)` | — | holds until kill | — |

The spawned runtime spec: `deno run -A --config <repo>/deno.jsonc <repo>/systems/runtime/run.js`, env filtered to `PATH HOME TMPDIR XDG_CONFIG_HOME TERM LANG DENO_DIR NO_COLOR` + `VIVA_* PUBLIC_VIVA_* SECRET_VIVA_*` minus `VIVA_PROCESS_ID` (`:17-18`, `:21-36`).

Boot order is pinned: `client.test.js:43` — first three messages are `lighthouse · user · runtime`.

---

### 2 · NOUNS

Exports: `entities = { activity, buffer, daemon, mode, terminal, thread, turn }` (`typology/index.js:16`); `Client · Runtime · Lighthouse · STANDINGS` (`:17-19`).

`Dataspace` — every row module registers `repository(dataspace)` + a boot `Vector` (bind `repository`, `dataspace`, seed binds `client`, `runtime`, then `hydration`) on ONE `RemoteEntityManager` (`prototypes/dataspace.js:11-23`). `branch(connection, name)` = a repository at `<connection>/entities/<name>` on the same em (`:30-32`).

#### client — `typology/client/`

```js
// systems/ghost/typology/client/client.js:6
  controller = null;
  mask = null;
  register = null;
  instance = null;
  surface = null;
  unmount = null;
  booted = null;
  modes = {};
  repl = new Vector();
  runtime = null;
  $active = atom(null);
```
- `active` getter (`:22`), `dispatch(line)` → `shard.repl.dispatch(this, this.active, line)` (`:26-28`), `json` (`:30`). No repository, no hydration — not a row.
- traits catalog: `HOME` only (`traits/index.js:1`). HOME CLAIMS `v.user.trait(lighthouse.user, "HOME")` (user's override) else `mask.trait.HOME.reference` (`traits/home.js:7-8`); finds the owning host by reference prefix, waits its `$status` ∈ `HEALTHY|ERROR` (`:3`, `:11`), creates a thread on that mode, `terminal.setThread(thread)` (`:15-16`). Grafts nothing; subscribes terminal rows, seats every threadless one once (`:20-26`); returns `{terminate: off}`.
- commands:
```js
// systems/ghost/typology/client/commands/help.js:3
export const help = new Vector().open(
  { nature: "/help", valence: "the repl's verbs as a tree. Example: /help" },
  (ctx) => shape.strip(ctx.repl),
);
// systems/ghost/typology/client/commands/quit.js:3
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
```
- surface verbs grafted by `app/` (not typology):
```js
// systems/ghost/app/client/chrome.js:5
  .open(
    {
      nature: "/chrome/on",
      valence: "paint the dock over this terminal; the transcript stays. Example: /chrome/on",
    },
    async (ctx) => {
      ctx.client.unmount();
      ctx.client.unmount = await surface.chrome(ctx.client);
      return "chrome on";
    },
  )
  .open(
    {
      nature: "/chrome/off",
      valence: "drop to the plain repl; the transcript stays. Example: /chrome/off",
    },
```

#### runtime · daemon — hosts

- `Runtime` fields: `type="runtime" manifest reference remote statics connection aperture call cortex cargo lighthouse entities $status` (`runtime/runtime.js:4-16`); `modes` = mode rows with `daemon === null` (`:25-27`). Not a row (no repository).
- `Daemon extends Entity`: `type="daemon" id slug reference manifest statics connection aperture call cortex cargo entities runtime $status` (`daemon/daemon.js:6-19`); `modes` = rows with `mode.daemon === this` (`:24-26`).
- daemon repository: `find` overridden — `call("/metadata/daemons")` → cast `{id: slug, slug, reference}` (`daemon.js:33-40`). Hydration: `reference`, `connection = runtime.connection.branch(reference)`, `aperture = connection`, `entities = { mode: dataspace.branch(aperture, "mode") }` (`:42-49`).
- execution (both identical over `type`):
```js
// systems/ghost/typology/daemon/execution.js:4
export const execution = new Vector().use(host.status("daemon")).use(host.metadata("daemon")).use(host.cortex("daemon")).use(host.modes("daemon")).use(host.mounted("daemon")).do(shard.controller.hold);
```
`gestalten/shard/host.js`: `status` — MOUNTING → `/status` → subscribe; non-RUNNING → UNAVAILABLE (`:5-21`). `metadata` — `/metadata/{manifest,statics,aperture}`, `call = shape.connection.wire(aperture, …)`, `cargo = new Cargo(aperture)` + `refetch` (`:23-31`). `cortex` — `/metadata/cortex` wired at `/cortex` (`:33-36`). `modes` — `entities.mode.find()`, re-merges held threads whose mode is now borne, subscribes (`:38-48`). `mounted` — staggers mode traits per mode (catalog `mode/traits`), `$status HEALTHY`, message `{[type]: ref, modes: [...]}`; `finally` RELEASED (`:50-64`).
- No traits, no commands for runtime/daemon.

#### lighthouse — `typology/lighthouse/`

- fields: `$authority (map) · $user (map) · $status (atom IDLE) · $isAuthorized (computed access && refresh) · $isIdentified · manifest · connection · stdout = new Span("lighthouse")` (`lighthouse.js:7-15`); STANDINGS 12 words (`:4`).
- verbs: `restore(held)` validates `v.primitives.credentials.Credential` (`:37-46`) · `signup · login · autologin` → `access(route, credentials)` (`:52-76`) · `verify` (`:78-97`) · `refresh` (`:99-126`) · `logout` (`:128-134`).
- execution `credentials → staggered → authorized` (`execution.js:50`): `authorized` races `until($isAuthorized)` vs `control.hold` (`:43-48`).
- traits catalog:
```js
// systems/ghost/typology/lighthouse/traits/autologin.js:1
export const AUTOLOGIN = (lighthouse) => () => lighthouse.isAuthorized || lighthouse.autologin();
// systems/ghost/typology/lighthouse/traits/joinable.js:1
export const JOINABLE = () => {};
// systems/ghost/typology/lighthouse/traits/invitational.js:1
export const INVITATIONAL = () => {};
```
- No commands. `login(` · `signup(` have 0 callers in ghost (grep).

#### mode — `typology/mode/`

```js
// systems/ghost/typology/mode/mode.js:6
  type = null;
  slug = null;
  name = null;
  description = null;
  version = null;
  traits = [];
  daemon = null;
  reference = null;
  module = null;
  status = new Status();
  stdout = new Span("mode");
  repl = new Vector();
  metadata = {};
  runtime = null;
  connection = null;
  call = null;
  harness = null;
  $application = atom(null);
```
- Two births: a CLIENT-hosted mode `new Mode(citizen)` (`client/execution.js:47`, module = the citizen) and a RUNTIME row via `repository` at `<runtime>/entities/mode` (`mode.js:50`) or a daemon's `dataspace.branch` (`daemon.js:48`).
- hydration: `reference = (daemon ?? runtime).reference.branch("/mode/<type>/<slug>")`, `connection = …aperture.branch(same)` (`mode.js:52-57`).
- execution (client-hosted only): `stdout → core → staggered` (`execution.js:23`); `core` rebases `reference` under `client.mask.reference` (`:14-17`).
- traits catalog (`traits/index.js:1-4`): `REPLING · EXPOSED · HARNESSED · APPLICATION` (+ helper `open`).
  - `REPLING` grafts `mode.module.repling` into `mode.repl` (`repling.js:1-3`).
  - `EXPOSED` CLAIMS `/metadata/aperture`, wires `mode.call` (`exposed.js:3-6`).
  - `HARNESSED` CLAIMS `/metadata/harness`, wires `mode.harness` over `/harness` with a merge tap folding yielded rows into the em (`harnessed.js:7-31`); grafts `/harness`:
```js
// systems/ghost/typology/mode/traits/harnessed.js:33
  mode.repl.open(
    { nature: "/harness", valence: "a turn to THIS mode's harness on the active terminal's thread, named — compose scopes it under /mode/<type>/<slug> and /mode/<slug>. Example: /mode/memo/harness ciao" },
```
  - `APPLICATION` CLAIMS `/metadata/application` → `mode.application = { url, schema, bundle: new Bundle(record.bundle).withUrl(record.url) }` (`application.js:3-6`). `open(terminal, mode)` picks the newest buffer of this mode on the thread or creates `{mode, thread, data:{}}`, sets `terminal.$buffer` (`:8-18`).
- the console mode the ghost mask hosts (`commons/fixtures/testing/console/console.viva.js`), REPLING:
```js
// commons/fixtures/testing/console/console.viva.js:14
    { nature: "/hello", valence: "the hosted mode answers from inside the repl's context. Example: /hello" },
    (ctx) => {console.log("mode/home/console", {ctx});return `hello from ${ctx.client.mask.manifest.slug}` ;},
// commons/fixtures/testing/console/console.viva.js:18
    { nature: "/whoami", valence: "the user, the active terminal and its mode. Example: /whoami" },
```

#### terminal — `typology/terminal/`

- row fields `id user daemon index traits trait`; local `client runtime repository controller repl $thread $buffer` (`terminal.js:7-20`). Getters `thread · label (trait.LABELED.name) · mode (thread.mode) · buffer` (`:22-36`).
- verbs: `dispatch(signal)` (`:46`), `write(data)` = `repository.updateOne({id}, data)` (`:50-52`), `setThread(thread)` writes `{daemon, thread}`, rejects a string mode "belongs to a host that is not mounted" (`:54-59`).
- repository `/userspace/entities/terminal` (`:62`); hydration binds `client runtime repository` (`:64-69`).
- execution: `verbs` grafts `commands.mode, commands.application` onto `terminal.repl`, message `{terminal: id}` → hold (`execution.js:4-10`). No traits catalog.
- commands, verbatim:
```js
// systems/ghost/typology/terminal/commands/mode/list.js:4
  { nature: "/modes", valence: "every mode across the runtime and its daemons — reference and traits. Example: /modes" },
// systems/ghost/typology/terminal/commands/mode/pick.js:9
  { nature: "/mode", valence: "set the active terminal's thread to a mode's newest thread, or a new one; the words narrow, one match sets, else the candidates are the answer. Example: /mode memo" },
// systems/ghost/typology/terminal/commands/application/start.js:5
  { nature: "/application/start", valence: "open the application of the active terminal's mode in the frame — its newest buffer on this thread, or a new one. Example: /application/start" },
// systems/ghost/typology/terminal/commands/application/stop.js:4
  { nature: "/application/stop", valence: "close the frame; the buffer stays on its thread. Example: /application/stop" },
// systems/ghost/typology/terminal/commands/turn.js:5
  { nature: "*", valence: "a bare line — a turn to the active terminal's mode, streamed onto the thread's span. Example: ciao" },
```
- `/mode` narrows by `words.every(word => reference.includes(word))`; 1 match → newest thread by `id` desc or create, `setThread` → `"<ref> · thread #<id>"`; else `{which: [refs]}` (`pick.js:10-17`). `/application/start` throws loud on a non-APPLICATION mode (`start.js:7-8`). Note the file `mode/list.js` registers `/modes` (plural).

#### thread — `typology/thread/`

- fields `id user mode phase="manual" traits trait controller $activity` (`thread.js:6-13`).
- repository `/userspace/entities/thread` (`:26`); hydration adds `$buffers` (buffers of this thread) and `$turns` (sorted by `createdAt`) computeds (`:28-32`).
- execution: `activity` derives `$activity` = first activity row of this thread in `RUNNING|PAUSED` (`execution.js:3-17`) → hold. No traits, no commands.

#### turn · buffer · activity — one-file rows

```js
// systems/ghost/typology/turn.js:4
export class Turn extends Entity {
  role = null;
  parts = [];
  meta = null;
  thread = null;
  mode = null;
  parent = null;
}
// systems/ghost/typology/turn.js:15
export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  if (ctx.entity.thread.controller !== null) ctx.entity.thread.controller.stdout.mark("turn", ctx.entity);
});
```
- Turn hydration IS the transcript feed: a merged turn whose thread is attended marks `turn` on the thread's span.
- `Buffer`: `$data · $bundle (→ Bundle) · $traits · $trait (deepMap) · $label (trait.LABELED)`; local `context`, `hooks {mount, unmount, release}` with `on.*` (`fn.once`) (`buffer.js:5-73`). Repository `/userspace/entities/buffer`; hydration empty `new Vector()` (`:75-77`).
- `Activity`: `user mode thread buffer turn type steps controller` (`activity.js:4-12`); `status` ↔ `controller.status` (`:14-22`). Hydration opens `controller.stdin.<signal>` for every `MACHINE.signals` → `call("/userspace/entities/activity/<id>/stdin/<name>")` (`:32-36`). Nothing in ghost sends those signals.

---

### 3 · THE REPL

#### line → signal — `prototypes/replsignal.js`

```js
// systems/ghost/typology/prototypes/replsignal.js:4
export class ReplSignal extends Argv {
  static coercions = [
    [(line) => is.string(line) && !line.startsWith("/") && !line.startsWith("--"), (line) => [{ nature: "*", body: [{ type: "text", text: line }], flags: {} }]],
    [
      (line) => is.string(line),
      function (line) {
        return this.coerce(ReplSignal.tokens(line.startsWith("/") ? line.slice(1) : line));
      },
    ],
    ...Argv.coercions,
  ];
}
```

| line | row | signal |
|---|---|---|
| `ciao` | 1 | nature `*`, body `[{type:"text", text:"ciao"}]` — the WHOLE line, one part |
| `/mode srs/memo` | 2 | strip `/`, tokens → Argv: `/mode` body `["srs/memo"]` |
| `/mode/memo/harness ciao` | 2 | segments `mode·memo·harness`, body `["ciao"]` |
| `--x` | 2 | Argv with no head → `nature = null` → root effect if any, else NotFound |

#### the per-line vector — `gestalten/shard/repl.js`

```js
// systems/ghost/typology/gestalten/shard/repl.js:24
export const compose = (client, terminal) =>
  new Vector().graft(
    client.repl,
    ...fromm.modes(client.modes).flat.map((mode) => mode.repl),
    ...(terminal === null ? [] : [terminal.repl, ...client.runtime.entities.mode.$entities.get().map(scoped), ...(harnessed(terminal) ? [turn] : [])]),
  );

export const dispatch = (client, terminal, line) => {
  const signal = new ReplSignal(line);
  const replDie = {
    signal,
    client,
    runtime: client.runtime,
    terminal,
    controller: (terminal === null ? client.controller : terminal.controller).branch(signal.pathname),
    repl: compose(client, terminal),
    output: undefined,
  };
  return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
};
```

Where a line lands (composed fresh EVERY line):

| source | grafted at | verbs |
|---|---|---|
| `client.repl` | root | `/help /quit /chrome/on /chrome/off` |
| client-hosted modes' `repl` | root | `/hello /whoami` (console) |
| `terminal.repl` | root, if active terminal | `/modes /mode /application/start /application/stop` |
| every runtime/daemon mode's `repl`, `scoped` | `/mode/<type>/<slug>` + `/mode/<slug>` (`repl.js:15-20`) | `/harness` on HARNESSED modes |
| `terminal/commands/turn.js` | `*` | only when `terminal.mode.implements("HARNESSED")` (`repl.js:22`) |

- The repl die is flat: `signal client runtime terminal controller repl output`. A verb reads words from `ctx.signal.body`.
- Output: the `execution` = `controller.open → message → dispatch` (`repl.js:10-13`); `message` writes `replDie.output` (the effect's return) to `controller.stdout.message(...)` (`:5-8`). The controller is `terminal.controller.branch(pathname)` or the client's — so every answer is a `message` record under `/ghost/client/terminal/<id>/<pathname>` (or `/ghost/client/<pathname>` with no terminal, `repl.test.js:22`). A throw → `fault` record on the same branch (`repl.test.js:25-35`). `dispatch` resolves to `output` (`repl.js:42`), which tests read directly.
- NO `{condition, output}` shape on this side: a ghost verb returns a plain value (string · object · array); the yield shape is only seen in `HARNESSED`'s merge tap (`is.yieldish(packet.result)`, `harnessed.js:20`, `:26`).
- Runtime-side dispatch: `turn` and `/harness` call `mode.harness.dialogue.stream(...)` over the wire; `/modes` · `/mode` read local em rows; `/application/start` calls `buffer.create` over the wire. No line is forwarded raw to the runtime.

#### how a turn streams — `gestalten/belt/harness.js`

```js
// systems/ghost/typology/gestalten/belt/harness.js:3
export const stream = async (mode, thread, parts) => {
  let transcript = null;
  try {
    for await (const packet of mode.harness.dialogue.stream({ thread: thread.id, id: crypto.randomUUID(), parts })) thread.controller.stdout.mark("stream", (transcript = soma.transcript(transcript, packet)));
  } finally {
    thread.controller.stdout.mark("stream", { ...transcript, open: null });
  }
};
```
- live: `stream` records (a folded transcript with `open` = the in-flight turn); closing record `open: null` (`client.test.js:59`).
- persisted: the runtime writes Turn rows; the `turn` subscription merges them; Turn hydration marks `turn` on the thread span (`turn.js:17`). A bare line → `["user","assistant"]` turns (`client.test.js:58`). Off a harnessed mode → no `*` → `NOT_FOUND` fault (`client.test.js:62-64`).

#### the plain surface — `app/surface/repl.js`

```js
// systems/ghost/app/surface/repl.js:5
const GLYPHS = { user: "<< ", assistant: ">>", system: "·" };
const SHOWN = ["message", "fault", "turn"];

const line = (record) => {
  if (record.verb === "fault") return `✕ ${record.data.message}`;
  if (record.verb === "turn" && record.data.role === "user") return null;
  if (record.verb === "turn")
    return `${GLYPHS[record.data.role]} ${record.data.parts.map((part) => (part.type === "text" ? part.text : `[${part.type}]`)).join(" ")}`;
  return `${record.path.split("/").at(-1)} ${typeof record.data === "string" ? record.data : JSON.stringify(record.data)}`;
};
```
- tails the client span (`:19`), prints new records once (`seen`, `:20-27`), prints `shape.strip(clientDie.repl)` once at mount (`:28`), readline prompt `<< ` (`:30-38`). `stream` is NOT shown — the plain repl prints only the finished assistant turn. Comment at `:16` in product source.

---

### 4 · THE CHROME (OpenTUI)

#### mount — `app/surface/chrome/index.js`

```js
// systems/ghost/app/surface/chrome/index.js:8
export const chrome = async (client) => {
  if (!Deno.stdin.isTerminal())
    throw new Error("chrome needs a terminal — run it in one, or: viva repl");
  const { createCliRenderer } = await opentui();
  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  renderer.keyInput.on("keypress", (event) => {
    if (event.ctrl && !event.shift && event.name === "c") Deno.kill(Deno.pid, "SIGINT");
  });

  (async () => {
    for await (const press of keypresses(renderer).drain())
      if (press.key === "`") renderer.console.toggle();
  })();
  // no repl wired in yet??!!

  // console.log({ renderer });
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```
- renderer = opentui default screen mode (alternate-screen per `tty-render.md` §4/§5) — no scrollback.
- palette FIXED: `tokens("northsea", "2")` — theme northsea, zone 2 (island), from `@vivalence/dapper` (`subsystems/dapper/lib/tokens.js:133`).
- accept = `[mime.tty.solid, mime.json]` — what the frame negotiates.
- unmount: destroys the renderer, then dumps opentui console entries + cached logs to real stdout (`:25-32`).
- host: `opentui()` imports `@opentui/core` after `preload.js` sets `globalThis.__opentuiNodeFfi = deno-ffi` and patches `Worker` to module workers (`host/preload.js:3-11`); `install.sh:14-17` patches opentui's `chunk-node-tfvyz31s.js` to read that global (`host/opentui-core.patch`).
- JSX → `out/panes.mjs` via `bundle.js` (esbuild + babel-preset-solid `generate: "universal"`, `moduleName: "@opentui/solid"`, `bundle.js:11-19`); entry `views.js` exports `panes` + `Palette` (`views.js:1-2`). `paint.js` wraps every render in `RendererContext.Provider` + `Palette.Provider` (`paint.js:4-23`).

#### layout — `panes/chrome.jsx`

```jsx
// systems/ghost/app/surface/chrome/panes/chrome.jsx:6
export function Chrome(props) {
  const buffer = from(belt.atom.chain(props.client.$active, "$buffer"));
  return (
    <box style={{ flexDirection: "row", flexGrow: 1 }}>
      <Show when={buffer() !== null && buffer() !== undefined}>
        <box style={{ flexGrow: 1 }}>
          <Frame client={props.client} accept={props.accept} />
        </box>
      </Show>
      <box style={{ flexGrow: buffer() ? 0 : 1, width: buffer() ? 48 : "auto" }}>
        <Dock client={props.client} />
      </box>
    </box>
  );
}
```
```text
no buffer:                         buffer open (/application/start):
┌──────────────────────────────┐   ┌──────────────────────┬────────── 48 ┐
│ dock: transcript (scrollbox) │   │ frame                │ dock          │
│ …                            │   │ ⇥ keys to the frame  │ transcript    │
│ << draft▌                    │   │ buffer #<id>         │ …             │
└──────────────────────────────┘   │ view | Floor         │ << draft▌     │
                                   └──────────────────────┴───────────────┘
```
Two panes only. No crown, no tabs, no status row, no navigation (anima's chassis per `tui.md` §5 has crown · shoulder · spine · B · C).

#### dock — `panes/dock.jsx`

```jsx
// systems/ghost/app/surface/chrome/panes/dock.jsx:55
export function Dock(props) {
  const rows = from(props.client.controller.stdout.tail("message", "fault", "turn"));
  const streams = from(props.client.controller.stdout.tail("stream"));
  const live = () => (streams() === undefined || streams().length === 0 ? null : streams().at(-1).data.open);
  const [draft, setDraft] = createSignal("");

  const send = (line) => {
    if (line.trim() === "") return;
    setDraft("");
    props.client.dispatch(line);
  };
```
- source: the CLIENT SPAN tail — boot messages (`lighthouse · user · runtime · terminal · home · runtime/daemon modes`), verb answers, faults, and turns, all as one log. Not `thread.$turns`.
- rows: `turn` → `Turn` (glyph `›` primary for user, `✦` link for assistant, `ROLES` `:7-10`; parts: text → `Markdown`, else `[type]` muted, `:17-24`) · `fault` → `✕ message` signalNegative (`:50-53`) · `message` → last path segment muted + string ink or `JsonTree` (`:38-48`).
- live turn: `streams().at(-1).data.open` painted as a `Turn` after the log (`:79-81`).
- `scrollbox stickyScroll stickyStart="bottom"` (`:69`); `Input prompt="<<"` (`:83`).

#### frame — `panes/frame.jsx`

```jsx
// systems/ghost/app/surface/chrome/panes/frame.jsx:61
          const bundle = from(held.$bundle);
          const application = applied(held);
          const offered = () => (application() === null ? null : bundle() !== null ? bundle().withUrl(application().url) : application().bundle);
          return (
            <box style={{ flexDirection: "column", flexGrow: 1 }}>
              <text fg={palette.textMuted}>{`buffer #${held.id}`}</text>
              <Show when={offered() !== null && offered().negotiate(props.accept) !== null ? offered() : null} keyed fallback={<Floor buffer={held} />}>
                {(chosen) => <Mounted terminal={terminal()} buffer={held} bundle={chosen} accept={props.accept} dispatch={(line) => props.client.dispatch(line)} />}
```
- source: `client.$active → $buffer` (`:56`); the APPLICATION bundle = the buffer's own `$bundle` re-based on `mode.application.url`, else `mode.application.bundle` (`:7`, `:63`) — that is how the mode's APPLICATION export (`mode/traits/application.js:5`) reaches the chrome.
- `Mounted`: `bundle.load(accept)` → `module.default(element, { terminal, mode, thread, buffer, renderer, palette, dispatch, focused })` → `handle.destroy()` on cleanup; calls `buffer.mount()/unmount()` (`:24-36`). Fault → `✕ <message>` (`:40-42`).
- Floor: `JsonTree` of `buffer.$data` (`:48-51`).
- tab focus — the frame owns ⇥, prepended so it runs first:
```jsx
// systems/ghost/app/surface/chrome/panes/frame.jsx:9
const FOCUS = { true: "⇥ keys to the frame", false: "⇥ keys to the dock" };
// systems/ghost/app/surface/chrome/panes/frame.jsx:18
  const toggle = (key) => {
    if (key.name !== "tab" || key.defaultPrevented) return;
    key.preventDefault();
    key.stopPropagation();
    setFocused(!focused());
  };
```
- tty faces on the shelf: `~/.viva/registry/chess/modes/board/play/buffer/play.jsx:268` `export default (element, bag)`, reads `props.focused()` + `key.defaultPrevented` (`:164`); `~/.viva/registry/education/modes/games/dojo/buffer/dojo.jsx`. `commons/fixtures/memo/mode/buffer/memo.jsx:3` imports `@vivalence/sheets` (dead) → known-issues `.ikiro/known-issues.org:2941-2945`: memo shows the Floor / `✕`, and its boot is the pre-m86 `default(element, terminal, {renderer, palette})`.

#### keys — `keys.js`

```js
// systems/ghost/app/surface/chrome/keys.js:3
const NAMES = { escape: "esc", return: "enter", linefeed: "enter" };

const named = (event) => (Object.hasOwn(NAMES, event.name) ? NAMES[event.name] : event.name);

const PRINTABLE = /^[^\p{C}\s]+$/u;

const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];

export const press = (event) => ({ key: CHORDS.find(([test]) => test(event))[1](event) });
```
`keypresses(renderer)` → a `Queue` closed on renderer `destroy` (`:18-27`). Only consumer: the backtick toggle (`index.js:18-19`).

`Input.jsx` edits table:
```jsx
// systems/ghost/app/surface/chrome/views/Input.jsx:6
const SUBMITS = ["return", "linefeed", "enter"];

const EDITS = [
  [(key) => key.name === "left", (state) => text.move(state, -1)],
  [(key) => key.name === "right", (state) => text.move(state, 1)],
  [(key) => key.name === "backspace" || key.name === "delete", (state) => text.backspace(state)],
  [(key) => !key.ctrl && !key.meta && /^[^\p{C}]+$/u.test(key.sequence), (state, key) => text.insert(state, key.sequence)],
];
```
Skips `defaultPrevented` keys (`:21`), `stopPropagation` on submit/edit (`:23`, `:28`). Pure reducers in `text.js` (`insert backspace move`).

#### palette — `palette.js`

`TONES = { primary: signalPrimary, positive: signalPositive, caution: signalCaution, negative: signalNegative, strong: textStrong, ink: textInk, muted: textMuted, link: textLink }` (`palette.js:11-20`); `tone()` throws on an unknown name (`:22-25`). The palette object itself = dapper `FLAT` names: `surface surfaceSunk surfaceLift boundary textStrong textInk textMuted textLink signalPrimary signalPositive signalCaution signalNegative inverse inverseOn` (`subsystems/dapper/lib/tokens.js:116-131`). Panes read `palette.<name>` directly too (`dock.jsx:20`, `Markdown.jsx:20` `surfaceSunk`). No hex in ghost.

#### views

- `JsonTree` — `LEAVES` `[[predicate, tone]]`: null muted · string link · number caution · boolean primary; containers `[n]`/`{n}` muted, fully expanded, no folding (`JsonTree.jsx:4-20`).
- `Markdown` — line fold over fences, `BLOCKS`: fenced (link on surfaceSunk) · `#` heading bold strong · `-*+` item `•` · `>` quote `│` muted · else ink (`Markdown.jsx:4-25`). No inline emphasis, links, tables.
- `views.js` does NOT pick a view per buffer: it is the bundle entry. View choice = the frame's `negotiate(accept)` → `Mounted` vs `Floor` (`frame.jsx:67`).

---

### 5 · DEV / LOG

- No logger in ghost. Everything is `Span` records on the controller tree: `message · fault · turn · stream` (+ lighthouse `status` / `note` marks on its own span, `lighthouse.js:18`, `:44`). The repl prints `message·fault·turn`; the dock paints `message·fault·turn` + `stream`. The dock IS the log (boot messages are rows).
- `console.*` inside the chrome goes to opentui's console, toggled with `` ` `` (`index.js:18-19`), dumped to stdout on unmount (`:26-31`). The console mode's `/hello` does `console.log("mode/home/console", {ctx})` (`console.viva.js:15`) — lands there.
- No telemetry in ghost (grep `telemetry` → 0 in `systems/ghost` app/typology).
- runtime log when ghost boots it: `~/.viva/logs/<slug>/runtime.out.log` (`client/execution.js:71`, `attachment: "logged"`).
- tasks:
```jsonc
// systems/ghost/deno.jsonc:12
  "tasks": {
    "run": "deno run -A run.js",
    "watch": "deno run -A --watch run.js",
    "bundle": "deno run -A app/surface/chrome/bundle.js",
    "test": "deno test -A --no-check --watch tests/**/*.test.js",
  },
```
Root: `ghost/test · ghost/run · ghost/watch · ghost/install · ghost/bundle · ghost/scenario` (`deno.jsonc:36-45`); `install` chains `ghost/install` (`:28`).
- `bundle` path: `app/surface/chrome/bundle.js` EXISTS in this tree and writes `out/panes.mjs` — the map's "bundle names a dead path" (`world/codemap/map.md`) is stale against today's tree.
- `ghost/scenario` = `deno run -A --watch systems/ghost/tests/scenarios/hello.js` (`deno.jsonc:45`): `hello.js` has no main block (24 lines, exports only) → that task boots nothing. Known-issues `:12` still describes its "main block".
- `--watch` restart loses the first stdin line (known-issues `:12-20`).
- `install.sh`: writes `VIVA_REPOSITORY_MOUNT` into `~/.config/viva/env`, symlinks `~/.deno/bin/viva → ghost.sh`, caches the host, patches opentui core (`install.sh:9-17`).
- `bundle.js` exports `watch()` (`:42-52`) — no caller.

---

### 6 · TESTS

- `tests/world.js` is NOT the DEMO world: it is the OpenTUI rig — `settle(setup, passes=4)` and `screen()` = `testRender(() => [], {width: 100, height: 30})` (`world.js:3-10`), used by `keys.test.js:5`.
- the DEMO world is `tests/scenarios/hello.js`:
```js
// systems/ghost/tests/scenarios/hello.js:6
export const RECIPE = {
  ...hello.RECIPE,
  hallucinators: [{ module: "@commons/hallucinator/stub" }],
  daemons: [...hello.RECIPE.daemons, ...MEMO.daemons],
};

export const DEMO = {
  ...RECIPE,
  lighthouse: { ...RECIPE.lighthouse, traits: ["JOINABLE", "AUTOLOGIN"] },
  clients: [
    {
      manifest: { type: "client", slug: "ghost", traits: ["HOME"] },
      modes: ["@commons/home/console"],
      trait: { HOME: { reference: "/runtime/house/mode/home/probe" } },
    },
  ],
};
```
- `client.test.js` shape: `boot({recipe: DEMO})` spawns a runtime (`@vivalence/runtime/scenarios` `hello.boot`), a fresh `Paladin` assigned `world.env` at stratum `flag` (`client.test.js:6-13`), a `Client` with a no-op surface, execution NOT awaited (`:32-33`); assertions read `stdout.tail(...)` and `dispatch()` returns; `/quit` + `world.stop()` in `afterAll`. 4 steps, measured green:
  1. boot order `lighthouse · user · runtime`, `{runtime: "/runtime/house"}` (`:41-45`)
  2. HOME seats `/runtime/house/mode/home/probe`; `/modes` lists probe + `/daemon/memo/mode/srs/memo`; `/mode srs/memo` → `… · thread #`; `/mode mode` → `{which}` (`:47-53`)
  3. `ciao` → `user, assistant` turns, last stream `open: null`; `/mode/memo/harness ciao` → 4 turns; on probe a bare line → `NOT_FOUND` (`:55-65`)
  4. `/application/start` on probe faults `not an APPLICATION — its traits: RUNTIME · EXPOSED · TOOLING · DATASET`, buffer null; on memo → `application /daemon/memo/mode/srs/memo · buffer #`, entries contain `tty.solid`; `/application/stop` → `"frame closed"` (`:67-78`)
- `repl.test.js` (no world, 6 steps): `/help` tree `help · quit`, path `/ghost/client/help`; bare line without terminal → fault at `/ghost/client/*`; `/typo` fault; late tail replays journal; late graft answers next line; `/quit` → STOPPED.
- `console.test.js` (1): `accio("@commons/home/console")` → `/hello` = `"hello from ghost"`; `/help` branches `help · quit · hello · whoami`.
- `keys.test.js` (2, 15 steps): 14 `press` rows (`ctrl-t ctrl-o ctrl-f esc enter f F é / space tab backspace up meta-f`) + queue order/close.
- `text.test.js` (4).
- Nothing tests a pane (`dock.jsx`, `frame.jsx`, `chrome.jsx`) or `Input.jsx` headlessly.

---

### 7 · EVERY USER-VISIBLE ACTION TODAY

| nature | valence (verbatim) | dispatches | user sees |
|---|---|---|---|
| `viva` | — | shell `.do` → repl | boot messages, verb tree, `<< ` prompt |
| `viva --help` · `viva help` | "the shell's verbs. Example: viva help" | shell | `ctx.output: {…}` JSON |
| `viva repl` | "the repl as plain lines in this terminal. Example: viva repl" | shell → client + `surface.repl` | plain lines |
| `viva chrome` | "the repl under the chrome — the dock paints. Example: viva chrome" | shell → client + `surface.chrome` | full-screen dock |
| `--verbose` | — | `run.js:29` | stack on failure |
| `/help` | "the repl's verbs as a tree. Example: /help" | client.repl | strip tree (message) |
| `/quit` | "leave — the client stops, the shell exits 0. Example: /quit" | client.repl | exit |
| `/chrome/on` | "paint the dock over this terminal; the transcript stays. Example: /chrome/on" | client.repl (app) | `chrome on`, dock |
| `/chrome/off` | "drop to the plain repl; the transcript stays. Example: /chrome/off" | client.repl (app) | `chrome off`, plain |
| `/hello` | "the hosted mode answers from inside the repl's context. Example: /hello" | console mode repl (root) | `hello from ghost` |
| `/whoami` | "the user, the active terminal and its mode. Example: /whoami" | console mode repl | `{user, terminal}` |
| `/modes` | "every mode across the runtime and its daemons — reference and traits. Example: /modes" | terminal.repl | `[{reference, traits}]` |
| `/mode <words>` | "set the active terminal's thread to a mode's newest thread, or a new one; the words narrow, one match sets, else the candidates are the answer. Example: /mode memo" | terminal.repl | `<ref> · thread #<id>` or `{which}` |
| `/application/start` | "open the application of the active terminal's mode in the frame — its newest buffer on this thread, or a new one. Example: /application/start" | terminal.repl → `buffer.create` | `application <ref> · buffer #<id>`; chrome opens frame |
| `/application/stop` | "close the frame; the buffer stays on its thread. Example: /application/stop" | terminal.repl | `frame closed` |
| `/mode/<type>/<slug>/harness …` · `/mode/<slug>/harness …` | "a turn to THIS mode's harness on the active terminal's thread, named — …. Example: /mode/memo/harness ciao" | scoped mode repl → `harness.dialogue.stream` | streamed turn |
| `<bare line>` (`*`) | "a bare line — a turn to the active terminal's mode, streamed onto the thread's span. Example: ciao" | `turn.js` → `harness.dialogue.stream` | `›` user, `✦` assistant (chrome) / `>> …` (repl) |
| key enter | — | `Input.jsx:22` → `client.dispatch` | line sent |
| keys ← → backspace delete printable | — | `Input.jsx:8-13` | draft edit |
| key ⇥ | — | `frame.jsx:18-23` (only while a bundle is Mounted) | `⇥ keys to the frame/dock` |
| key `` ` `` | — | `index.js:19` | opentui console toggles |
| ctrl-c | — | `index.js:13-15` → SIGINT | exit |

---

### 8 · GAPS

- **no sign-in surface**: with neither a cached credential nor `AUTOLOGIN`, `authorized` waits on `$isAuthorized` forever (`lighthouse/execution.js:44`); `login`/`signup` exist (`lighthouse.js:52-58`) with 0 callers and no verb. `JOINABLE` · `INVITATIONAL` are empty bodies.
- **one terminal**: `active` takes `rows[0]` (`client/execution.js:213`); no verb or key creates, lists, switches or closes a terminal; `terminal.label` (LABELED) has 0 readers.
- **no thread history**: picking a thread paints nothing old — the dock tails the client span; Turn hydration marks only while attended (`turn.js:17`); `thread.$turns` (`thread.js:31`) has 0 readers. No thread list, no thread verb.
- **unpainted stores**: `runtime/daemon.$status` (host health), `lighthouse.$status`/`user`, `thread.$activity`, `cortex`, `cargo` — 0 pane readers (grep). No status row, no daemon pips, no busy lamp.
- **no stop**: `Activity.controller.stdin.<signal>` wired to the wire (`activity.js:35`); nothing in ghost sends pause/stop/resume.
- **parts**: a non-text part paints `[type]` (`dock.jsx:20`, `repl.js:12`); tool calls/yields have no view. Plain repl never shows `stream`.
- **input**: single line, no history recall, no home/end/word-jump/kill, `delete` = backspace (`Input.jsx:11`), no completion over the strip tree. Backtick both toggles the console AND types into the draft (feed has no `stopPropagation`, `index.js:18-19`).
- **no mouse/selection**: no `onMouse*` anywhere; the scrollbox has no scroll keys; JsonTree cannot fold or select.
- **frame**: fixed 48-col dock when framed (`chrome.jsx:15`); Floor has no keys and ⇥ exists only under `Mounted`; Input does not read `focused()` — a frame view that does not `preventDefault` shares keys with the draft. memo's tty face is dead (`memo.jsx:3` → sheets).
- **theme fixed**: `tokens("northsea", "2")` (`index.js:24`) — no theme/zone switch, no user THEMED read.
- **timing**: the surface mounts before runtime reach (`client/execution.js:221-222`) — the chrome is up while booting, but has no boot/cover pane; a non-TTY `viva chrome` fails after `modes`, before the runtime.
- **latent**: a RUNTIME mode row that declares `REPLING` would hit `mode.module.repling` with `module = null` (`repling.js:2`, `mode.js:14`) — the host staggers the same catalog (`host.js:53`). Same for `EXPOSED` on a client-hosted mode (`connection = null`).
- **dead/loose**: `bundle.js watch()` no caller; `Dataspace.fork()` no caller; `Client.json` · `Runtime.json` no reader; comments in product source at `app/surface/repl.js:16`, `chrome/index.js:21-23`; shell prints answers with a debug prefix `ctx.output:` (`shell/index.js:9`); `ghost/scenario` task boots nothing; map's "bundle names a dead path" stale.

## 5 · anima — the browser client, measured

`systems/anima/` is the browser client: a SvelteKit SPA built with `adapter-static` and `fallback "200.html"` (`svelte.config.js:13`), routes in `src/app` (`:22`), `ssr = false` (`src/app/+layout.js:1`). It is served by `vite@6 dev` (`deno.jsonc:17`) on `client.statics.serve` (`vite.config.mjs:14,28-29`) at `:1794`.

- **It does not build today** (§5·10).
- Every claim was read in the working copy. `.ikiro/reference/anima.md` is dated 09-24 (`pqxuzpnm`) and is stale (§5·10.6).

```js
// systems/anima/vite.config.mjs:123
      $telemetry: join(__dirname, "./src/telemetry/index.js"),
      $client: join(__dirname, "./src/client.js"),
      "@vivalence/anima": join(__dirname, "./src/typology/mod.js"),
      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),
// systems/anima/src/client.js:1
export const LIGHTHOUSE = Symbol("lighthouse"); // dataspaces & daemons
export const BRIDGE = Symbol("bridge"); // layout & controls
export const TERMINALS = Symbol("terminals"); // terminals collection + active terminal/thread/daemon/mode
export const BOX = Symbol("box"); // device drivers — mic, speaker, etc.
```

### 1 · boot + auth

```js
// systems/anima/src/app/+layout.svelte:28
  const connection = new Connection(
    new Url(env.PUBLIC_VIVA_RUNTIME_REMOTE),
    shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }),
  );
  connection.use(shard.track.span((call) => call.request.url.pathname, logger.channel));
  const lighthouse = new stores.lighthouse.Lighthouse(connection, { channel: logger.channel });
  stores.lighthouse.hydrate(lighthouse);
```

```js
// systems/anima/src/app/gate.js:1
export const gateFor = (authorized, status) => {
  if (!authorized) return "signin";
  if (status.code === "OFFLINE" || status.code === "ERROR") return "signin";
  if (status.code === "POPULATING") return "populating";
  if (status.code !== "VERIFIED") return "verifying";
  return "ready";
};
// systems/anima/src/typology/stores/lighthouse.js:251
export async function boot(lighthouse) {
  await verifyAuth(lighthouse);
  if (!lighthouse.$isAuthorized.get()) return false;
  await populate(lighthouse);
  return true;
}
```

**Startup**, in order:

1. `hydrate` restores `{authority, user}` from `localStorage["lighthouse:<url>"]` and writes it back on every change (`lighthouse.js:8, 203-233`).
2. `Bridge` · `Terminals(lighthouse.dataspace.terminal)` · `Box` become contexts (`+layout.svelte:37-44`). `window.__viva` is a devtools hack (`:46-48`).
3. `verify()` runs:
   - With no token it returns `NO_TOKEN` and the status stays `IDLE`, which gates to signin (`lighthouse.js:94-98`).
   - With a token it goes `VERIFYING` → `/lighthouse/verify {access}` (`:100-102`).
   - A network error sets `OFFLINE` (`:104-110`).
   - An auth error runs `refresh()` → `/lighthouse/refresh` (`:113-115, 131-171`); a refused refresh logs out with `SESSION_EXPIRED` (`:150-153`).
4. `populate()`: `POPULATING` → `/metadata/manifest` → `/metadata/datamap` → find `daemon` + `terminal` → `terminal.subscribe()` → `$daemons` → `VERIFIED` (`:258-290`).
5. Daemons mount in the background: their own connection + multiplex + `Dataspace`, with a 5 s → 60 s backoff (`entities/daemon/dossier.js:56-91`).

**Screens** (`+layout.svelte:109-124`):

| gate | user sees |
|---|---|
| `/design*` | the audit page, no auth (`:109`) |
| `boot` · `verifying` · `populating` | `Boot.svelte`: Spinner + the gate word + a log tail since the last `/authority` open (`Boot.svelte:45-51, 66-91`) |
| `signin` | `Login.svelte` |
| `ready` | `+page.svelte`; with 0 terminals, a blurred `Key "open terminal"` overlay (`:113-117`) |

**Login** (`widgets/Login.svelte`):
- the brand `vivalence/anima` (`:37`)
- a Card "lighthouses (1)": slug or host · remote · Pip + standing (`:40-50`)
- a `Pressed` form: username · password · `connect`, plus `retry` when authorized but failed (`:51-60`)
- a "help" card: no signup UI, `viva instance/user signup`, and an LLM diagnosis prompt to copy (`:20-26, 63-72`)

```js
// systems/anima/src/typology/stores/lighthouse.js:72
  async enter(route, credentials) {
    this.$status.set({ code: "AUTHENTICATING" });
    const response = await this.connection.fetch(route, credentials);
    if (response.error) {
      this.$status.set({ code: "ERROR", message: response.error.message, type: response.error.type });
      return { status: "ERROR", error: response.error };
    }
    const { authority, user } = response.body;
    if (authority) this.$authority.set(authority);
    if (user) this.$user.set(user);
    this.$status.set({ code: "AUTHENTICATED" });
```

- **The runtime answers** `{status:"SUCCESS", authority:{access,refresh}, user:card}` (`systems/runtime/lifecycle/lighthouse/aperture.js:22-30`).
- **JWT**: HS256 via jose; access `1d`, refresh `180d` (`lighthouse/signer.js:4-5,16-19`).
- **The token lives** in three places:
  - localStorage
  - `$authority`, which `shard.connection.authorize` stamps as `Bearer` (`subsystems/typology/gestalten/shard/connection.js:3-9`)
  - each multiplex (`lighthouse.js:50`, `dossier.js:63`)
- **Autologin: none in anima** (grep = 0). The runtime grafts `/autologin` under the `AUTOLOGIN` lighthouse trait (`runtime/lifecycle/lighthouse/traits/autologin.js:6-16`); only `systems/ghost/bak/` called it.
- `signup()` exists in the store (`lighthouse.js:64`) with no UI.
- `logout()` clears the authority, closes the multiplex and fires `/lighthouse/logout` (`:173-183`).

### 2 · the bones

```svelte
// systems/anima/src/app/+page.svelte:99
  <PanelA rect={rects.a} />
  <div class="chassis" class:full class:hairline={thickness === stores.bridge.HAIRLINE}>
    <PanelB rect={rects.b} />
    <PanelC rect={rects.c} />
    <BoneShoulder rect={bones.shoulder} names={flowed.shoulder} open={opened} ontoggle={toggleWidget} onmeasure={measure} />
    <BoneCrown rect={bones.crown} names={flowed.crown} open={opened} ontoggle={toggleWidget} onmeasure={measure} />
    <BoneSpine rect={bones.spine} />
  </div>
  <BonePincer rect={bones.pincer} {gesture} />
  <PanelG />
  <PanelH />
```

```
orientation 0  (geometry.js:62-77, 144-170; bone 45px, hairline 4px :1-2)
┌──────────────────────── A · stage (Frame + dock) · zone 1 ────────────────────────┐
├──────── shoulder ────────┬─■─┬───────────────── crown ────────────────────────────┤ ← pincer.y
│  B · rail · zone 0       │ s │   C · panes · zone 0 (8 cards + Strip)             │
│  config·auth·box·dock    │ p │                                                    │
│                          │ i │                                                    │
│                          │ n │                                                    │
│                          │ e │                                                    │
└──────────────────────────┴───┴────────────────────────────────────────────────────┘
 ■ viket (45×45)        G telemetry (zone 0) + H inspector (zone 3) float, no rect
```

**First placement** (`stores/bridge/start.js:13-32`):

| screen | orientation | pincer | fold | result |
|---|---|---|---|---|
| desk | 270 | (422.5, 22.5) | free | B and the shoulder are 0 tall; C is a 400 px left column; A fills the right |
| tablet | 0 | (22.5, h/2) | page | |
| phone | 180 | (22.5, 322.5) | page | |

```js
// systems/anima/src/app/bones/flow.js:1
export const WIDGETS = ["terminals", "buffers", "harness", "dock"];
// systems/anima/src/app/bones/flow.js:7
export const flow = ({ names, sizes, room, gap = GAP }) =>
  names.reduce(
    (held, name) => {
      const next = held.used + (held.shoulder.length ? gap : 0) + (sizes[name] ?? 0);
      return held.crown.length || next > room
        ? { ...held, crown: [...held.crown, name] }
        : { ...held, shoulder: [...held.shoulder, name], used: next };
    },
```

- **shoulder · crown** are the same shell (`crown/crown.svelte` ≡ `shoulder/shoulder.svelte`): a `data-zone="0"` flex box → `Widgets.svelte`.
- Widgets fill the shoulder, then the overflow goes to the crown. With no thread, only `terminals` is shown (`+page.svelte:67`).
- Each widget is a `Key size="bone"` that opens a `Float`:

| widget | on the bone | Float | source |
|---|---|---|---|
| Terminals | `view-columns` + count | rows label·id·daemon›mode, live pulse, ✕, `+ terminal` | `terminals.$entities`, `roster` (`bones/widgets/Terminals.svelte:54-86`) |
| Phase ("buffers") | digram ⚏⚎⚌⚍ + `k/n` | 2×2 phases + refusals; verbs prev·next·home·more·stop; release; queue rows; `queue n · depth d`; errors (click clears) | `thread.$phase·$integrity·$errors·$buffers`, `terminal.$buffer` (`Phase.svelte:9-20, 72-124`) |
| Harness ("intelligence") | `brain` + ≤15 activity ticks | `Tune` + "context" tokens, or "off · the mode answers without a model" | `roster`, `$traits`, `$turns` (`Harness.svelte:41-74`) |
| Dock | `chat/lines`, tinted while RUNNING | sides ↑→↓←, share 18–100 %, `open` · `full` | `terminal.$dock`, HARNESSED (`bones/widgets/Dock.svelte:31-70`) |

**spine** (`bones/spine/spine.svelte`):
- a lighthouse button, open by default when verified (`:95, 188-221`), with one Pip per daemon plus live-activity ticks
- hover → a tooltip card: slug · code · modes · threads · activities (`:225-251`)
- click → a pinned `Float` (`:253-316`):
  - facts
  - connections: every daemon, each re-pins
  - activities, with pause/stop/resume

**pincer** (`bones/pincer/pincer.svelte`):
- the bone square (`:111-120`)
- the draggable viket, masked by `/images/pictogram_viket/pic-vinca-viket_white.svg` (`:124-144, 347`)
- the radial (`:151-220`):
  - 4 orientation spokes, each a mini-map of its A/B/C split
  - 3 tiles `TOGGLES = { snap: 315, hair: 225, full: 135 }` (`stores/bridge/gesture.js:32`)
  - a `home` dot and a hint line

The gestures (`gesture.js`):

| input | effect | line |
|---|---|---|
| hold 420 ms | opens the radial, vibrates | `:16, 126-132` |
| drag | grid snap + wall snap | `:135ff` |
| tap ×1 | → `previous` | `:234` |
| tap ×2 | → `standard` | `:235` |
| tap ×3 | set `standard` | `:236-239` |
| tap in full | exits; a multi-tap toggles autoHide | `:228-232` |
| Escape in full | exits | `pincer.svelte:94-99` |

### 3 · panels

**A · stage** (`panels/a/a.svelte`, `data-zone="1"`):
- `Frame` over the active terminal + the derived view (`:26-33, 112-126`)
- `Empty` states: settling · no thread · conversational · resolving · "buffer has no view" + refusal (`:89-101, 115-122`)
- when HARNESSED and not collapsed: a seam + `Dock` (`:132-151`). The dock holds:
  - `DockHead`: Status · label · `⋮⋮ meta` · side picker · ⤢ · × (`DockHead.svelte:33-68`)
  - the turn log
  - `Composer`
- meta consoles `context · meter · activity` (`Dock.svelte:72`) all open the C `harness` pane (`a.svelte:61-66`).

**B · rail** (`panels/b/b.svelte`, `data-zone="0"`):
- sections `config · auth · box · dock` (`:13-18`)
- folds `page | stack` (`stores/bridge/panes.js:152-156`)
- a `Strip`

| section | controls |
|---|---|
| config (`BridgeSection.svelte:38-99`) | readings change·commit·bundled·viewport; theme ×4; font ×7; snap; enter sends; logger (G); inspector (H); orient ×4; strip top/bottom |
| auth (`LighthouseSection.svelte:34-63`) | avatar·slug·state·remote; `refresh`; `sign out`; daemon roster (display only) |
| box (`BoxSection.svelte:57-95`) | mic on/off · live/muted · level Meter; speaker on/off · `tone` (440 Hz, 0.3 s) · `flush` |
| dock (`DockSection.svelte:23-57`) | 4 sides; 8 share cells; show; full |

**C · panes** (`panels/c/c.svelte`, `data-zone="0"`):
- 8 cards (`:23`) in a split tree held in `bridge.panels.c` (`:26-30`)
- folds `page · stack · accordion · free` (`panes.js:7, 100-111`)
- in `free`: drag a head onto a card to swap it or insert at an edge, and drag seams to set ratios (`c.svelte:101-152`)
- in `stack`: height handles

```js
// systems/anima/src/typology/stores/bridge/panes.js:4
export const PANE_NAMES = ["terminal", "threads", "modes", "thread", "mode", "buffers", "buffer", "harness"];
// systems/anima/src/typology/stores/bridge/panes.js:122
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
```

The **Card head** (`cards/Card.svelte:35-50`): label · meta · `action` · ⤢ solo · ✕ park. It grabs in `free` and taps in `accordion`.

| card | shows | clickable |
|---|---|---|
| terminals | name · id rows | row → activate; ✕; `+ terminal` (`Terminals.svelte:50-68`) |
| threads | top 3 by `updatedAt` (+N more), label · age | row → seat; ✎ rename inline; ✕ ×2 delete; `+` mint; `⟳` cycle daemon (`Threads.svelte:107-148`) |
| modes | dot · name · type (APPLICATION or HARNESSED) | row → re-mode on the same daemon, else mint; APPLICATION → `standalone.open` (`Modes.svelte:39-60`, `threads.js:32-36`) |
| thread | crumb daemon › label · loudest state; links mode · buffers k/n · harness; trait chips | chips LABELED · MASKED · AIMED · QUEUEING open editors; AIMED and QUEUEING toggle; save-as-intent COMMENTED (`Thread.svelte:13-18, 122-151, 132-138`) |
| mode | badge · name · type · trait pills with a gloss | `new thread`; `replace` (only opens modes) (`Mode.svelte:9-17, 53-76`) |
| buffers | cursor hint; index · name · status | open (AIMED pull, else create from MASKED); start/stop queue; phase verbs; release; row → cursor; clear (`Buffers.svelte:4-20, 113-152`) |
| buffer | mode name · type; hooks mount · unmount · release, lit | clear only (`Buffer.svelte:42-68`) |
| harness | tiles input · output · context · calls; tune · effort · thinking; rounds −/n/+; Faculty | each knob writes `trait.INTELLIGENT`; a second click clears (`Harness.svelte:59-108`) |

**Trait editors**: Aimed writes `trait.AIMED.mount` from `/emit/<nature>` rows (`Aimed.svelte:23-38`) · Labeled name + description, 5 s debounce (`Labeled.svelte:21-55`) · Masked = `FormFromSchema` over `maskSchema` (`Masked.svelte:24-44`) · Queueing depth cells + Stepper 0–10 (`Queueing.svelte:31-42`).

```js
// systems/anima/src/app/panels/c/cards/traits/form/schema.js:51
const kindOf = (sub) => {
  const entity = entityOf(sub);
  if (entity) return entity.multiple ? "entity-set" : "entity-ref";
  if (optionsOf(sub)) return "enum";
  if (sub?.type === "integer" || sub?.type === "number") return "number";
  if (sub?.type === "boolean") return "boolean";
  return "string";
};
// systems/anima/src/app/panels/c/cards/traits/form/schema.js:81
export const maskSchema = (mode, traits, trait) => {
  if (traits?.includes("AIMED") && trait?.AIMED?.mount) {
    const nature = trait.AIMED.mount.replace(/^\/emit\//, "").replace(/^\//, "");
    return mode?.metadata?.emitter?.branches?.[nature]?.effect?.input ?? null;
  }
  const application = mode?.application?.schema;
  if (!application) return null;
  const top = propsOf(application);
  const data = propsOf(top.data);
  const relations = Object.fromEntries(Object.entries(top).filter(([, sub]) => entityOf(sub)));
  return { type: "object", properties: { ...data, ...relations } };
};
```

**FormFromSchema** (`FormFromSchema.svelte:17-73`): `enum` → `<select>` · `number`/`string` → `Input` · `boolean` → checkbox · `entity-ref` → `EntityField` · `entity-set` → `EntitySetField` (search lane + "symbols ∩" facets + `add all`, `EntitySetField.svelte:77-133`). Entities are detected by `$id` `Literal`/`Symbol` (`schema.js:30-49`); search debounces 160 ms over an in-memory symbol catalog or `literal.find({search},{orderBy:{rank:"ASC"}})` (`picker.js:14-52`).

**G · telemetry** (`panels/g/g.svelte`, a `data-zone="0"` overlay while `view.g` is on):
- list: modeline `G › telemetry` · fault count · total · ✕, then faults · slow (> 500 ms) · recent · tree (`:162-207`)
- span detail: timing · entries JSON · fault · children · waterfall · ← (`:50-160`)

**H · inspector** (`panels/h/h.svelte`):
- a `data-zone="3"` drawer `50 + inspectorHeight` px tall, with a drag handle (`:20-39, 44-76`)
- a modeline `H › inspector` · `G` · ×
- the body is a `skins.Skin variant="breadcrumb"` (`Inspector.svelte:8-15`) over the projection below

Live rows: `logout` · `spawn` · `clear` · terminal → activate (`telemetry/inspector.js:39,48-54`).

### 4 · stores — every `$`-atom

| store | atoms | at |
|---|---|---|
| Lighthouse | `$authority`(map) · `$user`(map) · `$status` · `$isAuthorized` · `$isIdentified` · `$daemons` | `stores/lighthouse.js:13-20` |
| Terminals | `$active` · `$entities` (sorted by index) | `stores/terminals.js:5,9` |
| Bridge.layout | `$pincer` · `$previous` · `$standard` · `$orientation` · `$inspectorHeight` · `$terminal` · `$viewport` | `stores/bridge/bridge.js:68-79` |
| Bridge.view | `$strip` · `$g` · `$h` · `$snap` · `$hair` · `$full` · `$theme` · `$fontSize` | `:81-93` |
| Bridge.panels.{b,c} | `$tree` · `$fold` · `$expanded` · `$heights` · `$previous` | `:95-98` |
| Bridge | `$safeAreaTop` · `$viewportOffsetTop` · `$composer` | `:100-105` |
| Gesture | `$dragging` · `$longPress` · `$fromSticky` · `$radial` · `$flash` · `$hidden` · `$autoHide` | `gesture.js:81-87` |
| AudioDriver | `$state` | `box/drivers/audio/audio.js:5` |
| Microphone | `$claimed` · `$permission` · `$error` · `$level` · `$speaking` · `$paused` | `box/device/microphone/microphone.js:10-15` |
| Speaker | `$claimed` · `$playing` · `$error` | `box/device/speaker/speaker.js:8-10` |
| logger | `$selected` · `$story` | `telemetry/logger.js:4,6` |

```js
// systems/anima/src/typology/stores/bridge/bridge.js:136
  save = () => {
    try {
      const data = { ...this.layout.toJSON(), view: this.view.toJSON(), panels: { b: this.panels.b.toJSON(), c: this.panels.c.toJSON() }, composer: this.composer };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  };
// systems/anima/src/typology/stores/bridge/dock.js:7
export const DEFAULT_DOCK = { side: "right", share: SHARE_DEFAULT, collapsed: true, full: false };
```

- **Bridge persistence**: the key is `vivalence:bridge`. `client.html:5-10` reads the theme from it before first paint.
- **Box** — what the box controls drive:
  - `AudioContext({sampleRate:16000})` (`audio.js:10`)
  - the mic worklet posts frames of 1024 `Float32` samples into a `Pipe` (`microphone/worklet.js:1-21`, `microphone.js:79-82`)
  - VAD: threshold 0.02, rise 100 ms, fall 600 ms (`microphone.js:5-7`)
  - the speaker `Queue` drains into the worklet through a 1600-sample jitter buffer (`speaker.js:5, 88-93`)
- **Defects**:
  - `lighthouse.$populating` is a promise property, not a store (`lighthouse.js:259-288`).
  - `user?.trait?.THEMED?.theme` (`+page.svelte:76`) is the rejected `row.trait?.NAME`.

### 5 · entities + traits + the application bundle

- Each entity is a dossier `{name, kind, repository, use[]}` that `Dataspace` boots (`prototypes/dataspace.js:12-41`; its own comment at `:11` says "ugly retarded slop").
- The lighthouse holds `daemon · terminal` (`lighthouse.js:56-61`).
- Each daemon holds `mode · intent · thread · buffer · turn · activity · literal · symbol` (`daemon/dossier.js:24-33`).
- thread · buffer · turn · intent · activity · terminal ride `/userspace/entities/*` on the runtime; mode · literal · symbol ride the daemon's `/entities/*`.

```js
// systems/anima/src/typology/entities/daemon/dossier.js:103
    const [status, manifest, stripped, aperture, statics] = await Promise.all([
      daemon.connection.call("/status"),
      daemon.connection.call("/metadata/manifest"),
      daemon.connection.call("/metadata/cortex"),
      daemon.connection.call("/metadata/aperture"),
      daemon.connection.call("/metadata/statics"),
      daemon.cargo.refetch(),
      daemon.entities.init(),
    ]);
// systems/anima/src/typology/entities/daemon/dossier.js:145
    for (const mode of modes) {
      object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
    }
```

**mode** (`entities/mode/mode.js:7-29`): `$application` and `implements(trait)`. `applyTraits` runs one function per manifest trait (`gestalten/belt/runner.js:1-9`):

EMITTER → `/metadata/emitter` → `mode.emit` (`emitter.js:29-30`) · EXPOSED → `/metadata/aperture` → `mode.call` (`exposed.js:3-6`) · HARNESSED → `/metadata/harness` → `mode.harness`, merging every `/tool/yield` entity bag into local repos (`harnessed.js:6-39`) · GENERATIVE no-op (`application.js:12`) · `standalone.open` seats the mode's last buffer or creates one (`standalone.js:1-10`).

```js
// systems/anima/src/typology/entities/mode/traits/application.js:1
import { View } from "@vivalence/typology";
export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = {
    url: record.url,
    schema: record.schema,
    view: new View(record.view).withUrl(record.url),
  };
};
```

**The bundle, in today's typology + drapes**: it is fetched, checked against sha256, turned into a blob URL, imported, and cached by integrity (`bundle.js:44-48`). Bundles get an import map with `svelte@5.39.6` and `carbon-icons-svelte@13` from esm.sh (`client.html:44-54`).

```js
// subsystems/typology/prototypes/bundle.js:34
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
// subsystems/drapes/panels/Frame.svelte:62
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
```

**thread** (`entities/thread/thread.js:9-64`):
- atoms: `$mode` · `$phase`("manual") · `$traits` · `$trait`(deepMap) · `$label` · `$errors` · `$integrity`
- the dossier adds `$buffers`, `$turns`, forces LABELED, toggles MASKED from the application schema, and persists a re-mode (`thread/dossier.js:24-48`)

```js
// systems/anima/src/typology/entities/thread/thread.js:9
const PHASES = {
  inert: [],
  manual: [],
  continuous: [aimed.valid, queueing.valid],
  escort: [],
};
// systems/anima/src/typology/entities/thread/traits/aimed.js:8
export const pull = async (thread, args = {}) => {
  const emission = await thread.mode.connection.call(
    thread.trait.AIMED.mount,
    object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
  );
  const buffers = emission?.output?.buffer ?? [];
  return Promise.all(buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)));
};
```

Thread traits: `queueing.depth` defaults to 1 (`queueing.js:10`); `labeled.label` is a one-shot (`labeled.js:23-39`); `masked.js` is an empty function, DEAD (`masked.js:1`).

The other entities:

| entity | holds | file |
|---|---|---|
| terminal | `$thread` · `$buffer` · `$dock` · `$settling` (`:21-24`); `seat(thread)` writes `{daemon, thread}` (`:51-53`); dock → `trait.DOCKED`, debounced 250 ms (`:55-63`); `mountSeat` (`:67-117`); `mountStall` → typology `Stall({source, active, phase, pull, depth})`, a release removes the buffer (`:119-156`) | `entities/terminal.js` |
| buffer | `$data` · `$view` (casts to `View`) · `$traits` · `$trait` · `$label`; `hooks` + `on.mount\|unmount\|release` via `fn.once` | `buffer.js:5-87` |
| turn | plain `role · parts · meta · thread · mode · parent` | `turn.js:4-11` |
| activity | `$status`; stdin/stdout ← `daemon.call.userspace.entities.activity[id]` (`:76-83`); `roster` · `loudest` (RUNNING > STOPPING > PAUSED > IDLE) · `TONES` · `owed` (`:31-65`) | `activity.js` |
| intent · literal · symbol | bare | |

**prototypes**: `Cargo` (`/metadata/cargo`, 2 s refetch on a miss) · `Entity.toJSON` · `dictation` (§5·7) · `conversation` (exported, 0 consumers) · `todo/bell` (unexported). **belt**: `chain(root, ...path)` is how every view reads live data, e.g. `chain(terminals, "$active", "$buffer", "mode", "$application")` (`chain.js:25-31`, `a.svelte:22`) · `narrow` (no app importer) · `applyTraits`.

### 6 · telemetry

```js
// systems/anima/src/telemetry/logger.js:20
export const channel = new Pipe();
channel.tap((record) => $story.set(trim(trace.chronicle.step($story.get(), record))));
export const logbook = new Span("client").to(channel);
export const entry = (nature) => logbook.branch(nature);
// systems/anima/src/typology/entities/daemon/dossier.js:132
    const activity = new Span(`daemon/${manifest.slug}/activity`).to(logger.channel);
```

- **What it captures**:
  - lighthouse wire spans (`+layout.svelte:32`)
  - daemon wire spans (`dossier.js:65`)
  - `logger.entry(x).open|note|fault|close` across the app
  - activity create/update ops + each stdout record (`dossier.js:133-139`)
  - the trim keeps 200 roots (`logger.js:8-18`)
- **Where it shows**: the Boot tail, panel G, and in DEV a `console.debug` line (`+layout.svelte:50-59`).
- **It never reaches the runtime**: a local `Pipe`, with no transport in `src`.
- `inspector.compose()` is pure over 7 stores (`inspector.js:12-24`).

### 7 · focus, keys, dictaphone, composer, streaming

- **`app/focus.js` has no key logic.** It hydrates each terminal's thread: `buffer.find({thread},{populate:["literals","symbols"]})` + `turn.find`, then subscribes both (`focus.js:6-32`).
- **Global keys**: only Escape-exits-full (`pincer.svelte:94-99`). Rows answer Enter locally (`cards/Row.svelte:4-8`, `spine.svelte:198,206`).

```js
// systems/anima/src/app/panels/a/widgets/Dock.svelte:206
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
// systems/anima/src/app/panels/a/widgets/Dock.svelte:170
    try {
      for await (const turn of soma.scan(
        thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }),
      )) {
        live = { ...turn };
        pinBottom();
      }
```

**Composer** (`Composer.svelte`):
- a fault line and a `↓ N new` pill (`:56-70`)
- a dictation line: Status + committed + tail (`:72-78`)
- a textarea, sealed when unharnessed or listening (`:37-38, 49-52`)
- a tune key → `Float` `Tune` (`:90-100, 132-136`)
- `Dictaphone`, only when the daemon cortex has a `verbatim` faculty (`:103-105`; `Dock.svelte:35`)
- stop vs send (`:106-127`):
  - **stop**: SIGTERM; hold 2 s → SIGKILL to owed activities (`stop.svelte.js:22-42`)
  - **send**: a paper-airplane key

**Dictation** (`prototypes/dictation.js:15-79`):
- it claims the mic and streams `/audio/packet` through `pcm.encode` into `thread.mode.harness.verbatim.stream`
- `verbatim.fold` feeds `$committed` and `$tail`
- `settle` splices the text at the caret (`Dock.svelte:136-147`, `dictate.js:1-9`)

**Streaming**:
- An optimistic `echo` user turn shows until the persisted turn arrives (`Dock.svelte:116, 164`).
- `live` → `project` → `LiveTurn`, whose word is `calling <tool>` | `streaming` | `thinking`, with an elapsed ticker (`:118-129, 349-359`).
- Persisted turns: `thread.$turns` → `enrich()` drops tool-result turns, adds day dividers and joins assistant runs (`turns.js:312-327`).
- **Turn** (`Turn.svelte:133-198`):
  - a head: agent · time · "thinking · N calls" · failures · usage · ⧉
  - a `Well` of `ToolRow`s, channels input/entities/object, entity rows with a strength `Meter`
  - buffer launch keys
  - a thinking section
  - `Markdown`; a user turn as a bubble with ⧉ + retry
  - verdict
  - artifacts: img · audio · link

### 8 · the design system in use

```js
// systems/anima/postcss.config.js:8
const config = {
  plugins: [
    postcssPlugin,
    tailwindcss(),
    autoprefixer,
  ],
};
// systems/anima/src/client.css:5
html, body {
  margin: 0;
  padding: 0;
  overflow: clip;
  background: var(--surface);
  color: var(--text-strong);
  font-family: var(--font-family-sans-text);
```

- **dapper**:
  - anima imports `font.css` only (`+layout.svelte:2`); the tokens arrive through PostCSS + `tailwindClasses` (`tailwind.config.js:4-8`)
  - themes `northsea · parchment · porcelain · datasette` (`dapper/themes/index.js:6`, `bridge.js:29`)
  - token groups: shape · size · text · control · signal × 4 · zone[0..3] + brand (`.ikiro/reference/design.md:76-232`)
- **Zones used**: 0 for the bones, B, C, G · 1 for A and `body` (`client.html:41`) · 3 for H. Zone 2 is unused.
- **drapes symbols anima imports** (25, all resolve in `subsystems/drapes/mod.js`): `Card Chip Empty Float Frame Input Json Key Markdown Meter Pip Pressed Reading Row Section Segmented Spinner Status Stepper Strip Tag ToolRow Well place skins`.
- **drapes on disk**: `context` · `controls` (Key · Field · Input · Segmented · Stepper · Textarea · ViewportLock …) · `decor` · `display` (27 atoms) · `panels` (Frame · Card · Icon · Desk · Loader · Float) · `skins` · `stage` · `triage` · `editor` (subpath) · `dom` (Solid, not in `mod.js`).

- **The `/design` audit page** (`app/design/+page.svelte:112-221`):
  - zone territories ×4 and the places table (`reference.js:8-22`)
  - the live token space read from `document.styleSheets` (`sheet.js:12-26`)
  - the words table and the raw sheet
  - the kit in all 4 zones
  - a contrast audit per theme (`audit.js:18-36`)
  - the size ramp
- **Literals**: the Svelte views carry 0 hex. The literals are `client.html:16` `#000000` (theme-color), `client.html:30` `darkgray`, and `client.css:16-21` `red` (debug only). There are 34 hard `font-size: Npx`, e.g. `bones/widgets/Terminals.svelte:97,143,149`.

### 9 · every user-visible action

| control | where | calls | state |
|---|---|---|---|
| connect · retry · help | Login | `login` → `boot` | live |
| open terminal | overlay at 0 terminals | `terminals.create` | live |
| tap ×1/×2/×3 · drag · hold → spoke/tile/home · Esc | pincer | `gesture.*` → `layout`, `view.snap/hair/full` | live |
| lighthouse · daemon hover/click · pause/stop/resume | spine | `row.stdin.SIGSTOP/SIGTERM/SIGCONT` | live |
| row · ✕ · + terminal | bone Terminals | `activate` · `remove` · `create` | live |
| phase cell · prev/next/home/more/stop · release · errors | bone Phase | `engage` + `updateOne({phase})` · `aimed.pull` · `buffer.release` | live |
| tune · effort · rounds · thinking | bone Harness, composer, C harness | `write(thread, patch)` → `trait.INTELLIGENT` | live |
| sides · share · open · full | bone Dock, B dock, dock head | `setDock*` | live |
| seam drag | A | `dragDock`/`dropDock` | live |
| meta → context/meter/activity | dock head | opens C `harness` (all 3) | half |
| send · Enter · ↑ recall | composer | `harness.dialogue.stream` | live in source; nothing renders (§5·10) |
| stop · hold kill · Esc | composer | `stdin.SIGTERM/SIGKILL` | live |
| dictaphone | composer | `dictation.start/stop` | live if verbatim |
| ⧉ · retry · launch · folds | Turn | clipboard JSON · resend · `$buffer.set` | live |
| theme · font · snap · enter sends · logger · inspector · orient · strip | B config | `bridge.*` | live |
| refresh · sign out | B auth | `boot` · `logout` | live |
| mic on/live · speaker on · tone · flush | B box | `microphone.*` · `speaker.*` | live |
| strip tap / hold 450 ms / fold key | B, C | `pick` · `solo` · `refold` | live |
| head grab/tap · ⤢ · ✕ · seam · height | C | `panes.move/solo/remove/setRatio` | live |
| row · ✎ · ✕✕ · + · ⟳ | C threads | `seat` · `rename` · `removeOne` · `mint` | live |
| row | C modes | `pickMode` (+ standalone) | live; the APPLICATION view is RED |
| new thread · replace | C mode | `mint` · open the modes card | live |
| chips · + / × · editors | C thread | `updateOne({traits})`, trait writes | live |
| save as intent | C thread | `intent.create` | DEAD (`Thread.svelte:132-138`) |
| open · queue · verbs · release · row · clear | C buffers | `createBuffer` · `engage` · `buffer.remove` | live; the view mount is RED |
| clear | C buffer | `buffer.remove({thread})` | live |
| span · ← · × | G | `$selected` · `toggle("g")` | live |
| G · × · handle · logout/spawn/clear/activate | H | Skin rows | live |
| theme picker · kit | `/design` | `dataset.theme` | live, no auth |

"live" means the path is complete in source. No row was clicked in a browser: the build is red.

### 10 · RED

**1 · `View` left typology.** The working copy deleted `subsystems/typology/prototypes/view.js` (−40 lines). A probe of `mod.client.js` against all 28 typology names anima imports prints `MISSING: View`; the other 27 resolve.

```js
// git show HEAD:subsystems/typology/prototypes/index.client.js:27
export * from "./bundle.js";
export * from "./view.js";
// systems/anima/src/typology/entities/buffer.js:2
import { fn, View, RemoteRepository } from "@vivalence/typology";
// systems/anima/src/typology/entities/mode/traits/application.js:1
import { View } from "@vivalence/typology";
```

**2 · The wire drifted.** The runtime sends `bundle` but no `view`; anima reads `record.view` (`application.js:8`).

```js
// systems/runtime/gestalten/shard/host.js:35
        return {
          url: context.attach.branch("/bundle").branch(context.reference.absolute).branch(mode.reference.absolute).absolute,
          bundle: mode.application.bundle.json,
          schema: mode.application.schema ?? null,
        };
```

**3 · Frame drifted.**
- drapes takes `{ terminal, bundle = null, accept = [], children }` (`Frame.svelte:5`); anima passes `{view}` (`a.svelte:114`).
- So `bundle` is always null and every buffer takes the bundle-less `next.mount()` (`Frame.svelte:47-53`). No application mounts.
- anima passes no `accept` anywhere.

**4 · `belt` left ghost.** This is red in drapes `dom`, but anima never reaches it: `mod.js` exports no `dom`.

```js
// subsystems/drapes/dom/chassis.jsx:3
import { belt } from "@vivalence/ghost";
```

**5 · Dead code:**
- `client.viva.js:25,30`: `new Process(cast.process(...))`, with `Process` and `cast` never imported
- `deno.jsonc:4-8`: every export commented out
- the `conversation` prototype
- `prototypes/todo/bell/`
- `thread/traits/masked.js`
- `bones/widgets/{Activity,ConversationalWidget}.bak.svelte`
- `belt/narrow.js`
- save-as-intent

**6 · Stale docs.**
- `.ikiro/reference/anima.md:409-495` still describes panes D/E/F, a crown of terminal tabs, and tap ×1 → standard. Today's tree has 8 cards, the widget flow, and tap ×1 → previous (`gesture.js:234`).
- The `panels-simplified.md` five-card comp is only partly landed: today there are 8 cards, B still holds config · auth · box · dock, and `mode` is not folded into thread.

## 6 · drapes · dapper — the kit

All measured by read or run on 10-16. "exists / missing / reusable" only, no design claims.

### structure: dir, purpose, exports

```js
// subsystems/drapes/deno.jsonc:4
  "exports": {
    ".": "./mod.js",
    "./dom": "./dom/index.js",
  },
// subsystems/drapes/mod.js:1
export * from "./context/index.js";
export * from "./decor/index.js";
export * from "./display/index.js";
export * from "./controls/index.js";
export * from "./panels/index.js";
export * from "./triage/index.js";
export * from "./stage/index.js";
export * as skins from "./skins/index.js";
```

| dir | medium | exports (barrel) |
|---|---|---|
| `context/` | js | `SIGNAL FILL INK GLYPH` · `preferences` |
| `controls/` | svelte + js | `Link Textarea Button Input Keyboard ViewportLock Field Key Segmented Stepper` · `persist visible drag` |
| `decor/` | svelte | `Text Pictogram(=Picto) Audio Image Video` |
| `display/` | svelte + js | 27: `Tag Label Header Paragraph Asset ErrorBox Pip Chip Section Helpdesk Json Markdown Org Pdf Tile Plate Entry Empty Row Reading Well ToolRow Pressed Strip Meter Spinner Status` |
| `panels/` | svelte + js | `Frame Card Icon Desk Loader Float` · `place` |
| `skins/` | svelte (`*skins`) | `Skin Tree Table List Filter Palette Breadcrumb` |
| `stage/` | svelte + echarts | `Canvas` · `stage` |
| `triage/` | svelte | `Plane Box Shelve` |
| `editor/` | svelte + codemirror | `Editor formats`. In NO package export, reached by deep path |
| `dom/` (`./dom`) | Solid (web) | `dom credentials chord keydowns accept modules adopt sheet arrangement watch Button Empty Field JsonTree Logo Markdown Pip Row Spinner Strip *panes(Crown Dock Frame Navigation Signin *reading)` |

The brief named a `dom/dom.js`. No such file exists: `dom` is exported from `dom/surface.js:9` (`dom/index.js:1`). `display/markdown.js:1-4` carries `//` comments in product source.

### Frame contract (svelte): one bag, then mount

```svelte
// subsystems/drapes/panels/Frame.svelte:5
  let { terminal, bundle = null, accept = [], children } = $props();
// subsystems/drapes/panels/Frame.svelte:24
  function teardown() {
    live?.unmount();
    component?.destroy();
// subsystems/drapes/panels/Frame.svelte:48
    if (!bundle) {
      live = next;
      shown = key;
      seated = terminal;
      next.mount();
      return;
    }
// subsystems/drapes/panels/Frame.svelte:62
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
```
- Bundle-less path (`:48-53`): the buffer is still `mount()`ed and `children` render (`:105`). That is the slot where anima puts its Empty states.
- The guard against a string buffer (`:44`) shows a "resolving" state (`:100-103`). Faults use `display/Empty` with tone negative (`:88-91`).
- **Drift, measured by read:** anima calls `<Frame terminal={$terminal} {view}>` (`systems/anima/src/app/panels/a/a.svelte:113`). Frame declares no `view` prop, only `bundle`/`accept` (`:5`), so `bundle` stays null and anima always takes the bundle-less path.

### display/strip.js `fit` · panels/float.js `place`: pure layout math, tested in `tests/kit.test.js:4`

```js
// subsystems/drapes/display/strip.js:24
export const fit = ({ width, full, short, fold, stacked = false, active = 0 }) => {
  const room = width - PAD;
  if (span(full, fold) <= room) return { mode: "row", labels: "full", zoom: 1 };
  if (span(short, ICON) <= room) return { mode: "row", labels: "short", zoom: 1 };
  const zoom = room / span(short, ICON);
  if (zoom >= ZOOM_FLOOR) return { mode: "row", labels: "short", zoom };
  if (stacked) return { mode: "rail", labels: "short", zoom: 1 };
  const pages = paginate(short, room - ARROWS - TAIL);
  if (pages) return { mode: "pages", labels: "short", zoom: 1, pages, page: Math.max(0, pages.findIndex(([from, to]) => active >= from && active < to)) };
  return { mode: "merged", labels: "full", zoom: 1 };
};
// subsystems/drapes/panels/float.js:6
export const place = (anchor, size, viewport, side = "below") => {
  const beside = anchor.right + GAP + size.width > viewport.width - MARGIN ? anchor.left - GAP - size.width : anchor.right + GAP;
```
`fit` steps down a ladder of outcomes: row/full → row/short → row/short zoomed (≥0.8) → rail (when stacked) → pages (≥3 items per page) → merged. `place` handles three sides: below · above · after, clamped to `MARGIN=6`.

### parseBlocks: two parsers, same name, both emit `{kind, …}`

```js
// subsystems/drapes/display/markdown.js:14
export function parseBlocks(text) {
// kinds pushed: code-block :38 · heading :44 · hr :54 · blockquote :65 · table :77 · list :90 · paragraph :108
// subsystems/drapes/display/markdown.js:121
export function parseInline(text) {   // text · bold · italic · code · link
// subsystems/drapes/display/org.js:12
export function parseBlocks(text) {   // org: #+keyword · * heading · #+begin_src · #+begin_quote|example · lists · | tables
```
Consumers: `display/Markdown.svelte:5`, `display/Org.svelte:5`, `dom/Markdown.jsx:2`. The Solid face dispatches through a table:
```jsx
// subsystems/drapes/dom/Markdown.jsx:25
const BLOCKS = {
  paragraph: (block) => (
  ...
  hr: () => <hr class="kit-markdown-hr" />,
// subsystems/drapes/dom/Markdown.jsx:83
    <For each={parseBlocks(props.text)}>{(block) => BLOCKS[block.kind](block)}</For>
```
The grammar holds **no `select` / `form` / `dialog` / `progress` block**. It is prose blocks only.

### SIGNAL · FILL · INK · GLYPH: tone → tailwind class tables

```js
// subsystems/drapes/context/signals.js:1
export const SIGNAL = {
  primary: "primary", secondary: "primary", info: "primary",
  success: "positive",
  warning: "caution", accent: "caution",
  danger: "negative",
};
// :8  FILL  = bg-signal-<s> border-signal-<s> text-signal-<s>-on
// :15 INK   = text-signal-<s>-ink
// :22 GLYPH = fill-signal-<s>-ink
```
`SIGNAL` folds seven legacy tone words onto the four dapper signals.

### skins, themes, dapper zone tokens

The skins (`Tree Table List Filter Palette Breadcrumb Skin`) are data views. `skins/defaults.js:1` fills a schema's properties with test values (`number→5 · integer→3 · boolean→true · string→"test"`). Themes are picked by `<html data-theme>`, never by a skin:

```js
// subsystems/dapper/themes/index.js:6
export const THEMES = { northsea, parchment, porcelain, datasette };
// subsystems/dapper/lib/tokens.js:133
export const tokens = (theme, zone) => {
  if (!Object.hasOwn(THEMES, theme)) throw new Error(`[tokens] not a theme: ${JSON.stringify(theme)} · ${Object.keys(THEMES).join(" · ")}`);
  const held = THEMES[theme].zones[zone];
  if (held === undefined) throw new Error(`[tokens] not a zone: ${JSON.stringify(zone)} · 0 · 1 · 2 · 3`);
  return Object.fromEntries(Object.entries(FLAT).map(([key, read]) => [key, flatten(read(held), held.surface)]));
};
// subsystems/dapper/lib/tokens.js:116 FLAT keys (the tty palette)
// surface surfaceSunk surfaceLift boundary textStrong textInk textMuted textLink
// signalPrimary signalPositive signalCaution signalNegative inverse inverseOn
```
```js
// subsystems/dapper/themes/northsea/theme.js:10
  signal:  { primary:  { fill: aqua[300],  ink: aqua[200],  on: iron[950] },
// subsystems/dapper/themes/northsea/theme.js:16
  zones: {
    0: { surface: iron[900], surfaceSunk: iron[950], surfaceLift: iron[850], boundary: iron[800], ...
```
Gradients per theme: northsea uses iron · deep · aqua · moss · amber · rust; parchment uses paper · ink · aqua · moss · rose · tomato; porcelain and datasette use the designer's hexes (`.ikiro/reference/design.md` §8). On the web, CSS vars are `--surface --surface-lift --signal-negative-ink --shape-radius-key --size-ring --font-family-code …` (Frame.svelte:138-141). The tty gets `tokens(theme, zone)` → hex, used as `tokens("northsea", "2")` (`systems/ghost/app/surface/chrome/index.js:24`). design.md §6 rule: "A hex in a view is a defect. A zone number in a view is the same defect."

### dom/: the Solid kit for the BROWSER face (not opentui)

`dom/` is web Solid (`solid-js/web` `render`), a second web face beside the Svelte kit. Its surface:
```js
// subsystems/drapes/dom/surface.js:9
export const dom = (root, { credentials, theme = "northsea" }) => {
  ...
    accept,
    keys: new Pipe().from(keydowns(root)),
    emit: (kind, props) => $output.set({ kind, props }),
    mount: { signin: pane("signin", panes.Signin), crown: ..., dock: ..., frame: ..., navigation: ... },
// subsystems/drapes/dom/accept.js:3
export const modules = [mime.dom.solid, mime.dom.svelte, mime.dom.html];
export const accept = [...modules, mime.markdown, mime.plain, mime.json];
// subsystems/drapes/dom/watch.js:4
export const watch = (root, ...path) => from(atom.chain(root, ...path));
// subsystems/drapes/dom/sheet.js:21
export const sheet = [chassis, ...KIT, ...PANES].join("");   // each .jsx exports `style`; adopt() injects one <style data-drapes-dom>
```
- `credentials(storage)` reads, writes and clears `lighthouse:<origin>`, validated by `v.primitives.credentials.Credential.faults` (`dom/credentials.js:13-33`).
- `chord(event)` → `"ctrl-k"` · `"esc"` · a typed char. `keydowns(root)` → Queue. Editable targets keep their own keys (`dom/keys.js:35-51`).
- `dom/panes/frame.jsx` is the dom twin of ghost's frame. Its floor is a `JsonTree` of `buffer.data` when `negotiate(modules)` is null:
```jsx
// subsystems/drapes/dom/panes/frame.jsx:8
const entry = (buffer) => (buffer.bundle ? buffer.bundle.negotiate(modules) : null);
// :23
    const handle = held.module.default(stage, { buffer: held.buffer, dispatch: props.dispatch });
// :51
          <Match when={floor()}>
            <div class="frame-floor" data-floor="application/json">
              <JsonTree value={buffer().data} />
```
Its bag is `{buffer, dispatch}` only, against Frame.svelte's `{terminal, daemon, mode, thread, buffer}` and ghost's eight keys. That makes three bag shapes.

**Why RED (measured, run):** `chassis.jsx:3` imports `belt` from `@vivalence/ghost`. Ghost DOES export a `belt` (`systems/ghost/typology/index.js:4`), but it holds only `harness` (`systems/ghost/typology/gestalten/belt/index.js:1`). `belt.dock` is undefined, so the module loads and the first drag throws:
```js
// subsystems/drapes/dom/chassis.jsx:3
import { belt } from "@vivalence/ghost";
const dock = belt.dock;
// subsystems/drapes/dom/chassis.jsx:44
    dragged = dock.shareAfterDrag({ side: props.layout().dock.side, share: dragged, rect: rect(), deltaPx });
```
```sh
HOME=$(mktemp -d) deno test -A --no-check subsystems/drapes/tests/
# FAILED | 24 passed (198 steps) | 1 failed (2 steps)
# error: TypeError: Cannot read properties of undefined (reading 'shareAfterDrag')
```
`shareAfterDrag · snapAfterDrop` live in `systems/ghost/bak/bak.3/gestalten/belt/dock.js` and `systems/anima/src/typology/stores/bridge/dock.js`. No `systems/` file imports `@vivalence/drapes/dom` (count below).

### editor/

```js
// subsystems/drapes/editor/languages.js:17
const grammars = { md: markdown, mdx: markdown, markdown, org, json, jsonc: json };
export const language = (format) => grammars[format]?.() ?? [];
// subsystems/drapes/editor/sync.js:7
export const diff = (from, to) => {        // minimal head/tail splice for external writes
export const originated = (update) => update.transactions.some((transaction) => transaction.annotation(External));
// subsystems/drapes/editor/vim.js:1      DEAD — no importer
import { vim as extension } from "@replit/codemirror-vim";
```
`editor/org.js` (8.3k chars) is a lezer-less org language, tested in `tests/editor.org.test.js`. Its one consumer imports by deep path (`@vivalence/drapes/editor/index.js`, a registry package).

### usage table: importers by name in systems/ · commons/ · ~/.viva/registry (bak, tests excluded; count = files)

| component | medium | used by (count) |
|---|---|---|
| Key | svelte | anima 22 · registry 2 = **24** |
| Empty | svelte | anima 4 · registry 8 = 12 |
| Pip | svelte | anima 5 · registry 7 = 12 |
| Row | svelte | anima 9 |
| Float | svelte | anima 8 |
| Input | svelte | anima 7 |
| Asset | svelte | registry 7 |
| Section | svelte | anima 3 · registry 3 = 6 |
| Desk | svelte | registry 6 |
| drag | js | registry 6 |
| Status · Tag | svelte | anima 5 each |
| Reading | svelte | anima 4 |
| Markdown | svelte | anima 1 · commons 2 · registry 1 = 4 |
| Canvas · stage | svelte/echarts | commons 1 · registry 3 = 4 each |
| visible | js | registry 4 |
| Meter · Segmented · Spinner · Stepper · Strip · ToolRow | svelte | anima 3 each |
| ViewportLock | svelte | registry 3 |
| Card · Chip · Pressed · Well | svelte | anima 2 each |
| Json | svelte | anima 1 · registry 1 = 2 |
| Keyboard · persist · preferences | svelte/js | registry 2 each |
| Frame · place · skins | svelte/js | anima 1 each |
| Helpdesk | svelte | commons 1 |
| Org · Paragraph · Editor | svelte | registry 1 each |
| Button Textarea Link Field Text Pictogram Audio Image Video Label Header ErrorBox Pdf Tile Plate Entry Icon Loader Plane Box Shelve SIGNAL FILL INK GLYPH | svelte/js | **0** |
| `./dom` (all of it) | solid (web) | **0** in systems · commons · registry; 16 import lines in `testament/m82-clients-20261012` |

Ghost imports nothing from drapes. Its tty kit is its own `systems/ghost/app/surface/chrome/views/{Input,JsonTree,Markdown}.jsx`.

---

## 7 · buffers — end to end

### what a buffer IS: one row, schema'd `data` plus relations

```ts
// systems/runtime/entities/Buffer.ts:37
export class BufferEntity extends DataEntity {
  status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;   // PENDING ACTIVE DONE ERROR STALE (:10)
  data: any & Opt = {};
  bundle: any & Opt = null;
  index: number & Opt = 0;
  traits: BufferTraitsEnum[] & Opt = [];                         // LABELED only (:18)
  trait: any & Opt = {};
  mode?: Rel<ModeEntity>;
  thread?: Rel<ThreadEntity>;
  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
// systems/runtime/entities/Buffer.ts:121
const twitch = new Vector().open("/before/buffer/create", async (ctx) => {
  ...
  ctx.input.entity.trait = { ...ctx.input.entity.trait, LABELED: { name: `${mode?.slug ?? "home"} #${ctx.input.entity.index}` } };
```
```js
// subsystems/typology/schematics/entities/buffer.js:4
export const BufferDescriptor = {
  $id: "Buffer",
  own: { index, data: v.record(v.string(), v.unknown()).optional(), traits, trait, bundle: v.union([Bundle(), v.null()]).optional() },
  relations: { mode, thread, literals, symbols },
  narrowable: ["data", "trait"],
  spoken: ["id", "index", "mode", "thread", "traits", "trait", "bundle.entries"],
};
```
There is no `terminal` relation on the row. The terminal POINTS at a buffer client-side (`systems/ghost/typology/terminal/terminal.js:20` `$buffer = atom(null)`). `status` sits on the entity but is absent from the typology descriptor.

### the face table: mime · App · Bundle

```js
// subsystems/typology/schematics/scalars/mime.js:13
export const dom = { svelte: "application/vnd.vivalence.dom.svelte+javascript", html: "…dom.html+javascript", react: "…dom.react+javascript", solid: "…dom.solid+javascript" };
export const tty = { react: "…tty.react+javascript", solid: "application/vnd.vivalence.tty.solid+javascript" };
export const markdown = "text/markdown"; export const plain = "text/plain"; export const json = "application/json";
// subsystems/typology/prototypes/app.js:7
export class App {
  constructor(sources, schema = null) {
    this.sources = Array.isArray(sources) ? sources : [declared(sources)];
    const unnamed = this.sources.filter((source) => !source.mime || !(source.mount || source.source));
// subsystems/typology/prototypes/app.js:25   — an inline-source helper, 0 callers in the tree
export const svelte = (strings, ...values) => ({ mime: mime.dom.svelte, source: String.raw({ raw: strings }, ...values) });
// subsystems/typology/prototypes/bundle.js:15
  static merge(...bundles) { … entries.set(entry.mime, entry) … }     // later mime wins
  negotiate(accept) { return accept.map((type) => this.entry(type)).find(Boolean) ?? null; }
// subsystems/typology/prototypes/bundle.js:34
  async load(accept) {
    … const response = await fetch(this.url + entry.mount);
    … if (digested !== entry.integrity) throw …
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    const module = await import(/* @vite-ignore */ url);
```

### how a face is compiled: esbuild, at the runtime, content-addressed

```js
// systems/runtime/traits/application.js:18
  let compiling = null;
  mode.application.compile = () => {
    compiling ??= Promise.all(
      mode.application.sources.map(({ mime, mount, source }) =>
        bundler.bundle(source ? { mime, source } : { mime, entry: resolve(mode.module.source.dirname, mount) })),
    ).then((bundles) => (mode.application.bundle = Bundle.merge(...bundles)))
      .finally(() => (compiling = null));
    return compiling;
  };
  return () => mode.application.compile();          // the trait finalizer: compiled once at stagger
```
```js
// subsystems/paladin/belt/bundler.js:34
  const rows = {
    [mime.dom.svelte]: async (entry) => (await compiler.svelte(entry, { prod, imports: imports(), nodePaths })) …   // esbuild + esbuild-svelte (typology/gestalten/bundle/svelte.js)
    [mime.tty.solid]: async (entry) =>
      (await esbuild.build({ entryPoints: [entry], bundle: true, format: "esm", platform: "neutral", packages: "external", write: false, plugins: [universal], logLevel: "silent" })).outputFiles[0].text,
    [mime.dom.html]: async (entry) => { … `export default (target) => { target.innerHTML = html; … }` },
  };
// subsystems/paladin/belt/bundler.js:72   output lands at <mode.bundles>/bundle/<hash16>.<stem>.mjs
        await paladin.state.text(at(`${hash.slice(0, 16)}.${name}.mjs`), text);
      …
      return new Bundle({ entries: [{ mime: type, hash, mount: `/${hash.slice(0, 16)}.${name}.mjs`, integrity: await crypto.digest(text), bytes: text.length }] });
```
- **When:** once, at the APPLICATION trait's finalizer (`application.js:28`). In dev it is recompiled again on every `/metadata/application` read (`systems/runtime/gestalten/shard/host.js:34`). A source entry is cached by `sha256(source)` (`bundler.js:62-63`).
- **Served:** `/attached/bundle/<context>/<mode>/(.*)` → `bundler.serve`, which adds the `x-viva-integrity` header (`systems/runtime/lifecycle/runtime/resolution.js:49-61`). The client gets the `url` from `/metadata/application` (`host.js:33-39`).
- tty.solid uses Babel `babel-preset-solid` `generate: "universal"` with `moduleName: "@opentui/solid"`, but only on `/\.jsx$/` (`bundler.js:14`).

### who creates a buffer (three doors)

```js
// systems/runtime/traits/application.js:10   — mode-side, fills schema defaults
  mode.application.buffer = (desc = {}) =>
    context.entities.buffer.create({ mode: mode.entity.id, bundle: null, ...desc, data: mode.application.fill(desc) });
// systems/ghost/typology/mode/traits/application.js:8   — client /application/start → userspace /create, data {} (no fill)
export const open = async (terminal, mode) => {
  const kept = thread.$buffers.get().filter((buffer) => buffer.mode === mode).sort(…).at(-1);
  const buffer = kept === undefined ? await mode.runtime.entities.buffer.create({ mode: mode.id, thread: thread.id, data: {} }) : kept;
  if (terminal.thread === thread) terminal.$buffer.set(buffer);
// systems/runtime/traits/generative.js:81    — a GENERATIVE tool, LLM-authored svelte source, bundle per row
        const buffer = await context.entities.buffer.create({ mode: ctx.mode.entity.id, bundle: bundle.json, data: ctx.input.data ?? {}, traits: ["LABELED"], trait: { LABELED: ctx.input.label }, thread: ctx.thread ?? null });
```
Mode routes create too. Chess `/match/create` calls `ctx.mode.application.buffer(...)` (`~/.viva/registry/chess/modes/board/play/aperture/index.js:213`). `BufferRepository.create` binds to the thread (`Buffer.ts:25-34`).

### how `$data` flows: userspace route → twitch → Broadcaster → `/subscribe`

```js
// systems/runtime/lifecycle/runtime/aperture/userspace.js:15
    ["buffer", entities.buffer, viaThread, { scope: own }],
// subsystems/typology/gestalten/shard/datamap.js:205
    for (const op of ["create", "update", "delete"]) {
      twitchOf(ctx).open(`/after/${name}/${op}`, (hook) => {
        …
        broadcaster.push({ op, entity: serialized }, serialized);
// subsystems/typology/gestalten/shard/datamap.js:222
  aperture.get("/subscribe", async (input, ctx) => {
// systems/ghost/typology/buffer.js:75
export const repository = (dataspace) => new RemoteRepository(Buffer).connect(dataspace.runtime.connection.branch("/userspace/entities/buffer"));
// systems/ghost/typology/client/execution.js:127
    clientDie.runtime.entities.buffer.subscribe(),
// subsystems/typology/prototypes/remote-repository.js:161   — merge sets $data on the live entity
        const merged = await repo.merge(event.entity);
```
Client entity (ghost) is `$data · $bundle · $traits · $trait · $label`, plus `hooks.{mount,unmount,release}` and `fn.once` (`systems/ghost/typology/buffer.js:5-73`).

### how a face writes back: two paths, both in chess

```jsx
// ~/.viva/registry/chess/modes/board/play/buffer/play.jsx:63
  const call = (path, input) => mode.connection.call(`/match/${path}`, { buffer: buffer.id, ...input });   // the authority: mode route
  const hold = (next) => {
    buffer.data = next.fen === undefined && next.data !== undefined ? next.data : next;                    // local optimistic set of $data
```
The server side persists through `ctx.entities.buffer.updateOne({ id }, { data })` (`aperture/index.js:30`). The broadcast then fans out to every client. `buffer.data =` on the client is local only: ghost's `set data` is `$data.set` (`systems/ghost/typology/buffer.js:10-12`), with no RemoteRepository write.

### lifecycle: open → live → sealed

| phase | where |
|---|---|
| minted `PENDING`, LABELED `<slug> #<index>` | `Buffer.ts:38` · `:121-126` |
| seated: `terminal.$buffer.set(buffer)` | ghost `mode/traits/application.js:16` |
| mounted: `buffer.mount()` → `on.mount` hooks | ghost `panes/frame.jsx:26` · `Frame.svelte:71` |
| live: route writes → `/after/buffer/update` → broadcast | `datamap.js:205` |
| sealed: a finished game → `literal.seal(...)`, `buffer.literals.add(row)`, `data.game = row.id` | `chess/.../aperture/index.js:114-141` |
| unmounted / closed: `/application/stop` → `$buffer.set(null)`, "the buffer stays on its thread" | ghost `terminal/commands/application/stop.js:4-6` |

The `status` enum has one writer outside the default: `~/.viva/registry/education/modes/games/riddler/aperture.js:43` sets `buffer.status = "DONE"`. None in `systems/runtime/` and none in chess.

### buffer verbs

| verb | side | file |
|---|---|---|
| `/buffer/update {id, data}`: merge over data | runtime skill (tool) | `systems/runtime/gestalten/skills/buffer.js:8` |
| `/buffer/label {id, label}`: `trait.LABELED` | runtime skill | `skills/buffer.js:35` |
| `/view/render {source,label,data}` · `/view/revise` · `/view/inspect {hash}` · `/view/list` | GENERATIVE tools | `systems/runtime/traits/generative.js:61,99,156,194` |
| `find findOne findOneOrFail findAndCount count create upsert ensure updateOne update removeOne remove` + `/subscribe` | userspace repository | `datamap.js` + `userspace.js:15` |
| `/application/start` · `/application/stop` | ghost repl | `terminal/commands/application/{start,stop}.js` |
| `/buffer/close` | dispatched by drapes dom frame | `dom/panes/frame.jsx:41`. **No handler found** in ghost |

### one buffer row (DERIVED, not captured)

No snapshot holds a full row. The closest is a test PROJECTION with a stubbed bundle shape: `commons/instances/hello-world/tests/snapshots/hello-world-mint.snapshot.json` = `{"condition":"NOMINAL","buffer":[{"data":{"title":"Flamingo","sources":[…]},"bundle":{"entries":["index.js"],"type":"svelte"},"index":0}],"counter":1}` (projection at `draw.snapshot.test.js:146-152`). The row below is derived from `Buffer.ts:37-49`, `bundler.js:75` and the chess fixture data (`tests/tty.render.test.js:22`):
```json
{
  "id": "01a0856f-425f-72b8-b36f-decc1bb2050e",
  "status": "PENDING", "index": 0,
  "mode": "<mode id>", "thread": "<thread id>",
  "traits": ["LABELED"], "trait": { "LABELED": { "name": "play #0" } },
  "data": { "variant": "standard", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "moves": [], "status": "pending", "turn": "white",
            "seats": { "white": { "kind": "user" }, "black": { "kind": "engine", "elo": 1600 } },
            "dests": { "e2": ["e3", "e4"] }, "check": false },
  "bundle": null,
  "literals": [], "symbols": []
}
```
An APPLICATION buffer carries `bundle: null`, because the face comes from `mode.$application` (ghost `panes/frame.jsx:63`). A GENERATIVE buffer carries `bundle: { entries: [{ mime, hash, mount: "/<hash16>.dom.svelte.mjs", integrity, bytes }] }`.

### ghost mounts tty.solid

```jsx
// systems/ghost/app/surface/chrome/panes/frame.jsx:7
const applied = (buffer) => (is.object(buffer.mode) && buffer.mode.implements("APPLICATION") ? from(buffer.mode.$application) : () => null);
// :63
          const offered = () => (application() === null ? null : bundle() !== null ? bundle().withUrl(application().url) : application().bundle);
// :29
      .then((module) => (handle = module.default(element, { terminal: props.terminal, mode: props.buffer.mode, thread: props.terminal.thread, buffer: props.buffer, renderer, palette, dispatch: props.dispatch, focused })))
// :48
const Floor = (props) => {
  const data = from(props.buffer.$data);
  return <JsonTree data={data()} />;
};
// systems/ghost/app/surface/chrome/index.js:24
  … panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```
The view side of the contract is the `default(element, bag)` → `{destroy}` that chess ships:
```jsx
// ~/.viva/registry/chess/modes/board/play/buffer/play.jsx:268
export default (element, bag) => {
  const dispose = _render(() => createComponent(RendererContext.Provider, { value: bag.renderer, get children() { return createComponent(Play, bag); } }), element);
  return { destroy: () => { dispose(); for (const child of element.getChildren()) child.destroyRecursively(); } };
};
```
**Why memo falls to the Floor** (`.ikiro/known-issues.org:2937` memo-tty-face-on-dead-sheets): memo declares tty.solid (`commons/fixtures/memo/mode/memo.viva.js:19`), but its face imports a dead package:
```jsx
// commons/fixtures/memo/mode/buffer/memo.jsx:3
import { Empty, paint, usePalette } from "@vivalence/sheets";
```
`subsystems/sheets/` holds only `bak/`. The blob import rejects, and memo's boot is still on the pre-m86 `default(element, terminal, {renderer, palette})` contract. Its paladin-compile tests (`tests/memo.test.js:55`, `memo.snapshot.test.js:132`) prove that the bundle compiles, not that it mounts in ghost.

**Anima RED:** `systems/anima/src/typology/entities/buffer.js:2` and `entities/mode/traits/application.js:1` import `View` from `@vivalence/typology`. typology has no `View` export (grep → 0).

---

## 8 · the two-face contract: how a mode already renders twice

A mode declares its APPLICATION as an `App` of faces over one buffer schema. The runtime compiles each face to a bundle; the client picks the face for its medium and mounts it over the live buffer row with ONE bag: `terminal · mode · thread · buffer (+ renderer · palette · dispatch · focused on tty)`. The face reads `buffer.$data` and calls the mode's routes. It never talks to the client's chrome.

```js
// ~/.viva/registry/chess/modes/board/play/play.viva.js:9
export const manifest = {
  type: "board",
  slug: "play",
  name: "Play",
  traits: ["APPLICATION", "EXPOSED", "HARNESSED", "CONVERSATIONAL", "TOOLING", "AGENTIC"],
};

export const application = new App(
  [
    { mime: mime.dom.svelte, mount: "buffer/Play.svelte" },
    { mime: mime.tty.solid, mount: "buffer/play.jsx" },
  ],
  v.buffer({ data: MATCH, literals: v.array(v.rel(v.literal())) }),
);
```

```jsx
// ~/.viva/registry/chess/modes/board/play/buffer/play.jsx:53
export function Play(props) {
  const { palette, mode, buffer, thread } = props;
  const data = from(buffer.$data);
  const call = (path, input) => mode.connection.call(`/match/${path}`, { buffer: buffer.id, ...input });
```

```svelte
// ~/.viva/registry/chess/modes/board/play/buffer/Play.svelte:14
  const { terminal, daemon, mode, thread, buffer } = $props();
  const data = buffer.$data;
  const call = (path, input) => mode.call.match[path](input);
```

```svelte
// subsystems/drapes/panels/Frame.svelte:64
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
```

Faces that exist today on the registry: `chess/board/play` (`play.jsx` + `Play.svelte`), `education/games/dojo` (`dojo.jsx`), `@memo` (svelte only — falls to the Floor on tty, known-issues). Every other mode under `~/.viva/registry/*/modes/*/*` (assembly · chess ×6 · education ×14 · media · vcompany ×9 · young-ladys-primer ×2) has a svelte face or none. The pattern the designer extends: **the client chrome is the third face-pair — `chrome.jsx` and the anima bones over the same client state.**

# III · the runtime side

## 9 · entities

Measured from the live tree, every path relative to the repo root `/Users/finn/vivalence/code/vivalence` unless it starts with `~`. Snapshots: `**/tests/snapshots/` is gitignored (`.gitignore:30`, `git ls-files systems/runtime/tests/snapshots` = 0), but this checkout HOLDS 83 of them locally. Rows marked **[snapshot]** are quoted from those files. Rows marked **[derived]** are built from the mikro schema plus the typology descriptor.

---

Base: `DataEntity` = `{ id: uuid v7, createdAt, updatedAt }` (`subsystems/typology/entities/base/DataEntity.ts:158-176`). The registered sets:
```ts
// systems/runtime/entities/index.ts:40
export const sets = {
  identity: { user, authenticator, terminal },
  composition: { daemon, mode },
  traits: { literal, symbol, note, mode },
  userspace: { intent, thread, turn, buffer, note },
  transient: { activity },
};
```
- **DEAD**: `Issue.ts` and `Constraint.ts`. Neither is in `index.ts`, and only Issue imports Constraint (`.ikiro/world/codemap/runtime.md:7`).
- **Process** lives off the main datamap, on a second one (§13·8).
- **Kernel trait vocab**:
```js
// systems/runtime/entities/traits.js:4
const LABELED = trait.define("LABELED", { schematic: v.primitives.Label });
export const traits = {
  literal: [LABELED],
  symbol: [LABELED, trait.define("ONTOLOGICAL", …), trait.define("STRUCTURAL", …), trait.define("TOPOGRAPHICAL", …)],
  note: [LABELED],
  mode: [],
};
```
- `Label` = `{ name: string, description?: string }` (`subsystems/typology/schematics/primitives/label.js:3`).
- Per-daemon vocab = kernel ∪ domain.traits ∪ each mode's traits, via `gather` (`systems/runtime/gestalten/belt/traits.js:8`). `mint` builds a daemon-scoped repository with `claim(row, name)` (`:38`).
- Typology vocab on descriptors: Thread `INTELLIGENT · VOCAL` (`subsystems/typology/schematics/entities/thread.js:8-26,44`) and User `HOME` (`user.js:14`).
- Claim law: `claim` returns `{}` unless `row.traits` includes NAME and the data validates (`subsystems/typology/gestalten/belt/traits.js:25-35`).

#### User — `systems/runtime/entities/User.ts`
- fields: `slug` (unique) · `authentication` embed `{provider, credentials, tokens}`, **hidden** (`:60`) · `traits: string[]` · `trait: json`
- relations: `daemons` m:n owner, pivot `User_daemons` (`:63`) · `terminals · threads · intents · notes` 1:m
- verbs: `unique → {slug}`, `byUsername(username)` via `json_extract(authentication,'$.credentials.username')` (`:25`)
- claimable: `HOME { reference }` (`subsystems/typology/schematics/primitives/home.js:3`)
- client sees it as the lighthouse **card** only: `{ id, slug, traits, trait }` (`systems/runtime/lifecycle/lighthouse/aperture.js:14`). No `/userspace/entities/user` route exists.
```json
// [derived] the card, from /lighthouse/login|signup|autologin|verify
{ "id": "019e1c2a-0b7d-7c11-9a3e-4f2b1d0c9e88", "slug": "localhost", "traits": ["HOME"],
  "trait": { "HOME": { "reference": "/runtime/runtime/mode/harness/runtime" } } }
```

#### Daemon — `systems/runtime/entities/Daemon.ts`
- fields: `slug` is the **primary key** (`:32`) · `mask: json` (the raw recipe entry, `lifecycle/runtime/population.js:183`) · `traits` · `trait` · `createdAt/updatedAt`
- relations: every one hidden (`:38-42`): `modes · literals · symbols · notes` 1:m, `users` m:n inverse
- verbs: `unique → {slug}`
- No entity route. The client learns daemons from `/metadata/daemons` (§10·2.1). Membership is auto-enrolled on the first authenticated daemon call (`lifecycle/daemon/resolution.js:6-13`, `//@beef autoenroll. temporary.`).

#### Mode — `systems/runtime/entities/Mode.ts`
- fields: `daemon` m:1 nullable (null = runtime-owned) · `type` · `slug` · `traits: ModeTraitsEnum[]` · `name? description? version?` · `installed: string` (a dataset stamp hash, `lifecycle/mode/resolution.js:26`)
- relations: `intents`, `buffers` (cascade remove) · `turns` · `literals symbols notes` hidden
- unique `[daemon, slug, type]` (`:77`) · filter `daemon`, default off
- `ModeTraitsEnum` (`:12-45`): `BOOTED RUNTIME APPLICATION TOPOGRAPHICAL TOPOLOGICAL DATASET DATASINK HARNESSED CONVERSATIONAL AGENTIC TOOLING EMITTER GENERATIVE EXPOSED INTENTED FRAUGHT MOUNTED` plus deprecated `CHAOSMONKEY BUFFERED SELFEVIDENT TOOLED STANDALONE`
- **mismatch**: the typology descriptor says `installed: v.boolean()` (`subsystems/typology/schematics/entities/mode.js:11`), but mikro holds a string hash.
- route: `/<host>/entities/mode` with every repository verb plus `/subscribe` (`systems/runtime/gestalten/shard/host.js:70-75`)
```json
// [derived]
{ "id": "019e1c2a-1111-7000-8000-000000000001", "daemon": "chess", "type": "board", "slug": "play",
  "traits": ["HARNESSED","CONVERSATIONAL","TOOLING","APPLICATION","EXPOSED"], "name": "Play",
  "description": null, "version": "0.1.0", "installed": "a3f9…", "createdAt": "2026-10-16T09:00:00.000Z", "updatedAt": "…" }
```

#### Thread — `systems/runtime/entities/Thread.ts`
- fields: `user` m:1 · `mode` m:1 nullable · `intent` m:1 nullable · `phase` enum `inert|manual|continuous|escort|stream(deprecated)`, default `manual` (`:13-20`) · `traits` enum `MASKED AIMED QUEUEING LABELED` (`:22`) · `trait` · `counter` · `cursor` · `parent`/`children` (a tree)
- `beforeCreate` hook copies `intent.traits` and merges `intent.trait` (`:72-86`)
- `bindBuffer(buffer)` stamps `buffer.thread` and `buffer.index = counter++` (`:53`)
- filter `user`, default ON (`:65`)
- claimable (typology): `INTELLIGENT {tune?, effort?: none|low|medium|high, rounds? 1..50, thinking?}` · `VOCAL {language?, tune?, harmonize?{window,tolerance,tail}, polish?}`
```json
// [derived]
{ "id": "01a09010-13aa-778b-bce7-19c38f835337", "user": "019e1c2a-0b7d-…", "mode": "019e1c2a-1111-…", "intent": null,
  "phase": "manual", "traits": ["LABELED","INTELLIGENT"],
  "trait": { "LABELED": { "name": "Q3 filings" }, "INTELLIGENT": { "tune": "capable", "effort": "low" } },
  "counter": 2, "cursor": 0, "parent": null, "createdAt": "…", "updatedAt": "…" }
```

#### Turn — `systems/runtime/entities/Turn.ts`
- fields: `role` · `parts: json[]` · `meta?: json` · `parent` m:1 (a turn chain) · `children` · `thread` m:1 · `mode` m:1 nullable
- verbs beyond the base:
```ts
// systems/runtime/entities/Turn.ts:13
  history(where, opts?) { return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } }); }
  async chain(data, opts?) {
    const parent = data.parent ?? (await this.history({ thread: data.thread }, opts)).at(-1) ?? null;
    const turn = await this.create({ ...data, parent });
    await this.em.flush();
    return turn;
  }
// :30 fold(tract, judge) — compaction: verdict → anchor reuses tract's last turn, rest removed
```
- filter `user` via `thread.user` (`:65`)
- **gap**: `TurnDescriptor` exists (`subsystems/typology/schematics/entities/turn.js:3`), but `schematics/entities/index.js:1-8` does NOT export it.
```json
// [derived] — parts shapes from hallucination.Part / hallucination-tool-loop.snapshot.json
{ "id": "…", "role": "assistant", "thread": "01a09010-…", "mode": "019e1c2a-1111-…", "parent": "…",
  "parts": [ { "type": "tool_use", "id": "use-1", "name": "reflect", "input": { "query": "casa" } } ],
  "meta": { "state": "tools" }, "createdAt": "…", "updatedAt": "…" }
```

#### Buffer — `systems/runtime/entities/Buffer.ts`
- fields: `status` enum `PENDING ACTIVE DONE ERROR STALE` · `data: json` (the screen state) · `bundle: json|null` (`Bundle {entries:[{mime, hash, …}]}`) · `index` · `traits: [LABELED]` · `trait`
- relations: `mode` · `thread` m:1 · `literals` m:n pivot `buffer_literals` (`:101-108`) · `symbols` m:n pivot `buffer_symbols` (`:110-117`)
- verbs: `create({thread, literals, symbols})` resolves refs by id-or-slug, then `bindBuffer` (`:25-34`)
- twitch `/before/buffer/create` auto-labels it `"<mode.slug|home> #<index>"` (`:121-126`)
- descriptor `spoken: ["id","index","mode","thread","traits","trait","bundle.entries"]`: what the MODEL hears of a row (`subsystems/typology/schematics/entities/buffer.js:20`)
```json
// [derived]
{ "id": "01a0856f-425f-72b8-b36f-decc1bb2050e", "status": "PENDING", "index": 0, "mode": "019e…", "thread": "01a09010-…",
  "data": { "title": "Flamingo" }, "bundle": { "entries": [ { "mime": "…svelte", "hash": "9c1e44d0a7b3f2e1…" } ] },
  "traits": ["LABELED"], "trait": { "LABELED": { "name": "play #0" } }, "createdAt": "…", "updatedAt": "…" }
```

#### Terminal — `systems/runtime/entities/Terminal.ts`
- fields: `user` m:1 · `daemon` m:1 nullable (set null on delete) · `thread` m:1 nullable · `index` (= count of the user's terminals at create, `:6-10`) · `traits` · `trait`
- route `/userspace/entities/terminal`, scoped `own`
```json
// [derived]
{ "id": "…", "user": "019e1c2a-0b7d-…", "daemon": "chess", "thread": null, "index": 0, "traits": [], "trait": {}, "createdAt": "…", "updatedAt": "…" }
```

#### Activity (VIRTUAL, in-memory) — `systems/runtime/entities/Activity.ts`
- fields: `user mode thread buffer turn` (serialized as ids by `toJSON`, `:96-99`) · `type: HALLUCINATION` · `status` = controller state (`IDLE RUNNING PAUSED STOPPING DONE STOPPED FAILED ABORTED`) · `error` · `steps` (a ring of the last **12** stdout records, `:10`)
- `control(data)` mints the row and taps the controller. It deletes itself once the controller settles (`:51`).
- `stdout(signal)` replays then tails · `stdin` = `shape.object(controller.stdin, echo)`
- scoping: `{user: bound} OR user absent` (`:20-23`)
```json
// [derived]
{ "id": "…", "createdAt": "…", "user": "019e…", "mode": "019e…", "thread": "01a09010-…", "buffer": null, "turn": "…",
  "type": "HALLUCINATION", "status": "RUNNING", "error": null,
  "steps": [ { "span": 7, "trace": 3, "path": "/hallucination", "verb": "open", "at": 12.5 } ] }
```

#### Intent — `systems/runtime/entities/Intent.ts`
- fields: `user` · `mode` (eager) · `slug` · `name? description?` · `traits` enum `LABELED MASKED AIMED QUEUEING` · `trait`
- unique `[user, slug, mode]`
- seeded per user from `mode.module.dataset.intent` by `INTENTED` (`systems/runtime/traits/intented.js:4-33`)
- route `/userspace/entities/intent`: NO scope shard, but the mikro `user` filter is default-on (`:39-44`)

#### Literal — `systems/runtime/entities/Literal.ts`
- fields: `slug` · `traits` · `trait` · `symbol: json` (folded from symbols) · `ontology: string` (the single TOPOGRAPHICAL symbol slug) · `daemon` m:1 · `mode` m:1
- relations: `symbols` m:n inverse · `uses` m:n pivot `literal_uses` (`:113-120`) / `in` · `notes`
- unique `[daemon, slug]`
- find extensions: `search`, and `symbols: [slug…] | {$all,$in,$none}` (`:33-58`)
- twitch `/before/literal/{create,update}` folds `symbol` and `ontology` (`:157-162`)
- route `/daemon/<slug>/entities/literal`
```json
// [snapshot] systems/runtime/tests/snapshots/entity-literal.snapshot.json (first row; "rank" is a test projection)
{ "id": "019ddb8c-dc2e-702d-b8cf-1f5571ea1718", "slug": "aspectos.noun",
  "trait": { "TRANSLATED": { "known": "aspects", "learning": "aspectos" },
             "EXEMPLIFIED": { "known": "There are many aspects to consider.", "learning": "Há muitos aspectos a considerar." },
             "RANKED": { "rank": 0, "zipf": 4.46, "fpm": 29 }, "VOCALIZED": { "asset": { "path": "words/aspectos.mp3" } } },
  "symbol": { "word": { "lemma": "aspecto", "gender": "masculine", "part-of-speech": "noun", "number": "plural" }, "proficiency": { "cefr": "a1" } },
  "ontology": "word", "traits": ["EXEMPLIFIED","TRANSLATED","RANKED","VOCALIZED"], "rank": 0 }
```

#### Symbol — `systems/runtime/entities/Symbol.ts`
- fields: `slug` (dotted, e.g. `word.tense.future`) · `traits` · `trait` · `daemon` · `mode`
- relations: `literals` m:n OWNER, pivot `symbol_literals` (`:48-56`)
- unique `[daemon, slug]`
- claimable: `LABELED ONTOLOGICAL STRUCTURAL TOPOGRAPHICAL`
- route `/daemon/<slug>/entities/symbol`
```json
// [snapshot] systems/runtime/tests/snapshots/entity-symbol.snapshot.json
[ { "id": "019d3e77-0252-75d3-b39a-9ed5f4b75df2", "slug": "word", "traits": ["ONTOLOGICAL","LABELED","TOPOGRAPHICAL"], "trait": {} },
  { "id": "019d3e77-0254-754e-a4ca-9ee16c824e79", "slug": "word.tense.future", "traits": ["ONTOLOGICAL","LABELED"], "trait": {} } ]
```

#### Note — `systems/runtime/entities/Note.ts`
- fields: `slug` · `user? daemon? mode? literal?` (all nullable: the scope IS which ones are set) · `parent/children` · `traits` · `trait`
- relations: `symbols` m:n owner, pivot `note_symbols` (`:56`)
- unique expression on `coalesce(daemon, mode, user) + slug` (`:39`)
- filter `user`: own OR `user IS NULL` (`:43`)
- verb: `index(where, {limit=12})` returns the newest first (`:9`)
- route `/userspace/entities/note` (the runtime's minted repository `kernel.note`), scoped `own`

#### Issue · Constraint — DEAD
`systems/runtime/entities/Issue.ts:24` defines `IssueEntity {violation: forbidden|required, path, message, context, slug}` and `Constraint.ts:4` defines the types `SCHEMATIC EXISTENTIAL RELATIONAL`. Neither is registered, and no route serves them.

---

## 10 · apertures · dispatch · turn streaming

### the wire in one screen

```js
// systems/runtime/lifecycle/runtime/integration.js:28
export const serve = async (die, next) => {
  const url = die.mask.statics.serve;
  die.aperture.open("/multiplex", shard.serve.multiplex(die.aperture));
  const server = Deno.serve(
    { port: Number(url.port), hostname: url.hostname, signal: die.controller.abort.signal, onListen() {} },
    shard.cors.wrap(shape.http(die.aperture)),
  );
```
- ONE HTTP server (`die.aperture`) on `runtime.statics.serve`, `:2501` by default (`commons/ledger/environment.json:23`). CORS wraps it.
- JSON body in, JSON out. An async-iterable `ctx.response.body` gets framed as **SSE** (`subsystems/typology/gestalten/shape/http.js:46-54` → `Response.publish` sets `text/event-stream`).
- `/multiplex` is a WebSocket that dispatches frames into the same aperture. The bearer comes from `?token=` (`subsystems/typology/gestalten/shard/serve.js:45-49`). The frame grammar is `v.primitives.connection.Packet` (`subsystems/typology/schematics/primitives/connection.js:21`).
- The client side is `Connection.call` / `.stream` (SSE GET by default) / `.subscribe` (an SSE loop with backoff and `resumed`) / `.socket` (`subsystems/typology/prototypes/connection.js:97-206`).

---

### every route a client can call

Assembly order: `systems/runtime/lifecycle/runtime/execution.js:12-37`. `R` = the root `die.aperture`; `H` = a host's aperture (the runtime host `die.runtime.aperture`, or one daemon's `daemon.aperture`).

#### 2.1 root, unauthenticated
```js
// systems/runtime/lifecycle/runtime/population.js:98
  die.aperture.open("/status", () => die.controller.status);
// systems/runtime/lifecycle/runtime/resolution.js:92
  root.open("/manifest", () => die.mask.manifest);
  root.open("/aperture", () => shape.strip(die.aperture));
  root.open("/datamap", () => shard.datamap.strip(die.runtime.datamap.getMetadata()));
  root.open("/daemons", async () => … ({ slug, reference: daemon.reference.nature, modes: <count>, metadata: `${ref}/metadata` }))
  root.open("/services", async () => … ({ type, slug, reference, metadata }))
```
- `/status` · `/metadata/{manifest,aperture,datamap,daemons,services}` · `/multiplex` (ws)
- `/attached/bundle/<hostRef>/<modeRef>/(.*)`: serves compiled APPLICATION/GENERATIVE bundles with an `x-viva-integrity: sha256-…` header (`resolution.js:46-63`)
- `/attached/cargo/<hostNature>/(.*)`: FRAUGHT/MOUNTED freight, with etag, `Range`, 206/304/416 (`systems/runtime/gestalten/shard/cargo.js:5-26`)
- `/attached/process/service/<type>/<slug>/{status,manifest,…}`: ATTACHED services (`lifecycle/service/traits/attached.js:3-10`)

#### 2.2 lighthouse — `/lighthouse/*`
```js
// systems/runtime/lifecycle/lighthouse/population.js:9
  die.lighthouse.aperture = new Aperture()
    .use(shard.context.bind("lighthouse", die.lighthouse))
    .open("/metadata", () => die.lighthouse.manifest)
    .graft(aperture);
```
- `/metadata` → `{type:"lighthouse", slug:"lighthouse", traits}` (`systems/runtime/prototypes/lighthouse.js:11`)
- always: `/login · /password · /logout · /verify · /refresh` (`lifecycle/lighthouse/aperture.js:21-67`)
- by trait: `/signup` (JOINABLE) · `/autologin` (AUTOLOGIN) · INVITATIONAL adds nothing (`traits/invitational.js:1`)
- envelope: `{status:"SUCCESS", …}` or `{status:"ERROR", error:{code,message}}`. Codes: `INVALID_INPUT INVALID_CREDENTIALS INVALID_TOKEN MISSING_TOKEN USER_NOT_FOUND USERNAME_EXISTS`. Details in §11·5.

#### 2.3 userspace — `/userspace/entities/<kind>/…` (authenticated + `bind user`)
```js
// systems/runtime/lifecycle/runtime/aperture/userspace.js:9
  const owned = die.aperture.branch("/userspace").use(lighthouse.authenticate).use(lighthouse.bind).branch("/entities");
  const routes = [
    ["terminal", entities.terminal, own, { scope: own, filter: "user" }],
    ["intent", entities.intent, null, {}],
    ["thread", entities.thread, own, {}],
    ["buffer", entities.buffer, viaThread, { scope: own }],
    ["turn", entities.turn, viaThread, { scope: own }],
    ["note", kernel.note, null, { scope: own }],
  ];
// :25 activity — read-only verbs + /subscribe
    .graft(shard.datamap.repository(entities.activity, { only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"] }))
// :35
  one.open({ nature: "stdout", yields: v.primitives.controller.Record }, (ctx) => { ctx.output = ctx.activity.stdout(ctx.request.raw?.signal); });
  for (const name of Object.keys(v.primitives.controller.MACHINE.signals)) stdin.open(name, …)   // SIGTERM SIGSTOP SIGCONT SIGKILL
```
- `/userspace/entities/activity/:id/stdout` is SSE of controller `Record`s. `/userspace/entities/activity/:id/stdin/{SIGTERM|SIGSTOP|SIGCONT|SIGKILL}` returns `controller.toJSON()`.
- `own = {user: ctx.user.id}` · `viaThread = {thread: {user}}`. Reads are narrowed and writes stamped (`subsystems/typology/gestalten/shard/datamap.js:55-77`).

#### 2.4 the repository verbs (every `/entities/<kind>` mount) — verbatim
```js
// subsystems/typology/gestalten/shard/datamap.js:110-187
  aperture.post("/find",          scoped("where", async (input, ctx) => of(ctx).find(input.where || {}, sanitize(input.options))));
  aperture.post("/findOne",       …findOne(input.where || {}, sanitize(input.options)) …);
  aperture.post("/findOneOrFail", …);
  aperture.post("/findAndCount",  …);
  aperture.post("/count",         …);
  aperture.post("/create",        scoped("data", … of(ctx).create(input.data || {}); await em(ctx).flush() …));
  aperture.post("/upsert",        scoped("data", … upsert(input.data || {}, sanitize(input.options)) …));
  aperture.post("/ensure", …)   // only when the repo has ensure()
  aperture.post("/updateOne", scoped("where", (input, ctx) => of(ctx).updateOne(input.where || {}, input.data || {})));
  aperture.post("/update",    scoped("where", (input, ctx) => of(ctx).update(input.where || {}, input.data || {})));
  aperture.post("/removeOne", … return { ok: true, id: entity.id });
  aperture.post("/remove",    … return { count: entities.length, ids: entities.map((e) => e.id) });
// :223 reactive
  aperture.get("/subscribe", …)   // SSE of { op: "create"|"update"|"delete", entity: <serialized> }, filtered by input.where ∪ scope
```
- options whitelist: `populate orderBy limit offset fields exclude onConflictFields onConflictAction onConflictExcludeFields` (`:33`)
- error map: NotFound → 404 `NOT_FOUND` · ValidationError → 400 · UniqueConstraint → 409 `CONFLICT` · else 500 `INTERNAL` (`:79-101`)
- where-sugar every repository accepts: `traits: "X" | [..] | {$contains,$overlap,$none}` (`DataEntity.ts:102-125`)
- the client mirror is `RemoteRepository` (`subsystems/typology/prototypes/remote-repository.js:69-176`): `find` (with a localStorage revalidate when persisted) · `findOne` (local first) · `findAndCount count create upsert ensure updateOne update removeOne remove` · `subscribe(where, cb)`, which sends header `x-filter` and resyncs with `find` on `resumed`

#### 2.5 host apertures — `/runtime/<slug>/…` and `/daemon/<slug>/…`
Both are mounted at the root (`resolution.js:77-87`). They sit behind `lighthouse.authenticate + bind`: the runtime's at `resolution.js:30`, a daemon's at `lifecycle/daemon/resolution.js:5`, which also auto-enrolls. Each host also gets `/status` (a nano atom: GET → value, `/status/subscribe` SSE) and `/batch` (`[{path,…}] → [{path,status,body}]`).
```js
// systems/runtime/gestalten/shard/host.js:13-49  (both hosts)
  root.open("/manifest") · "/statics" · "/cargo" · "/datamap" · "/aperture" · "/cortex" · "/modes"
  // per mode, at <modeRef>/metadata:
  meta.open("/aperture") · "/statics"? · "/mountpoint"? · "/application" (APPLICATION) · "/emitter" (EMITTER) · "/freight" (FRAUGHT|MOUNTED) · "/harness" (HARNESSED)
// :62 cortex
  for (const type of ["dialogue", "object", "choice", "verbatim", "vocal"])
    root.branch(type).open("/render", faculty(…, "render")).open("/stream", faculty(…, "stream"));
// :70 entities
  context.aperture.branch("/entities/mode").graft(shard.datamap.repository(context.entities.mode)).graft(shard.datamap.reactive(…));
```
- `/metadata/modes` rows: `{type, slug, name, traits, reference: "<hostNature><modeNature>", metadata}` (`host.js:4-11`)
- `/metadata/application` → `{url: <attach>/bundle/<host>/<mode>, bundle: <Bundle json>, schema}`. It recompiles on every read when `paladin.is.dev` (`host.js:33-40`).
- daemon-only (`lifecycle/daemon/aperture/datamap.js:4-14`, `freight.js:2`): `/datamap` · `/entities/literal/*` · `/entities/symbol/*` · `/cargo`, plus the domain's aperture grafted in (`lifecycle/daemon/resolution.js:15-19`)
- each mode sits at `<host>/mode/<type>/<slug>` (`subsystems/paladin/lifecycle/resolve.js:102`; graft at `systems/runtime/gestalten/belt/modes.js:9`)

#### 2.6 the mode aperture — `<host>/mode/<type>/<slug>/…`
```js
// systems/runtime/lifecycle/mode/population.js:15
  die.mode.aperture = new Aperture()
    .use(shard.context.spread(contexts.host, die.context))
    .use(shard.context.bind("mode", die.mode))
    .open("/status", (_, ctx) => ctx.mode.status.reflection)
    .open("/manifest", (_, ctx) => ctx.mode.manifest);
  if (die.mode.module.aperture) die.mode.aperture.graft(die.mode.module.aperture);
```
What each trait adds that a client sees:

| trait | route / surface | where |
|---|---|---|
| EXPOSED | `mode.call = shape.proxy(mode.aperture)` (server side); without an aperture it only warns | `systems/runtime/traits/exposed.js:3-11` |
| HARNESSED | `/harness/…` (2.7) · `mode.harness` = `shape.object(harness, echo)` | `systems/runtime/traits/harnessed.js:224-227` |
| EMITTER | `/emit/…` (the module's emitter vector) → a `Yield` | `systems/runtime/traits/emitter.js:68-72` |
| FRAUGHT · MOUNTED | `/freight` → catalog; files at `/attached/cargo/…` | `systems/runtime/traits/fraught.js:14` |
| APPLICATION | no mode route; `/metadata/application` + `/attached/bundle/…`; server `mode.application.buffer(desc)` mints a Buffer | `systems/runtime/traits/application.js:10-16` |
| GENERATIVE | tools `/generator/view/{render,revise,inspect,list}`, armed in the harness only | `systems/runtime/traits/generative.js:55-213` |
| TOOLING | `mode.tools.graft(module.tools)`, no route | `systems/runtime/traits/tooling.js:1-4` |
| AGENTIC | every TOOLING peer's tools branched under its slug, no route | `systems/runtime/traits/agentic.js:2-11` |
| CONVERSATIONAL · RUNTIME · SELFEVIDENT | `() => {}`, no-ops | `systems/runtime/traits/conversational.js:1` |
| INTENTED | seeds Intent rows per user | `systems/runtime/traits/intented.js:16` |
| DATASET · DATASINK | install/drain; not offered on the RUNTIME host (`population.js:131`) | `systems/runtime/traits/dataset.js:61` |
| BOOTED | `module.boot(context, mode)` + teardown | `systems/runtime/traits/booted.js:5` |

The Yield an `/emit` returns:
```js
// subsystems/typology/schematics/prototypes/yield.js:12
export const Condition = v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]);
export const Yield = () => (schema ??= v.object({ condition: Condition, output: v.object({ buffer: v.array(v.buffer()) }, { additionalProperties: true }), error: v.unknown().optional() }, …));
```

#### 2.7 HARNESSED — what `/harness` is
```js
// systems/runtime/traits/harnessed.js:182
  const harness = new Vector()
    .use(shard.context.spread(contexts.host, context))
    .use(shard.context.bind("mode", mode))
    .use(normalizing).use(claiming).use(activating).use(requesting);
  harness.branch("/verbatim").open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, shard.hal.verbatim({ polish: POLISH, tune: "fast" }));
  harness.branch("/dialogue").use(chaining).use(persisting);
  if (context.domain?.harness) harness.graft(context.domain.harness);
  if (mode.module.harness) harness.graft(mode.module.harness);
  harness.use(summarizing);
  for (const type of ["dialogue", "object"])
    harness.branch(type).open("render", …).open({ nature: "stream", yields: Packet.Response }, …);
  harness.branch("choice").open("render", …);
```
- routes: `/harness/dialogue/{render,stream}` · `/harness/object/{render,stream}` · `/harness/choice/render` · `/harness/verbatim/stream`, which takes an upstream audio SSE (`Connection.converse`)
- input: a string → `{prompt}`. Otherwise `{thread?, id?, parts, system?, prompt?, turns?, output?, tune?, config?, tools?, controller?, primer?, questions?}` (`:18-58`).
- `claiming` reads the thread's `INTELLIGENT`/`VOCAL` claims. `activating` mints an **Activity** unless a controller was passed in. `chaining` (dialogue only) appends the user Turn. `persisting` writes the assistant/tool turns as the stream drains (`:108-135`).
- armed tools, the order the model sees them in (`:60-85`): `entity_{schema,find,count}` · `buffer_{update,label}` · `thread_update` · `mode_find` · paladin `fs_*`, `shell_*` · `/service/<slug>/…` · the domain's tools under its slug · `mode.tools` · `/generator/…` · `input.tools` (caller-supplied). Each is then bound with the host ctx, `mode`, `user`, `thread`.

---

### the dispatch shape

- A **Vector** is a trie of `{pattern, trajectory}` edges plus a `carry` middleware list and an `effect`.
- `open(sig, fx)` = `branch(sig).effect = fx`. `use` PUSHES middleware. `graft` COPIES carry and merges the trie. `branch(sig, v)` mounts, or grafts into an existing edge.
- A **Signal** is `{nature, body, flags}`, coerced from a URL (path → segments, query → flags), argv, or a string (m90 law, `.ikiro/quests/done/m90-signal.org:24-31`).
- `steer.dispatch.traverse` walks the Signal down the trie and composes each level's carry. The **strategy** builds the ctx: `request` or `guarded` give an HTTP-like `Context`, and only `guarded` casts and validates each step's `input` schema (that is how the tools run). `echo` gives a bare `{input, output, signal, steps, params, state}` (that is how `mode.harness.*` and `activity.stdin` run). `direct` reuses the caller's ctx (`daemon.call`).
- The effect's arity picks its call: `()` · `(ctx)` · `(input, ctx)`. Its return value becomes `ctx.output`.
- ctx is **flat**: `shard.context.spread(contexts.host, host)` lifts exactly `entities call cortex modes services statics domain mountpoint reference cargo`, and `bind("mode"|"user"|"thread", …)` adds the rest. Tool effects return `{message, <entity>: [rows]}`; the loop wraps them as `{condition, output}`.
```js
// subsystems/typology/prototypes/vector.js:42
  open(signature, effect) { this.branch(signature).effect = effect; return this; }
// subsystems/typology/gestalten/steer/dispatch.js:74
export function invoke(vector, signal, execute = request) {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}
// subsystems/typology/gestalten/steer/strategy.js:29
export const echo = (carry, effect, steps, signal) => async (input) => {
  const ctx = { input, output: undefined, signal, steps, params: {}, state: {} };
  await carry(ctx, resolve(effect));
  return ctx.output;
};
// subsystems/typology/schematics/primitives/contexts.js:61
export const host = { ...entities, ...call, ...cortex, ...modes, ...services, ...statics, ...domain, ...mountpoint, ...reference, ...cargo };
export const Aperture = { ...vector, ...host, ...mode, ...optional(user) };
export const Harness = { ...vector, ...host, ...mode, ...user, ...optional(thread), ...optional(turn), ...hallucination, ...tools, ...controller, ...intelligent, ...vocal, ...optional(activity), ...optional(screen) };
```
- A Signal from a URL, per the snapshot: `{"nature":"/play/cat/dog","flags":{"gameplay":"PLAIN"}}` (`subsystems/typology/tests/snapshots/signal.snapshot.json`).
- Tool naming: `/entity/find` ⟷ `entity_find` (`new ToolCall(name).signal`, `subsystems/typology/gestalten/belt/hallucinate.js:10-11`).

---

### turn streaming

Packet natures, all ten (`subsystems/typology/schematics/primitives/hallucination.js:244-400`): `/turn/open` · `/part/open` · `/part/delta` · `/part/close` · `/turn/close` · `/tool/call` · `/tool/yield` · `/turn/full` · `/response/close`. Audio uses `/audio/packet` and `/audio/close`. Verbatim uses `/verbatim/{commit,partial,eager,resume,final,polish}`. `Packet.Response` = the first nine.
```js
// subsystems/typology/gestalten/belt/soma.js:3   pour — cata: packets → one turn
    case "/turn/open":  return { ...packet.turn, parts: [] };
    case "/part/open":  turn.parts[packet.index] = { ...packet.part }; break;
    case "/part/delta": … string fields CONCAT, others replace …
    case "/part/close": tool_use input string → JSON.parse
    case "/turn/close": turn.meta = packet.meta; break;
    case "/turn/full":  return packet.turn;
// :85 drain — ana: one turn → packets
export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  … /part/open (strings emptied) · /part/delta (the strings) · /part/close …
  yield { event: "/turn/close", meta: turn.meta ?? {} };
}
// :33 transcript — folds a whole response: { open, condition, turns[], output{message, object, <entity>[]}, meta }
//      /response/close → condition = meta.state === "complete" ? "NOMINAL" : "ERROR"
```
Consumers: `bridge` (the awaited final turn) · `attend` (packets plus an on-seal callback) · `scan` (the running turn per packet) · `tee` · `textFromPackets` · `merge` (`soma.js:110-213`).

The loop:
```js
// subsystems/typology/gestalten/belt/hallucinate.js:128
    while (rounds < policy.rounds) {
      if (!(await controller.proceed())) { yield { event: "/response/close", meta: { state: "abort", rounds } }; return; }
      … for await (packet of deliver(pump, policy.backoff, …)) { turn = soma.pour(turn, packet); yield packet; }
      const closed = turn ? state(turn) : "error";              // "tools" iff a tool_use part
      if (closed !== "tools") { yield { event: "/response/close", meta: { ...turn?.meta, state: closed, rounds } }; return; }
      const settled = await dispatch(policy, turn.parts);        // SERIAL, guarded, each on controller.branch(call.name)
      for (const { call, result } of settled) {
        yield { event: "/tool/call", id: call.id, name: call.name, input: call.input };
        yield { event: "/tool/yield", id: call.id, result };
        parts.push({ type: "tool_result", id: call.id, condition: result.condition, output: result.output });
      }
      yield { event: "/turn/full", turn: { role: "user", parts } };
    }
    yield { event: "/response/close", meta: { state: "length", rounds } };
```
- closing states: `complete · tools · abort · length · error` (error carries `{fault:{kind,message}}`)
- an unknown tool comes back as an ERROR result `"unknown tool: X — armed: …"` [snapshot `hallucination-tool-loop.snapshot.json`]
- a retry fires only before the first packet flows, and only if `fault.retryable` (`deliver`, `:61-80`)

Client consumption: `POST <daemon>/mode/<t>/<s>/harness/dialogue/stream {thread, id, parts}` → an SSE of `Packet.Response`. Fold it with `soma.pour` for the live turn and `soma.transcript` for the result. The ghost ctx word: `ctx.stream = { packets: mode.harness.dialogue.stream({ thread, id, parts }) }` (`contexts.js:54`). The rows persist server-side, so `/userspace/entities/turn/subscribe` and `/find` see them. To cancel: `/userspace/entities/activity/<id>/stdin/SIGTERM`.
```json
// [snapshot] subsystems/typology/tests/snapshots/hallucination-stream.snapshot.json (head)
[ { "event": "/turn/open", "turn": { "role": "assistant" } },
  { "event": "/part/open", "index": 0, "part": { "type": "tool_use", "id": "use-1", "name": "lookup", "input": "" } },
  { "event": "/part/delta", "index": 0, "delta": { "input": "{\"query\":" } },
  { "event": "/part/close", "index": 0 }, { "event": "/turn/close", "meta": { "state": "tools" } },
  { "event": "/tool/call", "id": "use-1", "name": "lookup", "input": { "query": "casa" } },
  { "event": "/tool/yield", "id": "use-1", "result": { "condition": "NOMINAL", "output": { "message": "casa means house", "literal": [ { "id": "literal-1" } ] } } } ]
```
Part channels: `text image audio video document object tool_use tool_result thinking` (`hallucination.js:3-13`).

---

## 11 · auth — the lighthouse, the flows, the credential store

### the flows, measured

Server signer (HS256, `jose`):
```js
// systems/runtime/lifecycle/lighthouse/signer.js:4
const ACCESS_TTL = "1d"; const REFRESH_TTL = "180d"; const OPERATOR_TTL = "2m";
    access: (user) => sign({ id: user.id, type: "access" }, ACCESS_TTL),
    refresh: (user) => sign({ id: user.id, type: "refresh" }, REFRESH_TTL),
    operator: () => sign({ type: "operator" }, OPERATOR_TTL),
// :36 bearer — a refresh is valid only if it EQUALS the stored one
  return user?.authentication?.tokens?.refresh === refresh ? user : null;
// :43 authenticate — Authorization: Bearer <access>  OR  ?token=<access>
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : ctx.request.url.searchParams?.get("token");
```
- secret = `lighthouse.secrets.jwt` = `${SECRET_VIVA_JWT}` (`commons/ledger/ledger.viva.json:8`). It needs at least 24 chars and is minted when blank (`subsystems/paladin/belt/envfile.js:1`).
- **one live refresh per user**: login, signup and autologin overwrite `authentication.tokens`, so a second device's login revokes the first device's refresh token.
- the record on the server is `User.authentication = { provider: "password", credentials: { username, password: <argon2> }, tokens: { access, refresh } }`
- lighthouse config: `Lighthouse { secrets.jwt, traits: JOINABLE|INVITATIONAL|AUTOLOGIN, trait.AUTOLOGIN {username="localhost", password?} }` (`subsystems/typology/schematics/primitives/instance.js:59-80`). The shipped ledger turns on `["JOINABLE","AUTOLOGIN"]`.

Flows (the client is `systems/ghost/typology/lighthouse/lighthouse.js`):
1. **signup** (JOINABLE). `POST /lighthouse/signup {username, password}` → USERNAME_EXISTS, or a new `User{slug: username}`, then argon2 and tokens → `{status, user: card, authority: {access, refresh}}` (`traits/joinable.js:6-19`).
2. **login**. `POST /lighthouse/login {username, password}` → `identify` (argon2.verify) → new tokens → `{authority, user}` (`aperture.js:22-30`).
3. **autologin** (AUTOLOGIN). On boot, the finalizer creates `trait.AUTOLOGIN.username` if absent; the password is optional (`traits/autologin.js:14-23`). `POST /lighthouse/autologin {}` signs that user with **no credential** (`:6-12`). The client calls it when `!isAuthorized` (`systems/ghost/typology/lighthouse/traits/autologin.js:1`).
4. **invitational**. A no-op on both sides (`systems/runtime/lifecycle/lighthouse/traits/invitational.js:1`, `systems/ghost/typology/lighthouse/traits/invitational.js`). The schema's desc promises "/signup takes an invite token", but nothing implements it.
5. **joinable**. This is the same thing as signup; the trait only grafts `/signup`. The client's JOINABLE is a no-op.
6. **verify / refresh / logout**. `/verify {access}` → `{user}`. `/refresh {refresh}` → `{access}`. `/logout {refresh}` nulls both tokens. Client states: `IDLE AUTHENTICATING AUTHENTICATED VERIFYING REFRESHING REFRESHED POPULATING VERIFIED OFFLINE ERROR SESSION_EXPIRED LOGGED_OUT` (`lighthouse.js:4`). A 401 on verify → refresh → a 401 again → logout plus SESSION_EXPIRED.
7. **password reset**. `/lighthouse/password {operator, username, password}`, which needs a 2-minute operator JWT.

Client-side store:
```js
// systems/ghost/typology/lighthouse/execution.js:20
  const file = lighthouseDie.client.instance.paladin.scope.ledger.branch("credentials.json").absolute;   // ~/.viva/credentials.json, mode 0600
  const origin = lighthouseDie.client.runtime.remote.origin;
  if (Object.hasOwn(all, origin)) lighthouseDie.client.runtime.lighthouse.restore(all[origin]);
  await lighthouseDie.client.runtime.lighthouse.verify();
  … store(file, { ...kept, [origin]: { user, authority, at: new Date().toISOString() } });
```
```js
// subsystems/typology/schematics/primitives/credentials.js:5
export const Credential = v.object({ user: UserReference, authority: AuthorityToken, at: Timestamp }, { additionalProperties: false });
export const Credentials = v.record(v.string().desc("The lighthouse origin. Example: http://localhost:2501"), Credential);
```
**known issue `autologin-signin-flashes`** (`.ikiro/known-issues.org:78-90`): with AUTOLOGIN and no cached credential, the client mounts the signin pane for one frame. The cause: `systems/ghost/lifecycle/client/execution.js` runs `integration.surface` BEFORE `resolution.lighthouse`.

---

### the auth story

| step | date | what |
|---|---|---|
| terminal-first | 04-06 | /"Multiple lighthouses, for real. client.lighthouses is a Map."/; `login <url>` is a REPL command |
| m36 (discarded) | — | supabase per die, lighthouse as a GoTrue facade |
| m60 (discarded 10-10) | 09-09 | two principals, signup `open | invite | closed`; overtaken: /"m80 moved the lighthouse into the runtime"/ |
| m76 | 10-01 → 10-03 | Terminal beside Identity · Authentication · Authority on the lighthouse; beef's Identity sketch carries `home: { reference }` and the question /"is this new-tab/new terminal behaviro or first-boot?"/ |
| m79 | 10-04 | /"we need authentication storage for ghost. i dont want to re login to my shell"/ → /"we add a new env var viva-credentials-file … we can store many credentials! many lighthouses."/ · /"lighthouse/localhost"/: one user that /"automatically signs up everyone"/ |
| m80 | 10-07 | the lighthouse a property of the runtime; /"We have one identity, one user. … they merge."/ · /"We don't no longer need all of this enroll shebang. … much more classical user management"/ |
| m82 | 10-10 | the lighthouse slot on the ledger; traits `OPEN · INVITED · OPERATED`; credentials keyed by lighthouse origin, two carriers (file · localStorage) |
| s2 | 10-12 | renamed `JOINABLE` · `INVITATIONAL`, added `AUTOLOGIN`; `/lighthouse/signup` ABSENT without JOINABLE (`release.md:76-78`) |
| s3 #7 | 10-15 | /"The Lighthouse config is universal … joinable makes the runtime expose the sign up at all, and then auto login probably on the client runs against an either auto login or sign up."/ |
| s4-19 | 10-16 | /"why is this top level??? lazy. where is this used? i assume this si lighthouse??!!?"/ → credentials inline in the lighthouse lifecycle |

```js
// systems/runtime/lifecycle/lighthouse/traits/joinable.js — the route grafted or ABSENT
export const JOINABLE = (lighthouse) => {
  lighthouse.aperture.graft(signup);
};
// systems/runtime/lifecycle/lighthouse/traits/autologin.js:15
export const AUTOLOGIN = (lighthouse, runtime) => {
  lighthouse.aperture.graft(autologin);
// systems/runtime/lifecycle/lighthouse/traits/invitational.js
export const INVITATIONAL = () => {};
```

Paladin's part: credentials ride `VIVA_CLIENT_GHOST_CREDENTIALS_FILE` (default `<ledger>/credentials.json`, mode 0600, `m82:1356`). Paladin stays at the door: /"We don't ever, ever, ever want Paladin inside of typology. Never, ever, ever."/ (s1 D). Census `deno info systems/ghost/typology/index.js | grep -c paladin` → 0.

Open: `known-issues.org:78` **autologin-signin-flashes**. On an AUTOLOGIN lighthouse with no cached credential, the signin pane shows for one frame. Two fixes are offered, both beef's call: hide signin while `lighthouse.implements("AUTOLOGIN")`, or run the lighthouse lifecycle before the surface. The frontier also owes /"an invite route for INVITATIONAL"/ (the trait body is empty).

---

## 12 · inline components in turns · the bundler question

### part kinds a turn carries

```js
// subsystems/typology/schematics/primitives/hallucination.js:3
export const Channel = v.union([ "text","image","audio","video","document","object","tool_use","tool_result","thinking" ]);
// :55
Part.Object = v.object({ type: v.const("object"), data: v.record(v.string(), v.unknown()), schema: v.unknown().optional() });
// :72
Part.ToolResult = v.object({ type: v.const("tool_result"), id: v.string(), condition: v.string().optional(), output: v.record(v.string(), v.unknown()) });
```
`soma.pour` folds `/turn/open /part/open /part/delta /part/close /turn/close /turn/full` (`subsystems/typology/gestalten/belt/soma.js:5-27`). There is **no "component" part**. The nearest is `Part.Object` with `{data, schema}`.

### how each client picks a view today

Ghost dock renders text only; every other part prints its bracketed type:
```jsx
// systems/ghost/app/surface/chrome/panes/dock.jsx:20
    <Show when={props.part.type === "text"} fallback={<text fg={palette.textMuted}>{`[${props.part.type}]`}</text>}>
      <Markdown text={props.part.text} />
// systems/ghost/app/surface/chrome/panes/dock.jsx:38   — a REPL VERB's output lands here
export const Message = (props) => (
      <Show when={typeof props.record.data === "string"} fallback={<JsonTree data={props.record.data} />}>
```
```js
// systems/ghost/typology/gestalten/shard/repl.js:5
export const message = async (replDie, next) => {
  await next();
  if (replDie.output !== undefined) replDie.controller.stdout.message(replDie.output);
};
// systems/ghost/typology/mode/traits/repling.js:1
export const REPLING = (mode) => { mode.repl.graft(mode.module.repling); };
// commons/fixtures/testing/console/console.viva.js:19   — the only REPLING mode; returns an object → JsonTree
    (ctx) => ({ user: …, terminal: … }),
```
The ghost views are tables of `[[predicate, tag]]`:
```jsx
// systems/ghost/app/surface/chrome/views/JsonTree.jsx:4
const LEAVES = [
  [(value) => value === null, () => ({ text: "null", tone: "muted" })],
  [(value) => typeof value === "string", (value) => ({ text: JSON.stringify(value), tone: "link" })],
// systems/ghost/app/surface/chrome/views/Markdown.jsx:19
const BLOCKS = [
  [(row) => row.fenced, …], [(row) => HEADING.test(row.line), …], [(row) => ITEM.test(row.line), …], [(row) => QUOTE.test(row.line), …], [() => true, …],
];
// systems/ghost/app/surface/chrome/views/Input.jsx:20   — yields a defaultPrevented key; onSubmit/onInput props
  useKeyboard((key) => { if (key.defaultPrevented) return; if (SUBMITS.includes(key.name)) { … return props.onSubmit(props.value); } …
```
Ghost's Markdown is a line-folder of its own and does not use drapes `parseBlocks`.

In anima, tool output goes to `Json`, and a `buffer` row becomes a launch `Key`. Nothing is mounted inline:
```svelte
// systems/anima/src/app/panels/a/widgets/Turn.svelte:56
      {#if typeof tool.output === "string"} … {:else} <div class="turn-scroll"><Json value={tool.output} openDepth={1} /></div>
// systems/anima/src/app/panels/a/widgets/Turn.svelte:160
    {#if launches.length}
        {#each launches as launch (launch.id)}
          <Key led latched={launch.seated} disabled={!launch.runnable} title="open {launch.label}" onclick={() => onlaunch?.(launch)}>
// systems/anima/src/app/panels/a/widgets/turns.js:130
export const entityRow = (row, key) => {
  const launchable = key === "buffer" && !!row?.id;
```

### schema → form: FormFromSchema (anima-only, svelte)

```svelte
// systems/anima/src/app/panels/c/cards/traits/form/FormFromSchema.svelte:6
  let { schema, value = {}, onchange, daemon } = $props();
  let entries = $derived(fields(schema));
  // field.kind: entity-ref · entity-set · enum (<select>) · number · boolean (checkbox) · string
// systems/anima/src/app/panels/c/cards/traits/form/schema.js:51
const kindOf = (sub) => {
  const entity = entityOf(sub);
  if (entity) return entity.multiple ? "entity-set" : "entity-ref";
  if (optionsOf(sub)) return "enum";
  if (sub?.type === "integer" || sub?.type === "number") return "number";
  if (sub?.type === "boolean") return "boolean";
  return "string";
};
```
It has one importer, `cards/traits/Masked.svelte:44` (mask statics). It is not in drapes and has no tty twin.

### a FOSSIL tty kit: block grammar + suspension (testament, dead imports)

`testament/m82-clients-20261012/subsystems/drapes/tty/` once shipped `Form Picker Confirm Pending Report Listing Table`. They are now unreachable because `tty/index.js:1` imports `@vivalence/sheets/host`.
```js
// testament/m82-clients-20261012/subsystems/drapes/tty/plain.js:12
export const BLOCKS = [
  [(block) => Object.hasOwn(block, "heading"), "heading"],
  [(block) => Object.hasOwn(block, "table"), "table"],
  [(block) => Object.hasOwn(block, "spans"), "spans"],
];
// testament/m82-clients-20261012/subsystems/drapes/tty/Form.jsx:11
const KINDS = ["text", "password", "confirm", "select"];
// testament/m82-clients-20261012/subsystems/drapes/tty/captured.js:6   — a dialog as a suspended value
export const captured = (renderer, props, Component, palette) => {
  const released = Promise.withResolvers();
  const release = fn.once((opts) => { renderer.root.remove(slot); renderer.writeToScrollback(…); released.resolve(opts); return opts; });
  …
  return { release, released: released.promise };
};
```
State machines: `testament/m82-clients-20261012/subsystems/sheets/state/{form,multiselect,search,select,text}.js`.

### the bundler question: measured

**What compiles what, when:** the RUNTIME compiles, through esbuild, under paladin (`subsystems/paladin/belt/bundler.js:27`).
- APPLICATION sources compile once at trait stagger, and again in dev on each `/metadata/application` read.
- GENERATIVE sources compile per tool call, cached by source hash.
- The client never compiles a mode's face. It `fetch`es the served `.mjs`, checks its sha256, and `import()`s a blob (`bundle.js:34-51`).
- Ghost's OWN panes are prebuilt at dev time: `systems/ghost/app/surface/chrome/bundle.js:5-6` (esbuild + Babel solid-universal, `views.js` → `out/panes.mjs`, imported at `chrome/index.js:6`). The deno task that names it is `systems/ghost/deno.jsonc` `bundle`.

**Inline tty.solid SOURCE is refused today (measured).** The bundler test asserts the refusal:
```js
// subsystems/paladin/tests/bundler.test.js:127
    expect(await refused(() => bundler.bundle({ mime: mime.tty.solid, source: "<box/>" }))).toBe(true);
```
The cause: a source is written to `<hash16>.tty.solid` (`bundler.js:65`), and esbuild has no loader for `.solid`. The Solid plugin filters `/\.jsx$/` (`bundler.js:14`). A probe on plain JS (no JSX) at `abc.tty.solid` →
```
REFUSED No loader is configured for ".solid" files
```
Only dom.svelte from source works, because the file ends in `.svelte`. That is the GENERATIVE path, and it is web-only.

**(1) Could a REPLING verb's output carry `{mime: tty.solid, …}` and mount through `module.default(element, bag)`?**

| piece | state | cite |
|---|---|---|
| `default(element, bag)` → `{destroy}` contract | EXISTS (frame only) | ghost `panes/frame.jsx:29` · chess `play.jsx:268` |
| `Bundle.negotiate/load` (fetch + integrity + blob import) | EXISTS, needs `url` + `integrity` | `typology/prototypes/bundle.js:30-51` |
| a REPLING verb's output reaching the screen | EXISTS as `stdout.message` → `Message` → string or JsonTree | `shard/repl.js:7` · `dock.jsx:43` |
| a Message/Turn case that mounts a module | MISSING; dock has no `element` slot, its non-text parts print `[type]` | `dock.jsx:20,43` |
| compile of tty.solid from `source` | MISSING (refused, `.solid` loader + `.jsx` filter) | `bundler.js:14,65` · test `:127` |
| compile of tty.solid from `entry` (a file in the mode dir) | EXISTS, runtime-side | `bundler.js:41` · `play/tests/tty.render.test.js:36` |
| a bundler at the client | ghost carries esbuild + Babel solid as dev deps for its panes only; no runtime path calls them | `chrome/bundle.js:1-3` |
| a precompiled bundle served by the mode | EXISTS for APPLICATION/GENERATIVE: `/attached/bundle/<ctx>/<mode>/<hash16>.<stem>.mjs` | `resolution.js:46-61` |
| a client-hosted REPLING module importing a prebuilt `.mjs` or calling `createComponent` (no JSX) | no bundler needed, since the verb runs IN ghost's process (`repl.js:13`) and can return a live module/function. No consumer of such a value exists | `play.jsx:268` shows the no-JSX `createComponent` form |
| three bag shapes | DRIFT: ghost `{terminal mode thread buffer renderer palette dispatch focused}` · Frame.svelte `{terminal daemon mode thread buffer}` · drapes dom `{buffer dispatch}` | above |

**(2) The declarative alternative (no compile): a `[[predicate, tag]]` block table rendered by both faces.** Pieces it could reuse:

| block | tty piece | web piece | state |
|---|---|---|---|
| text / markdown | ghost `views/Markdown.jsx:19` (own line grammar) | drapes `display/Markdown.svelte` + `dom/Markdown.jsx` over `parseBlocks` | EXISTS ×2 grammars (not shared) |
| json | ghost `views/JsonTree.jsx` (`LEAVES` table) | drapes `display/Json.svelte` · `dom/JsonTree.jsx` | EXISTS |
| heading · table · spans | fossil `testament/…/tty/plain.js:12` `BLOCKS` + `Report.jsx` | `skins/Table.svelte` · `parseBlocks` `table` | FOSSIL (tty), EXISTS (web) |
| form-from-schema | fossil `tty/Form.jsx` (text·password·confirm·select) + `sheets/state/form.js` | anima `FormFromSchema.svelte` + `schema.js kindOf` | FOSSIL (tty), anima-only (web) |
| select / picker | fossil `tty/Picker.jsx` + `sheets/state/search.js` | `<select>` inside FormFromSchema · `controls/Segmented.svelte` | FOSSIL / partial |
| confirm | fossil `tty/Confirm.jsx` (y/n/toggle) | none in drapes | FOSSIL / MISSING |
| progress / pending | fossil `tty/Pending.jsx` (promise → glyph) · ghost none | drapes `Meter.svelte` · `Spinner.svelte` · `dom/Spinner.jsx` | FOSSIL / EXISTS |
| text input | ghost `views/Input.jsx` (`EDITS` table, yields `defaultPrevented`) | drapes `controls/Input.svelte` · `dom/Field.jsx` | EXISTS |
| suspension (a block that answers) | fossil `tty/captured.js` `release`/`released` (`fn.once`) | none | FOSSIL |
| part carrying it | `Part.Object {data, schema}` | same | EXISTS in schema; no renderer branches on it (ghost `[object]`) |

The designer decides.

## 13 · dev modes · telemetry · logging · processes

### dev modes (runtime)

```jsonc
// systems/runtime/deno.jsonc:10-21
    "run": "deno run -A run.js",
    "watch": "deno run -A --watch=../../commons,$HOME/.viva/registry --watch-exclude=**/dataset/** run.js",
    "test": "deno test -A --no-check --watch tests/**/*.test.js",
    "test/snapshots": "SNAPSHOT_HOT=1 deno test -A --no-check tests/**/*.snapshot.test.js",
    "test/daemon" · "test/mode" · "test/runtime" · "test/bench" (all --watch) · "test/cortex" · "playground/drain" · "interactive/activity" (--port 7710 --panel)
```
- **readiness**: `run.js:25-30` prints `die.controller.status` when the root span opens. `Status.toString` gives `Status:<code>` (`subsystems/typology/prototypes/status.js:50`). The rig waits on `/^Status:RUNNING$/` (`systems/runtime/tests/scenarios/hello.js:9`). Exit code: `0` iff STOPPED (`run.js:35`).
- **ports**: runtime `VIVA_RUNTIME_ORIGIN` defaults to `http://localhost:2501`, anima to `:1794` (`commons/ledger/environment.json:23,31`). The playground instance offsets these to `2502` / `1795` (`commons/instances/playground/instance.viva.json:49,57`).
- **SNAPSHOT_HOT=1**: rewrites the snapshot files (`subsystems/typology/tests/hallucination.snapshot.test.js:5`; also `systems/runtime/tests/{cortex-contract,stripwire,fixtures/corpus}…`).
- **watch** restarts IN-PROCESS; a save under `commons` or `~/.viva/registry` IS a deploy.

Env vars read (`Deno.env.get` / `paladin.env.get`, outside tests):

| var | effect | file:line |
|---|---|---|
| `VIVA_RUNTIME_PRUNE=1` | drops daemon rows absent from the recipe instead of throwing | `systems/runtime/lifecycle/runtime/population.js:170` |
| `VIVA_ENV_FILE` | an extra .env; throws if it holds no VIVA_* | `subsystems/paladin/lifecycle/populate.js:16-21` |
| `INIT_CWD`/`PWD` | cwd for `./.env` | `populate.js:10` |
| `VIVA_LEDGER_MOUNT` | ledger home, default `~/.viva` | `populate.js:30` |
| `VIVA_INSTANCE_MOUNT` | instance home, must be a PATH (a slug throws) | `populate.js:40-49` |
| `VIVA_MOUNTPOINT_MOUNT` | data dir, default `<instance>/mountpoint` | `populate.js:58` |
| `VIVA_REPOSITORY_MOUNT` | the checkout | `populate.js:70` |
| `VIVA_REGISTRY_MOUNT` | package store, default `~/.viva/registry` | `populate.js:78` |
| `VIVA_PROCESS_ID` | loads `~/.viva/sessions/<id>.json` | `populate.js:85-89` |
| `VIVA_SYSTEM_ROLE` | `paladin.role` (RUNTIME/CLIENT/SUDO…) | `subsystems/paladin/prototypes/paladin.js:99` |
| `VIVA_SYSTEM_MODE` | `DEVELOPMENT` → `paladin.is.dev` → `/metadata/application` recompiles per read | `paladin.js:103`, `belt/is.js:10`, `systems/runtime/gestalten/shard/host.js:34` |
| `SECRET_*` / `PUBLIC_*` | `${…}` expansion in recipes; SECRET via `paladin.secret` | `subsystems/paladin/belt/expand.js:5`, `belt/publish.js:6` |
| recipe-only | `VIVA_RUNTIME_ORIGIN · VIVA_RUNTIME_SERVE · PUBLIC_VIVA_RUNTIME_REMOTE · VIVA_CLIENT_ANIMA_{ORIGIN,SERVE} · SECRET_VIVA_{JWT,ANTHROPIC_API_KEY,OPENROUTER_API_KEY,ELEVENLABS_API_KEY,DEEPGRAM_API_KEY}` | `commons/ledger/environment.json` |

Strata order: `flag cwd instance .env os session ledger` (`paladin.js:5`).

Recipes:
```json
// commons/ledger/ledger.viva.json:5-17
  "runtime": { "statics": { "serve": "${VIVA_RUNTIME_SERVE}", "remote": "${PUBLIC_VIVA_RUNTIME_REMOTE}" } },
  "lighthouse": { "secrets": { "jwt": "${SECRET_VIVA_JWT}" }, "traits": ["JOINABLE", "AUTOLOGIN"] },
  "datamap": { "module": "@commons/datamap/libsql" },
  "hallucinators": [ anthropic, openrouter ],
  "clients": [ { "slug": "anima", "statics": { "serve": "${VIVA_CLIENT_ANIMA_SERVE}" } }, { "slug": "ghost", "modes": ["@commons/home/console"] } ]
// commons/instances/hello-world/instance.viva.json:3
  "daemons": [ { "manifest": { "type": "daemon", "slug": "hello" }, "modes": ["./mode.viva.js"], "consume": { "reader": { "module": "@commons/service/reader" } } } ]
```
- `hello-world/mode.viva.js` traits: `HARNESSED CONVERSATIONAL TOOLING EMITTER APPLICATION GENERATIVE EXPOSED`. Its aperture has `/hello/bot` and `/hello/agent`. Its harness default is `shard.hal.defaults({policy:{tune:"capable",rounds:10}, settings:{effort:"low"}})`.
- `playground`: a stub hallucinator with scripts `slow stalled toolstorm flaky hung` and 9 playground/chaosmonkey modes.
- `commons/instances/localhost/` and `commons/harnesses/daemon/` are EMPTY dirs. `commons/harnesses/runtime/runtime-harness.viva.js` is `HARNESSED AGENTIC` with an empty harness.

A dev instance on this machine (read-only `ls`):
```
~/.viva/instances.json             { "localhost": { mount: "~/.viva/instances/localhost", createdAt, updatedAt } }
~/.viva/instances/localhost/       .env · instance.viva.json (daemons chess · droneaid · italian; env VIVA_SERVICE_{STOCKFISH_*,NLP_*})
  mountpoint/                      localhost.viva.db · migrations/Migration20261013133033.ts · daemon_chess/ (bundles…) · daemon_droneaid/ · daemon_italian/
~/.viva/logs/localhost/            runtime.out.log · spans.jsonl (2961 lines)
~/.viva/                           credentials.json · ledger.viva.json · registry.json · registry/ · sessions/ · locks/ · bak/
```

---

### telemetry + logging (runtime)

Today, everything flows through `die.controller.stdout` (a Span):
```js
// systems/runtime/run.js:22
  die.controller.stdout.to((record) => console.log(`[${record.path}] ${record.verb}`, record.data ?? record.message ?? ""));
// systems/runtime/lifecycle/runtime/integration.js:10
  const log = paladin.ledger.log(die.runtime.instance.manifest.slug);
  die.controller.stdout.to((record) => log.append({ json: record }));        // → ~/.viva/logs/<instance>/spans.jsonl
// :16 patrol — every 60 s
  die.controller.stdout.note({ service: die.runtime.processes.service.census(), daemon: die.runtime.processes.daemon.census() })
// systems/runtime/entities/Activity.ts:35 — a SECOND root per hallucination
      stdout: new Span("hallucination").to((record) => console.log(`[hal ${record.path}] ${record.verb}`, record.data ?? "")),
```
- record = `{span, trace, path, verb, at, data?}` (`subsystems/typology/schematics/primitives/controller.js:46-53`). Example line from `~/.viva/logs/localhost/spans.jsonl`: `{"span":109,"trace":91,"path":"/runtime/runtime/daemon/chess/mode/domain/chess","verb":"open","at":1895.73}`.
- mode spans are `stdout.branch(mask.reference.absolute)` (`lifecycle/runtime/population.js:134`, `daemon/population.js:64`). DATASET install phases are `…/install/<type>` with `note({done,total})`.
- other plain `console.*` sites (12): `lifecycle/mode/resolution.js:9,16,20,23` · `runtime/population.js:114` · `daemon/population.js:45` · `daemon/resolution.js:45` · `traits/exposed.js:5` · `traits/emitter.js:24` · `belt/modes.js:26` · `traits/datasink.js:23` · `Activity.ts:35`, plus `[multiplex]` (`subsystems/typology/gestalten/shard/serve.js:52`)
- `server-timing` header: added when `ctx.span` is set (`shape/http.js:62-65`)

m89, DESIGNED 10-12 and not implemented (`.ikiro/quests/m89-telemetry.org:3`). The forks, verbatim (`:1636-1645`):
```
| F1 | the clock | a: at stays performance.now() · b: performance.timeOrigin + performance.now() · c: a + an origin ISO on the root's open | b |
| F2 | what run names | a: per ROOT span (a trace id) · b: per PROCESS (a resource id) | a |
| F3 | the fold | a: WHOLE-slot (inherit, zero paladin code) · b: key-wise like environment (v.interface) | a |
| F4 | console default | a: fault, the recipe says control · b: control for all · c: a per-process key | a |
| F5 | a refused form | a: fault on the ROOT (today: FAILED) · b: on stdout.branch(signal.pathname) | b |
| F6 | paladin's noun | a: Log · Ledger.log() · ~/.viva/logs/ stay · b: rename to telemetry | a |
| F7 | the second roots | a: leave Activity.ts:35 · socket.js:39 · registry.js:29 · b: branch the Activity's controller from ctx.mode.stdout | a this quest |
| F8 | the nine spans.jsonl | a: leave · b: capture to ~/.viva/bak/logs-20261012/ | b |
| F9 | showing the inspector | a: by the word · b: a chord (/key/ctrl-g) | a now |
| F10 | caps.story | a: children a root keeps + roots kept (trace.trim) · b: a record budget | a |
```
The data shape it would add, a `telemetry` slot on the ledger/instance (`m89-telemetry.org:474-520`):
```js
export const RANK = ["off", "fault", "control", "note", "wire"];
export const Telemetry = v.object({ level: Level.default("note"), filters: Filters.default([]), caps: { journal: 1000, story: 200 },
  surfaces: { console: { level: "fault" }, ledger: {}, inspector: { level: "off" } } });
// the record gains `run` (one per root span), and `at` becomes epoch ms
```
- its ontology: record · span · run · resource · trace · story · level · filters · pipe/sieve · surface (`console ledger inspector`) · beacon (`Status:RUNNING`) · snapshot (`telemetry.stable(node)`)
- a story snapshot today [snapshot `systems/runtime/tests/snapshots/span-tracked.snapshot.json`]: `[{ "path": "/render", "nature": "render", "timing": {"measured": true}, "entries": [{ "verb": "subject", "data": {"schema":"dialogue","id":"turn-1"} }], "children": [ … "/render/provider/translate" ] }]`

`commons/dashboards/dataspace`: an APPLICATION mode with traits `["APPLICATION"]` (`dataspace.viva.js:12`). It reads `connection.call("/datamap")` and `"/metadata/aperture"` (`Dashboard.svelte:139-141`), then drives `RemoteRepository.subscribe` on `/entities/<name>/subscribe` (`:920`). Its enum tables are `commons/dashboards/dataspace/schema.js:1-30`.

What a client can subscribe to now:
- `/runtime/<slug>/status/subscribe` · `/daemon/<slug>/status/subscribe` (the Status atom)
- `/userspace/entities/{terminal,intent,thread,buffer,turn,note,activity}/subscribe` · `<host>/entities/mode/subscribe` · `/daemon/<slug>/entities/{literal,symbol}/subscribe` (`{op, entity}`)
- `/userspace/entities/activity/<id>/stdout` (controller Records, replay then tail)

No route exposes the runtime's own stdout or `spans.jsonl`. They exist only on disk and on the console.

---

### processes

```ts
// systems/runtime/entities/Process.ts:5
export class ProcessEntity extends VirtualEntity {
  type = ""; slug = ""; mask = null; controller = null; execution = null;
  get status() { return this.controller?.status.reflection.code ?? null; }
  async execute(execution, context = {}) { … steer.dispatch.execute(execution, { ...context, controller, mask, [this.type]: this }) … }
}
// :36 ProcessRepository: create (throws "<slug> is held") · kill(where, signal) · census() → { slug: status } · removeOne (SIGKILL if unsettled)
```
- kinds: `Daemon extends ProcessEntity` (`type="daemon"`, with its own Aperture, cortex, datamap, entities, twitch, modes, services: `systems/runtime/prototypes/daemon.js:5-35`) and `Service extends ProcessEntity` (`type="service"`, `attachment = new Vector()`: `prototypes/service.js:5-8`).
- where they live: a SEPARATE datamap, `runtime/<slug>/processes`, with `die.runtime.processes.{service,daemon}` = `ProcessRepository` (`lifecycle/runtime/population.js:32-46`)
- lifecycle: each process runs its execution under `process.settle` (fault → `stdout.fault`, always `close`) and `process.keepalive` (holds until the controller settles) (`systems/runtime/gestalten/shard/process.js:3-16`). The runtime kills every service and daemon with SIGTERM in a `finally` (`lifecycle/runtime/resolution.js:11-27`).
- services: only ATTACHED masks become processes. The rest go to `instance.dormant` as "not ATTACHED — consumed only" (`population.js:146-153`). A daemon consumes services in-process via `citizen.provider` (`lifecycle/daemon/population.js:52-60`). The service traits catalog is `ATTACHED · SERVICE · PROVIDER`, and the last two are no-ops (`lifecycle/service/traits/index.js`).
- on this machine: daemons `chess` (consume `engine`), `droneaid`, and `italian` (consume `nlp`).

A client can list:
- `GET /metadata/daemons` → `[{slug, reference:"/daemon/<slug>", modes:<n>, metadata:"/daemon/<slug>/metadata"}]`
- `GET /metadata/services` → `[{type, slug, reference:"/attached/process/service/<type>/<slug>", metadata}]`
- per process: `/daemon/<slug>/status[/subscribe]` · `/attached/process/service/<t>/<s>/{status,manifest}`

There is no `/entities/process` route. `census()` exists only in the 60-second patrol note. For the per-user live work there is **Activity** (§9·1).
```json
// [derived] /metadata/daemons on ~/.viva/instances/localhost
[ { "slug": "chess", "reference": "/daemon/chess", "modes": 13, "metadata": "/daemon/chess/metadata" },
  { "slug": "droneaid", "reference": "/daemon/droneaid", "modes": 12, "metadata": "/daemon/droneaid/metadata" },
  { "slug": "italian", "reference": "/daemon/italian", "modes": 9, "metadata": "/daemon/italian/metadata" } ]
```

### dev + log on ghost
See §4 · 5 (`DEV / LOG`): no logger, the dock IS the log; opentui console on backtick; `--verbose` only. On anima see §5 · 6: a local `Pipe` → Boot tail · panel G · `console.debug`, never the runtime.

## 14 · the ledger: where hosts and clients come from

```jsonc
// commons/ledger/ledger.viva.json:1
{
  "runtime": { "statics": { "serve": "${VIVA_RUNTIME_SERVE}", "remote": "${PUBLIC_VIVA_RUNTIME_REMOTE}" } },
  "lighthouse": { "secrets": { "jwt": "${SECRET_VIVA_JWT}" }, "traits": ["JOINABLE", "AUTOLOGIN"] },
  "datamap": { "module": "@commons/datamap/libsql" },
  "hallucinators": [
    { "module": "@commons/hallucinator/anthropic", "secrets": { "key": "${SECRET_VIVA_ANTHROPIC_API_KEY}" } },
    { "module": "@commons/hallucinator/openrouter", "secrets": { "key": "${SECRET_VIVA_OPENROUTER_API_KEY}" } }
  ],
  "clients": [
    { "manifest": { "type": "client", "slug": "anima" }, "statics": { "serve": "${VIVA_CLIENT_ANIMA_SERVE}" } },
    { "manifest": { "type": "client", "slug": "ghost" }, "modes": ["@commons/home/console"] }
  ]
}
```

A client is a ledger citizen like a runtime: it has a manifest, statics, and its OWN hosted modes (`@commons/home/console` is ghost's — REPLING, `/hello` · `/whoami`). anima is declared with a `serve` only — it hosts nothing yet. Coherence target: both clients declared the same way, both hosting `console`, both reading `HOME` from the mask.

```jsonc
// ~/.viva — the ledger on disk (codemap/paladin.md)
{
 "dirs": ["bak", "instances", "locks", "logs", "registry", "sessions"],
 "files": [".env", "credentials.json", "environment.json", "instances.json", "ledger.viva.json", "registry.json"],
 "instances.json": ["localhost"]
}
```

# IV · the brief

## 15 · gaps, consolidated — what no face can do today

Measured 10-16 against both clients. A row here is a hole the mockups must fill or knowingly leave.

| capability | ghost (tty) | anima (dom) | the law that constrains the fill |
|---|---|---|---|
| sign in / sign up | none: `login`/`signup` have 0 callers; without AUTOLOGIN or a cached credential `authorized` waits forever (`systems/ghost/typology/lighthouse/execution.js:44`) | `Login.svelte` form, no signup UI, no autologin (`systems/anima/src/app/widgets/Login.svelte:51-60`) | one flow, both faces; AUTOLOGIN must not flash a signin (known-issue `autologin-signin-flashes`) |
| boot cover | none: the chrome mounts before the runtime is reached (`client/execution.js:221-222`), no pane | `Boot.svelte`: spinner · gate word · log tail | the dock journal IS the boot log on ghost; anima's Boot tail is the same records |
| terminals: create · list · switch · close | one terminal, `rows[0]`, no verb (`client/execution.js:213`) | bone Terminals + C card: row · ✕ · `+ terminal` | a terminal is the seat; `/terminal/*` verbs do not exist yet on either side |
| thread list · history | none: `thread.$turns` has 0 readers; the dock tails the client span | C threads card (top 3), `focus.js` hydrates turns, `enrich()` joins runs | rows arrive by subscription, never through the repl |
| host health · lighthouse standing · activity | `$status` on runtime/daemon/lighthouse, `thread.$activity`: 0 pane readers | spine pips + tooltip + pinned float; pause/stop/resume | one status row across faces (m82's crown proposal: `✦ <instance> · <user> · <host> › <mode> · ● streaming`) |
| stop a running activity | `Activity.controller.stdin.*` wired, nothing sends | composer stop (SIGTERM, hold 2 s → SIGKILL) | `/userspace/entities/activity/<id>/stdin/SIGTERM` is the one route |
| turn parts beyond text | `[type]` muted (`dock.jsx:20`) | `ToolRow` well, thinking, artifacts img · audio · link | parts: `text image audio video document object tool_use tool_result thinking` |
| live stream | chrome paints `stream`; plain repl prints only the finished turn | `LiveTurn`: calling · streaming · thinking + elapsed | `soma.pour` is the fold on both |
| input editing | single line, no history, no completion, backtick leaks into the draft | textarea, ↑ recall, Enter/Shift-Enter, dictaphone | the composed repl tree (`/help`) IS the completion source |
| mouse · selection · scroll | none | everything | the buffer row carries selection · cursor · draft (`buffer.data`) |
| the frame | 48-col dock when framed; Floor = JsonTree, no keys; ⇥ only under a mounted view | `Frame` over A; bundle never mounts (RED: `view` vs `bundle`) | one bag `terminal · mode · thread · buffer (+renderer · palette · dispatch · focused)` |
| entity browsing | none | C cards: terminals · threads · modes · thread · mode · buffers · buffer · harness; `FormFromSchema` | domain-blind: domain words arrive as DATA; `commons/dashboards/dataspace` is the generic browser |
| theme · zone | fixed `tokens("northsea", "2")` | 4 themes, zones 0 · 1 · 3 used, 2 unused | dapper `tokens(theme, zone)` throws on an unknown pair |
| box (mic · speaker) | none | B box: mic on/live/level, speaker on/tone/flush; VAD; worklets | tty has no devices; the verbs can exist and answer "no box" |
| telemetry · logs | the dock IS the log (span records); opentui console on backtick; no telemetry | local `Pipe` → Boot tail · panel G · `console.debug`; never reaches the runtime | m89 DESIGNED: `telemetry` slot, surfaces `console · ledger · inspector`, F1–F10 open |
| dev affordances | `--verbose` only; `VIVA_SYSTEM_MODE=DEVELOPMENT` recompiles bundles per read (runtime) | `/design` audit page; B config readings; G · H toggles | nothing names a "dev chrome" yet |

## 16 · open questions — the designer's, each tied to a ruling

1. **One chrome or two?** /"maybe we still have the pincer in anima and no pincer in a more of a standard chatbot coding agent management framework on the TTY side"/ (m82 W) against /"in both cases both clients should implement the same layout logic."/ (m82 S). The brief's stance: ONE layout logic, rendered twice; the pincer is a dom-only GESTURE over the same layout state, or dies. Decide.
2. **What returns of the bones and the eight cards?** /"dock is dock. the bones and panels come later."/ (s3 #10). Today the ring has verbs for `help · quit · chrome · modes · mode · application/start|stop · harness · *`. Every card control that survives must become a verb first (§4 table 7, §5 table 9).
3. **The dock's two natures.** It is the chat AND the journal (messages · faults · boot records). In dev the journal is the log. How does a reader tell a turn from a fault from a boot message at a glance, and how does the dock fold the journal away when a user only wants chat? /"the dock is losing its meta."/ (m73).
4. **Views beyond the dock.** /"its tiling, notebook, canvas, dock we now build only dock i think."/ (s1 H). Named, undesigned.
5. **The status line.** Crown or not; what it shows (instance · user · host · mode · activity); same string on both faces?
6. **Keys.** /"keys are their own mechanism. later."/ (s3 r9). Who owns Enter, ⇥, Esc, digits, a leader; which-key over the composed repl tree?
7. **Signin while AUTOLOGIN.** A cover, a pane, or nothing (`autologin-signin-flashes`, two fixes waiting).
8. **HOME on every new terminal vs first boot** (m88 · m76's /"is this new-tab/new terminal behaviro or first-boot?"/).
9. **Threadless terminals with a client mode** (s3 r4): what does a terminal seated in `@commons/home/console` show?
10. **Where telemetry shows** (m89 F9: /"showing the inspector — a: by the word · b: a chord"/). Inspector = panel H today; on tty, the opentui console on backtick.
11. **Inline components in the dock** (§12): a verb's answer as a select, a form over its `input` schema, a progress; the SAME block grammar on both faces, no compile.
12. **The bundler question** (§12): may a REPLING mode return a face? What exists: precompiled bundles served by the runtime under `/attached/bundle/…` with an integrity hash; what is missing: any compile on the client. The declarative block table is the near-term answer; the designer draws the blocks.
13. **Multi-client coherence** (s1 G): the same thread open in ghost and anima must mirror. Rows subscribe; nothing is walked yet. Mock the "two windows, one thread" case.
14. **Zone open points** (`reference/design.md` §11): rails zone 0 or 1; who sets zone 2 (/"the mode declares itself an island · the host decides"/).
15. **Desktop** (m85 empty; `reference/tauri-deno-demo.md` half-wired) — out of this brief unless the layout must reserve for it.

## 17 · the screens to mock

m82 named five screens on both targets (`m82:1311`): **boot · signin · chat · buffer · navigation**. This brief asks for those five plus three the ring made necessary. Each screen is to be drawn TWICE — tty (ghost, monospace cells, `northsea` zone 2 palette today) and dom (anima, dapper zones) — from the SAME state, with the SAME verbs visible.

| # | screen | state it renders | verbs on it | both faces must agree on |
|---|---|---|---|---|
| 1 | boot | journal records `lighthouse · user · runtime · terminal · home · <host> modes`; host `$status` | none (a cover) | what is read while waiting; the AUTOLOGIN case shows no signin |
| 2 | signin | lighthouse `STANDINGS` word; traits JOINABLE / INVITATIONAL / AUTOLOGIN decide which fields exist | `/login`, `/signup` (JOINABLE), `/autologin` | the route grafted-or-ABSENT shows or hides the control |
| 3 | chat (dock) | `stdout.tail("message","fault","turn","stream")` in journal order; the live `open` turn; the draft | `*`, `/help`, every composed verb | turn vs message vs fault glyphs; parts beyond text; stop |
| 4 | buffer (frame) | `terminal.$buffer` → the mode's face over `buffer.$data`, or the Floor | `/application/start|stop`, the face's own | the bag; focus (⇥) ; what the Floor shows |
| 5 | navigation | terminals · threads · modes · hosts (`/metadata/daemons` · `/modes`) | `/mode <words>`, `/modes`, future `/terminal/*`, `/thread/*` | one picker grammar: words narrow, one match sets, else candidates |
| 6 | status (crown) | instance · user · host › mode · activity · lighthouse standing | none, or a tap opens 5 | the one string |
| 7 | dev chrome | the journal as a LOG: spans, faults, timings (m89 inspector), the opentui console / panel G+H | a toggle (word or chord) | the same record shape `{span, trace, path, verb, at, data}` |
| 8 | inline blocks | a verb's answer rendered as text · json tree · select · form-from-schema · progress inside the dock | the block's own submit → a line back into the ring | one block grammar, two renderers |

Constraints on every mock, from the law:

- **Every control is a line.** Draw the line it sends (`/mode chess/play`) next to or under the control, at least in the dev chrome.
- **Domain-blind.** No chess, no Italian, no droneaid in the chrome. Those words appear only inside a mounted face or as DATA in a row.
- **Rows in the frame and the navigation, lines in the dock.** Never a row in the journal, never a verb answer in the frame.
- **Tokens, not hexes.** dapper `tokens(theme, zone)`; the tty palette is the FLAT subset (`surface surfaceSunk surfaceLift boundary textStrong textInk textMuted textLink signalPrimary signalPositive signalCaution signalNegative inverse inverseOn`).
- **Absence IS the signal.** A verb the composed repl does not carry has no button: the control set is derived from `shape.strip(ctx.repl)`.
- **Fair-source.** Public copy never says open-source.

What the designer gets back from us after the mocks: one `.dc.html` per screen pair, ported under skill `design` (both texts read, pane lines written, hexes verbatim until beef orders the theme).
<context files="0" tokens="~0">

</context>
