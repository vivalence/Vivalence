# m73 — builder brief, patch 4: the stage and the dock

Read `briefs/common.md` (same directory) FIRST and whole. Your sandbox is `w4`:

SANDBOX = /private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/9c4d5944-788f-4d91-9f23-f9164b5bdd9f/scratchpad/m73/tree/w4

## What you build

Quest lines 2392–2460 (`** patch 4 — anima: the stage and the dock`), whole: blast · panel A · the dock's split · tests · gate. Analysis: M/stage.md §`a.svelte`, §`Frame.svelte`, §`Dock.svelte`, §`turns.js`, §`Dictaphone`; corrections: M/pass/patch456.md.

In one paragraph: panel A's frame states become `Empty` states (no thread · settling · resolving buffer · loading view · the mounted view · conversational), a status bar sits under the mounted view, the seam gets a grip; `Dock.svelte` (1852 lines) splits along its own seams into `Dock` · `DockHead` · `Turn` · `LiveTurn` · `Composer`, each carrying its own ≤120 lines of CSS, painted with the kit; the console rail leaves the dock (rail C's harness pane takes it, another builder builds that pane); the logic the quest lists under "keeps" survives.

## Your file set — touch these, nothing else

- `systems/anima/src/app/panels/a/a.svelte`
- `systems/anima/src/app/panels/a/widgets/Dock.svelte` and NEW `DockHead.svelte` · `Turn.svelte` · `LiveTurn.svelte` · `Composer.svelte` beside it
- `systems/anima/src/app/panels/a/widgets/Dictaphone.svelte` (it folds into the composer's mic key; keep its `onpointerdown preventDefault`, its busy state, fault title and level pulse)
- `subsystems/drapes/panels/Frame.svelte` (the standing states read `Empty` + `Spinner`; one hex fallback and one literal radius go — quest line 2435)
- tests: NEW `systems/anima/tests/dock/composer.mount.test.js`; `systems/anima/tests/activity.widgets.test.js` and `systems/anima/tests/activity.mount.test.js` ONLY as far as the dock no longer mounting `ActivityTracker` forces it

## Not yours — do not touch

- `widgets/stop.svelte.js` — the arming machine; `tests/activity.stop.test.js` (four steps) must stay green and UNTOUCHED. The composer's stop key hands it the pointer: `<Key size="row" tone="negative" hold={2000} onpress={control.press} onrelease={control.release} onclick={(event) => event.detail === 0 && control.stop()} label={control.armed === "SIGKILL" ? "killing" : "stop"} title="stop (esc) · hold 2s to kill" />`. Read `stop.svelte.js` and `subsystems/drapes/controls/Key.svelte` to see what `press` and `release` receive before you wire them.
- `widgets/dictate.js`, `widgets/turns.js` existing exports (you may ADD an export if the split needs a pure fold; the shared ones are listed in common.md — use them: `enrich` replaces the component's own `enrichedTurns` loop, `exchanges` · `manifest` · `callRoster` leave the dock with the console rail).
- `src/typology/entities/terminal.js`, `src/app/terminals.js` — `$settling` is already there. `a.svelte` READS `terminal.$settling`.
- `src/app/widgets/Tune.svelte` — already there. The composer opens it in a `Float` (`zone="1"`, `side="above"`).
- `src/app/widgets/ActivityTracker.svelte` — the dock stops importing it (`Status` with `TONES[loudest(activities)]` takes its place); the FILE stays, the integrator deletes it.
- everything under `src/app/bones`, `src/app/panels/{b,c,d,e,f,g,h}`, `src/typology/stores`, `src/client.css`, `src/app/+layout.svelte`, `src/app/+page.svelte`.
- The "chat" toggle that moves from `panels/f/f.svelte:117-128` into panel A's status bar: you ADD it to `a.svelte`; you do not remove it from `f.svelte` (the rail C builder rewrites that file).

## Things the pass already found — do not rediscover them the hard way

- `Frame.svelte` keeps its standing (`resolving · loading · ready`) to itself; nothing outside reads it.
- A terminal's remainder is `{ thread, buffer }` — two ids, no daemon. `settling · thread` when `settling.thread` is set, else `settling · buffer`.
- The dock is PER TERMINAL: `terminal.$dock`, mutators `stores.bridge.setDock*` / `terminal.setDock*`. Every chat-surface gate reads `mode.implements("HARNESSED")`, never CONVERSATIONAL.
- Live's stop terms on the PRESS, not the release. Keep live.
- `send()`'s `!harnessed` guard carries the load once the textarea is never disabled.
- The dock's depth inverts to the comp's: dock = `--surface-lift` + ring, bubbles and tool wells = `--surface-sunk`.
- `a.svelte` declares the body zone; check `tests/zones/places.test.js` for the rows of `panels/a/**` BEFORE you add or move any `data-zone` attribute, and keep its map true.

## Gates

`$T/suites2.sh w4 anima=systems/anima/tests/ drapes=subsystems/drapes/tests/` green; the compile check clean over every `.svelte` you wrote or changed; the bundle exits 0. `grep -rn 'disabled\|readonly' SANDBOX/systems/anima/src/app/panels/a/widgets/Composer.svelte` shows none on the textarea. `grep -rnE '#[0-9a-fA-F]{3,8}\b|color-mix|rgba?\(' ` over your files → nothing.
