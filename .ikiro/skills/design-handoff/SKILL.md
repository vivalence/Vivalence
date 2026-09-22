---
name: design-handoff
description: >-
  Port a designer's comp (a .dc.html handoff, a claude.ai design, a DesignSync "Implement: X") as a visual
  spec — read BOTH texts, the markup AND the sample data, which says what a fresh screen holds; one line per
  pane saying what it shows and from where; the comp's own hexes and fonts verbatim until beef orders the
  theme. Use before the first line of any screen built from a comp or a designer's screenshot.
when_to_use: >-
  a `.dc.html` handoff · a claude.ai/design link · "implement this" over a mock · "Implement: <screen>" ·
  a designer's screenshot with a complaint · "port the design" · the comp re-pasted · "this doesnt look like
  its design" · "pixel perfect" · "this is what it must look like" · any UI pass that ships its own palette.
---

# design-handoff — the comp is markup AND data; the data is the spec

Canon: 19 compacts across the corpus (#2 #9 #11 #53 #54 #63 #75 #83 #99 #135 #136 #163 #168 #170 #177 #182 #189 …) · `feedback_theme_tokens_over_literals` · `feedback_second_correction_means_wrong_shape` · Scoreboard `user-intent-drift` (09-22: *"a comp's sample data is a ruling about scope, read it before the markup"*) · `theme-literals`. The pass ends in [[live-validation]] on the served artifact.

## beef's rulings — verbatim, standing

*"you fucking joker implemented the whole thing without respecting the theme. idiot."* · *"and why inn gods fucking name is there still a fucking defualt when i load a new empty fucking buffer???? I TOLD YOU FUCKING DOUZENS OF FUCKING TIMES"* · *"dont jsut go into it. read the compact, read the past quests on the dojo/repogram. understand what is why. and only then go into exec."* · the deviation licence: *"its a design. ui and ux. content is your perview. you control content. adapt and integrate… the agent that build the design didnt have all the facts and youre smarter."*

## The pass — one todo each

0. **the read budget.** Read the comp + the schematic it changes, then WRITE the pane lines (step 3) to disk before opening anything else; every other file is read when it is touched (`feedback_read_budget` — 09-23: ~600k tokens read, zero lines written, beef: */"600k context and youve not even started"/*). A re-pasted comp is re-read from the file, never from its sync note or a date (09-23: "same v3" answered from `github.md`, the comp was v4).
1. **fetch whole, decode mechanically.** `.dc.html` bundles carry `script[type="__bundler/manifest"]` entries, gzip+base64 — a ten-line Deno script beats reading 127k tokens of escaped payload. `list_projects` filters to design-SYSTEM projects and returns `[]` for others; a 404 on a uuid you reconstructed from memory is a bad id, not an auth problem.
2. **read the project as a FAN.** Sibling comps disagree on purpose (three panel-C designs, two pincer interactions in one project) — name which one is the commission before porting.
3. **read the SAMPLE DATA as the spec.** The comp's `SCENE` / fixture constant lists what its own queue committed, file by file — what a fresh screen holds and what it does not. Write **one line per pane: "shows what, from where"** BEFORE any markup. The 09-22 strike: two columns and a palette transcribed, the data read as filler, a default that beef had killed dozens of times back on screen.
4. **the comp's palette VERBATIM, in one block, until beef orders the theme.** STALE until 09-23 — this step said resolve every hex to a dapper token, and the guide modes came up mono and cream: */"i dont want my own theme yet. that comes later. first make it look pixel perfect like the design!"/* (`feedback_design_port_verbatim_first`). Port the comp's hexes, fonts and lighting into ONE palette block on the mode's root; the token mapping is a later pass on his word, and then `grep -o '#[0-9a-fA-F]\{3,8\}' <comp> | sort -u` against `subsystems/dapper/lib/colors.js` is the substitution. **An undefined CSS variable fails SILENTLY** — every variable the views read is defined in that block.
5. **port the intent, not the mechanism.** `disabled` and `readonly` are both "locked" on desktop and both "keyboard closed" on iOS. A mock is a UI, not an app: port geometry and tokens verbatim, RE-SOURCE every datum from the real system, prune the filler (links, versions, invented content).
6. **read the App against a rows snapshot before landing** — a design-phase App read against `vdex-rows.snapshot.json` found two render-blocking defects.
7. **mark what the design wants and the system does not have** — drag-and-drop upload, a missing door — as a list in the quest, not as a stub. *"mark those. topic later."*
8. **the patch, per item, on go.** The handoff's imperative (*"Implement: X"*) is the design tool's, not beef's. A `go` on a sketch is a go on the ITEM — three strikes in twenty seconds followed one: *"no inline rendering of page"* · *"just a button"* · *"and clicking on it starts the buffer"*.
9. **walk the served artifact** — bundle with `paladin.bundler`, add dapper's `design()` CSS, mount with a stub row; a hidden Chrome tab paints only after a screenshot; light-theme screenshots on a dark Mac need `--color-scheme=light` ([[live-validation]]). Two corrections on one screen = the shape is wrong — re-read his sketch, stop patching values. Name each screenshot's source (comp · harness · his anima) before diagnosing it — #202 and #204 each read the comp as the mode. **A port that matches in isolation and not in the host is the HOST's CSS**: on the first "doesnt look like" screenshot, hand beef a console snippet measuring the offending boxes in HIS tab (09-23: anima's `:global(section .row)` padded the stage bar 16px; four turns measured from outside before one snippet found it).

## When the port fails

*"no. this is horrible. utterly impentirarble."* → *"ill have a designer do a pass. write a briefing. in markdown."* — the briefing names the data, the panes, the tokens and the open questions; it is the comp's input, not a defence of the port.
