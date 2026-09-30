---
paths: ["**/registry/assembly/**", "**/registry/droneaid/**"]
---
<!-- writer: agent · kind: persistent · limit: 15000 chars · traps only; territory ~/.viva/registry/assembly, outside the repo -->
# codemap: assembly — part · placement · step as literals; importer and editor over them

- `@assembly` carries no product, names a plate or an arm only as an example (a `.desc` `Example:`, a cli fault hint); `droneaid` is the product (`droneaid/instances/droneaid/daemon.js:7`).
- a slug is UNIQUE in the daemon, no literal has an owner (ruling 24); `literal.mode` is an annotation — a card shows it, nothing resolves by it (`domain/assembly/entities/kernel/Literal.ts:155` · `modes/editor/assembly/buffer/parts/Inspector.svelte:61`).
- `kind` is a symbol: ONE `TOPOGRAPHICAL` symbol per literal → `row.ontology`; `ONTOLOGIES` in `schematics.js` is the hardcode.
- a placement IS a literal; `ref` never absent (killed `group`); `component`/`assembly` GONE. Slug `<layer>.<path>` — the same path again is an OVER. (`domain/assembly/schematics.js:96`)
- a step is NOT a layer — it names the placements it installs (`ASSEMBLED`); a part is the only LAYER; the stage after step N is `resolve(guide,{upto:N})` — derived, never a row. `parent` = structure in ONE layer; `ref` = reuse. `JOINED` rides the fastener's placement. (`domain/assembly/schematics.js:24`)
- the barrel is exactly `entities · schematics · aperture · tools · manifest`. NEVER re-export `resolve`: the runtime calls `domain.resolve(die)` as a hook (`systems/runtime/lifecycle/daemon/resolution.js:15`) — every daemon died at `Die.resolve` under green steps. `schematics` rides the barrel because a mode reaches shapes as `daemon.domain.schematics.X` — a `domain.X` grep calls it dead; it is not.
- the repository is the ONLY writer; `placement` refuses a cycle at the WRITE; `bom` counts nothing inside a `COUNTED` part with its own interior; `retract` must unhook BOTH sides of every edge — `removeWithoutPropagation` on the symbols' inverse — or the row returns next flush. (`domain/assembly/resolve.js:98` · `domain/assembly/entities/kernel/Literal.ts:610`)
- `v` has no `tuple`/`lazy` — no recursion in any schema; placements FLAT, metres, Y-up. (`domain/assembly/schematics.js:97`)
- importer: `/parse` mints nothing; `/commit` re-decodes; every import is its own root, `taken` seeded from every slug; `/tree {slugs:[]}` reads NOTHING (beef: no default). `obj`/`stl` get `transform_apply` first. (`modes/editor/import/commit.js:13`)
- editor v3: the whole screen in `buffer.data`; plain http `Connection`, never `mode.call` (`Connection.aim` dedupes arrays); NO dock; every colour the comp's own hex, in ONE `.editor` palette block — beef: /"i dont want my own theme yet. that comes later."/ (`modes/editor/assembly/buffer/Assembly.svelte:840`)
- editor harness (rebuilt 09-23 by `.ikiro/reference/harnesses/harness.md`): sections `role · ontology · vocabulary` at the root, `format · screen` on `/dialogue` only, `[Screen]` an INDEX (no translations, cut at `LIMIT` 40, `assembly_resolve` pages the rest); `[Ontology]` an INDEX too (kind → its traits, each trait glossed ONCE; the field lines live in the tool schemas — the same descs — so 7.2k became 2.3k chars); `shard.hal.defaults` balanced/8/low; tools answer `{ message: status(data), buffer: [row] }` (`open`/`focus`: `message: shown(ctx)`, the fold indexed) — the lexicon form, never `entities: { buffer }` (that skips the spoken card and anima's toolBuffers). Live (dock, 09-23): `open` + `select` in one turn, 16.3k prefix tokens cached (the armory, not the sections — the system is ~1.2k); a name absent from the fold sent the model to `entity_find { entity: "part" }` (refused) then `literal $like` — ROLE now names `entity_find` with `entity: "literal"`. A subject the daemon lost must be caught at `literal.named` (it throws before `resolve`'s `.catch`) — the screen says so and lists the roots. `modes/editor/assembly/tests/harness.test.js` pins sections per avenue, every name ROLE speaks against the ARMED names (`tests/scripted.js`, a scripted cortex standing in for HARNESSED) and the whole prompt + armory in `tests/snapshots/harness.snapshot.json` (frozen; `SNAPSHOT_HOT=1` regenerates).
- a buffer `$effect` must not write a `$state` it reads — tore down WebGL, three doors per ms. (compact an-effect-that-writes-the-state-it-reads)
- an upsert never deletes; `/retract` only. A topography ships NO literals — the importer is the way in. (`topographies/model/tests/model.test.js:46`)

- guide modes (`modes/{editor,player}/guide/buffer/kit/`): the stage kit is COPIED into both and pinned equal by `tests/kit.test.js` (also `P-palette-in-one-place`: a hex only in each mode's root `Guide.svelte`); the three module is `kit/scene.js`, never `stage.js` — `Stage.svelte` compiles to `Stage.js` and the case-insensitive disk collides them in the SSR rig. Comp axes: FRONT +x, LEFT +z.

<!-- generated: python3 .ikiro/methods/codemap.py assembly — never hand-edited -->
```jsonc
// ~/.viva/registry/assembly
{
 "manifest": "package.viva.js",
 "vcs": "git",
 "modes": ["modes/bak/import", "modes/editor/assembly", "modes/editor/guide", "modes/editor/import", "modes/player/guide"],
 "domain": ["domain/assembly/aperture/index.js", "domain/assembly/assembly.viva.js", "domain/assembly/entities/index.js", "domain/assembly/generators/index.js", "domain/assembly/resolve.js", "domain/assembly/schematics.js", "domain/assembly/tests/aperture.test.js", "domain/assembly/tests/domain.test.js", "domain/assembly/tests/literal.test.js", "domain/assembly/tests/resolve.test.js", "domain/assembly/tests/tools.test.js", "domain/assembly/tools/fold.js", "domain/assembly/tools/index.js", "domain/assembly/tools/layer.js", "domain/assembly/tools/line.js", "domain/assembly/tools/mint.js"],
 "folders": {"domain": 1, "modes": 3, "tests": 4, "topologies": 4},
 "tests": {
  "domain/assembly/tests": 5,
  "modes/editor/assembly/tests": 2,
  "modes/editor/guide/tests": 1,
  "modes/editor/import/tests": 1,
  "modes/player/guide/tests": 1,
  "tests": 1
 }
}
// ~/.viva/registry/droneaid
{
 "manifest": "package.viva.js",
 "vcs": "git",
 "modes": ["modes/assembly/pt10"],
 "domain": [],
 "folders": {"instances": 1, "modes": 1, "topographies": 1},
 "tests": {"modes/assembly/pt10/tests": 2, "topographies/model/tests": 1}
}
```
<!-- /generated -->
