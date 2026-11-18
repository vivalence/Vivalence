# Visual pass — wakaru views on the dapper theme (11-18)

Audit over 4 themes (porcelain · northsea · parchment · datasette) × 390/1280 px: 1502 pairs under their contrast floor
before, 0 after, on the copy in `scratchpad/visual/buffer` (`patch.diff`, 8 files, apply with `patch -p5` in the stage
buffer dir). Tools: `tools/pairs.py` (prints the pair table from dapper's own tokens), `tools/shoot.js` (re-runs the audit
and screenshots in a headless Chrome with its own profile), fixtures in `harness/`.

## Root cause

"Surface levels" are NOT zones. Zones are territories the host sets (0 chrome · 1 body · 2 island · 3 bench); a view
never names one. The levels are each zone's depth steps — `--surface` · `--surface-sunk` · `--surface-lift` — plus the
control fills. A buffer view sits in zone 1, mounted in the LIGHT DOM (not a shadow root): drapes' global `parts.css`
reaches into it. dapper's own contrast tests are green (279 pairs); every wakaru failure used a pair dapper never
tests: `--boundary` as text (1.32:1 porcelain), canvas colours as page text via `--foe` (1.16–2.75:1 light themes),
invented levels (keys mixed from lift+sunk: 1.02–1.07:1), half-strength right/wrong washes (1.06–1.15:1), a 9.6px
verdict, right/wrong by colour alone (in datasette primary = negative: the urgent clock did not change at all).

## (a) Theme rules for this mode — LAW for every wakaru view

1. The view lives in zone 1 as the frame hands it. Never set `data-zone`; nest by depth step.
2. Page is `--surface`. Prose `--text-ink`, the word and values `--text-strong`, secondary `--text-light`,
   `--text-muted` only for glyphs. Never `--boundary`, `--divider` or a game (canvas) colour as text.
3. Card (duel, talk, stone card, quest row, game sheet): `--surface-lift` with
   `box-shadow: inset 0 0 0 var(--size-ring) var(--boundary)` and `border-radius: var(--shape-radius-card)`.
4. Overlay sheet (atlas, journal, codex): `--surface`, full cover. A floating toast: `--surface-lift` + `--shape-lift`.
5. Well (canvas frame, BUILD line, meter/clock track): `--surface-sunk`.
6. Input: `--control-field` background, text ≥ 16px, placeholder `--control-field-placeholder`, caret
   `--control-field-caret`, a 2px `--control-focus` ring on focus.
7. Touchable (option keys, chips, pad buttons): `--control-contrast` fill with `--control-on` text, a `--boundary`
   ring and a `--size-depth` drop; pressed = `--control-contrast-pressed` + `--control-on-pressed` + `--shape-sunk`.
   At least 2.75rem.
8. Primary action (send, hear, walk on, continue): `--signal-primary` fill with `--signal-primary-on` text.
9. Verdict banner (duel, keeper, every game): the tone's tint fill, its ink, a ring in its ink, a MARK and the WORD
   (✦ MASTERY · ✓ SUCCESS · ≈ NEUTRAL · ✗ MISTAKE/FAILURE), at `--size-type-md`, `role="status"`. One tone map
   everywhere: MASTERY/SUCCESS positive, NEUTRAL caution, MISTAKE/FAILURE negative.
10. Reviewed answers: the right one ✓, the wrong pick ✗ and struck through, each on its FULL tint with a 2px ring; the
    others lie flat in `--text-light`. Never opacity, never colour alone.
11. A signal ink only on a depth step or on its own tint over one. On any fill, use that fill's matching label colour.
12. No text under 12px (`--size-type-xs`); labels cased by `--shape-label-case` / `--shape-label-track`; corners from
    `--shape-radius-*`.
13. The world canvas keeps its own palette, framed by a sunk well. A canvas colour leaves the canvas only as an
    `aria-hidden` swatch beside words — never as text, never as a border that carries meaning.
14. Never reuse drapes' global class names (`.mark .tools .tool .keys .journal .head .empty` and anima's `.frame`
    `.empty`). drapes sets `button { text-align: left; padding: 0 }`: glyph buttons centre themselves explicitly.

## (b) Violations found in v0.2 (worst before → after)

| where | element | problem | before | after |
|---|---|---|---|---|
| Duel foe name / vigor pips / hear ▶ | `--foe` canvas colour | 1.16–2.84 | 6.53 / 5.00 |
| Duel urgent clock | only the colour changes | 1.00–1.28 | thicker + striped |
| Duel + Dialogue option keys | lift/sunk mix fill | 1.02–1.07 | label 7.53 |
| Duel + Dialogue right/wrong answer | half tint, colour alone | 1.06–1.15 | 5.55 + ✓/✗ |
| Duel other answers | faded 0.4 | 1.83–2.09 | 6.53 |
| Duel BUILD line / chips | boundary rule / colour alone | 1.01–1.32 | 3.91 / 5.55 + ✓/✗ |
| Duel input placeholder | browser default | 3.63–4.35 | 4.54 |
| Duel verdict word | 9.6px, no mark | size fails | 16px + mark |
| Duel lantern/charm | divider edge / colour alone | 1.03–1.59 | 7.53 / 5.40 |
| Dialogue speaker, hint; Journal title | boundary as text | 1.32–2.64 | 5.91–6.53 |
| Dialogue keeper grade | NEUTRAL drawn as failure, 9.6px | — | caution, 16px |
| Hud lost heart / room / streak | 0.2 opacity / boundary | 1.32–2.64 | 4.27 (♡, ✧) |
| Journal ◇ / reward / meter | boundary / divider | 1.21–2.68 | 4.33–6.53 |
| Wakaru how-to-play line | 9.6px at 0.75 opacity | 3.44–4.46 | 5.91 |

## (c) Screenshots

28 states each in `scratchpad/visual/shots/before/` and `shots/after/` (390px: four themes side by side; 1280px: 2×2),
e.g. `shots/before/390/duel-pick-wrong.png` vs `shots/after/390/duel-pick-wrong.png`,
`shots/after/390/dialogue-question-neutral.png`, `shots/after/1280/duel-type-softened.png`.

## Still open

- Key edges are theme-limited: ring vs card porcelain 1.51 · northsea 1.44 · parchment 2.81 · datasette 14.35. Labels
  identify keys (≥ 7.5:1); a 3:1 hairline needs a theme decision (his).
- northsea's muted key label is 3.39:1 → every word on a key uses `--control-on`.
- drapes leaks into the stage: its global CSS stacks buttons full width and pushes glyphs off-centre (rule 14).
- Svelte 5 drops the leading space in `<small> due</small>` → write `{" "}` or put the space outside.
- Which parts wear `--size-depth` is unruled in the theme-revival quest.

## Pass 2 — v0.3 (11-19), merged and live

58 states × 4 themes × 360/390/1280 px, the real `Wakaru.svelte` mounted with injected state: 32 findings before, 0 after.
No contrast failures, no colour-only states, no text under 12 px, no drapes class collisions in v0.3.

| where | finding | fix |
|---|---|---|
| camera (Stage · Hud · Pad · Wakaru) | on a map's top rows the learner sat under the HUD (54% covered on phones), on short panes under the pad | the camera frames the learner in the band the HUD and the pad/legend leave clear, night past the map's edge; test `camera.test.js` "never under them", mutation-checked |
| Dialogue `.token summary` | sentence words 25–43 px wide | min 2.75rem |
| Codex standing | "known · due" broke between its words | due mark `↻ due` wraps under the status as one unit; the 5.5rem column stays, so words align row to row (the agent's `max-content` would have staggered them) |
| Wakaru `.veil` | own `color-mix` dim | `--scrim` |
| Wakaru `.arena` | HUD and pad tabbable behind an open atlas/journal/codex | `inert` while a panel is open |

Shots: `visual/v3/shots/{before,after}/390/walk-edge-top.png`.
