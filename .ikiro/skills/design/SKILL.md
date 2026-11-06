---
name: design
description: >-
  Port a designer's comp (.dc.html, claude.ai design, DesignSync "Implement: X") as a visual spec — markup AND
  sample data, which IS the spec; one line per pane, shows what from where; hexes and fonts verbatim until
  beef orders the theme. Use before the first line of a screen built from a comp or a designer's screenshot.
when_to_use: >-
  a `.dc.html` handoff · a claude.ai/design link · "implement this" over a mock · "Implement: <screen>" · a
  designer's screenshot with a complaint · "port the design" · the comp re-pasted · "this doesnt look like
  its design" · "pixel perfect" · "this is what it must look like" · any UI pass that ships its own palette.
---
<!-- limit: 5000 chars -->
# design — the comp is markup AND data; data is the spec

## beef's rulings — standing

/"you fucking joker implemented the whole thing without respecting the theme. idiot."/ · /"dont jsut go into it. read the compact, read the past quests … understand what is why. and only then go into exec."/ · the deviation licence: /"its a design. ui and ux. content is your perview. you control content. adapt and integrate… the agent that build the design didnt have all the facts and youre smarter."/

## The pass — one todo each

0. **read budget.** Read the comp + its schematic, WRITE the pane lines (3) to disk; the rest when touched — /"600k context and youve not even started"/.
1. **fetch whole, decode mechanically.** `.dc.html` bundles carry `script[type="__bundler/manifest"]` entries, gzip+base64 — decode with a script that WRITES the parts as files under `reference/<quest>/<comp>/`; the md holds the reading — a sheet quoted in prose trips word-guard (11-08). Re-fetch from the file before apply and any parity claim: `diff` the built-from copy, port the delta, report an IDENTICAL re-pull (09-28).
2. **read the project as a FAN.** Siblings disagree on purpose: name the commission first; every section its coverage note names (pane skin · panes · bones) lands in ONE pass; REJECTED 10-06 panes re-cut on the old skin — /"cmon. you didnt do the design at all"/.
3. **the SAMPLE DATA is the spec.** `SCENE`/fixture says what a fresh screen holds and doesn't: **one line per pane, "shows what, from where"**, BEFORE markup, in the data's own shape (owner→type→slugs), never KEY/VALUE cards. REJECTED: data read as filler — a killed default came back · /"this is just teh tmeplates filled out."/
4. **the comp's palette VERBATIM until beef orders the theme** — `THEMED` names, no dark/light (REJECTED 10-26 /"forget dark/light entirely"/) — /"first make it look pixel perfect like the design!"/ Hexes · fonts · lighting in ONE block on the mode's root, defining every variable views read (**an undefined variable fails SILENTLY**). REJECTED: hexes to tokens first; that pass on his word: `grep -o '#[0-9a-fA-F]\{3,8\}' <comp> | sort -u` vs `subsystems/dapper/lib/colors.js`; an ink is a PAIR on its ground, contrast-tested per theme (/"white on white"/)
5. **a small screen never loses a control; "proper" · "real" = the engine's FULL power** — re-lay, never cut; build what a comp describes (/"why a limited set?"/); a tty view: `<image>` · multi-row sprites · sized to its box, an external reference read first (REJECTED 10-26 one glyph a cell: /"use the full power of our modern tty tui engine!"/). A control: visible, thumb-sized; blocked, says why in text — /"the drag handles are UNREACHABLE on mobile"/
6. **port the intent, not the mechanism; every comp STATE ships** — each `sc-if` a `<Show>` (busy · fault · empty · over), never the happy path alone (11-09 `painting…` for the comp's busy row). Live chrome the comp omits (folds · strip) STAYS — /"you removed the view modes."/ A mock is a UI, no app: geometry and tokens verbatim, RE-SOURCE every datum.
7. **mark what the design wants and the system lacks** (drag-and-drop upload, a missing route) as a quest list, not a stub: /"mark those. topic later."/ — and what it DROPS, in `* dropped` (live had · who ruled · what stands; a sourceless datum, never faked): /"mark whre you DROP features."/
8. **the patch, per item, on go.** /"Implement: X"/ is the design tool's imperative, not beef's. A `go` on a sketch is a go on the ITEM: /"no inline rendering of page"/ · /"just a button"/.
9. **walk the served artifact** (skill `debug`) — `paladin.bundler` + dapper's `design()` CSS, a stub row; name each screenshot's source (comp · harness · his anima) first. **Matching in isolation, not in the host, is the HOST's CSS**: on the first "doesnt look like", a console snippet measuring the boxes in HIS tab. A terminal port walks standalone, tangle blocks verbatim over stubs, `testament/prototypes/<name>/`. REJECTED 10-07 a second checkout.

## When the port fails

/"no. this is horrible. utterly impentirarble."/ → /"ill have a designer do a pass. write a briefing. in markdown."/ — the briefing names data · panes · tokens · open questions: the comp's input, no defence.
