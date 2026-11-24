# ikiro modernization — STAGING (deep-research deliverable, for tomorrow's attempt)

<!-- Deposited from a background deep-dive research agent that landed AFTER beef said "go to sleep". Durable so it survives to the next session. NOT applied, NOT wired — staging for beef's review. Companion to ikiro-modernization.quest.org. -->

**Caveats before use:**
- Model IDs in the drafts below are stale (`claude-opus-4-1`, `claude-haiku-4-5`) — update to current (`claude-opus-4-8`, `claude-haiku-4-5-20251001`) before wiring.
- The persona-subagent drafts live at `.claude/agents/*.md` = OUTSIDE `.ikiro/` → beef's fork (staged here, unwired).
- SKILL.md fixes are within my grant (they touch `.ikiro/skills/`) — apply on the next attempt if they hold up to a re-read.
- Sources: `code.claude.com/docs/en/skills.md`, `code.claude.com/docs/en/sub-agents.md`.

---

## PART 1 — SKILL.md line-level fixes (the 4 staged runners)

Key official points: ~1,536-char cap on `description`+`when_to_use`; split long descriptions so the short form matches first; body stays in context after first load (every line = recurring token cost — keep procedural, not narrative); reference-content auto-invokes, task-content often wants `disable-model-invocation: true`.

### blast-bracket
- Split `description` (currently 338 chars) → short `description` + a `when_to_use` frontmatter field.
- Replace the "when it fires vs doesn't" prose with a one-line guard: `⚠️ Skip if: single caller · test-only · comment.`
- Convert the five beats to copy-paste bash (grep with `--include`, the `deno test` bookend).
- Move "beef's lingo" to a lexicon reference; drop the wiring note from the body.

### pre-flight
- Tighten `description` (342 → ~150 chars) + `when_to_use`.
- Convert the six checks to a `- [ ]` checklist with the grep inline.
- Add supporting file `primitives-checklist.txt` (paladin.find.viva · paladin.read.viva · paladin.vip.accio* · cast.lookup · steer.rollup · steer.fold · shape.object).
- Consider `disable-model-invocation: true` (manual-only preserves the discipline).

### live-validation
- Reorder: put the action SEQUENCE first, the five rules second (reference-when-stuck).
- Replace `javascript_tool` phrasing with a browser-console `querySelector().click()` snippet.
- Expand the HMR note (watches `systems/kajuit/src/` only; buffer-VIEW needs runtime restart) + the scoped-`> *` trap note.
- `disable-model-invocation: true` (browser-interactive; auto would fire too broadly).
- Supporting file `dom-selectors.txt`.

### flywheel
- Add a pre-flight checklist (open Callouts, count unprocessed, review current Scoreboard).
- Give each of the 5 steps procedural detail (the tally→table recompute, the extinction predicate, the escalation rung).
- Hoist the append-only ledger law to the top.
- Supporting file `scoreboard-template.md`.
- `disable-model-invocation: false` (auto-trigger on "selfimprove"/"another"/"go meta" is correct).

---

## PART 2 — 5 persona → subagent drafts (`.claude/agents/*.md`, staged unwired)

**Design tension (beef's fork):** inline = one daemon adopting hats, shared context, tight loop · subagent = isolated agent + tool allowlist + model choice, focused attention, parallelizable. Keep BOTH — `self/personas.md` for inline adoption, `.claude/agents/` for delegation; mix per session.

| persona | role | model | invoke | tools | weak flank |
|---------|------|-------|--------|-------|-----------|
| Connoisseur | code judgment | opus | manual review gate | Read/Grep (no Edit) | overconfident |
| Investigator | sweeps/audits | opus | manual fan-out | Read/Grep/Bash/Glob (no Edit) | cross-multiplied axes |
| Scribe | continuity/closure | haiku | end-of-session | all | date-stamps |
| Cartographer | world upkeep | haiku | post-landing | Read/Grep/Edit (no Write) | copying content |
| Surgeon | code landing | opus | explicit `go` only | all | client/CSS |

### connoisseur (draft)
```yaml
---
name: Connoisseur
description: Code judgment gate — reviews for legendary elegance (one structure under one law), effect over model, zero ceremony. Invoke when internal structure needs critique before shipping.
allowed-tools: Read Grep Bash
disallowed-tools: Edit Write
---
```
Body: the 13 elegance triggers (code-as-data routing · fold-over-sequence · one-core-thin-cases · self-priming · multimethod-on-live-value · closure-object · cata/ana symmetry · recursion-mirrors-data · zero-ceremony · totality · discriminator-as-data · algebra-named · lazy-suspension) · judge by reveal-vs-hide, effect over form · PASS/FLAG/STOP output · in-repo canon calibration (shape.object, steer.fold+descend, belt/middleware, belt/atom). [Full body distilled from `self/connoisseur.md`.]

### investigator (draft)
```yaml
---
name: Investigator
description: Sweep & audit — breadth-first with adversarial verification. Invoke for system-wide refactors, dependency audits, multi-file pattern searches.
allowed-tools: Read Grep Bash Glob
disallowed-tools: Edit Write
---
```
Body: calibrate-the-judge-BEFORE-sweep · one axis / disjoint scopes / manual dedup · quote-before-asserting (file:line) · refuter → completeness-critic · findings table format · the standard sweeps (imperative-JS reflex, fabricated `v.*` APIs, cross-container import shadowing). [The exact finder→refuter→critic discipline from `self/personas.md`.]

### scribe (draft)
```yaml
---
name: Scribe
description: Session continuity & closure — compacts, memory, zettelkasten ledger, quest changelogs, frontier. Run at end-of-session.
allowed-tools: Read Edit Write Bash Glob
---
```
Body: compact (topic-slug, NO dates, verbatim beef, settlement pass) · memory (update-don't-duplicate, contrastive) · zettelkasten Callouts (scan "retard", family tag, APPEND-ONLY, recurrence-audit) · quest changelog + frontier re-stamp · closed-loop checklist. [Mirrors `self/rituals.md ## scribe's duties`.]

### cartographer (draft)
```yaml
---
name: Cartographer
description: World-map upkeep — keeps codemap shards current, flags doc gaps, re-stamps verified. Run after structural landings.
allowed-tools: Read Grep Edit
disallowed-tools: Write
---
```
Body: "the map defers to the territory" · keep `world/codemap/` shards current (derived-from + verified stamps) · flag doc-gaps to frontier · re-stamp after structural change, mark stale shards UNTRUSTED · report format.

### surgeon (draft)
```yaml
---
name: Surgeon
description: Code-landing executor — runs on explicit 'go' only. Blast-bracket discipline, verify + log. Weak flank: client/CSS.
allowed-tools: Bash Read Edit Write Grep
---
```
Body: pre-landing checklist (connoisseur signed off · investigator swept · suite green · blast mapped · demo) · the five beats as bash · escalations (demo-driven proof / guardrail-first / holy-layer STOP) · the client/CSS weak-flank rules (slow down, read design tokens, no one-off hacks, pair with live-validation).

---

**Next attempt starts here:** apply the SKILL.md fixes (mine), then walk the 5 persona drafts with beef (his fork). Full agent transcript was in the session's task output (ephemeral); the actionable content is preserved above.
