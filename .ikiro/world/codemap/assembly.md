---
paths: ["**/registry/assembly/**", "**/registry/droneaid/**"]
---
<!-- writer: agent · kind: persistent · limit: 15000 chars · traps only; territory ~/.viva/registry/assembly, outside the repo -->
# codemap: assembly — part · placement · step · guide as literals; importer and editor over them

## the domain

- `@assembly` carries no product: a plate or an arm appears only as an example (a `.desc` `Example:`, a cli fault hint); `droneaid` is the product. (`droneaid/instances/droneaid/instance.viva.json:14`)
- a slug is UNIQUE in the daemon and no literal has an owner (ruling 24) — a second mint of a slug throws naming the held ontology. `literal.mode` is required since m80 — the minting mode, else the topology that ships the ontology's root symbol; a card shows it, nothing resolves by it. The verbs ride literal traits (`PLACED` the graph · `COUNTED` · `ASSEMBLED` · `SEQUENCED`), the row reads are `traits/literal/rows.js` functions, no entity class. (`domain/assembly/traits/literal/placed.js:56` · `:64` · `modes/editor/assembly/buffer/parts/Inspector.svelte:61`)
- `kind` is a symbol: ONE `TOPOGRAPHICAL` symbol per literal → `row.ontology`; the four ontologies and their traits are the hardcode in `ONTOLOGIES` — part is the ONLY `layer: true`. (`domain/assembly/schematics.js:21`)
- a placement IS a literal; `ref` is never absent (`group` killed); `component`/`assembly` are GONE. Slug `<layer>.<path>` — the same path again is an OVER. (`domain/assembly/schematics.js:96`)
- a step is NOT a layer — it names the placements it installs (`ASSEMBLED`); the stage after step N is `resolve(guide, { upto: N })`, derived, never a row. `parent` = structure inside ONE layer; `ref` = reuse. `JOINED` rides the fastener's placement. (`domain/assembly/schematics.js:24`)
- `v` has no `tuple`/`lazy` → no recursion in any schema; placements are FLAT, metres, Y-up. (`domain/assembly/schematics.js:97`)
- the barrel is exactly `entities · schematics · aperture · tools · manifest`. NEVER re-export `resolve`: the runtime calls `domain.resolve?.(daemon)` as a HOOK, so an exported `resolve` killed every daemon at `Die.resolve` under green steps. `schematics` rides the barrel because a mode reaches shapes as `daemon.domain.schematics.X` — a `domain.X` grep calls it dead; it is not. (`domain/assembly/assembly.viva.js:1` · `systems/runtime/lifecycle/daemon/resolution.js:12`)
- the repository is the ONLY writer; `placement` refuses a cycle at the WRITE; `bom` counts nothing inside a `COUNTED` part that has its own interior; an upsert never deletes — `/retract` only, and it must unhook BOTH sides of every edge (`removeWithoutPropagation` on the symbols' inverse) or the row returns on the next flush. (`domain/assembly/resolve.js:38` · `:98` · `domain/assembly/traits/literal/placed.js:380` · `domain/assembly/aperture/index.js:118`)
- a topography SHIPS its literals and drains them back (m71, 10-06): `@droneaid/topography/models` (the drone: part · placement, GLBs on `freight/parts/`) and `@droneaid/topography/guides` (guide · step, the manual's pages) are `DATASET · FRAUGHT · DATASINK`; `dataset/literals/*.js` is the record, the daemon is working memory, `harvest/harvest.js` writes the files first in `Datasink.canonical` form so the first drain is a no-op (`models/tests/harvest.test.js` P-roundtrip: `written: 0`). The importer is the way in for a NEW blend only; its rows sit beside, under their own root. (`droneaid/topographies/models/models.viva.js:24`)
- a literal sink selects by the ONTOLOGY'S ROOT SYMBOL slug (`["part", lean, "dataset/literals/parts.js"]`), never `{ ontology: "part" }` — the drain filters the PROJECTED row (slug · traits · trait · relations), which has no `ontology` column (`systems/runtime/traits/datasink.js:59`). A custom shape REPLACES `project.lean`, so it must lean itself: `project.pipe(project.lean(["symbols", "uses"]), project.omit("in", "mode"))`, or every ref carries its traits (`subsystems/typology/prototypes/datasink.js` `ref`). (`droneaid/topographies/models/models.viva.js:22`)
- the composition is ONE layer, `drone`: every placement's slug is `drone.<ref>.<n>`, every `JOINED.joins` path is a sibling's name; the blend's six collection parts were flattened away at the harvest. A fastener's translation is a function in `harvest/anchors.js` over `harvest/blend.js` (the importer's rows, captured 10-06) — never a number typed from a picture; the hub's 16 mm rule is QUESTIONED (no hole pattern). Cables are one PART per route (`cable.route`, the stage builds geometry per part, placement `params` are not read: `modes/player/guide/buffer/Guide.svelte:85`); `motor_wire` is one part mirrored by `PLACED.scale`.
- the import rows went by `/retract` with closure (63 rows, `~/.viva/bak/droneaid-pt10-20261006/` holds pt10 + the old `model/`); a stale `(slug, mode_id)` twin would have made `named(slug)` ambiguous. Orphans of the rename still in the db: the `topography/model` Mode row and the `family.computer` Symbol row — the first `family.%` drain will write that symbol back into `families.js` unless the row goes first (fork, 10-06).

## importer

- `/parse` mints nothing; `/commit` re-decodes; every import is its own root, `taken` seeded from every slug in the daemon. (`modes/editor/import/commit.js:13`)
- `/tree` takes `{ slugs }` and `[]` reads NOTHING — no default (beef); a non-array throws. (`modes/editor/import/aperture/index.js:227`)
- `obj`/`stl` get `transform_apply` before harvest, or transforms ride into the rows. (`modes/editor/import/harvest.py:37`)

## editor

- the whole screen lives in `buffer.data`; the buffer talks plain http `Connection`, never `mode.call` (`Connection.aim` dedupes arrays); NO dock; every colour the comp's own hex, in ONE `.editor` palette block — /"i dont want my own theme yet. that comes later."/ (`modes/editor/assembly/buffer/Assembly.svelte:103` · `:839`)
- harness: sections `role · ontology · vocabulary` at the root, `format · screen` on `/dialogue` only; `[Screen]` and `[Ontology]` are INDEXES (no translations, cut at `LIMIT = 40`, `assembly_resolve` pages the rest; field lines live in the tool schemas, never twice); `shard.hal.defaults` balanced/8/low. (`modes/editor/assembly/harness.js:3` · `:84`)
- a tool answers `{ message: status(data), buffer: [row] }` (`open`/`focus`: `message: shown(ctx)`) — the lexicon form, never `entities: { buffer }`, which skips the spoken card and anima's toolBuffers.
- ROLE names `entity_find { entity: "literal", where: { slug: { $like } } }` — a name absent from the fold once sent the model to `entity: "part"` (refused). A subject the daemon lost is caught on the `literal.named(…).then(resolve)` chain and the screen lists the roots. (`modes/editor/assembly/harness.js:7` · `:79`)
- `modes/editor/assembly/tests/harness.test.js` pins sections per avenue and every name ROLE speaks against the ARMED names via a scripted cortex (`tests/scripted.js`); the whole prompt + armory is frozen in `tests/snapshots/harness.snapshot.json` — a wording drift reds before a live call; `SNAPSHOT_HOT=1` regenerates. (`:58`)

## guide modes

- the stage kit (`modes/{editor,player}/guide/buffer/kit/`) is COPIED into both and pinned equal by `tests/kit.test.js` — edit both; `P-palette-in-one-place`: a hex lives only in each mode's root `Guide.svelte`. (`tests/kit.test.js:31`)
- the three.js module is `kit/scene.js`, NEVER `stage.js` — `Stage.svelte` compiles to `Stage.js` and the case-insensitive disk collides them in the SSR rig. Comp axes: FRONT +x, LEFT +z.

<!-- writer: agent · hand-kept, recounted 10-06 (folders include bak/); assembly suite 25 passed | 1 failed — modes/bak/import/tests/import.test.js, red before m71 -->
```jsonc
// ~/.viva/registry/assembly
{
 "manifest": "package.viva.js",
 "vcs": "git",
 "modes": ["modes/bak/import", "modes/editor/assembly", "modes/editor/guide", "modes/editor/import", "modes/player/guide"],
 "domain": ["domain/assembly/aperture/index.js", "domain/assembly/assembly.viva.js", "domain/assembly/entities/index.js", "domain/assembly/generators/index.js (fastener.bolt · fastener.standoff · fastener.nut · solid.box · solid.bushing · cable.route)", "domain/assembly/resolve.js", "domain/assembly/schematics.js", "domain/assembly/tests/aperture.test.js", "domain/assembly/tests/domain.test.js", "domain/assembly/tests/generators.test.js", "domain/assembly/tests/literal.test.js", "domain/assembly/tests/resolve.test.js", "domain/assembly/tests/tools.test.js", "domain/assembly/tools/fold.js", "domain/assembly/tools/index.js", "domain/assembly/tools/layer.js", "domain/assembly/tools/line.js", "domain/assembly/tools/mint.js"],
 "folders": {"domain": 1, "modes": 3, "tests": 4, "topologies": 4},
 "tests": {
  "domain/assembly/tests": 6,
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
 "modes": [],
 "topographies": ["topographies/models (models.viva.js · dataset/{literals/{parts,placements}.js, symbols/families.js} · freight/parts/*.glb ×16 · harvest/{blend,kit,anchors,rows,vocabulary,glb,harvest}.js)", "topographies/guides (guides.viva.js · dataset/{literals/{guides,steps}.js, symbols/sections.js} · freight/manual/*.webp ×88 · harvest/{steps,rows,vocabulary,harvest}.js)"],
 "domain": [],
 "folders": {"instances": 1, "tests": 1, "topographies": 2},
 "tests": {"tests/rig.js": "accio-mounted assembly domain over an in-memory datamap, DATASET/DATASINK as the runtime runs them", "topographies/models/tests": 2, "topographies/guides/tests": 2},
 "run": "deno test -A --no-check --config <repo>/deno.jsonc ~/.viva/registry/droneaid/ → ok | 6 passed (15 steps) (10-06)"
}
```
