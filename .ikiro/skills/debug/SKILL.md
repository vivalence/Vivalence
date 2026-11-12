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
<!-- limit: 5000 chars -->
# debug

## order

1. **read beef's paste first**; a screenshot's SOURCE (comp · my harness · his anima) by a marker, none → ask. A wrapped row: grep its TEXT, no CSS guess. A shown state: its source traced (declared · key · default) before "right" (11-18).
2. **reproduce before theorizing**; `.ikiro/reference` + `* handoff` first (11-10) — /"A recorded diagnosis is not a settled diagnosis."/
3. **pin the environment** — checkout or shelf? `lsof -i :PORT` · `docker ps` FIRST. A root `.env` shadowing an os var? **Which client** — wrong only on his screen ⇒ ask WHICH BROWSER, its cache or fallback FONT (pin `font-family`, 11-12); a tty ⇒ `TERM_PROGRAM` of ghost's pid (10-27).
4. **isolate** — bisect boot; probes at the WORKSPACE root, values as the OWNER left them, not fresh (11-16); a loop runs capped on a db `cp` (`--max-old-space-size=1024`, 90 s).
5. **control** — two runs, one variable, flipped in a probe, never `sed -i` under a watcher; a live symptom closes on HIS act rerun, read back (db · spans), never tests (11-18); a verdict names what it RAN (11-14).
6. **then code** — bracketed (skill `change`); two fixes failed on one premise → TEST it before a third.

## taps

- `viva instance/doctor --json` (→ `mount`) + `viva ledger/doctor` (/"dont forget the pair"/); `ledger/doctor` MUTATES.
- read-only sqlite — `sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"`; bare path CREATES.
- `curl` `/beacon/status` · `/metadata/aperture` (bearer); boot `run.js` foreground — a bad import dies SILENT under a task.
- a walk/probe tears down in `finally`: SIGTERM its own pid, never SIGKILL (orphans the runtime), nor `ps | grep`.

## recurring shapes

- `thread/create` pending ⇒ a buffer-bundle esbuild error (runtime log).
- entities doubled ms apart ⇒ N clients (`lsof -nP -iTCP:2501 -sTCP:ESTABLISHED`), each a client guard → the entity's twitch.
- 1×401 in 39×200 ⇒ a race · hallucinator 401 ⇒ provider key.
- blank `:1794`, clean console ⇒ `client.js` faulted untapped (`anima-entry-faults-unprinted`).
- a 401 + 500 storm ⇒ an `$effect` writing the `$state` it reads — `untrack`, mount to prove.
- a slow click ⇒ LoAF · `performance.measure` on HIS page: a CLOSED panel's memo (11-18).
- "unwired" ⇒ `git log --all -S '<call>'` over dropped snaps (not a tree grep) · a chord that only toggles ⇒ its effect threw after `flush()`, unpainted on `terminal.controller.stdout`.
- tty cells stale till a resize ⇒ a write between frames: pty record + pyte (10-27).
- a screenshot naming a scaffold ⇒ mount its real part; no probe, no forks, no `return null` (10-26).

## browser

1. a buffer-VIEW change → restart the runtime; HMR is app-layer only.
2. batch edits, full reload before a key — HMR keeps stale keydown legends (10-26).
3. still wrong → runtime log; `curl` 200 `<!doctype` = vite's fallback; a module is `/@fs/<abs path>`, never `/src/…`.

`> *` never crosses a child's root; a hidden tab fires no rAF. CDP can't native-drag — dispatch `DragEvent`. Bundle alone: `paladin.bundler(<entry>).bundle()` + a stub row. Svelte rules exist MOUNTED; `resize_window` lies.

## the shelf — the runtime bundles `~/.viva/instances/<slug>/`, a copy no verb syncs; /"still"/ after a fix ⇒ here first

```sh
diff -q ~/.viva/registry/<pkg>/modes/<type>/<slug>/<file> ~/.viva/instances/<instance>/<same path>/<file>
```

1. capture to `~/.viva/bak/instances/<slug>-<YYYYMMDD>/`; `cp` touched files by name — never `rsync --delete`, never the shelf `instance.viva.json` blind.
2. verify on the SHELF — `VIVA_SYSTEM_MODE=DEVELOPMENT` re-bundles on reload.
3. say /"verified on the shelf bundle"/.

- **a walk opens the PRODUCT as it ships** — `deno task <container>/run` on the ledger's port, his ledger, no substitute (10-21); its restart MINE, DETACHED `nohup … & disown`. A live view BEFORE the act; a key types once `activeElement` is its target, a click on its rect read IN-batch; a precondition THROWS, never prints; a `viva.*` store I flip, I unflip (10-28 · 11-18).

## report

First line: the reproducing command. Then HIS `file:line` + the culprit `file:line`, diff + caret. Silent fails first. A deep-dug cause → propose its always-on signal. What outlives the fix → known issues (skill `quest`).
