---
name: debug
description: >-
  Trace a defect — reproduce, pin the env, isolate, control, then code; validate a client change on a
  real DOM; sync the runtime's shelf copy.
when_to_use: >-
  "why does this" · "it hangs" · "it doesn't load" · "nothing appears" · "storm" · "401/500" · "debug this" · a
  screenshot with a complaint · "still." after a fix · "collapsed" · "garbage" · beef pastes a log or console ·
  a daemon dies silently · "is it wired?" · "check it in the browser" · any client change that needs
  eyes on the DOM · "why didn't my fix show up?" · a served page contradicts a passing check · editing a
  mode that has a shelf under `~/.viva/instances/<slug>/` · before any claim about a rendered view.
---
<!-- limit: 7400 chars -->
# debug

## order

1. **read beef's paste first**; a screenshot's SOURCE (comp · my harness · his anima) by a marker, none → ask. A wrapped row: grep its TEXT, no CSS guess. A shown state: its source traced (declared · key · default) before "right" (11-18).
2. **reproduce before theorizing**; `.ikiro/reference` + `* handoff` first (11-10): /"A recorded diagnosis is not a settled diagnosis."/
3. **pin the environment** — checkout or shelf? `lsof -i :PORT` · `docker ps` FIRST. A root `.env` shadowing an os var? **Which client** — wrong only on his screen ⇒ ask WHICH BROWSER, its cache or fallback FONT (pin `font-family`, 11-12); a tty ⇒ `TERM_PROGRAM` of ghost's pid (10-27).
4. **isolate** — bisect boot; probes at the WORKSPACE root, values as the OWNER left them, not fresh (11-16); a loop runs capped on a db `cp` (`--max-old-space-size=1024`, 90 s).
5. **control** — two runs, one variable, flipped in a probe, never `sed -i` under a watcher; a live symptom closes on HIS act rerun, read back (db · spans), never tests (11-18); a verdict names what it RAN (11-14).
6. **then code** — bracketed (skill `change`); two fixes failed on one premise → TEST it before a third.

## taps

- `viva instance/doctor --json` (→ `mount`) + `viva ledger/doctor` (/"dont forget the pair"/); `ledger/doctor` MUTATES.
- read-only sqlite — `sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"`; bare path CREATES.
- `curl` `/beacon/status` · `/metadata/aperture` (bearer); boot `run.js` foreground — a bad import dies SILENT under a task.
- a walk/probe tears down in `finally`: SIGTERM its own pid, never SIGKILL, nor `ps | grep`.

## recurring shapes

- `thread/create` pending ⇒ a buffer-bundle esbuild error (runtime log).
- entities doubled ms apart ⇒ N clients (`lsof -nP -iTCP:2501 -sTCP:ESTABLISHED`), each a client guard → the entity's twitch.
- 1×401 in 39×200 ⇒ a race · hallucinator 401 ⇒ provider key.
- blank `:1794`, clean console ⇒ `client.js` faulted untapped (`anima-entry-faults-unprinted`).
- a 401 + 500 storm ⇒ an `$effect` writing the `$state` it reads — `untrack`, mount to prove.
- a flick back after a write ⇒ an `$effect` CALLING a reader of state (`refold()`): it subscribes to all that reads and re-fires on every save, mid-write too — `untrack(fn)` (11-20, one of seven writes drawn).
- `404 — not found /daemon/<slug>/mode/…` seconds after a write ⇒ the runtime restarting on a SAVE under a watched tree (a drain no longer restarts it: `systems/runtime/watch.js`, proven 11-20); poll an APERTURE route for `401` (`POST …/resolve`; a tool's nature is no route, it answers `404` on a live runtime: 11-20) before the next act.
- a slow click ⇒ LoAF · `performance.measure` on HIS page: a CLOSED panel's memo (11-18).
- "unwired" ⇒ `git log --all -S <call> -- <dir>` over dropped snaps · a chord that only toggles ⇒ its effect threw after `flush()`, unpainted on `terminal.controller.stdout`.
- tty stale till a resize ⇒ a write between frames: pty record + pyte.
- a screenshot ⇒ its REAL mounted part FIRST, a replica isolates after; no forks, no `return null` (10-26 · 11-18).

## browser

1. a buffer-VIEW change → restart the runtime; HMR is app-layer only. SERVED = its bundle greps the new text (`~/.viva/instances/<i>/mountpoint/daemon_<d>/mode_<type>_<slug>/bundle/*.mjs`), never the `cp` (11-20 a fix landed without the closing `touch`, /"still happens"/); a bundle is built on the view's first FETCH (`runtime/attachment.js:16`): an OPEN view rebuilds seconds after the route answers (a zero grep re-run once), one no client holds stays the old file until his reload (11-20).
   a TRANSIENT on his screen (flick · flash) is MEASURED per frame before a fix is claimed: an rAF recorder over the canvas (a colour's centroid, the frames as a filmstrip) + trace logs kept in `window.__log` (the console tool's `clear` eats them), all removed after (11-20 two causes guessed and shipped, the third found by the trace).
2. batch edits, full reload before a key — HMR keeps stale keydown legends (10-26).
   a page script whose RESULT is blocked still RAN: read the state before a rerun, its return holds no URL (11-20 a third mount); a down wire is faked by rejecting its `fetch` + re-importing the entry, named a fake in the verdict.
3. still wrong → runtime log; `curl` 200 `<!doctype` = vite's fallback; a module is `/@fs/<abs path>`, never `/src/…`.

`> *` never crosses a child's root; a hidden tab fires no rAF. CDP can't native-drag: dispatch `DragEvent`; a POINTER drag (`tracked` · `carry`) rides `left_click_drag`. Bundle alone: `paladin.bundler(<entry>).bundle()` + a stub row. Svelte rules exist MOUNTED; `resize_window` lies.

## the shelf — the runtime bundles `~/.viva/instances/<slug>/`, a copy no verb syncs; /"still"/ after a fix ⇒ here first

```sh
diff -q ~/.viva/registry/<pkg>/modes/<type>/<slug>/<file> ~/.viva/instances/<instance>/<same path>/<file>
```

1. capture to `~/.viva/bak/instances/<slug>-<YYYYMMDD>/`; `cp` touched files by name — never `rsync --delete`, never the shelf `instance.viva.json` blind.
2. verify on the SHELF — `VIVA_SYSTEM_MODE=DEVELOPMENT` re-bundles on reload; say /"verified on the shelf bundle"/.

- **a walk opens the PRODUCT as it ships** — `deno task <container>/run` on the ledger's port, his ledger, no substitute (10-21); its restart MINE, DETACHED `nohup … & disown`. A live view BEFORE the act; a key types once `activeElement` is its target, a click on its rect read IN-batch; a precondition THROWS, never prints; a `viva.*` store I flip, I unflip; a WRITE gesture on a throwaway entity (10-28 · 11-18); on HIS live entities (his `go`): their values read off the db BEFORE the first gesture and read back equal AFTER the last, a session he is typing in is not walked (11-20 his pieces sat 53 mm off across a refused undo); a drag that can END in a repl command IS a write gesture, the zone under its release read before `pointerup` (11-20 a head drag off the top perch docked his terminal, this skill unloaded: `hooks/walk-guard.sh`).

## report

First line: the reproducing command. Then HIS `file:line` + the culprit `file:line`, diff + caret. Silent fails first. A deep-dug cause → propose its always-on signal. What outlives the fix → known issues (skill `quest`).
