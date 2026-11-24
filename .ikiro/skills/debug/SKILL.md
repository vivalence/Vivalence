---
name: debug
description: Trace a defect. Reproduce, pin the environment, isolate, control, then code. Check a client change on the real page.
when_to_use: >-
  "why does this" · "it hangs" · "it doesn't load" · "nothing appears" · "debug this" · "still." after a fix ·
  a screenshot with a complaint · he pastes a log · "is it wired?" · "check it in the browser" ·
  "why didn't my fix show up?"
---
<!-- limit: 4800 chars -->
# debug — trace a defect

## order

1. Read his paste first. A screenshot: find which screen it is before reading it.
2. Reproduce before any theory. A recorded diagnosis is not a settled one.
3. Pin the environment. Which process serves it? Checkout or installed copy? Which browser or terminal?

```sh
lsof -i :2501
docker ps
```

4. Isolate. Bisect the boot. Probe with the values the owner left, not fresh ones.
5. Control. Two runs, one variable changed.
6. Then code, inside the bracket of skill `change`. Two fixes failed on one premise: test the premise.

A live symptom is closed when his own act is rerun and reads right. Tests do not close it.

## taps

```sh
viva instance/doctor --json
viva ledger/doctor            # this one writes
sqlite3 "file:$HOME/.viva/instances/<slug>/mountpoint/<db>?mode=ro" "select …"
curl -s localhost:2501/beacon/status
```

A probe stops its own process by pid, with SIGTERM, in a `finally`.

## known shapes

- `thread/create` stays pending: a bundle error of a buffer view. Read the runtime log.
- Entities doubled milliseconds apart: several clients are connected.
- One 401 among many 200: a race. A 401 from a hallucinator: the provider key.
- A blank `:1794` with a clean console: `client.js` faulted and printed nothing.
- A storm of 401 and 500: an `$effect` writes the `$state` it reads. Wrap in `untrack`.
- A value flicks back after a write: an `$effect` calls a reader of state. Wrap in `untrack`.
- A 404 on a mode route seconds after a save: the runtime is restarting. Wait for the route, then act.
- A chord that only toggles: its effect threw after the flush.
- A terminal that is stale until a resize: a write between frames.

## browser

1. A change to a buffer view needs a runtime restart. Hot reload only covers the app layer.
2. Served means the bundle on disk holds the new text. Grep it:

```sh
grep -l '<new text>' ~/.viva/instances/<i>/mountpoint/daemon_<d>/mode_<type>_<slug>/bundle/*.mjs
```

3. Reload fully before pressing a key.
4. A flicker is measured frame by frame before a fix is claimed.
5. Still wrong: the runtime log. A `curl` that answers `<!doctype` got vite's fallback page.

## the installed copy

The runtime bundles `~/.viva/instances/<slug>/`. Nothing syncs it from the registry. "still" after a fix: look here first.

```sh
diff -q ~/.viva/registry/<pkg>/modes/<type>/<slug>/<file> ~/.viva/instances/<instance>/<same path>/<file>
```

Copy to `~/.viva/bak/instances/<slug>-<date>/` first. Then copy the touched files by name.

## walking his product

- Open the product as it ships, on its own port.
- A write is done on a throwaway entity. On his live entities only with his `go`, and their values are read before and read back equal after.
- A store I flip, I flip back. A walk ends with its tabs and threads closed.

## report

Line one is the command that reproduces it. Then his `file:line`, the culprit's `file:line`, and the diff.
