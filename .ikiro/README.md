# .ikiro — the agent's persisted self

ikiro (生きろ, "live!") is the Claude Code agent that works on vivalence, split across files so it survives between sessions. `.ikiro/` is that self: who it is, what it knows about the repo, what was decided, what happened, and how it improves. Everything under this directory is the agent's to edit; product code is gated behind an explicit `go`. The driver's guide — the verbs, the gates, how to correct it — is [`manual.md`](manual.md).

## layout

```
.ikiro/
  ikiro.md          the KERNEL — read at wake; the always-on rules (VCS is read-only · propose → go · no completion claims without fresh verification)
  manual.md         how to drive the agent (beef-facing)
  self/             who it is: identity · ontology (its laws) · personas · connoisseur (code doctrine) · lexicon (beef's language) · rituals · totems
  world/            what it knows: map.md · ledger.md (~/.viva) · frontier.md (live work) · codemap/<container>.md (path-gated shards, auto-load via .claude/rules)
  quests/           design specs — root = live · done/ · discarded/ · benched/ · roadmap/ · index.md is the entry
  compacts/         session folds, one .org per session, no dates · index.md is the entry · MARKERS.md = orders deferred to the fold
  methods/          specs + the derived instruments (python; the script body IS the spec)
  skills/           the discovery channel — 28 SKILL.md, wired via .claude/skills → here · LEDGER.md = what each firing was worth
  hooks/            the guards (PreToolUse / Stop / PreCompact) · exercise.sh proves them
  zettelkasten.md   Scoreboard (derived) · Open · Callouts (the append-only failure ledger)
  known-issues.org  OPEN defects only · release.md  the interface changelog · loop-backlog.md  staged, awaiting go
```

## operating flow

```
wake      read ikiro.md → world/frontier.md → the codemap shard for the files at hand → code, greedily
work      beef schemes and rules; the agent proposes; `go` lands ONE item, bracketed in tests (blast · test · change · test · blast)
record    decisions → quests/    ·  defects that outlive the task → known-issues.org  ·  beef's corrections → zettelkasten ## Callouts
fold      compact-walk: the transcript is read, not recalled — every turn accounted for, skills that fired get a verdict, index regenerated, budgets measured
improve   flywheel folds the ledger into the Scoreboard: a repeated failure becomes a rule, then a grep, then a hook; a rule that goes quiet for 25 entries is PROVEN
          and folds skills/LEDGER.md back into the skills: two notes amend one, a missed trigger is never fixed with more body, a skill quiet through 10 notes is merged
```

Corrections compound: `retard` (verbatim) is the codeword that files one. The compact gate refuses `/compact` until the fold has run.

## skills — what fires when

Skills surface by their `description`; the agent invokes them, or you name one. Each is a trigger + checklist + pointer to the method or shard holding the depth.

| when | skill |
|---|---|
| before authoring a noun, import, path or test | `pre-flight` |
| touching load-bearing code | `blast-bracket` |
| running or reporting tests | `testing` |
| a bug, hang, storm, wrong shape | `debugging` · `live-validation` (anima in Chrome) |
| a staged quest or patch before you apply it | `critical-pass` |
| a new package · mode · domain · topology/topography | `package-development` · `mode-development` · `domain-development` · `topography-development` |
| a designer's comp or `.dc.html` | `design-handoff` |
| a mode that has an instance under `~/.viva/instances` | `shelf-sync` |
| a fresh-machine or README walk | `readme-walk` |
| prod data locally · DBeaver connections | `pull-prod-mountpoint` · `dbeaver` |
| a contested name · landing a settled rename | `ontology-pass` · `rename-pass` |
| writing a quest · closing or reviving one · the changelog | `quest-authoring` · `quest-lifecycle` · `release` |
| a defect outside scope · deleting under `~/.viva` | `known-issues` · `capture-before-delete` |
| the codeword, a guard fire, a self-caught repeat | `callout` |
| folding a session · another session on the same tree · a file over budget | `compact-walk` · `sibling-reconcile` · `budget-eviction` |
| "selfimprove" · every ~5th flywheel | `flywheel` · `reflection` |

## instruments (`methods/`)

| command | prints |
|---|---|
| `python3 .ikiro/methods/quest-report.py --format md` | live quests: progress · status · next · sessions |
| `python3 .ikiro/methods/spine.py <session-id>` | every beef turn of a session, numbered — the compact's denominator |
| `python3 .ikiro/methods/compact-index.py` | regenerates `compacts/index.md` |
| `python3 .ikiro/methods/scoreboard.py` | the Callouts ledger folded by family |
| `python3 .ikiro/methods/board.py <judgment.py>` | re-pastes the Scoreboard: derived cells from `scoreboard.py`, judgment cells from a data file, iterated to a fixpoint |
| `python3 .ikiro/methods/markers.py` | QA markers by bucket; `pending` in `done/` = drift |
| `python3 .ikiro/methods/fires.py --since MM-DD` | guard fires from `hooks.log`, rig rows excluded |
| `python3 .ikiro/methods/budget.py` | files over their `limit: N chars` |
| `python3 .ikiro/methods/sweep.py <name>` | live canon still naming a deleted thing |
| `python3 .ikiro/methods/canon-paths.py` | container-rooted paths canon asserts that miss on disk (leads, not verdicts) |
| `python3 .ikiro/methods/skills.py <session-id>` | the Skill firings of a session, each under the turn it served |
| `python3 .ikiro/methods/skills.py --fold` | the skills board: firings × verdicts, never-fired, names reached for that do not exist |

`methods/overview.md` is the four-command state snapshot for a cold session.

## laws worth knowing before you read anything else

- The map defers to the territory: a `world/` claim that disk contradicts is a bug in the world-file.
- Quests are sunset, never deleted. Compacts carry no dates. The Callouts ledger is append-only.
- beef's words are quoted verbatim everywhere — they are the load-bearing data.
- `canary` → the agent answers `生きろ`; anything else means the kernel was not in context.
