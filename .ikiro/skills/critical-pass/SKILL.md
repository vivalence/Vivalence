---
name: critical-pass
description: >-
  Harden a staged quest, patch or package tree against HEAD before beef applies it — base facts, a scratchpad
  sandbox never the worktree, baseline before patch, grep every absence claim, read the consumer side of every
  new seam, scope against the artifact's own words, and record the delta in the quest. Use on "critical pass",
  "another pass", or before a quest is called tangleable.
when_to_use: >-
  "critical pass" · "sanity pass" · "do another pass" · "anything not integrated? anything improvable?" ·
  "argue against it, find the weak spots" · "is the quest really complete?" · before `#+status` says tangleable ·
  before beef applies an attached patch or package tree.
---

# critical-pass — make the artifact TRUE against HEAD without touching the gated tree

Canon: `methods/critical-pass.md` (the ten steps, verbatim, with the m32/m33 receipts) · `methods/quest.md ## QA-before-blast`. Measured: 34 of 129 quests reference the pass; the m11 pass caught three build-breakers before a line was written; eleven faults sat in a quest already marked tangleable. beef: *"do a ciritcal pass against that quest. improve it. fix anything in need of fixing"* · *"argue against it, find the weak spots"* — he is falsifying his own design through me; the review is WANTED, not performative.

## The ten steps — one todo each (bodies in `methods/critical-pass.md`)

1. **base facts** — which commit the artifact claims (`git cat-file -t`, `git merge-base`, `git diff --stat <claimed> HEAD -- <touched>`); does it dry-apply (`patch -p1 --dry-run -N` — never `git apply`, the guard is right).
2. **sandbox, not worktree** — `rsync` the containers into the scratchpad (exclude `node_modules .git .jj`, anima `static/ build/`, corpora freight, `*.db`), symlink `node_modules`, run suites from the copy's own `deno.jsonc`. ~250 MB, two minutes. `ps aux | grep deno` — beef's watchers keep running. Trap: `~/.viva/.env` pins `VIVA_REPOSITORY_MOUNT` at the ledger stratum, so a sandbox run can read the REAL checkout.
3. **baseline before patch** — every reachable suite unpatched, then patched; numbers side by side. The artifact's own "green" is the author's claim.
4. **grep every absence claim** — *"no X exists"*, *"Y is dead"*, *"nobody parses Z"*: the shape that rots fastest and is cheapest to check. Both m32 and m33 carried one; both were false.
5. **read the CONSUMER side of every new seam** — tests pass by construction; defects live where the artifact meets code it did not write. Find the mechanism behind every "by default" and compute it.
6. **compare against ≥1 live sibling** — the sibling is the oracle; what it does and the artifact fabricates is a fix; what the artifact adds beyond it is a flag.
7. **scope against the artifact's own words** — tested completeness makes creep look earned. Park to `quests/<name>/deferred/`, never delete.
8. **wiring sections are the least trustworthy part** — re-derive from `~/.viva` + docs every time (dead file names, wrong env var names, verbs already mounted).
9. **fix in the sandbox, re-run, REGENERATE** — fresh pristine base → fix → `git diff --no-index --src-prefix=a/ --dst-prefix=b/ base sandbox` → whitelist to the intended file set (beef edits live) → dry-apply on the real tree. Never hand-edit a patch; a `--- a/` slice swallows `/dev/null` new-file hunks; a removed snapshot line can carry an old secret.
10. **the quest carries the delta** — status rewritten with real numbers; a `* critical pass` section (method · verification table · held · fixed · parked · design↔build drift · stale text · residue); stale sentences annotated inline `/(pass: …)/`, never rewritten — build reports are verbatim records.

## What it is not

Not a review that ends in prose. Not `git apply`. Not "tests are green so the claims are true". Not applying the artifact — that is beef's `go`, per op; *"nooooooooot apply. just work them into the quest format"*. Not a scope-wide sweep — the pass stays on the artifact's touched set ([[scope-inflation]]).
