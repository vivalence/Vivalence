# m73 — builder brief, common part

You build ONE patch of quest m73 (the designer's Anima comp, implemented on anima's zoned token space) inside a SANDBOX copy of the repo. Another builder builds a sibling patch in its own sandbox at the same time; a third person builds patch 3. An integrator merges the three afterwards. So: stay inside your file set.

Paths used below:

- REPO = /Users/finn/vivalence/code/vivalence — the live tree. READ-ONLY for you. Never write, move or delete anything there.
- M = /private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/9c4d5944-788f-4d91-9f23-f9164b5bdd9f/scratchpad/m73 — the quest's workbench (read).
- T = M/tree — holds the sandboxes and the helper scripts.
- SANDBOX = T/<your sandbox> — the ONLY place you write. It is a full copy of the repo's containers with `node_modules` symlinked.
- QUEST = REPO/.ikiro/quests/m73-anima-and-design-system-comps.org — the design. Read your patch's section whole, with the Read tool, by line range.

## Hard rules

1. Write only under SANDBOX. Never touch REPO, `~/.viva`, or another sandbox.
2. Never run a git or jj command that writes. Never run `deno fmt` (it reflows whole files; the repo is hand-kept at ~120 columns).
3. Do not spawn sub-agents.
4. NO COMMENTS in code you write — none, not `//`, not `/* */`, not `<!-- -->`. A comment is the rename you did not make. Comments already in a file that you keep may stay where the lines around them stay.
5. Full names. `terminal daemon thread buffer result config`, never `t d th buf res cfg`. No shims, no aliases, no compatibility layers, no `// was X`.
6. A view holds NO hex, NO `rgb()/rgba()`, NO `color-mix()`, NO `50%` radius, NO literal zone number. It reads dapper slots: ground `--surface` `--surface-sunk` `--surface-lift` `--boundary` `--boundary-strong` `--shadow` `--scrim`; text `--text-{header,strong,ink,light,muted,link,code}`; controls `--control-*`; signals `--signal-{primary,positive,caution,negative}` (the fill) with `-ink` (signal TEXT on the ground) · `-tint` · `-on` (a glyph ON the fill); lengths `--size-*` · `--shape-*`; scales `--size-type-{2xs,xs,sm,md,lg,xl,…}` · `--font-family-{code,sans-text,sans-heading,serif-text,serif-heading,brand}`. A dot, a led and a spinner read `--shape-radius-full`. The authoritative list of names is what `SANDBOX/systems/anima/tests/zones/slots.test.js` accepts — run it.
7. `--boundary-soft` and `--divider` hairlines become `--boundary`. `--inverse-on` on a primary fill becomes `--signal-primary-on`.
8. FOCUS LAW: a text field is never `disabled` and never `readonly`. One field element per session, no `{#key}` around it. A field that must not accept input reverts its value in `oninput`.
9. Never name a CSS class after a Tailwind utility (`collapse`, `ring`, `grow`, `hidden`, `flex`, `grid`, `block`, `table`, `fixed`, `static`, `container`, `visible`, `invisible`, `truncate` …): `src/client.css` loads Tailwind globally. Do not use the class names `row` or `act` inside a `<section>` — an unscoped global rule claims them today and is deleted at integration.
10. A prop named `state`, `derived`, `effect` or `props` collides with a rune. Name it something else.
11. An `$effect` must not read a `$state` it writes in the same synchronous run. A nanostores listener fires synchronously inside the subscribing `$effect`: wrap a listener that reads what it writes in `untrack`.
12. The client is domain-blind: no mode name, no domain word, no per-mode branch in anima or drapes source.
13. Keep logic, change paint. Every behaviour the live file has and the quest lists under "kept" survives byte-for-byte where it can. If the quest and the live file disagree about what a line does, the LIVE FILE is right — say so in your report.
14. The quest carries the first option of every open fork. Build that option. Do not invent a third.

## Read first, in this order

1. QUEST — your patch's section (line range in your own brief), then `* forks` (lines 198–244) and `* the panes — one line each` (184–197).
2. REPO/.ikiro/self/connoisseur.md — the code doctrine.
3. REPO/.ikiro/world/codemap/anima.md and REPO/.ikiro/world/codemap/design.md — the traps of this container.
4. REPO/.ikiro/reference/design.md — the token space, the zones, the kit's law.
5. M/stage.md and M/chrome.md — two per-file analyses, comp vs live. They are HINTS: a pass found 29 of their claims wrong and 12 moved. M/pass/patch3.md and M/pass/patch456.md list what was wrong. Verify every `file:line` you take from them against the file.
6. The comp: M/Anima.dc.html is the template (30 lines of it are longer than 2 000 characters — never `cat` or `grep` it raw; use `cd M && python3 tpl.py '<regex>' <context> <cap>` to search and `python3 bare.py <from-line> <to-line>` to read lines with the inline styles stripped). M/logic.js is its view-model class, 717 lines, readable.

## The kit — `@vivalence/drapes`, already in the sandbox (patch 2)

Read each part's source before you use it (`SANDBOX/subsystems/drapes/{controls,display,panels}/<Name>.svelte`). Props:

| part | props |
|---|---|
| Key | label · tone (plain, primary, negative, ghost) · size (key, row, field, mini) · latched · led · muted · square · wide · disabled · hold (ms) · title · type · onclick · onhold · onpress · onrelease · children |
| Segmented | options (strings or {value, label, title}) · value · size · cell · onpick |
| Stepper | value · min · max · onchange |
| Input | value (bindable) · type · placeholder · name · autocomplete · autocapitalize · autocorrect · spellcheck · title · oninput · onkeydown |
| Row | selected · title · onclick · children |
| Reading | label · children |
| Well | children |
| ToolRow | name · digest · status · tone · open · live · title · ontoggle · actions (snippet) · children |
| Pressed | children |
| Strip | keys · folds · fold · place · width · rail (bindable) · onpick · onsolo · onfold |
| Meter | value · tone |
| Spinner | size |
| Status | tone (none, idle, primary, positive, caution, negative) · word · size · live · pulse · title |
| Tag | tone · led · lit · title · children |
| Empty | verb · trace · tone · dashed · spinner |
| Chip | label · active · mark · onclick · onmark · disabled · title |
| Section | label · count · rule · action (snippet) · open · ontoggle |
| Pip | size · tone (primary, muted, warning, success, danger, contrast) · pulse · glow |
| Card | sunk · onclick · disabled · children |
| Float | anchor (element) · zone · title · side (below, above, after) · snug · onclose · children |

You do not change a kit part unless your own brief names it. If a part lacks something you need, build it in your own component and say so in the report.

## Shared contracts — already in your sandbox, do not rewrite them

- `systems/anima/src/app/widgets/Tune.svelte` — the intelligence editor as float content: `<Tune {thread} />`.
- `systems/anima/src/app/panels/e/widgets/intelligent.js` — `TIERS EFFORTS ROUNDS AXES faculties thinks contextLabel avenues origin summary write(thread, patch)`.
- `systems/anima/src/app/panels/a/widgets/turns.js` — gained `project(turn, results)` · `turnDate` · `dayKey` · `dayLabel(date, now)` · `clockTime` · `enrich(turns, now)` (the dock's item list: day dividers and joined turns) · `exchanges(items)` · `callRoster(exchanges)` · `manifest(items, agent)`. `sessionUsage(turns)` is the spend. Tested in `tests/dock-turns.test.js`.
- `systems/anima/src/typology/entities/activity.js` — gained `TONES` (activity code → a `Status` tone) and `settled(code)`; both are on the `@vivalence/anima` barrel beside `loudest` · `roster` · `owed`.
- `systems/anima/src/typology/entities/terminal.js` — `terminal.$settling` / `terminal.settling`: `{ thread, buffer }` while a reload still restores the terminal, else `null`. Written by `app/terminals.js`. Tested in `tests/terminals.test.js`.
- `systems/anima/src/typology/stores/bridge/bridge.js` — `bridge.view.fold` (`page` | `stack`) · `bridge.view.strip` (`top` | `bottom`) · `bridge.setFold` · `bridge.setStrip`. Tested in `tests/bridge.view.test.js`.

## Tests and gates — run them, paste what they print

```sh
T=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/9c4d5944-788f-4d91-9f23-f9164b5bdd9f/scratchpad/m73/tree
# one file
cd $T/<sandbox> && deno test --config $T/<sandbox>/deno.jsonc -A --no-check systems/anima/tests/<file>.test.js
# whole suites, envelope per suite (logs land in $T/logs/<sandbox>.<name>.log)
$T/suites2.sh <sandbox> anima=systems/anima/tests/ drapes=subsystems/drapes/tests/
# svelte compile check, zero warnings wanted
cd $T/<sandbox> && deno run -A --config $T/<sandbox>/deno.jsonc $T/compile.js <absolute paths of .svelte files>
# the bundle
cd $T/<sandbox>/systems/anima && deno run -A npm:vite@6 build > $T/logs/<sandbox>.bundle.log 2>&1; echo "exit $?"
```

`deno task test` never exits (it watches) — never run it. The baseline of your sandbox before you touch it: anima `55 passed (224 steps) | 0 failed`, drapes `12 passed (106 steps) | 0 failed`.

Tests that bind you:

- `tests/zones/slots.test.js` — every `var(--…)` a view reads is a slot, a scale or a local the file sets itself; no theme hex in any view; and a census floor (`reads.length > 1000`). Do NOT edit this file. If it fails ONLY on the census floor, report the count it printed; the integrator restates the floor.
- `tests/zones/places.test.js` — a fixed map of which file declares which `data-zone`, literal values only: `data-zone="1"`, never `data-zone={zone}`, and the text `[data-zone` appears in no `src` file.
- A test you change keeps what it proves. A test you delete is named in your report with the test that takes its place.

A `.svelte` compile proves syntax, never behaviour. Where your brief asks for a mount test, mount under linkedom with the rig of `tests/activity.mount.test.js` (read its header: under Deno bare `svelte` is the server stub — import `svelte/src/index-client.js`; delegated handlers are called as `element.__click(...)`).

## Your report — the last thing you write

Plain text, no preamble:

1. FILES — three lists, sandbox-relative: new · changed · deleted.
2. GATES — the exact envelope line each suite printed (`ok | N passed (M steps) | F failed`), the compile check's output, the bundle's exit code. If something is red, say which and why. Do not round, do not summarise.
3. DEVIATIONS — every place you departed from the quest's text, each with the reason and the `file:line` that forced it.
4. NOT BUILT — every item of your patch's section you did not build, each with the reason.
5. RISKS — what a walk in a browser must look at, because no test proves it.

Report only what you ran. A claim without a command behind it is worse than a gap named as a gap.
