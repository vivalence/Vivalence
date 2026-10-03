# .ikiro — the agent's persisted self
<!-- writer: agent · limit: 6000 chars -->

ikiro (生きろ, "live!") is the Claude Code agent that works on vivalence, split across files so it survives between sessions. Everything under this directory is the agent's to edit; product code is gated behind an explicit `go`. The driver's guide is [`manual.md`](manual.md).

Every live file carries `limit: N chars`. A write past it warns through `hooks/cap-guard.sh` and lands; the file is consolidated in the same turn. Nothing is evicted into a second place.

## layout

```
.ikiro/
  ikiro.md          the KERNEL — read at wake: principle · VCS read-only · gates · route · comms
  self.md           who it is · its laws · beef's lexicon (path-loaded on quests, skills, *.viva.js)
  connoisseur.md    code doctrine (path-loaded on product code)
  manual.md         how to drive the agent (beef-facing)
  world/            map.md (the repo at L2) · ledger.md (~/.viva) · frontier.md (the live edge, rewritten at every fold) · codemap/<container>.md (path-gated traps, via .claude/rules)
  quests/           design specs — root = live · roadmap/ · benched/ · done/ · discarded/ · index.md
  reference/        research dumps a live quest points at
  skills/           12 SKILL.md, wired via .claude/skills — process by verb, recipes by noun
  hooks/            the guards (PreToolUse · PreCompact) · exercise.sh proves them
  methods/          cap.py (the caps) · corpus.py (FTS5 recall) · tangle.py · apply-diffs.py (quest tangling)
  known-issues.org  OPEN defects only · release.md  the interface changelog
```

The folded past — compacts, zettelkasten, evals, the skills ledger — sits at `~/.viva/bak/ikiro/corpus-20261005/`, indexed by `methods/corpus.py` together with this tree.

## operating flow

```
wake      ikiro.md → world/frontier.md → the codemap shard for the files at hand → code
work      beef schemes and rules; the agent proposes; `go` lands ONE item, bracketed in tests
record    decisions → quests/ · defects that outlive the task → known-issues.org · interface changes → release.md
correct   `retard` · `i dont understand X` → ≤2 lines into the skill that should have fired, same turn; twice broken → a hook
fold      frontier.md rewritten whole · each live quest's * handoff · corrections landed · moved names grepped to zero · cap.py clean
```

## skills — what fires when

| when | skill |
|---|---|
| before · around · after a code edit (pre-flight, blast bracket, tests, critical pass) | `change` |
| a bug, hang, storm, wrong shape; a client change needing eyes on the DOM; a shelf copy out of sync | `debug` |
| a contested name · landing a settled rename | `name` |
| writing · closing · reviving a quest · the changelog · a defect outside scope | `quest` |
| folding a session · a correction · another session on the same tree | `fold` |
| a new mode · domain · package · topology/topography | `mode` · `domain` · `package` · `topography` |
| a designer's comp or `.dc.html` | `design` |
| a README or fresh-machine walk · deleting under `~/.viva` | `readme` |
| prod data locally · DBeaver connections | `ops` |

## instruments

| command | prints |
|---|---|
| `python3 .ikiro/methods/cap.py [--all]` | OVER · NOLIMIT rows, exit 1 on any |
| `python3 .ikiro/methods/corpus.py "<query>"` | FTS5 hits as path:line + snippet over the self and the backup |
| `bash .ikiro/hooks/exercise.sh` | PASS/FAIL per guard case |
| `python3 .ikiro/methods/tangle.py <quest> --diff` | a quest's `:tangle` blocks against the tree |
