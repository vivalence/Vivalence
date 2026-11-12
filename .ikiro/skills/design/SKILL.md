---
name: design
description: >-
  Read a designer's comp (.dc.html, claude.ai design, DesignSync "Implement: X") as a spec — markup AND
  sample data; one line per pane, shows what from where; hexes and fonts verbatim until beef orders the
  theme. Use before quest-planning a comp, building a screen, briefing a design agent.
when_to_use: >-
  a `.dc.html` handoff · a claude.ai/design link · "implement this" over a mock · "Implement: <screen>" · a
  designer's screenshot with a complaint · "port the design" · the comp re-pasted · "this doesnt look like
  its design" · "pixel perfect" · "like it used to be" (`git show` it) · "this is what it must look like" · any UI pass that ships its own palette · "i'd like to see X" · "N controls in X" over a panel · a width · band complaint on his screen.
---
<!-- limit: 5000 chars -->
# design — the comp is markup AND data; data is the spec

## beef's rulings — standing

/"you fucking joker implemented the whole thing without respecting the theme. idiot."/ · /"dont jsut go into it. read the compact, read the past quests … understand what is why. and only then go into exec."/ · the deviation licence: /"its a design. ui and ux. content is your perview. you control content. adapt and integrate… the agent that build the design didnt have all the facts and youre smarter."/

## The pass — one todo each

0. **read budget.** comp + schematic; pane lines to disk first.
1. **fetch whole, decode mechanically.** `.dc.html` = gzip+base64: a script writes the parts to `reference/<quest>/<comp>/`; a parity claim re-fetches + `diff`s.
2. **read the project as a FAN.** Siblings disagree on purpose: name the commission first; every section its coverage note names lands in ONE pass; REJECTED 10-06 panes re-cut on the old skin — /"cmon. you didnt do the design at all"/.
3. **the SAMPLE DATA is the spec.** `SCENE` says what a fresh screen holds: **one line per pane, "shows what, from where"**, BEFORE markup, in the data's shape. REJECTED: data as filler — /"this is just teh tmeplates filled out."/
4. **the comp's palette + SIZES VERBATIM until beef orders the theme** — `THEMED` names, no dark/light (REJECTED 10-26 /"forget dark/light entirely"/) — /"first make it look pixel perfect like the design!"/; a glyph · gutter · gap is a size (11-17 /"triangle is too small"/). Hexes · fonts · lighting in ONE block on the mode's root, defining every variable views read (**an undefined variable fails SILENTLY**). Hexes → tokens on his word only (`grep -o '#…' <comp>` vs `dapper/lib/colors.js`); an ink is a PAIR on its ground, contrast-tested per theme (/"white on white"/)
5. **a small screen never loses a control; "proper" · "real" = the engine's FULL power** — re-lay, never cut; build what a comp describes (/"why a limited set?"/); a tty view: `<image>` · multi-row sprites (REJECTED 10-26 one glyph a cell). A control: visible, thumb-sized; blocked, says why in text; each state it writes, it undoes: walk every act from every state (11-17 /"cant go below 16"/)
6. **port the intent, not the mechanism; every comp STATE ships** — each `sc-if` a `<Show>` (busy · fault · empty · over), never the happy path. **A comp over a LIVE surface = content INTO its rows, never a skin** (REJECTED 11-17 /"integrated not authoritative!"/); live chrome it omits STAYS (/"you removed the view modes."/). A mock: RE-SOURCE every datum in its system form (11-17 `/daemon/` slash).
7. **mark what the design wants and the system lacks** as a quest list, never a stub: /"mark those. topic later."/ — what it DROPS, in `* dropped` (live had · who ruled; a sourceless datum, never faked): /"mark whre you DROP features."/
8. **plan first; the patch, on go.** /"Implement: X"/ · `/design port X` = the tool's imperative: a comp + a quest = the PLAN in it, the quest reigns (/"design is sketch"/) — deliverables · connections, no code (REJECTED 11-17 /"wrong direction"/). A `go` on a sketch is a go on the ITEM: /"no inline rendering of page"/ · /"just a button"/.
9. **walk the served artifact on HIS config** + comp live (`methods/dcrender.py`): his ledger's gated-off parts, say so (11-17). **Matching in isolation, not in the host, is the HOST's CSS**: a size · width ask, BEFORE the reply: render it, measure + zoom HIS tab (11-18 /"collapsed to content"/). A tty port: standalone over stubs.
10. **a new control on his screenshot = an EXISTING kind, in HIS noun** — grep `Srow.jsx` `ROWS` · `Pop.jsx` `SETS` first; a picker = the value's GLYPH + a toggle opening alternatives in place; a predecessor (`bak` · `testament/`) ports FIRST, look AND handlers; never a `<select>` · a new section. REJECTED 11-12 `faculties`: /"on click a toggle"/ · 11-13 `.dhead` selects: /"flat on design"/.

## When the port fails

/"no. this is horrible. utterly impentirarble."/ → /"ill have a designer do a pass. write a briefing. in markdown."/ — ONE `.md`, its absolute path the reply's last row (11-16 /"gimme file"/): data · panes · tokens · open questions, no defence.
