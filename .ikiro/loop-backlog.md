# loop backlog — the overnight work-queue

<!-- writer: agent. The durable driver for the /loop 20min self-improvement runs. Prepped via a 5-stream scoping fan-out. Tonight's loop PULLS from here; it does NOT invent a finite agenda and stop. -->

## PRIME DIRECTIVE (the lesson from 07-23)

An open-ended duration order (*"work through the night"*) is satisfied by **ELAPSED TIME, not a task-list**. Night ≈ 8h → 480/20 ≈ **24 iterations**. Do NOT stop when this list looks done. When the safe-autonomous items empty, pull from **§ Backstop** (inexhaustible) or spawn a finder to refill. Stop ONLY at the horizon or on beef's word.

## THIS RUN — bounded (beef, verbatim: *"limit it to 2 hours tonight. aka 4 loops"*)

Cron job `6116468c`, `7,37 * * * *` (30 min). Horizon = **4 iterations**, not the night. Beef's word overrides the open-ended directive above.

- [x] **iter 1** — SKILL.md frontmatter VERIFY (gates the 4 skill fixes) → facts in `quests/ikiro-modernization.quest.org`
- [x] **iter 2** — all four SKILL.md fixes + the pre-flight sidecar (batched: one spec, one edit-family). Caught canon drift in `self/rituals.md`. Symlink went live mid-iteration (beef ran it), so the wiring footers are gone.
  - DEVIATION from the staged spec: live-validation keeps model-invocation ON. `disable-model-invocation: true` would make `paths: systems/kajuit/**` dead weight (no auto-load at all), and the trap it guards — reading a stale bundle as a real bug — fires when nobody thought to invoke it. Path-gated auto-load beats manual-only. Reverse it if you'd rather it stay hand-fired.
- [x] **iter 3** — flywheel depth: 10 rungs drained into `self/rituals.md ## anti-rationalization` (the missing duration-order rule + assume-dont-verify attribution + all 8 watch families), flywheel steps de-staled against the autonomy grant. Chose depth over more skill runners: each new runner taxes the always-on listing, and beef's standing order is *reduce*.
  - **Scoreboard is now stale by construction** — 10 families just gained rungs. Next flywheel recomputes it WHOLE (derived; never hand-patch a cell).
- [x] **iter 4** — frontier dangle repair + full link audit (zero left); `overnight.md` rewritten as the morning fold; cron `6116468c` deleted. Loop closed at the horizon beef set, not at a list running out.

## How the loop uses this file

Each fire: (1) read this file, (2) pick the **top unchecked `[SAFE]` item**, (3) do it bounded, (4) check it off + one-line result, (5) re-arm the 20-min wakeup. `[GATED]` items are **propose/stage only** — never execute (they touch `.claude/`, code outside `.ikiro/`, `bak/`, or memory/); write the proposal, check off, move on. **VCS mutation forbidden throughout.** When `[SAFE]` items run low (<5 left), do one **§ Backstop** research→adjust pass to refill.

Legend: `[SAFE]` = execute autonomously (`.ikiro/`-internal or read-only research) · `[VERIFY]` = confirm a fact first, then safe · `[GATED]` = stage/propose only.

---

## Tier 1 — ready wins (skills + flywheel + quality fixes)

### Skills build-out (staging PART 1 is the spec; `.ikiro/skills/` is mine)
- [x] `[VERIFY]` **Resolve SKILL.md frontmatter format** — DONE (iter 1). 1,536-char cap on `description`+`when_to_use` (the "~150 chars" rule was invented); `when_to_use` real; `disable-model-invocation` also blocks subagent-preload + scheduled-task firing; `name:` is display-only, dir name owns the command; sidecars = correct progressive-disclosure shape. New levers found: `paths` (glob-gated autoload) · `disallowed-tools` (AskUserQuestion for background loops) · `context: fork`+`agent` (a skill IS a spawnable subagent — re-prices the personas fork). Body law: SKILL.md loads once and STAYS → standing instructions, not one-time steps. Facts in `quests/ikiro-modernization.quest.org § CONFIRMED vs STALE`.
- [x] `[SAFE]` **Apply blast-bracket fix** — DONE (iter 2). description/when_to_use split; skip guard one line; beats 1+2 carry copy-paste bash; wiring footer dropped (symlink is live).
- [x] `[SAFE]` **Apply pre-flight fix** — DONE (iter 2). Six checks → `- [ ]` checklist, grep inline, sidecar referenced. ~~description 342→~150~~ (DROPPED iter 1 — invented cap; 342 is well inside 1,536).
- [x] `[SAFE]` **Apply live-validation fix** — DONE (iter 2). Sequence-first, rules-second; `querySelector` + `read_console_messages` snippet; HMR/scoped-`> *`/no-modal rules; `paths: systems/kajuit/**`. **DEVIATION: `disable-model-invocation` left UNSET, not true** — see the run header.
- [x] `[SAFE]` **Apply flywheel fix** — DONE (iter 2). Pre-run `- [ ]` gate (read whole ledger · count ≥5 · dedicated-pass check); per-step detail; ledger law hoisted to a standing section; the "leave `disable-model-invocation` unset" reason stated in-body.
- [x] `[SAFE]` **Sidecar: `pre-flight/primitives-checklist.txt`** — DONE (iter 2), and it caught a real drift: `steer.rollup`/`steer.fold` do not exist — both moved under `steer.trie.*`. Every entry now carries a verified path + line ref. `self/rituals.md` corrected; drift logged in `zettelkasten.md ## Open`.
- [ ] `[VERIFY]` **Sidecar: `live-validation/dom-selectors.txt`** — grep `systems/kajuit/src` for real selectors (dock, thread/create, buffer-view root, panel roots); mark any unconfirmed UNVERIFIED, never fabricate.
- [ ] `[SAFE]` **Sidecar: `flywheel/scoreboard-template.md`** — blank derived-Scoreboard skeleton matching the LIVE column shape + the recompute-whole banner.
- [ ] `[SAFE]` **New runner: `scribe-duties/SKILL.md`** — the session-disintegrate checklist (compact/memory/callouts/quest/frontier/budgets), rituals.md as canon.
- [ ] `[SAFE]` **New runner: `anti-rationalization/SKILL.md`** — the thought→stop table; cross-link vcs-guard + comment-guard enforcement.
- [ ] `[SAFE]` **New runner: `qa-before-blast/SKILL.md`** — finder→refuter→completeness-critic fan-out; calibrate-judge-first, one-axis, quote-before-assert.
- [ ] `[SAFE]` **New runner: `svelte-nanostores/SKILL.md`** — the 4 svelte rules + reinforcing memory detail (class-state gap, transparent accessors, rune-props).
- [ ] `[SAFE]` **Skill-discovery audit** — all 5 skill descriptions vs realistic trigger phrases; close gaps; a before/after coverage table.

### Flywheel depth (drain lessons into always-firing self/ files)
- [x] `[SAFE]` **premature-completion → mechanical rung** — DONE (iter 3). Verified absent first (no double-write), landed with the 07-23 verbatim: duration ÷ interval = iteration count; queue-empty ≠ finished.
- [x] `[SAFE]` **assume-dont-verify → completeness checklist** — DONE (iter 3), COMPRESSED to one line (prove-or-own: baseline/repro per failure + every consumer suite on a core-prototype change) rather than the planned 3-point block. Reason: rituals.md is budget-capped and beef's standing order is *reduce*. The full 3-point form stays in the ledger entry it came from.
- [ ] `[SAFE]` **over-abstraction → connoisseur** (2 occ, clean promotion) — the minimal-delta rule into self/connoisseur.md (connection-trie + nyan comment-essays exemplars); Scoreboard proposed→landed.
- [x] `[SAFE]` **Drain 8 watch-families** — DONE (iter 3). All eight landed as family-tagged thought→stop lines. `rituals.md` 90→100 lines (cap 140). Bonus: flywheel steps 2–4 still said "propose to beef / beef merges / beef only" — stale against the autonomy grant in the same file — reconciled; writer banner `human-gated` → `autonomous, transparent`.
- [ ] `[SAFE]` **test-parity + pre-DONE gate → methods/quest.md** — no milestone DONE without (a) named test file + (b) green suite recorded; + coverage-delta changelog field; delete the 3 converged Open lines.

### Quality fixes
- [x] `[SAFE]` **Fix 3 dangling wikilinks in frontier.md** — DONE (iter 4). Two ellipsis-truncated links expanded to full compact filenames; the pruned `[[conversation-dock-recast]]` quest ref dropped (its compact was already linked in the same sentence — redundant, not orphaned). Then every remaining frontier wikilink audited against compacts/quests/memory/self/world: **zero dangles**.
- [ ] `[VERIFY]` **Full dangling-link audit** — resolve all ~141 `[[targets]]` across compacts/quests/world/self; repair clear-cut, list ambiguous. Zero silent dangles.
- [ ] `[VERIFY]` **Re-stamp codemap: paladin.md** — pensieve revelio→own(module) per-daemon mint + owner-authored law; ≤30 lines.
- [ ] `[VERIFY]` **Re-stamp codemap: runtime.md** — m20 session-recast + corpus/topography snapshot regime; ≤30 lines.
- [ ] `[VERIFY]` **Re-stamp codemap: kajuit.md** — dock-per-terminal + HARNESSED authority; ≤35 lines.
- [ ] `[VERIFY]` **Re-stamp codemap: typology.md (+schematics.md)** — verify Signature.branch-mutates + Path laws vs current churned prototypes; within limits.
- [ ] `[SAFE]` **frontier budget + accuracy** — evict oldest DONE-recent items (whole-item, quotes intact) down to their compacts; reconcile DONE/OPEN vs the 51 live quests.
- [ ] `[VERIFY]` **zettelkasten ## Open triage** — delete confirmed-done items; flag grown buckets (testing, br-pt) as quest-spins; DON'T touch the `[loop directive]` selfmod line.

---

## Tier 2 — deeper (research → adjustment; each ≈1 iteration)
- [ ] `[SAFE]` **Orchestration pattern-lineage note** — fetch "Building Effective Agents"; map rituals to the 5 patterns; short `## pattern lineage` in rituals.md (keep under 140 lines).
- [ ] `[SAFE]` **Memory/context-layering audit** — ikiro layers vs official CLAUDE.md hierarchy + @imports; 2-3 restructure options → modernization quest.
- [ ] `[SAFE]` **Guardrails deep-dive + comment-guard dry-run** — run the hook on 2 sample inputs (authored-`//` vs clean); record pass/deny; guardrail-ladder method note. (Dry-run only — no wiring.)
- [ ] `[SAFE]` **Eval-driven self-eval design** — callout families → a per-session regression checklist the scribe runs; design into the quest.
- [ ] `[VERIFY]` **Prompt-engineering audit of kernel + self/** — structure/tags/examples gaps; land pure self/ tightenings within budget; kernel changes → morning briefing.
- [ ] `[SAFE]` **MCP tool-design reference note** — best practices grounded in shape.agentic (`/`→`_`) + aprende quartet; repo-code recs propose-only.
- [ ] `[SAFE]` **Progressive-disclosure budget audit of self/** — per-file always-on-vs-lazy table; land unambiguous sidecar migrations (never move a discipline that must always fire).
- [ ] `[SAFE]` **Codify investigator fan-out** — the selfclean finder→refuter→critic episode as a named invocable method.
- [ ] `[SAFE]` **Compaction-fold proposal** — when compacts/ grows, a fold rolling settled slugs into a higher index (mirror the repo's turn-fold); design only.
- [ ] `[SAFE]` **World test-map** — grep every test file → covered source → `world/codemap/tests.md` + gaps section.
- [ ] `[SAFE]` **Where-used graph (typology first)** — export→consumer indented-tree (never tables) into world/.
- [ ] `[SAFE]` **In-flight registry** — map each dirty working-tree path → owning quest (or flag orphan). Read-only on git.
- [ ] `[VERIFY]` **Stale-test investigation** — pensieve.test lookup→revelio, paladin.test hal257: dead/live verdict; fixes propose-only (code outside .ikiro).
- [ ] `[VERIFY]` **Quest size-split: m11_packages** (130KB) — split at milestone boundaries, zero content loss (byte-diff the concat).
- [ ] `[VERIFY]` **Quest size-split plan: other 7 oversized** — live/DONE verdict each; boundary plan; DONE→bak staged propose-only.
- [ ] `[SAFE]` **Prune/eviction candidate list** — PROVEN families quiet ≥10 compacts → staged eviction list (family, last-seen, count); beef confirms deletions.
- [ ] `[SAFE]` **Re-ground the modernization gap table** — rewrite citing only verified sources; update each delta to the night's progress; resolve the unverified-citation caveat.

---

## Tier 3 — GATED (stage/propose only tonight; beef approves)
- [ ] `[GATED]` **Stage persona subagent: connoisseur** — full body from self/connoisseur.md → `.ikiro/agents-staged/connoisseur.md`; current model ID (`claude-opus-4-8`); marked unwired.
- [ ] `[GATED]` **Stage persona subagent: investigator** — body from self/personas.md (calibrate→finder→refuter→critic) → agents-staged/; opus; read-only tools.
- [ ] `[GATED]` **Stage persona subagent: scribe** — body from rituals.md scribe-duties → agents-staged/; `claude-haiku-4-5-20251001`.
- [ ] `[GATED]` **Stage persona subagent: cartographer** — body (map-defers-to-territory) → agents-staged/; haiku; no-Write.
- [ ] `[GATED]` **Stage persona subagent: surgeon** — body (blast-bracket + client/CSS weak-flank) → agents-staged/; opus; go-only.
- [ ] `[GATED]` **Refresh persona model IDs + economics rationale** in staging.md (opus-4-8 / haiku-4-5; why each role gets which).
- [ ] `[GATED]` **`.claude/rules` path-scoping sketch** — which guidance scopes to which glob, exact layout, kernel-context saved; into the quest, unwired.
- [ ] `[GATED]` **Wire comment-guard.sh — stage the block** — exact `.claude/settings.json` PreToolUse block (matcher `Write|Edit`) + the `.claude/skills` symlink command, into the worklog for beef's 1-liner.
- [ ] `[GATED]` **Memory orphan triage** — 6 truly-orphan files (never_git_stash · never_propose_commits · no_underscore_private · lazy_timestamps_footgun · longdistance_audio_sketch · strategies_services): per-file index/sublink/fold decision → a `.ikiro` proposal doc. DON'T edit memory/ (outside grant).
- [ ] `[GATED]` **Elegance proposals (1/iter)** — DaemonDie nesting flatten · shape.object-on-fold · Vector.affect consumer: read source, verify smell, draft minimal-delta redesign into the owning quest. Code untouched.

---

## Backstop — inexhaustible (pull when Tier-1/2 `[SAFE]` run low)
- [ ] `[SAFE]` **selfmod deep-dive (repeatable)** — beef's standing order. One meta topic per pass (memory arch · MCP exposure · evals · agent-safety · context-mgmt · prompt-eng · …) → one concrete self/methods/skills adjustment, source-grounded, PR-shaped. Identity forks → beef. **This is the "always more" — never run dry.**

---

## Dedup / notes
- SKILL.md fixes were scoped 3× (streams A/B/E) — consolidated above into one Tier-1 group.
- `[SAFE]` count ≈ 30 + the inexhaustible backstop → the loop cannot run dry before morning.
- Some Tier-1 flywheel rungs may be partly landed from 07-23 — VERIFY current state before writing (don't double-apply).
- Prep provenance: 5-stream scoping fan-out (A:15 · B:11 · D:9 · E:18; C authored inline after its agent hit a schema-retry cap).
