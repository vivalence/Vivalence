---
name: debug
description: >-
  Trace a defect — reproduce, pin the environment, isolate, control, then code; validate a client change on a
  real DOM; sync the shelf copy the runtime actually bundles. Any bug, hang, storm, wrong shape.
when_to_use: >-
  "why does this" · "it hangs" · "it doesn't load" · "nothing appears" · "storm" · "401/500" · "debug this" · a
  screenshot with a complaint · "still." after a fix · "collapsed" · "garbage" · beef pastes a log or console ·
  "make sure to not cause the issue in an uncontrolled way" · a daemon dies silently · "is it wired?" · "check it
  in the browser" · "the dock isn't showing" · "thread/create hangs" · after any buffer-view or client change that
  needs eyes on the DOM · walking a served mode bundle without anima · "why didn't my fix show up?" · a served
  page contradicts a passing check · after `viva instance/create` · editing any mode under a package that has
  `~/.viva/instances/<slug>/` · before any claim about a rendered view.
---
<!-- limit: 5000 chars -->
# debug — "it hangs" · "still." · "is it wired?": reproduce · pin · isolate · control · code

## the order

1. **read beef's paste first** — his log, console, screenshot is the decisive evidence. Name a screenshot's SOURCE (comp · my harness · his anima) from a visible marker; none → ask.
2. **reproduce before theorizing** — /"A recorded diagnosis is not a settled diagnosis."/ A wrong record gets UNWRITTEN.
3. **pin the environment** — checkout or shelf (below)? `viva instance/doctor --json` → `mount`. `lsof -i :PORT` ALL processes + `docker ps` FIRST. A repo-root `.env` shadowing an os var? Docker or laptop? **Which client** — right here, wrong on his screen ⇒ ask WHICH BROWSER, suspect its HTTP cache before code: /"in chrome all good. firefox issue"/.
4. **isolate** — binary-search the boot. Probe scripts at the WORKSPACE root. Anything that could loop runs capped on a `cp` of the db: `--max-old-space-size=1024`, RSS watchdog, 90 s timeout.
5. **control** — two runs, one variable.
6. **then code** — bracketed (skill `change`). Three symptom-fixes for one screen is one structural miss.

## the taps

- `viva instance/doctor --json` + `viva ledger/doctor` — /"dont forget the pair"/; `ledger/doctor` MUTATES (reaps sessions, prunes locks).
- read-only sqlite — `sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"`; a bare path CREATES on miss.
- `tests/snapshots/*.json` read as data, two shapes side by side.
- `curl` `/status` · `/metadata/aperture`.
- foreground boot `deno run -A systems/runtime/run.js` — a bad import dies SILENTLY under the task runner.
- `git show HEAD:<file>` into a scratch copy.

## shapes that recur

- `thread/create` pending ⇒ a buffer-bundle esbuild error — runtime log, not console.
- a page a version behind ⇒ the shelf, or a cached mode bundle.
- a 401 + 500 storm ⇒ an `$effect` writing the `$state` it reads — `untrack`, mount to prove.
- 40 parallel requests, 1×401 39×200 ⇒ a race, not a policy.

## the browser — "did my change land?"

1. buffer-VIEW change → restart `deno task runtime/run`; HMR covers the app layer only.
2. batch edits, reload ONCE.
3. assert on the DOM via `javascript_tool`, read back with `read_console_messages`:
   ```js
   document.querySelector('[data-testid="dock"]').click();
   console.log(document.querySelector(".thread-view")?.textContent);
   ```
   Stop coordinate-clicking after 2–3 misses.
4. still wrong → runtime log before code.

Never trigger `alert`/`confirm` — the extension goes dead. Scoped `> *` styles do not cross a child's root. A hidden tab never fires rAF — measure after a screenshot. CDP cannot native-drag — dispatch `DragEvent`. Walk a bundle alone: `paladin.bundler(<entry>).bundle()` + a stub row. Never verify into beef's session — own tab, closed after.

## the shelf — the runtime bundles `~/.viva/instances/<slug>/`, a copy no verb syncs

/"still"/ after a reported fix ⇒ check here first.

```sh
S=~/.viva/registry/<pkg>/modes/<type>/<slug>
T=~/.viva/instances/<instance>/<the same relative path>
diff -q "$S/<file>" "$T/<file>"
```

1. capture to `~/.viva/bak/instances/<slug>-<YYYYMMDD>/` (skill `readme`, capture before delete).
2. `cp` touched files by name; never `rsync --delete`; never overwrite the shelf `instance.viva.js` blind.
3. verify on the SHELF — in `VIVA_SYSTEM_MODE=DEVELOPMENT` a reload re-bundles at `/metadata/application`; a buffer view needs a restart.
4. say /"verified on the shelf bundle"/, never "verified".

REJECTED: verified the checkout, served the shelf · rsynced a shelf while the runtime served the repo.

## report

First line: the command that reproduces it. Then HIS `file:line` and the responsible `file:line`, diff + caret. Silent fails rank first. What outlives the fix → skill `quest` (known issues).
