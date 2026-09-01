# method/overview — Methodology + State Snapshot

> Invoked as `ikiro overview` or `ikiro/overview`. Two-section snapshot: what tools/processes/conventions the project has (methodology), and what numbers the project is at (state).

## Why

Sessions resume cold. Without a snapshot, every resumption costs a re-walk of `.ikiro/`. The overview is the daily/weekly heartbeat: one structured read tells the next session what's there, what's moving, what's stuck.

## Output structure

### 1. Methodology surface

**Identity** — `.ikiro/ikiro.md` line count + subsystem ikiro.md presence per container (typology, paladin, runtime, registry, kajuit, ghost, dapper; flag missing).

**Methods** — bullet list from root `.ikiro/ikiro.md ## methods` plus any inline-defined method recipes.

**Traits + ledger profiles** — registry from root ikiro.md `## traits`. Note any new entries since last overview.

**Totems** — [[totems]] in `self/`; the `totems/` directory was cut (its one 4-quadrant file folded away).

**Skills** — files / dirs under `.ikiro/skills/`. Flag any that aren't wired (symlink missing in `.claude/skills/`).

**Anti-rationalization patterns** — count of items in root ikiro.md `### anti-rationalization`.

### 2. State numbers

**Quests by status** — parse `^#+STATUS:` lines across `.ikiro/quests/*.quest.org` and subsystem quests:

| Status        | Count | Notes |
|---------------|-------|-------|
| IMPLEMENTING / ACTIVE | n | … |
| IMPLEMENTED (verification pending) | n | … |
| DESIGN        | n | … |
| PROPOSAL      | n | … |
| DONE          | n | flag any >7d still in `.ikiro/quests/` (should be in `bak/`) |
| SUPERSEDED    | n | flag any not yet in `bak/` |
| archived      | n | files in `.ikiro/bak/` |

**Code surface** (LOC by container, JS+Svelte; tests separated):

| Container | impl LOC | test LOC | ratio |
|-----------|---------:|---------:|------:|
| typology  | …        | …        | …     |
| paladin   | …        | …        | …     |
| runtime   | …        | …        | …     |
| registry  | …        | …        | …     |
| kajuit    | …        | …        | …     |
| ghost     | …        | …        | …     |
| dapper    | …        | …        | …     |

**Rate of change (last 7 / 30 days)** — via `jj log` read-only:
- commits in window
- files touched
- top-N changed paths
- top-N changed containers

**Quality / drift signals**:
- aggregated open-follow-up count (zettelkasten "Open follow-ups (aggregated)")
- callout count (zettelkasten `### YYYY-MM-DD` retard entries, total + last 7d)
- DESIGN quests untouched >30d (candidates for archive or revive)
- DONE quests not yet migrated to bak/
- subsystem `.ikiro/ikiro.md` presence (missing = gap)
- tests in `tests/quest/` staging dir (candidates for flat promotion)

### 3. Forward look (optional, short)

- in-flight uncommitted work — `jj st` summary (counts, not full diff)
- staged-but-not-promoted artifacts (e.g. `.harvest/`, `tests/quest/`)
- biggest signal: one-sentence "what stands out" — what's the dominant thing right now (a stuck quest, a drift cluster, a missing ikiro)

## Data sources (read-only)

| Data | Command |
|------|---------|
| Quest statuses | `grep -H "^#+STATUS" .ikiro/quests/*.quest.org` |
| Subsystem quests | `find subsystems systems registry -name "*.quest.org" -not -path "*/bak/*"` |
| LOC by container | `find <container> -name "*.js" -o -name "*.svelte" \| xargs wc -l \| tail -1` |
| Test files | `find <container> -name "*.test.js" \| wc -l` |
| Rate of change | `jj log -r 'trunk()..@ | @..trunk() | trunk()' --no-graph --limit 50` (read-only) |
| Memory files | `ls ~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory/*.md \| wc -l` |
| Zettelkasten | `wc -l .ikiro/zettelkasten.md` + `grep -c "^### 20" .ikiro/zettelkasten.md` |
| Subsystem ikiro.md presence | `find subsystems systems registry -name ikiro.md -o -name ikiro.md` |

Every data source above is read-only. **No mutations.** No jj graph ops.

## Invocation

When beef says `ikiro overview` / `ikiro/overview`:
1. Run data-source commands in parallel.
2. Produce the report following sections 1 → 2 → 3.
3. End with the one-sentence "biggest signal" line.
4. No trailing questions or follow-up offers (per `final judgement / communication`).

## Cadence

- After every major quest landing (DONE flip)
- Weekly during active feature work
- Before deciding the next quest to start
- After a `jj op restore` or any recovery operation (verify nothing dropped)

## Lite variant

For quick checks (sub-30s): just quest-status counts + 7d commit count + open-follow-up total. Skip LOC and rate-of-change tables.
