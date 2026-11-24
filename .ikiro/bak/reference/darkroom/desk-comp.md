<!-- limit: 12000 chars · his comp 2026-11-08 `~/Downloads/darkroom · the desk.html` (2 299 953 chars, a dc bundle of 8 nested boards) decoded mechanically into `desk-comp/` (dom.html · sheet.css · kit.css · vars.css · scene.js · tty.js) · the SPEC for milestone 6 · quest: .ikiro/quests/m118-darkroom.org -->
# the desk — his comp, read

Eight boards, one scene. Every CSS variable the comp reads is dapper's (`subsystems/dapper/lib/emit.js` emits all 25); the four `data-theme` values are dapper's `THEMES`. Its stylesheet says "vivalence kit. Part 1: dapper, emitted … Part 2: the kit" — Part 2 is the designer's kit: `.kit-row` · `.kit-field` exist in `subsystems/drapes/dom/{Row,Field}.jsx` (anima-side Solid, a registry mode cannot import them), `.kit-choice` · `.kit-label` · `.kit-dot` · `.kit-tty` exist nowhere in the tree → `desk-comp/kit.css` holds the rules the view carries itself.

| board | theme | size | face |
|---|---|---|---|
| 0 | northsea | 1100×720 | dom |
| 1 | parchment | 1100×720 | dom |
| 2 | porcelain | 1100×720 | dom |
| 3 | datasette | 1100×720 | dom |
| 4 | northsea | 1000×560 | tty |
| 5 | parchment | 1000×560 | tty |
| 6 | porcelain | 1000×560 | tty |
| 7 | datasette | 1000×560 | tty |

## the panes — shows what, from where

- **side · next** — `on <shown id>` | `fresh`, one latched → `buffer.data.next` (iterate = the next picture is an edit ON the shown one; fresh = a generation).
- **side · model** — three rows `key · name · vendor · ?`: the model name strong and never cut, the vendor muted in the `1fr` column, cut first (title: id · openrouter · references · mask · aspects; no cost, none is known), one current → the openrouter `painters` (`commons/hallucinators/openrouter/provider/index.js:63`) → `buffer.data.model`.
- **side · aspect** — `1:1 · 3:2 · 2:3 · 16:9`, one latched; a chip the current model lacks is `.is-off` (disabled ink, not clickable); picking a model that lacks the latched aspect latches its first, `1:1` → `buffer.data.aspect`.
- **side · count** — `1 · 2 · 4`, one latched → `buffer.data.count`.
- **side · references** — rows `thumb · name · × · style|subject|structure`; the thumb is the image, `object-fit: cover`, and clicking it shows the reference on the frame → `buffer.data.references[{file, role}]`, the File row's `url`.
- **side · + drop** — dashed; a dropped FILE lands as a reference (role style); a dropped STRIP PICTURE (`dataTransfer text/picture`) binds that File → a raw-body route (media's `/media/ingest` shape) · `/picture/reference`.
- **frame** — `buffer.data.shown` (a picture OR a reference) full-frame, `object-fit: contain` on the sunk box; states `over` (drop · a reference) · `busy` (a breathing dot + the prompt in flight) · empty (`no picture yet · say one`) · `fault` → the thread's RUNNING activity, the File's `url`.
- **frame · fault** — a bar pinned to the frame's bottom edge: `kit-dot is-fault` + the provider's message verbatim (`[openrouter] <id> takes at most N references, M given`), negative ink on negative tint over sunk, a negative hairline on top, wrapping. It sits over the shown picture; the draft comes back to the field; the next send clears it. `over` covers it.
- **status** — a right-aligned `?`, title `id · with · prompt` → the picture's row in `buffer.data.pictures[]` (Q16, 11-09).
- **strip** — image thumbs (`cover`) oldest→newest, a gap before each root (`parent === null`), the shown one ringed, title `id · on <parent> · prompt`, draggable → `buffer.data.pictures[]` resolved to `buffer.files` (Q16, 11-09).
- **field** — `›` + an auto-growing textarea `say it`, Enter sends → the thread (today the dock's composer dispatches the same repl signal, `anima/src/surfaces/chrome/panels/dock/composer.jsx:59`).

## the scene — `desk-comp/scene.js`

Two references (`wash-sample.jpg` style · `fox-photo.png` subject); five pictures: two roots (`a1c0` · `7d55`), `2e8f` on `7d55`, twins `3f9a` · `8c01` on `2e8f` (a count-2 batch); shown `3f9a`; next iterate; model `openai/gpt-image-2`; aspect 3:2 (16:9 off); count 1; fault none. Three models, all openrouter, no mask, no cost: `openai/gpt-image-2` (16 references · 1:1 3:2 2:3) · `black-forest-labs/flux.2-pro` (8 · 1:1 3:2 2:3 4:3 3:4 16:9 9:16) · `google/gemini-2.5-flash-image` (3 · 1:1 2:3 3:2 3:4 4:3 4:5 5:4 9:16 16:9 21:9). Every picture and reference carries `src`, a gray SVG from `art(seed)` (keywords only, no hex).

`say()`: parent = `next === "iterate"` and the shown one is a PICTURE (a reference is never a parent), else null; parent + references over the model's limit → `fault`, the draft restored; `with` = `on <parent> · <ref> as <role>… · <model> · <aspect>`; `count` pictures land, the first is shown. `drop`: a `text/picture` id → a style reference; files → `image/*` only, deduped by name. A reference on the frame reads `a reference · <role>`. Removing the shown reference shows the newest picture.

## the tty board — `desk-comp/tty.js`

26 rows: next · model (keys `1–3`, name then muted vendor, the current one inverse) · aspect (an off chip in boundary ink) · count · refs (`▣ name [role]` · `+`) · a 96×13 framed sunk box (the frame, nothing drawn) · the strip as sunk chips with the shown one inverse · `› <draft>` with a block caret. Spans: `m` muted · `inv` inverse · `P` primary bold · `sk` sunk · `bd` boundary.

## kit — what the comp now carries

`kit.css` lost its designer comments and the `.kit *, .kit-tty * {animation: none}` freeze row; it carries `@keyframes kit-breathe` (`is-running` 1.2s, `is-needs` 2s) and `.kit-choice > button.is-off`. `sheet.css` carries `.pic > img`, `.pic::after` (the ring and sunk shadow repainted above the image), `.fault`, `.kit-row .vendor`, and `.side` scrolling. `vars.css` is a stale snapshot: no `--size-type-*`, no `--shape-label-*`, which dapper emits today; render the comp against `emit("northsea", …)`.

## deltas against the quest's sketch (before this comp)

| was | comp |
|---|---|
| roles `style · subject · scene · init` | `style · subject · structure`; `init` = `next: on <id>` |
| `quality: draft \| final` on the tool | `model` on the desk, the operator's |
| `count` on the tool | `count` on the desk |
| no size | `aspect` on the desk |
| `batch` grid + `compare` slider in a rail | none — the strip IS the tree; twins sit side by side |
| region drag → mask | none drawn |
| ▸ vary · ▸ upscale buttons | none |
| a tty face deferred | drawn, four themes |
