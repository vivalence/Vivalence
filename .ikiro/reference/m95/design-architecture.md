# m95 — the design, as a codemap (10-21)

<!-- limit: 28000 chars · D = ~/Downloads/vivalence-client-v1/build/src/ · the demo is spec for behaviour · regions · verbs · look, never for folders · a `// ours` fence is what carries it today or the ruling's hunk -->

Five closures over one object. Each a layer, each with an owner in the tree. The sim dies.

```text
D/ring.js   1082   world · verbs · dispatch · keymap · sections · telemetry · sim     → entities · shard.repl · m92 · each chrome's fold
D/dom.js     449   skeleton + 14 region painters, string-patched                       → systems/anima (Solid DOM, drapes parts)
D/tty.js     729   cell grid, 10 painters, own onKey (a browser emulation)              → systems/ghost/surface/chrome (OpenTUI, sheets parts)
D/design.js  251   zones · themes · tokens · type · signs · 13 parts · a11y · handoff   → each library's fixture page
D/app.js     341   boot · hash route · localStorage · 80 ms tick · click → dispatch     → ghost/run.js · anima/src/client.js
```

## 1 · world → entities

```js
// D/ring.js:26 world()
theme: "northsea", face: "dom", width, height, clock, booted, boot,
lighthouse: { origin, traits: ["JOINABLE","AUTOLOGIN"], standing: "VERIFIED", user: "beef", expires },
signin: null,
runtime: { ref: "/runtime/localhost", status: "HEALTHY", latency, daemons: [{ slug, ref, status }] },
client: { ref: "/client/anima", home: "/client/anima/mode/home/console" },
modes: [ mode("/daemon/chess", "board", "play", ["HARNESSED","ARTIFACTUAL","EXPOSED","TOOLING","KEYMAPPED","LOOPING"], { keymap: [["leader/m/n", "/game new", "a new game"], …] }), … ],
artifacts: { a1: { slug: "play", mime: MIME.dom, target: "frame", mode, mount: "buffer/Play.svelte", bytes, hash }, … },   // = m87 View
buffers:   { b1: { label: "play #1", mode, thread: "th1", turns: [], artifacts: ["a1","a2","c1",…], kind: "chess", data: { moves, ply, flipped } } },
threads:   [{ id, label, mode, h: { tune, effort, rounds }, run: null, fault: null, off: {}, toolsOff: {}, buffers: ["b1"], journal: [rec(…)] }],
terminals: [{ id: "t1", thread: "th1", frame: "b1", draft: "", dock: { align: "right", share: 42, view: "docked" } }],
active: 0,
sidebar: { open, width }, filter, expand, hostsOff, sbHide, dpick, wid, pop, phonePane, lens, chord, panel, focus, jsel, rsel,   // client memory
box: { mic, speaker, level, tone }, voice, comp: { atts, dict, tail, hist, hi },
tty: { shell: "cockpit", sidebar, gfx: "auto" },
tele: { … },   // m89
```
```js
// ours — the die already splits it
// systems/ghost/client/prototype.js:5        Client { controller, mask, register, instance, surface, modes, repl, runtime, $active }  + theme · $catalog (rulings 5 · 13)
// systems/ghost/entities/terminal/prototype.js:5   Terminal { id, user, daemon, index, traits, trait, client, runtime, repl, $thread, $buffer }  + dispatch · dock (rulings 6 · 19)
// systems/runtime/entities/Terminal.ts · Thread.ts · Buffer.ts · Turn.ts · Activity.ts:32 · User.ts   the rows that mirror
// systems/ghost/entities/lighthouse/prototype.js   STANDINGS = w.lighthouse.standing; client.runtime.lighthouse.$status/$user/$authority
// lock 8: draft · chord · panel · focus · jsel · sidebar · filter · phonePane · lens · shell  — never a row
```
```js
// m94-trait-rejiggle.org:30-34 + ruling 19 — the only new columns
DOCKED  = { align: "left"|"right"|"top"|"bottom", share: 20..80, view: "docked"|"full"|"closed"|"messenger" }   // Terminal · User · Client
THEMED  = "northsea"|"parchment"|"porcelain"|"datasette"                                                      // Client · User
HARNESSED (thread) = { tune: "frugal"|"fast"|"capable", effort: "none"|"low"|"medium"|"high", rounds: 1..50 }  // w.threads[].h
```

## 2 · dispatch → shard.repl

```js
// D/ring.js:122
const dispatch = (w, line, opt) => {
  const text = String(line || "").trim();
  if (text[0] !== "/") { turn(w, th, text); return; }                              // a bare line is a turn when HARNESSED
  const cmd = find(w, nature);
  if (!cmd) { push(w, th, rec("fault", `${nature}: not found`, { path })); return; }
  const r = echo ? push(w, th, rec("cmd", text, { path })) : null;                  // the echo record
  try { out = cmd.run(arg); } catch (e) { push(w, th, rec("fault", `${nature}: ${e.message}`, { path })); return; }
  if (r && out !== null) { if (typeof out === "string") r.ans = out; else r.block = out; }
  return out;
};
// D/ring.js:400 — a verb
{ nature: "/tune", args: "frugal|fast|capable", valence: "the model tune", chord: "leader/h/t", options: () => chooseItems(w, "tune"), run: (a) => setH(th, "tune", a, TUNES) },
{ nature: "/dock", args: "docked|full|closed|messenger|next|left|right|top|bottom|20–80", chord: "leader/d/d", options: () => chooseItems(w, "view").concat(chooseItems(w, "align")), run: (a) => cmdDock(w, a) },
// run() returns: string (the ans) · null · { type: "table", head, rows } · { type: "select", options: [{ label, line }] } · { type: "form", kind, thread } · { type: "artifact", artifact } · { type: "keymap" }
```
```js
// ours
// systems/ghost/gestalten/shard/repl.js:22
export const compose = (client, terminal) =>
  new Vector().graft(client.repl, ...fromm.modes(client.modes).flat.map((mode) => mode.repl),
    ...(terminal === null ? [] : [terminal.repl, ...client.runtime.entities.mode.$entities.get().map(scoped), ...(harnessed(terminal) ? [turn] : [])]));
// systems/ghost/client/commands/quit.js:3 — the verb shape; every effect → { condition, output }
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
// subsystems/typology/prototypes/pattern.js:30 — chord: rides the pattern (m92)
// subsystems/drapes/dom/panes/dock.jsx:1070 — the output renderer IS a [[predicate, Part]] table already
const SLOTS = [
  [(slot) => typeof slot !== "object", (props) => <JsonTree value={props.slot} />],
  [(slot) => Array.isArray(slot.which), Which],
  [(slot) => "fault" in slot, (props) => <Empty tone="negative" verb="fault" trace={text(props.slot.fault)} />],
  [(slot) => Array.isArray(slot.pick), Pick],
  [() => true, (props) => <JsonTree value={props.slot} openDepth={1} />],
];
```
```text
ruling 20 — owners
client   /help /quit /terminal /theme /runtime /lighthouse /journal /sidebar /shell /mic /speaker /voice /go
terminal /thread /mode /buffer /artifacts /artifact /pause /resume /stop /abort /activity /approve /skip /edit /tune /effort /rounds /context /tools /dock /split /attach /dictate /paste /turn
mode     /mode/<type>/<slug>/…  (chess: /game /ply /move · memo: /reveal /grade · home: /hello /whoami)
dead     /face /design (ruling 21) · /set /telemetry /signal (m89) · /graphics /filter/daemon /sidebar/show /sidebar/width (drill Q8)
```

## 3 · keymap → m92

```js
// D/ring.js:299
const SUBJECTS = [
  { k: "e", id: "entity",   valence: "where am I" },        { k: "a", id: "activity", valence: "is it working" },
  { k: "h", id: "harness",  valence: "what is it given" },  { k: "d", id: "display",  valence: "how do I see it" },
  { k: "x", id: "box",      valence: "mic · speaker · theme" }, { k: "s", id: "system", valence: "what does it run on" },
  { k: "c", id: "control",  valence: "how do I say it" },   { k: "g", id: "go",       valence: "focus a region" },
  { k: "m", id: "mode",     valence: "the seated mode’s keys" },
];
// D/ring.js:321 keymap(w) — rebuilt per press
open(root, "esc", { kind: "drop" });  open(root, "leader/leader", { kind: "palette" });  open(root, "leader/:", { kind: "palette" });
SUBJECTS.forEach((s) => { root.edges.leader.edges[s.k] = node(`${s.id} · ${s.valence}`); });
registry(w).forEach((c) => { if (c.chord) open(root, c.chord, { kind: "verb", verb: c }, c.valence); });
for (let i = 1; i <= 9; i += 1) open(root, `leader/e/${i}`, { kind: "line", line: `/terminal ${i}`, echo: false });          // hand-opened, no verb
[["←","left"],["→","right"],["↑","top"],["↓","bottom"]].forEach(([k, a]) => open(root, `leader/d/${k}`, { kind: "line", line: `/dock ${a}` }));
open(root, "leader/d/f", { kind: "line", line: "/dock closed" });  open(root, "leader/s/i", { kind: "line", line: "/lighthouse/login" });
if (seat && seat.keymap) seat.keymap.forEach(([path, line, valence]) => open(root, path, { kind: "line", line }, valence));
// D/ring.js:362 press(w, key)
if (w.chord) { if (key === "esc") { w.chord = path.length > 1 ? { path: path.slice(0, -1) } : null; return; }
  const next = at.edges[key];
  if (!next) { push(w, th, rec("fault", `${chordText(…)}: not bound`)); w.chord = null; return; }
  if (next.effect && !Object.keys(next.edges).length) { fire(w, next.effect, […]); return; }
  w.chord = { path: [...w.chord.path, key] }; return; }
if (key === "leader") { w.chord = { path: ["leader"] }; w.panel = null; return; }
// D/ring.js:348 fire
drop → chord=null · palette → openPalette("/") · line → dispatch(line) · verb → options ? panel choose : args ? palette prefilled `${nature} ` : dispatch(nature)
```
```js
// ours — m92-keymap.org laws :69-82; Press → subsystems/typology/prototypes/press.js (10-21); the walk steer.dispatch.walk (dispatch.js:108)
// systems/ghost/surface/chrome/keys.js:9  the [[predicate, tag]] normalizer the Press replaces
const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];
// subsystems/drapes/dom/keys.js:365 — the DOM twin (chord · keydowns), same job
// m95 takes m92 3 · 5: the four panel levels keys → group → chooser → catalog; `catalog` is the list (ruling 13)
```

## 4 · sections → each chrome's fold

```js
// D/ring.js:1000 — eleven row types, every row carries its LINE
const sub     = (label, count)              => ({ type: "sub", label, count });
const keys    = (list)                      => ({ type: "keys", keys: list });                          // [{ label, line, on, off, tone, hold, title }]
const choice  = (label, vals, cur, nature)  => ({ type: "choice", label, chips: vals.map((v) => ({ label: v, line: `${nature} ${v}`, cur: String(cur) === v })) });
const chips   = (items)                     => ({ type: "chips", chips: items });                       // [{ label, on, line }]
const value   = (label, val, dot)           => ({ type: "value", label, value: val, dot });
const meter   = (label, pct, text, tone)    => ({ type: "meter", label, pct, text, tone });
const stepper = (label, val, dec, inc)      => ({ type: "stepper", label, value: String(val), dec, inc });
const check   = (label, on, line, val)      => ({ type: "check", label, on, line, value: val });
// item { label, sub, line, cur, dot, mark } · tags · filter · display · more
// D/ring.js:1027
ent.push({ type: "item", label: `${i + 1}  ${x.label}`, sub: short(x.mode), line: `/terminal ${i + 1}`, echo: false, cur: i === w.active, dot: dotOf(x), mark: "[◇]" });
// D/ring.js:1056 harness
const har = [choice("tune", TUNES, th.h.tune, "/tune"), choice("effort", EFFORTS, th.h.effort, "/effort"), stepper("rounds", th.h.rounds, "/rounds -", "/rounds +"),
  meter("context", pct, `${pct} %`, pct >= 85 ? "cau" : ""), chips(CTX(…).map(([n]) => ({ label: n, on: !th.off[n], line: `/context/toggle ${n}` }))),
  value("tools", `${toolsOn(th)} / ${TOOLS.length}`), chips(TOOLS.map((n) => ({ label: n, on: !th.toolsOff[n], line: `/tools/toggle ${n}` })))];
// D/ring.js:1077 → seven sections { id, title, meta, tone, rows, key: SECTION_KEYS[id] }:  entity · activity · harness · display · box · system · control
// D/ring.js:1082 sideView = sections minus sbHide · D/dom.js:81 wid = ONE section floated above its bar segment · D/dom.js:299 panel level 2 = entries(subject)
```
```js
// ours — lock 1 REJECTED one fold shared ACROSS clients; inside a client the three painters (sidebar · widget · panel) read one
// what each section reads today:
// entity   client.$active · runtime.entities.{terminal,thread,mode}.$entities · thread.$buffers
// activity systems/anima/src/entities/activity.js:942-976  roster(thread) · loudest(rows) · owed(signal, rows, sent)   → ghost entities/activity.js
// harness  thread.trait.HARNESSED  (tune · effort · rounds)
// display  terminal.dock  (ruling 19 layers)
// box      systems/anima/src/box/  mic · speaker · worklet
// system   runtime.$status · lighthouse.$status · $user
// a row type IS a part's props: keys → Row+Choice · meter → Meter · value → Row · check → Choice · item → Tab/Row
```

## 5 · painters → regions · parts · zones

```js
// D/dom.js:368 skeleton(w)
const dir = ph ? "column" : { right: "row", left: "row-reverse", bottom: "column", top: "column-reverse" }[d.align];
const frame = hasFrame ? `<section class="pane frame" data-fn="focus" data-arg="frame" style="flex:1 1 0"><div data-r="fhead"></div><div data-r="fbody"></div></section>` : "";
const seam  = both ? `<div class="seam ${vert ? "v" : "h"}" data-seam="1"></div>` : "";
const dock  = hasDock ? `<section class="pane dock ${floating ? "floating" : ""}" data-zone="1" style="${floating ? `position:absolute;${corner}` : both ? `flex:0 0 ${d.share}%` : "flex:1 1 0"}"><div data-r="dhead"></div><div data-r="strip"></div><div class="journal" data-r="journal"></div><div class="composer" data-r="composer"></div></section>` : "";
return `<div class="client ${ph ? "phone" : ""}">
  ${ph ? "" : `<nav class="tabs" data-zone="0" data-r="tabs"></nav>`}
  <div class="body">${sb}<div class="split" style="flex-direction:${dir}">${frame}${seam}${dock}</div></div>
  <section class="panel" data-zone="0" data-r="panel"></section>
  <nav class="modebar" data-zone="0" data-r="bar"></nav>
  <div data-r="wid"></div><div data-r="pop"></div><div data-r="tele"></div><div data-r="island"></div>
</div>`;
// D/dom.js:415 render: patch(root, name, html, cache) per region; the composer textarea kept if focused
// D/ring.js:149 phone = width < 768 · tablet < 1024;  D/tty.js:587 narrow = cols < 100;  shell cockpit (tabs row 0) | footer (under scrollback)
```
```js
// D/tty.js:573 render — the same regions on cells
const barY = rows - 2, panelY = barY - panelH, bodyY = footer ? 0 : 1, bodyH = panelY - bodyY;
if (!footer) paintTabs(w, S, P, 0);
if (sbW) { paintSidebar(w, S, P, 0, bodyY, sbW, bodyH); x = sbW; }
if (hasFrame && dockShown && t.dock.view === "docked") { /* vertical: frame | │ | dock by share; horizontal: frame / ─ / dock */ }
else if (hasFrame && (!dockShown || t.dock.view === "messenger")) { paintFrame(…); /* messenger: a 56×22 box bottom-right */ }
else paintJournal(w, S, P, x, bodyY, bw, bodyH, false);
if (panelOpen) paintPanel(w, S, P, panelY, panelH);
paintBar(w, S, P, barY); paintWid(w, S, P, barY);
// D/tty.js:89 paintBar — row 1: << [thread ‹mode›] {tune ▰▰▱▱▱▱} ⠹▰▱ running · r3/10 [ █] … ▣ ● ghost ; row 2: tool · ctx % · effort · rounds · lens · the chord hint
```
```jsx
// ours — ruling 22: the chrome is one [[predicate, pane]] table; both clients hold the same rows
const PANES = [
  [(client) => client.runtime === null, Booting],
  [(client) => ["IDLE", "VERIFYING", "REFRESHING", "POPULATING"].includes(client.runtime.lighthouse.status), Booting],
  [(client) => !client.runtime.lighthouse.isAuthorized, Signin],
  [() => true, Regions],
];
// subsystems/drapes/dom/chassis.jsx:62 — the split, prior art (RED :3 belt.dock; the drag → one line at pointer-up, ruling 25)
const basis = () => (shown().handle ? `0 0 ${Math.round(props.layout().dock.share * 1000) / 10}%` : "1 1 auto");
// systems/ghost/surface/chrome/panes/chrome.jsx:8 — today: frame ‖ 48-col dock, nothing else
// systems/ghost/surface/chrome/index.js:6  import { panes } from "./out/panes.mjs"   ← gitignored static import: fresh-tree trap
```
```text
D/design.js:157-169 — the thirteen parts: name · valence · reads
Bar      mark · entity · activity · harness · display · box · system    surface · boundary · 38px dom · 2 rows tty · 52px phone
Segment  one subject; click → widget; hold on display → view pop       text-strong · control-selected (open) · signal-*-tint/-ink · text-disabled
Dot      one signal, no words                                           signal-positive · -primary · -caution · -negative · text-muted
Meter    a fraction; caution ≥ 85 %                                     divider (track) · text-ink (fill) · signal-caution
Tab      one terminal; label = thread's; ∥ shared thread               surface-sunk · text-strong 600 · text-muted · boundary · signal-primary
Mark     the viket; tap keys · double repl · hold sidebar; fault dot    brand-filter · text-strong · signal-negative; tty image or <<
Panel    four levels keys → group → chooser → palette; pushes up        surface-lift · boundary · header = subject tag + crumbs
Row      key · name · icon · value, on a grid                           signal-primary-ink (key) · text-strong · text-muted · control-selected
Choice   inline options, one latched                                    control-contrast-pressed + control-on-pressed · text-muted
Field    composer · repl line · filter; › turn · << line                control-field · -placeholder · -caret · control-focus · text-light
Turn     one journal entry by register                                  text-muted · text-strong (you) · text-ink (agent) · surface-sunk (tool) · signal-negative-ink
Consent  replaces the composer; y n e bindings                          signal-caution-tint · -ink · control-contrast + control-on
Split    one BSP split; drag · dblclick resets · /dock side · 20–80    boundary · boundary-strong (dragging)
```
```js
// subsystems/drapes/deno.jsonc:5  "./dom": "./dom/index.js" — prior art: Button Field Row Strip Pip Spinner Empty JsonTree Markdown Logo .jsx; tests/dom/rig.js (esbuild + babel-solid + linkedom)
// subsystems/sheets/  0 live files; bak/ prior art
// D/design.js:19 sample(fn) — the parts page renders every part over sample worlds: idle · running · consent · paused · faulted
```

## 6 · zones · tokens → dapper

```js
// D/tty.js:4 — 27 keys per zone, flattened over the surface
const KEYS = ["surface","surface-sunk","surface-lift","boundary","boundary-strong","divider","text-strong","text-ink","text-light","text-muted","text-link",
  "signal-primary","signal-primary-ink","signal-positive","signal-positive-ink","signal-caution","signal-caution-ink","signal-negative","signal-negative-ink",
  "control-selected","control-field","control-field-caret","inverse","inverse-on","signal-caution-tint","signal-negative-tint","signal-primary-tint"];
```
```js
// subsystems/dapper/lib/tokens.js:122 — 14 today, camelCase; every missing key already sits on the zone (lib/theme.js:97 tones · :117 controls · :137 earth)
const FLAT = {
  surface: (zone) => zone.surface, surfaceSunk: (zone) => zone.surfaceSunk, surfaceLift: (zone) => zone.surfaceLift, boundary: (zone) => zone.boundary,
  textStrong: (zone) => zone.text.strong, textInk: (zone) => zone.text.ink, textMuted: (zone) => zone.text.muted, textLink: (zone) => zone.text.link,
  signalPrimary: (zone) => zone.signal.primary.fill, signalPositive: …, signalCaution: …, signalNegative: …,
  inverse: (zone) => zone.inverse, inverseOn: (zone) => zone.inverseOn,
};
export const tokens = (theme, zone) => Object.fromEntries(Object.entries(FLAT).map(([key, read]) => [key, flatten(read(held), held.surface)]));
// subsystems/dapper/lib/emit.js:68  :root[data-theme="x"] { … }  :root[data-theme="x"] [data-zone="n"] { … }
// subsystems/typology/schematics/primitives/theme.js:6  TERRITORIES = { 0: "chrome", 1: "body", 2: "island", 3: "bench" }
// systems/ghost/surface/chrome/palette.js:11  TONES primary·positive·caution·negative·strong·ink·muted·link → the 14 names
// D/design.js:217 owed: control-scrollbar white on white in porcelain · datasette; one type scale
```

## 7 · journal → the tail

```js
// D/ring.js:24
const rec = (kind, text, extra) => Object.assign({ kind, text, at: 0 }, extra || {});   // kind ∈ you · agent · cmd · msg · fault · trace
// agent: { tools: [{ name, arg, status: run|ok|wait|skip|err, dur, yield, loop, frames }], blocks: [], buffers: ["b1"], streaming, think: { nodes } }
// D/ring.js:293
const show = { chat: ["you", "agent"], trace: ["cmd", "msg", "fault", "trace"], repl: ["you", "agent", "cmd", "msg", "fault", "trace"] }[w.lens];
// D/dom.js:252 registers  { you: "<<", agent: ">>", cmd: "<<", msg: "·", fault: "!", trace: "·" }
// D/dom.js:267 entry = ehead(reg · who · meta · ops) + thinking + text + ans + tools + blocks + artcards(buffers) + verbs(when selected)
// D/dom.js:210 artcard(buffer) — a surfaced buffer under the turn: cellBody by pickOf(w, b, "cell"); ⤢ → /buffer/full
```
```js
// ours
// systems/ghost/surface/chrome/panes/dock.jsx:58
const rows = from(props.client.controller.stdout.tail("message", "fault", "turn"));
const streams = from(props.client.controller.stdout.tail("stream"));
const live = () => (streams() === undefined || streams().length === 0 ? null : streams().at(-1).data.open);
// systems/anima/src/app/panels/a/widgets/Dock.svelte:121
const liveWord = $derived(liveCall ? `calling ${liveCall}` : isStreaming ? "streaming" : "thinking");
// m87 ruling 8 · 21: a turn renders its parts, then its buffers — the cell:
module.default(cell, { terminal, buffer: turn.buffers[0], surface: { place: "cell", renderer, tones } });
```

## 8 · the run → Activity

```js
// D/ring.js:316 MACHINE — verbatim subsystems/typology/schematics/primitives/controller.js:3
transitions: { open: { IDLE: "RUNNING" }, pause: { RUNNING: "PAUSED" }, resume: { PAUSED: "RUNNING" }, stop: { RUNNING: "STOPPING", PAUSED: "STOPPING" },
  close: { RUNNING: "DONE", PAUSED: "DONE", STOPPING: "STOPPED" }, fault: { …: "FAILED" }, abort: { …: "ABORTED" } },
signals: { SIGTERM: "stop", SIGSTOP: "pause", SIGCONT: "resume", SIGKILL: "abort" },
// D/ring.js:195 advance — one step per tick:  think → tool → consent → finish → apply → surface → say → block → artifact → progress
if (st.consent) { r.rec.tools.push({ name: st.consent, arg, status: "wait" }); r.pending = { name, uci }; }        // y/n/e hold the loop
if (st.fail)    { th.fault = { tool, arg, round, rec, text }; th.run = null; }                                       // /resume retries
if (st.loop)    { st.row.frames = [`→ …/metadata/repl`, `← strip · N verbs`, `→ …/repl { nature, body, flags }`]; st.row.yield = cmd.run(""); }  // LOOPING
// D/ring.js:373 cmdApprove · :383 cmdSkip · :384 cmdEdit (draft = `match_move {"uci":"e2e4"}`, enter re-arms) · :385 cmdContinue
```
```js
// ours
// systems/runtime/entities/Activity.ts:32   controller mirror, 12-record stdout ring; routes /userspace/entities/activity · /:id/stdout · /:id/stdin/{SIGTERM,SIGSTOP,SIGCONT,SIGKILL} (integration.js:64-82)
// systems/anima/src/app/panels/a/widgets/stop.svelte.js:36  press SIGTERM, hold 2 s SIGKILL, reaches rows born mid-stop
for (const row of owed(armed, read().activities, signalled)) row.stdin[armed](reason);
// systems/anima/src/app/bones/spine/activity.js:230 spans(steps) · :242 elapsed(steps) · :261 project(row) → { code, live, path, elapsed, spans, ring: "n/12", links }
// HOLES: consent (approve · skip · edit) has no runtime route; fault + /resume has no retry route; LOOPING is m88 S3
```

## 9 · the door → run.js · client.js

```js
// D/app.js:10-17
const saved = JSON.parse(localStorage.getItem("viva.client.v1") || "{}");      // { theme, lens, sidebar, shell }
w.theme = R.THEMES.includes(saved.theme) ? saved.theme : prefersDark ? "northsea" : "porcelain";
const route = () => (["dom", "tty", "design"].includes(hash) ? hash : "dom");
// D/ring.js boot(w): [`/client/${face}`, "/lighthouse", "/runtime/localhost", ...daemons, `/client/${face}/terminals`, w.client.home] → "ready"; no VERIFIED → w.signin
// D/app.js:92 key(e): ctrl-v → "leader" (alt-v on non-mac) · Escape esc · Enter · Tab · arrows · " " space · a printable
// D/app.js:303 click: [data-line] → dispatch(line, { echo }) · [data-fn] → fns[fn](arg, el);  pointerdown: seam drag → /split N at up · [data-hold] 420 ms · mark tap/double/hold
```
```js
// ours
// systems/ghost/run.js:5  the tty door; anima's door is this door over a paladin baked at build (ruling 23)
const instance = await factories.instance(paladin.instance);
await paladin.ledger.registry.supply();
const die = { controller: new Controller({ stdout: new Span("ghost") }), signal: new Argv(Deno.args), instance, mask: instance.clients.find((client) => client.manifest.slug === "ghost") };
die.register = await paladin.ledger.registry.wire(die.mask);
// systems/anima/src/app/+layout.svelte:28-34 today — dies: new Url(env.PUBLIC_VIVA_RUNTIME_REMOTE) · stores.lighthouse.hydrate (localStorage) · Bridge
// theme: lock 5 — mask THEMED → user THEMED → OS; no localStorage (REJECTED). lens · sidebar · shell: client memory.
// credentials: ruling 18 paladin.vault; boot cover: ruling 22 PANES; the lines the demo prints = client/lifecycle/index.js:36-216 beats
```

## 10 · dies with the sim

```text
D/ring.js  tick · advance · script · settleDictation's fake words · box.level sine · tonce pings · tspan/tmark/story (m89) · setPath (/set) · position/san/ALT (chess package)
D/ring.js  /face · /design (ruling 21) · /graphics · /telemetry · /signal · /set
D/app.js   the 80 ms interval · hash route · localStorage viva.client.v1
D/tty.js   the whole cell emulation — OpenTUI paints; its onKey (:645) is the Press's spec, not code to port
```

## 11 · holes (for the drill)

```text
1 consent     approve · skip · edit of a waiting tool call — no runtime route (m83 owns tools; the activity awaits)
2 retry       th.fault + /resume — no activity-level retry route
3 the tail    Turn rows (mirrored) + controller records (client memory) in ONE ordered stream per thread
4 outputs     table · pick · form · artifact · progress · keymap — output kinds vs Parts
5 tokens      camelCase FLAT vs the demo's kebab KEYS — one spelling before sheets is born
6 chords      ring.js:331-334's nine hand-opened chords — chord: on their verbs, or orphans
7 phone       phonePane · the strip — surface memory; which pane reads it
8 face-only   /shell · /graphics · the tty filter — a surface's own verbs under ruling 20
```
