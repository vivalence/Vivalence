> Research record 10-19 for m95, written BEFORE the drill. Killed since: "face" → the buffer's component (m95 lock 6); a shared row model across clients (REJECTED, lock 1); "the keymap is a view of the repl" (REJECTED). The quest's rulings win over anything below.

# assets — the designer demo `~/Downloads/vivalence-client-v1`, inventoried

Read in full: `build/build.js`, `build/src/{app,ring,dom,tty,design}.js`, `build/src/{base,design}.css` (skimmed by rule; long lines truncated), `dapper.css` (structure + northsea root), `declarations.json` (structure). Nothing executed; `out/` checked by substring match only. All paths below are relative to `~/Downloads/vivalence-client-v1/`.

## 0 · verdict in five lines

- **ONE state object, rendered by two painters.** `Ring.world()` is the single `w`; `Dom.render(w)` writes HTML, `Tty.render(w)` writes the same regions onto a cell grid. Both go through **one** click handler and **one** `R.dispatch(w, line)`.
- **Every control is a line.** A DOM `data-line="/tune fast"` and a tty cell `hit: { line: "/tune fast" }` both reach the same handler (`app.js:252-258`). Segments, rows, chords and typed text all dispatch the same verb, and the journal echoes it.
- **The "ghost" face is NOT OpenTUI.** It is a browser emulation: a `cells[y][x] = {ch,fg,bg,b,hit,cur}` grid flushed to `<span>` runs (`tty.js:26-49`). It is a spec for what the OpenTUI client should paint, not code to port.
- **Activity handling is there and is close to the real typology.** `MACHINE` (`ring.js:316-320`) is `subsystems/typology/schematics/primitives/controller.js:3-22` minus `states`/`verbs`. Telemetry records `{span,trace,path,verb,at,data}` (`ring.js:324`) are the `Record` schema in `controller.js:46-53`. State is folded from the records (`tcode = verbs.reduce(...)`, `ring.js:344`).
- **Everything else is faked.** The data is hardcoded. A turn's output is a scripted step list keyed off regexes. There is no network and no auth. Chess and memo verbs are hardwired to buffers `b1`/`b2`.

## 1 · structure

| file | LOC | bytes | role |
|---|---|---|---|
| `build/build.js` | 37 | 2.5k | concatenates everything into one HTML file |
| `build/src/ring.js` | 1082 | 105k | the model: the world, the verb registry, dispatch, the run sim, keymap, telemetry, view-models |
| `build/src/dom.js` | 449 | 53k | the anima painter (HTML strings + a keyed patch) |
| `build/src/tty.js` | 729 | 68k | the ghost painter (cell grid → spans) + tty key handling |
| `build/src/design.js` | 251 | 53k | `#design` route: the design-system page with live specimens of both faces |
| `build/src/app.js` | 341 | 26k | boot, route, RAF render loop, the 80 ms tick, all DOM events |
| `build/src/base.css` | 700 | 68k | client CSS, tokens only; holds `__VIKET__` |
| `build/src/design.css` | 204 | 23k | design page CSS |
| `dapper.css` | 2238 | 76k | dapper's `design()` output: `:root` scales + 4 themes × (root + 4 zones) |
| `declarations.json` | 1737 | 72k | `{theme: {zone: {--key: value}}}`, 4×4×106 |
| `viket.b64` | 0 (one line) | 8.5k | base64 PNG, 127×160 gray+alpha: the logo mark |
| `build/out/index.html` · `standalone.html` | 6017 | 493k | build output |

**The build** (`build/build.js:5-7`) re-roots dapper's selectors onto the app element:
```js
// build/build.js:5
const dapper = fs.readFileSync(path.join(__dirname, "..", "dapper.css"), "utf8")
  .replace(/:root\[data-theme="([a-z]+)"\]/g, '#app[data-viva="$1"]')
  .replace(/^:root \{/m, "#app {");
// build/build.js:23-30
<div id="app" data-viva="northsea" class="route-design"></div>
<script>
window.DAPPER_KEYS = ${JSON.stringify(Object.keys(JSON.parse(...declarations.json...).northsea[1]))};
${read("ring.js")} ${read("dom.js")} ${read("tty.js").split("__VIKET__").join(viket)} ${read("design.js")} ${read("app.js")}
```
The fonts come from Google Fonts (`build/build.js:8`): IBM Plex Mono/Sans, Inter, K2D, Poppins, Space Mono, VT323 and Victor Mono.

**`out/` checks:** `out/` holds exactly the current `src` (each src file, after the `__VIKET__` substitution, is a verbatim substring of `index.html`). `standalone.html` is `index.html` wrapped in `<!doctype html><html><head>…viewport + a 4-rule reset…</head><body>` … `</body></html>` (`build/build.js:35`), and nothing else differs. `out/index.html` has no `__VIKET__` left.

**Module shape:** every file is an IIFE global (`const Ring = (() => {...})()`), and they load in the order Ring → Dom → Tty → Design → App. `Tty` uses `Dom.esc` and `Dom.tone` (`tty.js:3,61`). `Design` uses `App.w`, `App.fns` and `App.enter` (`design.js:19,235-236`), which is a circular reach.

### entry flow (`app.js`)
```js
// app.js:3,10-15
const w = R.world();
const saved = JSON.parse(localStorage.getItem("viva.client.v1") || "{}");
w.theme = R.THEMES.includes(saved.theme) ? saved.theme : prefersDark ? "northsea" : "porcelain";
if (saved.lens) w.lens = saved.lens; if (saved.shell) w.tty.shell = saved.shell;
// app.js:17
const route = () => { const h = (location.hash || "").replace("#", ""); return ["dom", "tty", "design"].includes(h) ? h : "dom"; };
// app.js:68-71
const enter = (r) => { w.route = r;
  if (r === "dom" || r === "tty") { w.face = r; w.client.ref = r === "tty" ? "/client/ghost" : "/client/anima";
    w.client.home = `${w.client.ref}/mode/home/console`; if (!w.booted) R.boot(w); w.want = "composer"; } bump(); };
// app.js:40-50
const render = () => { ...; applyTheme();
  if (w.route === "design") Design.render(w, app, cache, changedRoute);
  else if (w.route === "tty") Tty.render(w, app, cache);
  else Dom.render(w, app, cache); ... };
const bump = () => { if (raf === null) raf = requestAnimationFrame(render); };
// app.js:77-78
setInterval(() => { if (R.tick(w, tickMs)) bump(); }, 80);
// app.js:338-339
measure(); enter(w.route);
```
- **State model:** one mutable `w`. A mutation calls `bump()`, which schedules a full re-render on the next frame. There are no subscriptions, and dirtiness is just the return value of `R.tick`.
- **Two state bags:** UI state such as `chord`, `panel`, `wid`, `pop`, `focus` and `jsel` lives on `w`, next to the domain state. App-local closures hold the gesture timers (`tap`, `hold`, `held`, `app.js:187`).
- **`after()`** syncs `location.hash` to `w.face` and saves to localStorage (`app.js:61-66`).
- **Persistence bug:** `save()` writes `{theme, lens, sidebar, shell}` (`app.js:11`), but `sidebar` is never read back (`app.js:13-15`).

## 2 · the UI model

### regions (the dom skeleton, `dom.js:368-391`)
```html
<div class="client">
  <nav class="tabs" data-zone="0" data-r="tabs">            <!-- terminals, desk only -->
  <div class="body">
    <aside class="sidebar" data-zone="0" data-r="sidebar">  <!-- + .sbseam drag -->
    <div class="split" style="flex-direction:{right:row,left:row-reverse,bottom:column,top:column-reverse}">
      <section class="pane frame"> fhead · fbody             <!-- the buffer's artifact face -->
      <div class="seam">                                     <!-- drag share, dblclick reset -->
      <section class="pane dock" data-zone="1"> dhead · strip · journal · composer
  <section class="panel" data-zone="0" data-r="panel">     <!-- the control bar: chord / palette / chooser -->
  <nav class="modebar" data-zone="0" data-r="bar">         <!-- mark · entity · harness · activity · display · box · system -->
  wid (zone 0) · pop (zone 0) · tele (zone 3) · island (zone 2)
```
- **Patching:** `patch(root, name, html, cache)` swaps the innerHTML of one `data-r` slot when its string changes. It keeps the focus/selection of an `<input>` and the scroll position (`dom.js:393-413`). The skeleton is rebuilt only when `layoutKey` changes (`dom.js:366`).
- **The dock:** `view ∈ docked|full|closed|messenger`, `align ∈ left|right|top|bottom` and `share 20–80` (`ring.js:12-13`). `messenger` floats the dock in a corner (`dom.js:376,379`).
- **Responsive breakpoints:** phone below 768 px, where `w.phonePane ∈ dock|frame|sidebar`, there are no tabs, and the frame pins as a `strip` above the journal (`dom.js:359-364`). Tablet is 768–1024 px, where the sidebar starts closed on first sight (`ring.js:149-150`, `app.js:26`).
- **Five focus regions:** `REGIONS = ["tabs","sidebar","frame","journal","composer"]` (`ring.js:15`). Each region has its own keys in `regionKey` (`app.js:88-105`). In the journal those are c copy · o open · f fold · r retry. In the frame, chess takes ←/→/f/n and memo takes space and 1–4.

### the mode bar = seven subjects (`dom.js:320-339`, `ring.js:698-708`)
```js
// ring.js:698
const SUBJECTS = [
  { k: "e", id: "entity",   valence: "where am I" },     { k: "a", id: "activity", valence: "is it working" },
  { k: "h", id: "harness",  valence: "what is it given" }, { k: "d", id: "display",  valence: "how do I see it" },
  { k: "x", id: "box",      valence: "mic · speaker · theme" }, { k: "s", id: "system", valence: "what does it run on" },
  { k: "c", id: "control",  valence: "how do I say it" },  { k: "g", id: "go", valence: "focus a region" },
  { k: "m", id: "mode",     valence: "the seated mode’s keys" },
];
```
- A segment click runs `fns.wid(id)`, which floats that subject's sidebar section above the segment (`app.js:211-217`, `dom.js:81-88`). The sidebar and the widgets render the **same** `R.sections(w)` (`ring.js:1000-1076`).
- **The mark** (logo button) has three gestures: tap means keys (a 260 ms timer then the leader chord), double tap opens the palette, and a 420 ms hold opens the sidebar (`app.js:189-194,313-314`).

### a shared view-model: typed rows rendered by both faces
`R.sections(w)` returns `{id,title,meta,tone,rows,key,head}`. Each row is a tagged union:
```js
// ring.js:1002-1009
const sub = (label, count) => ({ type: "sub", label, count });
const keys = (list) => ({ type: "keys", keys: list });                 // [{label,line|fn,arg,on,off,tone,hold,title}]
const choice = (label, vals, cur, nature) => ({ type: "choice", label, chips: vals.map(v => ({ label: v, line: `${nature} ${v}`, cur })) });
const chips = (items) => ({ type: "chips", chips: items });
const value = (label, val, dot) => ({ type: "value", label, value: val, dot });
const meter = (label, pct, text, tone) => ({ type: "meter", label, pct, text, tone });
const stepper = (label, val, dec, inc) => ({ type: "stepper", label, value, dec, inc });
const check = (label, on, line, val) => ({ type: "check", label, on, line, value: val });
// + item · filter · tags · display · more  (ring.js:1012-1033)
```
`Dom.srow` (`dom.js:61-76`) and `Tty.sectionLines` (`tty.js:134-165`) are the two renderers of these row types. `R.teleView` and `R.inspectView` are shared view-models in the same way. **This "view-model once, painter per face" split is the structural lesson of the demo.**

### the tty painter
```js
// tty.js:26-27
const screen = (cols, rows, fg, bg) => ({ cols, rows, cells: Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ ch: " ", fg, bg, b: 0, hit: null, cur: 0 }))) });
const put = (S, x, y, text, st) => { ... c.ch = chars[i]; if (st.hit !== undefined) c.hit = st.hit; ... };
// tty.js:38  a hit becomes the same attrs dom uses
const attrs = h ? (h.line !== undefined ? ` data-line="${esc(h.line)}"` : ` data-fn="${esc(h.fn)}" data-arg="${esc(h.arg ?? "")}"`) : "";
```
- **Layout:** row 0 holds the tabs, plus an `open in anima ↗` link that runs `fns.route("dom")` (`tty.js:80-81`). Then come the body, the panel and a two-row bar at `rows-2` (`tty.js:589-642`).
- **Two shells:** `cockpit` (the alternate screen) and `footer` (`~/vivalence $ viva`, journal under real scrollback, `tty.js:594-607`). Narrow is `cols < 100` and shows one pane, with `⇥ journal` / `⇥ frame` to switch (`tty.js:614-617`).
- **Logo:** `/graphics auto|kitty|sixel|off` (`ring.js:401,906-907`) paints the viket PNG as an overlay span where a real terminal would draw kitty or sixel graphics; with graphics off it draws ` ╱ ╱ / ╲ ╲` (`tty.js:50-57`).
- **Keys:** the tty face owns its own `onKey` (`tty.js:645-726`), which re-implements the composer editing, palette and chooser keys that `app.js:109-156` implements for the DOM. That is duplicated logic.

### keymap, chords, palette, REPL line
```js
// ring.js:712-718  the keymap is a trie built fresh on every press
const node = (valence) => ({ edges: {}, valence: valence || "", effect: null });
const open = (root, path, effect, valence) => { path.split("/").forEach((key, i) => { at.edges[key] ??= node(); ... at.effect = effect; }); };
// ring.js:720-741  composed per call
open(root, "esc", { kind: "drop" }); open(root, "leader/leader", { kind: "palette" }); open(root, "leader/:", { kind: "palette" });
SUBJECTS.forEach(s => root.edges.leader.edges[s.k] ??= node() /* .subject = s.id */);
registry(w).forEach(c => { if (c.chord) open(root, c.chord, { kind: "verb", verb: c }, c.valence); });
// + leader/e/1..9 → /terminal i · leader/d/←→↑↓ → /dock side · seated mode's keymap under leader/m/* · hosted home keymap
// ring.js:747-759  effect kinds: drop | palette | line{line,echo} | verb{verb}
//   a verb with options → panel {view:"choose"}; with args → palette prefilled "/verb "; else dispatch
// ring.js:761-778  press(w, key): walks w.chord.path; an unbound key pushes a fault record "ctrl-v x y: not bound"
```
- **The leader:** `ctrl-v` on both faces. On Mac only `e.ctrlKey` counts; elsewhere ctrl **or** alt (`app.js:81`). The legend for chord text is `chordText = s.replace(/leader/g,"ctrl-v").replace(/\//g," ")` (`ring.js:710`).
- **Panel levels, one panel:** keys (leader alone, `dom.js:294-297`) → group (a subject's `R.entries`, `ring.js:833-896`; `dom.js:298-303`) → chooser (`panel.view="choose"`, a filtered list of `c.options()`) → palette (`panel.view="palette"`).
- **The palette** opens when the draft starts with `/` (`app.js:163-165`), and `completions` fuzzy-matches verb natures, then a verb's options (`ring.js:783-815`). Tab fills and enter runs (`paletteEnter`, `ring.js:817-831`).
- **The REPL line is the composer.** The prompt is `›` for a turn and `<<` for a line (`tty.js:450`, `dom.js:285`). Up-arrow on an empty draft walks `w.comp.hist` (`app.js:154`).
- **Mode keymaps** are declared DATA on the mode, as `[path, line, valence]` triples:
```js
// ring.js:48
mode("/daemon/chess", "board", "play", [..."KEYMAPPED", "LOOPING"], { keymap: [["leader/m/n", "/game new", "a new game"], ["leader/m/f", "/game flip", "flip the board"], ...] })
```

### the verb registry (one dispatch shape)
```js
// ring.js:399-501  ~60 verbs; entry shape:
{ nature: "/tune", args: "frugal|fast|capable", valence: "the model tune", chord: "leader/h/t",
  options: () => chooseItems(w, "tune"), run: (a) => setH(th, "tune", a, TUNES) /* , echo:false, scope */ }
// ring.js:503-515  per-mode verbs by substring on th.mode: "/board/" → /game /ply ; "/srs/" → /reveal /grade
//                  hosted: /hello /whoami (scope "/mode/console"); HARNESSED seat → `/mode/<slug>/harness <words>` = a turn
// ring.js:521-541
const dispatch = (w, line, opt) => {
  if (text[0] !== "/") { turn(w, th, text); return; }           // a bare line is a turn
  const cmd = find(w, nature); const path = terminalPath(w) + nature;
  if (!cmd) { tonce(w, path, undefined, 0, { code: "NOT_FOUND", ... }); push(w, th, rec("fault", `${nature}: not found`, { path })); return; }
  const r = echo ? push(w, th, rec("cmd", text, { path })) : null;
  const tsp = tspan(w, path); tmark(w, tsp, "open"); tmark(w, tsp, "request", { nature, body: arg ? [arg] : [] });
  try { out = cmd.run(arg); } catch (e) { tmark(w, tsp, "fault", ...); push(w, th, rec("fault", `${nature}: ${e.message}`, { path })); return; }
  ... if (typeof out === "string") r.ans = out; else r.block = out;   // string → answer; object → block
};
```
- **Return shapes:** a string (an answer), `null` (silent), or a block `{type: "table"|"select"|"form"|"keymap"|"artifact"|"progress"}`. Blocks render in `dom.js:230-248` and `tty.js:393-401`.
- **Not the repo's dispatch.** This is not `{condition, output}`, and the signal shape is only gestured at: `request {nature, body}`, with `flags: {}` appearing only in the loop args (`ring.js:588`).

### activity / status / progress / streaming: what exists, exactly
**① The run lives on the thread: `th.run`, one per thread.**
```js
// ring.js:551
th.run = { status: "RUNNING", steps: script(w, th, text), i: 0, rec: r, elapsed: 0, round: 1,
           pending: null, pendingRow: null, editing: false, sp: tspan(w, "/hallucination"), kids: {} };
// th.fault = { tool, arg, round, rec, text }   (ring.js:625)   th.last = { code, at }   (ring.js:370,598)
const live = (th) => !!(th && th.run && (th.run.status === "RUNNING" || th.run.status === "PAUSED"));  // ring.js:166
```
**② The controller machine, verbatim from typology:**
```js
// ring.js:316-320
const MACHINE = { transitions: { open: { IDLE: "RUNNING" }, pause: { RUNNING: "PAUSED" }, resume: { PAUSED: "RUNNING" },
  stop: { RUNNING: "STOPPING", PAUSED: "STOPPING" }, close: { RUNNING: "DONE", PAUSED: "DONE", STOPPING: "STOPPED" },
  fault: { IDLE: "FAILED", ... }, abort: { IDLE: "ABORTED", ... } },
  settled: { DONE: 1, STOPPED: 1, FAILED: 1, ABORTED: 1 }, signals: { SIGTERM: "stop", SIGSTOP: "pause", SIGCONT: "resume", SIGKILL: "abort" } };
// == subsystems/typology/schematics/primitives/controller.js:3-22 (repo), minus states/verbs
```
**③ Telemetry is a span/record stream, folded into a tree:**
```js
// ring.js:321-329
const tspan = (w, name, parent) => ({ id: (w.tele.seq += 1), trace: parent ? parent.id : null, path: parent ? `${parent.path}/${name}` : name });
const tmark = (w, sp, verb, data, at) => { const r = { span: sp.id, trace: sp.trace, path: sp.path, verb, at: at ?? w.clock }; ... w.tele.records.push(r); /* cap 900 */ };
// ring.js:330-344  story(): records → nodes {id,trace,nature,path,timing{begun,sealed},fault,opened,entries,verbs,children}
const tcode = (n) => n.verbs.reduce((c, v) => (MACHINE.transitions[v] && MACHINE.transitions[v][c]) || c, "IDLE");   // state = reduce(events)
```
- **Verbs marked:** `open close fault stop abort pause resume` come from the machine. The extra marks are `turn request response consent approve skip thought` (`ring.js:367-394,535-538,552-553,607-636`).
- **Repo match:** the record shape equals `Record` in `subsystems/typology/schematics/primitives/controller.js:46-53`.
- **Span coverage:** spans cover every REPL line (`<terminalPath><nature>`), every run (`/hallucination`), each think node, tool and consent as a child, the boot (`/client/<face>/boot` with a child per step, `ring.js:908-924`), and a ping every 5 s for the runtime and each daemon (`ring.js:653-660`).

**④ The scripted step grammar `advance()` interprets each 80 ms tick** (`ring.js:594-645`):

| step | effect |
|---|---|
| `{think,label,depth,text}` | pushes a think node (status `run`), streams 4 chars per tick, and opens a child span |
| `{thinkEnd:true}` | pops the node: `ok`, `dur`, a `thought` mark, `close` |
| `{say}` | streams 3 chars per tick into `rec.text` |
| `{tool,arg,ms,yield,inThink?,fail?}` | adds a tool row `{name,arg,status:"run",t,yield}`; after `ms` it is `ok` with `dur` and `round+1`. With `fail`, the tool and the run fault, `th.fault` is set, and a fault rec is pushed |
| `{loop,nature}` | a LOOPING tool: runs the REPL verb `find(w,nature).run("")` locally and fakes the socket `frames` (`ring.js:626-630`) |
| `{consent,uci}` | adds a `wait` row and sets `run.pending`, which **holds the loop** (`advance` returns early while pending, `ring.js:596`) |
| `{finish}` · `{apply}` | added after `/approve`: finish the waiting row, play the move on `b1` |
| `{block}` · `{artifact}` | push a table block or an `{type:"artifact"}` block |
| `{surface:bufId}` | attaches a buffer to the thread and to the turn record |
| `{progress:{label,ms}}` | a `{type:"progress",label,pct,t,done}` block that fills to 100 % |

**⑤ Controls on the run:**
- `/pause` (SIGSTOP), `/resume` (SIGCONT, which also retries after a fault, `ring.js:385-394`), `/stop` (SIGTERM; a hold sends `/abort`, `ring.js:1041`), `/abort` (SIGKILL), and `/signal SIG thread` (`ring.js:418-424`).
- `/approve`, `/skip` and `/edit` handle consent (`ring.js:373-384`). `/edit` puts `match_move {"uci":…}` in the composer, and `submit` re-arms it (`ring.js:677-684`).
- Keys: y/n/e while pending, and esc means `/stop` when a run is live (`app.js:146-148`).
- `/activity` gives a table of `path · state · elapsed · ring · mode` (`ring.js:467`).

**⑥ Where status shows:**
- Bar activity segment: `Dom.tone` (`dom.js:33-40`) gives `approve <tool>` (caution, breathing dot), `paused · rN/M`, `<think label> · rN/M · m:ss` (primary, pulsing dot) or `fault · rN`.
- The tty bar glyph: `⠋▰▱ ?▰▱ ‖▰▱ !▰▱ ○▱▱` (`tty.js:108`), plus the current tool name on bar row 2 (`tty.js:125-126`).
- Tab dots (`dom.js:55`, `tty.js:69-75`), and a fault dot on the mark when any thread faulted (`dom.js:327,331`).
- The sidebar/widget activity section: a state line, a rounds meter, pause/resume/stop keys, approve/skip/edit, `/hallucination` "on this thread", and an **"elsewhere"** list of other threads with a run or fault (`ring.js:1038-1046`).
- In the journal: the thinking tree, collapsible, `N steps · M calls · Xs · <current label>` (`dom.js:259-261`). Tool rows use glyphs `run ◐/⠋ · ok ✓ · wait ? · skip – · err ✕` (`dom.js:254`, `tty.js:376`). A streaming caret (`dom.js:267` `.cursor`, `tty.js:382` `▍`) and the progress bar block (`dom.js:233`) also show here.
- The telemetry logger (`teleView`, `ring.js:929-962`): a span tree with waterfall bars, filters `all · activity · repl · net · faults` with counts, a selected-span detail with records, children, and **signal buttons enabled by `MACHINE.transitions[verb][code]`** (`ring.js:958`).
- **Absent:** toasts, a notification center and global "needs you" queueing. The nearest thing is the "elsewhere" list.

**⑦ Compared with the old anima** (`systems/anima/src/entities/activity.js`, `app/bones/spine/activity.js`):
- Anima has an `Activity` **entity** in a `RemoteRepository` with `stdin`/`stdout`.
- Anima keeps a **roster of many activities per thread** (`roster(thread)`), plus `loudest()` ranking and `owed()` signal dedupe.
- Anima's row carries a **wire ring of 12 records**, from which path, elapsed and spans are folded (`spine/activity.js:1-2`).
- The demo has a single `th.run` per thread. Its "ring" is a fake `min(12, 1+tools*2)/12` (`ring.js:467,1039`), and its records live in a client-global `w.tele.records`.
- **Net:** the demo covers anima's display vocabulary (states, tones, signals, spans, elapsed) and adds thinking/consent/progress/loop. It does **not** cover anima's data side: multiple activities, a repository, per-activity record rings, server-sent records.

### the other meanings of "ring"
- **`Ring`, the module** is the client's model (`ring.js:1`). The design page draws "the data ring": `terminal [◇] → thread ─◇─ → buffer ◆ → mode ◇ → daemon ●`, captioned "a line → a signal → the ring → stdout → the journal · rows arrive by subscription" (`design.js:42-54`).
- **The sign `▰▱`**, "a fraction: rounds, context" (`design.js:120`). The CSS `--size-ring: 1px` (`dapper.css` northsea root) is the outline ring width.
- **The activity "ring N/12"**, faked (`ring.js:1039`).

## 3 · data nouns, as the demo shapes them

```js
// ring.js:34   lighthouse
lighthouse: { origin: "http://localhost:2501", traits: ["JOINABLE", "AUTOLOGIN"], standing: "VERIFIED", user: "beef", expires: "23 h" }
//   standing ∈ VERIFIED|UNVERIFIED|EXPIRED|LOGGED_OUT ; traits ⊂ JOINABLE|AUTOLOGIN|INVITATIONAL  (ring.js:973)
// ring.js:36-45  runtime + daemons
runtime: { ref: "/runtime/localhost", status: "HEALTHY", latency: 4,
  daemons: [{ slug: "chess", ref: "/daemon/chess", status: "HEALTHY" }, { slug: "memo", ... }, { slug: "droneaid", ... }] }
//   status ∈ HEALTHY|DEGRADED|DOWN  (ring.js:974)
// ring.js:46  client
client: { ref: "/client/anima", home: "/client/anima/mode/home/console" }   // /client/ghost when face=tty
// ring.js:23  mode — host is runtime, daemon OR client
const mode = (host, type, slug, traits, extra) => ({ ref: `${host}/mode/${type}/${slug}`, host, type, slug, traits, ...extra });
//   extra: { keymap: [[path,line,valence]], hosted: true, repling: true }
//   traits used: HARNESSED ARTIFACTUAL EXPOSED TOOLING KEYMAPPED LOOPING FILESET DATASET AGENTIC GENERATIVE RUNTIME REPLING (ring.js:48-63)
// ring.js:66-77  artifact — one per (mode, slug, mime); a code mime per face
a1: { id: "a1", slug: "play", mime: "application/vnd.vivalence.dom.svelte+javascript", target: "frame",
      mode: "/daemon/chess/mode/board/play", mount: "buffer/Play.svelte", bytes: 48213, hash: "9c1e44d0a7b3" }
a2: { ..., mime: "application/vnd.vivalence.tty.solid+javascript", mount: "buffer/play.jsx" }
a7: { ..., mime: "text/markdown", target: null, mount: "/mountpoint/runtime/mode_harness_runtime/accounts-draft.md", source: "# …" }
a8: { ..., mime: "application/json", target: null, value: { quarter: "q3", filings: [...] } }
//   target ∈ frame|cell|null(content) ; faceOf/cellOf pick by the face's mime (ring.js:994-995)
// ring.js:80-82  buffer
b1: { id: "b1", label: "play #1", mode: "/daemon/chess/mode/board/play", thread: "th1", turns: [], target: "frame",
      artifacts: ["a1","a2","c1","c2","c3","c4"], kind: "chess",
      data: { moves: ["e2e4","e7e5","g1f3"], ply: 3, flipped: false, seats: { white: "user", black: "engine · 1600" } } }
//   + pick (frame artifact slug), cellPick (cell slug)  (ring.js:433,440) ; kind ∈ chess|memo|md
// ring.js:85  thread
{ id: "th1", label: "e4 openings", mode: "/daemon/chess/mode/board/play", h: { tune: "capable", effort: "low", rounds: 10 },
  run: null, fault: null, off: {}, toolsOff: {}, buffers: ["b1"], journal: [ rec(...) ] }
//   tune ∈ frugal|fast|capable ; effort ∈ none|low|medium|high ; off = context sections left out ; toolsOff = disarmed tools
// ring.js:116  terminal — seats a thread, owns the frame, the draft and the dock
{ id: "t1", thread: "th1", frame: "b1", draft: "", dock: { align: "right", share: 42, view: "docked" } }   // + dock.prev
// ring.js:24  turn/journal record — "rec"; there is NO separate turn entity
const rec = (kind, text, extra) => ({ kind, text, at: 0, ...extra });
//   kind ∈ you|agent|cmd|msg|fault|trace
//   agent: { tools: [toolRow], blocks: [block], buffers: [bufId], think: { open, nodes: [{label,depth,status,text,full,dur,t0,tools}] }, streaming, fold, copied }
//   cmd: { ans | block, path } ; trace: { ts, path }
//   toolRow: { name, arg, status: run|ok|wait|skip|err, t, dur, yield, loop, nature, frames, open, sp }
// ring.js:141-145  box · composer · tty · telemetry
box: { mic: "off", speaker: false, level: 0, tone: 0 }, voice: false,
comp: { atts: [{name,size}], dict: false, dw: 0, tail: "", wi: 0, hist: [], hi: -1 },
tty: { shell: "cockpit", sidebar: false, gfx: "auto" },
tele: { open: false, tab: "logger", x, y, w, h, records: [], seq: 0, sel: null, open_: {}, filter: "all", fold: {}, ping: 0 },
// ring.js:16-17  harness context + tool roster (hardcoded)
const TOOLS = ["entity_find", "entity_count", "buffer_update", "buffer_label", "thread_update", "mode_find", "artifact_create", ..., "repl_hello", "repl_whoami"];
const CTX = (mode) => [["system", "3.1k"], ["persona", mode], ["turns", "18.4k · 24"], ["tools", "4.2k · " + TOOLS.length], ["buffers", "1.2k"], ["clock", "0.1k"]];
```
- **More nouns:**
  - `face` is dom|tty.
  - `lens` is chat|repl|trace, a filter over record kinds (`ring.js:692-696`).
  - `seat` is the thread's mode (`seated`, `ring.js:175`).
  - `user` is only `lighthouse.user`, a string.
  - `signal` appears as a word (`/signal`, the SIG* names) and as the `request {nature, body}` mark. There is no `Signal` object.
- **Paths:** `terminalPath = "/anima|/ghost/client/terminal/<tid>"` (`ring.js:176`), so verb paths read `/anima/client/terminal/t1/tune`.
- **Missing nouns:** keymap is a structure, not an entity, and there is no "user" entity.

## 4 · design tokens

- **The dapper sheet arrives verbatim.** `dapper.css` has a `:root` block with legacy scales (`--spacing-*`, `--font-size-*`, shadows, `dapper.css:1-58`), then four themes (northsea, parchment, porcelain, datasette). Each theme has a root block (`dapper.css:60`) and four `[data-zone="0..3"]` blocks (`dapper.css:169,278,387,496`, …).
- **How the build applies it:** it re-roots `:root[data-theme=X]` to `#app[data-viva=X]` (`build/build.js:5-7`). The theme switch is `app.dataset.viva = w.theme` (`app.js:34`).
- **Key groups** (per zone, `design.js:5,100`): `surface · shape · size · text · control · signal · brand · font`. For example `--surface`, `--text-ink`, `--signal-primary-ink`, `--signal-caution-tint`, `--control-selected`, `--shape-radius-key`, `--size-row`, `--font-family-code`.
- **`declarations.json`** is `{theme:{zone:{--key:value}}}` with 4×4×106 entries. The build uses it **only** for the key list: `window.DAPPER_KEYS = Object.keys(northsea[1])` (`build/build.js:25`). The design page reads the values live from `document.styleSheets` (`design.js:8-13`).
- **The zones, defined as territory:** 0 = chrome (tabs, mode bar, control bar, sidebar), 1 = body (frame, dock), 2 = island (boot, signin, a standalone mode), 3 = bench (context/tools forms, telemetry) (`design.js:65-66`). The DOM sets `data-zone` per region (`dom.js:379-389`). The `context`/`tools` blocks carry `data-zone="3"` (`dom.js:237`).
- **The tty palette is derived from the same sheet.** A probe element is placed per zone, and each of 27 keys is flattened (rgba folded over the surface) to opaque hex (`tty.js:4-24`). That is the `tokens(theme, zone)` idea grown from the repo's 14 keys to 27. The repo's `subsystems/dapper/lib/tokens.js:116-131` `FLAT` has 14. `design.js:217` says this outright: "grows from 14 to 27".
- **Fonts travel with the theme** (`design.js:92`):

| themes | fonts |
|---|---|
| northsea · parchment | Poppins · Inter · K2D · Victor Mono |
| porcelain | IBM Plex |
| datasette | VT323 · Space Mono |

  The tty face forces `"IBM Plex Mono"` regardless (`base.css:377`).
- **Hex in the CSS:** only the fallbacks in `body` (`base.css:3`, `design.css:3`). No view hardcodes a hex.
- **Default theme:** follows the OS, northsea if dark and porcelain if light (`app.js:13`).
- **viket** is a **PNG**, 127×160, 8-bit gray+alpha (decoded header only). It is the logo mark, used as a CSS **mask** over `currentColor`, with `filter: var(--brand-filter)` (`base.css:396`). `__VIKET__` is substituted into base.css and tty.js (`build/build.js:18,28`). The tty face uses it for the kitty/sixel logo overlay (`tty.js:57`).

## 5 · URL params · deep linking · auth

- **Deep linking:** only `location.hash ∈ #dom | #tty | #design`, with `#dom` as the default (`app.js:17`). `after()` keeps the hash in sync with `w.face` via `replaceState` (`app.js:64`). There are **no** query params and no deep link to a thread, mode or buffer. The `try` buttons on the design page do `face|line|line` and dispatch the lines in-process (`design.js:236`).
- **Auth is entirely fake:**
  - **Lighthouse:** the lighthouse is a literal object (`ring.js:34`).
  - **Sign-in:** `signin()` only checks that the username and password are non-empty, then sets `standing = "VERIFIED"` and pushes a trace "access 1d · refresh 180d" (`app.js:178-185`). The tty version does the same (`tty.js:651`).
  - **Sign-up** prints "USERNAME_EXISTS would refuse" (`app.js:241`).
  - **Session verbs:** `/lighthouse/login` uses AUTOLOGIN when the trait is present, else opens the signin pane. `/lighthouse/logout` opens the signin pane. `/lighthouse/refresh` sets `expires = "24 h"` (`ring.js:490-494`).
  - **Boot** checks standing after the animation (`ring.js:652`).
- **Persistence:** localStorage key `viva.client.v1` (`app.js:10-11`).

## 6 · gaps — what is faked, what a real client still needs

**Faked or hardcoded:**
- **All entities** are inline literals in `world()` (`ring.js:26-147`).
- **Agent output:** `script(w, th, text)` is a regex table per mode (`ring.js:556-592`). The chess "engine" is an 8-ply book plus a `WHY` table (`ring.js:378,561`).
- **Hardwired buffers:** `/move`, `/game`, `/ply`, `/reveal` and `/grade` touch `w.buffers.b1` and `b2` directly (`ring.js:447,504-509,638`). The mode-specific verbs are chosen by `th.mode.includes("/board/")` (`ring.js:503,507`).
- **Faked meters and devices:** the context meter is `8 + journal*4 + buffers*6` (`ring.js:171`), and the ring is `min(12,1+tools*2)` (`ring.js:1039`). The latency is a literal 4 ms, and the pings never hit a wire (`ring.js:653-660`). Dictation types a canned sentence (`ring.js:665`), the mic level is a sine (`ring.js:668`), `/attach` sizes are "12 KB", and `/paste` makes `clipboard.txt`.
- **The loop:** the LOOPING tool calls the local registry and fakes the `frames` text (`ring.js:628-629`).
- **No mode code runs.** Artifact faces are painted by hand per `b.kind` (chess, memo, md) in both painters (`dom.js:148-177`, `tty.js:299-330`). No mode bundle is mounted, so the mimes and mounts are labels only.
- **The clock** is `09:12:03 + clock` (`ring.js:169`).

**Missing for a real client:**
- **Transport:** no connection to the runtime, daemons or lighthouse (no fetch, WebSocket or EventSource; grep is clean). Every state change is local mutation, and nothing arrives "by subscription".
- **Entity layer:** no repository, no nanostores, nothing like `RemoteRepository`. The journal records are not `Turn` entities. Activities are not entities, there is one run per thread, there is no `stdin`/`stdout`, and the activity record ring is not per-activity.
- **Bundles:** no mounting of mode bundles (`application`, `buffer` views, cells) and no mime-dispatched face. This was m87's job.
- **Command surface:** the verbs are not a `Vector`, there is no `{condition, output}`, the signal has no `flags`, and nothing composes per-scope (mode, terminal, client). The keymap is a hand trie rebuilt per keypress. It is close in shape to a keymap Vector (edges as a trie, effects as data, `leader/<subject>/<key>` paths), so it maps onto `gestalten/shard/keymap.js` (m92) almost directly.
- **Auth and links:** no real auth (JWT, refresh, invitations) and no URL routing beyond the face.
- **TTY reality:** no real terminal concerns such as OSC palette reading (mentioned only in prose at `design.js:90`), resize, raw mode or wide-char width. The tty face is a DOM emulation.
- **Internal inconsistencies:**
  - The design page cites `/continue retries` (`design.js:183`), but the verb is `/resume`.
  - `leader/e/a` is bound twice, to `/buffer/artifact` and to `/artifacts` (`ring.js:427,456`); the later one wins.
  - The DOM mime is still `…dom.svelte+javascript` (`ring.js:3`), while the handoff says anima goes Solid-free from scratch on `@vivalence/ghost` (`design.js:220`). Beef's rebuild is Solid on both faces.
- **Handoff claims to check against the tree** (`design.js:215-223`): `shard.repl.compose`, `gestalten/shard/keymap.js` (m92), `mode/traits/looping.js` (m88), drapes cutting `skins · stage · editor · triage`, `./dom` losing `belt.dock`. The designer clearly read the repo and the quests (m86 · m87 · m88 · m92, `design.js:224`).

**What carries forward cleanly:**
- the `sections()` typed-row view-model, rendered twice;
- the seven-subject bar and the subject keys `e a h d x s c g m`;
- the panel's four levels (keys → group → chooser → palette);
- every control being a line;
- the span/record telemetry with `tcode = reduce(verbs)` and signal buttons gated by `MACHINE.transitions`;
- the run step grammar as a spec for what the journal must render (think tree, tool rows, consent, progress, artifact cards, streaming caret);
- the tty palette derived per zone from dapper.
