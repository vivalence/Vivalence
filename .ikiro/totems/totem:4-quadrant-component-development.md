# Totem — 4-Quadrant Component Development

A method for defining and building UI components by writing them out from
four perspectives *before* and *alongside* the code. Each perspective is a
**facet** of the same component. The component is the totem; each facet is
one face carved into it.

## Why

Components have a way of growing without a contract. You start with an idea
("a viket that drags around the screen"), implement enough to see it move,
and then keep patching as new requirements show up. Each patch is a partial
rewrite because there's no shared model to compare changes against.

The totem method is a discipline against that drift. Four short documents
per component, written *first*, kept paired with the code. When a change
request lands, you update the relevant facet, then the code follows. The
facet that doesn't yet have an answer is the one you haven't thought about.

## The Four Facets

Every component is defined from four perspectives. None of them is
optional. None of them lives only in code.

### a · Visible

What the user sees. Wireframe, ASCII, layout sketch, color tokens, states.
Includes:
- Static appearance (idle state, default position)
- All visible states (hover, drag, error, sticky, etc.)
- Edge cases that change shape (collapsed, full, overflowing)
- Color and typography tokens used (no hex, only `var(--colors-...)`)
- Animation/transition behavior

This facet is the contract with design. If something is visible, it lives
here.

### b · DOM / HTML

The structure: divs, classes, semantic elements, ARIA. Three classes of
class:

- **Structural / layout** — `.bone`, `.panel`, `.crown`. Determines where
  things sit. Rarely changes.
- **Variant** — `.panel-a`, `.def-e`, `.viket--square`. Determines which
  flavor of the component this instance is. Set at construction time.
- **Interactive / communicative** — `.dragging`, `.sticky`, `.tap1`,
  `.on`. Reactive state that flips during interaction.

Also includes: which elements are focusable, what `pointer-events` are set
where, what z-index layer the component lives in, and which DOM events the
component owns vs. delegates upward.

### c · Data and State

Where the data comes from and how it flows. Includes:
- **Source state** — what `$state` blobs the component owns
- **Derived state** — what `$derived` falls out of source
- **Props received** — what shapes the parent passes in
- **Effects running** — `$effect`/`onMount` registrations, intervals,
  listeners
- **Entity types** — what JSON shapes are read/written, with their
  schemas if they cross a daemon boundary
- **Persistence** — what survives reload, where it's stored

If the component talks to a daemon repo, name the repo and the methods.
If it derives from URL/route, say so.

### d · Interaction Model

What the user can do, in the language of jobs-to-be-done first, then
mapped down to the DOM events that implement it. Format:

```
JOB                    GESTURE          DOM EVENT          STATE TRANSITION
─────────────────────────────────────────────────────────────────────────
"jump to home"         single tap       pointerup          viket = standard
"swap with previous"   double tap       pointerup×2        viket ↔ previous
"set new home"         triple tap       pointerup×3        standard = viket
"rotate the layout"    long-press       pointerdown+timer  → drag-pick mode
```

Also lists modal states (idle / dragging / longpress / sticky) and the
allowed transitions between them. If you can't draw the state machine on
the back of a napkin, the interaction is too complex — split the
component.

## When to Use

Use totem when the component:
- Has more than one visible state
- Has more than one interaction
- Is going to be edited by more than one person (or you in two weeks)
- Composes other components (parent components especially)
- Lives at a significant layout boundary (anything with a name like
  "modeline", "panel", "bone", "viket")

Skip totem when:
- The component is a one-time atomic primitive (a label, an icon wrapper)
- It's a render-only function with no state
- It's exploratory throwaway code that will be deleted within the hour

## How to Write One

1. Create a `.totem.org` (or `.totem.md`) next to the component file.
   Same name, different extension. `Viket.svelte` →
   `Viket.totem.org`.

2. Write the four facets *in order: a, b, c, d*. Visible first because
   it forces you to think about what it actually is. Interaction last
   because it's the most concrete and falls out naturally once you know
   what it looks like, what its DOM is, and what state it carries.

3. Keep each facet under ~50 lines. If you need more, the component is
   too big — split it into a parent + children, each with their own
   totem.

4. When a change request lands, update the affected facet *first*. Then
   the code. If the change touches all four facets, that's a signal: it's
   a redesign, not a tweak — pause and re-evaluate before coding.

5. The totem and the code are paired commits. PRs without a totem
   update for a totemed component should be flagged.

## Template

```org
#+TITLE: <component name> — totem
#+COMPONENT: <relative path to source file>
#+STATUS: ACTIVE | DRAFT | DEPRECATED
#+DATE: YYYY-MM-DD

* a · Visible

** Static
[ASCII wireframe or description of default appearance]

** States
| state | trigger | visual delta |
|-------+---------+--------------|
| ...   | ...     | ...          |

** Tokens
- background: var(--colors-...)
- border: var(--colors-...)
- font: var(--font-family-...)
- ...

* b · DOM

** Structure
[outline of nested elements]

** Classes
*** Structural
- .x — does y
*** Variant
- .x--foo — variant for ...
*** Interactive
- .x.is-bar — set when ...

** Owned events
- pointerdown / pointermove / pointerup
- ...

* c · Data and State

** Source
- =name= ($state) — purpose
- =name= ($state) — purpose

** Derived
- =name= ($derived from a, b) — purpose

** Props in
| name | shape | purpose |
|------+-------+---------|

** Effects
- onMount: ...
- $effect: ...

** Persistence
- localStorage["..."]: ...

* d · Interaction Model

** Jobs
| job | gesture | dom | transition |
|-----+---------+-----+------------|

** State machine
[ASCII diagram of states + transitions]

** Modal states
- idle
- dragging
- ...

* Open questions
- ...

* Changelog
- YYYY-MM-DD: created
```

## Worked Example — Viket (sketch)

A demonstration of what writing the four facets looks like, using the
viket from the pip prototype as a familiar example. This is a sketch, not
an exhaustive totem.

### a · Visible
- 45×45 square (= bone thickness)
- sk1 surface, theme-primary-boundary 1px border
- contains the vinca-viket pictogram (32×32, white SVG)
- centered on `(viket.x, viket.y)` via `translate(-50%, -50%)`
- sits at z-index 100, above bones (50), above overlays (80), below HUD (200)
- States: idle / hover / dragging / longpress / sticky / tap1 / tap2 / tap3
- Animations: pictogram does a `scaleX(1.2) scaleY(0.1)` blink while dragging

### b · DOM
```html
<div class="viket [.dragging .longpress .sticky .tap1 .tap2 .tap3]"
     style:left style:top style:width style:height>
  <img class="viket-pictogram" src=".../pic-vinca-viket_white.svg" />
</div>
```
- Structural: `.viket`
- Variant: (none — single instance for now)
- Interactive: `.dragging .longpress .sticky .tap1 .tap2 .tap3`
- Events owned: `pointerdown / pointermove / pointerup / pointercancel`
- `touch-action: none` to suppress browser gestures

### c · Data and State
- Source: `viket {x, y}`, `previous {x, y}`, `standard {x, y}`,
  `orientation`, `gesture {pointerId, downAt, downX, downY, startViketX,
  startViketY, tapCount, tapTimer, longPressTimer, isDragging,
  isLongPress, fromSticky}`, `radial {show, sticky, snap}`, `flash`
- Derived: `rects`, `bones` (panel + bone rectangles, derived from
  orientation + viket + viewport)
- Effects: `onMount` initializes viewport, registers `resize` listener
- No persistence yet

### d · Interaction Model
```
job                  gesture       dom event           transition
─────────────────────────────────────────────────────────────────
move T-junction      drag          pointerdown→move    viket.x/y updated, snap to grid
jump to $HOME        1 tap         pointerup           previous=viket; viket=standard
swap with previous   2 taps        pointerup×2         viket ↔ previous
set $HOME            3+ taps       pointerup×3         standard = viket
rotate stem          hold + drag   pointerdown+timer   → drag-pick → release commits
open sticky picker   hold + still  pointerdown+timer   → release-near-center → sticky
```

States:
```
idle ──hold──→ longpress ──release-far──→ idle (commit)
                  │
                  └──release-near──→ sticky ──tap-spoke──→ idle (commit)
                                       │  ──tap-outside──→ idle (cancel)
                                       │  ──hold-viket──→ longpress
                                       └──drag-viket──→ idle (sticky cancelled, drag wins)
```

## Anti-patterns

- **Writing the totem after the code is done** — defeats the point. The
  totem is for thinking, not for documentation.
- **Letting the four facets get out of sync** — if the totem says
  `viket.x ∈ [0, vw]` but the code clamps to `[28, vw-28]`, one of them
  is wrong. Resolve before continuing.
- **Stuffing four totems into one** — if you have a parent with three
  children, each child gets its own totem. The parent's totem talks
  about composition, not the children's internals.
- **Skipping facet (a) because "it's just CSS"** — the visible facet is
  the contract with the user. CSS is its implementation, not its
  definition.
- **Skipping facet (d) because "it's obvious"** — interaction is never
  obvious. The state machine matters precisely *because* you can't
  hold all of it in your head.

## Origin

This method was named on 2026-04-07 during the pip layout prototype. The
metaphor is a totem pole — a single carved object with multiple faces,
each telling part of the same story. Earlier candidate names: facet
(too small), quadrant (too geometric), profile (too generic). Totem
won because it preserves the "one object, four faces" intuition while
implying weight, intentionality, and the sense that the carving is the
real work.

Sister method candidate (not yet named): the same four facets applied to
*buffers* rather than components — buffers are the runtime products of
modes, and they have visible/dom/data/interaction faces too. TBD.

## Reflections

### Selective faceting (2026-04-10, pincer state isolation)

The totem was designed for component development — all four facets, in
order, before code. But during the pincer state primitive work, only
facets c and d were useful. The task was "enumerate what state entities
exist and which deserve their own store." Facets a (visible) and b (DOM)
had nothing to contribute — we weren't designing components, we were
carving the statespace those components would consume.

**Learning: the totem is a lens, not a checklist.** The four facets are
four ways of looking at a thing. When the thing is a UI component, all
four matter. When the thing is a state primitive, c and d carry the
weight — c identifies what exists and who owns it, d separates transient
process state (gesture, flash) from durable identity-bearing state
(layout, view, session). The classification falls out of asking "does
this serialize?" (facet c, persistence) and "is this a noun or a verb?"
(facet d, interaction model).

**Implication: totem applies beyond components.** Any entity with
multiple perspectives benefits from selective faceting. State primitives,
transport protocols, daemon traits — each has a subset of facets that
illuminate it. The discipline is knowing which facets to apply, not
applying all four by rote.
