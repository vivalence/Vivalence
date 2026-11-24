<!-- writer: agent · reference · limit: 6000 chars · written 2026-10-12 from testament/ (gitignored, mtimes only) · claims from each rig's README + source -->
# testament probes — opentui · solid-vite · probe-die · probe-twin · handover · the m82 snapshot

Throwaway rigs under `testament/` (gitignored, no history), each answering one question for the m82/m86 client rewrite. Verdicts are what the rigs printed; rerun before citing. Since the 10-12 rollback (`@` on `uzqmrktw`) the code they import may be absent — see the last section.

| rig | built | question | verdict |
|---|---|---|---|
| `prototypes/opentui/` | 10-10 | can a TUI framework render on OpenTUI under Deno, for ghost and anima alike? | yes, after a patch + FFI stand-in |
| `prototypes/solid-vite/` | 10-11 | does Solid build + serve through `vite-plugin-solid` on Deno? | yes, build and dev both PASS |
| `probe-die.js` | 10-11 | does a headless ghost client boot, sign up, get seated on `hello`? | prints the trace |
| `probe-twin.js` | 10-11 | does the same walk run 3× (one logout) and settle each `execution`? | prints `settled` or `HUNG` |
| `prototypes/handover/run.js` | 10-12 | how does the shell hand over to the repl · chrome? | the controller tree; walked on beef's tty |
| `m82-clients-20261012/` | 10-12 | — a snapshot, not a rig | the abandoned m82 clients as files |

## opentui — m82 strands M · N (51 files)

Strand M covers React on OpenTUI. Strand N covers Solid and React on both hosts: the terminal (opentui) and the browser (dom).

```sh
# testament/prototypes/opentui
npm i && npm i bun@1.3.0
patch -p0 node_modules/@opentui/core/chunk-node-tfvyz31s.js < opentui-core.patch   # 0.5.17 only
./node_modules/.bin/bun suite.jsx                                  # M: 16 scenarios, Bun
deno run -A suite.deno.jsx                                         # M: same 16, Deno via deno-preload.js
deno run -A md.deno.jsx                                            # <markdown> · <code>, tree-sitter worker
deno run -A remote.deno.jsx 4810 & node drive-remote.mjs 4810      # Deno → WebSocket → xterm.js — REJECTED route (Q11)
deno run -A solid/bundle.js solid/suite.jsx out/suite.solid.mjs solid opentui
deno run -A --config deno.mapped.json out/run.js                   # N: Solid × opentui, 16
```

- `deno-ffi.js`: a `node:ffi` stand-in built on `Deno.dlopen`. `deno-preload.js` installs it and turns `Worker` into a module worker. `opentui-core.patch` passes the stand-in in through `globalThis.__opentuiNodeFfi`.
- **trap:** run with `--config deno.json` and solid-js resolves to `dist/server.js` (the `deno` condition), so the server build freezes. `deno.mapped.json` remaps solid-js to its client build.
- `apps/lesson.{solid,react}.{opentui,dom}.jsx`: one lesson × 2 frameworks × 2 hosts (`ghost/host.js` 8 scenarios · `drive-dom.mjs` 10); `shims/` the Node surface.
- Where it went: the Solid × opentui path became `subsystems/drapes/tty` (bundled by `drapes/tty/bundle.js`) and the `subsystems/sheets` host (`map.md`). React and ink are dead (m86).

## solid-vite — anima's build path (27 files + 54M node_modules)

```sh
# testament/prototypes/solid-vite
deno install
deno run -A npm:vite@6.3.3 build --config vite.config.mjs
deno run -A serve.js 4832 & deno run -A drive.js http://127.0.0.1:4832/
deno run -A npm:vite@6.3.3 --config vite.config.mjs & deno run -A drive.js http://127.0.0.1:4831/
```

`drive.js` runs headless Chrome through playwright-core. It clicks three times, asserts `[data-count]` goes `0` → `3`, and fails on any pageerror or console error.

| path | before | after | errors |
|---|---|---|---|
| build + static | 0 | 3 | 0 |
| vite dev | 0 | 3 | 0 |

Pins: deno 2.9.6 · vite 6.3.3 (`import_map.json:55`) · vite-plugin-solid 2.11.10 · solid-js 1.9.12. Built bundle: 8.34 kB, 3.49 kB gzip.

- Vite resolves with its own conditions (`browser`, `solid`, `development`) and never with Deno's `deno` condition, so the opentui `server.js` trap cannot happen here.
- No `@deno/vite-plugin` is needed. `nodeModulesDir: "auto"` gives vite a real `node_modules/`.
- In the repo, anima would read the ROOT `import_map.json`, which needs exact entries for `vite-plugin-solid` and `solid-js`.
- The dep cache lands at `./.vite/`. A missing favicon 404 counts as a console error; the fix is `<link rel="icon" href="data:,">`.

## probe-die · probe-twin — the ghost client against a real runtime

Both boot `hello` (`@vivalence/runtime/scenarios`), then a headless ghost client (`boot(mask, headless({ credentials: memory() }))`), sign up through `/lighthouse/enter` and wait for `$isAuthorized` and a full `$seat`. `probe-die` dumps the trace and whether `die.execution` settled; `probe-twin` walks 3× (one logout) and prints `EXECUTION settled` or `HUNG` (a leaked die). They import `../systems/ghost/client.js` — gone in BOTH trees (10-10 and the snapshot): dead until re-pointed.

## handover — shell → client.repl · chrome (m86)

`deno run -A testament/prototypes/handover/run.js [verb] [--remote http://localhost:2598]` — one file: `Client(mask, parent)`, `settle`, `upgrading` sets `ctx.upgrade.{repl,chrome}` and awaits `ctx.controller.children` after `next()`; exit = controller `DONE|STOPPED ? 0 : 1`. Tty runs and the mechanism: m86 `** the handover`.

- needs `shard.controller.hold` — `subsystems/typology/gestalten/shard/controller.js` + barrel line `index.js:3`, absent on the 10-10 tree; restore that dir from `vrkoppuw` to run it.

## m82-clients-20261012 — the rollback snapshot

The 10-12 rollback left `vrkoppuw` (673 files) a visible head; five containers' tracked files copied (4729, 0 missing):

```
testament/m82-clients-20261012/
  systems/{anima 105M, ghost 9.0M}
  subsystems/{dapper, drapes, sheets}
```

Only in `vrkoppuw`, not copied: typology (83 files) · runtime (32) · paladin (5) · commons · `deno.jsonc` · `import_map.json` — restore by path. The snapshot does not run standalone: its workspace imports resolve against the 10-10 tree.
