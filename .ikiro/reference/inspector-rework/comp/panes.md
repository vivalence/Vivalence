<!-- writer: agent · reference, uncapped · 2026-11-16 · the comp "Inspector · rework" (claude.ai canvas 65498858…) read as a spec -->
# panes — one line each: shows what, from where

Comp: `Main.dc.html` (anima, 960×640) · `Ghost.dc.html` (tty, 112×32 cells) · `bundle.css` (the kit the comp borrows). Every datum below is RE-SOURCED live; the comp's `SPEC` · `BASE` are the captures of 11-16, not data.

## window (`parts.Tele`)

- head: `telemetry` label · tabs `inspector` | `logger <records>` · `! <faults>` (spans owning a fault, click → faults) · close. From `app.telemetry.state.view` · `$logger`.
- drag · resize grip: live chrome, the comp omits it, it STAYS.

## inspector · tree pane (248px)

- filter field (`state.query`) · lens strip `tree · tools · primers · refs · routes · commands · traits · modes` with counts (node kinds).
- tree: one node per ENTITY or face, `app` root. From: `app` · `client.mask` · `client.runtime` · `runtime.lighthouse` · `entities.daemon/mode/terminal/thread/turn/buffer/activity.$entities` · `fromm.modes(client.modes)` · `mode.metadata.harness/aperture` (`shape.strip`) · `terminal.repl.commands` · `app.bridge` · `app.telemetry`.
- a lens lists one kind, grouped by its owner (mode · group · host).

## inspector · object pane (flex)

- head: kind · title · ref · acts (`copy` · `json` + per kind `attach` · `read` · `send` · `clear` · `new`).
- crumbs: lineage, each a pick.
- sections: per kind, key · value · quiet note; values text · link (→ node) · choice · select · step · set · field.
- an editable value speaks ONE repl signal: `/set <path> <value>` · `/theme <name>`.
- `holds`: the node's children as links.

## inspector · trace pane (288px)

- spans touching the picked node: a span touches when its path names an entity key under the node (`terminal/<id>` · `/runtime/<slug>` · `/daemon/<slug>` · `lighthouse` · `activity/<id>`), or a command node's nature equals the span's.
- `all N | faults N` · rows: dot · name · bar on ONE timeline · ms.
- detail: path · code · duration · fault box · records (`+t` · track · value) · stack fold.

## logger (flex | 320px)

- filters `all · activity · repl · net · faults` with counts · spans as above · detail as above.
- activity detail keeps the `SIGSTOP · SIGCONT · SIGTERM · SIGKILL` acts (live chrome).

## dropped — sourceless in the comp

| comp datum | why |
|---|---|
| activities `seen` section | settled activities leave the store; no fold keeps them |
| `entities` counts per kind on runtime (`turn 8`) | read live as store lengths; `+1 local` kept |
| `size 129336 chars json` on a harness | not a store; dropped |
| logger span folds | the comp's waterfall is flat; depth stays as indent |
| `brings` rows on a mode trait | no source says what a trait brings; a trait shows its name and mode |
| activity `seen` history on a thread's trace | settled activities leave the store; a thread's trace is its terminal's spans |

## landed 11-16 (anima face)

- model: `panels/telemetry/entities.js` (tree · lenses · picked) · `spans.js` (story · arrange · waterfall · logger · traced); `trees.js` cut.
- parts: drapes `Tele` · `Inspector` · `Logger` (`Spans` · `Told` shared); `Tree.jsx` cut; `.tele` sheet = the comp's, rem.
- fixed on the way: a span without its parent's record hangs under its nearest ancestor (was a root); `Activity.error` getter; a step of a settled activity is no longer live; `/inspector <point>` takes a reference too and opens the lineage.
- proof: `model.probe.js` (live world, free port) · `systems/anima/tests/entities.test.js` · `subsystems/drapes/tests/parts/tele.test.js`; mounted on `:1794` via `/inspector thread`.

## owed

- the tty face (`Ghost.dc.html`): ghost's telemetry is still a swatch; the model lifts to ghost with its second consumer.
- the head's pressed tab: `--control-contrast-pressed` on `--surface-sunk` barely separates; it reads by ink only.
