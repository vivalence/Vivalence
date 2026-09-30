# design — the reference

<!-- writer: agent · reference, unbudgeted · written 2026-09-28 from quests/done/m72-zoned-designs.org · describes the design system as it stands after m72; the tree today still runs the skeleton vocabulary, its traps live in world/codemap/design.md · the census of today's tree is kept in ~/.viva/bak/ikiro/reference-design-20260928/design.md · open points are listed in §11, the sheet carries the quest's first option for each -->

The design system is one contract and the things around it.

- The **token space** is the contract: 94 keys in seven groups, and four zones of 12 ground keys each. `brand` (outline · glow · filter) is identity, never state: the pincer's ring, its inset glow, its mark's filter; `outline` defaults to `signal.primary`.
- A **theme** is a definition that `theme()` completes into the whole token space.
- A **zone** is a territory of the interface. Depth lives inside it.
- A **view** reads tokens by name inside a zone. It never names a colour, a zone number or a theme.

Three packages carry it. **dapper** completes themes and emits the sheet at build time. **drapes** is the Svelte component kit and reads the sheet. **sheets** is the terminal kit and shares nothing with either.

This file is written for whoever designs against the system: what exists, what each key means, where each place of anima sits, and how a design made in another model maps onto this one (§10).

## 1 · the pipe

```
definition                   what a theme declares — any subset of the tree, in any of its forms
  theme(definition)
    fill                     a key the definition omits takes its schematic default
    derive                   a colour the definition omits takes its rule
    merge                    each zone = its ground + the seven groups + its own overrides
  Theme                      static: 94 root keys, four zones of 106
    emit(name, Theme)        :root[data-theme] = zone 1 whole · four [data-zone] blocks
```

The definition is flexible. The Theme is static. Whatever a theme writes, what comes out has the same shape.

## 2 · zones

A zone is a territory with its own complete token set. It is a container: `data-zone="N"` is set once, on the territory's outermost box, and everything inside reads names.

| zone | name | what it is |
|---|---|---|
| 0 | chrome | the application's own interface |
| 1 | body | content: what a thread, a buffer, a mode shows; the default |
| 2 | island | a thing that stands alone, outside the body |
| 3 | bench | instruments that look at the application |

The number is what the markup carries. The name is documentation and is never emitted.

**Depth lives inside a zone.** Every zone has three steps and its controls:

```
surface           the zone's ground
surface-sunk      a well cut into it
surface-lift      a block lifted on it
control.*         what is touched on it
```

**Zones nest in any order.** The bench holds a strip that is chrome: a `data-zone="0"` box inside a `data-zone="3"` box. There is no ladder between zones and no elevation scale.

**A place takes its zone by what it is**, never by how dark it should look. A theme paints around that: two zones may look alike in one theme and opposite in another.

### where anima's places sit

| place | zone | steps |
|---|---|---|
| shoulder · crown · spine | 0 | surface · control |
| pincer | 0 | surface · lift · control |
| rail B (config · auth · box · dock) | 0 | surface · lift · control |
| rail C (terminals · navigation) · panes D E G | 0 | surface · lift · control |
| pane strips · tab rows | 0 | sunk · control |
| panel A, the stage | 1 | surface |
| dock · composer | 1 | sunk · lift · control |
| chat turns · tool rows · pane F | 1 | sunk · lift |
| buffers · mode applications | 1 | all |
| a mode that declares itself an island | 2 | all |
| inspector (panel H) · logger · debug | 3 | all |
| a strip inside the bench | 0 inside 3 | surface · control |
| menus · popovers · toasts | the zone that opened them | lift + `shape.lift` |

A latched key, a selected row and an open form are `control.contrast-pressed` inside whichever zone holds them.

## 3 · the token space

Parentheses mark a group a zone may override, per key. Example values are northsea's.

```
theme                                  scalar   example (northsea)               description
├── (shape)                                                                      defaults, zone may override
│   ├── relief                         enum     lift                             sunk | lift mode
│   ├── radius.2xs                     px       1px                              sharpest corner
│   ├── radius.xs                      px       2px                              tight corner
│   ├── radius.sm                      px       3px                              small corner
│   ├── radius.md                      px       4px                              plain corner
│   ├── radius.lg                      px       6px                              soft corner
│   ├── radius.xl                      px       8px                              round corner
│   ├── radius.2xl                     px       12px                             large corner
│   ├── radius.3xl                     px       16px                             largest corner
│   ├── radius.full                    px|%     999px                            fully round
│   ├── radius.key                     step     radius.2xs (1px)                 keys, chips
│   ├── radius.field                   step     radius.2xs (1px)                 input wells
│   ├── radius.card                    step     radius.xs (2px)                  cards, panes
│   ├── radius.pill                    step     radius.2xs (1px)                 pills, tags
│   ├── radius.disc                    step     radius.2xs (1px)                 avatars, pips
│   ├── label.case                     enum     uppercase                        label transform
│   ├── label.track                    em       .14em                            label letter-spacing
│   ├── lift                           shadow   0 12px 30px                      floating shadow, geometry
│   └── sunk                           shadow   inset 0 2px 3px                  pressed shadow, geometry
├── (size)                                                                       defaults, zone may override
│   ├── unit                           rem      .25rem (4px)                     base length
│   ├── space.2xs                      ×unit    1 (4px)                          hair gap
│   ├── space.xs                       ×unit    2 (8px)                          tight gap
│   ├── space.sm                       ×unit    3 (12px)                         default gap
│   ├── space.md                       ×unit    4 (16px)                         section gap
│   ├── space.lg                       ×unit    6 (24px)                         block gap
│   ├── space.xl                       ×unit    8 (32px)                         pane gap
│   ├── space.2xl                      ×unit    12 (48px)                        region gap
│   ├── space.3xl                      ×unit    16 (64px)                        page gap
│   ├── type.2xs                       rem      .6875rem (11px)                  labels, meta
│   ├── type.xs                        rem      .75rem (12px)                    secondary values
│   ├── type.sm                        rem      .875rem (14px)                   dense body
│   ├── type.md                        rem      1rem (16px)                      body
│   ├── type.lg                        rem      1.125rem (18px)                  lead text
│   ├── type.xl                        rem      1.25rem (20px)                   small heading
│   ├── type.2xl                       rem      1.5rem (24px)                    heading
│   ├── type.3xl                       rem      1.75rem (28px)                   display
│   ├── gap                            step     space.xs (8px)                   gap between siblings
│   ├── pad.box                        step     space.sm (12px)                  box padding
│   ├── pad.x                          step     space.sm (12px)                  control inline padding
│   ├── pad.y                          step     space.2xs (4px)                  control block padding
│   ├── icon                           step     space.md (16px)                  glyph box
│   ├── field                          step     space.xl (32px)                  input height
│   ├── row                            ×unit    6.5 (26px)                       list row height
│   ├── key                            ×unit    7 (28px)                         key, chip height
│   ├── leading.tight                  number   1.1                              headings, labels
│   ├── leading.loose                  number   1.45                             prose
│   ├── ring                           px       1px                              hairline, never scaled
│   └── depth                          px       2px                              key drop, never scaled
├── (text)                                                                       defaults, zone may override
│   ├── header                         color    #F4F6F9                          headings
│   ├── strong                         color    #E6EAEF                          values, active rows
│   ├── ink                            color    #B4BFCB                          prose, the plain ink
│   ├── light                          color    #8FA0B1                          secondary values
│   ├── muted                          color    #6B7E91                          labels, meta
│   ├── link                           color    #51D8D0                          inline links
│   ├── code                           color    #E7C271                          inline code
│   └── disabled                       number   .45                              disabled opacity
├── (control)                                                                    defaults, zone may override
│   ├── contrast                       color    #384A5E                          key, chip fill
│   ├── contrast-hover                 color    #4F6175                          hovered key fill
│   ├── contrast-pressed               color    #243544                          pressed key fill
│   ├── on                             color    #E6EAEF                          label on a key
│   ├── on-muted                       color    #8FA0B1                          secondary label on it
│   ├── on-pressed                     color    #51D8D0                          label on a pressed key
│   ├── field                          color    #060D14                          input well
│   ├── field-placeholder              color    #6B7E91                          placeholder ink
│   ├── field-caret                    color    #1EBCB5                          caret
│   ├── selected                       color    rgba(30,188,181,.18)             selection, hover wash
│   ├── focus                          color    #51D8D0                          focus ring
│   ├── scrollbar                      color    #384A5E                          scrollbar thumb
│   └── divider                        color    #243544                          rule inside a control
├── (signal)  × primary · positive · caution · negative                          defaults, zone may override
│   ├── fill                           color    #1EBCB5                          pip, key, bar
│   ├── ink                            color    #51D8D0                          signal-coloured text
│   ├── tint                           color    rgba(30,188,181,.18)             washed background
│   └── on                             color    #060D14                          text on the fill
└── zone[0..3]                         0 chrome · 1 body · 2 island · 3 bench    (example: zone 3)
    ├── surface                        color    #1A2A38                          zone ground
    ├── surface-sunk                   color    #0E1A25                          well cut into this zone
    ├── surface-lift                   color    #243544                          block lifted on this zone
    ├── boundary                       color    #384A5E                          hairline
    ├── boundary-strong                color    #6B7E91                          selected ring
    ├── boundary-soft                  color    rgba(56,74,94,.5)                faint inner rule
    ├── divider                        color    #243544                          rule as a fill: tracks, gaps
    ├── inverse                        color    #E6EAEF                          fill of an inverted block
    ├── inverse-on                     color    #1A2A38                          ink on that block
    ├── shadow                         color    rgba(0,0,0,.45)                  tone of every shadow here
    ├── scrim                          color    rgba(14,26,37,.6)                dim over this zone
    ├── dim                            number   .55                              the one opacity for "less"
    └── (shape) (size) (text) (control) (signal)                                 overrides per key
```

| count | n |
|---|---|
| root keys | 85 (shape 19 · size 29 · text 8 · control 13 · signal 16) |
| ground keys per zone | 12 |
| zones | 4 |
| declarations in one zone block | 97 |

### the words

A key is one role plus modifiers. Eight axes carry every word in the tree.

| axis | words | says |
|---|---|---|
| role | surface · fill · ink · on · tint · boundary · shadow | what a colour is for |
| depth | sunk · lift | where a block sits against its ground |
| state | hover · pressed · focus · disabled | what is happening to it |
| emphasis | strong · light · muted | how loud it is; the plain step is the bare role |
| entity | key · field · card · pill · disc · row · icon · label | which thing |
| signal | primary · positive · caution · negative | which meaning |
| step | 2xs … 3xl | which size |
| zone | 0 … 3 | which territory |

| role | means |
|---|---|
| `surface` | ground of a territory |
| `fill` | solid colour of a thing on the ground |
| `ink` | glyph colour on the ground |
| `on` | glyph colour on a fill |
| `tint` | a fill washed to a background |
| `boundary` | a line around or between |
| `shadow` | the tone of darkness cast or laid over |

| key | made of |
|---|---|
| `surface-sunk` | role surface + depth sunk |
| `boundary-strong` | role boundary + emphasis strong |
| `control.contrast-pressed` | role fill + state pressed |
| `control.on-pressed` | role on + state pressed |
| `signal.negative.tint` | role tint + signal negative |
| `text.ink` · `text.strong` | role ink, plain · role ink + emphasis strong |
| `shape.radius.key` | entity key, naming a step |
| `size.space.sm` | step sm |

`ink` sits on the ground, `on` sits on a fill: `text.ink` and `signal.*.ink` are read on a surface, `control.on` · `signal.*.on` · `inverse-on` on the fill they belong to. An entity repeats across groups on purpose: `key` and `field` appear in `shape.radius`, in `size` and in `control`.

### what each group is for

- **shape** is the theme's form: how round, how sunk or lifted, how labels are cased and tracked. Radius is a scale of eight steps and `full`; an entity names the step it takes. One relief mode per theme.
- **size** is every length. A length is `unit` × a step, so a zone that sets its own `unit` rescales the whole box. `ring` and `depth` are px so hairlines stay crisp. Space, type and radius share eight step names; a role such as `gap` or `pad.box` names a space step.
- **text** is ink for reading: five steps of emphasis with `ink` the plain one, plus link and code.
- **control** is what is touched: the fill of a key at rest, hovered and pressed, the label that sits on it, the input well, focus and selection.
- **signal** is meaning: four signals, each with a fill, an ink for text in that colour, a tint for a washed ground, and the ink that sits on the fill.
- **ground** is the zone itself: three surfaces, three boundaries, a divider, an inverted block, the shadow tone, scrim and dim. Icons read text ink: `text.light`, `text.strong` when active.

Three things never trade places: `surface` is the ground, `contrast` is the fill of a thing on it, text is text.

## 4 · scalars

| scalar | wire | witness | keys |
|---|---|---|---|
| Color | string | `"#1A2A38"` · `"rgba(30, 188, 181, 0.18)"` | 47 |
| Px | string | `"1px"` | 11 |
| Factor | number | `3` · `6.5` | 10 |
| Rem | string | `".25rem"` | 9 |
| Step | enum | `"sm"` | 6 |
| Round | enum | `"xs"` · `"full"` | 5 |
| Ratio | number | `0.55` | 2 |
| Leading | number | `1.45` | 2 |
| Shadow | string, geometry only | `"0 12px 30px"` | 2 |
| Em | string | `".14em"` | 1 |
| Relief | enum | `"lift"` | 1 |
| Case | enum | `"uppercase"` | 1 |

Steps: `2xs · xs · sm · md · lg · xl · 2xl · 3xl`. Signals: `primary · positive · caution · negative`. Zones: `0 · 1 · 2 · 3`.

The schematics live in `subsystems/typology/schematics/primitives/theme.js`: the scalars, one schematic per group, `Zone`, `Definition` and `Theme`.

## 5 · the sheet

```css
/* emitted by subsystems/dapper/lib/emit.js */
:root[data-theme="northsea"] {
  --surface: #06101D;  --surface-sunk: #030812;  --surface-lift: #0A1628;  /* … the 12 ground keys of zone 1 */
  --shape-relief: lift;  --shape-radius-xs: 2px;  --shape-radius-card: var(--shape-radius-xs);  --shape-lift: 0 12px 30px rgba(0, 0, 0, 0.45);
  --size-unit: .25rem;  --size-space-sm: calc(var(--size-unit) * 3);  --size-pad-box: var(--size-space-sm);  --size-type-sm: .875rem;  --size-ring: 1px;
  --text-strong: #E6EAEF;  --text-ink: #B4BFCB;
  --control-contrast: #384A5E;  --control-contrast-pressed: #243544;  --control-on: #E6EAEF;  --control-on-pressed: #51D8D0;  --control-focus: #51D8D0;
  --signal-primary: #1EBCB5;  --signal-primary-ink: #51D8D0;  --signal-primary-tint: rgba(30, 188, 181, 0.18);  --signal-primary-on: #060D14;
}

:root[data-theme="northsea"] [data-zone="3"] {
  --surface: #1A2A38;  --surface-sunk: #0E1A25;  --surface-lift: #243544;
  --boundary: #384A5E;  --boundary-strong: #6B7E91;  --boundary-soft: rgba(56, 74, 94, 0.5);
  --divider: #243544;  --inverse: #E6EAEF;  --inverse-on: #1A2A38;
  --shadow: rgba(0, 0, 0, 0.45);  --scrim: rgba(14, 26, 37, 0.6);  --dim: .55;
  /* + the 85 group keys, merged for this zone */
}
```

| tree key | emitted name |
|---|---|
| `shape.radius.xs` | `--shape-radius-xs` |
| `shape.radius.card` | `--shape-radius-card` |
| `size.space.sm` | `--size-space-sm` |
| `size.pad.x` | `--size-pad-x` |
| `text.ink` | `--text-ink` |
| `control.contrast-pressed` | `--control-contrast-pressed` |
| `control.on-pressed` | `--control-on-pressed` |
| `signal.negative.fill` | `--signal-negative` |
| `signal.negative.ink` | `--signal-negative-ink` |
| zone `surface-sunk` | `--surface-sunk` |
| zone `inverse-on` | `--inverse-on` |

- Group keys carry their group as a prefix. Ground keys are bare. A signal's fill carries no suffix.
- The theme root is zone 1 whole, so a read outside any zone resolves as body.
- Every zone block re-declares all 97, merged. That is what makes a zone's own `unit` rescale its lengths.
- A shadow is emitted resolved: `shape.lift` and `shape.sunk` give the geometry, the zone's `shadow` the tone.
- The sheet holds slots and nothing else: no colour name, no gradient.
- Tailwind maps the same slots: `bg-surface` · `text-ink` · `border-boundary` · `bg-signal-primary`.

## 6 · how a view reads

```svelte
<!-- systems/anima/src/app/panels/c/widgets/Pane.svelte -->
<div class="pane" style="background: var(--surface); box-shadow: 0 0 0 var(--size-ring) var(--boundary)">
  <header style="color: var(--signal-primary-ink)">…</header>
  <div class="body" style="background: var(--surface-lift); color: var(--text-light); padding: var(--size-pad-box)">…</div>
</div>
```

The pane names no zone. Rail C carries `data-zone="0"` once; the pane reads the ground and its body the lift step. One box inside the rail is body: the thread pane's chat-facing half declares `data-zone="1"` in `systems/anima/src/app/panels/c/c.svelte`, around panel F alone.

- A hex in a view is a defect. A zone number in a view is the same defect.
- A view picks a depth step by the role a box plays: ground, well or block.
- "Less" is `--dim`, the zone's one opacity. Disabled is `--text-disabled`.
- An inverted block reads `--inverse` for its fill and `--inverse-on` for its ink.
- A floating thing is `--surface-lift` with `--shape-lift`, over `--scrim`.
- A pressed thing is `--control-contrast-pressed` with `--shape-sunk`, dropped by `--size-depth`.
- A label on a key reads `--control-on`, and `--control-on-pressed` once latched. Text on the ground reads `--text-ink`.
- A corner reads its entity, `--shape-radius-card`; a thing that is none of the five reads a step, `--shape-radius-sm`.

## 7 · a theme's definition

A definition may state any subset of the tree. `theme()` completes the rest.

| form | example | means |
|---|---|---|
| omitted key | no `text.header` | derived |
| omitted group key | no `shape.lift` | schematic default |
| omitted zone | no zone 2 | the nearest defined zone, the lower on a tie |
| one value for a set | `radius: "3px"` | every step of the radius scale |
| a colour for a signal | `primary: "#045554"` | its `fill` |
| a colour for a zone | `3: "#FBFAF2"` | its `surface` |
| a group key inside a zone | `0: { size: { unit } }` | that zone only |
| several layers | `theme(a, b, c)` | merged left to right |

### from its gradients

```js
// subsystems/dapper/themes/northsea/theme.js
import { theme } from "../../lib/theme.js";
import { iron, deep, aqua, moss, amber, rust } from "./gradients.js";

export default theme({
  shape:   { relief: "lift", radius: { key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs" } },
  text:    { header: iron[50], strong: iron[100], ink: iron[300], light: iron[400], muted: iron[500], link: aqua[200], code: amber[200] },
  control: { contrast: iron[700], contrastHover: iron[600], contrastPressed: iron[800], on: iron[100], onMuted: iron[400], onPressed: aqua[200],
             field: iron[950], fieldPlaceholder: iron[500], fieldCaret: aqua[300], focus: aqua[200], scrollbar: iron[700], divider: iron[800] },
  signal:  { primary:  { fill: aqua[300],  ink: aqua[200],  on: iron[950] },
             positive: { fill: moss[300],  ink: moss[200],  on: iron[950] },
             caution:  { fill: amber[300], ink: amber[200], on: iron[950] },
             negative: { fill: rust[300],  ink: rust[200],  on: iron[950] } },
  zones: {
    0: { surface: iron[900], surfaceSunk: iron[950], surfaceLift: iron[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    1: { surface: deep[900], surfaceSunk: deep[950], surfaceLift: deep[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    2: { surface: iron[950], surfaceSunk: deep[950], surfaceLift: iron[900], boundary: iron[850], boundaryStrong: iron[700], divider: iron[900], inverse: iron[200], dim: .5 },
    3: { surface: iron[850], surfaceSunk: iron[900], surfaceLift: iron[800], boundary: iron[700], boundaryStrong: iron[500], divider: iron[800],
         signal: { negative: { ink: rust[100] } } },
  },
});
```

A gradient is twelve stops of one colour, `50` to `950`, kept in the theme's own `gradients.js`: owned by one theme, shared with none, never emitted. The definition names its steps; everything it leaves out, every `tint`, `inverse`, `scrim` and `shadow` here, `theme()` derives.

### by hand, sparse

```js
// a theme file written in hexes, no gradients
export default theme({
  shape:   { relief: "sunk", radius: "3px" },
  size:    { unit: ".3rem", type: { md: "1.0625rem" } },
  text:    { strong: "#0B0F2D", ink: "#3D372A", muted: "#5A5240" },
  control: { contrast: "#DAD4C0", field: "#FBFAF2" },
  signal:  { primary: "#045554", positive: "#41732A", caution: "#AC575C",
             negative: { fill: "#C74E31", ink: "#A23920" } },
  zones:   { 0: { surface: "#F5F3E8", size: { unit: ".2rem" } },
             1: { surface: "#F0EDDE", boundary: "#A0967C" },
             3: "#FBFAF2" },
});
```

Nineteen values in, a whole Theme out. A sparse theme is cheap, not good: what it omits comes out flat, and the contrast test still gates it.

### what theme() derives

| key | omitted, it takes |
|---|---|
| `text.header` · `strong` · `ink` · `light` · `muted` | the nearest stated text step, stronger side first |
| `text.link` · `code` | `signal.primary.ink` · `signal.caution.ink` |
| `signal.*.ink` | its `fill` |
| `signal.*.tint` | its `fill` at .18 |
| `signal.*.on` | `text.header` or zone 3's `surface`, whichever contrasts more with the `fill` |
| `control.contrast-hover` · `contrast-pressed` · `scrollbar` | `control.contrast` |
| `control.divider` | `control.contrast-pressed` |
| `control.on` · `on-muted` · `on-pressed` | `text.strong` · `text.light` · `signal.primary.ink` |
| `control.field-placeholder` · `field-caret` · `focus` · `selected` | `text.muted` · `primary.fill` · `primary.ink` · `primary.tint` |
| zone `surface` · `boundary` | the nearest defined zone's |
| zone `surface-sunk` · `surface-lift` · `inverse-on` | its `surface` |
| zone `boundary-strong` · `divider` | its `boundary` |
| zone `boundary-soft` · `scrim` | `boundary` at .5 · `surface-sunk` at .6 |
| zone `inverse` | `text.strong` |
| zone `shadow` · `dim` · `text.disabled` | `rgba(0, 0, 0, 0.45)` · .55 · .45 |
| `size.*` · `shape.*` | the schematic default, the tree's values |

Below one zone `surface`, `text.ink` and `signal.primary`'s fill there is nothing to derive from, and `theme()` throws.

## 8 · themes

| theme | written in |
|---|---|
| northsea | its gradients: iron · deep · aqua · moss · amber · rust |
| parchment | its gradients: paper · ink · aqua · moss · rose · tomato |
| porcelain | the designer's hexes |
| datasette | the designer's hexes |

The theme is switched by `<html data-theme>`. A saved theme name outside the list resolves to the default, northsea.

What a theme must hold to pass:

| pair | floor |
|---|---|
| `text.header` · `strong` · `ink` · `light` on every zone's `surface` · `surface-sunk` · `surface-lift` | 4.5:1 |
| `text.muted` on the same | 3:1 |
| `signal.*.ink` on the same | 4.5:1 |
| `signal.*.on` on its `fill` | 4.5:1 |
| `control.on` on `control.contrast` · `control.on-pressed` on `control.contrast-pressed` | 4.5:1 |

## 9 · the size system

- The root font size is the user's one dial. It moves every rem, so `unit` and every type step follow it.
- A zone that overrides `unit` rescales its spacing and heights and leaves its type alone. Dense chrome, roomy body.
- A component takes one step name for every scale: a `sm` key reads `type.sm`, `space.sm` and, where it is no entity, `radius.sm`.
- Off the scale by intent: `row` 6.5 and `key` 7.

## 10 · mapping a design made in another model

The designer's project (`claude.ai/design` `c9ff72fb`, `6 Anima.dc.html`) runs six zones as a depth ladder and paints the bones from a palette of their own. Here a zone is a territory and depth lives inside it, so its variables land as follows.

### its zones

| designer | it paints | here |
|---|---|---|
| zone 0 | page root · shell · panel A | zone 1, `surface` |
| zone 1 | shell ground · rail C · pane shells | zone 0, `surface` |
| zone 2 | rail B · chat bubbles · tool rows · composer | `surface-sunk` of the zone that holds it |
| zone 3 | cards · pane bodies · dock body | `surface-lift` of the zone that holds it |
| zone 4 | latched, selected | `control.contrast-pressed` |
| zone 5 | menus · popovers · toasts | `surface-lift` + `shape.lift` |
| `data-bone="chassis"` | shoulder · pincer · crown · spine · pane strips | zone 0 |

### its variables

| designer | here |
|---|---|
| `--zN-s` · `--surface` | zone `surface` · `surface-sunk` · `surface-lift`, by the table above |
| `--zN-c` · `--contrast` | `text.strong` |
| `--zN-b` · `--boundary` | zone `boundary` |
| `--field` | `control.field` |
| `--t1` · `--t2` · `--t3` | `text.strong` · `text.ink` · `text.light` |
| `--p` · `--pt` · `--pInk` | `signal.primary.fill` · `.tint` · `.on` |
| `--ok` · `--warn` · `--bad` | `signal.positive` · `caution` · `negative`, the fill |
| `--veil` · `--inset` · `--lift` | zone `scrim` · `shape.sunk` · `shape.lift` |
| `--r-key` · `--r-field` · `--r-card` · `--r-pill` · `--r-disc` | `shape.radius.<entity>`, each naming a step of the scale |
| `--r-tick` | a step of `shape.radius` |
| `--on-ink` | `control.on-pressed` |
| `--case` | `shape.label.case` |
| `--depth` · `--row` · `--track` | `size.depth` · `size.row` · `shape.label.track` |
| `--p-h` · `--p-a` | none: a signal has no hover or active |
| `--f-head` · `--f-body` · `--f-code` · `--viket` · `--viketInv` | open, §11 |

### its bone palette

| designer | here, in zone 0 |
|---|---|
| `--bone-bg` | `surface` |
| `--bone-ink` · `--bone-ink2` | `text.strong` · `text.muted` |
| `--bone-sh` | `size.ring` + `boundary` |
| `--bone-key` | `surface-lift` |
| `--bk-bg` · `--bk-on` | `control.contrast` · `control.contrast-pressed` |
| `--bk-sh` · `--bk-on-sh` | `size.depth` + `shadow` · `shape.sunk` |
| `--bk-led` | `control.divider` |
| `--bk-ink` · `--bk-ink2` · `--bk-on-ink` | `control.on` · `control.on-muted` · `control.on-pressed` |
| `--bone-key-sh` · `--bone-viket` | open, §11 |

### its theme names

| designer | here |
|---|---|
| nordic | northsea |
| paper | parchment |
| porcelain | porcelain |
| ledger | datasette |

A theme whose chrome differs from its body states that in its zone 0: its own ground, ink, control fills and the labels that sit on them. Nothing outside the zone is needed.

## 11 · open points

The sheet above carries the first option of each.

| point | options |
|---|---|
| rails B and C | zone 0 · zone 1 |
| panes D E G · pane F | zone 0 and zone 1 · otherwise |
| who sets zone 2 | the mode declares itself an island · the host decides |
| a key's rest shadow · the mark's variant | composed in the view · `shape.key` · `shape.mark` |
| the text floor | five steps, `muted` for labels only · four steps |
| fonts | outside the tree · a sixth group `font` |
| who reads `--size-*` | tailwind remapped · drapes' size maps rewritten |
| a key's fill against its ground (parchment's is 1.00:1 on two grounds) | told by ring and drop · the fill clears every ground |
| a floor for `boundary-strong` (northsea's is under 3:1 on 8 of 12 grounds) | none · 3:1 on every depth step |

## 12 · where to look

| what | where |
|---|---|
| the plan, its milestones, the blast | `.ikiro/quests/done/m72-zoned-designs.org` |
| the schematics | `subsystems/typology/schematics/primitives/theme.js` |
| completing a theme | `subsystems/dapper/lib/theme.js` |
| the sheet | `subsystems/dapper/lib/emit.js` |
| a theme | `subsystems/dapper/themes/<name>/theme.js` · `gradients.js` |
| tailwind's map | `subsystems/dapper/belt/tailwind-theme.js` |
| the components | `subsystems/drapes/` |
| traps in today's tree | `.ikiro/world/codemap/design.md` |
| today's tree, measured | `~/.viva/bak/ikiro/reference-design-20260928/design.md` |
