<!-- writer: agent · kind: persistent · limit: 4000 chars · pane lines for anima's b + c panels, from design e88abb87 `Panels.dc.html` -->
# panels — the simplification, pane by pane

Commission: `Panels.dc.html` (design project e88abb87, anima's own design system — `tokens/sheet.css` IS dapper, so no foreign palette). Five cards, one grid `auto-fit minmax(300px, 1fr)`, each card `surface-lift` · ring `boundary` · head `surface-sunk` uppercase 11px. Row = `min-height: var(--size-row)`, selected = `control-contrast-pressed` + `shape-sunk`, else transparent. Font: `font-family-code` 12px.

The `empty` preset is the fresh screen: `no terminals` · threads none · one mode · `no thread` · `no buffer` · `0 / 0` · no hooks · meter 0 0 0.

- **terminals**: head `terminals` + `+ terminal` key (creates a terminal seated on the active thread). Rows `name` · short `id`, from `lighthouse.dataspace.terminal` (`Terminals.$entities`), active = `terminals.active`. Empty: `no terminals`.
- **navigation**: head `navigation` + daemon slug. `threads` rows `name` · age (top 3, `+ N more` / `less`), from `daemon.entities.thread`; pick seats the terminal. `modes` rows dot · `name` · `type`, from `daemon.modes`; pick sets the thread's mode.
- **thread**: head `thread` + `k / n` (cursor over the thread's buffers). Crumb `daemon › thread.label` · status dot. `mode`: 2-letter badge · name · type · trait pills, from `thread.mode`. `cursor`: `cur.name` heading + `prev` `next` `open`. `buffers`: index · name · status rows, from `thread.$buffers`; pick sets `terminal.$buffer`. Empty: `no buffers`.
- **buffer**: head `buffer` + `k / n`. `cur.name` heading. `mode` grid `name` → `mode.name · mode.type`. `hooks` pills mount · unmount · release, lit when `buffer.hooks[name].length`.
- **harness**: head `harness` + `thread.label`. `meter` 3 tiles turns · calls · tools. `intelligent`: `tune` (frugal fast balanced capable unleashed eager) · `effort` (none low medium high) · `thinking` (shown hidden) toggle keys, pressed = chosen, click again clears; `rounds` − n + (shift halves/doubles, click n clears, 1–50). Note `no usage on the wire`. Source: the thread's harness tune (where anima keeps it today — read `panels/c/panes/harness*`).

Dropped by the comp: the separate `mode` pane (folded into thread) · everything in today's b sections (config · auth · box · dock) — ruled below.
