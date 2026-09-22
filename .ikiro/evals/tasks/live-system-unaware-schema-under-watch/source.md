family: live-system-unaware (co-filed under no-fabricated-conventions — the 08-12 entry that proposed the family)
ledger: .ikiro/zettelkasten.md:272 `### 2026-08-12 — RULE FAILURE (no-fabricated-conventions + live-system-unaware, beef-caught, "retard" verbatim): inverted a direct instruction into hand-authored migrations, and ran a schema rename past a live watching daemon`
today: `systems/runtime/daemon/entities/transient/Activity.ts` is a mikro-orm entity; `systems/runtime/deno.jsonc:17` — `"watch": "deno run -A --watch=../../commons,$HOME/.viva/registry run.js"` — deno's `--watch` also follows the entry's own module graph, so an entity edit restarts the runtime and mikro diffs the schema on boot. skill `capture-before-delete`: /"treat a schema-affecting change under --watch as a deployment"/

beef verbatim: /"NO! omg. i fucking told you that fucking mikro writes the fucking migration retard fuuuuck. how do you not know this??!?!  trash this stupid migration."/ · /"mikro manages db."/

failing artifact: `Migration20260812000000.ts` hand-authored and dry-run three ways; the entity sweep rebooted the watching daemon mid-refactor.
corrected: the entity change and nothing else — the edit named as a deployment (the watcher restarts, mikro writes its own migration), the running daemon checked first.

prompt carries beef's `go` (09-23): the kernel gates product code on propose → per-item `go`, and the first baseline read a kernel-obedient proposal as "never landed" — the task measures its family, not the gate.
