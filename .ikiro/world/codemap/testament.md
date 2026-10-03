---
paths: ["testament/**"]
---
<!-- writer: agent · kind: persistent · limit: 3300 chars -->
# codemap: testament — dev-only tree: a Bruno collection + scratch probe rigs

- development INSIDE the repo, never a system-wide fixture: a package resolves by slug through the ledger, never a `<repo>/testament/` mount. (ledger 08-28)
- gitignored (`.gitignore:1`) and excluded from the workspace (`deno.jsonc:4`) → nothing here is in any suite, CI, or another checkout; `_bruno/instances/**` and `m76-probe/` exist on this disk only. (ki bruno-asserts-unported)
- `bruno.json` `ignore` is GUI-only: the CLI still parses every `.bru`, so one bad file (`ws { }`) crashes every `bru run`. (`_bruno/bruno.json` · `project_bruno_hygiene`)
- `bru` cannot stream SSE (axios buffers → `maxContentLength size of -1 exceeded`): bru for login/setup, `curl -sN --max-time N` for streams. Reporter JSON is an iterations array — read `.[0].results[0].response.data`, never `.body`. (`_bruno/run-dewey-tools.sh:29`)

<!-- writer: agent · hand-kept, recounted 10-06 -->
```jsonc
// testament
{
 "manifest": null,
 "folders": {"_bruno": {"data": 0, "environments": 2, "instances": 3, "services": 2, "system": 7}, "m76-probe": ["commons", "subsystems", "systems", "probe.js", "rig.js", "run.js", "probe.auth.test.js", "probe.client.test.js", "import_map.overlay.json"]},
 "tests": {"m76-probe": 2}
}
```
