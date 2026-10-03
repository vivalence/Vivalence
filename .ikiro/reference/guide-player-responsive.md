<!-- writer: agent · kind: persistent · limit: 5000 chars · the pane lines for @assembly/player/guide responsive, from design 9842f920 `Responsive Layouts.dc.html` §1b -->
# guide player — responsive, pane by pane

The commission is `Responsive Layouts.dc.html` §1b (player). `Guide Player.dc.html` is the desktop it starts from. The player is a BUFFER, so it measures its own box, never the window: layout comes from the `.player` clientWidth/clientHeight.

| layout | box | stage | panel |
|---|---|---|---|
| wide | ≥ 1200 | left 412 | float 380 |
| float | 768–1199, landscape | left 352 | float 320 |
| docked | 768–1199, portrait | top, bottom 460 | docked 460: steps 260 · step 1fr |
| phone | < 768 | top 43% | sheet from 43% |

- **header card** (docked · phone): shows the guide name + the done bar + `done / n`, from `guide.name` · `local.done` · `steps.length`. On phone it also carries ☰, which opens the step list full-screen.
- **steps** (docked left · phone ☰ overlay): section labels + rows, from `sectionsOf(guide, steps)`. The active row is compact; the open step's body is NOT in the list.
- **step pane** (docked right · phone sheet): shows the badge + name (18px), then chips · lines · notes · images · tools, from `current` (step 0 = the overview from `guide`). On phone, `section · step k of n` sits above it.
- **foot**: docked = Back · Completed · Next. Phone = Completed (48) over Back · Next (44). Step 0 has no Completed, and Next reads "Start building".
- **stage controls**: every control at every width (the comp's phone cut to cube + ghost was reverted 10-06).
- **swipe** (phone sheet): left = Next, right = Back.

Landed 10-06, beef: /"where interactivity is missing, of course add it."/
- sheet drag between 3 stops: peek 132 · shown 57% · full. The grip drags and snaps to the nearest stop; a tap toggles shown ↔ full. Peek shows one tappable step line + Back/Next.
- tapping a line frames it in 3D and drops the sheet to peek. The stage's bottom follows the sheet down to peek.
- walked in Chrome through the scratch harness (rig doors on :4411 + `bundle.svelte` of the view): wide · float · docked · phone, plus ☰, choose, line → peek, drag → full.

Not landed:
- the comp's palette (`#172E6E` · `#D4A054`, the porcelain theme) — not ordered; the hexes stay as they are

## the editor (§1a), landed 10-06

Same source: the `.editor` box. wide ≥ 1200 `248 · 1fr · 340` (unchanged) · tablet `56 · 1fr · 320` · phone < 768 stacked.
- tablet: `parts/Rail.svelte` (☰ · a dot per section · step badges · +); ☰ slides the full `Steps` over the stage; the stage head reads `Section › NN name`; StepTab folds to an accordion (Parts open first).
- phone: top bar (badge · step name ⌄ · saved dot · ☰ → steps over everything). The inspector is the sheet (peek 120 · 62% · full); focusing a field sends it to full. StepTab sections are pages with ‹ back, and the foot reads `‹ NN · + step · NN ›`.
- `StepTab folding` = null | `{ mode: "accordion" | "pages", open }`; `ctl.fold(key)` sets it.
- GuideTab still scrolls whole (no folding yet).
