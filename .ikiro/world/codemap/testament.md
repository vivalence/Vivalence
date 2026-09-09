---
paths: ["testament/**"]
---
<!-- writer: agent, derived-from: testament/** walk + reader grep, checks: find=210, *.bru=206, readers=3 literals, git ls-files=110, console.*=3, spans/drains=0, in-tree tests=0, bru tests{}=29/47 test(, limit: 3300 chars -->
# codemap: testament - the repo's dev-only tree; today it holds one Bruno collection

- **the law**: `testament/` is *development inside the repo*; beef: *"testmanet is fucking DEVELEPMENT INSIDE REPO ... not a fucking system wide fixture"*. A dev-tree root belongs in an in-repo dev template only; a registry package resolves by slug through the ledger, never a `<repo>/testament/` mount.
- **on disk**: one L2 dir, `testament/_bruno/`: `bruno.json`, `environments/{localhost,vivalence.com}.bru`, `run-dewey{,-tools}.sh`, `system/{auth,runtime,daemon,lighthouse,attached,mode}/`, `instances/{education-language,playground}/`, `services/stanza-nlp/`. **No** `instance/`, `ledger/`, `mountpoint/`, `variant/`, `temp.js`; the dev instance lives on the ledger (`world/ledger.md`).
- **not a workspace member**: `.gitignore:1` = `testament`, `deno.jsonc:4` excludes `./testament`. No deno task and no `--env-file` points in. 110 of 210 files are force-tracked; `_bruno/instances/**` is not, so it exists on this disk only.
- **the trap**: `bruno.json`'s `ignore` is GUI-only; the CLI walks the whole tree, and one bad `.bru` (a `ws { }` block) crashes the parser before any single run.

```js
// subsystems/typology/tests/path.absolute.test.js:27 - a literal, not a mount
const mount = new Path("/testament/instance/mountpoint").branch("/daemon_spanish");
// systems/runtime/tests/topography/harness.js:14
export const DB = paladin.scope.mountpoint ? paladin.scope.mountpoint.branch(..).absolute : null;
```

```sh
# testament/_bruno/run-dewey.sh:7-42 - bru for setup, curl for SSE
bru run system/lighthouse/auth/login.bru --env $ENV --reporter-json /tmp/bru-login.json
curl -sN --max-time 120 -X POST -H "Authorization: Bearer $TOKEN" .. \
  http://localhost:2501/daemon/brazilian/mode/teacher/dewey/harness/dialogue/stream > "$SSE"
```

```json
// testament/_bruno/system/daemon/userspace/thread/find.bru - a fixture at rest
meta { name: find  type: http  seq: 1 }
post { url: {{DAEMON}}/userspace/entities/thread/find  body: json  auth: bearer }
body:json { "where":{"id":"019d42b0-.."}, "options":{"populate":["literals","symbols","mode"]} }
```

## how it is tested

- **nothing tests the tree; 3 files NAME it**: `*.test.*` under `testament` = **0**; `testament/` in src = 10 hits / **3** files, all literals; `\.bru` in src and `~/.viva/registry` = **0**/**0**. Asserts: 29 `tests {}` / **47** `test(`, run only by `bru`; successor `subsystems/typology/specimen/` unported.
- **the pin is a path law**: `subsystems/typology/tests/path.absolute.test.js` - *"the daemon-mount crash: heir-walk poisons the parent, heritage does not"*; `deno test -A --config ./deno.jsonc <it>` = `ok | 3 passed | 0 failed`.

## where to read the live system

- **none of its own**: `\.mark(|span\.|chronicle|dictate` = 0, `drain(` = 0, `console.*` = **3**, all inside `tests {}` blocks, printed by `bru run`. The one tap is its reporter: `bru run <f>.bru --env localhost --reporter-json /tmp/x.json` -> `.[0].results[0].response.data` (v1.38+, not `.body`).
