---
name: debugging
description: >-
  Trace a defect in vivalence the way sessions actually cracked them — reproduce before theorizing, pin the
  environment before the mechanism, isolate in a capped subprocess on a copy, run a control, and read only the
  taps that pay (beef's own paste, a probe script, the doctors as a pair, read-only sqlite, lsof and docker ps
  first). Use for any bug, hang, storm, wrong shape, or "it doesn't load".
when_to_use: >-
  "why does this" · "it hangs" · "it doesn't load" · "nothing appears" · "storm" · "401/500" · "debug this" ·
  a screenshot with a complaint · "still." after a fix · "collapsed" · "garbage" · beef pastes a log or
  console · "make sure to not cause the issue in an uncontrolled way" · a daemon dies silently.
---

# debugging — reproduce · pin · isolate · control · then code

Canon: `superpowers:systematic-debugging` (the general discipline) · the path-matched `world/codemap/` shard (per-container taps) · `feedback_reproduce_before_proposing_infra_fixes` · `feedback_pin_environment_before_mechanism` · [[live-validation]] (anima, the browser half). Measured over 191 compacts: what actually cracked sessions, in this order.

## The order

1. **read beef's paste first.** His pasted log / console / screenshot is the largest single source of decisive evidence in the corpus (9+ folds) — a second paste killed a floated theory more than once (*"F5 teardown"*, not `--watch`). *"you have chrome"* — measure the DOM, don't reason from the screenshot. Name a screenshot's SOURCE before explaining it — the comp, my harness or his anima — from a visible marker; none → ask (twice on 09-23, a comp read as the mode).
2. **reproduce before theorizing.** *"A recorded diagnosis is not a settled diagnosis."* A theory recorded in a quest as fact died in one run — then UNWRITE the wrong record. Raw SSE replay, a DB query, one browser call turned "no errors appear" into packets.
3. **pin the environment before the mechanism.** Which artifact is served — checkout or shelf ([[shelf-sync]])? Which instance is effective (`viva instance/doctor` → `mount`)? Which port answers (`lsof -i :PORT` ALL processes + `docker ps` FIRST — a sibling container published both ports and two hypotheses died before `lsof`)? Is a repo-root `.env` shadowing an os-level var (cwd stratum)? Is the frame docker or laptop (*"no. idiot. i planning a docker deploy"*)? **Which CLIENT** — right in my harness and wrong on his screen ⇒ ask WHICH BROWSER first and suspect its HTTP cache before code (09-23: Firefox held cargo's pre-fix `immutable` GLBs; a correct theory was retracted against the wrong generation of files, three turns lost until */"in chrome all good. firefox issue"/*). A visual defect is measured in HIS tab — a console snippet he runs — before any theory from outside.
4. **isolate.** Binary search the boot (stage → `population.processes` → lighthouse). Minimal probe: `deno eval` / a probe script at the WORKSPACE root (else `@vivalence/paladin` does not resolve). Anything that could loop or eat memory runs in a **capped subprocess on a `cp` of the db** — `--max-old-space-size=1024`, an RSS watchdog, a 90 s timeout; beef: *"make sure to not cause the issue in an uncontrolled way."*
5. **control.** Two runs, one variable (*"a concurrent build is safe, only the `rm` kills"*). A listener proves nothing unless it is open when the event lands.
6. **then code** — and bracket it ([[blast-bracket]]). Three symptom-fixes for one screen is one structural miss (`hotfix-cascade`).

## The taps — by measured frequency (files of 191)

| tap | n | how |
|---|---|---|
| probe script / capped subprocess | 36 | scratchpad `.js`, `deno run -A --config …/deno.jsonc`, workspace root |
| snapshot captures read as data | 40 | `tests/snapshots/*.json` — two shapes side by side that nobody compared |
| `viva instance/doctor --json` + `viva ledger/doctor` — THE PAIR | 14 | *"dont forget the pair"*. `ledger/doctor` is a MUTATING read (reaps dead-pid sessions, prunes locks); `instance/doctor` prints `"ledger": null` when nothing is inherited — not a contradiction (`ghost/trajectories/instance/doctor.js:80`) |
| read-only sqlite | 11 | `sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"` — a bare `sqlite3 <path>` CREATES on miss |
| Chrome / live DOM | 11 | → [[live-validation]]; a hidden tab never fires rAF; CDP cannot native-drag |
| `curl` | 9 | `/status` at three tiers (each returns `status.reflection`) · `/metadata/*` on a mode mount (`/metadata/aperture` = what a client wires) |
| bruno | 8 | `testament/_bruno/` |
| `lsof -i :PORT` · `docker ps` | 6 | FIRST, before any port theory — *"A `grep deno` over `lsof` hides the container"* |
| foreground boot | 3 | `deno run -A systems/runtime/run.js` — a bad relative import kills the daemon SILENTLY under the task runner |
| `git show HEAD:<file>` into a scratch copy | 3 | prove a red pre-existing without a VCS mutation |
| browser performance profile | 2 | `samples.threadCPUDelta` (µs) is the honest measure; `eventDelay` (ms) is what beef complained about |
| container registry API | 1 | `docker manifest inspect` · `buildx imagetools` with the local daemon down |

**Not taps** (measured): `~/.viva/logs/<slug>/spans.jsonl` — the writer exists (`paladin/prototypes/ledger/log.js`), the consumer is commented out (`systems/ghost/mod.js:25`), the file measured EMPTY; anima `logger.channel` — one use in 191. Proposing either sends a session to a dead instrument.

## Shapes that recur

- `thread/create` pending forever ⇒ a buffer-bundle esbuild error — runtime log, not console.
- a page a version behind ⇒ the shelf, or a stale mode bundle (restart `runtime/run`; dev re-bundles at `/metadata/application` → reload).
- a 401 + a 500 storm ⇒ an `$effect` that writes the `$state` it reads (`render-the-view`, MECHANISM axis) — `untrack` the listener, mount it to prove it.
- "not found" on a reconstructed id ⇒ a bad id long before an auth problem.
- a zero from a self-scoped grep ⇒ grep the namespace the identity LIVES in (a filename-addressed thing needs a filename grep).
- 40 parallel requests on a fresh identity ⇒ 1×401, 39×200 — a race, not a policy.

## Report

First line: the runnable command that reproduces it (`diagnostic-theater`). Then `file:line` of HIS code and of the line responsible, diff + caret, the chain after as a diagram. Silent fails are the TOP finding (`values-misranked`). What outlives the fix → [[known-issues]].
