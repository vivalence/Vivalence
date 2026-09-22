---
paths: ["testament/**"]
---
<!-- writer: agent · kind: persistent · limit: 3300 chars -->
# codemap: testament — dev-only tree, one Bruno collection
- beef: development INSIDE the repo, never a system-wide fixture; a package resolves by slug through the ledger, never a `<repo>/testament/` mount. (ledger 08-28)
- gitignored, excluded from `deno.jsonc`; `_bruno/instances/**` exists on this disk only. (ki bruno-asserts-unported)
- `bruno.json` `ignore` is GUI-only: one bad `.bru` (`ws { }`) crashes the CLI parser for every run. (`project_bruno_hygiene`)

- `bru` cannot stream SSE (axios buffers → `maxContentLength size of -1 exceeded`) — bru for login/setup, `curl -sN --max-time N` for streams (`_bruno/run-dewey-tools.sh`); reporter JSON is an iterations array: `.[0].results[0].response.data`, never `.body`.

<!-- generated: python3 .ikiro/methods/codemap.py testament — never hand-edited -->
```jsonc
// testament
{
 "manifest": null,
 "folders": {"_bruno": {"data": 0, "environments": 2, "instances": 3, "services": 2, "system": 7}},
 "tests": {}
}
```
<!-- /generated -->
