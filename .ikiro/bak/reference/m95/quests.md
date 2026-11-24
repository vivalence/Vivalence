> Research record 10-19 for m95, written BEFORE the drill. Killed since: "face" → the buffer's component (m95 lock 6); a shared row model across clients (REJECTED, lock 1); "the keymap is a view of the repl" (REJECTED). The quest's rulings win over anything below.

# quests — research for m95 depincered client (10-19)

Paths are relative to `.ikiro/` unless rooted. Read-only research. §1–§6 are the synthesis; the per-file notes that back each claim are appended verbatim after §6 (`## APPENDIX`).

Tree facts measured this session:
- Live `systems/anima/` is SvelteKit. It has 55 `.svelte` files and 0 `.jsx`, and `vite.config.mjs:1,3` imports `@deno/vite-plugin` and `@sveltejs/kit/vite`.
- The 10-11 Solid rebuild of anima (`done/m86….s1.org:861`, `vite-plugin-solid`, prod build 355 kB) lives only in `testament/m82-clients-20261012/systems/anima/` (`vite.config.mjs:2` is `import solid from "vite-plugin-solid"`; `src/` = `client.js · client.css`).
- So "anima rebuilt in Solid" happened once and was rolled back to the m82 snapshot. m95 is the SECOND Solid anima.
- `testament-probes.md:36-58` proved the solid-vite rig: vite 6.3.3, vite-plugin-solid 2.11.10, solid-js 1.9.12, no `@deno/vite-plugin`, exact `import_map.json` entries. m86.s2 F28 ruled /"the referenced probe should win."/ (`done/m86….s2.org:4297`).

## 1 · per quest

### done/m86-repl-loop-clients (+ .s1–.s4)

**Status**
- `DONE 10-16 … T-chrome-toggle · T-application still owed his eyes` (`done/m86….org:3`).
- The main file is the only live law; .s1–.s4 are HISTORY (`:24`, stretch table `:16-22`).
- .s1: stretch one, milestones 1–4 landed 10-11 (`.s1:859-866`).
- .s2: `LANDED 10-12 both milestones, his walk owed` (`.s2:3`).
- .s3: `DESIGNED 10-15`, nothing landed; ghost was reshaped by hand 10-16 instead (`.s3:1805`).
- .s4: `RE-TANGLED 10-16, FOURTH PASS`, nothing landed from it (`.s4:3`).

**Rulings that bind the rewrite**

The client and the surface:
- /"the client is the entity that anima and ghost share"/ (`.s2:22` B).
- /"the die is the client. instantiate the client prototype as the die itself."/ (`.s4` s4-2; `.s4:40`).
- /"chrome is ui rendering of repl. the emacs to our lisp - almost."/ (`.s2:22` G).
- /"surface. not target."/ (`.s1:25`).
- Surface contract `{viewport, credentials, accept, keys, interactive, emit, hold, mount{signin·crown·dock·frame·navigation}}`; three surfaces, plain · pipes · tty (`.s2:3735`).

The repl:
- The repl is composed PER LINE, in this order (`m86.org:30-43,36`; `.s4:2336-2341`):
  1. `client.repl`
  2. hosted modes at ROOT
  3. `terminal.repl`
  4. mounted modes scoped `/mode/<type>/<slug>`
  5. `*` only on HARNESSED
- The repl is not reactive: no `$repl`, no repl list (b5, `.s4:2835`).
- `ctx.repl` is the composition (s4-29).
- `<<` is the repl's only glyph (`.s2:182`).
- Bare `viva` opens the repl, and `chrome` inside it launches the chrome (`.s2:58,4281-4283`).

Dock and frame:
- The dock tails ONE span: `client.controller.stdout.tail("message","fault","turn","stream")` (`m86.org:41`; `.s4:35`).
- The dock is one per client (F15, `.s2:39`); /"dock is dock. the bones and panels come later."/ (.s3/.s4).
- The frame belongs to the SURFACE (s4-10). It opens on `/application/start`, never on a thread set (`m86.org:66`).
- The view door is one bag: `default(el, {terminal, mode, thread, buffer, renderer, palette, dispatch})` (`.s4:752,800`; `m86.org:670-740`).

Kills:
- /"there fucking are no slot and chord. never agreed to the name"/ (`.s2:169`). m92 Q2 later RE-ADMITS "chord" as the key declared on a repl pattern (`m92-keymap.org:59`); the later word wins.
- Ink is dead in one move (`.s1` decision 12; `.s1:861-862`).
- /"defer react. keep solid and svelte"/: Solid is the client, svelte stays a mode render target (`.s1` decision 13). m87 later keeps `.svelte` mounts as artifacts (`m87:145-148`).
- Three attachment levels, cut · captured · chrome; anima is always chrome (`.s1` decision 7; `.s1:519-529`).
- No `surface.signin`: the signin is a pane that dispatches (`.s1` decision 8).

**Landed vs owed**

Landed (10-16):
- The ring `client.dispatch` → `shard.repl.dispatch`.
- An OpenTUI chrome that is dock ⊕ frame, with the dock narrowing to 48 columns when a buffer is open (`m86.org:609-632`).

Owed:
- `T-chrome-toggle` (`m86.org:2815`) and `T-application` (`:2820`), both his eyes.
- `memo.jsx` imports dead `@vivalence/sheets` (`m86.org:740,822`; known issue `memo-tty-face-on-dead-sheets`, `known-issues.org:2940`).
- His amen on `hydration` (`m86.org:160,2828`).
- The four .s1 testimonies T-home · T-twin · T-offline · T-sigil (`.s1:850-853`).

**Open**
- Out of scope in m86, so owed by m95: crown, navigation, signin cover, keys, pickers, anima (`m86.org:66,2829`).
- Remote-mode REPLING (r12).
- A threadless terminal on a hosted HOME (r4).
- Remembering the last active terminal.
- Lines are handled serially, so `/abort` waits behind a streaming turn; lean: ctrl-c/esc go to the controller, never the repl (`.s2:4303`).
- Navigation's `useKeyboard` hears keys even while the dock input has focus (`.s2:1201,4307`).
- Whether `@vivalence/ghost` should carry the chrome stack: anima-imports-ghost pulls in paladin (`.s2:4264`).
- `$dock` is not persisted (`.s2:4310`).

**Touches m95**
- This IS the chrome being rewritten. Keep the per-line repl, the single-span dock, the surface-owned frame and the one-bag view door.
- Replace with m87 and m92 respectively: the Floor, the `/key/<k>` command files (`.s2:1724-1773`) and `Bundle` negotiation.

### m83-tools-and-primer

**Status:** `CUT`, not landed, his go per file. It is superseded on `tools/<subject>.js` by m91 (`m83-tools-and-primer.org:3`; `frontier.md`).

**Client relevance (thin)**
- A tool and an aperture route have the same shape and differ by AUDIENCE only, model vs client (`m83:896-897`).
- Deferred idea: one Vector with an audience mark (`m83:994`).

**Stale**
- "the dock is the only reader of prose" and the FORMAT primer "The dock renders markdown" (`m83:73,221`). m95's dock must keep rendering markdown, or the primer re-cuts.
- `"APPLICATION", // buffers from static svelte` (`m83:97`).
- `Oracle.svelte` callers (`m83:820,864`).

**QA:** `m83/T-primer-lazy` · `T-primer-edit` pending (`m83:988-989`). These are seen in the dock.

### m87-buffer-view-file

**Status:** `DESIGNED 10-16, holes closed 10-17 … Nothing tangled, nothing landed. Next: go per milestone` (`m87-buffer-view-file.org:5`).

**Client rulings**
- Q15 /"How the fuck should the runtime be able to decide what a client can accept? […] Of course it's the client."/ (`m87:192`). There is a renderer table per client, and `accept` is derived from it.
- Q17 /"A buffer is the state space between an artifact and its consumer."/ · /"the turn references the buffers, and the buffers reference the artifact"/ (`m87:194`).
- Q17b /"if there is a cell renderer for this artifact, and there's a frame renderer for it […] we can just display it in either place and we need controls to switch"/ (`m87:195`). The CLIENT decides the target.
- Q18 `target` is a nullable constraint on Artifact AND Buffer (`m87:196`).
- Q8 /"artifacts are not parts. They just dangle off the turn."/: they render as a block after the parts (`m87:185`).
- Q10 /"just render the most recently updated that we can display"/ + `RENDERED` buffer trait pins (`m87:187`).
- Q21 turn↔buffer m:n (`m87:199`).
- Q25 /"7 permitted."/: generated `vnd.vivalence.*` code runs with the client's `dispatch` (`m87:203`).
- Law 3: `application/vnd.vivalence.*` = code the client imports and calls `default(target, {buffer, …})`; every other mime = content the client renders itself (`m87:223`).
- Law 4: a `[[predicate, Renderer]]` table over `(artifact, target)`. First hit renders; a miss is a line that opens the buffer in the frame; both hits offer the switch (`m87:224`).
- Law 7: `Bundle · App · Freight · Cargo · /attached/bundle · /attached/cargo` all die; `/attached/artifact/:id` serves with `x-viva-integrity` (`m87:227`).

**Deliverables for clients**
- `systems/ghost/surface/chrome/renderers.js` with `RENDERERS` + `shown(buffer, target)`; the dock `<For>` over `turn.buffers` (`m87:112-136`). Carries `-- @beef rewrite for readability — 10-19` (`m87:121`).
- Milestone 5 = the ghost: renderer table · `shown` · dock cells + lines · frame · `artifact.load` heir of `Bundle.load` · the repl path.
- Milestone 8 = anima, "after anima builds again" (`m87:169,172`).

**Owed and open**
- The `target` column's reader (`m87:296`).
- Asking UI for the owner of an artifact made on a client-hosted mode (`m87:284`).
- Which schema validates a two-slug buffer (`m87:285`).
- Inline buffer that opens another buffer (`m87:287`).

**Stale**
- Line 1 (an untitled preamble) floats "for anima that means at build / bundle time" (`m87:1`).
- `dojo.viva.js` declares both `.svelte` and `.jsx` faces (`m87:145-148`). Legitimate: svelte survives as a MODE artifact mime even after anima's chrome is Solid. m95 must decide whether anima's renderer table still accepts `dom.svelte` (it needs the svelte runtime inlined, `m87:236`).
- "anima mirrors with svelte renderers" (`m87:112`) is STALE against Solid anima.

**Touches m95:** the dock cell/line/frame render path and anima's renderer table ARE m95's frame. m87 milestones 1–4 (entity · file traits · ARTIFACTUAL · generative verbs) must land before m87.5/.8 and m95's frame can be real.

### m88-repling

**Status** (`m88-repling.org:3-4`)
- Stretch one (client modes · HOME · REPLING) LANDED via m86. Its tangle `:84-804` uses pre-m86 paths, so it is history.
- Stretch two (hosted twin) is not built; it needs `owner` on the remote Mode wire (`:823`).
- Stretch three, LOOPING: DESIGNED, nine rulings, repathed 10-19 onto `entities/`, dry 18/18, no go asked (`:838`).

**Rulings**
- A client is a HOST at `/client/<slug>` with its modes under it (`m88:51-52`).
- /"HOME.reference - absolute."/ (`:53`).
- /"home sets mode on new terminals. incl thread."/ (`:54`).
- /"terminal.repl is a function of terminal.mode/daemon,client.repl."/ (`:56`).
- Execution is a pipe (`:57`).
- LOOPING:
  - Q2 one client aperture, on its multiplex (`:848`).
  - Q1 the runtime pulls the repl strip per harness call; verbs become `repl_…` tools (`:849`).
  - Q5 a tool call is a Signal; Q6 the result is `output`.
  - Q4/Q9 the request gains `terminal`, `id` → `turn` (`:851-856`).
  - REJECTED: `client/aperture.js` /"aperture is a weird function there"/, REINED · POSSESSED · ARMED.

**Direct m95 item:** anima's door, where `vite.config.mjs` wires `clients[anima]` and emits `register` as a virtual module, was deferred to "anima's quest" (`m88:45,82,833`). A Solid anima needs it.

**Stale**
- Stretch three edits `systems/anima/src/app/panels/a/widgets/Dock.svelte:172` + `dock.mount.test.js:198` (`id`→`turn`) (`m88:1123-1135`). That edit must retarget the new dock.
- The ghost test pins chrome panes `["crown","navigation","dock"]` (`m88:721,813`).
- `dock`/`key` are still repl verbs (`:57`).

**QA:** `m88/T-home-hello` · `T-home-hides` · `T-looping-whoami` · `P-request-schema`, all pending (`m88:828-829,1200-1201`).

### m92-keymap

**Status:** `DESIGNED 10-19 — nine locks … B (focus-selected bare keys) is the roadmap, A (leader-gated) lands first. No go.` (`m92-keymap.org:3`).

**Rulings, verbatim (`m92:53-65`)**
- /"the REPL is the entire client, basically. Client is a surface against the REPL."/ (`:9`).
- /"we would want everything hidden behind control V"/ (`:9`).
- Q0 /"it's really a key press. We have a key map and the key press."/ (`:55`).
- Q0b /"the key map on the terminal is the one that we actually navigate, and the client key map is just mounted into that"/ (`:56`).
- Q1 an effect may be a plain string: /"lean is A with the possibility of B built in"/ (`:57`).
- Q2 /"in the REPL pattern, the key that you have, Control VC, that's the chord."/ (`:59`).
- Q3 /"I lean temporarily A with option B as the definitive roadmap."/ (`:60`).
- Q4 KEYMAPPED is its own trait, published via metadata (`:61`).
- Q5 minibuffer /"a"/ (`:62`).
- Q8 DOM leader /"the opposite of Command or Control, depending on what system we're on"/ (`:64`).
- Q7 palette = Spacemacs SPC SPC, narrowed by typing, schema-driven completion; choice-faculty completion "save for later" (`:65`).

**Law (`m92:71-82`)**
1. `keymap` Vector; `Press` = one segment; a sequence is a `walk`.
2. The composer is `steer.dispatch.walk(keymap, more)`.
3. The terminal's keymap is navigated; client + active mode keymaps are grafted over it per walk.
4. A keymap effect's ctx is `{client, dispatch}`.
5. An effect returns a repl signal (string · `{nature,body,flags}` · fn).
6. A repl pattern's `chord:` is harvested into the keymap.
7. The root holds `leader` + `esc`; bare keys stay with the focused widget; the gate is `keymap.trie.has`.
8. KEYMAPPED is on both catalogs.
9. `/metadata/keymap` = `shape.keymap.strip`; a served effect is a line, never a fn.
10. `client.$chord` paints the held node; esc drops; unbound → fault; no timer.
11. `ctrl-v ctrl-v` = the palette.
12. Semantic `leader`: tty ctrl-v, DOM mac ctrl-v / else meta-v.

**REJECTED:** `Chord` as the signal · keys under `/key/…` in the repl trie · `withSignature(Press)` · a vim timeout · `=== "ctrl-v"` root gate · a `trait` JSON column on Mode · `pour` as the ana name (`m92:67`).

**Milestones (`m92:295-301`)**
1. typology hunks (`fire` passes a literal · `walk` spends a consumed signal) — HOLY.
2. press + shard.
3. the chrome — HIS EYES.
4. the trait (`Mode.ts` migration).
5. the palette — HIS EYES.

**Owed**
- Where `press.js` lands (`m92:357`).

**Deferred (`m92:336-340`)**
- B: `client.$focus`, Tab moving out of `frame.jsx:18`; closes `frame-keys-leak-into-dock`.
- The DOM normalizer, which is anima's job.
- User rebinding: a mask `keymap` slot.
- Cortex completion.
- Chord in `/help` via `edgeMeta`.

**Touches m95:** m92 IS m95's keyboard. Milestones 3 and 5 are chrome panes (`dock.jsx` minibuffer + palette list, `m92:282`). The DOM leader is anima's normalizer. Every key the old chrome hard-wired (backtick console, `/key/*`, Enter, digits) moves into keymap effects or chords.

### Skimmed — client touchpoints only

**m93-kleisli-remonadization**
- Status: TANGLED 10-19, 31 files / 51 hunks, go per milestone (`m93:3`).
- Every subject is built by `factory(input)(parentDie) → Promise<die>`; the die's one contract is `controller`; the ghost client die IS `Client`; `execution` is killed (`m93:17,19,23,64`).
- Terminals keep a hand reconcile (`:22`). The ghost lighthouse is spliced inside the client's life (`:26`).
- QA `m93/T-host-faults-alone` · `T-kill-on-settled` (`m93:134,136`).
- It reshapes `client/lifecycle/index.js`, which the chrome mounts from.

**m94-trait-rejiggle**
- Status: RULED 10-19, no code (`m94:3`).
- Client: HOME live; DOCKED + THEMED owed: /"We might also want the docked and themed trait."/ (`m94:62`).
- Ghost paints hardcoded `tokens("northsea","2")`; `/chrome` is an unpersisted toggle (`:277`).
- Terminal DOCKED `{side, share, collapsed, full}`, user fallback, written only by anima (`:242-245`).
- User THEMED has no writer (`:254`).
- KEYMAPPED owed by m92 (`:203`).
- Thread AIMED/MASKED/QUEUEING may be deprecated; anima-only readers (`:53,344`).
- A hosted HOME seats each new terminal on a thread (`:275`).

**done/m90-signal**
- Rule: dispatch a LINE, never an object. The browser dock drag (`chassis.jsx:45-54`) and TUI keys dispatch lines (`done/m90…:220`).
- A miss falls to the nearest `*` (yap); `--help` is a root middleware flag (`:224-225`).
- QA T-repl-verb · T-repl-yap · T-dock-drag · T-chord pending (`:2116-2119`). T-dock-drag and T-chord name dead mechanisms (`/key/` commands, drapes `chassis.jsx`).

**done/m91-subject-object**
- /"chrome stays largely as is."/ · /"move chrome up one level as sibling of client"/: `systems/ghost/surface/` is NOT a subject and is the factory's one arg (`done/m91…:46,396`).
- A terminal is a ghost subject and a runtime entity (`:47,63`).
- Owed: does `@vivalence/ghost` carry the chrome stack (OpenTUI ×12, Solid ×6 via `lifecycle.shell`) (`:589,670`). This conflicts with m82's "anima imports ghost" (`done/m82…:32`).

**done/m82-runtime-clients**
- Still holds:
  - targets `dom · tty` (`:199-208,2867`);
  - mime `vnd.vivalence.<target>.<framework>+javascript` (`:192`);
  - Q11 /"we dont reuse apps across render targets"/ (`:2865`);
  - kit keyed by target `drapes/{dom,tty}` (`:1451`);
  - OpenTUI pinned 0.5.17 with a content-anchored patch in `install.sh` (`:449-472,2866`);
  - five screens boot · signin · chat · buffer · navigation (compendium `:17`);
  - Spacemacs mapping (`:1052-1064,1259-1267`).
- Milestones 3–6 (drapes dom/tty + `dapper.tokens(theme, zone)` · ghost chrome · anima on Solid, SvelteKit out · the swap) are what m95 inherits (compendium `:75-82`).
- Unanswered: Q16 how the client record reaches a browser (`PUBLIC_VIVA_CLIENT_HOME` vs `/metadata/clients`) · Q17 the `contexts.client` word list (compendium `:408-427`).

**discarded/m79-terminal-ghost**
- Discarded 10-07: /"completely nonesensical from a use perspective"/ … /"we use the same tools inline manual /mode/set <reference> that the harness uses."/ (`m79:4249`). This is the root of "everything via the REPL".
- Survivors:
  - cut · captured · chrome (F12 `:229`);
  - /"The clients dont compose the paths. runtime does."/ (`:181`);
  - F16 bare text = turn, `/` = command (`:239`);
  - F17 modes contribute keys/colours/hints layered ghost < domain < mode < operator (`:4660`), the ancestor of KEYMAPPED;
  - tty key limits measured under ink, to RE-MEASURE under OpenTUI: F12 never arrives, ctrl-m = Enter, fullscreen one row short (`:340-345`).

**benched/m85-tauri-clients:** a 0-byte file.

**roadmap/m84-harness-runtime**
- /"cut home home."/ (`m84:898`).
- Owed to the client: the dock on a thread with no mode (`:865`) · "take me home" command (`:867`) · a dead path into anima `panels/c/cards/threads.js` (`:899`).
- `terminal_find` reads `ctx.entities.terminal` (`:595-612`).

**roadmap/m89-telemetry**
- Anima + ghost share the controller and the trace store; a web inspector pane and a 40-col tty rail (`m89:566-580`).
- F9 command vs chord `/key/ctrl-g`: now a keymap question.
- Edits red drapes `dom/chassis.jsx`. `$story` must be checked against the 10-12 `$telemetry` kill.

**benched/m55-recursive-buffer-frames**
- /"the daemon knows nothing about terminals! no entity terminal on runtime! … terminal is client!!"/ (`m55:70`). CONFLICTS with the runtime Terminal entity (m80/m84/m86).
- Terminal verbs `up down status stop run watch`; `down` never deletes the thread (`:76,80`).
- 12 QA markers, mostly anima `Frame`/svelte (`m55:289-300`).

**benched/m54-buffer-file**
- /"client can only have system level functions. daemon is domain level."/ (`m54:31`). This is the root of the domain-blind client.

**discarded/m56-the-pincer-turns**
- /"terminal should absolutely dock and close. bullshit"/: no pane is privileged (`m56:58`).
- `index.md:189` says nothing landed, but its header says M1+M2 landed (drift).

**done/pincer.quest.org**
- What the pincer was: a draggable "viket" at the junction of a T skeleton (crown · spine · shoulder bones), a 4-way radial, snap grid, panels A–H, contexts LIGHTHOUSE · QUARTERS · BRIDGE · THREAD.
- It left a keyboard interface to viket open (`pincer:320-336`). m92 answers it.

**done/m73-anima-and-design-system-comps**
- /"important! we have done a lot of adjustments and custom work on the pincer. … dont drop that. f.e the settings for mobile, ios. and running it as manifest is working currently."/ (`m73:30`). The protected files are `geometry.js · gesture.js · bridge/dock.js · manifest.json` (`:8`).
- /"the shoulder says STATE only — never a count"/ (`:249`).
- STANDALONE opens its buffer on set (`:2998`).
- Dropped-feature checklist `:3021-3160`.
- 6 pending T-markers (`:3228-3233`).

## 2 · dependency graph (what lands before what)

```
m91 subject-first ── DONE 10-19 (paths every quest now cites)
 ├─ m94 trait rejiggle (RULED) ── Client DOCKED · THEMED · Terminal DOCKED · KEYMAPPED in the enum
 ├─ m93 kleisli factories (TANGLED) ── reshapes client/lifecycle the chrome mounts from
 │                                     → land BEFORE m95 chrome, or m95 re-cuts onto it
 ├─ m92 keymap (DESIGNED)
 │    M1 typology hunks (HOLY) → M2 press+shard → M3 chrome panes [m95] → M4 KEYMAPPED [needs m94 enum]
 │    → M5 palette [m95]; B (focus) + DOM normalizer → m95 anima half
 ├─ m87 artifacts (DESIGNED)
 │    M1 entity → M2 FILESET/FILESINK → M3 ARTIFACTUAL → M4 generative verbs
 │    → M5 ghost renderer table · dock cells · frame [m95 tty]
 │    → M6 rename → M7 patrol → M8 anima renderers [m95 dom, "after anima builds"]
 ├─ m88 repling — S1 landed via m86 · S2 hosted twin (needs Mode.owner on wire)
 │    · S3 LOOPING (needs m86 tree + one client aperture; edits the dock: id→turn)
 │    · anima's door (vite virtual `register`) → m95 anima
 ├─ m83 tools/primer (CUT) — independent of clients; FORMAT primer assumes the dock renders markdown
 └─ m86 (DONE) ── owed T-chrome-toggle · T-application · memo.jsx off sheets → absorbed by m95
m84 harness-runtime (D1–D6 unruled) ── dock on a mode-less thread · "take me home"
m89 telemetry (DESIGNED) ── re-cut onto m86 tree; inspector pane/rail → after m95 chrome exists
```

Order that falls out:
1. m92.M1.
2. m94's enum rows (KEYMAPPED · DOCKED · THEMED).
3. m93 (or a ruling that m95 goes first).
4. m87.M1–4.
5. m95 tty chrome (m92.M2–3,5 + m87.M5).
6. m95 anima on Solid (m88 door · m92 DOM normalizer · m87.M8).
7. m88.S3 LOOPING onto the new dock.
8. m89.

## 3 · conflicts and stale assumptions

| # | claim | where | vs |
|---|---|---|---|
| 1 | pincer kept: /"dont drop that"/ | `done/m73…:30,8` | m95 drops it; a REVERSAL to name. The manifest/iOS standalone bits (`client.html:12-18`, m73 `:170`) are separable |
| 2 | no runtime Terminal entity | `benched/m55:70` | runtime terminals in m80/m84 (`m84:595-612`)/m86.s4 (`runtime.entities.terminal`) |
| 3 | "chord" dead | `done/m86….s2:169` | m92 Q2 re-admits `chord` (`m92:59`); later wins |
| 4 | `slot`/`$slot` = minibuffer | compendium `:161`; `.s1:164` | dead in m86 main; m92 minibuffer = `client.$chord` (`m92:80`) |
| 5 | leader = `/` or SPC | compendium `:38,357-380` | m92 law 12: semantic `leader`, ctrl-v / non-paste modifier |
| 6 | keys as `/key/<k>` repl commands | `.s2:1724-1773`; m90 `:220`; m82 `:355` | m92 REJECTED (`m92:67`); T-no-key-lines `grep '/key/' systems/ghost` → 0 |
| 7 | `target` = dom·tty | `done/m82…:199-208` | m87 `target` = cell·frame·null (`m87:196`). TWO meanings |
| 8 | `palette` = colour palette (frame bag, `usePalette`) | `.s4:752`; `tty-render.md` | m92 palette = command list (`m92:82`). TWO meanings |
| 9 | Floor = JsonTree fallback ("Floor until sheets") | `m86.org:670-740`; `.s4:769,2805` | m87 law 4: a miss is a LINE that opens the frame; JsonTree is one renderer row for `json`+frame |
| 10 | Bundle · App · `buffer.bundle` · `/attached/bundle` · APPLICATION · `/application/start` | m86 main · m82 · briefings | m87 law 7 kills them; ARTIFACTUAL heir. m86's T-application names `/application/start` |
| 11 | `View` · `buffer.$view` · SvelteKit anima | `anima.md:5,141,316-340`; `design.md:12` | View left typology; anima red |
| 12 | `@vivalence/sheets` tty kit | `.s2:337-490`; `.s3:156,320,446,581`; `tty-render.md:261,277`; `memo.jsx:3` | sheets DEAD; kit lives in `systems/ghost/surface/chrome/` |
| 13 | ink facts | `tui.md` §1, §4 self-marked stale (`:840`); m79 key limits | OpenTUI; re-measure |
| 14 | `belt.dock` · `DEFAULT_DOCK` | `.s2:2725,3833`; `.s1:635` | drapes `chassis.jsx:3` red; ghost `belt` = harness only |
| 15 | drapes = "svelte + the dom kit anima owns" | `.s2:204`; `design.md:12` | `drapes/dom` is Solid `.jsx` |
| 16 | anima rebuilt in Solid (10-11) | `.s1:861` | live tree is SvelteKit; that build sits in `testament/m82-clients-20261012/` |
| 17 | anima imports ghost | `done/m82…:32` | ghost now drags OpenTUI+Solid+paladin (`done/m91…:589`; `.s2:4264`) |
| 18 | `brand` token = "the pincer's ring … glow … mark's filter" | `design.md:7,61` | needs a new referent |
| 19 | home mode | m88 `:54` "incl thread" vs m94 `:275` seats a thread; m84 `:898` /"cut home home."/ | the briefing §16.9 disagreement |
| 20 | `Dock.svelte:172` edit (id→turn) | `m88:1123-1135` | retarget onto the new dock |
| 21 | "anima mirrors with svelte renderers" | `m87:112` | Solid anima; svelte only as an accepted MODE mime, if at all |
| 22 | m79 still live | `index.md:7`; `frontier.md` | moved to `discarded/` |
| 23 | design.md root keys 94 vs 85 | `design.md:7` vs `:178` | internal drift |

Live known issues in the m95 radius (full list in the appendix `known-issues`):
- `frame-keys-leak-into-dock` :48 (closed by m92 B)
- `chess-kit-open-sets-terminal-buffer` :58
- `ghost-scenario-boots-nothing` :68
- `frame-bag-drift` :78 (three bags reach a face: pick one)
- `anima-child-behind-deno-task` :126
- `ghost-does-paladins-work` :146
- `drapes-dom-kit-imports-belt-from-ghost` :2868
- `anima-imports-view-from-typology` :2882
- `memo-tty-face-on-dead-sheets` :2940
- `qa-rig-red-after-the-m86-client-rebuild` :2954
- `four-ui-surfaces-ship-a-successor-beside-the-incumbent` :1535
- `conversation-error-close-never-faults` :1877
- `dock-never-shows-conversation-error` :1973
- `v-facade-pins-typebox-in-every-client-bundle` :212
- sheets-* :2602 · 2628 · 2737 · 2751 (OBSOLETE; input lessons inherit)

## 4 · design briefings — §16 open questions

Questions from `reference/client-design-briefing.md:3092-3106` (B). B2 has no numbered questions; its open items are at `client-design-briefing-ii.md:114,284,506,711`.

| § | question | state | by |
|---|---|---|---|
| 16.1 | one chrome or two / the pincer | OPEN (m95 decides: pincer dropped, Solid both) | — |
| 16.2 | bones & cards back? | PARTLY | m92 law 6 · 11 (verbs declare keys, palette lists all) |
| 16.3 | dock as chat + journal | OPEN | (m86 single-span dock is the de-facto answer) |
| 16.4 | views beyond the dock | PARTLY | m87 Q17b · law 4 (cell vs frame, client picks, switch) |
| 16.5 | status line / crown | OPEN | — |
| 16.6 | keys | PARTLY (mostly) | m92 laws 7 · 10 · 11 · 12; digits + bare keys = B, deferred |
| 16.7 | sign-in during AUTOLOGIN | OPEN | — |
| 16.8 | HOME on every new terminal | ANSWERED | m88:54 · m94:257,275 |
| 16.9 | terminal with no thread | PARTLY (where yes, what shows no; m88 vs m94 disagree) | m88:54-55,108 · m94:275 |
| 16.10 | telemetry | OPEN | m89 designed, not ruled |
| 16.11 | inline components | PARTLY | m87 cell renderers (`m87:112-136`) |
| 16.12 | REPLING mode returns a face | ANSWERED | m87:158,202-203 |
| 16.13 | multi-client mirroring | OPEN | (.s1 T-twin pending) |
| 16.14 | zones | OPEN | — |
| 16.15 | desktop | OPEN (m85 empty) | — |

§15 gaps still open on both faces: sign-in, boot cover, terminal and thread verbs, stopping an activity, theme (THEMED owed, `m94:277`), and the box (mic and speaker). Full row-by-row in the appendix `briefings`.

## 5 · pending `#+marker_qa` touching clients

| marker | file:line | note |
|---|---|---|
| m86/T-chrome-toggle | `done/m86….org:2815` | his eyes |
| m86/T-application | `done/m86….org:2820` | names dead `/application/start` (m87) |
| m86/T-home · T-twin · T-offline · T-sigil | `done/m86….s1.org:850-853` | |
| m86/T-chrome-boot · T-mode-memo · T-lobby (+ hello/turn/typo/application/quit restated) | `done/m86….s3.org:1785-1792` | s3 design, never landed |
| m86/T-hello…T-quit (s4 restatement) | `done/m86….s4.org:2798-2806` | T-application: "Floor until sheets" |
| keymap/T-leader · T-unbound · T-palette · T-no-key-lines | `m92-keymap.org:329-332` | |
| m88/T-home-hello · T-home-hides · T-looping-whoami · P-request-schema | `m88-repling.org:828-829,1200-1201` | |
| m83/T-primer-lazy · T-primer-edit | `m83-tools-and-primer.org:988-989` | seen in the dock |
| m93/T-host-faults-alone · T-kill-on-settled | `m93-kleisli-remonadization.org:134,136` | ghost host / kill |
| m90/T-help · T-miss · T-nested-miss · T-body · T-repl-verb · T-repl-yap · T-dock-drag · T-chord | `done/m90….org:2112-2119` | T-dock-drag, T-chord on dead mechanisms |
| m84/T-home-answers · T-go-to-mode · T-handoff | `roadmap/m84-harness-runtime.org:858-860` | T-go-to-mode "needs the Dock" |
| m73/T-four-themes-walk · T-ios-standalone · T-radial-live · T-throw-live · T-entry-live · T-spine-live | `done/m73…org:3228-3233` | radial/throw/spine die with the pincer |
| m55/T-vdex-unchanged … P-frame-consumers | `benched/m55…org:291-300` | svelte `Frame` era |
| m79/T-* | `discarded/m79…org:4650-4654` | discarded |
| runtime-independence/T-ghost-on-node | `roadmap/runtime-independence.org:535` | `viva /help` on node |

Held (proven): `m91/T-ghost-help` (`done/m91…:598`).

## 6 · design nouns m95 touches — current locked meaning

| noun | locked meaning (latest word) | where |
|---|---|---|
| client | the die IS the Client; shared by anima and ghost; a HOST at `/client/<slug>`; `dispatch(line)`; die contract = `controller` | `.s2:22`; `.s4` s4-2; `m88:51`; `m93:19` |
| surface | what differs between clients; ghost `surface/` sibling of `client/`, not a subject, factory's one arg | `.s1:25`; `.s2:3735`; `done/m91:46,396` |
| repl | composed per line from client · hosted · terminal · scoped modes · `*` if HARNESSED; not reactive; "the REPL is the entire client" | `m86.org:30-43`; `.s4:2835`; `m92:9` |
| ReplSignal | bare line → `*` turn; `/x` → verb; typology prototype; dispatch a LINE, never an object | `m86.org:31`; `done/m90:220` |
| shell | argv Vector; escalates to repl / chrome | `.s2:151` |
| chrome | "ui rendering of repl"; tty: dock ⊕ frame (crown · navigation · cover deferred) | `.s2:22` G; `m86.org:609-632` |
| cut · captured · chrome | three ways on a tty; anima always chrome | `.s1:519-529`; `m79:229` |
| dock | ONE per client; `<<` composer + transcript tailing ONE span; renders markdown + turn's buffers as cells/lines | F15 `.s2:39`; `m86.org:41`; `m87:130-136` |
| frame | surface's; shows `terminal.$buffer`; opened by verb, not by thread set | s4-10; `m86.org:66` |
| crown | mode line; trail slug · user · #terminal › mode · status (s2 pane, deferred in main) | `.s2:853-891`; compendium `:163` |
| navigation / spine | terminals → modes → threads rail (s2 pane; out of main) | `.s2:1088-1199` |
| terminal | client-side subject = function of thread (+ runtime entity row); `repl` · `keymap` · `$thread` · `$buffer` · `setThread`; verbs up/down | `done/m91:47,63`; `.s4:2065-2140`; `m55:76` |
| `$active` | client's cursor on a terminal (selected-window) | `.s4` a4; `.s3:131` |
| thread | daemon's; terminal mirrors it; no PHASES/`$live` | `m55:70`; s4-24 |
| mode | hosted citizen vs host row; carries `repl` · `keymap`; REPLING grafts at root (hosted) or scoped (remote) | `.s4:41`; `m92:197` |
| HOME | client trait; user over client; seats new terminals (incl thread?) | `m88:53-54`; `m94:257,275` |
| keymap | Vector beside repl on client · terminal · mode; walked one Press at a time | `m92:71-73` |
| Press | one key, one segment, `Signature` subclass | `m92:71,172` |
| chord | the key declared on a repl pattern (`chord: "leader/c"`) | `m92:59,76` |
| leader | SEMANTIC root segment; tty ctrl-v; DOM non-paste modifier | `m92:81` |
| minibuffer | `client.$chord` painted under the dock input; no timer | `m92:80` |
| palette | `ctrl-v ctrl-v`, the composed repl's strip narrowed by the draft (≠ colour `palette` in the view bag) | `m92:82`; `.s4:752` |
| KEYMAPPED | mode trait, both catalogs, export `keymap`, `/metadata/keymap` | `m92:78-79` |
| artifact | bytes + mime, mode-owned, one row per (mode, slug, mime) | `m87:221` |
| buffer | state space between an artifact and its consumer; on thread; m:n turns; `target` | `m87:222,199` |
| target | (m87) cell · frame · null constraint; (m82) dom · tty render target: two meanings | `m87:225`; `done/m82:199` |
| renderer table | `[[predicate, Renderer]]` per client over (artifact, target); accept derived | `m87:224` |
| mime | `application/vnd.vivalence.<target>.<framework>+javascript` = code; else content | `done/m82:192`; `m87:223` |
| application bundle | APPLICATION / `Bundle` / `/application/start`, DEAD under m87 → ARTIFACTUAL `artifacts` export | `m87:193,227` |
| view door | `default(el, {terminal, mode, thread, buffer, renderer, palette, dispatch})` (m86); `default(target, {buffer, …})` (m87): drift to settle | `.s4:752`; `m87:223` |
| message / fault / turn / stream | the four record kinds the dock tails | `m86.org:41` |
| DOCKED · THEMED | owed client/terminal traits | `m94:62,242-245,277` |
| zone · token · theme | dapper: 4 zones, 5 groups; `tokens(theme, zone)` | `design.md` §C |
| pincer | DROPPED by m95 (was: viket + radial + bones) | `done/pincer`; `m73:30` |
| dead words | Ring · Loop(class) · session · slot · `$live` · `$echo` · seat · host() · bearer · sheets · View · Floor(?) · `/key/` | `.s2:59`; s4-24/26; `m92:67` |

---
## APPENDIX — per-file notes (subagent reads, `file:LINE` throughout)


### appendix: m86-main-s1

# m86 notes — main (.org) + stretch one (.s1.org)

Refs: `M:` = `quests/done/m86-repl-loop-clients.org`, `S1:` = `quests/done/m86-repl-loop-clients.s1.org` (paths relative to `.ikiro/`). Both files were read in full.

## 0. What each file is

- **Main (`M`)** is stretch FIVE, with a sixth pass on top: "the client noun-major — one unit per noun, the dossier as mikro's schema" (M:1). It is the ONLY live law. It says "The s1–s4 files are HISTORY: nothing below cites them for a decision" (M:24). Stretch table at M:16-22:
  | stretch | file | state |
  |---|---|---|
  | one | .s1.org | die · loop · surfaces · dock — LANDED 10-11 |
  | two | .s2.org | ghost re-abstracted, one client two vectors, memo fixture — LANDED 10-12 |
  | three | .s3.org | 10-15 interview, the ring, tangle over bak.3 — DESIGNED, not landed |
  | four | .s4.org | ring layer-major, rulings s4-1…s4-30 — DESIGNED, HISTORY |
  | five | main | same ring, noun-major |
- **S1** is the first stretch (10-10…10-12). Title: "the client is a die with two Vectors: a BOOT vector … a LOOP vector … drained as the boot vector's root effect; one client typology at the paladin-free root of @vivalence/ghost; anima and ghost differ in die.surface only" (S1:1). It holds the founding rulings (the REPL paradigm, surface, dock only, cut/captured/chrome, ink dies, Solid on both surfaces, anima from scratch). Its queue/Loop/contexts.client mechanics were later REPLACED by main's per-line `compose`.

## (a) Status lines

- M:3 — `DONE 10-16 (moved by beef, /"update. move"/; T-chrome-toggle · T-application still owed his eyes) — LANDED 10-16 on his /"go m86"/ — B1 · B2 · C0 · A1 · A2 · A3 · A4 green (client.test.js 4/4 on the DEMO world …); the chrome by EYE is his (T-application · T-chrome-toggle); chess 500 → known-issues.` The landed tree is noun-major under `systems/ghost/typology/<noun>/`.
- S1:3 — `RULED 10-11 — /"the approach is exactly it."/ · /"we now build only dock i think. where only one buffer is max open at a time. spit view. as on anima today."/ · /"the term host doesnt exist in the codebase …"/ · /"surface. not target."/ · Q1 amen · Q2 … · Q3 yes. … Nothing tangled yet.` The header is stale: the changelog (S1:857-866) and handoff (S1:870-877) record milestones 1–4 LANDED on 10-11 and the 10-12 cleanup.

## (b) Client-relevant rulings (beef verbatim)

### S1 intent and decisions (S1:15-48)
- S1:17 /"I'm thinking of the clients a little bit like a REPL … not as a chat interface, but as a REPL that has chat built in. So like Emacs is a client built into the Lisp REPL."/
- S1:18 /"I really like the REPL paradigm. Fuck yes."/; client = die, loop vector a property on it, "exactly the same structure as we have in the runtime".
- S1:19 /"custom signal. replsignal."/
- S1:20 /"We don't ever, ever, ever want Paladin inside of typology. Never, ever, ever."/
- S1:23 (intent G) the client must survive lighthouse connection faults, /"as independent as possible while being extremely reactive"/. The same thread in two clients must mirror (T-twin).
- S1:24 (H) /"its tiling, notebook, canvas, dock we now build only dock i think. where only one buffer is max open at a time. spit view. as on anima today."/ · /"the views are underdeveloped rn. we stick to just dock."/
- S1:25 (I) /"surface. not target."/ — **surface** is the noun for what differs between clients.
- S1:26 (J) /"not a cheap prototype … use vivalence as themes … the logo, the fonts … I also need to log in … the first thing that I see is the text input … I can see the daemons that are booted and navigate"/
- S1:27 (K) /"the ring architecture is not something that i want in code actually that is a narrative layer for us"/
- S1:28 (L) /"the term host doesnt exist in teh codebase … not as an amalgam of runtime and daemon.!"/ · S1:9 host survives only as "the system referencing its host machine target render engine" (`sheets/host/`).
- S1:29 /"what is sessoin?! … be coherent in variable naming"/ → no `session`.
- S1:53 /"We might do away with a pincer, I'm not yet sure."/ · S1:58 /"we did ourselves a disservice by building the client anima on Svelte"/ · S1:64 /"maybe now is the right time to rewrite Anima in solid … maybe we still have the pincer in anima and no pincer … on the TTY side"/
- S1:142 Dapper = theming/design system. Then: "sheets is for the [TUI]. And the drapes is for Anima … the render target for the modes" — Svelte stays as the mode render target.
- S1:161 modes attach their own events: /"the Emacs equivalent of … Control G? Or double space in Spacemax?"/
- S1:187 /"I don't like ring … effects is a taken name … conceptualize … ring here as a vector itself"/; db is a die property; entities already exist.
- S1:208 /"we do already have some prototypes in typology for queuing … the signal here needs to be very well designed … just text → mode … commands … buttons … might also invoke the loop … I like reactivity still. That's why we have nano stores."/
- Decisions table S1:33-48 (locked):
  1. m82's demo milestones are absorbed (amen).
  2. `stagger` → typology `belt/traits.js` (yes).
  3. no `host` on the client: Runtime · Daemon.
  4. the bag that differs is `die.surface`.
  5. one `contexts.client`, no session.
  6. **dock only: `terminal.$buffer` · `terminal.$dock` are the pane words; no `view` word.**
  7. **attachment levels `cut · captured · chrome`** — /"cut captured and chrome. thast teh new meta and teh expected meta after 86. anima of course is always chrome."/ (S1:41).
  8. **no `surface.signin`**: signin is a pane that dispatches `/lighthouse/enter` — /"this intermediary makes little sense?! we have the loop. why the double abstracotin."/ (S1:42).
  9. contexts.client lands (q2 sure).
  10. lifecycles = our entities only, no surface lifecycle — /"q4 no just our entites no sufrace. thread, terminal yes."/
  11. **anima from scratch; the surfaces LIVE IN DRAPES** — /"old to systems/anima/bak/src/. anima from scratch. import {...typology} from @vivalence/ghost and {...dom surface} from @drapes"/ (S1:45).
  12. **ink dies, one holistic move** — /"no. erbuild. ink dies. one move. one coherent move. dont split by milestones here … holistic rebuild."/ (S1:46).
  13. **/"defer react. keep solid and svelte."/** — Solid is the client, Svelte stays the mode render target (S1:47).
  14. the probe is milestone 0.
- S1:865 /"whta teh fuck is --say supposed to be. makes no fucking sense"/ → `--say` dead; stdin is the door. /"viva help renders like shit"/.
- S1:874 (10-12) /"generally i want the client file removed and mod is run.js"/ · /"there are 4 lifecycles. construct populate resolve and integrate."/

### Main rulings
- Intent M:8-12: /"i dont like the way the ghost is structured. we have the same types in prototpes/lifecycles/traits... what would that look like when we invert them … some are entities some are processes?? … can we do without dossier? should we maybe lean into dossier??"/ · /"rewrite the quest for this tangle. subheaders per *** [system] **** [dir]."/
- s4-31…s4-42 table M:155-168:
  - s4-31: noun dirs.
  - s4-32: PERSISTED vs RESIDENT replaces "entity vs process" — `ProcessEntity extends VirtualEntity`.
  - s4-33: LEAN IN to the dossier as mikro's shape (class · repository · hydration).
  - s4-36: one class per noun (one ghost `Mode` for hosted and remote).
  - s4-37: paladin at the door (`run.js`).
  - s4-39: /"still i watn a subfolder traits/ for the traits."/ → `<noun>/traits/index.js` IS the catalog; no `traits` key on a die.
  - s4-40: /"is this a trait?? i dont understand. this is weird."/ · /"that whole function is fucked"/ → a trait reads its own config straight; another entity's trait goes through `v.<entity>.trait`. HOME is a staggered CLIENT trait.
  - s4-41: /"terminal commands turn"/.
  - s4-42: a host carries `aperture`.
- Carried rulings from s4 (M:130-151):
  - s4-2: the die IS the Client.
  - s4-5: hosted repls at the root, remote repls SCOPED, one streamer on `*`.
  - s4-6: no `host` word; the die key is the host's type.
  - s4-7: gating by `$status`, never a promise.
  - s4-10: `open(terminal, mode)` beside the APPLICATION trait.
  - s4-17: Client.dispatch → Terminal.dispatch → shard.repl.dispatch.
  - s4-18/30: the ledger decides the boot.
  - s4-20: one mode store.
  - s4-26: `setThread`, no `seat`.
  - s4-28: `stdout`/`repl` on the Mode prototype (/"good standard"/, M:2826).
- M:498 his a3: /"on client only the client[ghost]"/ (the mask).
- M:510 /"chrome not at all. weird artifacts all over"/ → `/chrome/on|off` read `ctx.client`, fixed.
- M:591 /"fix 1"/: the user turn is not re-printed by the plain repl.
- M:1422 /"just write the subscriptions out"/.
- M:1568 /"we multiplex on runtime"/.
- M:2044 hosted proxy for HARNESSED on a hosted mode = r12, /"later"/.
- M:2834 /"buffer sitn rendering my game yet innit. why not?"/ → /"b both. a go"/:
  - `/application/start` throws on a non-APPLICATION mode;
  - the frame owns tab-focus and passes `focused` in the bag;
  - tty faces landed for chess `board/play/buffer/play.jsx` and dojo `dojo.jsx`.

## (c) Landed vs designed vs owed

**Landed in S1 (10-11/12), per its changelog S1:857-874:**
- typology: `steer.trie.at` · argv on `Signal` · `contexts.client` (12 words) + `contexts.Loop` · `traits.stagger` · `atom.until` (S1:859).
- ghost root: `boot(mask,surface)`, seven lifecycles, `gestalten/{repl,surface,command}.js`, the anima typology ported into ghost (S1:859).
- `subsystems/drapes/tty/` (opentui 0.5.17 + Solid, `sheets/host/` Deno FFI host + core patch, `dapper.tokens(theme, zone)`) and `subsystems/drapes/dom/` (Solid, linkedom) (S1:859).
- **ANIMA FROM SCRATCH in Solid** (S1:861): old src → bak; new `src/client.js` booting `boot(mask(__VIVA_CLIENT__), dom(document.body, …))`; vite + vite-plugin-solid; prod build 355 kB; 0 paladin in the page. Bearer status codes ruled UPPERCASE: `MOUNTING · HEALTHY · UNAVAILABLE · ERROR · RELEASED`.
- **INK DEAD** (S1:862):
  - screens are DATA: `ctx.view.emit/hold(kind, props)`, kinds `report · listing · confirm · form · picker · pending`, rendered by `drapes/tty/*.jsx`;
  - `--buffer` dead;
  - sheets `{mod.jsx,components,theme.js,cliffy.js}` → `sheets/bak/`; sheets exports only `./host` · `./state`.
- Census 424+84 green, strata red (S1:862-863).
- T-offline test and the `dropped` subscribe hook (S1:863, 866).
- 10-12 cleanup (S1:874): mod.js→run.js; `construct(mask,surface)`; traits by subject dirs.

**Landed in main (10-16), M:3, M:2834:**
- B1 paladin (clients dressed, client modes grounded `/client/<slug>/mode/<type>/<slug>`, REPLING in integrity).
- B2 console fixture `@commons/home/console`.
- C0 the per-line repl.
- A1 attach/lighthouse/runtime.
- A2 terminal + HOME.
- A3 chat stream.
- A4 frame on `/application/start`.
- `instance.js`: client traits ride `manifest.traits` (M:432).
- Live walk on his ledger (M:2816-2822).

**Owed (M:2835-2837, M:2813-2822):**
- **T-chrome-toggle — pending, his eyes** (M:2815). It comes after the `chrome.js` fix; headless `testRender` 90×14 paints dock · frame · Floor · `/chrome/on` · `/chrome/off`; `/quit` must give one line per record.
- **T-application — pending, his eyes** (M:2820). On the DEMO world, `/application/start` → «application /daemon/memo/mode/srs/memo · buffer #…», the bundle lists `tty.solid`, `/application/stop` → «frame closed». Live, the frame shows the buffer, which is the Floor until sheets returns.
- **memo.jsx on sheets:**
  - `commons/fixtures/memo/mode/buffer/memo.jsx:3` imports `@vivalence/sheets`, which is "mapped NOWHERE" — a BLOCKER, so the client.test asserts the bundle mime, not the mounted view (M:822).
  - The same file "follows neither door and is red on @vivalence/sheets anyway" (M:740).
  - Owed: "`memo.jsx` tty face dead (known-issues `memo-tty-face-on-dead-sheets`)" (M:2837).
  - Deferred: "`@vivalence/sheets` back on the tree" (M:2829).
- Also owed (M:2837):
  - the word `hydration` (his amen; landed as written);
  - dojo tty lacks AUDIO, CONJUGATE (forms surface) and continuous refill;
  - the ghost `test` task stays `--watch`;
  - a late-arriving mode is not staggered;
  - the activity `/stdout` pump.
- next (M:2835): restart runtime 17220 → `viva` · `/mode board/play` · `/application/start` · `/chrome/on` · ⇥ toggles frame/dock keys; the chess 500; the runtime's own inversion.
- S1 owed (S1:877):
  - Q5;
  - the deferred list;
  - the `clients` bookmark;
  - four marker_qa testimonies — T-home, T-twin, T-offline, T-sigil, all pending (S1:850-853);
  - the strata red;
  - `traits/terminal/standalone.js` has no caller;
  - the runtime `construction.js` question.

## (d) Open forks / unanswered

- `hydration` — his amen or his word. STRUCK alternatives: `integrate` · `use` · `boot` (M:160, M:2828).
- s4-38 codestyle amendment ("a noun is a directory") lands on his amen (M:168, M:2737-2740). *Note:* the current codestyle has the m91 version instead (`<subject>/prototype.js · factory.js · lifecycle/index.js · traits/ · commands/ · apertures/`), so main's `<noun>/<noun>.js + execution.js` layout was superseded by m91.
- S1:832 Q5: one go per milestone, assumed.
- S1:875 QUESTIONED: /"run the runtime and clients without an instance?"/ — a `--remote` door on `viva client` and anima, on his go.
- S1:877: a runtime `lifecycle/runtime/construction.js`, on his go; whether to cut or wire `traits/terminal/standalone.js`.
- M:2809 coverage gaps:
  - no tests for the chrome panes (dock · chrome · frame are checked by eye);
  - no retry or test for a host's WIRE fault;
  - the frame's mounted view is unprovable until sheets resolves;
  - no Mode unit case for either construction.

## (e) Stale assumptions vs the settled direction (m95)

- **Anima:** S1 records anima rebuilt in Solid + vite, SvelteKit to bak (S1:45, S1:661, S1:861). The 10-19 tree says anima is SvelteKit and does NOT build, and M:2829 defers "anima at the m82 snapshot" and "anima on `@vivalence/ghost`". So the S1 rebuild was rolled back or never kept. VERIFY on disk before relying on S1:861.
- **Surfaces in drapes** (decision 11, S1:45, S1:532-558, S1:643-651): the `dom/surface.js` and `tty/surface.js` bags with `mount: {signin, crown, dock, frame, navigation}`. Main instead keeps ghost's chrome in `systems/ghost/app/surface/chrome/panes/*.jsx` (M:607-749). drapes `./dom` is red today at `chassis.jsx:3 belt.dock`. *Inference:* S1 moved anima's `stores/bridge/dock.js` into ghost `gestalten/belt/dock.js` (S1:635); the noun-major ghost has no `belt/dock`, which would explain the red.
- **Pincer:** S1:839 defers "the pincer on dom (m82 strand S …) — `/dock/*` rides keys and a strip". m95 drops it outright.
- **View:** "`Bundle` one prototype, `View` dead" (S1:593). Consistent with "View left typology"; S1:6 /"i still want my view modes. bsp, notebook, repl/chat, frame/fullscreen"/ is deferred (S1:836).
- **sheets:** S1 keeps `sheets/host/` (Deno FFI host of opentui) and `sheets/state/`. The rest went to bak (S1:653, S1:862), and S1:591 plans to fold sheets into `drapes/tty`. The tree now says sheets is DEAD. Main's `memo.jsx` is red on it (M:740, M:822). Check where the opentui Deno host lives now: main mentions "ghost exports `./host`" for the tty faces (M:2834).
- **ink:** dead (S1:46, S1:862). `import_map` lost react and ink (S1:866).
- **Svelte:** S1 keeps Svelte as the mode render target (decision 13; accept list includes `mime.dom.svelte`, S1:555). Main's frame is measured against `subsystems/drapes/panels/Frame.svelte:64-70` (M:670, M:740), and the chess/dojo tty faces sit "beside the svelte entry" (M:2834).
- **Floor:** in main, the Floor is a Solid component in `frame.jsx`, a `JsonTree` over `buffer.$data` (M:709-712), used when no bundle entry negotiates. In S1 it is the "`mime.json` floor" (S1:579, S1:595).
- **S1 mechanics replaced by main:**
  - the queue drain is gone: `process.repl` (`die.queue.drain`) → per-line `shard.repl.dispatch`, no queue;
  - `contexts.Loop` → `contexts.Repl` (M:419);
  - `$seat` → `setThread` (s4-26);
  - `$slot` · `$echo` · `$live` · `$chord` · `$standing` are gone (`$live` named in M:2836 "never");
  - `surface.mount{…}` + `arrange()` → a `surface(clientDie)` function returning unmount (M:1242-1249);
  - `boot`/`mod.js` never (S1:876).
- **Crown, navigation, signin cover, keys, pickers, anima, thread PHASES are OUT** of main (M:66), deferred at M:2829.
- **`terminal.$dock` (`{side, share, collapsed, full}`):** S1:479. Main's Chrome uses a fixed dock width of 48 when a buffer is open (M:627) and has no `$dock`.

## (f) Dependencies

- **m82** (`done/m82-runtime-clients.org`): the ground (S1:259-268) — three attempts, REPL table, ReplSignal rows, leader, the demo's five screens, bundle/mime/Bundle, opentui under Deno, Solid on both hosts. Its demo milestones 3–6 were absorbed into S1 (S1:35). `reference/m82-clients-compendium.md` (S1:268).
- **m79:** the sigil F16 (S1:147, S1:848); the argv row m79 M1 (S1:603, S1:724); the credentials file F2 (S1:792).
- **m81:** runtime `host` word, 42 sites (S1:37).
- **m88:** the paladin half — populate · resolve · integrity REPLING · home.js · modes.test (M:175-180, M:331).
- **r12:** the hosted proxy for a remote trait / HARNESSED hosted mode (M:2044).
- **m91:** implied supersessor of the noun layout (codestyle).
- s2 / s3 / s4 sibling files (M:16-22).
- known-issues: `memo-tty-face-on-dead-sheets` (M:2837); chess 500 (M:3, M:2818); strata red (S1:877).

## (g) Design nouns, locked meanings

- **client** — the die IS the Client (s4-2, M:58, M:1141-1180):
  - `new Client({ controller, mask, register, instance, surface })`;
  - fields `modes · repl · runtime · $active`;
  - `dispatch(line)` is a method;
  - a child die names it `{ client, controller, <noun> }`;
  - a client is also a HOST: `/client/<slug>`, with its own hosted modes (M:384-395, M:441-443).
- **surface** — /"surface. not target."/ (S1:25, S1:38). In S1, the bag that differs between clients (S1:231-237, S1:532-558). In main, `clientDie.surface(clientDie)` mounts and returns unmount (M:1242). `/chrome/on|off` "names SURFACES (doors)" → lives in `app/client/chrome.js`, grafted by the factory (M:53, M:502).
- **repl** — composed PER LINE (M:30-43, M:1736-1755): `compose(client, terminal)` = graft of
  1. `client.repl`,
  2. the hosted modes' repls at the ROOT,
  3. `terminal.repl`,
  4. every mounted mode's repl SCOPED under `/mode/<type>/<slug>` and `/mode/<slug>`,
  5. `turn` (`*`) only when `terminal.mode` is HARNESSED — grafted or ABSENT.

  Further rules:
  - `replDie = { signal, client, runtime, terminal, controller, repl, output }` = `contexts.Repl` (M:40);
  - output → `controller.stdout.message`; a throw → fault on the line's branch; no verb → NotFound (M:61);
  - `ctx.repl` = the composition, so `/help` lists it (s4-29, M:1489);
  - the `scoped` cycle bug: a chained `.branch().branch()` recursed into itself (M:1758);
  - a root `*` grafted twice REPLACES the first, so HARNESSED opens a NAMED `/harness` verb instead (M:2205).
- **ReplSignal** — bare text → `{ nature: "*", body: [{type:"text", text}] }`; `"/x y"` → a verb (M:31). In S1, five coercion rows: line · argv · event `{signal,input}` · key `{key}` → `/key/<chord>` (S1:386).
- **dock** — `client.controller.stdout.tail("message","fault","turn","stream")`; every terminal/thread span sits under the client's, in journal order (M:41, M:646-668). The streaming turn renders below the rows. In S1: "One buffer open at most, split beside the dock: terminal.$buffer · terminal.$dock, as anima today" (S1:279, S1:477-490). `/dock/side|full|collapse` and `/buffer/open|close` are loop commands (S1:483-489).
- **frame** — opens on `/application/start`, never on a thread set; the Stall is NOT wired (M:66). It renders `client.$active.$buffer`.
  - `Chrome` = dock ⊕ frame in one row; the dock narrows to 48 when a buffer is open (M:609-632).
  - `frame.jsx` (M:670-740):
    - `offered` = the buffer's `$bundle.withUrl(app.url)` or `mode.application.bundle`;
    - `negotiate(accept)`, falling back to the Floor;
    - `Mounted` calls `buffer.mount()` → `bundle.load(accept)` → `module.default(element, { terminal, mode, thread, buffer, renderer, palette, dispatch })`; teardown calls `handle.destroy()` and `buffer.unmount()`.
  - The door is measured against drapes `Frame.svelte:64-70`.
  - Later: the frame owns tab-focus and passes `focused`; `Input.jsx` yields on a `defaultPrevented` key (M:2834).
- **crown** — OUT (M:66), deferred (M:2829).
  - S1: the crown row `✦ <instance> · <user> · <bearer> › <mode> · ● streaming` (S1:578).
  - "the mode line = the crown" (S1:164).
  - OFFLINE → the crown (S1:471).
  - The Activity `/stdout` pump "is the crown's" (M:999).
- **spine / navigation** — S1:578-580: on tty, 24 cols left of `│`, terminals → modes → threads; `ctrl-t` terminal · `ctrl-o` mode. OUT in main.
- **minibuffer** = `$slot` (S1:164); "what the last command painted" (S1:403). Dead in main.
- **keymap / leader / chord:**
  - Emacs mapping (S1:164): `define-key` = a mode's doors under `/command/<slug>`, keys under `/key/<slug>`; `C-g` = `/abort`; `M-x` = the trie census in the slot.
  - `steer.trie.at(vector, path)` = a literal walk — "a chord IS literal segments" (S1:245-250).
  - `$chord` = the held leader path (S1:404).
  - A surface's keys are a Pipe `.to(die.queue)` (S1:237, S1:540).
  - Main defers "keys as signals" (M:2829).
- **cut · captured · chrome** — attachment levels (S1:41, S1:280, S1:519-529):
  - cut = one frame into scrollback (`viva instance/doctor`);
  - captured = inline, live until release;
  - chrome = alt-screen `?1049h`, held (`viva` bare);
  - "the level is the SURFACE's, never a flag"; anima is always chrome.
- **application / APPLICATION:**
  - The trait fetches `/metadata/application` → `mode.application = { url, schema, bundle: new Bundle(record.bundle).withUrl(url) }` (M:2130-2133).
  - `open(terminal, mode)` reuses the newest buffer of that mode on the thread or creates one, then sets `terminal.$buffer` (M:2135-2148). It is called only by `/application/start` (s4-10).
  - "a buffer row IS the screen; without APPLICATION the frame paints the Floor" (M:2148).
  - `/application/start` throws on a non-APPLICATION mode (M:2834).
- **mime / renderer table** (S1:592-596; M:602, M:2834):
  - media types `application/vnd.vivalence.<target>.<framework>+javascript`, plus a `text/markdown` · `text/plain` · `application/json` floor; all six rows are in `schematics/scalars/mime.js`;
  - tty accept `[tty.solid, markdown, plain, json]` (S1:539); dom accept `[dom.solid, dom.svelte, dom.html, markdown, plain, json]` (S1:555);
  - ghost main paints with `accept: [mime.tty.solid, mime.json]` (M:602);
  - bundler stages: 1b thin svelte · 2 tty.solid · 3 tty.react · 4 dom.solid/dom.react · 5 markdown (S1:594); React deferred (S1:837);
  - "a mode's face = `App([{ mime, mount }])`, one source per render target" (S1:596);
  - `Bundle` methods `merge · entry · negotiate · load(accept)`.
- **terminal** — a row AND a process (M:2451-2526):
  - `repl` (grafted `/modes · /mode · /application/*`), `dispatch(line)`, `setThread`, `$thread`, `$buffer`;
  - `controller = client.controller.branch("terminal/<id>")`;
  - `active` = the first terminal ("anima remembers", deferred);
  - Stall · Blacklist · `stall()` dead.
- **thread** — `controller · $activity · $buffers · $turns`; PHASES, `$live`, `$errors` and the trait machinery cut (s4-24/25, M:2688-2726).
- **mode** — ONE ghost Mode class: a hosted citizen `new Mode(citizen)` or a remote row (s4-36, M:2057-2120). `stdout = new Span("mode")` and `repl = new Vector()` live on the prototype. Traits:
  - REPLING grafts `mode.module.repling`;
  - EXPOSED;
  - HARNESSED opens `/harness`;
  - APPLICATION.
- **HOME** — the CLIENT trait (M:1424-1458). A terminal with no thread is seated on the user's HOME over the mask's; the owner host waits for HEALTHY, then `thread.create` → `setThread`. HOME names a HOST mode this stretch (M:64).
- **host** — a client-side word only as a `shard/host.js` module name. The die key is the TYPE (`runtime`/`daemon`) (s4-6, M:1629-1699). Readiness = `$status` HEALTHY, set by `mounted` alone.
- **dataspace** — its own channel: entities arrive by subscription; the frame and dock render STATE; nothing of it passes the repl (M:42). `Dataspace({ runtime, entities: {name: module}, seed })` with `hydration` per merge (M:2272-2315).
- **persisted vs resident** — resident = row + controller + execution (M:47).
- **rings** (data · concrete · event) — narrative, never code (S1:27, S1:281).
- **turn (`*`)** — `terminal/commands/turn.js`; an empty body → NotFound (M:2539-2554). `belt/harness.stream` marks `stream` records on the thread span, closing with `open: null` (M:1602-1618).

## (h) Not a design briefing

Neither file is a briefing with § questions. S1's questions: Q1 amen, Q2 (no session), Q3 yes, q2 sure, q4 (entities only), all answered (S1:3, S1:43-44). Q5 is assumed, not answered (S1:832).

## Deferred lists (verbatim-ish)

- **M:2824-2829:**
  - typology Mode `stdout/repl` (s4-28);
  - the runtime's own inversion;
  - `hydration`;
  - carried from s3/s4:
    - remote REPLING
    - threadless client-mode terminals
    - **keys as signals**
    - **pickers**
    - `viva repl` over pipes
    - **crown**
    - **navigation**
    - **anima on `@vivalence/ghost`**
    - a Listing for `/help`
    - thread PHASES
    - the Stall
    - the buffer vigil
    - a late-arriving mode staggered
    - the activity `/stdout` pump
    - a `status` verb in the dock's tail
    - client-side AUTOLOGIN config
    - a remembered active terminal
    - a thread's mode change persisted
    - `mode.application.buffer(desc)`
    - **the signin cover**
    - a host's WIRE-fault retry
    - the hosted proxy for a remote trait on a client mode
    - **`@vivalence/sheets` back on the tree**
    - **anima at the m82 snapshot**
- **S1:834-839:** notebook · tiling · canvas (`panes.js` kept on disk); React rows; tokens on the twin client; **the pincer on dom**.

## Main's "never" list (M:2836)

- a lowercase helper over `trait.X`
- a `traits` key on a die
- a repl LIST
- a `$repl` atom
- **a verb that paints**
- **a turn through the repl**
- a synthetic ghost mask
- a `host` key
- a `mounted` promise
- `clientDie.client`
- a `*` on a mode's repl
- `$live`
- a hosted/remote split
- two classes for one noun
- a `lifecycle/` or `traits/` dir in ghost
- paladin under `typology/`
- a self-import

## S1's "never" list (S1:876)

- a Loop class
- Ring
- db
- fx
- rings in code
- `host` as a client noun
- `session`
- `target`
- a `view` word
- `surface.signin`
- a surface lifecycle
- ink beside the chrome
- React
- paladin in the ghost root
- a gate state machine beside `Lighthouse.$status`
- a `views.js`
- `--say`
- opentui for a one-shot report (its probes leak)


### appendix: m86-s2

# m86 s2 — notes (quests/done/m86-repl-loop-clients.s2.org, 4313 lines, read whole; the code blocks skimmed where pure paladin verb wraps)

Paths are `quests/done/m86-repl-loop-clients.s2.org:LINE` → shortened `s2:LINE`.

## (a) status
- `s2:1` title: "the root of ghost re-abstracted: ONE client entity shared by anima and ghost, TWO vectors (shell · repl), chrome as the rendering of the repl".
- `s2:3` `#+status: LANDED 10-12 both milestones, his walk owed` — milestone two on memo (`commons/fixtures/memo/`); his walks owed: `deno task ghost/scenario` + demo on his ledger with a real hallucinator.
- `s2:56` handoff "done": landing log rows 1–15 (row 15 is 10-13: `/mode [query]`, `/doctor`, `key/ctrl-p` → `/mode`; 137/0 green). NB the landing log table in this file stops at row 14 (`s2:4283`); row 15 is only in the handoff.
- `s2:131` / `s2:176`: **anima OUT OF SCOPE this stretch** (/"anima not in scope."/). Anima = "next quest" (`s2:55`, `s2:4198`).

## (b) beef's client-relevant rulings (verbatim)
Intent table `s2:22` (A–L):
- A /"…we have trajectory, client, and ring. maybe its time to sunset trajectory and re-abstract the root of ghost."/
- B /"the client is the entity that anima and ghost share."/ · /"clietn is the shared thing amonst client. the integration point."/
- D /"we need two interlocking systems in ghost. the shell and the repl. chrome will base on repl. shell repl chrome."/
- E /"the shell takes what the signal from the cmd line and runs it through its shell vector. the shell vector can escalate to repl or chrome. the shell vector might boot a runtime."/
- G /"chrome is ui rendering of repl. the emacs to our lisp - almost."/ · /"the repl is based on our client."/
- H /"right now the client prototype is utter garbage. way to many shit variables on it…"/
- I two vectors shell + repl, /"they each have their own ctx schematic, their own intents, and consumers, but they do share some functionality. to isolate that functionality is key."/
- K /"repl also has terminal, thread, and so forth. shell has the process management up down start stop install (replace init with install globally) doctor… help. --help is a feature i want too."/
- Standing from s1 (`s2:22` tail): client is a die on a boot vector (/"exactly the same structure as we have in the runtime"/); loop = Vector of handlers (/"kind of like a reducer pattern attached to a REPL"/); `ReplSignal` is the reader; no `Ring`/`Loop` class (/"the ring architecture is … a narrative layer for us"/); **`surface` is the noun for what differs**; four lifecycles construct · populate · resolve · integrate.

Flips, later word wins `s2:160`: ink → /"opentui/solid for ghost"/ · react → /"defer react. keep solid and svelte"/ · anima /"not a must"/ → /"we want solid on both. opentui and vite"/ → 10-12 /"anima not in scope."/ · /"root vector doesnt send turn"/ → /"The root of client.repl has a *catchall"/.

His marks table `s2:164-182`:
- /"there is no /drapes/{dom,tty}. only solid,svelte"/ · /"move the target surface specific stuff into the clients. out of the subsystems. all of it."/ `s2:166` → panes/surface/credentials into `systems/ghost/chrome/`; drapes = svelte + dom kit.
- /"no not gestlaten. move to lifecycle. there is probably a core somewhere"/ `s2:167`.
- /"there is no lifecycle surface. ...."/ `s2:168`, `s2:3659` → `pipes` built inline in `lifecycle/shell/resolution.js`; `headless` = test rig.
- /"there fucking are no slot and chord. never agreed to the name"/ `s2:169` → chrome holds `$layout` · `$output`; leader walk unnamed (F23).
- /"there is no COMPOSITION EITHER!!!!!!!!"/ · /"!! still no door."/ · /"also no host..."/ `s2:171`.
- /"same for use. move affect to do. vector.affect() vect.do(). keep affect as depracated."/ `s2:172`.
- /"there is no ctx.root ?!"/ `s2:173` → F26 `root` in `contexts.Command`.
- /"trajectories/ -> rename to commands. also flatten client/entity into entity and dock also down."/ `s2:174`.
- /"we still need sheets… sheets is the interface/surface between dapper and ghost. abstract it as such."/ · /"not dissovled."/ · /"lots of this goes into sheets."/ `s2:177`, `s2:286`, `s2:338`, `s2:825`.
- /"belt goes into gestlaten/belt"/ `s2:178`; /"why env on ghost?? all system stuff is handled in paladin."/ `s2:179`.
- /"lets box all of this view level stuff up like we do in anima. box and bridge. altho maybe those are specific to anima. what might be ghost? view. ok lets take ctx.view ={...view}"/ `s2:180`, `s2:3575`.
- **View contract** `s2:181`, `s2:2847`: /"A component never knows which vector called it … The vector only names a KIND, as in ctx.view.hold("form", props). The surface turns the kind into a component and chooses the BOX it goes in … All three can share one contract with three different boxes."/ · /"i dont see what 'nature' shoudl do on view."/
- **Prompt glyph** `s2:182`: /"well make the repl chrome be only "<<". like "$" in unix. repl needs some sort of visual device."/
- `s2:2698` /"The root of client.repl has a *catchall to capture text thats just yap to the current mode harness."/
- `s2:3812` /"previous client was better"/; `s2:3848` /"move dock from terminal to client"/ (F15).
- `s2:2940` /"in the chrome it would hang"/ (a hold over the cover, not with a box).
- Milestones `s2:4161`: /"ghost is up. ghost and runtime are up and integrated."/; /"we skip runtime boot in repl for now"/ `s2:4165`; /"milestone one endds in the scenario testing interaction fixtures for me."/ `s2:4173`; his three-ways list /"the view trajectories, the ledger and instance trajectories, registry clone, tap, untap, instance up down, doctoring, quit. via shell, repl and chrome."/ `s2:4175`.
- Landing-log rulings (10-13): /"we have traits for this"/ · /"standalone home trait … user home trumps client home … home.reference"/ · /"should be repl. and in repl typing 'chrome' launches chrome"/ `s2:4281`; /"default is repl"/ · /"i dont wnat the tui rendering in the scenario"/ `s2:4282`; /"not all shell commands go onto the repl. a lot do. help for sure"/ `s2:4283`; /"the client repl is an intermedirary"/ (per-terminal repl, `s2:58`); /"client wasnt migrated. i forgot"/ (anima reds on `View`, `s2:56`).
- F20 RULED /"all of it"/: one pane set per client `s2:4289`. F27 RULED /"fix."/ exit codes `s2:4296`. F28 RULED /"the referenced probe should win."/ anima vite w/o `@deno/vite-plugin`, lands with anima `s2:4297`.

## (c) landed / designed / owed
LANDED (10-12/13):
- typology: `contexts.js` = `Command · Shell · Repl · Mode` (`s2:614-617`); `Vector.use(...)`/`do`/`graft(...)`, `affect` deprecated (`s2:521-576`); `shard.controller.settle`; `index.client.js` gains `controller` (`s2:512`). Landing row 1 `s2:4258`.
- sheets: tty kit moved from `drapes/tty` into `subsystems/sheets/` (components, palette, paint, chassis, captured, cut, keys, outline, table, plain, host/opentui FFI, state/) `s2:337-490`, `s2:4259`. **NB: frontier 10-19 says `subsystems/sheets` DEAD — this is stale vs settled tree.**
- ghost: shell (`lifecycle/shell/*`) + repl (`lifecycle/repl/*`) as two Vectors; `commands/` (entity/dock/key/help/quit/yap/runtime/paladin/upgrade); `chrome/` (5 panes crown·dock·frame·navigation·signin + pips, `surface.js` tty, credentials, panes bundle `out/panes.mjs`); `gestalten/belt/view.js` the BOX (`s2:2847-2950`). Landing rows 3–4 `s2:4260-4268`.
- Re-base onto old anima typology: ONE em, `Dataspace.rung(connection)`, `DaemonDossier` RemoteRepository over `/metadata/daemons` cast `id: slug`, `runtime.daemon`, `mode.host`, `thread.mode`/`terminal.thread`/`terminal.daemon` entities (`s2:4131`, `s2:4270`).
- tty.solid in paladin's bundler (`s2:4275`); frame mounts `buffer.bundle` else the APPLICATION mode's bundle, hands the view `{ renderer, palette }` (`s2:4275`) — NB the tangle's frame.jsx says `module.default(element, terminal)` (`s2:1032`); landing changed it.
- memo fixture `commons/fixtures/memo/` (56 files) incl `buffer/memo.jsx` tty view + `buffer/Memo.svelte` "the dom.svelte entry, compiled, unwalked (anima's quest)" `s2:4214-4237`.
- HOME trait on user + client (`v.primitives.Home`), `clients[].home` gone `s2:4281`; repl verb `chrome` (`commands/chrome.js`) hands over stdin `s2:4281`; bare `viva` → repl even on TTY `s2:4282`; repl gets doctors + record verbs + help `s2:4283`.
- Per-terminal repl: `terminal.$repl` grafts `client.repl`; `client.dispatch` runs active terminal's repl, else `client.repl` with `terminal: null` pre-signin `s2:58`.
- `cover` vs `surface` split in `lifecycle/client/integration.js` (crown·signin before lighthouse; navigation·dock·frame after daemons; `die.panes = { arrange, destroy }`) `s2:4268` — the tangle block `s2:3008-3070` is pre-split.

OWED (`s2:60`, handoff):
- repl fault hint `— /--help` (`commands/yap.js:4`) and help footer → `help`? (ASKED).
- `session` (his kill) vs memo's `/session` (QUESTIONED).
- **chrome key ownership**: Enter (`chrome/panes/navigation.jsx:63`), grading digits (`dock.jsx:104`), every unbound key a `/key/<key>` fault — F23 unnamed. Also `s2:4278` OPEN, `s2:4281` "Enter in the dock → ✕ fault · Not found on both paths (F23)".
- a chrome test on a REAL client die (hand doubles drifted thrice); coverage gaps (crown-only gate `chrome/panes.test.js:407` empty, client Buffer, terminals.remove…).
- pipe race (`integration.keys` before `resolution.lighthouse`); pipe repl reads stdin before population `s2:4276`.
- codemap shard rewrites (ghost · design · map · anima · invariants · paladin · runtime · typology · connoisseur).
- the tablet meets no client until anima; `viva` on PATH install story; `deno-watch-swallows-the-first-line`.
- **repl → chrome in place (`die.$surface`, the split-footer) unbuilt** `s2:60`.
- Mode verbs on the per-terminal repl: three questions open — rebuild on every mode change? `terminal.$mode`; verb source (mode's `metadata.aperture` projected; draft `scratchpad/verbs/draft/gestalten/belt/aperture.js`); flat vs prefixed, base wins collision; `shape.strip` drops `valence` `s2:58`.
- `client.$dock` persistence (`trait.DOCKED` on user) deferred `s2:3848`, `s2:4310`.

## (d) open forks / QUESTIONED
- F23 the leader walk's NAME (old ghost menu over `steer.trie.at`) — "no name; built after he names it" `s2:4292`. Directly relevant to m95 keymap.
- F29 `terminal.thread` id vs object — later dissolved by re-base (`s2:3929`).
- F30 runtime dominion repl-only; paladin graft on repl once ctx carries instance `s2:4299` (partly superseded by row 14).
- F18 `/instance/up` children (runtime · anima) as child controllers — "stays his" `s2:44`, `s2:3735`.
- F9 config box: mask on client, knobs (theme · font · composer) on surface `s2:35` — no ruling recorded.
- QUESTIONED `s2:4301-4312`: serial dispatch in `integration.keys` (streaming turn blocks next line; on tty an `/abort` heir `/thread/:id/abort` would queue; "ctrl-c · esc ride the CONTROLLER and the chrome, never the repl"); `home` vs daemon mounts race; `thread.$mode` re-derive; **navigation's focus latch** (`useKeyboard` hears every press while dock Input holds focus; "no name before"); his `?` rows (`/instance/daemons` · `/instance/modes` · `/daemon/<ref>/*` · `/service` · `/lighthouse`); adopt verb; `$dock` persistence; held renderer close.
- `s2:1201` navigation focus latch QUESTIONED (old `$chord` gated it).
- `s2:4264` "anima importing `@vivalence/ghost` pulls paladin: QUESTIONED for anima's stretch" (one-belt ruling killed the paladin-free barrel law).
- `s2:3283` home awaits mounting.

## (e) stale vs settled direction (m95: Solid both, OpenTUI, REPL-settled, keymap Vector, pincer dropped; View gone; sheets DEAD; belt.dock red)
- **sheets as the tty kit** (`s2:141`, `s2:177`, `s2:337+`) — frontier says `subsystems/sheets` DEAD. Everything importing `@vivalence/sheets` (panes, surface.js, view.js, install.sh patch path `subsystems/sheets/host/…` `s2:759-762`) is stale.
- **drapes = "svelte + the dom kit anima owns"** `s2:204`; `subsystems/drapes/dom/` "untouched (anima's)" `s2:194` — anima moving to Solid; drapes `./dom` red now.
- `Memo.svelte` "the dom.svelte entry" `s2:4236`; tablet dom frames pinned on a svelte class hash `s2:4279`; old anima `Frame.svelte:62` · `Oracle.svelte` · `Dealer.svelte` (F8 `s2:34`) — svelte-era.
- Old anima `BRIDGE`/`BOX` stores (`s2:109-110`) as "the SURFACE's own state" — svelte-era anima; beef doubted /"box and bridge… maybe those are specific to anima"/.
- `belt.dock` — `gestalten/belt/dock.js` copied into ghost (`s2:2725`), `dock.resolve(held, viewport)` used in integration (`s2:3040ff`), `dock.DEFAULT_DOCK` on Client (`s2:3833`); map says drapes `chassis.jsx:3` `belt.dock` red; ghost's `belt` = `harness` only now — stale.
- `Floor` component in frame.jsx `s2:1046` (JsonTree fallback of `buffer.$data`) — flagged term.
- `$layout` · `$output` as tty surface atoms; `/key/<name>` commands per key (`commands/key/*` `s2:1724-1773`) — a hand key→verb table, pre-keymap. Dock's hard-coded `<Key>` hints (enter/`/`/ctrl-f/ctrl-n) `s2:1002-1007`.
- `chassis` SLOTS `{crown, navigation, dock, frame, signin: "cover"}` `s2:401` — the pane set.
- `View` not mentioned in this file except anima reds on `View` `s2:56`.
- `ink-in-anima` testament probe listed `s2:17` — ink dead (flip `s2:160`).
- `mime.tty.solid` accept list `s2:1333`; pipes accept `application/json` `s2:3693`.
- No `pincer` mention in this file.
- `connoisseur.md` / `self.md` / `ikiro.md` cited — those files are deleted now (git status: `D .ikiro/connoisseur.md`, `D .ikiro/self.md`); codestyle.md replaced.
- `lifecycle/shell.js` / `lifecycle/repl.js` flat files (rows 12–14, `s2:4281-4283`) vs tangle's `lifecycle/{shell,repl}/` dirs — tree moved; and m91 subject-first since.

## (f) dependencies
- s1 (`m86…s1.org`) intent A–M standing `s2:22`; m82 (vk snapshot `testament/m82-clients-20261012/`, m82 Q12 find-by-content owed `s2:768`); m32 memoriter revived (`s2:4202`); m84 D1–D6 runtime-level home (`s2:4210`); m81 (every mode an entrypoint, STANDALONE dead `s2:4240`); m89 telemetry (shard cites `s2:228`); anima's quest = "next quest" (release line at `~/.viva/bak/ikiro/release-20261013/anima-rebuild-line.md` `s2:58`).

## (g) design nouns, locked meaning
| noun | meaning | where |
|---|---|---|
| client | the ONE entity anima and ghost share; `Client { mask, controller, runtime, terminals, repl, dispatch, $dock }` | `s2:22` B, `s2:605`, `s2:3812-3846` |
| shell | dispatch Vector over argv; escalates via `ctx.upgrade.{repl,chrome}()`; bare `viva` = `.do` | `s2:151`, `s2:3562` |
| repl | dispatch Vector `client.repl`, one traverse per line; no root effect (empty line NotFound) | `s2:152`, `s2:250`, `s2:3438-3452` |
| chrome | "ui rendering of repl. the emacs to our lisp - almost"; the tty surface + panes | `s2:22` G |
| surface | "the noun for what differs"; contract `{ name, viewport(), credentials, accept, keys: AsyncIterable, interactive, emit(kind,props), hold(kind,props), mount: {signin·crown·dock·frame·navigation} → {place, destroy} }`; three: plain · pipes · tty | `s2:22`, `s2:3735` |
| view (box) | `ctx.view = view(surface)`: `{interactive, stdin, json, width(), painted, emit, hold}`; verb names a KIND, surface picks component+box; no `nature` | `s2:604`, `s2:2940` |
| kinds | form · picker · confirm · pending · report · listing · output | `s2:2942-2950` |
| terminal | ACTIVE terminal = "single point of contact for a mode": row + mask·runtime·daemon·mode·thread·buffer as getters | `s2:607`, `s2:727` |
| dock | ONE per client (`client.$dock` side/share/full/collapsed) | F15 `s2:39`, `s2:3848` |
| crown | 1-line trail pane: slug · user · #terminal · daemon › mode · streaming · offline | `s2:853-891` |
| frame | buffer pane; mounts the buffer's bundle via accept negotiation, else Floor JsonTree | `s2:1016-1071`, `s2:4275` |
| navigation | spine runtime+daemons → groups(by traits) → modes → threads; Enter dispatches entity grammar | `s2:1088-1199` |
| `<<` | the repl's one visual glyph (like `$`) | `s2:182` |
| yap | `*` catchall: bare line → turn to the active terminal's harness | `s2:2698-2717` |
| entity grammar | `/terminal` · `/terminal/new` · `/terminal/:id` · `/terminal/:id/seat`; same for thread, buffer; literals before `:id` | F22 `s2:4291` |
| ReplSignal | reader: 5 coercion rows (bare line→`*`+input · `/line` · argv · `{signal,input}` · `{key}`→`/key/<k>`) | `s2:3882-3920` |
| leader walk | UNNAMED (F23); slot/chord dead | `s2:4292` |
| application bundle | mode's APPLICATION `{url, bundle: Bundle{text/html+solid}}` (example) | `s2:717` |
| dead words | Ring · Loop · session · enter · composition · door · host() · slot · chord · trajectories/ · bearer · userspace · gather · construct · runtime.modes · `*Id` · remode | `s2:59` |

## (h) briefing §
Not a design briefing — n/a.


### appendix: m86-s3-s4

# m86 s3 + s4 — notes for m95 (depincered client)

Files: `.ikiro/quests/done/m86-repl-loop-clients.s3.org` (1808 lines, "s3") · `.ikiro/quests/done/m86-repl-loop-clients.s4.org` (2836 lines, "s4"). Both read in full. Paths below are relative to `.ikiro/`; `s3:N` = `quests/done/m86-repl-loop-clients.s3.org:N`, and `s4:N` likewise.

## (a) status lines

- s3:3 — `DESIGNED 10-15`. The interview locked the ring; the tangle was proposed and **nothing landed**. Next step was his go per file, HOLY diffs first (`contexts.Repl`, `index.client.js`), then paladin (m88), then ghost. It supersedes m88's GHOST half (no repl list, no `terminal.repl(base)`). m88's PALADIN half stands and is cited.
- s3:1805 (handoff "done"): on 10-16 ghost was reshaped BY HAND instead: `app/client/index.js` = execution + factory, `app/surface/{repl.js,chrome/index.js}`, a repl line = `client.controller.branch(signal.pathname)`, `tests/repl.test.js` 5/5. `world/codemap/ghost.md` was rewritten in his nouns (shell · client = boot pipeline to a held process · repl = surfacing part + client part · commands).
- s4:3 — `RE-TANGLED 10-16, FOURTH PASS`. One tangle in `ls` order, every file FINAL. Rulings s4-13…s4-30 hold. **Nothing landed; next: his go per file.** Landing order = `* milestones` (paladin first).
- s4:16-19 — s4 calls s1–s3 HISTORY: "nothing below cites them; the law is carried whole".
- Both files now sit in `quests/done/`. Whether any of s4 landed after 10-16 is NOT recorded in these files; check the tree or frontier.

## (b) beef's client-relevant rulings, verbatim

### s3 interview, 10-15 (s3:77-109)
- a1, lighthouse: /"client.runtime.lighthouse"/ (s3:79)
- a2, root controller: /"die."/ (s3:80)
- a3, mask: /"on die we have the whole paladin instance. on client only the client[ghost]."/ (s3:81)
- a4, `$active`: /"the terminals exist inside of the runtime entities, so there's one more scope. And active lives directly on the client."/ (s3:82)
- b5: /"repl itself isnt reactive. no $repl. … the repl vector composition and execution is a function of the things i listed."/ (s3:83)
- b6, repl signal = `bak.3/prototypes/replsignal.js`: /"there is some valuable stuff in bak3."/ (s3:84)
- b8, precedence: /"we attach them in order and thats that. one vector. first statics then dynamics."/ (s3:85)
- b9, remote mode verbs work like `mode.metadata.harness → shape.connection.wire`: /"yes. exactly."/ (s3:86)
- 10: /"dock is dock. the bones and panels come later."/ (s3:87; repeated s4:693)
- 11, seats: /"client · lighthouse · mode(client) · mode(runtime) · terminal · thread · user AND RUNTIME itself!. stagger is one method. not tteh only method."/ (s3:88)
- 12, trait arguments: /"traits have (subject, object) and vectors (ctx{...subject,...object})"/ · /"We handle traits not in one unified way dogmatically, but whatever makes sense in context."/ · /"Home is not a fucking watcher…"/ (s3:89)
- 15: /"no viva repl FOR NOW."/ (s3:90)
- r1, dispatch: /"terminal.dispatch."/, then /"actually maybe client.dispatch makes more sense… client.dispatch(signal)."/ (s3:91). s4-17 later puts it on both (see below).
- r2: /"compose on dispatch for now."/ (s3:92)
- r3, context: /"stream no. kill is part of controller. command makes no sense. mode missing."/ (s3:93). s4-4 later removes `mode` again.
- r4: /"terminal.thread.mode. (might be runtime or daemon). altho i suspect we will have threadless terminals iwth a clietn mode attached at some point."/ (s3:94)
- r5: /"dataspace shit like subs dont go through the fucing repl"/ · /"logging via controller.stdout. effects via dataspcae. … repl renders turns but some repl loops dont interface with turns at all."/ (s3:95)
- r6: /"dock renders message spans intertwined with turns."/ (s3:96)
- r7, who writes a message: /"anyone. we can add a middlware that passes ctx.output.message to controller."/ (s3:97)
- r8: /"terminal.controller"/ (s3:98)
- r9, keys: /"keys are their own mechanism. later. just straight dock repl->replsignal"/ (s3:99)
- r10, the bare line: /"harnessed adds the effect"/ (s3:100). s4-5 reverses this.
- r11: /"the repl vector is the result of a pipeline. like runtime apertures go through pretty elaborate composition."/ (s3:101)
- r12, remote REPLING: /"daemon and runtime each have their scope for each mode and a repling mode exposes its functionality at that attachment. reference points to the root."/; the proxied thread/terminal is /"later"/ (s3:102)
- 5, trait code location: /"systems/ghost/traits/<seat>/<name>.js // one tree, ghost owns, anima imports"/ (s3:106)
- 6, the dock's feeds: /"only those two now"/ (messages ⊕ turns) (s3:107)
- 7, lighthouse traits: JOINABLE exposes signup; AUTOLOGIN runs on the client (s3:108)
- 8: /"if we boot the client and there isn't a runtime, then we boot a runtime."/ (s3:109). s4-18 narrows this.
- intent (s3:65-67): /"we now move the client to a common abstract and consider svelte a depracated surface target (with its spot taken by solid to create coherence with opentui's solid). so, same tooling and abstractions between clients. ghost actually implementeing all teh prototyeps and lifecycles and traits. anima importing from "@vivalence/ghost"."/
- intent (s3:58-62): the repl is /"the core of the client architecture. what in anima is the dock will now be our interface with the repl"/. Also /"repl on client is no longer valid. repl is a property of terminal … We control panels, telemetry, login, debugging, harness … via repl"/ and /"the terminal repl vector will constantly be rebuild"/.
- intent (s3:43-45): HOME is wired via `client.$active`. `"modes": ["@commons/home/client"]` is a client-modes idea: /"keymaps via traits or a repl vector via repling"/.
- tank brief (s3:73): /"only for the shell … proper rendering of the Chrome with the REPL in the middle. We do entirely new Chrome."/ Each step gets a message, giving an inline trace. Three demo modes (client · runtime · daemon). `application start` splits dock + frame. Flashcard daemon. The runtime app lists modes and daemons and is clickable.

### s3 marks on the tangle (s3:113-129)
- /"I suspect that the right way to do this is something akin to the way runtime does it."/ (s3:113, mode boot)
- /"we can just lean into the span tracks"/ (s3:114)
- /"all of the dies are named die. This is very confusing."/ → `clientDie · terminalDie · threadDie · modeDie · daemonDie · lighthouseDie` (s3:115)
- /"i dont like these validations. ugly to do inline."/ → a route is grafted or ABSENT (s3:120)
- /"we just pipe out of the controller at the right level with a message filter. easy."/ → `Span.message` · `Span.tail` · `shard.track.message` (s3:122)
- /"you dont fucking use intermediary variables"/ ×6 · /"we multiplex on runtime"/ · /"just write the subscriptions out."/ (s3:124)
- /"what are fucking rows."/ (s3:126)
- /"wtf is thread echo???? never existed."/ → `$echo` dies (s3:128)

### s4 rulings s4-1…s4-30 (s4:113-144)
- s4-2: /"the die is the client. instantiate the client prototype as the die itself."/ (s4:116)
- s4-3: /"inline all of these"/ (s4:117)
- s4-4: /"we just read the terminal die"/ · /"we have no mode on the repl directly"/ (s4:118)
- s4-5: /"modes and their repl vectors are scoped by mode/slug and mode/type/slug onto the terminal repl. and then we have another harness streamer specifically for the terminal on /*"/ (s4:119, :175)
- s4-6: /"there is no host. host is not a real entity. doesnt exist. its also not a key on any ctx."/ · /"thunks? are our friends!"/ (s4:120)
- s4-7: /"promises to be awaited on entities is an antipattern."/ (s4:121)
- s4-8: /"not a prototype"/ · /"rename seat to setThread"/ · /"make connect return the repo"/ (s4:122)
- s4-9: /"activity has a controller, no? if so then client version needs one too"/ (s4:123)
- **s4-10: /"frame isnt a client primtive. frame is surface. … running after the clients home trait is applied??! wrong as is."/** (s4:124)
- s4-12: /"check with anima/prototypes … go change by change"/. Anima does NOT build (`View` left typology); where they disagree, the runtime rules (s4:126).
- s4-13: /"the 'prototype', the 'execution' vector, and the 'factory'… factories are very flexible about their signatures"/ · /"dossiers are kinda vintage."/ (s4:39, :127)
- s4-14: /"align filestructure once profoundly"/ → the tree mirrors `systems/runtime` (s4:128)
- s4-15: /"turn this into a thunk and move to ghost/typology/gestalten/shard/host"/ (s4:129)
- s4-16: /"i still dont like this grouping. remove it. flatten it."/ → ONE flat mode-trait catalog (s4:130)
- **s4-17: /"move to client prototype itself."/ · /"really, were piping into terminal.repl and terminal.dispatch. there is no direct access to client.repl usually. client.repl is loaded into the terminal repl as part of the terminals composition process."/** (s4:131, :194)
- s4-18: /"no. still wrong."/ on a loopback hostname test → the LEDGER decides the boot (s4:132)
- s4-19: /"why is this top level??? lazy."/ → credentials go inline in the lighthouse lifecycle (s4:133)
- s4-20: /"modes plural is not a $atom?!!? … runtime.entities[] === RemoteRepositories... so why the duplication???"/ (s4:134)
- s4-21: the Lighthouse constructor's one job: /"wire up the status to stdout. we want to know status changes."/ (s4:135)
- s4-22: /"RUNG … stupid word … why are we hardcoding entity specifics on the dataspace container"/ → `Dataspace.branch(connection, name)` (s4:136)
- s4-23: /"if we have a controller, we have a status on controller, then we dont need status on root."/ (s4:137)
- s4-24: /"ignore this entire phases system for now."/ · `$live` /"never existed. cut."/ · /"cuuuut"/ (s4:138)
- **s4-26: /"i dont like the seat term. replace where applicative with: setEntity."/** → `terminal.setThread` (s4:140)
- s4-27: /"why mask === module?? … something about the mode lifecycle is off."/ (s4:141)
- s4-28: /"every mode has a mode.stdout = new Span();. their output is patched through depending on context. … good standard."/ · /"create on prototype."/ (s4:142)
- s4-29: /"not name ctx. what is this?? is it client.repl??"/ → `ctx.repl` = the composed vector (s4:143)
- s4-30: /"why this separate step?"/ → paladin's boot/integrate kept, with the reason cited (s4:144)
- frame.jsx mark: /"make sure to doublecheck with anima frame and that whole pipeline."/ (s4:177)
- autologin mark: /"we might want to pass the trait mask here."/ → deferred (s4:169)
- s4 intent (s4:8): /"we could go in the direction of runtime till harnessed chat and buffer frame rendering. we could go into client side modes and their repling functions."/

## (c) landed vs designed vs owed

**Landed by 10-16** (s4:53-93, the measured tree):
- `run.js`, `typology/prototypes/{argv,replsignal}.js`.
- `app/shell`, `app/client/index.js`, `app/client/commands/{help,chrome,quit,turn}.js`.
- `app/surface/repl.js` (readline), `app/surface/chrome/index.js` (opentui; ctrl-c; backtick toggles the console), `panes/dock.jsx` (tails `client.controller.stdout`).
- Laws in place: one dispatch shape; a line = a controller branch; exit codes via `fromm.controller`.
- Output → `stdout.message` is COMMENTED (his line), so 3/5 of `repl.test.js` are red (s4:86).
- There is no per-line composition (s4:87).
- `*` is a STUB echo (s4:89).
- `/chrome/on|off` double-taps (s4:91).

**Absent at 10-16** (s4:97-107):
- `client.runtime`, the mask `clients[ghost]`, terminals, `$active`, `mode.repl`, the composer, `contexts.Repl` validation.
- Crown, frame, signin cover.
- The lobby and console fixtures.
- The m88 paladin half (`grep REPLING subsystems/paladin` → 0).

**Designed (s4 FINAL tangle, not landed)**, with milestones at s4:2755-2765:
- B1 paladin
- B2 console (the hosted REPLING mode)
- C0 the line (`shard.repl`, `contexts`)
- A1 attached (runtime, lighthouse, dataspace)
- A2 terminal (HOME, `/mode`)
- A3 chat (the `*` streamer, `/harness`)
- A4 frame (`/application/start|stop`, `chrome.jsx`, `frame.jsx`)

**Owed** (s3:1808; s4:2836):
- `world.registry` / `world.controller` measured.
- `Manifest` on a typeless client row.
- Known issue `autologin-signin-flashes`.
- His word on `ctx.daemon` REJECTED (one em).
- His word on `shard/repl.js` importing `commands/turn.js` (the one upward import).
- His word on Activity `set status` pouring into `controller.status`.
- s3-era owed: `/chrome/off` remount double-print (`Vector.use` has no un-use).
- Coverage gaps (s4:2794): the chrome panes have NO test; the in-process boot is walked by hand; WIRE-fault retry is missing; the frame's mounted view is unprovable until sheets resolves.
- QA markers, all `pending`: s3:1785-1792 · s4:2798-2806.

## (d) open forks / unanswered

- Remote mode REPLING (`/metadata/repling` plus a proxy graft) — r12 /"later"/ (s3:1796, s4:2810).
- A threadless terminal with a CLIENT mode (hosted HOME), e.g. `/client/ghost/mode/home/console` as HOME — r4, deferred (s3:154, s4:47, s4:463).
- Keys as signals (`/key/<chord>`) and pickers (`ctx.view.hold`) — r9, "later" (s3:1798). **m95's keymap Vector fills this.**
- Crown · navigation · signin cover · dock "bones and panels" — all OUT (s4:49, s4:2810, s4:2821).
- The `status` verb in the dock's tail (the cover's) (s4:2815).
- Remembered active terminal (anima `stores/terminals.js:28-33`); `active` takes the first (s4:2817).
- Stall / AIMED continuous / buffer vigil cut (s4:2812). The frame must not open on a thread set.
- Thread PHASES deferred (s4:2811).
- A mode that arrives after mount is not staggered (s4:2813).
- A `Listing` rendering for `/help` (s3:1800).
- `@vivalence/sheets` returning, or memo copying its helpers — BLOCKER for the tty view (s4:1532, s4:2824).
- The `/lighthouse/metadata` route answers no `trait` key (s4:2816).
- Rename of the daemon lifecycle's `daemon` field to `host` (s3:1109). s4-6 made it moot: the die key is the TYPE.

## (e) stale assumptions vs the settled direction (Solid · OpenTUI · REPL · keymap · no pincer)

- **sheets**: s3 imports `@vivalence/sheets` (`paint`, `Pip`, `usePalette`, `Input`, `JsonTree`, `Markdown`, `Spinner`, `chassis`, `SLOTS`, `keypresses`) — s3:320, :446, :581. s3's chrome = "crown · dock · frame · signin cover, painted into sheets' chassis" (s3:156, :177). STALE: sheets is DEAD. s4 corrects it: no chassis (`subsystems/sheets/bak/chassis.js` stays bak'd), and ghost has its own `views/JsonTree.jsx` and `palette.js` (s4:693, :800). s4 still flags memo.jsx red on sheets (s4:1532).
- **Floor**: s4's `frame.jsx` names a `Floor` (a JsonTree of `buffer.data`) as the fallback when no bundle negotiates (s4:531, :769-772). This is the old Floor concept; recheck it against m95.
- **drapes `Frame.svelte`**: s4 takes drapes' `Frame.svelte:64-70` as "the post-View contract" (s4:177, :800): the door is `default(target, { terminal, mode, thread, buffer, renderer, palette, dispatch })`, with `buffer.mount()/unmount()` around it. Svelte is the source of truth here, which is stale against Solid. The bag shape is still the useful part.
- **anima**: "anima does NOT build (View left typology)" (s4:126). Anima on `@vivalence/ghost` is deferred (s3:1799, s4:2810). The anima snapshot is "m82" (s4:2825). s3:65 rules svelte DEPRECATED and solid in its place.
- **chrome layout**: s3 has crown/dock/frame/signin plus `$dock` (`dock.DEFAULT_DOCK`) and `integration.shown()` pane lists (s3:993-1000, s3:1379). s4 drops crown/signin/`$dock`: `chrome.jsx` = Frame ⊕ Dock in one Solid row, with the dock narrowing to 48 columns when a buffer is set (s4:667-693).
- **seat / seated / seating**: s3 vocabulary throughout (`terminal.seat`, `resolution.seat`, `commands.seated`). KILLED by s4-26 → `setThread`, `resolution.thread`.
- **s3 mechanisms s4 killed**: `ctx.span`, `track.span`, `track.message`, `contexts.Repl` with `mode`/`span` (s3:143, :417). s4 has `controller` + `repl`, no `mode`, no `span` (s4:453-456).
- **bare line**: s3 has `HARNESSED` opening `*` on `mode.repl` (s3:150, :1710). REVERSED by s4-5: the mode opens `/harness`, and the terminal's `commands/turn.js` owns `*`.
- **demo fixture**: s3's `lobby` (the runtime demo, `@commons/home/lobby`, a tty view with ⏎/`s` key handlers via `useKeyboard`, s3:316-373) is OUT in s4 (s4:1655). HOME in tests = probe; on his ledger = `/runtime/runtime/mode/harness/runtime`.
- **mounted promises**: s3 `Runtime.mounted = Promise.withResolvers()` (s3:1452) — killed by s4-7.
- **`$live`/`$echo`**: dead (s4-24, s3:128). Streaming = `stream` records on `thread.controller.stdout` (s4:2214-2224).
- **pincer**: 0 hits in either file. **ink**: 0. **belt.dock**: not present; s3 has `gestalten/belt` `dock.DEFAULT_DOCK` (s3:1368, :1379).
- **`View`**: only as "View left typology" (s4:126, :177).
- **keys**: s4 `app/surface/chrome/index.js` has ctrl-c → SIGINT and backtick toggling the console (s4:66). The `<Key name=…>` hint row in the s3 dock (s3:536-540) is hardcoded. The s3 lobby used `useKeyboard` directly in a mode view — keys outside the REPL, against "everything settled via the REPL / keymap Vector".

## (f) dependencies

- **m88** (`m88-repling.org:150-300`): the PALADIN half — client modes, `REPLING: "repling"` in `integrity.js`, `populate.js:210` dressed, `resolve.js:47` referenced/mountpoint/ground, `instance.js` Client schema `mountpoint · reference · modes`, `home.js`, `index.client.js` Mode export (s3:3, :185, :404; s4:219-227, :347-500). m88's GHOST half is superseded (s3:3).
- **m82**: the anima snapshot (s4:2825).
- s1/s2: history (s4:14-15).
- HOLY typology hunks, each needing its own go: `prototypes/mode.js` (`stdout = new Span("mode")`, `repl = new Vector()`) · `contexts.js` (`repl` word, `client` desc, `Repl`) · `index.client.js` · `instance.js` (s4:411-500). s3 also had `span.js` `message/tail` and `track.js` `message()` (s3:735-772). s4 assumes `Span.tail` exists (`prototypes/span.js:83`, s4:872), so tail likely landed.
- The runtime is the oracle: `systems/runtime/lifecycle/{mode,daemon,runtime}`, `gestalten/shard/host.js`, `entities/Activity.ts`, `Process.ts:30` (s4:1282, :2304).
- paladin: `ledger.instances.lookup`, `ledger.boot`, `Die.integrate` (s4:1058).

## (g) design nouns, as locked

- **die / clientDie**: the Client IS the client die — `new Client({ controller, mask, register, surface })`. A child die NAMES it (`{ client: clientDie, controller, terminal }`), never spreads it (s4-2; s4:40, :2411-2449). Die names prefixed by entity (s3:115).
- **client**: fields `controller · mask · register · surface · unmount · booted · modes · repl · runtime · $active`, and the method `dispatch(line)` (s4:40, :2419-2441). The desc is in `contexts.js` (s4:449).
- **mask**: paladin's `clients[ghost]` row after settle/wire; never synthetic (a3; s4:1460).
- **register**: the result of `paladin.ledger.registry.wire(mask)` — the hosted mode citizens (s4:1457).
- **runtime** (on the client): `client.runtime`, a HOST — `type="runtime"`, manifest, reference, remote, statics, connection, call, cortex, cargo, lighthouse, entities, `$status`, and `get modes()` as a slice (s4:2697-2728). It multiplexes ONE connection (/"we multiplex on runtime"/).
- **lighthouse**: `client.runtime.lighthouse` (a1); authority only; its status goes to stdout (s4-21).
- **host**: NOT a real entity or ctx key (s4-6). Host beats are `shard.host.*(type)` thunks over `die[type]`.
- **terminal**: a runtime entity row (`runtime.entities.terminal`). It carries `controller = client.controller.branch("terminal/<id>")`, `repl = new Vector()` (the terminal's verbs `/modes · /mode · /application/*`), `$thread`, `$buffer`, `get mode()` = `thread.mode`, `dispatch(line)`, `setThread(thread)` (s4:42, :2065-2140).
- **`$active`**: the cursor on the client (a4), the Emacs `selected-window` analogue (s3:131).
- **thread**: `controller = terminal.controller.branch("thread/<id>")` when it is the active terminal's thread. No PHASES, `$live` or `$errors` (s4-24).
- **mode**: two classes. typology `Mode` = a hosted CITIZEN (client modes); `typology/entities/mode.js` = a host's ROW. Both carry `repl` and `stdout` (s4:41, :2063). Hosted repls graft at ROOT; remote repls graft SCOPED under `/mode/<type>/<slug>` and `/mode/<slug>` (s4-5).
- **repl**: not reactive, no `$repl`, no repl LIST (b5; s4:2835). `client.repl` = the static verbs, the first graft. **`ctx.repl` = the composition built PER LINE** (s4-29; s4:445). Compose order: `client.repl` · hosted `mode.repl`s · `terminal.repl` · every mounted mode scoped · the `turn` streamer only if `terminal.mode` is HARNESSED (`shard.repl.compose`, s4:2336-2341).
- **dispatch**: `client.dispatch(line)` → `shard.repl.dispatch(client, active, line)`. `Terminal.dispatch` does the same (s4-17). Surfaces call only `client.dispatch`.
- **replDie**: `{ signal, client, runtime, terminal, controller (line branch at signal.pathname), repl, output }` (s4:33, :2343-2355).
- **ReplSignal**: bare text → `{ nature:"*", body:[{type:"text",text}] }`; `/x y` → Argv verb (s4:24, :61).
- **message**: what a verb returns, marked on the line's controller stdout. The dock paints a string as a line, a fault as `✕`, a turn as a turn, anything else as a tree (s4:44).
- **dock**: the repl's face — the `<<` composer plus the transcript, tailing ONE span: `client.controller.stdout.tail("message","fault","turn","stream")` (s4:35). /"dock is dock"/.
- **dataspace**: its own channel; subscriptions never pass the repl (r5; s4:36). `Dataspace.branch(connection, name)` (s4-22).
- **frame**: SURFACE, not a client primitive (s4-10). It opens only when `terminal.$buffer` is set by `/application/start`, never by setting a thread (s4:49).
- **chrome**: s4 = dock ⊕ frame in one row (`panes/chrome.jsx`); crown/signin/navigation OUT (s4:49, :667-693).
- **application**: the `APPLICATION` trait fetches `/metadata/application` → `{url, schema, bundle}`. `open(terminal, mode)` lives beside the trait in `traits/mode/application.js` — anima's `standalone.js` (s4:1714-1738).
- **view door**: `module.default(element, { terminal, mode, thread, buffer, renderer, palette, dispatch })` — one bag; `dispatch` is a closure (s4:752, :800).
- **prototype / execution / factory**: the three parts (s4-13; s4:39).
- **HOME**: the `client` trait, CLAIMED via `traits.claim`; user over client (s4:1657-1671). The terminal's `home` beat sets it (s4:1379-1393).
- **REPLING**: `mode.repl.graft(mode.module.repling)` (s4:1813).
- **HARNESSED** (client side): wires `mode.harness` and opens `/harness` on `mode.repl` (s4:1752-1795).
- **stream**: `belt.harness.stream(mode, thread, parts)` marks `stream` records (s4:2214).
- **surface**: in the s4 tree, `app/surface/{repl.js, chrome/}`. A surface never composes; it tails and dispatches (s4:87, :841-869).
- **keymap / leader / minibuffer / palette / crown / pane / rail / pincer**: not locked in s3 or s4. Keys are deferred (r9). The crown is an s3 pane only (s3:193).

## (h) design-briefing open questions
None. These are quests, not briefings.


### appendix: m83-m88

# m83 + m88 — notes for m95 (depincered client)

Refs: `m83` = `quests/m83-tools-and-primer.org`, `m88` = `quests/m88-repling.org` (relative to `.ikiro/`).

---

## m83 tools and primer

### (a) status
- `m83:3` — CUT, not landed. Rebased 10-11 onto post-m82 repo (`scratchpad/m83/base` vs `rig9`). Tangle 47/47 hunks. Awaiting beef's go per file. `~/.viva` (23 files · 45 lines + riddler `aperture.js:37`) lands WITH the repo; one docs page owed. 10-19 m91: the one tier (`gestalten/tools/` · `paladin.tools`) LANDED; dry replay on live tree 38 land · 2 miss (`mode/lifecycle/population.js:1`, one `harnessed.js` sub-hunk — pre-m91 drift).
- Mostly NOT client work: it's runtime/typology (Primer Vector type, `shape.primer`, `PRIMER` trait, `primer_read` tool).

### (b) rulings (beef) — client-relevant subset is thin
- `m83:896-897` the law: a TOOL is any Vector node `{nature, valence, input}` the model may call; "a tool and an aperture route differ by AUDIENCE only (model · client), never by capability." — this is the m83 statement that matters to the client: client-facing surface = aperture routes; model-facing = tools; same shape.
- `m83:957` / `m83:811` "it's not a slug it's the nature those are different things Nature is the identifier."
- `m83:954` /"No more system."/ on the hallucination; `m83:962` H: /"split system/primer"/ — `primer` = Vector (`mode.primer`, `hallucination.primer`), `system` = the loaded record (harness input, `Request`, providers).
- `m83:964` I: choice round record → `system` /"Rename it to system."/ (reverses F2 name, `m83:965`).
- `m83:963` G: string case at `harnessed.js:45` dies /"drop your garbage"/.
- `m83:813` F: /"no. not like this. this feels wrong. ... maybe a dedicated vector type ... new vector type next to twitch. then the mode has a trait primer, exports a primer ..."/ → `Primer extends Vector` (`m83:972-975`).
- `m83:820` Q: `ctx.input.primer` — /"ah. right. keep of course."/ (harness input arg = `mode.harness.<faculty>.<verb>(input)`).
- `m83:967-971` F4 `load: "eager" | "lazy"`, default eager; F6 tool is `primer_read`; choice primer has no lazy node /"that dont exist. ignore."/.

### (c) landed / designed / owed
- LANDED: deliverable 7, one executable tier (skills → tools), by m91 10-19 (`m83:787`, `m83:1023`).
- CUT (in scratchpad, not in tree): Primer type, shape.primer, PRIMER trait, harness wiring (`requesting`/`arming`/`summarizing`/`primed`), `primer_read`, hello-world demo (`m83:779-791`).
- Milestones all "designed" (`m83:795-799`).
- OWED (`m83:1026`): the go; docs page `31.02_instance-from-scratch.mdx:259`; `~/.viva` re-cut; the `primer/*.md` file reading (F named the export only); 2 misses re-cut.

### (d) open forks
- `m83:816-821` both forks RULED. No open fork.
- Deferred (`m83:993-995`): index outgrowing budget (home loading every mode's primer → branch valence collapse, then a ToolSearch-like tool); **"one Vector with an audience mark (model · client) in place of `aperture` + `tools` — the open tension from A"** (`m83:994`) — relevant to client: unifying aperture (client audience) and tools (model audience); path-gated conditional load.
- COVERAGE GAP: cached prefix across a tool round (`m83:984`).
- QA pending `m83:988-989`.

### (e) stale assumptions vs settled direction
- `m83:73` (tangle comment in `hello-world/harness.js`): "the dock is the only reader of prose — an object or verbatim call has no markdown to render." + FORMAT section `m83:221`: "The dock renders markdown: ..." — assumes anima's Dock widget renders markdown. Under m95 (Solid chrome rewrite) the dock's markdown contract must be preserved or the FORMAT primer re-cut.
- `m83:97` hello-world manifest comment `"APPLICATION", // buffers from static svelte` — svelte assumption in a commons mode; settled direction = Solid.
- `m83:820`, `m83:864` callers in `chaosmonkey/oracle/buffer/Oracle.svelte:47` · `:121` (dead) — a Svelte buffer file in commons playground reading `input.system`; blast list includes `Oracle.svelte` (`m83:1005`).
- `m83:875` hello-world tests include `catalog.snapshot` stale since m82 `view` → `bundle` rename (`m83:3`, `m83:775`) — "view" where code says "bundle" — consistent with `View` leaving typology.
- `m83:653` / `m83:483` `tools.buffer.buffer` grafted into the model's armed tools — buffer tools exist model-side.

### (f) dependencies
- m81 (tools tier, `paladin.tools` F4; `m83:787`, `m83:1009`), m82 (landed first; `view`→`bundle` rename, `m83:3`, `m83:1008`), m84 harness-runtime (`m83:1009` "m81's harness milestone is re-cut over m83 with `mode_handoff` a tool", moves at `m84-harness-runtime.org:40`), m91 (landed the tier; repath).

### (g) design nouns (m83)
- **tool**: Vector node `{nature, valence, input}` the model may call; no SKILL tier (`m83:896`).
- **aperture route** vs tool: same shape, audience client vs model (`m83:897`).
- **primer**: a Vector (type `Primer` beside `Twitch`), leaves string|fn, nested, `load` eager default/lazy inherited from branch (`m83:898-899`).
- **system**: the loaded record (`m83:962`).
- **nature**: the identifier, never slug (`m83:957`).
- **valence**: short text known without running the leaf (`m83:899`).
- **PRIMER** trait: mode exports `primer`, grafted onto hallucination primer (`m83:904`, `m83:973`).
- **dock**: (implicit) the only reader of prose/markdown (`m83:73`, `m83:221`).

---

## m88 repling

### (a) status
- `m88:3` — DESIGNING 10-14. Stretch one (client modes · HOME · REPLING) LANDED via m86. Stretch two (hosted twin) a milestone, not built. Stretch three (LOOPING, loop closed) DESIGNED 10-16 — nine rulings, tangle, **no go asked**. 10-19 m91: stretch three repathed onto subject-first tree, dry replay 18/18; stretches one and two cite the PRE-m86 ghost (`lifecycle/` · `prototypes/` · `traits/`), as written.
- `m88:4` SUPERSEDED 10-16 (m86 s4-40): client traits ride `manifest.traits`; `ClientTraitsEnum` and top-level `traits` GONE from `instance.js` — hunks naming them are history.
- `m88:838` handoff: second repath 10-19 onto ghost `entities/` (`looping.js` imports `ReplSignal` from typology).

### (b) rulings (beef, verbatim)
- `m88:10` intent: /"REPLING trait on clients on mode to serve the repl as a mcp to the runtime/mode and the wiring to close the tool loop."/
- `m88:12` /"all of these have modes. time to setup client modes and traits."/
- `m88:23` /"... one trait HOME and one mode "home". ... repling is a export const repling = new Vector(); when a mode trait repling is in client, it gets its vector attached to terminal.repl. ... adjusting the ghost client to load home from HOME trait. HOME.reference. ... loading the terminal repl in coherence with mode. ... design this to be prettier than the ghost clietn rn. conoisseur levle"/
- `m88:53` /"HOME.reference - absolute."/ — `/client/ghost/mode/home/home` (hosted) or `/runtime/runtime/mode/home/home` (host mode); one grammar.
- `m88:54` /"home sets mode on new terminals. incl thread."/ — HOME enters EVERY new terminal.
- `m88:56` /"we dont rebuild the modes on repl change. terminal.repl is a function of terminal.mode/daemon,client.repl."/ → `terminal.repl(base)` returns `[mode.repling, base]` | `[base]`; first hit wins; client's `*` (bare line → `turn/send`) last. No `$repl` atom, no graft, no copy.
- `m88:57` m86 questions answered: rebuild — no, a function · verb source — mode's `repling` export · flat — yes, by precedence not merge. Repl EXECUTION is a PIPE (capturing · helping · streaming · killing · painting) whose ROOT EFFECT resolves `ctx.signal` over `ctx.repl` list; verbs (`runtime · entity · dock · key · quit · help · doctor · reports · records · yap`) move onto `client.repl`.
- `m88:862` stretch three intent: /"one thing that cannot happen right now is that the harness calls anything on the REPL. ... The REPL needs to be strip wired on the client, sent to the runtime, injected into the harness ... executed on the REPL ... Almost like the client is serving itself as an MCP. ... probably the multiplex, but we want to be implementation independent."/
- The dialogue `m88:845-856`:
  - Q0 trait = `LOOPING` /"looping"/; REJECTED REINED · POSSESSED /"so theatrical"/ · ARMED /"nothing to do with what we do"/ · COMMANDER (taken) (`m88:847`).
  - Q2 client has ONE aperture handed to `shard.transmitter.multiplex({ vector })`; `/terminal/:terminal/…` resolves terminal in middleware /"client has the aperture … resolve the terminal on the request in the middleware, just like you would in Express"/; graft-prune per terminal REJECTED (`m88:848`).
  - Q1 runtime PULLS strip over `ctx.socket` every harness call; no socket state/hash/ping; every repl verb → tool under `/repl` (`repl_mode_console_hello`) /"pulling it is still better ... C'est la vie."/ (`m88:849`).
  - Q3 `mode.looping(ctx)` one slot beside `ctx.mode.tools`; standalone runtime trait, not on aperture `/harness` (`m88:850`); suppliers-list refactor REJECTED.
  - Q4 request keeps `thread`; terminal ALWAYS sends `terminal`; loud on disagreement /"for sure we want the terminal ID on the dialog request"/; terminal-only REJECTED (`m88:851`).
  - Q5 looped tool call IS a Signal `nature · body · flags` /"nature body and flags is not something that is unique to the REPL signal. It is the basis for all signal. Input is something that's very specific."/ (`m88:852`).
  - Q6 result = verb's `output` /"output. not span"/ (`m88:853`).
  - Q7 ghost `LOOPING` trait grafts two routes onto `client.aperture` ONCE /"as soon as there's a mode looping, we attach that. Yeah, actually, I think I like B."/; `client/aperture.js` REJECTED /"aperture is a weird function there"/ (`m88:854`).
  - Q8 client-mode harness DEFERRED; no resident/persisted split (`m88:855`).
  - Q9 harness Request schematic in typology (`schematics/primitives/harness.js`); `id` → `turn` /"ID to turn"/; `input` stays /"call that input for now"/ (`m88:856`).

### (c) landed / designed / owed
- LANDED (via m86): client modes · HOME · REPLING (`m88:3`, `m88:838`). Note the stretch-one tangle (`m88:84-804`) is written against pre-m86 paths (`systems/ghost/lifecycle/…`, `prototypes/terminal.js`, `traits/mode/repling.js`) — what actually landed lives in m86's quest/tree (now `systems/ghost/client/…`, `entities/terminal/…`, `entities/mode/traits/…` per stretch-three paths `m88:1036-1119`).
- MILESTONE, not built: stretch two hosted twin — `@chess/board/play` under daemon AND client lends `repling` while its thread is seated; needs `owner` on remote `Mode` wire (`systems/runtime/entities/Mode.ts` only type·slug) (`m88:823`). Owed re-cut onto `entities/terminal/lifecycle/index.js` (`m88:841`).
- DESIGNED, no go asked: stretch three LOOPING (`m88:858-1215`); tangle order `m88:839`.
- OWED (`m88:841`): stretch two re-cut; `ctx.input` → `ctx.signal.body` (deferred, his); client-mode harness (deferred); stub cortex `tool_use` (COVERAGE GAP `m88:1158`); what a REPLING verb sees on ctx beyond `contexts.Repl`; hosted mode's `mountpoint` from client process.
- QA all pending: `m88:828-829` (T-home-hello, T-home-hides), `m88:1200-1201` (T-looping-whoami, P-request-schema).

### (d) open forks / questions
- `m88:841` "what a REPLING verb sees on ctx beyond `contexts.Repl`" — open.
- `m88:841` "a hosted mode's `mountpoint` from the client process" — open.
- `m88:1158` whether stub cortex emits `tool_use` — unknown.
- `m88:833` anima's door: `vite.config.mjs` wires `clients[anima]`, emits `register` as virtual module (m87 strand) — "anima's quest", deferred. **Directly an m95 item**: anima's boot under Solid needs a door that hands `die.register`.
- `m88:1207` `Vector.prune` allowed /"might be a reasonable prune"/, unneeded.
- `m88:1208` streaming verbs as tools deferred.

### (e) stale vs settled direction
- `m88:45` "the old anima: `systems/anima/src/client.js` · `vite.config.mjs:13` — no lifecycle; paladin mounts at vite config time and reads `clients[anima].statics` — that IS anima's door". `m88:82` "the same shape on anima: vite.config.mjs mounts paladin ... emits citizens as a virtual module the browser die reads as `die.register`" — SvelteKit/vite-era; m95 Solid anima needs equivalent door.
- `m88:1123-1135` tangle edits `systems/anima/src/app/panels/a/widgets/Dock.svelte:172` (`id` → `turn`) and `tests/dock/dock.mount.test.js:198` — **Svelte Dock widget**, stale under the Solid rewrite; the `id→turn` rename must land in whatever replaces Dock (and anima doesn't build today).
- `m88:721`, `m88:813` `shown(surface)` → `["crown", "navigation", "dock"]` — chrome panes asserted by the ghost client test; integration `shown` reads `terminal.thread` (no thread → crown · navigation · dock). Chrome names that m95 will re-cut.
- `m88:531` `if (ctx.view.interactive) client.repl.graft(commands.chrome)` — a `chrome` command set grafted only when interactive; `m88:364` `view: belt.view(die.surface)`; `m88:473-479` `painting` emits `"output"` on `ctx.view` unless painted — the repl→surface paint contract.
- `m88:534` `surface: tty(renderer, { credentials: await carrier() })` — tty surface over a renderer (OpenTUI presumably).
- `m88:41`, `m88:57` list `dock` and `key` as repl verbs (`commands/index.js`) — the `key` verb is pre-keymap-Vector (m92); m95 keymap Vector may supersede.
- Stretch-one paths (`systems/ghost/lifecycle/…`, `prototypes/client.js`, `prototypes/terminal.js`, `traits/mode/`) are pre-m86/m91 (`m88:3`).
- `m88:4` `ClientTraitsEnum` / top-level `traits` on Client gone (moved to `manifest.traits`) — `m88:203-211`, `m88:224-230` JSON snapshot are history.
- No mention of pincer, sheets, ink, View, belt.dock, Floor.

### (f) dependencies
- m86 (landed stretch one; supersedes traits shape, `m88:3-4`, `m88:57` "his three m86 questions").
- m87 bundled-artifacts — anima's door at build/bundle time (`m88:82`, `m88:833`).
- m91 subject-first repath (`m88:3`, `m88:838`).
- m89 telemetry — two socket frames per harness call first thing Span should show (`m88:1209`).
- m88 stretch three needs stretch two before a hosted mode can be looped on his ledger (`m88:824`, `m88:839`).

### (g) design nouns (m88)
- **client** — a HOST like runtime/daemon: `reference` `/client/<slug>`, `mountpoint` `<scope>/client_<slug>`, `modes` seated under it as `/mode/<type>/<slug>`, loaded through `registry.wire(mask)`; recipe says only `modes` (`m88:51`).
- **door** — the entry that wires paladin (ghost `lifecycle/shell.js` `ground()`; anima `vite.config.mjs` at build); lifecycle receives `die.register` (`m88:52`). Paladin never enters client typology.
- **HOME** — client trait; `HOME.reference` ABSOLUTE; a terminal with no thread sits in that mode; user's HOME over client's (`m88:53-54`, `m88:217`).
- **home mode** — `@commons/home/home`, `commons/modes/home/home.viva.js`, traits `[REPLING]`, `/hello` verb (`m88:98-120`).
- **terminal.$mode** — atom set by terminal lifecycle: thread's mode when seated, client's HOME otherwise; `terminal.mode` reads it (`m88:55`).
- **terminal.repl(base)** — function → `[mode.repling, base]` | `[base]` (`m88:56`, `m88:646-649`).
- **repl** — a LIST of vectors resolved by precedence (`m88:234`, `m88:280`); execution is a PIPE with root effect `resolving` (`m88:57`, `m88:482-498`).
- **client.repl** — verbs every terminal shares (`m88:68`, `m88:336`).
- **REPLING** — mode trait; travels with `repling` export (Vector); trait mints live Vector and grafts declaration (`m88:58`, `m88:779-781`).
- **LOOPING** — mode trait on both catalogs; runtime: `mode.looping(ctx)` pulls strip, grows tools under `/repl`; ghost: grafts `/terminal/:terminal/metadata/repl` + `/terminal/:terminal/repl` onto `client.aperture` once (`m88:891`, `m88:1009-1027`, `m88:1104-1118`).
- **client.aperture** — ONE aperture per client, handed to its multiplex (`m88:892`, `m88:1041-1050`).
- **strip** — `shape.strip` POJO of the repl (declaration: nature · input · output · valence); `grow` is its ana (`m88:890`, `m88:1030`).
- **Call** — `{ body, flags }`, a looped tool's input schema (`m88:908-911`).
- **harness Request** — `thread · terminal · turn · parts · tune · config · system · output · tools` (`m88:893`, `m88:913-923`).
- **seat / context** — trait catalog picked at the seat; stagger second arg named `context` (runtime's word) (`m88:59`, `m88:452-460`); later `stagger(mode, die, catalog)` in `host.js` (`m88:1079`).
- **chrome / crown / navigation / dock** — panes shown by ghost integration (`m88:721`, `m88:813`).

### (h) n/a (not a design briefing)


### appendix: m93-m94-m90-m91-m82

# notes — m93 · m94 · m90 · m91 · m82 (client relevance for m95 depincered client)

All paths relative to `.ikiro/`. `q/` = `quests/`, `d/` = `quests/done/`.

## (a) status lines

| quest | status | where |
|---|---|---|
| m93 kleisli remonadization | TANGLED 10-19, 14 locks, 31 files · 51 hunks · 14 new, replayed on a copy; NOT landed; next = go per milestone | q/m93-kleisli-remonadization.org:3 ; tangle q/m93-kleisli-remonadization.tangle.org:2 |
| m94 trait rejiggle | RULED 10-19 per entity; wiring measured; no code, no go; owns m91 milestone 5 | q/m94-trait-rejiggle.org:3 |
| m90 signal {nature, body, flags} | LANDED 10-13; 8 QA markers owed (pending) | d/m90-signal-nature-body-flags.org:3, :2112-2119 |
| m91 subject-object remodularization | DONE 10-19; milestones 1-4 · 6 landed; 5 → m94; 4 QA held | d/m91-subject-object-remodularization.org:3 |
| m82 runtime clients | phase one (bundle) CLOSED+LANDED 10-10; phase two (clients) designed, Loop → m86 | d/m82-runtime-clients.org:3, handoff :2922ff |

## m93 — kleisli remonadization (client-relevant)

Law (q/m93…org:61-69): a factory = `export function factory(input) { return monad.kleisli([...]) }` → `(parentDie) => Promise<die>`; hoisted `function` because of the import cycle at `systems/runtime/typology.js` (TDZ) (:63). The die's ONE contract is `controller` (:64). Lifetime = last arrow: `ready` (child under running parent, resolves at RUNNING) · `execute` (caller waits for end) (:65-66). Run's end = `controller.settled`; nothing holds `execution` (:68). Fan = `monad.traverse` (Promise.all); live list reconciled by hand (:69).

Rulings (verbatim, q/m93…org):
- VECTORS STAY: /"I would still want to use vectors and just use this kleisli as a composition feature."/ (:13)
- ONE VECTOR PER LIFECYCLE: /"We're not gonna split the vectors by lifecycle."/ (:14)
- Q0 home: `belt/monad.js` · `shape/factory.js` (:15)
- Q3 curried: /"I like curried"/ — `factory(input)(parentDie)`; `factory(input)` is a route effect (`ghost/shell/lifecycle.js:20`) (:17)
- Q5 THE DIE CASE BY CASE — ghost client: die IS `Client`; others: plain die holding the subject under its key (:19)
- Q7 failure not the factory's — before ready: `controlled` rejects; after ready: child's vector (`settle` → FAILED); child's death → controller tree (supervision deferred) (:21)
- Q8 reconcile by hand — `terminals` keeps its map + diff, boots via `factories.terminal` (:22)
- Q9 NO `execution` anywhere: /"I don't think you thought this through properly."/ → lock (:23)
- Q10 second run throws: /"If you put a finished car into the entrance of a factory … throw."/ (:24)
- Q12 GHOST LIGHTHOUSE STAYS SPLICED — a bracket inside the client's life (`client/lifecycle/index.js:100`); the one exception to m91 law 9 (:26)
- REJECTED: recovery arrows /"this whole error recovery thing is a bit stupid"/ (:34); `execution` on die/entity (:36); `shape.factory.reconcile` (:39)

Ghost terrain → after (q/m93…org:52-59): ghost client `client/factory.js:6` → kleisli·execute; ghost mode `client/lifecycle/index.js:48` → factories.mode; runtime/daemon host `:140` → factories.runtime/daemon·ready; terminal `:151` → factories.terminal·ready; thread `:190` → factories.thread·ready; lighthouse `:100` as is; repl `ghost/gestalten/shard/repl.js:12,41` as is; ghost shell `ghost/run.js:21` as is.

Tangle — ghost client hunks (q/m93…tangle.org:166-262): client factory becomes 3 arrows (build `new Client({controller: shellDie.controller.branch("client"), mask, register, instance, surface})` → `repl.graft(chrome)` → FAILED check) (tangle :180-200 region); hosts fan via `monad.traverse` replacing `.catch(... $status ERROR)` (tangle ~:221); terminals reconcile: `held.set(terminal.id, terminalProcess.factory(terminal)(clientDie))`, removal = `booting.then(d => d.controller.abort.abort("removed"))` (tangle ~:238-246); thread: `threadProcess.factory(row)({client, controller: active.controller, terminal: active})`, release aborts "thread unset" (tangle ~:258-259). New factories: entities/{daemon,mode,runtime,terminal,thread}/factory.js (tangle :262-430); `gestalten/shard/host.js` (:432), `shell/lifecycle.js` (:475).

Departures (tangle :6-17): #1 shell drops the client die (route effect return → ctx.output printed; die is a Client); #3 ghost host·terminal·thread ready = STARTED; #4 `host.js:5` status catches → `$status` ERROR → rethrow; #6 no `() => null` on removed terminal promise; #8 kleisli runs plain arrows in the caller's tick (console.test `/hello` unawaited, REPLING graft must land in-tick).

Owed (q/m93…org:158): his eyes on departures 1 · 2; QA T-host-faults-alone (/"I type viva repl, I see the client up; a failing daemon host faults alone, the client stays"/ :133) · T-kill-on-settled; COVERAGE GAP: no test boots a ghost terminal through reconcile and removes it (:129). Supervision → own quest (:140).

Dependencies: born in m91 Q4 (:3, :9); releases `factories` on `@vivalence/ghost` (+ terminal · thread · mode · daemon · runtime) (:149).

m95 impact: any new client chrome subject (keymap? surface?) must be built by a factory over `shape.factory`; client die = Client; terminals/threads already are child factories. Land order m93 vs m95 is an open question (m93 not landed).

## m94 — trait rejiggle (client-relevant)

Ruled set (q/m94…org:24-38). Client-relevant rows:
- Mode: ✓ EXPOSED HARNESSED TOOLING EMITTER DATASET AGENTIC GENERATIVE REPLING · ↻ APPLICATION (→ ARTIFACTUAL) · ⊕ ARTIFACTUAL FILESET FILESINK KEYMAPPED PRIMER LOOPING (:26)
- Terminal ✓ LABELED DOCKED (:30); User ✓ HOME THEMED DOCKED (:31); Client ✓ HOME · ⊕ DOCKED THEMED (:34); Buffer ✓ LABELED only (:29)
- Thread ✓ LABELED INTELLIGENT VOCAL · ? MASKED AIMED QUEUEING (:27)

Verbatim rulings:
- /"application is going to be replaced with artifactual at some point"/ (:44)
- /"keymap exists, primer exists, looping is going to exist"/ (:50); /"Generative exists, grappling [=repling] is coming"/ (:49)
- Terminal: /"Docked. […] I think we can set docked per terminal, that makes sense."/ (:57)
- User: /"User, home, f- themed. Docked, yeah, okay, sure, makes sense."/ (:58)
- Client: /"client, home, yes, makes sense. We might also want the docked and themed trait."/ (:62)
- Thread MASKED AIMED QUEUEING: /"maybe might be deprecated"/ (:53)
- Open sets: /"all of these sets should stay open"/ (:3, :360)
- REJECTED: Mode CLIENT /"No, I don't think we need even a client mode."/ (:78); Buffer PENDING… /"those are status, not traits"/ (:84); Buffer FILE /"old as fuck"/ (:85); Mode STANDALONE, CONVERSATIONAL etc. (:75-82)

Wiring facts the client depends on:
- catalogs per host: ghost `systems/ghost/entities/mode/lifecycle/index.js:20`; anima `systems/anima/src/entities/mode/dossier.js:32` (anima does not build) (:157)
- APPLICATION readers incl. ghost `terminal/commands/application/start.js:7` · ghost `surface/chrome/panes/frame.jsx:7` · anima `Modes.svelte:42` (:181)
- HARNESSED readers: ghost `gestalten/shard/repl.js:22`; anima a.svelte/Harness/Thread/Dock.svelte (:183)
- REPLING: catalog ghost `systems/ghost/entities/mode/traits/repling.js:1`; NOT in the enum; mode repl commands mounted under `/mode/<type>/<slug>` in the client's command line; read `gestalten/shard/repl.js:17,27` (:177, :193)
- KEYMAPPED owed at `m92-keymap.org:78-79,153`: export `keymap`; runtime mounts `/metadata/keymap` = `shape.strip(mode.module.keymap)`; ghost wires into `mode.keymap` (:203)
- LOOPING owed `m88-repling.org:1021,1109`: ghost grafts `/terminal/:terminal` onto `client.aperture` once (:205)
- ARTIFACTUAL owed `m87-buffer-view-file.org:69`: `mode.buffer()` a frame buffer over `module.artifacts`; succeeds APPLICATION (:200)
- Terminal DOCKED payload `{side, share, collapsed, full}` untyped; written only by anima `terminal/prototype.js:55-63`; terminal wins over user (`prototype.js:82` `terminal.trait.DOCKED ?? user?.trait?.DOCKED`); runtime stores, never reads; test title `anima/tests/terminals.remote.test.js:112` contradicts (:242-245)
- Terminal LABELED `{name}` read by anima + ghost `terminal/prototype.js:29` (:241)
- User THEMED `{theme}` — no writer anywhere; read anima `app/+page.svelte:76` via `?.` (:254)
- Client (ghost) HOME catalog `systems/ghost/client/traits/home.js:5-28` run at `client/lifecycle/index.js:169-170`; seats each new threadless terminal on a thread in the HOME mode; user's HOME wins (:275, :257)
- Client DOCKED · THEMED owed: ghost paints hardcoded `tokens("northsea", "2")` (`systems/ghost/surface/chrome/index.js:24`); the dock is a `/chrome` toggle (`systems/ghost/client/commands/chrome.js:8`), never persisted; `ClientTrait` admits only HOME (:277)
- Thread MASKED/AIMED/QUEUEING read only by anima (Buffers.svelte, Thread.svelte…), runtime reads none (:221-223)
- Buffer LABELED read by ghost `systems/ghost/entities/buffer.js:37` + anima (:233)

Open (deferred, :340-349): 3 Thread MASKED·AIMED·QUEUEING deprecate? (read only by anima, which does not build); 8 defects incl. DOCKED test title, THEMED no writer.

m95 impact: the depincered chrome must decide where DOCKED/THEMED live on the client (Client ⊕ DOCKED THEMED owed; Terminal DOCKED is per terminal; User THEMED/DOCKED defaults). Dock state persisted as Terminal.trait.DOCKED (m76 ruling at `d/m76-terminals-close-the-dataring.org:179`). AIMED/MASKED/QUEUEING are anima-Svelte residue.

## m90 — signal (client-relevant)

Law (d/m90…org:22-30): Signal = `{nature, body, flags}`; body & flags on the ROOT; derivatives only coerce; argv body ALWAYS an array; `{…}`/`[…]` positional JSON-parsed in place.

Client-relevant rulings (d/m90…org:212-225):
- `ReplSignal extends Argv`, keeps its name — /"inherit if ti makes sense."/ (:220)
- REPL's event and key rows CUT — /"The repl's event and key row arent real. cut key. cut event. mark as dead. note."/; callers dispatch LINES: browser dock drag/snap (`subsystems/drapes/dom/chassis.jsx:45-54`, `/dock/share 0.32` · `/dock/collapse true`) and TUI keypresses (`systems/ghost/chrome/surface.js:32`, `/key/ctrl-b`) (:220). Rule: "dispatch a line, never an object" (release :2146).
- `dock/full` · `dock/collapse` read `String(body[0]) === "true"` (:220)
- a miss is a verb: `traverse` falls back to nearest ancestor's `*`; repl's `*` is `yap`; `yap` refuses non-`*` nature; `client.dispatch` drops its try/catch (:224)
- `--help` is a flag read by a root middleware (`helping`) beside each execution; help verb dies — /"help verb dies. yes."/ (:225); repl `/--help` · `/dock --help` lists rows; `/typo` refused `no such verb — /--help` (:234-235)
- socket push receiver: `ctx.input = body[0]` (:20, :221)
- line grammar: `"/dock/side left --json"` → nature /dock/side, body ["left"], flags {json}; `"ciao come stai"` → nature `/*`, body `[{type:"text",text}]` (:38-39)

QA owed, client (d/m90…org:2116-2119): T-repl-verb (/"in the repl I type dock side left, the dock moves left — never a turn"/), T-repl-yap, T-dock-drag (browser drag handle → collapse), T-chord (TUI dock chord `systems/ghost/commands/key/`).
Deferred (:2121-2126): `ctx.input → ctx.body` (own quest); frame `Open` packet keeps signal·query·input.
Owed: codemap rewrites typology.md/ghost.md (:2160).

Stale vs settled direction: paths `systems/ghost/chrome/surface.js`, `systems/ghost/commands/dock/*`, `systems/ghost/commands/key/`, `systems/ghost/lifecycle/{shell,repl}.js` are pre-m91 (now `surface/chrome/`, `client/commands/`, `shell/lifecycle.js`). Dock verbs `/dock/{side,share,collapse,full}` and `/key/ctrl-b` lines are the current keymap-ish mechanism (m92 keymap Vector supersedes `/key/*` lines?). `chassis.jsx` is drapes `./dom` (red per map).

## m91 — subject-object remodularization (client-relevant)

Law (d/m91…org:52-63): 1 a subject runs and owns a directory; 2 `<subject>/{prototype.js, factory.js, lifecycle/, traits/, commands/, apertures/}`; 5 typology export predicative (`factories.mode` · `traits.mode.DATASET`); 6 lifecycle exported for tests, never imported in use; 9 factory `(parentDie, …) → childDie`; 10 subjecthood per system: /"a terminal is a persistent and displayed function of thread."/ — terminal is entity in runtime, SUBJECT in ghost (:47, :63).

Client-relevant rulings (d/m91…org:35-50):
- Q5 the surface: /"chrome stays largely as is."/ · /"move chrome up one level as sibling of client"/ (10-19) → `systems/ghost/surface/` whole, beside `client/`; two owners (shell · client); the factory's one argument; NOT a subject (:46, tree :396-398)
- Q1 /"the lifecycle exports factories […] in use we never ever import lifecycles"/ (:14, :42)
- REJECTED: `process` as name · object-first systems · `app/` beside `typology/` · `executions/` · `skills` · exporting lifecycles in use (:50)

Ghost tree landed (d/m91…org:326-414): `shell/lifecycle.js`; `client/{index,prototype,factory,chrome,lifecycle/index,traits/{index,home},commands/{index,help,quit}}.js`; `surface/{index,repl}.js` + `surface/chrome/` (20 files incl. host/ out/ panes/ views/), untouched; `entities/{activity,buffer,turn}.js` + `entities/{terminal,thread,mode,lighthouse,daemon,runtime}/` (index · prototype · lifecycle; terminal/commands/{turn, application/{start,stop}, mode/{list,pick}}; mode/traits/{application,exposed,harnessed,repling}; lighthouse/traits/{autologin,invitational,joinable}).

Anima tree landed (d/m91…org:416-468): `src/{daemon,mode,thread,terminal,box,bridge}/` subjects, `lighthouse.js`, `entities/`, `prototypes/`, `gestalten/`, `typology.js`; `app/` as is "= anima's `surface/` on the day it moves" (:417); bridge holds `dock.js geometry.js gesture.js panes.js start.js` (:458) — gesture.js = pincer residue; forks A1-A4 (:469-474): A1 terminal dir ✓, A2 ModeDossier split ✓, A3 keep `stores` namespace, A4 no dossier rename (line :416 says all ruled).

Found, not changed (d/m91…org:589-593): `@vivalence/ghost` now pulls `surface/chrome` (opentui ×12 · solid-js ×6) through `lifecycle.shell`; still paladin-free. Handoff owed: whether `@vivalence/ghost` should carry the chrome stack (:670).
Regression note (:584): milestone-3 dropped ghost's flat `export { belt, shard }`; its one importer `subsystems/drapes/dom/chassis.jsx:3` broke drapes dom suites; restored at `systems/ghost/typology.js:12`. Lesson: blast greps must include .jsx (/no --include=/).
Deferred (:616-620): anima waits on its build; the algebra → m93.

m95 impact: new chrome lives at `systems/ghost/surface/` (sibling of client, NOT a subject) unless m95 re-rules; keymap would be a subject's `commands/`/`traits/` or a Vector graft; anima on Solid should mirror ghost's subject layout. Open: should `@vivalence/ghost` export carry chrome (anima imports ghost per m82 strand V → must not drag OpenTUI).

## m82 — runtime clients (client-relevant; OLDEST, much superseded)

Strands (d/m82…org:9-34), client-load-bearing:
- G/N: /"opentui instead of ink. no ink. opentui/solid for ghost. react and solid as standard targets across ghost and anima. well move anima to solid eventually."/ (:24)
- O/Q11: /"we dont reuse apps across render targets. lets keep it simple."/ (:25, :2865)
- S: /"both clients should implement the same layout logic. We might do away with a pincer, I'm not yet sure."/ (:29)
- T: /"the way that we will conceptualize our client should be the same way that we have in the runtime … I like the idea of boot vectors."/ · /"I had to force that into the structure of Svelte and that was very limiting"/ (:30)
- U: rings are narrative, not code (:31)
- V: /"ghost it gets imported by Anima and Ghost exports a typology at vivalence slash ghost …"/ · /"Anima is solid and Ghost is basically the vector that it is right now"/ (:32)
- W: /"maybe we still have the pincer in anima and no pincer in a … standard chatbot coding agent management framework on the TTY side"/ (:33)
- Z (synthesis): /"a REPL that has chat built in. So like Emacs is a client built into the Lisp REPL."/ · /"spacemacs"/ · /"I really like the REPL paradigm. Fuck yes."/ (:1036, :1073, :1257)
- LAW: /"We don't ever, ever, ever want Paladin inside of typology."/ — `@vivalence/ghost` root paladin-free (:2928 handoff)

Bundle design LANDED (d/m82…org:163-317): a buffer carries ONE bundle, one entry per mime, client NEGOTIATES (`bundle.negotiate(accept)` / `load(accept)`); mime = `application/vnd.vivalence.<target>.<framework>+javascript`, targets `dom` · `tty` (Q13 /"dom and tty."/ :2867); floor = `mime.json` → buffer.data generic renderer (:250, :399); mount contract `(target: HTMLElement | renderer: CliRenderer, props) → { destroy }` (:247-248); `View` dies, folded into Bundle (:256; Q6 :2860). Ghost accept `[tty.solid, tty.react, markdown, plain]`; anima `[dom.svelte, dom.solid, dom.react, dom.html, markdown, plain]` (:394-397). Mount gains `dispatch: client.dispatch` prop (:1255).
OpenTUI under Deno: deno-ffi stand-in + module-worker preload + solid-js → dist/solid.js + install.sh patch (Q12, pinned exact 0.5.17) (:449-472, :2866). Solid needs babel-preset-solid via paladin bundler; Deno JSX not reactive (4/15) (:461, :549).

Synthesis — the Loop (d/m82…org:1034-1301) [moved to m86, then m88]: die with `loop` (Vector) + `queue` (typology Queue), REPL = root effect draining queue; `capturing` middleware for errors (Q18 :2872); span per form; packets on a Pipe folded into `live`; session atoms `$seat $live $echo $slot $chord` (:1050); Emacs map (:1052-1064): minibuffer = `$slot`, mode line = the crown, M-x = trie census; Spacemacs map (:1259-1267): leader `/` or SPC, which-key = slot lists children, `,` = seated mode's leader, a layer = EXPOSED strip + APPLICATION keys grafted on seat, C-g = esc drops partial chord. `steer.trie.at` owed (:1282). Mode keys via `application.keys` → `/key/<slug>` (:1243-1252).

Demo (d/m82…org:1303-1497): five screens × two targets — boot · signin · chat (crown `✦ <instance> · <user> · <host> › <mode> · ● streaming`; stage = transcript · live turn · composer; spine left rail terminals→modes→threads; tty spine 24 cols, tabs under 100 cols) · buffer (frame beside dock) · navigation (:1311-1317). Pincer PARKED: pane verbs `tap · solo · remove` ride a strip and keys on both targets (:1319, :992). Themes: dapper's four, tty reads same token values as flat object; `sheets/theme.js` 16-colour dies (:1321). Three ways ghost: cut · captured · chrome (:1432-1436). Kit law: `@vivalence/drapes/{dom,tty,svelte,state}` keyed by TARGET never consumer; sheets retires into drapes/tty (:1440-1451); REJECTED `drapes/solid` (:1451). Anima chrome Solid; SvelteKit leaves (plain vite, index.html, 200.html dies) (:1459). Burn: 6 milestones (:1480-1491).

Q list (d/m82…org:2852-2873):
- Q1 client noun for a mount → fell out as `Host` (handoff :2930)
- Q2 `Terminal.daemon` dies (:2930)
- Q3 one root wired per host (:2930)
- Q4 dead links cut (:2930)
- Q5 beside, in systems/ghost/ (:2930)
- Q6-Q14 RULED (bundle); Q15 home mode → test dummy `commons/modes/home/home.viva.js` (:2931); Q16 how client RECORD reaches a browser (`PUBLIC_VIVA_CLIENT_HOME` env vs `/metadata/clients`) — NOT answered here; Q17 `contexts.client` word list — not answered here (partly in synthesis :1068); Q18 RULED.

Owed (handoff :2934): per-mime contract test · ghost deno.json over served entry · deno-ffi pointer lifetime · stage 1b → m86; ghost credentials carrier; demo milestones 3-6 → m86.

## (d) open forks / unanswered (consolidated)

- m93: land? (go per milestone); departures 1·2 need his eyes; supervision quest (q/m93…org:158, :140)
- m94 deferred 3: Thread MASKED·AIMED·QUEUEING deprecate (anima-only) (q/m94…org:344); Client DOCKED·THEMED design (owed :277); THEMED has no writer (:349)
- m91: should `@vivalence/ghost` carry the chrome stack (d/m91…org:670); paladin/instance barrels without importer
- m82: Q16 client record to browser; Q17 contexts.client; pincer return /"might do away with a pincer"/ (now settled: dropped); `vite-plugin-solid` under Deno NOT probed (d/m82…org:1496); `steer.trie.at` owed (:1282); steer precedence law (mode layer after `(.*)` loses) (:1297)
- m90: ctx.input → ctx.body own quest (d/m90…org:2123)

## (e) stale assumptions vs settled direction

| item | where | stale how |
|---|---|---|
| ink | d/m82…org:17, :23, :478-480 | killed by Q10 10-10 |
| sheets as TUI kit / ported | d/m82…org:474-476, :592 | sheets DEAD (map 10-19); m82 itself retired it into drapes/tty (:1449) |
| `View` | d/m82…org:172, :256 | folded into Bundle (landed); map says `View` left typology, anima build broken by it |
| SvelteKit / `+layout.svelte` / a.svelte / Dock.svelte / Frame.svelte | d/m82…org:171, :392-395, :994; m94 readers :181-183, :213-224 | anima → Solid; these files are the old anima |
| `mime.dom.svelte` row "stays until anima moves" | d/m82…org:2894 | still needed for mode apps (hello-world/chess/assembly) per :1451 — not client chrome |
| pincer "PARKED" / anima keeps gesture | d/m82…org:992, :1319, :33; anima `bridge/gesture.js` d/m91…org:458 | settled: dropped |
| `chassis.jsx` belt import / drapes dom | d/m90…org:220 (dock drag lines), d/m91…org:584 | drapes ./dom red: `chassis.jsx:3` belt.dock; ghost belt = harness only |
| Loop die `systems/ghost/client.js` · `lifecycle/client/*.js` · `trajectories/` · `targets/tty/` | d/m82…org:1086-1170, :1367, :1407, :1424 | pre-m86/m91 paths; now client/ + surface/ |
| ReplSignal event/key rows | d/m82…org:1185-1204 | cut by m90 (d/m90…org:220) |
| `/key/<chord>` dispatch lines, `/key/<slug>` app keys | d/m82…org:1250-1255; d/m90…org:220 | m92 keymap Vector + KEYMAPPED trait (m94 :203) supersede |
| m90 ghost paths `chrome/surface.js`, `commands/dock/*`, `lifecycle/{shell,repl}.js` | d/m90…org:220, :853-921, :1347-1381 | pre-m91 tree |
| `execution` export per subject | d/m82…org:1100; d/m91 tree | m93 Q9 kills `execution`; factories only |
| Floor (`mime.json` floor) | d/m82…org:250, :399 | "Floor" also used elsewhere as a layout noun; check m95 |
| APPLICATION trait | m94 :44 | → ARTIFACTUAL (m87) |
| Thread AIMED/MASKED/QUEUEING | m94 :27, :344 | maybe deprecated; anima-only |
| hardcoded `tokens("northsea", "2")` | m94 :277; codestyle | Client THEMED owed |

## (f) dependencies

- m93 ← m91 Q4 (q/m93…org:3); m93 tangle repathed in m91 milestone 6 (d/m91…org:582)
- m94 ← m91 milestone 5 (q/m94…org:3); → m87 (ARTIFACTUAL·FILESET·FILESINK :200-202), m92 (KEYMAPPED :203), m83 (PRIMER :204), m88 (LOOPING :205), m76 (DOCKED/THEMED ruled :242, :254), m80 (Note :338), m84 (:338), m68 (openness :154), m61 (:122)
- m90 ← m86 rebuild (d/m90…org:113); feeds m79 grammar
- m91 → m93 (:44, :619), m94 (:3), m83 · m87 · m88 · m93 repathed (:582)
- m82 ← m79 (benched/discarded: credentials, three ways, sigil F16, comp `Ghost Shell.dc.html`) (d/m82…org:1307), m80, m81 (C1-C5 :2841-2850); → m86 (Loop, T-home, demo milestones 3-6) (:2932-2934); reference `reference/m82-clients-compendium.md` (:2931)

## (g) design nouns — locked meaning

| noun | meaning | where |
|---|---|---|
| subject | runs and owns a directory | d/m91…org:44, :54 |
| surface | ghost's chrome dir, sibling of client, two owners (shell·client), NOT a subject, factory's one arg | d/m91…org:46, :396 |
| terminal | ghost subject; "a persistent and displayed function of thread"; entity in runtime | d/m91…org:47, :63 |
| die | bag whose one contract is `controller`; ghost client die IS Client | q/m93…org:19, :64 |
| factory | `factory(input)(parentDie) → Promise<die>`, kleisli over arrows | q/m93…org:17, :63 |
| target | `dom` · `tty` — the abstraction a module mounts into | d/m82…org:199-208, :2867 |
| bundle / entry / mime | one bundle per buffer/mode, one entry per mime, negotiated by accept | d/m82…org:165, :254-312 |
| floor | `mime.json` generic renderer over buffer.data | d/m82…org:250, :399 |
| Loop | die + loop Vector + queue + drain (whole, not a class) | d/m82…org:1073, :1301 |
| ReplSignal | the REPL reader; extends Argv | d/m82…org:1209; d/m90…org:220 |
| Argv | ghost Signal subclass parsing unix input | d/m90…org:27, :217 |
| slot (minibuffer) | what the last command painted | d/m82…org:1061 |
| crown (mode line) | top row: instance · user · host › mode · status | d/m82…org:1063, :1315 |
| spine / stage | left rail terminals→modes→threads / transcript·live·composer | d/m82…org:1315 |
| leader / which-key / layer | `/`(SPC) opens trie path; slot lists children; mode's EXPOSED strip + keys grafted on seat | d/m82…org:1259-1267 |
| cut · captured · chrome | three ghost ways: one-off inline · inline ongoing · fullscreen | d/m82…org:1432-1436 |
| kit | keyed by TARGET (`drapes/dom`, `drapes/tty`), never consumer | d/m82…org:1451 |
| home | user.trait.HOME › client HOME; seats new threadless terminal | q/m94…org:257, :275 |
| DOCKED | `{side, share, collapsed, full}` per terminal, user default | q/m94…org:242-245 |
| REPLING | mode repl commands under `/mode/<type>/<slug>` | q/m94…org:193 |
| KEYMAPPED | mode export `keymap`, `/metadata/keymap` = strip | q/m94…org:203 |
| application → artifactual | mode UI bundle; succeeded by ARTIFACTUAL | q/m94…org:44, :200 |
| host | `/runtime/<slug>` · `/daemon/<slug>` (m81); taken as a word | d/m82…org:208 |

## (h) not a design briefing — n/a


### appendix: older

# older quests: client-relevant notes for m95 "depincered client"

Paths are relative to `.ikiro/`. Q = `quests/`. All reads were read-only.

---

## 0. Index and frontier drift (found while reading)

- `Q/index.md:7` still lists `m79-terminal-ghost.org` as a live quest ("TANGLED 10-05"). On disk it sits in `Q/discarded/`. `Q/frontier.md:15` says "`m79-terminal-ghost` · `m85-tauri-clients` (empty) — beef rules". Both are stale against the `mv`.
- `Q/index.md:189` says m56 had "nothing landed". The file's own header says "*M1 + M2 LANDED* (green, uncommitted)" (`Q/discarded/m56-the-pincer-turns.org:3`). m73 patch 5 then killed m56 M2's engine (see §8).
- `Q/frontier.md:12`: m89 is "DESIGNED 10-12; re-cut onto m86's tree first". `Q/frontier.md:13`: m84 is "next: beef rules D1–D6, then the M1 rework".

---

## 1. m85 tauri clients: `Q/benched/m85-tauri-clients.org`

- (a) The file is **0 bytes**, mtime Oct 12 17:04. Confirmed empty. `Q/index.md:9`: "beef's, empty file 10-10". Its only status is `Q/frontier.md:15`, "beef rules".
- (c)–(h) Nothing. The name implies Tauri-wrapped clients (desktop shells around anima and/or ghost). No ruling, no content.

---

## 2. m79 terminal ghost: `Q/discarded/m79-terminal-ghost.org` (367KB, 4700+ lines)

### (a) Status
- `:3` "RE-TANGLED TO THE COMP, PASS 2 10-06". Six earlier `(was)` status lines run DESIGNED 10-04 → TANGLED → PROVEN IN SANDBOX → CONNOISSEUR 10-05 (`:4-9`). Phase `design (derived)`, progress 0/29 (`:10-11`).
- Filetags include `:sheets:` (`:2`). The quest was built on `subsystems/sheets` (ink), which is now DEAD.

### Why it was discarded (beef, on walking the prototype 10-07): `:4249`
- /"this is interesting technically but completely nonesensical from a use perspective. makes no sense yet."/
- /"there is now a 1:1 match between client and runtimes. no more lighthouses. we get straight into the runtime when we start ghost. a terminal. a thread without a mode daemon or anything yet. but we can start typing and the runtime harness will string us along. we use the same tools inline manual /mode/set <reference> that the harness uses. harness and ghost can start / stop anima. i can navigate daemons."/
- /"rework the testament ghost to be a rich interactive demonstration and case study for what the client anima should/ could be."/
- `:4251-4253`: the prototype `testament/prototypes/ghost/` was reworked onto m80's nouns (`Q/done/m80-lighthouseless.org` `* the entity map`). The file lists what is STALE against m80: the boot gate (lighthouse/daemons rows, SignIn), `session.seat` minting a new thread per mode (m80: `Thread.mode` m:1 nullable, so the ONE thread moves), the `Lighthouse`/`Terminals` client classes, `HOMED` home-as-a-mode, and the comp's daemon picker. The prototype README holds "the anima case study (eight points)" plus open questions: child thread per mode · daemon-level harness · buffer per mode · the new tool names.

### What survived (pulled elsewhere)
- Credentials: `Q/done/m82-runtime-clients.org:1307` says it was "Pulled from the benched quest … beef's rulings there stand". It keeps `VIVA_CLIENT_GHOST_CREDENTIALS_FILE`, default `<ledger>/credentials.json`, "many lighthouses" (m82 `:1356` = m79 deliverable a).
- The argv row on typology `Signal` (`new Signal(argv)`): m82 `:1209` says it is "proposed there, NOT landed".
- F15 (a mode's doors under `/command/<slug>`) and F17 (mode contribution to the client) are cited as design input in m82 (`:572`, `:1058`). m82 `:1263` uses "which-key = the slot lists the current node's children, from the trie's own census (m79: a bare noun lists its own children)".
- The two references it wrote, `reference/tui.md` and `reference/ghost-architecture-comparison.md` (`:4691` handoff), are still in the tree.

### (b) Client rulings (beef, verbatim)
- Render ladder 10-05 (`:28`): /"we have. execution where we run and done. in the execution we can elevate. … interactive component - ctx head stays inside the effect. chrome - where we render our UI but stay in the effect. and shell where we drop the ctx / head back from the effect and expect it to continue to run."/ · /"chrome and render are realy the same thing, only different screen covering mechanism? or rather, inline vs fullscreen?"/
- F12 RULED 10-06 (`:229`): /"captured is interactive ongoing but still inline. chrome is fullscreen captured ongoing."/ This became the law "cut · captured · chrome" (`:201-215`).
- `:32` buffers and terminals: /"i want to give buffers controllers. we want stdin/out etc on buffers. same controller as elsewhere. buffer hooks stay on buffer."/ · /"a terminal (entity in lighthouse and container in anima) exists to render buffers and docks. thats what we will do on ghost as well."/ · "only ever one buffer per cli … yes".
- `:34`: /"we dont start with rendering mode buffers tho. that comes later. i want to start with chat and the harness."/
- `:181` paths: /"the clients dont compose the paths. runtime does. and the runtime only offers calling on daemon level."/ The law: the client speaks only through a `Connection`.
- F9 RULED (`:226`): /"ghost as the root of all clients. … lets go with ghost as source."/ Anima's client structures move to `@vivalence/ghost/client`, a seam that is paladin-free and Deno-free. This still matches the settled direction (ghost/client is the shared root).
- F4 RULED: /"home is an identity trait."/ (`:223`). Stale now: m86 says /"cut home home."/ (see m84 §3).
- Chrome as customisable (`:4338`): /"we might want to be able to render different chrome in the effects no? repo provides, but other components/modes can supply their own."/ · /"i guess chrome might be how we name the custom interactive fullscreen components."/
- F17 widened 10-06 (`:240`, `:4660`): /"that might be one trait. but i am thinking broader than this. customize keybindings, colors, harnesses, whatever"/, then parked: /"we dont need that now. start withuot."/ Its noun (`helm`/`HELMED`) is beef's to name.
- F21 RULED 10-06 (`:244`): a session verb typed outside a session boots the session, then runs. From the handoff doc: /"It never prints 'needs the shell'"/.
- Comp port (`:289`): /"the design env doesnt really to tty very well. so i need to move here."/
- Two channels for modes into ghost (`:4359`): /"we will wire mode into the ghost both via runtime/daemon and directly with specific capabilities offered via mode traits specifically to aide ghost."/

### (c) Landed / designed / owed
- LANDED in the repo: nothing ("The repo is untouched", `:4691`). Only the testament prototype exists.
- The release lines drafted at `:4673-4689` never landed: Signal argv · `ShellSignal` removed · `steer.match.feed` precedence · `Ambiguous` · sheets `emit·render·shell` · `Response.stream` cancel · `runtime.statics.launch` · `@commons/lighthouse/localhost`.

### (d) Open forks (all moot or stale, but they are design input)
Source: the `:217-244` table.
- F16, the dock's grammar (`:239`). Bare text = a TURN and a sigil `/` opens the trajectory (lean), versus commands winning. Reason given: /"play e4 typed to a tutor must not reseat on chess, help me must not run help"/. Relevant to "everything via the REPL".
- F17, the mode-contributes-to-client trait. Strip `/keys · /palette · /turn · /sheet · /hints`, layered ghost < domain < mode < operator (`:4660`). This anticipates the keymap Vector.
- F18, a wire version (`/metadata/manifest` `version` + an integer wire level, after Neovim's `api_level`). OWED.
- F20, bare `viva` = the session versus help. OWED.
- F22, bare `use·new·close` aliases. OWED, leaning to the noun form.
- F8, the third yap option "open as turn". QUESTIONED.
- F10, `BufferControl` → typology `Controller`. QUESTIONED.
- F11, ghost's Terminal row per session. OWED.

### (e) Stale against the settled direction
- `ink` everywhere (sheets `mod.jsx`, `Static`, `TextInput`, `useInput`), measured on `ink@5.2.1` (`:340-345`). Stale: OpenTUI + Solid now.
- Stale: `subsystems/sheets` as the kit (deliverables g, j) and `sheets/theme.js` 16 ANSI names (`:4352`).
- The lighthouse is everywhere: `Lighthouse(connection)`, credentials keyed by lighthouse origin, `@commons/lighthouse/localhost`. m80 is lighthouseless.
- Stale: `HOMED` / `identity.trait.home`.
- The anima bones and the pincer are used as the chrome vocabulary map (`:4342-4350`). The "pincer = a key that opens the trajectory as a picker over census, the palette (Emacs M-x · tmux prefix)" line is QUESTIONED. This is the one place where the pincer becomes a key, and it maps naturally onto a leader/palette key in the depincered client.

### (f) Dependencies
m76 (terminal moved to lighthouse) · m7x (runtime vectorized) · m60 (signup, identity traits) · m78 · m80 (supersedes it) · m82 (pulled credentials) · m18 (`conversation.js` dead).

### (g) Design nouns (as locked or proposed here)
- **cut** = inline, one-off · **captured** = inline, ongoing · **chrome** = fullscreen, captured, ongoing. RULED F12 (`:229`, law `:201-215`).
- **terminal**: /"a terminal … exists to render buffers and docks"/ (`:32`).
- **chrome slots** (`:4342-4350`). All QUESTIONED except LIVE ones:
  - crown = status row
  - stage = seated buffer
  - slot = where a typed command paints
  - shoulder = echo area
  - prompt
  - hints = which-key line
  - pincer = picker key
- **The comp's faces** (`:293-300`), `Ghost Shell.dc.html`. Status row `✦ <instance> · <identity> · <daemon> › [<type>/]<mode> …`; turns use the mode slug, never "assistant"; spine = 24-col guided form terminal → mode → thread; tabs under 100 cols; stage = `<mode> · buffer #i of n · ACTIVE`; leave line.
- **The comp's key table** (`:328-337`). ⏎ send · esc leave or → captured · ctrl-c stop, twice leaves · ctrl-f chrome toggle · ctrl-t terminal step · ctrl-o mode step (QUESTIONED; ctrl-m is ⏎ in terminals) · j/k move · n/x new/close.
- **Terminal constraints measured** (`:340-345`): F12 never reaches the program, ctrl-m == ⏎, and the chrome is `rows−1` tall. That was under ink. Re-measure under OpenTUI.
- **Comp palette verbatim** (`:316-322`): northsea/parchment truecolor roles d·b·a·m·g·ok·warn·bad·p·inv.
- **What the design wants and the system lacks** (`:347-353`): a TUI view kind for a buffer; per-daemon health pips; a terminal LABELED trait; `thread/clear`; ctrl-b buffer cycling.

---

## 3. m84 harness runtime: `Q/roadmap/m84-harness-runtime.org`

### (a) Status
- `:3` "SCAFFOLDED 10-10 from m81". Next is the harness map and then the M1 rework.
- The M1 tangle is STALE 10-09 (`:120`, /"you did not fucking rewrite the tangle last session and this is causing massive issues!"/).

### (b) Rulings
All of these are cited into m81 (`:14-27`):
- The home is a POINTER: `user.trait.HOME` › `instance.clients[].home`, and **the client resolves** it (m82).
- Tools are IMPORTED by a mode (R2).
- A `RUNTIME` trait (R1).
- A handoff writes `thread.mode` (R5).
- "drill me" switches the mode and wakes the new one (F9).
- Also: /"no ctx.host. nope never."/ (`:120`).

### (c) Landed / designed / owed
- Nothing tangled lands.
- The harness map (owners × faces tools/primer) is proposed (`:37-116`), forks D1–D6 QUESTIONED (`:108-114`).
- 10-12 (`:898`): /"cut home home."/ removed `commons/modes/home/`, and `@commons/home/home` left `ledger.viva.json`, including **both clients' `home`**. The home has no file and no seat now.

### Client-relevant items
- `:865` (deferred) "M3 anima: the Dock on a thread with no mode — the client enters it into the home mode … `/metadata/modes` lists the runtime's modes beside `/metadata/daemons`."
- `:867`: "a switch armed inside a mode ('take me home') — a client command until asked." That puts the switch on the client REPL.
- `:899` never: "a thread-mode write as the wake trigger (a client remode writes `Thread.mode` too, `systems/anima/src/app/panels/c/cards/threads.js:19`)". That cite points at an old anima path.
- Tool `terminal_find` (`:595-612`) reads `ctx.entities.terminal` on the runtime, with rows id/index/thread/traits. `terminal_aim` (writes `Terminal.thread`) is deferred (`:864`). `WITHHELD = ["user","terminal","daemon","activity"]` (`:369`).

### (e) Stale
- The STALE tangle; the home mode is cut.
- **Contradiction to flag**: m55 RULED "no terminal entity on runtime" (§5). m80/m81/m84 later put a Terminal entity on the runtime ("terminals per client", `terminal_find`). Which ruling wins is a question for m95.

### (f) Dependencies
m81 · m82 · m83 (skills→tools, system→primer first) · m86 (milestone two, the chat mode) · m80 · m60.

---

## 4. m89 telemetry: `Q/roadmap/m89-telemetry.org`

### (a) Status
- `:3` "DESIGNED 10-12 — research (opus) and design-to-tangle (fable) landed; ten forks F1–F10 open; implementation on beef's go. Runs parallel to m86; m86's final depends on it."
- `Q/frontier.md:12` says to re-cut it onto m86's tree first.

### (b) Rulings (intent `:8-13`)
- /"telemetry we call it. not logging!"/
- /"telemetry must also match with our snapshot system. those are two sides of the same coin."/
- /"surfaces and pipes for paladin and anima (distinct two consumers but same abstraction and integration), and application into both runtime, ghost and anima. all via controller. big."/

### Law (`:15-21`)
One emitter (`Controller.stdout`); surfaces and pipes subscribe; never "logging".

### (c) Client design (proposed, not landed)
- Anima IS ghost's die over the dom, so anima's telemetry surface "rides the SAME controller as ghost's client, distinct only by surface (dom vs tty)" (`:438`, `:557`). This is consistent with ghost/client as the root.
- Surfaces (`:566-580`):
  - anima `inspector` = `telemetry.story` → `client.$story` → `drapes/dom/panes/inspector.jsx`
  - ghost tty `inspector` = the same `$story` → `drapes/tty/panes/inspector.jsx`, "a 40-column rail; the door mutes console (the screen is the renderer's)"
  - ghost `--json` → stderr
- The old G panel (logger) and the Boot widget become ONE story pane (`:578`).
- The tangle edits `drapes/dom/chassis.jsx` (a `.chassis-inspector` region) · `dom/sheet.js` · `dom/surface.js` · `tty/chassis.js` (`:1181-1320`).

### (d) Forks F1–F10 (`:1632-1645`)
Client-relevant:
- F9, showing the inspector: "a: by the word · b: a chord (`/key/ctrl-g`)". Lean a now; "b is a loop form on top of a". This ties into the keymap Vector.
- F10, `caps.story`.
- F5, a refused form faults its branch, not the root, so the client does not go FAILED.

### (e) Stale
- **`client.$story` is an atom on the client** (`:1052` `$story = atom(trace.seed())`, `:1005`).
- codestyle.md records the 10-12 kill of `$telemetry`: /"NO. fuck. ill kill you if you try this again."/ Any m89 hunk reviving a `$telemetry` (the bak alias, `:67`) is forbidden. Check `$story` against that kill before reuse.
- The tangle targets `drapes/dom/chassis.jsx`, which is red today (`belt.dock`, `chassis.jsx:3`).
- It also targets drapes `sheet.js`; "sheet" vocabulary may collide with the dead `subsystems/sheets`.
- It cites old anima paths `bak/src/telemetry/`, `g.svelte`, `Boot.svelte`.

### (f) Dependencies
m86 (parallel; m86's final depends on m89).

---

## 5. m55 recursive buffer frames: `Q/benched/m55-recursive-buffer-frames.org`

### (a) Status
- `:3` "M1 thread lineage LANDED on /"go."/". It added `Thread.parent` m:1 cascade + `Thread.children` 1:m, a `Buffer.thread` cascade, and typology `thread.js` parent/children.
- "M2 (the anima terminal) and M3 (the nested App) DESIGNED, gated on go." Progress 1/3 (`:7`).

### (b) Rulings (`:62-92`), load-bearing for m95
- Intent (`:12`): /"can a buffer render another buffer? … the buffer would need to render a frame and provide it with all a fame needs to render. its a terminal. … so we are now talking about recursive terminals. … the terminal entity is independent of the context servicing it."/
- /"maybe the answer is to force thread creation? spawn of a child of the current thread. and place that on a terminal. and write that into a frame."/ → the child is a THREAD (sub-thread) (`:64`).
- /"we design mikro-orm first! mark that."/ (`:67`).
- **/"the daemon knows nothing about terminals! no entity terminal on runtime! thread is daemon. terminal is client!! thats the surface. no overlap. terminal is a function of thread. terminal mirrors and controls thread."/** (`:70-71`). Also: /"intricrazy thats not warrented. aim instead for coherence and integration at the cost of effort"/.
- /"lets go with control vector verbiage here."/ → the terminal's methods are `up down status stop run watch` (m50 Nature names) (`:76`).
- /"i dont think we want to delete the thread when we wind down the terminal. thats separate. we do want to be able to pass an existing thread to a new terminal tho. just as we'd want to configure mode, maybe buffers, etc."/ → `down` unmounts; `up({thread})` adopts; `up({mode, traits, trait})` mints (`:80`).
- /"whats the holistically best approach? maybe re-think if the panel should have it in the first place?!"/ → the view law is the terminal's (`terminal.$view`, beef's `//@beef!` trace at `terminal.js:11`) (`:83`).
- Known issue on his order (`:86`): /"mark as known issue in the quest: child terminal dock/conversational handling."/

### (c) Landed / designed / owed
- M1 LANDED (runtime + typology).
- M2 designed: `systems/anima/src/typology/entities/terminal.js` gets parent/children/$view + verbs; a terminals store tree; a `TerminalRecord` schematic; `drapes/panels/Frame.svelte` reads `terminal.$view`; `a.svelte` stops computing the view; panel F gets a tree.
- M3 designed: the nested App (m53 Desk).

### (d) Forks (`:335-340`)
- F1 point or flat: App props `{terminal, buffer}` versus five.
- F2 schematic home: anima-local versus typology.
- F3 auto-merge on `.call` (`entities/mode/mode.js:55` `// @beef: choice pending`).
- F4 `run({escort})` versus an `escort` verb.

Deferred:
- D1 `withUrl` mutates a Bundle.
- D2 gen-only modes have no `mode.app`.
- D3 daemon-side `watch`.

Known issue (`:322-326`): child terminal dock. The question is whether a nested Frame gets its own Dock or shares the crown's. Undesigned.

### (e) Stale
- Svelte everywhere (`Frame.svelte`, `a.svelte`, `panels/f`); `mode.app` (now `application`); "crown tab"; panel A/F letters (pincer layout).
- `subsystems/drapes/panels/Frame.svelte` and `view.withUrl` are old; `View` has left typology.
- Bundle default export `(target, props) => mount(Component…)` comes from `typology/gestalten/bundle/svelte.js` (`:41-45`).

### (f) Dependencies
m50 (control vocabulary) · m53 (vcompany Desk) · m19 (gen-only modes) · m26 · longdistance.

### (g) Nouns
- **terminal** = the client's function of a thread: mirrors and controls it (RULED, `:70`).
- **sub-thread** = a child thread (beef's word, `:57-60`).
- **Frame** renders a terminal.

---

## 6. m54 buffer file: `Q/benched/m54-buffer-file.org`

### (a) Status
- `:3-4` phase open. "DESIGNED, TIED UP; LABELED LANDED EARLY via m57 M9".
- The verbs' home is QUESTIONED.
- `:5` next: reconcile with m53 T1.1 and V3 vdex first.

### (b) Client rulings (`:24-41`)
- /"i want the same structure on buffer to serve two roals. … a: its loaded into context with the agents and they can read write it. b: its a reactive display on the frontend app where we also edit."/
- /"there are issues here in that kajuit cant implement domain specific traits yet. for now we gotta keep them on system level."/
- **/"client can only have system level functions. daemon is domain level. making document a system level trait."/** This is the precursor of the "client is domain-blind" law.
- /"FILE."/ · /"labeled in m1."/

### Client design (proposed)
- drapes `display/File.svelte {file, editable, oninput}` dispatches on MIME: text/* → Markdown/Org/Json/textarea; application/pdf → Pdf; audio/image/video → Asset. "Any App, and the F panel, render a FILE buffer without knowing vdex" (`:123-124`). This is a renderer-by-MIME table, which matters for m95's renderer table.
- Caret policy (`:51`): agent edits → SSE → the App re-renders; the user debounces 1.5s; "changed by agent" shown.

### (d) Forks (`:175-184`)
- The verbs' home (aperture + `daemon.call`, versus BufferRepository verbs mirrored by RemoteRepository; the mikro-first law).
- `open` as emitter (m53 T1.1) versus swap (m54).
- `v.asset` `{path}`.

### (e) Stale
Svelte drapes (`File.svelte`); "kajuit" (old anima name); `daemon.call`; the "F panel".

### (f) Dependencies
m53 (T1.1, V3 vdex) · m57 M9 · m23.

---

## 7. pincer.quest.org: `Q/done/pincer.quest.org`

### What pincer WAS
- `:4` STATUS "ACTIVE — phases 1-17 DONE". The file sits in done/. Dated 2026-04-07 (kajuit era).
- Intent (`:6-17`): "Define the html client's layout system … named, addressable, composable *panels* arranged into a *T-bone* … with a draggable controller — the *viket* — at the junction. Mobile-first; viket is the primary input device. All layout state is a serializable JSON blob." Also: "terminals render in panel E, modeline in A or H, REPL is one phase of E."
- Terminology (`:19-35`):
  - T-bone = crown + spine + viket
  - crown = the horizontal bone
  - spine = the stem
  - viket/pincer = the junction square; the position is `pincer`, the component is `viket`
  - bones (4) = shoulder, crown, pincer, spine
  - orientation 0/90/180/270 via a long-press radial
  - snap grid `[0,13,21,34,50,66,79,87,100]`, 28px gravity
  - layout blob
  - skeleton
- Panels: A=header/nav, B=left rail, C=stage (D inspector · E work surface · F aux), G=system tray overlay, H=dev console overlay.
- Viket gesture state machine (`:65-78`): idle/longpress/sticky; taps 1 = home, 2 = swap previous, 3 = set standard; pointer capture; `touch-action:none`.
- Context architecture (`:99-119`): 4 symbols LIGHTHOUSE · QUARTERS (terminals LocalRepository + $active) · BRIDGE (layout+view+geometry) · THREAD (reactive). Also: "No boot vectors (wafers) on the client."

### What dropping the pincer removes
- The whole T-bone geometry: `rectsForOrientation`, `bonesForOrientation`, the orientation radial, the snap grid/walls/throw.
- The BRIDGE layout store and blob.
- The A–H panel letters.
- The bone components (shoulder/crown/spine/pincer).
- Mobile-first drag as the primary input.

### (d) Open questions (`:320-336`)
- Per-route versus global layout.
- Real names for the letters A–H: /"Panel A/B/C/D/E/F/G/H are placeholder letters; need real names (mode-bar, left-rail, stage, inspector, etc.) before production"/.
- Modeline location.
- **"Keyboard interface to viket — if layout is the OS shell, shortcuts are eventually mandatory."** This is the pincer quest's own admission that a keymap was owed.

### (e) Stale
- "kajuit" paths; Svelte; tailwind safelist; LIGHTHOUSE context (m80 lighthouseless); `$client` DAEMON/MODE.
- The 5-skeleton color model was superseded by m72 zones.

### Survives conceptually
- "State is data; lifecycle is functions over data" (`:116-117`).
- The terminal is minimal `{id, slug}` and the thread holds the rest (`:376`).
- LocalRepository for client entities (`:378`).

---

## 8. m56 the pincer turns: `Q/discarded/m56-the-pincer-turns.org`

### (a) Status
- `:3` "*M1 + M2 LANDED* (green, uncommitted)". Phase verify 2/2 (`:7-8`).
- Source: the Claude Design project "Pincer responsive redesign directions".
- M1: bones read their own rect (`axisFor(rect)`). M2: panel C becomes a pane engine (`stores/bridge/panes.js` norm/push/fitRun, `Pane.svelte`, `Twig.svelte`).

### Why discarded
Superseded. m73 patch 5 deleted the weighted stack of three, Twig, the push grips and the hint line in favour of a six-pane tree (`Q/done/m73-…:3083-3098`, "Dead with the stack").

### (b) Rulings
- **/"terminal should absolutely dock and close. bullshit"/** (`:58-60`, ruling 1 `:269`). No anchor pane; every pane folds, docks and closes alike.
- Ruling 7 /"do"/ (`:294`): the pane header stacks above the Section heads; the digest is dropped.
- /"fix"/: the axis-blind container query (`:153`).
- /"ignore"/: the `.bak.svelte` orphans (`:170`).

### (d) Forks held (`:487-505`)
- The radial versus a tap-fan.
- The spine as pane selector: /"No chrome in C. The spine bone carries D / E / F — tap one, C shows it."/
- `recency` is never read. Consumer: "which pane does a fresh buffer open into".
- "dock" names two things (panel C fold-out versus `stores/bridge/dock.js`, the A-panel Dock).

### (e) Stale
All of it is pincer/Svelte/panel letters.

### Lesson worth carrying (`:84-89`)
"Ask what the old code COULD express before treating what it does as a decision": an accident of the twig design was misread as an anchor rule.

### (g)
`instance` is a TAKEN noun (paladin `instance(slug)`, `:276`).

---

## 9. m73 anima and design system comps: `Q/done/m73-anima-and-design-system-comps.org` (285KB, 3284 lines)

### (a) Status
- `:3` "APPLIED — all six patches stand in the tree". After the patches came the radial's paint and brand (09-28), radial behaviour, chess kit, bone keys, radial second pass, walls (09-29), throw, entrypoint, onset (09-30), and spine dots (09-30).
- beef's walks owed: `m73/T-radial-live` · `T-throw-live` · `T-entry-live` · `T-spine-live`, plus "the audit's 16".
- Scope: anima, drapes, dapper (`:32`).

### (b) Rulings (beef)
- **/"important! we have done a lot of adjustments and custom work on the pincer. right now the core placement logic works well. dont drop that. f.e the settings for mobile, ios. and running it as manifest is working currently."/** (`:30`). This is the "keep-list": `geometry.js` · `gesture.js` · `bridge/dock.js` · `static/manifest.json` · `stop.svelte.js` byte-identical (`:8`). Dropping the pincer in m95 overrides this 09-28 protection. Name it as a reversal and confirm with beef. The PWA/manifest/iOS settings (`client.html:12-18`, `:170`) are separable from the pincer and probably should survive.
- /"the anima design is HIGH quality and HIGH design."/ (`:32`).
- /"what the designer does is what the designer does in its own universe, we apply our own."/ (m72 standing, `:44`).
- Fork rulings (`:42`):
  - /"1b"/: the pincer's state paint = today's fills on the comp's disc
  - /"2 ?a."/: the phase face = the buffers key + float with the four phase cells
  - /"c ?a"/: rail C = six panes in four folds page·stack·accordion·free
  - /"second two are long term oriented guesses."/
- /"fonts inside the theme; yes"/ (`:219`): a font group in the theme; six names kept.
- /"the shoulder says STATE only — never a count (design rule 6)"/: a standing rule quoted from `shoulder.svelte:19` (`:249`). The comp's ticks are QUESTIONED against it.
- /"also, mark whre you DROP features. f.e. new design says nothing about telemetry panels. and the dock is losing its meta."/ (`:3023`).
- Pincer strikes:
  - /"the pincer is not in form AT ALL"/
  - /"give the pincer the signal/brand color it has in the current nordic theme"/ (`:2867`)
  - /"and drop the snapping indicators/highlihghts on the glass blur entirely. bad idea."/ (`:3140`)
  - /"the walls arent snappy yet."/
  - the throw: /"the faster i move towards a wall, the larger its gravity snap is."/ (`:5`)
- Entrypoint (`:5`, `:2998`): /"when i open a ste a mode and its an entrypoint, automaticlly open the buffer."/ The trait is `STANDALONE` (`Mode.ts:14` `// ? Rename ENTRYPOINT`). Setting it again reopens and never mints. This is a client behaviour that survives the pincer and is REPL-relevant: `/mode/set` on a STANDALONE mode opens its buffer.

### (c) What m73 built (now the chrome being rewritten)
- Panes, one line each (`:193-205`):
  - **gate** (lighthouse list + sign-in)
  - **populating**
  - **shoulder** (buffers key → phases·verbs·release·queue; harness key → activities; dock key → side·share·open·full·stop)
  - **crown** (terminals count key → float list + new)
  - **spine** (a pip per daemon per lighthouse)
  - **pincer** (disc + radial)
  - **rail B** (config · auth · box · dock)
  - **panel A** = stage frame states: no thread · settling · resolving · loading · mounted
  - **dock** (seam, head, turns, live turn, error, composer + dictation + intelligence float)
  - **rail C** (six panes: terminal · navigation · thread · mode · buffer · harness)
  - **debug bench**, not ported
- Places/zones table (`:173-189`): zone 0 chrome (shoulder·crown·spine·pincer·rails), 1 body (stage, dock, turns, buffers), 2 island (a mode declaring itself), 3 bench (inspector/logger/debug); menus take the opener's zone + `shape.lift`.
- The radial grew spokes: `#` grid · `T` hairline · eye hide (full stage with auto-hide) · home handle · pin lock (`:2950-2985`).

### (d) Forks still QUESTIONED (`:207-252`)
- porcelain/datasette below floors
- parchment re-tune
- the mark: a CSS mask on currentColor (lean a)
- the Design System page
- label size (`--size-type-2xs`)
- **link down keeps the shell**: needs a link monitor; nothing polls
- **terminals leave the crown strip** (carried a: one key + float; switching takes two taps)
- trait chip gesture
- save as intent
- shoulder counts
- tap floor 44px on coarse pointers

### What the design wants and the system lacks (`:2804-2828`)
- A gate list of lighthouses.
- A link monitor.
- Frame lifecycle bars.
- Bundle path/integrity on the mode pane.
- rtt/sparklines (no source).
- A context-window meter (no faculty field).

### Dropped list (`:3021-3160`)
The inventory of what anima chrome HAD; useful as the m95 "do we keep this" checklist:
- Crown tab strip (one tab per terminal, ×, +) → float.
- `clear` all terminals → none.
- Thread id reading → gone.
- Phase verbs on the bone → float.
- Integrity LED.
- Shoulder chat key → dock float (plus a panel A `chat` key).
- Spine scanline/letters.
- Pincer frame/tint.
- Console INSIDE the dock → rail C harness pane.
- Dock head words idle/calling/streaming/thinking.
- Turn fold.
- Copy/retry.
- Dictation ghost.
- Panel A watermark.
- Rail C stack/twig/push/hint/digest (m56) → tree.
- Navigation: daemon sections → chips, threads flat with "+N more".
- Thread: active card → crumb row; Intelligent rounds; Queueing slider.
- Panels G (logger) and H (inspector) kept but unpainted (`:3025-3028`). Their toggles are in rail B config `telemetry · logger · inspector`. These are the telemetry surfaces m89 re-homes.

### (e) Stale against m95
- Svelte throughout (`app/bones/*`, `panels/*`, `widgets/*`).
- The lighthouse gate (m80 lighthouseless).
- The pincer radial/disc, bones, rails B/C, panel letters.
- `stores.bridge`.
- `Frame.svelte`.
- 1852→434-line `Dock.svelte`.

### Survives (design-system side)
- dapper themes (northsea, parchment, porcelain, datasette, nordic), the zone token space (m72), and the drapes kit "one part per comp recipe (key · row · float …)" (`Q/index.md:60`).
- The comp's tactile key language (`:168`).
- The tap floor rule.
- The pair-contrast law.

### (f) Dependencies
m72 (zones; forks closed here) · m53/m57 · m50.

---

## Cross-cutting: stale assumptions vs m95's direction

| term | where it appears | status |
|---|---|---|
| ink | m79 throughout | → OpenTUI |
| sheets | m79 (kit), m89 (`dom/sheet.js`) | DEAD |
| Svelte | m55 · m54 · m56 · m73 · pincer | → Solid |
| kajuit | pincer · m54 | old anima name |
| lighthouse | m79 · m73 gate · pincer LIGHTHOUSE ctx | m80 lighthouseless |
| pincer/viket/T-bone/bones/radial | pincer · m56 · m73 | DROPPED in m95 (reverses m73 `:30` keep) |
| panel letters A–H | pincer · m55 · m56 · m73 · m84 `:899` | gone with the pincer |
| HOMED / home mode | m79 F4 · m84 | "cut home home" 10-12 |
| Frame.svelte / view.withUrl / mode.app | m55 · m54 | View left typology; `application` |
| `$telemetry` | m89 `:67` (bak) | KILLED 10-12 (codestyle) |
| drapes `dom/chassis.jsx` | m89 tangle | red (`belt.dock`) |
| runtime Terminal entity | m84 `terminal_find` vs m55 ruling | CONTRADICTION |

## Nouns with a locked meaning (where)

- **terminal**: the client's function of a thread, which mirrors and controls it; no terminal on the daemon (`Q/benched/m55…:70`). Verbs `up down status stop run watch` (`:76`). A terminal exists to render buffers and docks (`Q/discarded/m79…:32`).
- **sub-thread**: a child Thread via `Thread.parent` (m55 M1 LANDED).
- **cut / captured / chrome**: the ghost render ways (`Q/discarded/m79…:229`, RULED 10-06).
- **chrome**: "how we name the custom interactive fullscreen components"; the repo provides it, modes can supply their own (`m79:4338`). Proposed, not ruled.
- **client is system-level only**: /"client can only have system level functions. daemon is domain level."/ (`Q/benched/m54…:31`).
- **STANDALONE**: an entrypoint mode; setting it opens or reopens its buffer (`Q/done/m73…:2998`).
- **telemetry / surface / pipe / sieve / story / inspector**: m89 ontology (`Q/roadmap/m89…:453-470`). Proposed.
- **home**: a pointer `user.trait.HOME` › `instance.clients[].home`, which the client resolves (`Q/roadmap/m84…:18`). The home mode itself is cut (`:898`).
- **zones** 0 chrome · 1 body · 2 island · 3 bench (`Q/done/m73…:173-189`, from m72).


### appendix: briefings

# briefings — client-design-briefing.md (I) + client-design-briefing-ii.md (II), with answers from later quests

Paths are relative to `.ikiro/`. B = `reference/client-design-briefing.md`, B2 = `reference/client-design-briefing-ii.md`.
Both were written 10-16, against the tree after m86 landed (B:1, B2:1). Every quest this file checks against is 10-16 → 10-19.

## (a) status / header

- B:1 — a reference with no cap, written 10-16, "a DESIGN BRIEFING for a design agent". It has four parts: I architecture (§0–3), II the clients today (§4–8), III runtime (§9–14), IV the brief (§15 gaps · §16 open questions · §17 screens) (B:12-31).
- B:42 — the briefing's own split:
  - **settled**: ring §1 · vocab §3 · entities §9 · verbs §4/§10 · two-face App contract §8 · ledger §14
  - **broken** (fix, don't design around it): §5 RED · §6 `./dom` · §15
  - **open**: §16, then draw §17
- B2:1 — it answers the design agent's four research asks (B2:6-11): §1 assets · §2 cargo · §3 box · §4 chess bundle. **B2 has NO numbered open-question list.** Its open items are the "mismatches" and "defects" blocks (B2:114, 284, 506, 711).

## (h) every numbered § in B

| § | line | title | still true? |
|---|---|---|---|
| 0 | B:36 | the ask | ask stands; the "dom.svelte + tty.solid faces" premise (B:40) is superseded by m87 artifacts |
| 1 | B:44 | the REPL ring | settled; ghost paths moved by m91 (see e) |
| 2 | B:80 | design story · timeline · rulings · up in the air (B:196) | history |
| 3 | B:282 | vocabulary | `frame`/`buffer` superseded by m87 (buffer = state space; target cell/frame) |
| 4 | B:311 | ghost measured; §4·7 every action (B:986); §4·8 GAPS (B:1015) | paths stale post-m91 |
| 5 | B:1031 | anima measured; §5·9 actions (B:1590); §5·10 RED (B:1626) | anima still does not build (frontier) |
| 6 | B:1677 | drapes · dapper kit; `./dom` red (B:1879) | still red |
| 7 | B:1932 | buffers end to end | rewritten by m87 (Buffer.bundle dropped) |
| 8 | B:2149 | two-face contract (App, one bag) | `App` DEAD per m87 law 7 (m87:227) |
| 9 | B:2199 | entities | m87 adds Artifact; m94 rules each entity's traits |
| 10 | B:2384 | apertures · dispatch · streaming | m88 adds the client aperture + LOOPING (m88:848, 889) |
| 11 | B:2649 | auth | trait names kept (m94:60) |
| 12 | B:2730 | inline components · the bundler question (B:2835) | answered by m87 (below) |
| 13 | B:2886 | dev · telemetry · logging · processes | m89 (roadmap) |
| 14 | B:3035 | ledger | settled |
| 15 | B:3067 | gaps, consolidated | per row below |
| 16 | B:3090 | open questions | per item below |
| 17 | B:3108 | screens to mock | per row below |

## §16 open questions — each with its answer

Marks: **ANSWERED** · **PARTLY** · **OPEN** · (pre) = the "answer" comes from a quest older than the briefing, which the briefing still treated as open.

1. **B:3092 One chrome or two? / the pincer** — "ONE layout logic, rendered twice; the pincer is a dom-only GESTURE … or dies. Decide."
   - **OPEN in every quest.** Grepping `pincer` across m92 · m87 · m88 · m93 · m94 · m91 · m86 finds 0 hits.
   - The settled direction (brief.md: pincer dropped) lives only in the m95 conversation. No quest records it yet. m95 must write the ruling.
   - Also see "up in the air" at B:198: m82 S/W and m73 /"dont drop that … settings for mobile, ios"/.
2. **B:3093 Which bones and cards return?** Every surviving card control must first become a verb.
   - **PARTLY.** m92 gives the mechanism, not the inventory: a verb declares its own `chord:` (m92:76 law 6), and the palette lists every composed verb (m92:82 law 11, m92:185-186).
   - Which cards return is still undecided. m86:66 lists "Crown · signin cover · keys · pickers · navigation · anima … OUT". m86:2829 defers crown · navigation · pickers.
3. **B:3094 The dock's two natures** (chat + journal; telling turn, fault and boot apart; folding the journal away).
   - **OPEN.** Only fragments exist:
     - m92:80 law 10: the held chord is painted in the dock, and an unbound key drops with a fault line.
     - m92:282: the minibuffer line and the palette list sit under the input in `dock.jsx`.
     - m87:183 Q8: a turn's artifacts render as their own block after the parts.
     - m94:57: DOCKED is per terminal (/"we can set docked per terminal"/). But DOCKED = "the default dock for terminals without their own" (m94:259), which is geometry, not the journal fold.
   - No glyph grammar and no chat-only filter has been ruled.
4. **B:3095 Views beyond the dock** (tiling · notebook · canvas).
   - **PARTLY.** m87 settles the dock ⟷ frame axis only:
     - `target: cell|frame|null` (m87:196 Q18, m87:225 law 5).
     - The client decides the target, with /"controls to switch"/ (m87:195 Q17b, m87:224 law 4).
     - In the dock: a cell inline, or a `▸ label` line that opens the frame (m87:130-136).
   - Tiling, notebook and canvas are not mentioned anywhere.
5. **B:3096 The status line / crown.**
   - **OPEN.** m86:66 says crown OUT, and m86:2829 defers crown and a `status` verb in the dock's tail.
   - m92 adds a MINIBUFFER (the held-chord line, m92:80, 282) but no mode line. Emacs map: minibuffer ↔ slot, mode line ↔ crown (B:215).
   - m88:721 and 813 show `crown · navigation · dock` panes only in the pre-m86 ghost test.
6. **B:3097 Keys** (Enter, ⇥, Esc, digits, a leader, which-key) — **PARTLY → mostly ANSWERED by m92.** frontier.md:18 says "§16 partly answered by m92".
   - **leader**: the semantic `leader`. On tty it is `ctrl-v`. On DOM it is the modifier the platform does not paste with: mac `ctrl-v`, else `meta-v` (m92:81 law 12, m92:265).
   - **Esc**: drops the chord and the palette (m92:77 law 7, m92:191).
   - **which-key**: `client.$chord` paints the held node's edges; no timer (m92:80 law 10).
   - **palette**: `ctrl-v ctrl-v` lists the strip, the draft narrows it, Enter on a row dispatches (m92:82 law 11, m92:282, 301).
   - **Enter**: dispatches the palette row (m92:282).
   - **⇥ / Tab**: stays the frame widget's (m92:283). Bare keys stay with the focused widget (law 7).
   - **digits**: not addressed.
   - **chords at verbs**: `/help` leader/? · `/quit` leader/q · `/chrome/on` leader/c · `/mode` leader/m (m92:284).
   - **modes**: supply keymaps by `KEYMAPPED` (m92:78 law 8).
   - **deferred**:
     - B, focus-selected bare keys (m92:336). It closes `frame-keys-leak-into-dock` (m92:325).
     - the DOM normalizer (m92:337), because anima does not build.
     - cortex-choice completion (m92:339).
   - Status: DESIGNED, no go (m92:3).
7. **B:3098 Signin while AUTOLOGIN** (a cover, a pane, or nothing).
   - **OPEN.** m94:60 only keeps the name (/"auto-login is fine"/), and m94:269 records AUTOLOGIN's role.
   - m86:66 says signin cover OUT. m86:2829 defers "the client-side AUTOLOGIN config · the signin cover".
   - Known issue `autologin-signin-flashes` (cited B:3073).
8. **B:3099 HOME on every new terminal or first boot only** — **ANSWERED (pre)**.
   - m88:54 (10-14): /"home sets mode on new terminals. incl thread."/ HOME enters EVERY new terminal.
   - Restated by m94:257 ("the mode a new threadless terminal is seated in; beats the client's HOME") and m94:275 ("seats each new threadless terminal").
   - B listed it as open anyway. The design (UI) side follows from the rule.
9. **B:3100 Threadless terminals with a client mode** — what does a terminal seated in `@commons/home/console` show?
   - **PARTLY.** The seating is ruled:
     - m88:54-55: a hosted home sets `terminal.$mode`, with no thread.
     - m88:108: "Where a terminal sits with no thread. Its verbs join the terminal's repl."
   - What it SHOWS is undesigned. m86:2829 defers "threadless client-mode terminals".
   - Watch for a contradiction:
     - m94:275 says HOME "seats each new threadless terminal on a thread in the HOME mode".
     - m86:2832 says "HOME names a HOST mode this stretch … thread.create".
     - m88:54 splits the two cases: hosted = no thread, host = a thread.
10. **B:3101 Where telemetry shows** (m89 F9: by a word, or by a chord).
    - **OPEN.** m88:1209 has one note only: the two socket frames per harness call are the first thing a Span should show.
    - m92 makes "by a chord" cheap (a verb + `chord:`) but rules nothing.
11. **B:3102 Inline components in the dock** (select · form over `input` · progress; one block grammar, no compile).
    - **PARTLY, and REFRAMED by m87.** Inline = a buffer on a turn whose artifact a client renderer claims for target `cell`:
      - m87:112-136: the `RENDERERS` `[[predicate, Renderer]]` table and `shown(buffer,"cell")`.
      - m87:224 law 4.
      - m87:200 Q21: turn ⟷ buffer m:n.
    - The declarative select/form/progress block table from B:2862-2875 is NOT ruled.
    - m92:82 law 11 has a pattern's `input` schema drive completion in the palette, which is the "form over input" seed.
    - Deferred: an inline buffer that opens another buffer (m87:287).
12. **B:3103 The bundler question** (may a REPLING mode return a face; there is no compile on the client).
    - **ANSWERED by m87.**
      - Intent A (m87:209): /"can we have a repling trait … produce solid code that the clients render ad-hoc inline?"/
      - Flow "repling solid": `artifact.create({mode, mime: tty.solid, source})` is compiled ON THE RUNTIME, then `buffer.create({turn})` (m87:158).
      - Law 6: FILESINK `compile` goes through paladin's bundler (m87:226). Q24: the repl calls the route `/files/compile` (m87:202).
      - Q25 /"7 permitted."/: generated code runs with the client's `dispatch` (m87:203).
      - The client never compiles. That leaves the `.solid` loader refusal (B:2848-2855) for milestone 2's bundler work.
    - Status: DESIGNED, nothing landed (m87:5).
13. **B:3104 Multi-client coherence** (the same thread in ghost and anima, mirrored).
    - **OPEN.** No later quest mocks or tests it. Rows subscribe (m86 law).
    - m87 Q15: accept is per client (m87:191), so the two clients may render the same buffer differently.
14. **B:3105 Zone open points** (rails zone 0 or 1; who sets zone 2).
    - **OPEN.** Zero `zone` hits in all seven quests.
    - Related: m94:277 says THEMED and DOCKED are owed on ghost, whose chrome hardcodes `tokens("northsea","2")`, and m94:254 says THEMED has no writer.
15. **B:3106 Desktop** (Tauri).
    - **OPEN.** Zero hits. m85 is benched (git status: `quests/benched/m85-tauri-clients.org`).

### "up in the air" (B:196-202), outside §16

- pincer — see §16.1.
- bones and panels — see §16.2.
- **anima's framework** (B:200): four flips; the latest is /"anima not in scope"/.
  - No quest rules Solid for anima.
  - m91:416-418 reorganized anima's tree subject-first and kept it SvelteKit.
  - m87:172 milestone 8: "the svelte renderer table … after anima builds again".
  - The settled direction (Solid on both) has no quest record yet. That is m95's job.

## §15 gaps (B:3071-3088) — the rows a later quest touches

| row | line | later answer |
|---|---|---|
| sign in / up | 3073 | OPEN (see 16.7) |
| boot cover | 3074 | OPEN; m86:2829 deferred |
| terminals CRUD | 3075 | OPEN. m88 Q2 `/terminal/:terminal/…` (m88:848) is the client aperture the RUNTIME calls, not user verbs. m93:129 is a coverage gap (no test boots and removes a terminal) |
| thread list | 3076 | OPEN |
| host health / activity | 3077 | OPEN |
| stop activity | 3078 | OPEN |
| parts beyond text | 3079 | PARTLY: m87:183 Q8 renders artifacts as a block after the parts; tool/thinking views are unruled |
| live stream | 3080 | no change |
| input editing / completion | 3081 | PARTLY: the m92 palette is completion over the strip (m92:82). History and word-jump are unruled |
| mouse / selection | 3082 | OPEN |
| the frame | 3083 | PARTLY: m87 `shown(buffer,"frame")` (m87:124); m92:283 keeps Tab |
| entity browsing | 3084 | OPEN |
| theme / zone | 3085 | OPEN; m94:277 owed |
| box | 3086 | OPEN (B2 §3 defects stand) |
| telemetry | 3087 | m89 roadmap; OPEN |
| dev affordances | 3088 | OPEN |

## §17 screens (B:3114-3121)

| # | screen | line | later answer |
|---|---|---|---|
| 1 | boot | 3114 | OPEN |
| 2 | signin | 3115 | OPEN |
| 3 | chat (dock) | 3116 | PARTLY: m87 dock cells and lines (m87:130-136); m92 minibuffer and palette in `dock.jsx` (m92:282) |
| 4 | buffer (frame) | 3117 | PARTLY: m87 renderer table, `default(target, {buffer, …})` (m87:223 law 3); the "Floor until sheets" is gone (sheets DEAD) |
| 5 | navigation | 3118 | PARTLY: m92:299 `ctrl-v m` paints the picker; there is no `/terminal/*` or `/thread/*` user verb |
| 6 | status (crown) | 3119 | OPEN |
| 7 | dev chrome | 3120 | OPEN; the toggle could be a `chord:` (m92) |
| 8 | inline blocks | 3121 | PARTLY = 16.11 |

## §4·8 GAPS (B:1015-1029) and §5·10 RED (B:1626-1675)

- B:1027 latent: a RUNTIME mode row that declares REPLING hits `module = null`.
  - m86:2829 defers "remote REPLING".
  - m88 LOOPING is the other direction (the runtime calls the client's repl), so it does not answer this. OPEN.
- B:1025 frame: `memo.jsx` tty face is dead (sheets). Still owed (m86:2834).
- B:1028 `ghost/scenario` boots nothing. Still true (map.md).
- RED 1–4 (B:1628-1660): `View` gone · wire `view` vs `bundle` · Frame bag drift · `belt` left ghost (`chassis.jsx:3`).
  - All still red per map.md.
  - m87 makes RED 2/3 moot: `bundle` dies, and the client goes through `buffer.artifacts` (m87:227 law 7, m87:172).

## B2 open items

- **B2 §1 mismatches** (B2:114-124):
  - no logo asset; the wordmark is live text (`drapes/dom/Logo.jsx`)
  - pictogram svgs are raster wrappers (B2:43)
  - the `/static/` vs `/fonts/` prefix split is unverified in a build (B2:119)
  - `design.md` is stale on fonts and sheets (B2:122)
  - the m73 comps are not in the tree (B2:123)
  - None is answered by a later quest. OPEN.
- **B2 §2 cargo** (B2:126-294):
  - **ANSWERED/SUPERSEDED by m87.**
  - B2:271 cites `.ikiro/quests/artifacts.org`, now `quests/m87-buffer-view-file.org`.
  - B2:276 says "Buffer gains `turn` (m:1, nullable)". m87:200 Q21 (10-17) changed it to `buffer.turns` m:n. **B2 is stale here.**
  - B2:277 says `mount`. m87:201 Q22 made `mount` an ABSOLUTE path.
  - The FILESET/FILESINK and `/attached/artifact/:id` claims are still consistent (m87:190, 192).
  - B2:291 Turn schematic `mode` required vs entity nullable: a defect, not addressed.
- **B2 §3 box defects** (B2:517-526): OPEN; no quest. The worst three:
  - the sample rate is not honoured end to end (Deepgram hard-codes 16000)
  - the hot Pipe drops frames
  - `ctx.vocal` is typed boolean. m94:349 item 8 re-measures this one ("`ctx.vocal` typed boolean (`contexts.js:37`)") as a defect, not ruled.
- **B2 §4 chess** (B2:711-719):
  - the face does not write `buffer.data`; `/match/*` routes are the authority
  - there is no `/buffer/update`, and nothing uses `dispatch`
  - two bags: tty has 8 keys; dom `{terminal, daemon, mode, thread, buffer}`
  - the kit is a 5× copy
  - PARTLY: m87:223 law 3 fixes the door as `default(target, { buffer, … })`. m87:192 Q15 makes accept per client. The bag contents across faces are not ruled. The chess 500 is in known-issues (m86:2818).

## (b) rulings carried in B, for m95's chrome

- domain-blind: B:136. Every control is a line: B:68. The menu IS the help: B:68.
- dock = `stdout.tail("message","fault","turn","stream")`: B:157.
- /"dock is dock. the bones and panels come later."/ (s3 #10): B:199.
- /"in both cases both clients should implement the same layout logic."/ (m82 S): B:272.
- /"anima from scratch. import {...typology} from @vivalence/ghost and {...dom surface} from @drapes"/ (s1 #11): B:275.
- m82 Y /"the first thing that I see is the text input"/: B:276.
- one kit per TARGET: `drapes/dom` · `drapes/tty` · `drapes/svelte` · `drapes/state`: B:277. REJECTED `drapes/solid` (m82:1458): B:192.
- m82's five screens: boot · signin · chat · buffer · navigation (B:278).
- s4-10 /"frame isnt a client primtive. frame is surface."/: B:288.
- s1 I /"surface. not target."/: B:291. m87 later re-introduced `target` for cell|frame, as a different noun.

## (e) stale assumptions in B/B2 vs the settled direction

- **Paths moved by m91** (done 10-19):
  - `systems/ghost/typology/<noun>/` → `systems/ghost/entities/…`, `client/`
  - `app/surface/chrome/` → `systems/ghost/surface/chrome/` (m91:396-398)
  - B cites the old paths throughout, e.g. B:766, 795, 826, 877.
- **anima = SvelteKit**:
  - `dom.svelte` faces (B:40)
  - `drapes/svelte` as the mode-app kit (B:277)
  - `FormFromSchema.svelte` (B:2794)
  - `Frame.svelte` contract (B:1715)
  - The direction is now Solid on both.
- **pincer** treated as maybe-kept (B:198, 3092). Direction: dropped.
- **Bundle / App / `/attached/bundle` / `buffer.bundle`** (B:1966-2022, 2149-2195, B2:276). All DEAD per m87 law 7 (m87:227).
- **Floor** (JSON tree of `buffer.data`) as the frame fallback (B:70, 3117), and "Floor until sheets" (m86:2820). `sheets` is DEAD.
- **`View`** (B:1628). It left typology; drop it, don't restore it.
- **`belt.dock`** in `drapes/dom/chassis.jsx:3` (B:1656). Ghost's `belt` = `harness` only (map.md).
- **"keys are their own mechanism. later."** (B:3097). Superseded by m92.
- **"Signin cover … OUT"**, **crown OUT** (m86:66). Both are still out, but they are the m95 scope.
- **`artifacts.org`** (B2:271) → `m87-buffer-view-file.org`.

## (f) dependencies

- m87 milestone 5 (the ghost: renderer table, dock cells, frame, m87:169) and milestone 8 (anima, m87:172) are client work m95 overlaps directly.
- m92 milestones 3 (chrome, m92:299) and 5 (palette, m92:301) need "HIS EYES". The DOM normalizer is deferred until anima builds (m92:337).
- m88 stretch three: the LOOPING client aperture (m88:848, 889). Stretch two is the hosted twin.
- m93 is TANGLED: the ghost factories on `kleisli` (m93:53-58, 98). It reshapes `client/lifecycle/index.js`, which the chrome mounts from.
- m94: the Client traits HOME · ⊕ DOCKED THEMED (m94:34, 62) and Terminal DOCKED (m94:57). Ghost has no DOCKED/THEMED reader (m94:277).
- m89 telemetry (roadmap) owns §16.10 and screen 7.

## (g) nouns locked after the briefing

| noun | meaning | where |
|---|---|---|
| keymap | a Vector, walked one Press at a time | m92:71-72 law 1-2 |
| Press | one key, one segment | m92:71 law 1 |
| chord | a key declared on a repl pattern | m92:76 law 6 |
| leader | a semantic root segment; tty ctrl-v | m92:81 law 12 |
| minibuffer | the painted held node, `client.$chord` | m92:80 law 10 |
| palette | `ctrl-v ctrl-v`, the strip narrowed by the draft | m92:82 law 11 |
| KEYMAPPED | a mode trait on both catalogs; export `keymap` | m92:78 law 8 |
| artifact | bytes + mime, owned by a mode | m87:221 law 1 |
| buffer | the state space between an artifact and its consumer | m87:222 law 2 |
| target | cell \| frame \| null; a constraint | m87:225 law 5 |
| renderer table | `[[predicate, Renderer]]` per client; accept derived from it | m87:224 law 4 |
| ARTIFACTUAL · FILESET · FILESINK | traits | m87:190, 193 |
| LOOPING | the harness calls the client's repl | m88:847 |
| client aperture | the one aperture, on the client's multiplex | m88:848 |
| subject | owns a directory | m91:1 |
| surface | a sibling of `client/` | m91:46 |


### appendix: references

# references — notes for m95 (depincered client)

Paths `file:LINE` relative to `.ikiro/` (all under `reference/`). "tree 10-19" = what I checked with `ls` today.

## 0 · per-file status headers

| file | header / date | era | verdict |
|---|---|---|---|
| tty-render.md | `:1` agent · limit 22000 · 10-12 vs restored tree `subsystems/drapes/tty/*`, m82 snapshot, opentui 0.5.17 · LIVE vs PROPOSED | opentui+Solid | most current tty doc; paths stale (see §E) |
| tui.md | `:1` 10-05 vs working tree · LIVE vs DESIGNED (m79) | ink 5 + react 18 sheets | §4 self-marked STALE since m86 (`tui.md:840`); §1 medium facts partly ink-specific; §5 anima chrome = pincer era; §6 m79 dock = ink |
| design.md | `:3` 09-28 from m72-zoned-designs · "tree still runs skeleton vocabulary" | Svelte/drapes era | token space still the contract; "drapes is the Svelte kit", "sheets is the terminal kit" stale |
| anima.md | `:3` vs change pqxuzpnm 09-24 | SvelteKit + pincer + View | almost wholly stale on chrome; data layer (dossiers, Terminal, Stall) still the model |
| ghost-architecture-comparison.md | `:5` "DATED 10-05 — citations predate m80 and m81" | m79/ink | external precedent analysis still valid; vivalence citations stale |
| testament-probes.md | `:1` limit 6000 · 10-12 from testament/ | opentui/solid-vite rigs | rigs may not run since 10-12 rollback (`testament-probes.md:4`) |
| m82-clients-compendium.md | `:1` "TEMPORARY, m82 phase two + m86 only — delete when the demo lands" · 10-10 | Loop/REPL + opentui + Solid | rulings sections (`:8-126`) load-bearing; rest is verbatim 10-10 source, frozen |

## A · tty render pipeline (OpenTUI + Solid) — tty-render.md

- **The rule** (`tty-render.md:8`): a component never knows which vector called it; Solid fn of DATA props + `release`. Vector names a KIND (`ctx.view.hold("form", props)`); surface maps kind→component and picks the BOX. LIVE in shell; repl refuses by design; chrome would hang (§6b).
- **Component contract** (`:37-42`): props = verb's DATA + `width` (view adds) + `release` (held only); palette from context via `usePalette()` (throws outside `Palette.Provider`, `palette.js:7`), never a prop; keys via opentui `useKeyboard` straight off `renderer.keyInput`, never through the vector; exit = `props.release(value)` once (`fn.once`).
- Keys inside a component are a `[[predicate, action]]` table (`Confirm.jsx` `:17-22`) — matches codestyle §11.
- **Kinds table** `kinds` (`:44-53`): form · picker · confirm · pending · report · listing, each with props + release value. Field kinds `text · password · confirm · select`. `pending.work` (Promise) and `field.check` (fn) cannot cross a wire → "a held kind is local to a tty" (`:62`).
- **Kit = three placement primitives over one `provide`** (`:64-70`): `paint` (into a chassis slot box, until `destroy()`), `captured` (new box on `renderer.root`, `release()` → scrollback, needs split-footer), `cut` (scrollback one frame, split-footer). Surface bag: `emit`→cut, `hold`→captured, `mount[pane]`→paint (`:100`). `cut` had no live caller (`:100`).
- **Build** (`:102`): JSX never enters ghost; `bundle.js` compiles `.jsx` with babel-preset-solid `generate: "universal"` → `@opentui/solid` into gitignored `out/views.mjs`; ghost reaches `kit.kinds[kind]` via dynamic import. `solid-js` pinned `npm:solid-js@1.9.12/dist/solid.js` (import_map) — bare specifier resolves SERVER build under Deno and freezes reactivity. (Same trap `testament-probes.md:32`.)
- **Shell LIVE path** (`:104-150`): `instance/init` → `ctx.view.hold("form")` → lazy `createCliRenderer` split-footer footer 1 → footerHeight 16 → `captured` → release writes box to scrollback ("filled form stays as history") → footer 1. `emit` in shell = `plain.js` text, no renderer, works in a pipe (`:136`). ctrl-c tapped → exit 130 (`:138`).
- **Chrome** (`:152-189`): "The chrome holds nothing. It PAINTS panes into fixed chassis boxes and toggles their visibility" (`:154`). Boxes `crown · navigation · frame · dock · cover` (`chassis.js:18-30`); `signin`+`boot` share `cover` (`:185`). `place(layout)` toggles visibility + dock axis/size (`:167-182`). Which panes show (`:186`): unauthorized → crown·signin; no seat → crown·navigation·boot; seated → crown·navigation·dock (+frame when a buffer is open). Pane props: snapshot `{client, root, dispatch}`; m86 tangle `{client, $layout, $output}` + frame gets `accept` (`:187`). Panes read atoms via Solid `from(…)`, write lines via `client.dispatch(line)`; composer sends lines straight to dispatch, not the key feed (`:188`). Chrome renderer `createCliRenderer({exitOnCtrlC:false})` → default `alternate-screen` → no scrollback (`:189`).
- **opentui facts** (`:193-223`): keyboard = one flat global listener list in MOUNT order; first `stopPropagation` ends it; OLDEST listener sees key first → "focus must be a VALUE every older listener reads, not a z-order" (`:210`). Renderable handlers run after every global listener. `writeToScrollback` only in split-footer + capture-stdout (`:216-222`). `screenMode`/`footerHeight` are live setters (`:223`).
- **Faults** (`:225-257`): (a) repl `hold` throws by design; (b) `captured` in chrome hangs the verb (alternate-screen → writeToScrollback throws, swallowed as console.error, promise never resolves); (c) keys go to oldest listener: form loses typing to dock `Input focused` stopPropagation; keys pile in Queue and replay as `/key/<c>` lines; `PRINTABLE` row turns typing into `/key/c` → NotFound → "refused" painted (latent — "nobody has typed in a real terminal yet", `:248`); (d) chrome `emit` = `$output` → `JsonTree`, `Report` never renders there.
- Perspective table (`:252-257`): shell emit plain/hold works · repl pipes json/throws · repl chrome JsonTree/throws · chrome captured hangs.
- **PROPOSED §7 (nothing built, each needs go)** (`:259-323`): vector speaks KINDS only; beef mark /"ctx.view ={...view}"/ (`:261`). Kit (components · paint · captured · cut · reducers · opentui loader) "lives in sheets; ghost keeps the surfaces: geometry plus key ownership" (`:261`) — STALE: sheets is dead. `captured(renderer, parent, …)` with `RECORDS[renderer.screenMode]` table (`:277-294`). Chrome `hold` → `slots.held` + `$held` latch (`:299-308`); every older listener reads `$held`: key queue drops at ENQUEUE (ctrl-c passes), dock `Input focused={held()===null}`, navigation returns early (`:310-314`). Four-perspective table (`:316-321`): shell/repl-inline split-footer, repl-pipes none, chrome alternate-screen + `slots.held`. "The shell and an inline repl are ONE geometry; only the lifetime differs. The chrome is the only second geometry." (`:323`)
- **Open (beef's calls 10-12)** (`:325-334`): (1) where held sits in chrome: strip at foot of `whole` (lean) · `slots.cover` · under composer in `slots.dock`; (2) key ownership: `$held` latch at `keys.js:20` (lean) or opentui focus handlers; (3) tty repl without chrome (`viva client/repl` gets split-footer with dock `Input` as prompt; today `upgrade.repl()` always pipes surface, shell `.do` sends a tty to chrome); (4) kind→component moves into the surface; pipes surface `hold` throws; (5) typing leaves the key feed: drop `PRINTABLE` row, typing belongs to focused `Input`, feed carries chords + esc. → status of these vs m92 keymap / m95 unknown from refs; check quests.
- Sources/supersession (`:342`): tui.md §4 superseded.

## B · anima — anima.md (09-24, SvelteKit)

Architecture as written (STALE stack, data model mostly still the model):
- SvelteKit SPA adapter-static ssr=false, Vite `:1794`; talks to ONE lighthouse + N daemons; compiles no mode code; mode screen = pre-built hashed bundle fetched, integrity-checked, mounted into a `<div>` (`anima.md:5`). [Lighthouse now lives in runtime (m80), `tui.md:44`.]
- **Four nouns** (`:7-12`): terminal = a tab, pointer to one thread + one buffer + its dock; thread = daemon row binding mode + trait config, render `phase`; buffer = one screen of a mode `data · view · traits · trait`; mode = row whose traits decide which wires anima builds.
- Tree (`:18-23`): `+layout` sets LIGHTHOUSE · TERMINALS · BRIDGE · BOX; `+page` panels A B C · bones shoulder crown pincer spine · overlays G H; panel A = Frame ← active terminal's buffer view mounted with `{terminal, daemon, mode, thread, buffer}`.
- DOGMA (`:25`): typology structures pure; effects return teardown; surfaces render and call verbs. Unmet: localStorage in lighthouse/bridge, AudioContext, DaemonDossier builds Connection.
- Boot (`:48-71`): Connection → Lighthouse → hydrate → Bridge/Terminals/Box → `boot(lighthouse)` verify/refresh → populate (memoized promise) → DaemonDossier.use per daemon (mount NOT awaited, backoff) → VERIFIED gate. Gate table (`:75-81`): signin · populating · verifying · ready (+ "open terminal" overlay at 0 terminals).
- Daemon mount sequence (`:86-100`); `daemon.call = shape.connection.wire(connection, aperture)`; subscribe intent·thread·buffer·turn; `daemon.modes.<type>.<slug>`.
- Dataspace + dossiers `{name, kind, repository, use[]}`, `use[]` runs ONCE per (name,id) (`:107-119`); RemoteRepository verbs (`:121`); `merge` assigns into held instance.
- `Buffer` class (`:139-147`) with `$data` (screen state — "a buffer row IS the screen"), `$view` (View record) — STALE: compendium `:58` says stage 1 landed `$bundle`, "View is dead".
- `chain(root, ...path)` re-subscribes per hop (`:150-158`) — survives terminal/thread/mode swaps.
- Mode trait table (`:170-182`): client installs four (APPLICATION, EMITTER, EXPOSED, HARNESSED); APPLICATION → `mode.$application = {url, schema, view}` (STALE: bundle). HARNESSED merge of yielded entities into repositories keeps the dock domain-free (`:184-198`). Harness lexicon fixed: `dialogue`/`object` × `render`/`stream` + `choice.render`, + `verbatim.stream` (`:200`).
- Thread traits LABELED · MASKED · AIMED · QUEUEING · INTELLIGENT · VOCAL (`:206-213`); `AIMED.pull` the only client buffer fetch (`:217-229`). Phases inert ⚏ · manual ⚎ · continuous ⚌ · escort ⚍ (`:233-239`); `thread.engage(name)` THE phase gate (`:241`).
- Mode → screen three doors: strips `/metadata/{application,emitter,aperture,harness}`, bundle (`.svelte.mjs` under `/attached/bundle/<host>/<mode>`), wires (`:270-274`). Svelte wrapper mount fn (`:303-310`); panel A view pick drawn > application (`:316-323`); Frame mounts, remount identity `(buffer, view identity, terminal)` (`:340`); buffer view reads/writes `buffer.data`, calls `mode.call/emit/harness`, finishes `buffer.release()` (row DELETED) (`:342-347`).
- Terminal closure object (`:353-374`), Stall per thread, hydrate/persist/settle with tri-state outcomes (`:394-405`).
- **§7 bridge: T-bone, pincer, bones, panels** (`:409-493`) — ENTIRELY pincer-era: pincer = junction POSITION; viket = 45px draggable component; T-bone = four 45px bones; orientation 0/90/180/270; gestures table (`:447-453`); shoulder (Phase, ActivityTracker, Dock toggle), crown (terminal tabs, `+`), pincer (radial), spine (lighthouse dot + daemon dots); panels A stage · B rail · C panes D/E/F · G telemetry · H inspector. `bridge` persisted `layout`(pincer…) · `view` · `panes` · `$composer`.
- **§8 dock** (`:497-531`): per terminal; `DEFAULT_DOCK = {side:"right", share:.32, collapsed:true, full:false}`; Dock.svelte streams `harness.dialogue.stream` via `soma.scan`; history = `thread.$turns` (repo rows, never component state); echo dropped by id; stop press SIGTERM / 2s hold SIGKILL; dictation via `verbatim`; keys Enter sends, ↑ recall, Esc cancel/stop.
- §9 dapper (old skeleton pipeline, `:550-565` — STALE vs design.md m72) · drapes Svelte 5 kit barrel (`:567-599`) — drapes was BOTH anima chrome AND the only UI lib a buffer bundle may import.
- §10 wire (`:605-624`); §11 drift (`:630-639`): e.g. two gates — D lists modes by `application|conversational`, dock gates on HARNESSED.

## C · design system — design.md (09-28, m72)

Locked nouns (still the contract unless m95 rules otherwise):
- **token space** = the contract: 94 keys in seven groups + four zones × 12 ground keys (`design.md:7`). `brand` (outline·glow·filter) "identity, never state: the pincer's ring, its inset glow, its mark's filter" (`:7`) — pincer reference STALE; brand's job needs a new host.
- **theme** = a definition `theme()` completes into the whole space (`:8`); **zone** = a territory of the interface, depth inside it (`:9`); **view** reads tokens by name inside a zone, never names a colour, zone number or theme (`:10`).
- Three packages (`:12`): dapper completes themes + emits sheet at build; "drapes is the Svelte component kit"; "sheets is the terminal kit and shares nothing with either" — BOTH STALE (drapes now `drapes/dom` Solid; sheets dead; tty kit is `systems/ghost/surface/chrome`).
- Pipe definition → fill → derive → merge → Theme → emit (`:18-26`).
- **Zones** (`:34-39`): 0 chrome (the application's own interface) · 1 body (content: thread, buffer, mode shows; default) · 2 island · 3 bench (instruments). `data-zone` set once on territory's outermost box. Depth steps surface · surface-sunk · surface-lift · control.* (`:45-50`). Zones nest any order, no elevation ladder (`:52`). "A place takes its zone by what it is, never by how dark it should look" (`:54`).
- anima places table (`:58-72`): shoulder/crown/spine 0, **pincer 0**, rail B 0, rail C + panes D E G 0, stage A 1, dock/composer 1, chat turns 1, buffers 1, island-mode 2, inspector/logger/debug 3, menus = the zone that opened them. Pincer/shoulder/spine/rails rows stale for depincered chrome.
- Token tree (`:80-174`), counts (`:176-181`) — note: header says 94, table says 85 root keys (`:178`) — internal inconsistency (brand/font groups likely the gap).
- Eight word axes (`:187-196`); roles (`:198-206`); `ink` on ground vs `on` on fill (`:219`). "Three things never trade places: surface is the ground, contrast is the fill of a thing on it, text is text." (`:230`)
- Sheet emission (`:255-294`): group keys prefixed, ground keys bare; theme root = zone 1 whole; every zone block re-declares all 97.
- View laws (`:308-315`): "A hex in a view is a defect. A zone number in a view is the same defect." (`:308`)
- Themes northsea · parchment · porcelain · datasette (`:404-411`); contrast floors (`:415-421`).
- Designer mapping (`:430-489`): designer's six-zone depth ladder → ours; `data-bone="chassis"` = shoulder · pincer · crown · spine · pane strips → zone 0 (`:444`); `--viket*`, `--bone-viket` open (`:464`, `:478`).
- **Open points §11** (`:495-505`): rails B/C zone 0|1; panes D E G/F; who sets zone 2 (mode declares island | host decides); key rest shadow · mark variant; text floor five|four steps; fonts RULED 09-28 inside theme (`:502`, → `quests/done/m73…:219`, `client-design-briefing-ii.md` §1); who reads `--size-*`; parchment key fill 1.00:1; boundary-strong floor. Mostly unanswered here.
- tty side: dapper tokens for tty came later — map.md shows `tokens("northsea","2")` in `systems/ghost/surface/chrome/index.js:24` (codestyle); compendium milestone 3 names `dapper.tokens(theme, zone)` (`m82-clients-compendium.md:79`).

## D · tui.md (10-05, ink) — what survives

- **Glossary** (`tui.md:36-66`) — house nouns, "never a synonym ('pane' is not a terminal, 'chat window' is not the dock)" (`:36`):
  - terminal = runtime row seating ONE thread (+buffer+dock) for a user `user · daemon · thread · index · traits · trait` (`:46`; Terminal.ts verbatim `m82-clients-compendium.md:1711-1765`).
  - thread (`:47`), buffer "IS one screen of a mode" (`:48`), dock = chat surface of a HARNESSED mode, one per terminal: transcript, live turn, composer (`:49`), turn (`:50`), activity (`:51`), home /"home is an identity trait."/ (`:52`), yap (`:53`), command `noun/verb` (`:54`), reference (`:55`).
  - **chrome — three meanings** (`:56`): sheets `Chrome.jsx` = Background+Logo (dead); anima zone 0 "the application's own interface"; m79 beef /"i guess chrome might be how we name the custom interactive fullscreen components."/ (m79 :35).
  - slot (`:57`) = region where an inline command paints (m79); sheets = "ink 5 + react 18" (`:58`) STALE; drapes = "Svelte component kit" (`:60`) STALE; anima "SvelteKit on :1794" (`:61`) STALE stack.
- §1 medium facts: generic terminal truths still valid — grid of cells (`:76`), 16 ANSI names user-palette (`:101`), wide-glyph hazards CJK (`:116-120`), alternate screen vs inline (`:143-151`), program cannot know bg/palette/font (`:167-169`), pipes/`ctx.interactive` (`:155-165`). INK-SPECIFIC (stale): ink no box fill (`:104`), ink `useInput` key flags / no Home/End/mouse (`:124-141`), `Static` append-only (`:151`). OpenTUI has box backgrounds and its own key parser — re-verify.
- §2-3 sheets inventory + ghost screens (`:173-836`): all ink, dead (`subsystems/sheets` has only `bak/`, tree 10-19). Useful as a census of screens to re-create (help list/detail, Effect, picker, instance/init wizard 6 phases, ledger/init, two Doctors, delete Confirm, `--buffer`).
- §4 self-marked STALE (`:840`).
- §5 anima chrome (pincer era): layout by pincer position + orientation, not CSS grid (`:913`); C panes six `terminal · navigation · thread · mode · buffer · harness` (`:954`) — note compendium panes.js shows EIGHT `terminal, threads, modes, thread, mode, buffers, buffer, harness` (`m82-clients-compendium.md:7533`); folds `page · stack · accordion · free`. Strip width-degrading ladder (`:959`) = "closest thing anima has to a width-breakpoint policy; a terminal status row will need one".
- **FOCUS LAW** (`:996`): /"ONE field element per session, no `{#key}`, never `disabled`/`readonly` (revert `oninput`); `subsystems/drapes/controls/Keyboard.svelte` is the offscreen holder."/ (codemap anima.md:19) — terminal analogue "one live input at a time". Svelte-worded; principle survives, rhymes with tty-render `$held` latch.
- §6 m79 designed chrome — beef verbatim (`:1006-1010`): /"plain cli to active continuous client"/; /"execution … elevate … interactive component - ctx head stays inside the effect. chrome - where we render our UI but stay in the effect. and shell where we drop the ctx / head back"/; /"a terminal (entity in lighthouse and container in anima) exists to render buffers and docks … only ever one buffer per cli … inline and interactive. interactive rendering the vivalence chrome and multiple terminals."/; /"we dont start with rendering mode buffers tho … i want to start with chat and the harness"/; yap → home, ambivalent → selection screen; no-match choice /"send to $home, retry search, open as turn"/.
- §6 QUESTIONED list (`:1100-1113`), 14 items, designer-facing: (1) status row contents/place; (2) input line place + multi-line growth; (3) streaming paint live vs line commits; (4) tool calls/activity in cells; (5) errors; (6) key-hint footer always/on-demand `?`; (7) truecolor from dapper; (8) light vs dark terminals; (9) widths 80/120/200; (10) what persists to scrollback; (11) command inline render vs transcript sharing; (12) choice third option F8 + picker look; (13) fullscreen vs inline F12; (14) terminals table M13. Answered-by-later: (13) partly — m82/m86 three ways cut·captured·chrome, chrome fullscreen (`m82-clients-compendium.md:41`; tty-render `:316-321`). (7) partly — tokens to tty (`chrome/index.js:24` `tokens("northsea","2")`). Rest not answered in these refs.
- §7 mapping table anima→terminal (`:1119-1135`); pincer → "none" (`:1129`); zone-0 hexes per theme (`:1143-1160`) with facts: dapper has no magenta; datasette primary=negative collide (`:1166`); parchment caution is dark rose (`:1167`). Truecolor options (`:1181-1186`): nearest-ANSI vs COLORTERM passthrough (passthrough without ground painting recreates polarity problem — opentui CAN paint grounds).
- §8 Emacs/tmux/Neovim chrome summary (`:1192-1196`) — status row tied to content, ONE bottom line for prompts+messages.
- §9 designer brief deliverables (`:1202-1212`).

## E · stale assumptions vs settled direction (Solid · OpenTUI · REPL · keymap Vector · no pincer)

| assumption | where | settled / tree 10-19 |
|---|---|---|
| sheets = ink 5 + react 18 terminal kit | `tui.md:58,175`; `design.md:12`; compendium Dock.jsx rig `:10204` imports `@vivalence/sheets` React/useInput | ink dead (Q10 /"opentui instead of ink. no ink."/ `m82-clients-compendium.md:419`); `subsystems/sheets/` only `bak/` |
| tty kit lives in `subsystems/drapes/tty/` → moves to sheets (beef mark /"sheets is the interface/surface between dapper and ghost"/) | `tty-render.md:4,261,277` | sheets DEAD (map.md); `subsystems/drapes/tty` absent; kit is `systems/ghost/surface/chrome/{bundle,paint,palette,keys,text,views,panes,host}.js` (tree) |
| m86 tangle path `systems/ghost/chrome/` | `tty-render.md:4`, `:299` | actual `systems/ghost/surface/chrome/` (m91 subject-first) |
| drapes = Svelte 5 kit for anima chrome + buffer bundles | `design.md:12`; `anima.md:567-599`; `tui.md:60` | `drapes/dom` is Solid (`Button.jsx · chassis.jsx · surface.js · keys.js …`, tree); map.md: drapes `./dom` red (`chassis.jsx:3` `belt.dock`); compendium ruling kits `@vivalence/drapes/{dom,tty,svelte,state}`, `drapes/svelte` stays for mode apps (`m82-clients-compendium.md:23`) |
| anima = SvelteKit | `anima.md:5`; `tui.md:61`; compendium vite config `sveltekit()` `:7702,7806` | ruling "Solid, SvelteKit out" (`m82-clients-compendium.md:23`); map.md: anima does NOT build |
| `View` record / `buffer.$view` / `mode.$application.view` | `anima.md:141,172,316-323,340`; ghost-arch `:442` | "View is dead", `Buffer.$bundle`, Frame takes `bundle + accept` (`m82-clients-compendium.md:58`); Q6 `View` folded into `Bundle`, buffer key `view`→`bundle` (`:415`); map.md: View left typology |
| `.svelte.mjs` bundle names | `anima.md:273,623` | `<hash16>.dom.svelte.mjs` (Q14 `m82-clients-compendium.md:427`) |
| pincer · viket · T-bone · bones · orientation · radial | `anima.md:409-493`; `design.md:7,61,444,464,478`; `tui.md:913,951,1129`; ghost-arch `:628,632` ("the pincer is M-x and which-key in one key") | dropped (m95); already PARKED in m82 (`m82-clients-compendium.md:42`: "pane verbs (`tap · solo · remove`, `panes.js`) ride a strip and keys"). Note ghost-arch's reading: pincer = palette = `M-x`+which-key → its successor is the REPL leader / which-key from the trie |
| `brand` token = pincer ring/glow/mark filter | `design.md:7` | needs a new referent once pincer dies |
| ink facts: no box fill, `Static` append-only, ink key flags, one ink instance | `tui.md:104,124-141,151` | OpenTUI: boxes paint, split-footer vs alternate-screen, `useKeyboard` flat global list (`tty-render.md:193-223`) |
| m79 `view.emit/render/shell`, `Fullscreen.jsx`, `Slot.jsx`, `Dock.jsx`, F12 | `tui.md:863-889,1012-1024` | three ways cut·captured·chrome (`m82-clients-compendium.md:41`, m79 law `:440`); `ctx.view.hold/emit` kinds (`tty-render.md`) |
| `ShellSignal`/`ShellContext` | compendium `:9342,9409`; `:59` | die into argv-on-Signal; reader is `ReplSignal` (`:25`). map.md codestyle cites `subsystems/typology/prototypes/replsignal.js:6` (now in typology) |
| `ctx.daemon`, `Daemon` dossier, `/viva/<lh>/<slug>` links, `flatmodes()` | `anima.md:107,90`; ghost-arch `:5` | flat host words; Q1 host noun; Q4 dead links (`m82-clients-compendium.md:410,413`) |
| lighthouse separate server, `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` | `anima.md:50,605` | m80 lighthouse inside runtime `/lighthouse/…` (`tui.md:44`; compendium `:68`) |
| `belt.dock` in drapes chassis | (map.md `chassis.jsx:3`) | ghost's `belt` = `harness` only → red |
| old dapper skeleton pipeline | `anima.md:537-565` | m72 token space (`design.md`) |
| comparison: precedence "owed in typology" | compendium `:24,278,397`; ghost-arch risk 4 `:645` | still "NOT picked" for match.feed (`m82-clients-compendium.md:25`) — check if landed |

## F · locked design nouns (meaning + where locked)

- **client** — a DIE like the runtime's: `{controller, mask, client, loop: new Vector(), queue: new Queue()}`; boot vector = runtime execution one for one; root effect = REPL drain (runtime's = keepalive) (`m82-clients-compendium.md:32`, spec `:186-226`). Client vector table runtime↔client (`:86-97`). Paladin never in a typology barrel (`:47`) /"We don't ever, ever, ever want Paladin inside of typology."/.
- **Loop** — RULED name beef 10-10 /"we call it 'Loop'"/ (`:140`); then RULED no `Loop` class: "the name Loop stays for the whole (die · vector · queue · drain)" (`:173`). No `db`, no `fx`, no `Ring` (`:36`).
- **REPL** — Read `new ReplSignal(input)` · Eval `steer.dispatch.invoke(die.loop, signal, evaluate)` · Print session atoms · Loop `die.queue.drain(abort)` (`:33`, table `:175-181`). /"I really like the REPL paradigm. Fuck yes."/ (`:173`). /"a REPL that has chat built in. So like Emacs is a client built into the Lisp REPL."/ (`:136`).
- **ReplSignal** — beef /"custom signal. replsignal."/ (`:25`, `:309`); rows: bare line → root effect (turn), `/`-sigil → `command` + Signal grammar, argv → `command`, event `{signal,input}` → path, key `{key}` → `key` + chord (`:280-306`). `command` prefix keeps a typed `/turn/packet` from reaching internal events (`:309`).
- **channels** — Queue in · Pipe through (`Pipe.reactive(null, soma.transcript)` → `live`) · Span what happened (`:34`, `:183`). Atoms are the PRINT side only (`:274`).
- **session atoms** — `$seat · $live · $echo · $slot · $chord` (`:150`); `contexts.session` = seat · live · echo · slot · chord (`:169`); `contexts.client = {...lighthouse, ...root, ...userspace, ...hosts, ...terminals, ...bridge}` (`:168`; Q17 open `:425`).
- **slot** — "the minibuffer | `$slot` — what the last command painted" (`:161`); errors paint the slot via `capturing` (Q18 RULED `:426`, `:35`). In m79: region where an inline command paints (`tui.md:57`).
- **crown** — "the mode line | the crown" (`:163`); tty chassis box `crown` (`tty-render.md:185`); anima crown = terminal tabs (`anima.md:441`). ghost-arch maps status line ↔ crown, "fed by rare-changing atoms, never by `$live`" (`ghost-architecture-comparison.md:623,631`).
- **leader / which-key** — beef /"spacemacs"/ (`:357`): `/` the leader in the composer, `SPC` when a frame/navigation has focus; which-key from the trie (`steer.trie.at`, owed `:382`); `/ /` or `/ ?` = M-x; `/,` = seated mode's branch; a **layer** = a mode's EXPOSED strip under `/command/<slug>` + APPLICATION keys under `/key/<slug>`, grafted on seat, pruned on unseat; `esc` in held chord = C-g (`:38`, table `:359-367`). `/repl/chord` handler (`:369-380`).
- **keys** — a target's keydown → `/key/<chord>`, seated mode's branch first (`:355`); APPLICATION record carries `keys` → `/key/<slug>` (`:343-352`); runtime cost: `application.keys` (`:401`). (Keymap Vector = m92, not in these refs.)
- **mode events** — two seams, both DATA (`:329`): EXPOSED → commands under `/command/<slug>`; APPLICATION → keys under `/key/<slug>`. Mount contract adds `dispatch` prop: `module.default(target, {…props, dispatch: client.dispatch})`; ghost trajectory grafts whole under `/command` → argv and composer are ONE trie, ONE census (`:355`).
- **three ways on a tty** — cut (inline, one-off) · captured (inline, ongoing) · chrome (fullscreen, ongoing) (`:41`; m79 law `:440` "beef 10-06"; alt screen is "one escape pair in one sheets primitive" — sheets stale).
- **chrome** (tty) — "holds nothing. It PAINTS panes into fixed chassis boxes" (`tty-render.md:154`); the only second geometry (`:323`).
- **pane / chassis / box (slot)** — chassis boxes `crown · navigation · frame · dock · cover` (+ proposed `held`) (`tty-render.md:185,303`); pane = a Solid component painted into a box via `SLOTS` map. Note "slot" overloaded: chassis `slots.*` boxes vs session `$slot` minibuffer.
- **frame** — chassis box shown when a buffer is open (`tty-render.md:170,186`); anima `Frame` = drapes buffer mount (`anima.md:326-340`).
- **dock** — chat surface of a HARNESSED mode, one per terminal (`tui.md:49`; `anima.md:499`); tty chassis box `dock`, composer inside sends to dispatch (`tty-render.md:188`).
- **navigation** — chassis box; pane shown when authorized (`tty-render.md:186`).
- **cover** — box shared by `signin` and `boot` (`tty-render.md:185`).
- **five screens** — boot · signin · chat · buffer · navigation, both clients, "same layout law, the composer first" (`m82-clients-compendium.md:17`).
- **targets** — `dom` · `tty` (Q13 /"dom and tty."/, REJECTED `opentui · tui · cells · terminal · host`) (`:422`).
- **mime / renderer table** — one mime per row `application/vnd.vivalence.<target>.<framework>+javascript`, beef /"kind dies."/ /"other way round. group.target.framework"/ (`:422`); tree `scalars/mime.js`: `dom.{svelte,html,react,solid}` · `tty.{react,solid}`. `Bundle.negotiate(accept)` picks first offered (`:3907-3913`); anima ACCEPT `[mime.dom.svelte, mime.dom.html]` (`:8268`). Q7 RULED model picks medium (`tty.solid`) from harness `accept` line (`:416`). Q11 RULED /"we dont reuse apps across render targets. lets keep it simple."/ — anima never mounts `mime.tty.*`; a buffer without `mime.dom.*` "falls to the floor there" (`:420`) → **floor** = fallback when no accepted mime.
- **artifact** — only appears as bundle artifacts `<hash16>.svelte.mjs` (`:427`); m87 bundled-artifacts quest not in these refs.
- **application bundle** — the APPLICATION seam: buffer views bundled server-side, loaded by id; the only route for mode UI (codemap invariants cited `ghost-architecture-comparison.md:444`); bundle = Bundle entries keyed by mime (`m82-clients-compendium.md:3874-3940`).
- **opentui install law** — Q12 /"patch step in ghost/install. thats what its for."/: patch `@opentui/core` by CONTENT anchor, idempotent, fail naming version; pin EXACT 0.5.17; bump = re-pin + re-run rig + re-cut (`:421`). Tree: patch now at `systems/ghost/surface/chrome/host/opentui-core.patch`.
- **terminal / thread / buffer / mode** — see B; "only ever one buffer per cli" (m79, `tui.md:1023`).
- **minibuffer / palette** — minibuffer = `$slot` (`:161`); palette in tty-render = colour palette context (`usePalette`), in ghost-arch "pincer, the palette" (`:628`) = command palette. Two meanings — flag.
- **zone / token / theme / view** — design.md §C.

## G · open forks / unanswered (from these refs)

- tty-render §8 1-5 (above) — held-slot placement, key ownership, tty repl without chrome, kind→component in surface, typing out of key feed.
- compendium QUESTIONED (`m82-clients-compendium.md:408-427`): Q1 host noun; Q2 `Terminal.daemon` column dies?; Q3 one wired root vs call per host; Q4 dead links; Q5 rebuild in place vs beside; Q15 home mode ownership; Q16 how client record reaches a browser (`PUBLIC_VIVA_CLIENT_HOME` vs `/metadata/clients`); Q17 `contexts.client` word list. Ruled: Q6 Q7 Q8(killed) Q9(superseded) Q10 Q11 Q12 Q13 Q14(a) Q18.
- precedence law in `match.feed` NOT picked (`:25`); mode layer grafted after `/command/(.*)` loses to it (`:26`, `:397`).
- `steer.trie.at` owed (`:382`) — check tree.
- design.md §11 open points (rails B/C — moot without pincer; who sets zone 2; text floor; `--size-*` readers; contrast floors).
- tui.md §6 QUESTIONED 1-12, 14 (status row, input placement, streaming paint, tool rows, errors, hints, truecolor, light/dark, widths, scrollback, command vs transcript, F8, terminals table).
- ghost-arch: §4.3 options i/ii/iii for mode→ghost wiring (largely answered by compendium's EXPOSED/APPLICATION seams = option ii-a-ish + keys); trait names OPERATED · COMMANDED · HAUNTED, SHEETED · CONSOLED all QUESTIONED (`:502-510`, `:555`); risk table 1-14 (`:640-655`), esp. risk 1 client composes mode paths (`anima mode.js:62`), risk 2 redisplay per delta — crown off `$live`, risk 3 no wire version, risk 4 precedence by source, risk 5 recursive entry in shell, risk 10 esc destroys detach/attach, risk 14 client announces nothing (a client card `{client, renders}` on handshake — relates to accept/mime).
- ghost-arch §5.3 chrome surfaces QUESTIONED (`:609-617`): which nouns in status line + may a mode add a segment; input line chrome-owned vs body-owned; message area separate row vs transcript; one body vs tiled; key hints declared per body vs which-key after prefix (latter = Spacemacs ruling). Acme tag idea: status line words = live commands (`:634`).

## H · dependencies (mNN mentions)

- m72 zoned designs → design.md (`design.md:3,511`); m73 fonts ruling (`design.md:502`).
- m79 terminal ghost (benched→discarded per git status) — grammar source for m82 (`m82-clients-compendium.md:71`); its law block (`:432-448`); F4 home, F8 choice, F11 per-session row, F12 alt screen, F15 doors on trajectory, F16 dock grammar, F17 mode terminal face, M13 terminals table.
- m80 lighthouse into runtime (`tui.md:44`); m81 hosts `/runtime/<slug>` (`tui.md:40`; ghost-arch `:5`).
- m82 runtime clients (done) — the Loop synthesis; m86 repl loop clients (done) — tangle `chrome/surface.js`, `lifecycle/repl/integration.js`, handover (`testament-probes.md:64-68`; `tty-render.md:341`); m84 H4 grows home harness (`m82-clients-compendium.md:24,51`); m91 subject-first (paths moved).
- Milestones m82 (`:75-82`): 3 `drapes/dom` + `drapes/tty` + `dapper.tokens(theme, zone)`; 4 ghost chrome on OpenTUI/Solid; 5 anima on Solid, SvelteKit out; 6 the swap — m95 inherits 3-6.

## I · rigs — testament-probes.md

- opentui rig 10-10 (`testament-probes.md:8,15-34`): yes on Deno after patch + `node:ffi` stand-in (`deno-ffi.js` over `Deno.dlopen`), preload makes Worker a module worker; Solid × opentui 16 scenarios; lesson app × {solid,react} × {opentui,dom}; remote xterm.js route REJECTED (Q11). "React and ink are dead (m86)" (`:34`). Solid×opentui path became `subsystems/drapes/tty` + sheets host (`:34`) — STALE, now ghost/surface/chrome.
- solid-vite rig 10-11 (`:36-58`): **anima's build path** PASSES build+static and vite dev (0→3 clicks, 0 errors). Pins deno 2.9.6 · vite 6.3.3 · vite-plugin-solid 2.11.10 · solid-js 1.9.12. No `@deno/vite-plugin` needed; `nodeModulesDir:"auto"`; anima would read ROOT `import_map.json` needing exact entries for `vite-plugin-solid`, `solid-js` (`:57`); favicon 404 counts as console error → `<link rel="icon" href="data:,">` (`:58`). Vite conditions avoid the server.js trap (`:55`).
- probe-die / probe-twin (`:60-62`): headless ghost client signup + seat on `hello`; import `../systems/ghost/client.js` — gone, dead until re-pointed.
- handover (`:64-68`): shell → repl · chrome controller tree, needs `shard.controller.hold` (absent on 10-10 tree).
- m82 snapshot (`:70-80`): `testament/m82-clients-20261012/` systems/{anima,ghost} + subsystems/{dapper,drapes,sheets}; does not run standalone.


### appendix: known-issues

# known-issues.org: client-related entries (verdict: OBSOLETE / FIX / INHERIT / n/a)
Terms: rewrite = client rewrite (anima SvelteKit -> ghost/drapes/dapper, Bundle.load(accept)).

## Directly client (10-16/10-19, post-m86)
- 48 frame-keys-leak-into-dock: ghost chrome Input.jsx global useKeyboard swallows chess d/f keys. INHERIT unless keymap (m92) scopes focus.
- 58 chess-kit-open-sets-terminal-buffer: chess kit assigns terminal.buffer, ghost terminal has no setter. INHERIT (tty mount of kit).
- 68 ghost-scenario-boots-nothing: ghost/scenario task exits (no main). INHERIT; rewrite must give scenarios a main.
- 78 frame-bag-drift: three frame ctx bags (ghost frame.jsx, drapes Frame.svelte, drapes dom frame.jsx). FIX if rewrite picks one bag; else INHERIT.
- 126 anima-child-behind-deno-task: anima spawned via deno task->vite, orphan on SIGKILL, :1794. OBSOLETE if anima retires, else INHERIT.
- 146 ghost-does-paladins-work: ghost reads env/cwd/ledger by hand (10 sites). INHERIT.
- 2854 ghost-ctx-call-keeps-the-callers-signal: ctx.call does not rebind signal (shell/integration.js:18). INHERIT; m86 shell may have moved it, recheck.
- 2826 ghost strata.wet two shells parallel flips: test flake. INHERIT.
- 1028 ghost-ledger-test-init-step-red-pre-existing. INHERIT (check).
- 1909 ghost-spans-never-reach-disk: ghost/mod.js pipe commented. INHERIT (ruling owed).
- 2868 drapes-dom-kit-imports-belt-from-ghost: drapes/dom chassis.jsx:3 belt.dock red. FIX only if dock/belt rewritten; INHERIT otherwise.
- 2882 anima-imports-view-from-typology: anima does not build, View gone. OBSOLETE if anima replaced; the wire drift (record.view vs bundle) FIX in rewrite.
- 2940 memo-tty-face-on-dead-sheets: tty shows Floor JsonTree not memo view. FIX (tty.solid bundle path).
- 2954 qa-rig-red-after-the-m86-client-rebuild: tests/qa rig drives pre-m86 verbs. FIX (rewrite rig).
- 2602 sheets-pads-columns-by-string-length (CJK/emoji). sheets DEAD: OBSOLETE; INHERIT if width logic moves to tty.
- 2628 sheets-textinput-inserts-CR-from-merged-chunk. OBSOLETE (sheets dead); input handling INHERIT.
- 2737 sheets-textinput-drops-keys-faster-than-a-commit (stale closure). OBSOLETE (sheets dead); pattern INHERIT for solid/opentui inputs.
- 2751 sheets-table-sizes-from-deno-console. OBSOLETE (sheets dead).
- 2723 anima-interactive-activity-stdout-tail: anima test fails at :86. INHERIT/obsolete with anima.

## Anima UI (svelte)
- 1863 anima-section-row-global-leaks-into-modes: :global(section .row) in Section.svelte. OBSOLETE if anima dies; else INHERIT.
- 1877 conversation-error-close-never-faults: /response/close error never sets $error. INHERIT (conversation drain).
- 1973 dock-never-shows-conversation-error: Dock reads only recorder.$error. INHERIT unless new dock consumes it.
- 2019 d-panel-buffer-count-counts-only-loaded-buffers. OBSOLETE with anima panel d.
- 2033 anima-thread-traits-drift-from-the-runtime-row. OBSOLETE with anima; INHERIT as wire drift.
- 28 box-audio-lifecycle-leaks: anima/src/box audio/mic. INHERIT if box ported.
- 18 box-sample-rate-hardcoded-16k. INHERIT if box ported.
- 38 ctx-vocal-typed-boolean: typology contract, not client. INHERIT.
- 1849 guide-buffer-points-at-a-missing-guide (editor half): buffer app falls back never. INHERIT.
- 1511 dojo-view-refused-without-a-terminal-daemon: opening buffer with no terminal daemon. INHERIT.
- 1941 aprende-message-reads-render-object: education mode, not client. n/a.

## Bundles / bundler (application)
- 212 v-facade-pins-typebox-in-every-client-bundle: 292 KB typebox. FIX only if Bundle.load drops v in client; else INHERIT.
- 549 typology-client-barrel-tdz: mod.client.js TDZ on Signature. INHERIT (recheck).
- 1075 buffer-app-bundles-carry-2.6-mb-of-dead-weight. INHERIT; a new bundler may fix.
- 1150 bundle-store-never-prunes (757 artifacts). INHERIT.
- 1385 bundler-spams-the-mountpoint (3.7G, hash per boot). INHERIT.
- 1535 four-ui-surfaces-ship-a-successor-beside-the-incumbent: dapper two colour contracts (1549), primitives/ dead fork (1571), drapes context/ (1587), anima/education. FIX only if rewrite deletes incumbents; likely the rewrite is the successor, so INHERIT risk.

## Lower relevance (touch client)
- 652 account-switch leak same tab (client). INHERIT (check auth in new client).
- 1768 hello-world App.svelte reads two unpinned fields. INHERIT.
- 792 readme-linux-walk-defects (ghost defects). partly INHERIT.
- 893 ghost-strata-wet-test-reads-dead-pids (merged note). INHERIT.
- 2129 pages-drawn-before-m72-hold-retired-tokens (dapper tokens). INHERIT.
