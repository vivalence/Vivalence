# shell retire — the dead SvelteKit shell of anima (measured 10-22, opus, on a copy; NOT applied)
<!-- writer: agent · limit: none (reference content) · the list beef applies by hand; a landing never --delete -->

Boundary: the live entry is `systems/anima/src/index.html` → `src/client.js` → `src/surface/**` (vite, `anima/run`). Everything else under `src/` is the SvelteKit app (`+page.svelte`, `app/`, `lib/`, `entities/`, `bak/` excluded). The symptom it fixes: `deno test systems/anima/tests/` aborts at load on `src/entities/terminal/terminals.js:2` `import { logger } from "$telemetry"` (a SvelteKit alias; 7 src files + 10 tests reach it).

## deletions — 149 paths (class: svelte-shell 63 · unreachable 51 · dead-test 31 · dead-config 4); 0 already gone
```
systems/anima/svelte.config.js	dead-config
systems/anima/postcss.config.js	dead-config
systems/anima/tailwind.config.js	dead-config
systems/anima/client.viva.js	dead-config
systems/anima/src/app/+layout.js	svelte-shell
systems/anima/src/app/+layout.svelte	svelte-shell
systems/anima/src/app/+page.svelte	svelte-shell
systems/anima/src/app/bones/Widgets.svelte	svelte-shell
systems/anima/src/app/bones/crown/crown.svelte	svelte-shell
systems/anima/src/app/bones/flow.js	svelte-shell
systems/anima/src/app/bones/pincer/pincer.svelte	svelte-shell
systems/anima/src/app/bones/shoulder/shoulder.svelte	svelte-shell
systems/anima/src/app/bones/spine/spine.svelte	svelte-shell
systems/anima/src/app/bones/widgets/Activity.bak.svelte	svelte-shell
systems/anima/src/app/bones/widgets/ConversationalWidget.bak.svelte	svelte-shell
systems/anima/src/app/bones/widgets/Dock.svelte	svelte-shell
systems/anima/src/app/bones/widgets/Harness.svelte	svelte-shell
systems/anima/src/app/bones/widgets/Phase.svelte	svelte-shell
systems/anima/src/app/bones/widgets/Terminals.svelte	svelte-shell
systems/anima/src/app/design/+page.svelte	svelte-shell
systems/anima/src/app/design/audit.js	svelte-shell
systems/anima/src/app/design/reference.js	svelte-shell
systems/anima/src/app/design/sheet.js	svelte-shell
systems/anima/src/app/focus.js	svelte-shell
systems/anima/src/app/panels/a/widgets/Composer.svelte	svelte-shell
systems/anima/src/app/panels/a/widgets/Dictaphone.svelte	svelte-shell
systems/anima/src/app/panels/a/widgets/DockHead.svelte	svelte-shell
systems/anima/src/app/panels/a/widgets/LiveTurn.svelte	svelte-shell
systems/anima/src/app/panels/a/widgets/Turn.svelte	svelte-shell
systems/anima/src/app/panels/a/widgets/dictate.js	svelte-shell
systems/anima/src/app/panels/b/b.svelte	svelte-shell
systems/anima/src/app/panels/b/widgets/BoxSection.svelte	svelte-shell
systems/anima/src/app/panels/b/widgets/BridgeSection.svelte	svelte-shell
systems/anima/src/app/panels/b/widgets/DockSection.svelte	svelte-shell
systems/anima/src/app/panels/b/widgets/LighthouseSection.svelte	svelte-shell
systems/anima/src/app/panels/c/c.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Buffer.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Buffers.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Card.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Harness.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Link.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Mode.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Modes.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Row.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Terminals.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Thread.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/Threads.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/buffers.js	svelte-shell
systems/anima/src/app/panels/c/cards/threads.js	svelte-shell
systems/anima/src/app/panels/c/cards/traits/Aimed.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/Labeled.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/Masked.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/Queueing.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/form/EntityField.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/form/EntityRow.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/form/EntitySetField.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/form/FormFromSchema.svelte	svelte-shell
systems/anima/src/app/panels/c/cards/traits/form/SymbolFacets.svelte	svelte-shell
systems/anima/src/app/panels/g/g.svelte	svelte-shell
systems/anima/src/app/panels/h/Inspector.svelte	svelte-shell
systems/anima/src/app/panels/h/h.svelte	svelte-shell
systems/anima/src/app/widgets/Boot.svelte	svelte-shell
systems/anima/src/app/widgets/Faculty.svelte	svelte-shell
systems/anima/src/app/widgets/Glyph.svelte	svelte-shell
systems/anima/src/app/widgets/Login.svelte	svelte-shell
systems/anima/src/app/widgets/Tune.svelte	svelte-shell
systems/anima/src/app/widgets/intelligent.js	svelte-shell
systems/anima/src/bridge/dock.js	unreachable
systems/anima/src/bridge/geometry.js	unreachable
systems/anima/src/bridge/gesture.js	unreachable
systems/anima/src/bridge/index.js	unreachable
systems/anima/src/bridge/panes.js	unreachable
systems/anima/src/bridge/prototype.js	unreachable
systems/anima/src/bridge/start.js	unreachable
systems/anima/src/client.css	unreachable
systems/anima/src/entities/buffer.js	unreachable
systems/anima/src/entities/daemon/dossier.js	unreachable
systems/anima/src/entities/daemon/index.js	unreachable
systems/anima/src/entities/daemon/prototype.js	unreachable
systems/anima/src/entities/index.js	unreachable
systems/anima/src/entities/intent.js	unreachable
systems/anima/src/entities/literal.js	unreachable
systems/anima/src/entities/mode/dossier.js	unreachable
systems/anima/src/entities/mode/index.js	unreachable
systems/anima/src/entities/mode/prototype.js	unreachable
systems/anima/src/entities/mode/traits/application.js	unreachable
systems/anima/src/entities/mode/traits/emitter.js	unreachable
systems/anima/src/entities/mode/traits/exposed.js	unreachable
systems/anima/src/entities/mode/traits/harnessed.js	unreachable
systems/anima/src/entities/mode/traits/index.js	unreachable
systems/anima/src/entities/mode/traits/standalone.js	unreachable
systems/anima/src/entities/symbol.js	unreachable
systems/anima/src/entities/terminal/index.js	unreachable
systems/anima/src/entities/terminal/prototype.js	unreachable
systems/anima/src/entities/terminal/terminals.js	unreachable
systems/anima/src/entities/thread/dossier.js	unreachable
systems/anima/src/entities/thread/index.js	unreachable
systems/anima/src/entities/thread/prototype.js	unreachable
systems/anima/src/entities/thread/traits/aimed.js	unreachable
systems/anima/src/entities/thread/traits/index.js	unreachable
systems/anima/src/entities/thread/traits/labeled.js	unreachable
systems/anima/src/entities/thread/traits/masked.js	unreachable
systems/anima/src/entities/thread/traits/queueing.js	unreachable
systems/anima/src/entities/turn.js	unreachable
systems/anima/src/gestalten/belt/chain.js	unreachable
systems/anima/src/gestalten/belt/index.js	unreachable
systems/anima/src/gestalten/belt/narrow.js	unreachable
systems/anima/src/gestalten/belt/runner.js	unreachable
systems/anima/src/gestalten/index.js	unreachable
systems/anima/src/lighthouse.js	unreachable
systems/anima/src/prototypes/conversation.js	unreachable
systems/anima/src/prototypes/dataspace.js	unreachable
systems/anima/src/prototypes/index.js	unreachable
systems/anima/src/prototypes/todo/bell/bell.js	unreachable
systems/anima/src/telemetry/index.js	unreachable
systems/anima/src/telemetry/inspector.js	unreachable
systems/anima/src/telemetry/logger.js	unreachable
systems/anima/src/typology.js	unreachable
systems/anima/tests/belt/narrow.test.js	dead-test
systems/anima/tests/bridge.view.test.js	dead-test
systems/anima/tests/design/audit.test.js	dead-test
systems/anima/tests/dictate.splice.test.js	dead-test
systems/anima/tests/dock/composer.mount.test.js	dead-test
systems/anima/tests/dock/rig.js	dead-test
systems/anima/tests/dock/turns.mount.test.js	dead-test
systems/anima/tests/interactive/activity.test.js	dead-test
systems/anima/tests/interactive/activity/client.js	dead-test
systems/anima/tests/interactive/activity/panel.jsx	dead-test
systems/anima/tests/interactive/activity/sheet.jsx	dead-test
systems/anima/tests/interactive/activity/sheet.state.js	dead-test
systems/anima/tests/interactive/sheet.state.test.js	dead-test
systems/anima/tests/lifecycle-vector.test.js	dead-test
systems/anima/tests/panes/cards.mount.test.js	dead-test
systems/anima/tests/panes/rail.mount.test.js	dead-test
systems/anima/tests/panes/rig.js	dead-test
systems/anima/tests/panes/tree.test.js	dead-test
systems/anima/tests/pincer/bones.axis.test.js	dead-test
systems/anima/tests/pincer/dock.geometry.test.js	dead-test
systems/anima/tests/pincer/gesture.test.js	dead-test
systems/anima/tests/pincer/spine.mount.test.js	dead-test
systems/anima/tests/pincer/start.test.js	dead-test
systems/anima/tests/pincer/theme.test.js	dead-test
systems/anima/tests/pincer/viewport.test.js	dead-test
systems/anima/tests/scenario/buffer.test.js	dead-test
systems/anima/tests/scenario/daemon.test.js	dead-test
systems/anima/tests/terminal.stall.test.js	dead-test
systems/anima/tests/terminals.remote.test.js	dead-test
systems/anima/tests/typology/standalone.test.js	dead-test
systems/anima/tests/typology/trait-runner.test.js	dead-test
```

## keeps — candidates kept, and why
```
systems/anima/src/app/gate.js	m95 KEEP (sign-in gate); framework-free, 0 imports; tests/gate.test.js green
systems/anima/src/app/panels/a/widgets/turns.js	m95 KEEP (pure turn algebra, "app/turns.js (+64 tests)"); 0 imports; tests/dock-turns.test.js + tests/dock/turns.usage.test.js green
systems/anima/src/app/panels/a/widgets/stop.svelte.js	m95 PORT (press SIGTERM, hold SIGKILL); not yet ported (no SIGKILL in ghost/surface or anima/surface); tests/activity.stop.test.js green
systems/anima/src/app/bones/spine/activity.js	m95 PORT (ring -> span bars, elapsed); not yet ported; tests/activity.widgets.test.js (trimmed) green
systems/anima/src/app/panels/c/cards/traits/form/schema.js	m95 PORT (schema -> form, untested); 0 imports
systems/anima/src/app/panels/c/cards/traits/form/picker.js	m95 PORT (schema -> form, untested); 0 imports
systems/anima/src/entities/activity.js	m95 PORT (roster · TONES · settled · owed); ghost/entities/activity.js has loudest · owed only
systems/anima/src/prototypes/entity.js	the one local import of entities/activity.js
systems/anima/src/prototypes/dictation.js	m95 KEEP (mic dictation); tests/dictation.store.test.js green
systems/anima/src/box/**	m95 KEEP (mic · speaker · worklet; the box five owed); speaker.js cited by codestyle as the $-store example. RESIDUE: box/drivers/audio/audio.js:2 still imports the killed $telemetry (logger.entry at :12) — unbuildable until the box is rewired; no test loads it
systems/anima/src/index.html	live entry (vite root); the theme guard reading localStorage "vivalence:bridge" stays (its only writer, bridge/prototype.js:139, was already unreachable); the svelte/solid/carbon importmap stays — registry .svelte views compiled by paladin's bundler (gestalten/belt/bundler.js:35) import svelte bare at runtime
systems/anima/static/**	vite publicDir (vite.config.mjs root/publicDir); favicon + manifest read by index.html; icons/images/videos are URL-addressed, not import-provable dead
systems/anima/Dockerfile	live (deno task anima/build); edited, not deleted: SvelteKit fallback /200.html + _app/env.js writer removed
systems/anima/vite.config.mjs	live door; no svelte entry in it
systems/anima/deno.jsonc	live; dead tasks removed (test/scenario · test/dataspace · test/stall · interactive/activity) and the svelte-kit/tailwind/postcss comment tasks
systems/anima/.gitignore	.svelte-kit line dropped; the rest is generic
systems/anima/.npmrc · README.org · .claude/settings.local.json	not SvelteKit; out of this retirement's scope
systems/anima/bak/**	his bak — never touched
systems/anima/tests/activity.widgets.test.js	trimmed: the WIDGETS compile loop (4 dead .svelte) and the svelte-effect describe removed; the 7 fold tests over kept PORT sources stay
systems/anima/tests/zones/places.test.js	re-homed onto the live surface: PLACES = index.html + surface/panes/*.jsx; the bones/cards assertions (dead subject) removed
systems/anima/tests/{chrome,harness-wire,oracle-dialogue,oracle.snapshot,dictation.store,gate,dock-turns,activity.stop}.test.js · dock/turns.usage.test.js · zones/slots.test.js · world.js	live subject or KEEP subject
import_map.json "linkedom" scope ./systems/anima/	left: redundant with the root entry (same 0.18.5); after the deletions no anima file imports linkedom — a one-line removal for beef
import_map.json svelte · svelte/* · svelte-preprocess · esbuild-svelte · carbon-icons-svelte · prettier-plugin-svelte	live: paladin/typology svelte bundler, drapes' Svelte half, prettier
import_map.json eslint-plugin-svelte · tailwind-merge · tailwind-variants	0 users before AND after this retirement — not its consequence; left for beef
```

## live edits owed with the deletions (not done)
- `systems/anima/deno.jsonc`: drop the dead tasks `test/scenario · test/dataspace · test/stall · interactive/activity` and the svelte-kit/tailwind/postcss comment tasks.
- `systems/anima/Dockerfile`: the SvelteKit fallback `/200.html` + `_app/env.js` writer lines go.
- `systems/anima/.gitignore`: the `.svelte-kit` line goes.
- `systems/anima/tests/activity.widgets.test.js`: the WIDGETS compile loop (4 dead .svelte) + the svelte-effect describe go; the 7 fold tests stay.
- `systems/anima/tests/zones/places.test.js`: re-home onto the live surface (`PLACES` = index.html + `surface/panes/*.jsx`).
- `import_map.json`: the `linkedom` scope for `./systems/anima/` is redundant after; `eslint-plugin-svelte · tailwind-merge · tailwind-variants` have 0 users before and after (not this retirement's).
- RESIDUE that stays: `src/box/drivers/audio/audio.js:2` imports the killed `$telemetry` (the box five are owed, m95); no test loads it.

## the command (beef runs it; VCS is his)
```sh
cut -f1 .ikiro/reference/m95/shell-retire-20261022.paths | xargs rm -f && find systems/anima/src -type d -empty -delete
```
