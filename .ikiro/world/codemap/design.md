---
paths: ["subsystems/dapper/**", "subsystems/drapes/**", "subsystems/sheets/**"]
---
<!-- writer: agent · kind: persistent · limit: 12000 chars · traps only, the code is the map -->
# codemap: design — dapper (tokens → CSS) · drapes (Svelte components) · sheets (ink TUI kit)

Two surfaces, one vocabulary each: the browser reads dapper tokens through drapes; the terminal reads `sheets/theme.js` color names through ink. The consumer laws (hex literal = defect, the slot surface, FOCUS LAW, `.card-row`) live in `anima.md`; these are the producer's traps.

## dapper

- dapper is ONE pipe, run at BUILD time: `design()` = `scales()` (a bare `:root`, 56 declarations) then every theme of `THEMES` through `emit`; the postcss plugin prepends that sheet — nothing happens at runtime. `primitives/` holds only `font.css` · `bsp.css`, LIVE through anima aliases (`systems/anima/vite.config.mjs:130`), not package exports. (`lib/system.js:5` · `lifecycle/index.js:8`)
- the token space is 94 keys in seven groups (shape · size · text · control · signal · brand · font) + 12 ground keys per zone → every zone block emits 106 declarations; `:root[data-theme]` is zone 1 whole. A key outside the schematic faults at import; a theme below the floor (zone surface · `text.ink` · `signal.primary` fill) throws. (`subsystems/typology/schematics/primitives/theme.js:1` · `lib/theme.js:47`)
- a theme is `theme(definition)` in `themes/<name>/theme.js` — northsea and parchment over their own `gradients.js`, shared with none; dapper takes `v` from `@vivalence/typology`, never the `/schematics` door. (`themes/northsea/theme.js:1`)
- themes are FOUR — `northsea` (dark) · `parchment` · `porcelain` · `datasette` (light) — and the name lives in THREE places: `THEMES` + `knownTheme` (an unknown name resolves to northsea, `systems/anima/src/typology/stores/bridge/bridge.js:28`), `client.html` (default `:2`, saved-name guard `:8`), and `+page.svelte:63` writes `<html data-theme>`. A theme states no polarity, so a view that flips for a light ground names the light themes by string — the chess kit, FIVE copies of `buffer/kit/Theme.svelte` (`~/.viva/registry/chess/modes/board/play/buffer/kit/Theme.svelte:57`). Adding a theme → grep `data-theme="` across the checkout AND `~/.viva/registry` first (m73 missed it: pieces inverted on porcelain and datasette); `~/.viva/registry/chess/tests/kit.test.js:101` P-theme-reads measures every theme. A style claim owes a walk in every theme.
- a pair is not a name: porcelain's and datasette's zone 0 set `text.strong` EQUAL to `control.contrast` (`#EDF0F4` · `#F4F4F1`) → `--text-strong` on `--control-contrast` reads 1:1 there. A key's ink is `--control-on`. `--signal-primary-tint` and `--control-selected` are FILLS, not text grounds (1.1–3.9:1 on zone 0 in two themes each); `--surface-sunk` holds every ink ≥ 6.1. Ink-on-ground pairs are pinned per theme per zone in `systems/anima/tests/pincer/theme.test.js` (floors 4.5 text · 3 glyph) — a new pair goes there. (`themes/porcelain/theme.js:18` · `themes/datasette/theme.js:19`)
- a running `vite dev` holds dapper IN MEMORY: an edit under `subsystems/dapper` reaches the served sheet only after `anima/watch` restarts, while `data-theme` changes at once → a renamed theme renders unstyled, a new key reads empty. Prove a sheet on `anima/bundle`, never the dev server. Restart the watchers yourself (/"you can kill and run processes"/ · /"the two deno ones"/): `anima/watch` stops on SIGTERM; `runtime/watch` must be SIGINTed (SIGTERM ends the script, `--watch` idles, then re-spawns into a taken `:2501`). A watcher started from my shell outlives it → the turn ends with it SIGINTed or restarted in beef's terminal, never listed as owed (an orphan faulted his launch `EADDRINUSE`).
- a view never names a zone: it sits inside a `data-zone="N"` box and reads `--surface` · `--surface-sunk` · `--surface-lift`. anima's map is 24 declarations in 11 files, pinned EXACTLY by `systems/anima/tests/zones/places.test.js:5` — a new territory (or a deleted panel) edits `PLACES` first.
- tailwind maps slots and scales only, no safelist: a class name is a LITERAL in the source or the JIT drops it. `systems/anima/tests/zones/slots.test.js` fails on a read of a name the sheet does not emit — a typo'd slot is silent in the browser. (`belt/tailwind-theme.js:3`)

## drapes

- drapes reads slots by name and knows no level: a component paints with `--surface` · `--text-strong` · `--signal-*` and the zone decides the value. Role props keep seven names (`danger` · `warning` · `accent` …) folded onto four signals by `SIGNAL`; the tailwind classes there are LITERALS (`FILL` · `INK` · `GLYPH`), never a template. (`context/signals.js:1`)
- a drapes class name is reachable by any unscoped consumer rule: `.row` is carried by `display/Row.svelte:12` AND `Key size="row"` (`controls/Key.svelte:106` `.key.row`). Never give a new component a Tailwind-utility or generic class name.
- `controls/Button.svelte` is DEAD (importers outside `bak/` → 0, re-run 10-06); game modes hand-roll — /"just keep them hand rolled. fix it inline."/
- live importers of the barrel, anima + registry, `bak/` excluded (10-06): `Key` 26 · `Pip` 13 · `Empty` 12 · `Row` 9 · `Float` 7 · `Input` 7 · `Asset` 7 · `Section` 6 · `Desk` 6 · `drag` 6. A signature change on these is a blast (skill `change`). (`mod.js:1`)
- `context/preferences.js` is `localStorage` keyed `viva.mode.<slug>` — per BROWSER; only education dojo reads it (`Dojo.svelte:90` · `parts/Builder.svelte:108`); screen state goes to `buffer.data`, never here.
- `<Icon carbon=…>` (`panels/icon/Icon.svelte`) is app-layer ONLY — inline the SVG in a buffer bundle. · `project_buffer_bundle_typology_only`
- the editor (`editor/`, ~400 kB) is reached ONLY as the subpath `@vivalence/drapes/editor/index.js`, never the barrel; ONE consumer, outside the repo (`~/.viva/registry/vcompany/modes/office/vdex/buffer/parts/Reader.svelte:3`). A drapes subpath entry is always `.js` (bundled `loader: "js"`). Never push outside text as `{from: 0, to: doc.length, insert}` — the caret collapses to 0 even on identical text; push `diff(held, next)` + `EditorSelection.cursor(...)` tagged `External`. `LRLanguage.define` only for a Lezer LR parser — a `MarkdownParser` there aborts every input transaction (use base `Language` + `defineLanguageFacet`). (`editor/sync.js:3` · `project_drapes_editor`)
- `skins` rides the barrel as a namespace, never an anima sub-alias. (`mod.js:8`)

## sheets

- sheets = ink@5 + react@18 + `@cliffy/*`, all from ROOT `import_map.json` (`:19` · `:104`); JSX compiles to `React.createElement` → every `.jsx` needs `React` in scope. Consumers import `Box · Text · React · useInput` FROM `@vivalence/sheets`, never bare `ink`: one ink instance. (`deno.jsonc` compilerOptions · `mod.jsx:18`)
- the TDD surface is `state/*.js` — pure `init` + `reduce`, `tests/*.state.test.js` (10-06: `37 passed | 0 failed`); `components/*.jsx` stay thin views. Form law: one page is `pages.length === 1`; `active === fields.length` IS the actions bar, and `set` there is identity. (`state/form.js:40` · `tests/field-protocol.test.js`)
- `view` has three surfaces: `scroll.emit` (Static, one frame, fire-and-forget) · `scroll.render` (inline, resolves on `buffer.release(opts)`) · `buffer.render`/`buffer.shell` (alt-screen inside `Chrome`); `hijack(shell)` repaints scroll.* into the shell slot for ghost `--buffer` (`systems/ghost/mod.js:98`). A component that never calls `buffer.release` hangs its verb forever. (`mod.jsx:93` · `:110` · `:125`)
- `theme.js` holds ink color NAMES (`accent: "cyan"`) — terminals take ANSI, not dapper hexes; 14 literal `color="…"` still bypass it (TextInput · Effect · JsonTree · Banner · Table · Tasks, e.g. `components/TextInput.jsx:44`) — new code reads `theme.*`.
- ink reports DEL (0x7f, the macOS backspace) as `key.delete`: every edit handler takes `key.backspace || key.delete`. (`components/TextInput.jsx:34`)
- `bak/` carries a second `deno.jsonc` also named `@vivalence/sheets` (`./mod.js`) — the dead cliffy-only predecessor; `cliffy.js` is its surviving export, as the `cliffy` namespace.

<!-- writer: agent · hand-kept, recounted 10-06 -->
```jsonc
// subsystems/dapper
{
 "package": "@vivalence/dapper",
 "exports": {".": "./mod.js", "./contrast": "./lib/contrast.js", "./postcss": "./lifecycle/index.js", "./tailwind": "./belt/tailwind-theme.js"},
 "barrels": {
  "mod.js": ["design", "theme", "emit", "declarations", "contrast", "TOKENS", "scales", "THEMES", "postcssPlugin", "tailwindClasses"],
  "lib/contrast.js": ["channels", "hex", "wash", "blend", "flatten", "luminance", "contrast"],
  "lifecycle/index.js": ["plugin", "default"],
  "belt/tailwind-theme.js": ["tailwindClasses", "default"]
 },
 "tasks": {"test": "deno test -A --no-check tests/**/*.test.js (one-shot, no --watch)"},
 "tests": {"tests": 3}
}
// subsystems/drapes
{
 "package": "@vivalence/drapes",
 "exports": {".": "./mod.js"},
 "barrels": {
  "mod.js": ["* from ./context/index.js", "* from ./decor/index.js", "* from ./display/index.js", "* from ./controls/index.js", "* from ./panels/index.js", "* from ./triage/index.js", "* from ./stage/index.js", "* as skins from ./skins/index.js"]
 },
 "tasks": {},
 "tests": {"tests": 5}
}
// subsystems/sheets
{
 "package": "@vivalence/sheets",
 "exports": {".": "./mod.jsx"},
 "barrels": {
  "mod.jsx": ["Box", "createContext", "Newline", "React", "render", "Spacer", "Static", "Text", "Transform", "useApp", "useContext", "useEffect", "useFocus", "useFocusManager", "useInput", "useRef", "useState", "useStdin", "useStdout", "* from ./components/TextInput.jsx", "* from ./components/PasswordInput.jsx", "* from ./components/Select.jsx", "* from ./components/Search.jsx", "* from ./components/Table.jsx", "* from ./components/MultiSelect.jsx", "* from ./components/Confirm.jsx", "* from ./components/TextArea.jsx", "* from ./components/List.jsx", "* from ./components/Effect.jsx", "* from ./components/Field.jsx", "* from ./components/Actions.jsx", "* from ./components/Form.jsx", "* from ./components/Banner.jsx", "* from ./components/Tasks.jsx", "* from ./components/Logo.jsx", "* from ./components/Background.jsx", "* from ./components/Chrome.jsx", "* from ./components/JsonTree.jsx", "* as search from ./state/search.js", "* as cliffy from ./cliffy.js", "theme", "BufferControl", "view"]
 },
 "tasks": {},
 "tests": {"tests": 7}
}
```
