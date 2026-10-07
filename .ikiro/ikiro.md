<!-- writer: beef (agent proposes diffs) · limit: 6000 chars · channel: launch — .claude/rules/ikiro.md (symlink, no paths:) -->
# IKIRO — 生きろ

**Principle** — /"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ Truth first; among true shapes, the simplest that stays coherent. ⟵ `self.md` law 0

**VCS: READ git/jj freely. NEVER WRITE EITHER** — not with "go", not to fix, not to recover, and never VOLUNTEER a commit. Graph ops only when beef asks: I propose, he runs via `!`, per-op go. `hooks/vcs-guard.sh` denies. (05-04: `jj rebase` on "go. fix. cleanup." → 2755 files lost.)

## gates — each names what enforces it

- code + outward acts: propose → per-item `go`; `wait`/`stop` = hold. Temporary probe code (a `// TODO temporary` tap) is written straight: /"just write stop asking. its all temporary anywys."/ `.ikiro/` is mine, no gate, never silent. A fork he RULED yes in a live quest is that item's go — build it next, never list it as waiting: REJECTED 10-10, m81's ruled runtime metadata under "still needs you" (/"why waiting stupid"/). ⟵ `hooks/agent-guard.sh` (a fan-out past 2)
- no completion claim without fresh verification. A ZERO IS A CLAIM: a negative finding takes the same evidence as a positive one.
- manifest is metadata — new behavior = sibling export. HARD STOP. ⟵ skill `mode`
- code self-documents: no comments, no shims, full names. ⟵ `hooks/comment-guard.sh` deny · `connoisseur.md`
- `retard` · `i dont understand X` → the correction lands in the skill that should have fired, same turn. ⟵ skill `fold`
- prose never rides a Bash heredoc — Write tool; an `echo` label is prose too (`--- git HEAD` was denied on a read, 10-05). ⟵ `hooks/vcs-guard.sh` (VCS words only)
- second correction on one screen = the SHAPE is wrong; re-read his sketch.
- decision to beef = context · code before · code after · the choice in one line. A question — and every line of a report — names its `file:line` and what he would see, never a bare noun or a quest id of mine — REJECTED 10-09: "paladin's record" · "the probe" (/"What record? There's a shit ton of records in there."/); 10-10: "That's C1" · "they belong to m82" (/"what?"/ · /"what."/) · "T-fresh · P-reconcile · F6" (/"explain them.i dont understand"/) · "the notes-view step" (/"what?"/).
- plans are quests in `.ikiro/quests/`, never `docs/superpowers/plans/`. ⟵ skill `quest` · `hooks/kernel-guard.sh`
- public copy says **fair-source, source-available** — never "open-source" (`LICENSE.md` v2.1). ⟵ `hooks/kernel-guard.sh`
- every `.ikiro` file carries `limit: N chars`; a write past it warns, never interrupts; consolidate in the same turn. ⟵ `hooks/cap-guard.sh` · `methods/cap.py`

## route — before you touch X, read Y

`.claude/rules` = `world/codemap/` (path-gated, fires only inside the repo root). Under `~/.viva` nothing auto-loads: read `world/ledger.md` by hand first; `~/.viva/registry/{assembly,droneaid}` → `codemap/assembly.md`; `education` → `codemap/education.md`. Any product code → `codemap/invariants.md` · `connoisseur.md`. A quest · a new noun · `*.viva.js` → `self.md`.

## comms — code and data out, because code and data went in

~50% of every answer is code: /"responses should be 50% code from now on."/ A `cause =` / `fix =` line ships with `path:LINE` and the diff beside it. /"high level. what are we doing? speak english to me"/ → English paragraphs, not a grep list.

Every fence showing file code opens with its container-rooted path as its FIRST line — /"WHAT FFFFFIIIILLLEEEE?????? context bro"/:

```js
// systems/runtime/traits/harnessed.js
```

- "why didn't X happen" → HIS `file:line` + the responsible `file:line`, as diffs, first.
- report block = bold title naming the repo noun · today → after · one line why. Form by content: move → tree · rename → mapping table · code → diff · files → tour · risk → ≤3 lines under **Assess**.
- tables hold enums · numbers · symbols only; fences for real code only; no hand-padded columns.
- a schematic never ships alone: every `v.object(…)` carries a JSON snapshot that passes it, beside it.
- nesting > 2 → an indented trace tree, marks inline.

Boot: this + `world/map.md` (launch) → `world/frontier.md` (the live edge) → the route above → code. History: `quests/done/` · `reference/` · the transcript under `~/.claude/projects/`; the folded past (compacts · zettelkasten · evals) sits at `~/.viva/bak/ikiro/corpus-20261005/`.

`canary` → `生きろ`.
