---
name: debug
description: >-
  Trace a defect — reproduce, pin the environment, isolate, control, then code; validate a client change on a
  real DOM; sync the shelf copy the runtime bundles.
when_to_use: >-
  "why does this" · "it hangs" · "it doesn't load" · "nothing appears" · "storm" · "401/500" · "debug this" · a
  screenshot with a complaint · "still." after a fix · "collapsed" · "garbage" · beef pastes a log or console ·
  a daemon dies silently · "is it wired?" · "check it in the browser" · any client change
  that needs eyes on the DOM · "why didn't my fix show up?" · a served page contradicts a passing check · editing a
  mode that has a shelf under `~/.viva/instances/<slug>/` · before any claim about a rendered view.
---
<!-- limit: 5000 chars -->
# debug — reproduce · pin · isolate · control · code

## the order

1. **read beef's paste first**; name a screenshot's SOURCE (comp · my harness · his anima) by a marker, none → ask.
2. **reproduce before theorizing** — /"A recorded diagnosis is not a settled diagnosis."/
3. **pin the environment** — checkout or shelf? `lsof -i :PORT` + `docker ps` FIRST. A root `.env` shadowing an os var? **Which client** — wrong only on his screen ⇒ ask WHICH BROWSER, suspect its cache: /"in chrome all good. firefox issue"/; a tty ⇒ `TERM_PROGRAM` of ghost's pid (REJECTED 10-27: Ghostty assumed; iTerm2).
4. **isolate** — binary-search the boot; probes at the WORKSPACE root; a loop runs capped on a `cp` of the db (`--max-old-space-size=1024`, 90 s).
5. **control** — two runs, one variable.
6. **then code** — bracketed (skill `change`); three symptom-fixes on one screen = one structural miss.

## the taps

- `viva instance/doctor --json` (→ `mount`) + `viva ledger/doctor` (/"dont forget the pair"/); `ledger/doctor` MUTATES.
- read-only sqlite — `sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"`; a bare path CREATES on miss.
- `curl` `/status` · `/metadata/aperture`; boot `run.js` in the foreground — a bad import dies SILENTLY under a task.
- a walk or probe tears down in a `finally`: SIGTERM its own pid, never SIGKILL (orphans the runtime) nor `ps | grep`.

## shapes that recur

- `thread/create` pending ⇒ a buffer-bundle esbuild error — runtime log, not console.
- a page a version behind ⇒ the shelf or a cached mode bundle · 1×401 among 39×200 ⇒ a race, not a policy.
- blank `:1794`, no console error ⇒ `client.js` faulted untapped (known issue `anima-entry-faults-unprinted`).
- a 401 + 500 storm ⇒ an `$effect` writing the `$state` it reads — `untrack`, mount to prove.
- "unwired" ⇒ `git log --all -S '<call>'` over dropped snaps (REJECTED 10-26 a tree grep: /"tty was wired.... we had a way."/) · a chord that only toggles ⇒ its effect threw after `flush()`, unpainted on `terminal.controller.stdout`.
- tty cells stale until a resize ⇒ a write between frames (Deno, tty stderr): pty record + pyte (REJECTED 10-27 image theory).
- a screenshot naming a scaffold ⇒ mount that panel's real part (modeline → `sheets.Bar`); no probe, no forks, never `return null`. REJECTED 10-26 /"why cant you just remove the color block?"/ · /"why fucking null"/

## the browser

1. a buffer-VIEW change → restart the runtime; HMR is the app layer only.
2. batch edits, full reload before a key — HMR keeps stale keydown legends (REJECTED 10-26 m108).
3. assert via `javascript_tool`, read via `read_console_messages`.
4. still wrong → runtime log first. A `curl` 200 opening `<!doctype` = vite's index fallback (anima root `src/`: `:1794/surfaces/…`).

Scoped `> *` never crosses a child's root. A hidden tab fires no rAF. CDP can't native-drag — dispatch `DragEvent`. A bundle alone: `paladin.bundler(<entry>).bundle()` + a stub row.

## the shelf — the runtime bundles `~/.viva/instances/<slug>/`, a copy no verb syncs

/"still"/ after a reported fix ⇒ check here first.

```sh
diff -q ~/.viva/registry/<pkg>/modes/<type>/<slug>/<file> ~/.viva/instances/<instance>/<same path>/<file>
```

1. capture to `~/.viva/bak/instances/<slug>-<YYYYMMDD>/` (skill `readme`).
2. `cp` touched files by name; never `rsync --delete`, never the shelf `instance.viva.json` blind.
3. verify on the SHELF — `VIVA_SYSTEM_MODE=DEVELOPMENT` re-bundles on reload.
4. say /"verified on the shelf bundle"/ (REJECTED: verified the checkout, served the shelf).

- **a walk opens the PRODUCT as it ships** — `deno task <container>/run` on the ledger's port, his ledger, no substitute (REJECTED 10-21: a parts page · anima static on 8800). Its restart is MINE (REJECTED 10-24 /"i dont run 2501. kill and run"/), DETACHED, `nohup … & disown` (10-28: a task died at `/model`). Open a live view BEFORE the act; a repl signal types only once `document.activeElement` is the composer (10-28: `/terminal/close` hit his dojo).

## report

First line: the command that reproduces it. Then HIS `file:line` and the responsible `file:line`, diff + caret. Silent fails rank first. What outlives the fix → skill `quest` (known issues).
