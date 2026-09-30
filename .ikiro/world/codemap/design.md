---
paths: ["subsystems/dapper/**", "subsystems/drapes/**", "subsystems/sheets/**"]
---
<!-- writer: agent · kind: persistent · limit: 12000 chars · traps only, the code is the map -->
# codemap: design — dapper (tokens → CSS) · drapes (Svelte components) · sheets (ink TUI kit)

Two surfaces, one vocabulary each: the browser reads dapper tokens through drapes; the terminal reads `sheets/theme.js` color names through ink. The consumer laws (hex literal = defect, the `--colors-*` surface, FOCUS LAW) live in `anima.md`; these are the producer's traps.

- dapper is ONE pipe: `lib/system.js` `design()` = `scales()` (`lib/tokens.js`, a bare `:root` of 62 lengths and fonts) then every theme of `themes/index.js` `THEMES` through `emit` (`lib/emit.js`); `lifecycle/index.js` prepends the sheet via postcss at BUILD time, nothing at runtime. `primitives/` holds only `font.css` · `bsp.css`, LIVE through anima aliases (`systems/anima/vite.config.mjs:130`). (`subsystems/dapper/lib/system.js:5`)
- the token space is 94 keys in seven groups (shape · size · text · control · signal · brand · font) plus 12 ground keys per zone; a zone block emits 106 declarations and `:root[data-theme]` is zone 1 whole. Schematics: `subsystems/typology/schematics/primitives/theme.js:1`; a key outside them faults at import, a theme below the floor (one zone surface · `text.ink` · `signal.primary` fill) throws.
- themes are FOUR, `northsea` (dark) · `parchment` · `porcelain` · `datasette` (light), one list (`systems/anima/src/typology/stores/bridge/bridge.js:27` `THEMES`, a name outside it resolves to the default through `knownTheme`), picked by `<html data-theme>`: `systems/anima/src/client.html:2` defaults northsea, `systems/anima/src/client.html:8` guards the saved name, `systems/anima/src/app/+page.svelte:64` writes it. A theme states no polarity (m72 cut `scheme`), so a view that flips for a light ground names the light themes by string — the chess kit, five copies (`~/.viva/registry/chess/modes/board/play/buffer/kit/Theme.svelte:56`). A theme added greps `data-theme="` across the checkout AND `~/.viva/registry` before it lands (m73 missed it: pieces inverted on porcelain and datasette); `~/.viva/registry/chess/tests/kit.test.js:101` P-theme-reads measures the pieces and squares in every dapper theme. A style claim owes a walk in every theme.
- a pair is not a name: porcelain's and datasette's zone 0 set `text.strong` EQUAL to `control.contrast` (`#EDF0F4` · `#F4F4F1`), so `--text-strong` on `--control-contrast` reads 1:1 there — a key's ink is `--control-on`, which northsea and parchment hold equal to `text.strong` (the comp's two themes, where its pairs were drawn). A consumer painting ink on ground pins its pairs on every theme's zone: `systems/anima/tests/pincer/theme.test.js` resolves the radial's twelve on zone 0, floors 4.5 text · 3 glyph. `--signal-primary-tint` and `--control-selected` are FILLS, not text grounds: on zone 0 every text ink reads 1.1–3.9:1 on them in two themes each; `--surface-sunk` holds every ink at ≥ 6.1 (the spine's pinned card, 09-30, pinned in the same test). (`subsystems/dapper/themes/porcelain/theme.js:18`)
- a theme is `theme(definition)` in `themes/<name>/theme.js` over its own `gradients.js`, shared with none; dapper takes `v` from `@vivalence/typology`, never the `/schematics` door. (`subsystems/dapper/themes/northsea/theme.js:1`)
- a running `vite dev` holds dapper in memory: an edit under `subsystems/dapper` reaches the served sheet only after `anima/watch` restarts; the page's `data-theme` changes at once, so a renamed theme renders unstyled until then, and a new key reads empty (the pincer drew no ring at all). Prove a sheet on `anima/bundle`, never on the dev server. Restart the watchers yourself: /"you can kill and run processes"/ · /"the two deno ones"/ — `anima/watch` stops on SIGTERM; `runtime/watch`'s script ends on SIGTERM and `--watch` then idles, re-spawning on the next save into a taken `:2501` — SIGINT it. A watcher started from my shell outlives the shell: the turn ends with it SIGINTed or restarted in beef's terminal, never listed as owed (09-30: an orphan faulted his launch `EADDRINUSE`, and held 43 esbuild services). (`subsystems/dapper/lifecycle/index.js:8`)
- a view never names a zone: it sits inside a `data-zone="N"` box and reads `--surface` · `--surface-sunk` · `--surface-lift`. anima declares 14 boxes in 11 files and `systems/anima/tests/zones/places.test.js:5` pins that map; a new territory goes there first.
- tailwind maps slots and scales only (`subsystems/dapper/belt/tailwind-theme.js:3`), no safelist: a class name is a LITERAL in the source or the JIT drops it. `systems/anima/tests/zones/slots.test.js:1` fails on a read of a name the sheet does not emit — a typo'd slot is silent in the browser.
- drapes reads slots by name and knows no level: a component paints with `--surface` · `--text-strong` · `--signal-*` and the zone it sits in decides the value. Role props keep their seven names (`danger` · `warning` · `accent` …) and fold onto four signals through `subsystems/drapes/context/signals.js:1` `SIGNAL`; tailwind classes there are LITERALS (`FILL` · `INK` · `GLYPH`) so the JIT sees them, never a template.
- `subsystems/drapes/controls/Button.svelte` is DEAD in live code (only `registry/education/**/bak/` imports it); game modes hand-roll — /"just keep them hand rolled. fix it inline."/
- live drapes surface, importers across anima + registry (bak excluded, 09-28): `Desk` 30 · `Asset` 28 · `ViewportLock` 16 · `Text` 12 · `Keyboard` 12 · `Section` 11 · `Pip` 11 · `Empty` 8 · `visible` 8 · `Canvas` 7 · `drag` 7. A signature change there is a blast (skill `blast-bracket`), the rest is near-free. (`subsystems/drapes/mod.js:1`)
- `context/preferences.js` is `localStorage` keyed `viva.mode.<slug>` — per BROWSER, only education dojo reads it (`~/.viva/registry/education/modes/games/dojo/buffer/Dojo.svelte`); screen state goes to `buffer.data` (anima trap), never here.
- `<Icon carbon=…>` is app-layer ONLY — inline the SVG in a buffer bundle. `drapes/editor/` has ONE consumer, outside the repo. (`~/.viva/registry/vcompany/modes/office/vdex/buffer/parts/Reader.svelte:3` · `project_buffer_bundle_typology_only`)
- drapes editor (`subsystems/drapes/editor/`, reached ONLY as the subpath `@vivalence/drapes/editor/index.js`, never the barrel — ~400 kB): a drapes subpath entry is always `.js` (the bundler loads it `loader: "js"`); never push outside text as `{from: 0, to: doc.length, insert}` — the caret collapses to 0 even on identical text; push `diff(held, next)` + `EditorSelection.cursor(...)` tagged `External` (`editor/sync.js:3`); `LRLanguage.define` only for a Lezer LR parser — a `MarkdownParser` there aborts every input transaction (base `Language` + `defineLanguageFacet`). · `project_drapes_editor`
- `skins` rides the drapes barrel as a namespace (`subsystems/drapes/mod.js:8` `* as skins`), never an anima sub-alias.
- sheets = ink@5 + react@18 + `@cliffy/*`, all from ROOT `import_map.json` (`import_map.json:104`); JSX compiles to `React.createElement` (`subsystems/sheets/deno.jsonc` compilerOptions) — every `.jsx` needs `React` in scope. Consumers import `Box · Text · React · useInput` FROM `@vivalence/sheets` (`subsystems/sheets/mod.jsx:18`), never bare `ink`: one ink instance.
- sheets TDD surface is `state/*.js` — pure `init` + `reduce`, `tests/*.state.test.js` (09-28: `37 passed | 0 failed`); `components/*.jsx` stay thin views. Form law: one page is `pages.length === 1`; `active === fields.length` IS the actions bar (`state/form.js:atActions`), `set` there is identity (`tests/field-protocol.test.js`).
- `view` has three surfaces (`subsystems/sheets/mod.jsx:view`): `scroll.emit` (Static, one frame, fire-and-forget) · `scroll.render` (inline, resolves on `buffer.release(opts)`) · `buffer.render`/`buffer.shell` (alt-screen inside `Chrome`); `hijack(shell)` repaints scroll.* into the shell slot for ghost `--buffer` (`systems/ghost/mod.js:98`). A component that never calls `buffer.release` hangs its verb forever.
- ghost rules `render` on `ctx.interactive` (`systems/ghost/mod.js:90`): a non-TTY `render` THROWS by design, `emit` runs everywhere, `--json` skips both.
- `sheets/theme.js` holds ink color NAMES (`accent: "cyan"`) — terminals take ANSI, not dapper hexes; still, 14 literal `color="…"` bypass it (`components/TextInput.jsx:44`, Effect, JsonTree, Banner, Table, Tasks) — new code reads `theme.*`.
- ink reports DEL (0x7f, the macOS backspace) as `key.delete`: every edit handler takes `key.backspace || key.delete` (`subsystems/sheets/components/TextInput.jsx:34`).
- `sheets/bak/` carries a second `deno.jsonc` also named `@vivalence/sheets` (0.0.1, `./mod.js`) — the dead cliffy-only predecessor; `cliffy.js` is its surviving export, as the `cliffy` namespace.

<!-- generated: python3 .ikiro/methods/codemap.py design — never hand-edited -->
```jsonc
// subsystems/dapper
{
 "package": "@vivalence/dapper",
 "exports": {
  ".": "./mod.js",
  "./contrast": "./lib/contrast.js",
  "./postcss": "./lifecycle/index.js",
  "./tailwind": "./belt/tailwind-theme.js"
 },
 "barrels": {
  "mod.js": ["design", "theme", "emit", "declarations", "contrast", "TOKENS", "scales", "THEMES", "postcssPlugin", "tailwindClasses"],
  "lib/contrast.js": ["channels", "hex", "wash", "blend", "flatten", "luminance", "contrast"],
  "lifecycle/index.js": ["plugin", "default"],
  "belt/tailwind-theme.js": ["tailwindClasses", "default"]
 },
 "tasks": {"test": "deno test -A --no-check tests/**/*.test.js"},
 "tasks, one file each (all --watch)": 0,
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
 "tasks, one file each (all --watch)": 0,
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
 "tasks, one file each (all --watch)": 0,
 "tests": {"tests": 7}
}
```
<!-- /generated -->
