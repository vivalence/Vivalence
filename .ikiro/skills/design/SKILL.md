---
name: design
description: >-
  Port a designer's comp (a .dc.html handoff, a claude.ai design, a DesignSync "Implement: X") as a visual
  spec — read BOTH texts, the markup AND the sample data, which says what a fresh screen holds; one line per
  pane saying what it shows and from where; the comp's own hexes and fonts verbatim until beef orders the
  theme. Use before the first line of any screen built from a comp or a designer's screenshot.
when_to_use: >-
  a `.dc.html` handoff · a claude.ai/design link · "implement this" over a mock · "Implement: <screen>" · a
  designer's screenshot with a complaint · "port the design" · the comp re-pasted · "this doesnt look like
  its design" · "pixel perfect" · "this is what it must look like" · any UI pass that ships its own palette.
---
<!-- limit: 5000 chars -->
# design — "port the design" · "pixel perfect": the comp is markup AND data; data is the spec

The pass ends on the served artifact (skill `debug`).

## beef's rulings — standing

/"you fucking joker implemented the whole thing without respecting the theme. idiot."/ · /"dont jsut go into it. read the compact, read the past quests on the dojo/repogram. understand what is why. and only then go into exec."/ · the deviation licence: /"its a design. ui and ux. content is your perview. you control content. adapt and integrate… the agent that build the design didnt have all the facts and youre smarter."/

## The pass — one todo each

0. **read budget.** Read the comp + the schematic it changes, then WRITE the pane lines (step 3) to disk before opening anything else; every other file is read when touched — /"600k context and youve not even started"/. A re-pasted comp is re-read from the file, never from its sync note.
1. **fetch whole, decode mechanically.** `.dc.html` bundles carry `script[type="__bundler/manifest"]` entries, gzip+base64 — decode with a script, never by reading. A 404 on a uuid from memory is a bad id, not auth.
2. **read the project as a FAN.** Sibling comps disagree on purpose — name which one is the commission before porting. The designer's coverage note scopes it: every section it names (pane skin · panes · bones) lands in ONE pass, the markup's look included; a derived `missing.md` goes stale — the template is the spec. REJECTED (10-06): panes re-cut on the old skin, the note's bones deferred — /"cmon. you didnt do the design at all"/.
3. **the SAMPLE DATA is the spec.** The comp's `SCENE` / fixture constant says what a fresh screen holds and what it does not. Write **one line per pane: "shows what, from where"** BEFORE any markup. REJECTED: data read as filler — a killed default came back on screen.
4. **the comp's palette VERBATIM, one block, until beef orders the theme** — /"i dont want my own theme yet. that comes later. first make it look pixel perfect like the design!"/ Hexes, fonts and lighting into ONE palette block on the mode's root. REJECTED: resolving every hex to a dapper token first (the modes came up mono and cream). The token pass comes later on his word: `grep -o '#[0-9a-fA-F]\{3,8\}' <comp> | sort -u` against `subsystems/dapper/lib/colors.js`. **An undefined CSS variable fails SILENTLY** — define every variable the views read in that block.
5. **a small screen never loses a control** — re-lay it, never cut it; build what a comp describes: /"why a limited set?"/
6. **port the intent, not the mechanism.** Live chrome the comp omits (folds · strip) STAYS — /"you removed the view modes. are you retarded???"/ `disabled` and `readonly` are both "locked" on desktop and "keyboard closed" on iOS. A mock is a UI, not an app: geometry and tokens verbatim, RE-SOURCE every datum, prune filler.
7. **read the App against a rows snapshot before landing.**
8. **mark what the design wants and the system lacks** — drag-and-drop upload, a missing route — as a list in the quest, not a stub: /"mark those. topic later."/
9. **the patch, per item, on go.** /"Implement: X"/ is the design tool's imperative, not beef's. A `go` on a sketch is a go on the ITEM: /"no inline rendering of page"/ · /"just a button"/.
10. **walk the served artifact** — bundle with `paladin.bundler`, add dapper's `design()` CSS, mount with a stub row; a hidden Chrome tab paints only after a screenshot; light-theme screenshots on a dark Mac need `--color-scheme=light`. Name each screenshot's source (comp · harness · his anima) before diagnosing. **A port that matches in isolation and not in the host is the HOST's CSS**: on the first "doesnt look like" screenshot, hand beef a console snippet measuring the offending boxes in HIS tab.

## When the port fails

/"no. this is horrible. utterly impentirarble."/ → /"ill have a designer do a pass. write a briefing. in markdown."/ — the briefing names the data, the panes, the tokens and the open questions; it is the comp's input, not a defence of the port.
