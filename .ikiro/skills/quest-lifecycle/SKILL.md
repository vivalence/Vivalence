---
name: quest-lifecycle
description: Quests are sunset, never deleted — move them to done/ or discarded/, keep the index true, revive the dead from VCS with read-only commands.
when_to_use: closing a quest (landed or abandoned) · "sunset this quest" · "revive <quest>" · any urge to rm/delete a quest file · the quest inventory looks incoherent.
---

# quest-lifecycle — sunset, revive, index

beef: *"quests get sunset, rarely deleted."* A quest is a decision-trail; deleting one deletes the reasoning. The 20% cut killed ~150 files and the reasoning went with them — revival exists because deletion was the wrong verb.

## The structure

```
.ikiro/quests/
  <live>.org            in flight — the ONLY things at root
  done/                 landed AND verified (pre-DONE gate passed: suites green, changelog written)
  discarded/            sunset without landing — superseded, abandoned, overtaken by a redesign
  bak/                  beef's recovery surface — NEVER touched, never reorganized (backup-during-migration law)
  index.md              one line per quest, every bucket — the entry point, like compacts/index.md
```

## Sunset (closing a quest)

Run `python3 .ikiro/methods/quest-report.py` first: rows with `next: sunset` are the candidates; `control` means QA markers are still pending, `lift` means release lines are unlifted, `commit` is beef's. A quest whose `sessions` column shows a live sibling is being worked — do not move it. Header keys `#+phase` · `#+progress` · `#+next` are stamped `(derived)` by the report; beef's own value without the suffix wins (totem: `.ikiro/self/totems.md ## quest report`).

0. **Organ gate before any `mv` into `done/`**: (a) every `#+marker_qa` carries a settled verdict — a `pending` on a quest headed to done/ is drift, a `broken` is a Callouts entry (methods/quest.md ## QA); (b) the `* release` organ's entries are LIFTED verbatim into `release.md ## unreleased` under their surface sections — format, file and cut live in the `release` skill (`skills/release/SKILL.md`; release ≠ quest — beef) — a quest with unlifted release lines is not done. `discarded/` needs neither.
1. Landed + verified → `mv` into `done/`. Abandoned/superseded → `mv` into `discarded/`. **Plain `mv` ONLY — never `git mv`** (ledger 06-28; VCS is write-protected).
2. Never edit the quest's content at sunset — where it ends is where it ends; the epitaph (one line: what it was, why it left the root) goes in `index.md`, not the file.
3. Restamp `world/frontier.md` if the quest was listed there; deletion-sweep law applies to the MOVE too: grep live canon for the old path same turn.
4. `rm` on a quest file is forbidden in every mood. Discard = `mv` to `discarded/`.

## Revival (bringing back the deleted)

Zero VCS mutations needed — the whole operation is read-allowlisted:

```
git log --diff-filter=D --name-only --format='COMMIT %h %ad %s' --date=short -- '.ikiro/quests'   # inventory
git show <del-commit>^:<path>                                                                      # content at last-alive rev
```

Write the recovered content to `done/` or `discarded/` by its status AT DELETION (a quest deleted while DONE goes to `done/`; one deleted mid-design goes to `discarded/`). Working-tree `D` entries recover from `HEAD:` the same way. Binary freight (audio, assets) is flagged to beef before revival, never bulk-restored.

## Standing laws

- `mXX-*` numbering is beef's ledger — never create, number, or extend one (ledger 08-17, `family: ikiro-namespace`). Revived quests keep their exact original names.
- The quest SPEC (milestones, tangles, testing assessment, blast table) lives in `methods/quest.md` — this skill owns only the lifecycle.
- `index.md` is derived — regenerate at every sunset/revival; a quest not in the index is unreachable the way 32 of 35 compacts once were.
