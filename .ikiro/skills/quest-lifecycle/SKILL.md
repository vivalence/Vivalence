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

0. **Organ gate before any `mv` into `done/`**: (a) every `#+marker_qa` carries a settled verdict — a `pending` on a quest headed to done/ is drift, a `broken` is a Callouts entry (methods/quest.md ## QA); (b) the `* release` organ's entries are LIFTED verbatim into `release.md ## unreleased` under their surface sections (`## release` below) — a quest with unlifted release lines is not done. `discarded/` needs neither.
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

## release — the changelog (how the interfaces actually changed)

beef, verbatim (09-01): *"its time that we start thinking in changelogs. how did the interfaces actually change? something that goes into a release.md. invent this backwards. first find the best format for release.md's changelogs, then define a single change format, then embedd this in the quest format template."*

**Format verdict** (survey, not tour): Keep a Changelog's human-first reverse-chron + `## unreleased` accumulator beats Conventional-Commits-derived logs (commits are not changes — a commit-generated log records the work, not the interface); Rust/Go release notes add the twist that carries: group by SURFACE, lead with migration. Vivalence adaptation: the repo ships flag-days, never deprecation windows (*"entirely. no dual read."*) — `Deprecated` dies, every breaking entry carries `migrate:` instead.

**The file** — repo root `release.md`, reverse-chron; `## unreleased` accumulates, a release cut renames it to `## <version> — <date>` and opens a fresh one (versioning is beef's). Surface sections inside a release, present only when non-empty, fixed order:

```markdown
# release

## unreleased

### cli        (viva verbs, flags, chaining)
### route      (aperture paths, packet/event shapes)
### api        (exported symbols — paladin.*, typology v.*, daemon.*, trait surfaces)
### entity     (schema: entities, columns, traits-enum, manifests)
### env        (variables, strata, files read)
### other      (docs surfaces, install, anything interfaced but unlisted)
```

**The single change format** — one line, one interface delta:

```
- <verb> `<surface>` — <what a consumer notices, before → after where it fits> · migrate: <action | none> ⟨<quest-or-compact>⟩
```

- verb ∈ `added · changed · renamed · removed · fixed`, nothing else.
- surface = the exact thing a consumer types or imports (`viva instance/use`, `VIVA_INSTANCE_MOUNT`, `paladin.assign`, `POST /daemon/<d>/entities/mode/update`); `renamed` puts both names in the slot: `` `old` → `new` ``.
- `migrate:` is REAL on every breaking entry — `none` only when additive; a breaking line without one is unfinished.
- ⟨provenance⟩ = quest slug (compact slug for questless work); the WHY lives there, never here.
- One change = one line — a flag-day rename across five homes is still ONE line (the surface is the name, not the homes).

**The pipeline**: quest accrues entries in its `* release` organ (methods/quest.md) → sunset lifts them verbatim into `release.md ## unreleased` (organ gate 0 above) → beef cuts releases. Reflection sweeps `#+marker_qa` beside it — a `broken` on a released surface is a Callouts entry.

## Standing laws

- `mXX-*` numbering is beef's ledger — never create, number, or extend one (ledger 08-17, `family: ikiro-namespace`). Revived quests keep their exact original names.
- The quest SPEC (milestones, tangles, testing assessment, blast table) lives in `methods/quest.md` — this skill owns only the lifecycle.
- `index.md` is derived — regenerate at every sunset/revival; a quest not in the index is unreachable the way 32 of 35 compacts once were.
