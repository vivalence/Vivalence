# Assembly — the domain, the importer, and the editor we want

> Three readings of one package. Part I and Part II are MEASURED against the live tree and the live
> droneaid dataspace (read-only sqlite, `file:…?mode=ro`); every count below came off a command run
> for this document, not off recall. Part III is a design dossier — what the editor must become —
> and carries no measurement it did not earn in Parts I and II.
>
> Re-measure before trusting a number a later hunk touched. Code is container-rooted from
> `~/.viva/registry/assembly/`; the dataspace is
> `~/.viva/instances/droneaid/mountpoint/daemon_droneaid/droneaid.viva.db`.

---

# PART I — THE ASSEMBLY DOMAIN

## 1. What the domain is

A domain that says what a physical product *is*, as literals. Three ontologies and nothing else:

- **part** — what a thing IS. Geometry of its own (a GLB on the freight, or a generator), an
  interior (the placements that name it as their layer), or both. A part that carries `COUNTED` is
  a thing you order.
- **placement** — one occurrence of a part under a layer. It always places something: there is no
  hole, no kind, no empty node. Its identity is its layer and its path.
- **step** — one layer of change, with the builder's instructions. A part's `SEQUENCED.steps` is
  its layer stack, weakest first.

The one `TOPOGRAPHICAL` symbol on a literal says which ontology it is; the runtime subscriber throws
on two. Units are fixed and never negotiated: **metres, Y-up, quaternion xyzw** — glTF's node TRS
verbatim.

The repository is the only writer. The aperture is one nature per repository verb. The tools ride
the natures. There is no second road to a row.

## 2. Shape on disk

```
domain/assembly/
  assembly.viva.js
  schematics.js
  resolve.js
  aperture/
    index.js
  entities/
    index.js
    kernel/
      Literal.ts
      Symbol.ts
  generators/
    index.js
  tools/
    index.js
    mint.js
    layer.js
    fold.js
    line.js
  tests/
    literal.test.js
    aperture.test.js
    domain.test.js
    resolve.test.js
    tools.test.js
```

`assembly.viva.js`
The barrel. Five keys and nothing else — `entities · schematics · aperture · tools · manifest`.
Traits `EXPOSED · TOOLING`. 17 lines.

`schematics.js`
Every shape the domain speaks: `ONTOLOGIES`, the ten trait payloads, `VERBS` (the natures' inputs),
`SCENE · ROW · TREE` (what a screen lists). 188 lines. One description serves the payload in
`trait{}`, the repository verb's parameter, the tool's input and the harness's reading.

`resolve.js`
The fold as pure functions over plain rows — no entity manager, no flush. The App imports the same
file the repository does, so the browser folds exactly what the daemon folds. 106 lines.

`entities/kernel/Literal.ts`
The repository: the writer, the queries, the folds. 511 lines — the largest file in the package.

`entities/kernel/Symbol.ts`
The runtime symbol, extended with nothing. 20 lines. The vocabulary arrives from the topologies.

`generators/index.js`
Geometry built at read from `PARAMETRIC` — three.js without a DOM, so the daemon and the browser
build the same mesh. Three generators today: `fastener.bolt`, `fastener.standoff`, `fastener.nut`,
over ISO metric M2 · M3 · M4 · M5.

`tools/*.js`
The seven tools every assembly mode's agent shares, armed as `assembly_*`.

## 3. The three ontologies — declared

| ontology | traits allowed | layer | stack | live rows |
|---|---|---|---|---|
| part | LABELED SOURCED MODELED PARAMETRIC COUNTED SEQUENCED | yes | yes | 25 |
| placement | LABELED PLACED JOINED | no | no | 36 |
| step | LABELED INSTRUCTED PREPARED | yes | no | 0 |

`layer: true` means placements may name it. `stack: true` means it folds as its own layer plus its
steps in order. `mint` refuses any trait the ontology does not declare.

## 4. The traits — payload and live carriage

| trait | fields | ontology | rows carrying it |
|---|---|---|---|
| LABELED | name, description? | all | 61 |
| SOURCED | file, object?, scale?, url?, credit? | part | 18 |
| MODELED | file, tris?, bbox? | part | 18 |
| PARAMETRIC | generator, params | part | 0 |
| COUNTED | qty | part | 18 |
| SEQUENCED | steps[] | part | 25 |
| PLACED | layer, name, parent?, ref, translation?, rotation?, scale?, active?, params? | placement | 36 |
| JOINED | joins[], torque? | placement | 0 |
| INSTRUCTED | text[], warn?, images? | step | 0 |
| PREPARED | parts{slug:qty}, tools[] | step | 0 |

`SEQUENCED` is on all 25 parts because `mint` seeds it `{ steps: [] }`; **zero** carry a non-empty
list. `TORQUES` is the enum `loose · snug · tight`.

## 5. Identity — ruling 24, and the one place it is not yet true

- **A slug is unique in the daemon.** One name, one literal. `named(slug)` is the only lookup; every
  nature takes its subject by slug in its input. Nothing is derived from the caller.
- **`literal.mode` is an annotation**, optional, set at mint from the calling mode. It is not an
  owner and nothing resolves through it.
- **A placement's slug is computed, never invented**:
  `slugOf({layer, parent, name}) = layer + "." + (parent ? parent/name : name) with "/" → "."`.
  Placing the same path in the same layer again is therefore the same literal — an over by
  construction.
- **The live db still carries the old index.** `Literal_slug_mode_id_unique on (slug, mode_id)`.
  The runtime enforces slug-uniqueness; the schema still permits two modes to hold one slug. A
  migration to `unique(slug)` is OWED — until then the invariant is code-only.

## 6. The aperture — 12 natures

| nature | input | writes | returns |
|---|---|---|---|
| /part | VERBS.part | yes | literal |
| /step | VERBS.step | yes | literal |
| /placement | VERBS.placement | yes | literal |
| /sequence | part, steps[] | yes | literal |
| /move | slug, layer?, parent?, name? | yes | literal |
| /retract | slugs[], closure? | yes | {retracted[]} |
| /resolve | slug, upto? | no | fold |
| /bom | slug, upto? | no | {slug:count} |
| /closure | slug | no | literal[] |
| /tree | slugs? | no | TREE |
| /literals | ontology?, search?, limit | no | card[] |
| /geometry | generator, params | no | three.js JSON |

Six write, six read. The runtime slurps this into the daemon's root aperture and builds
`daemon.call` from it — a tool calls a nature through `daemon.call`, an App calls the same nature
over the wire.

## 7. The tools — 7, armed as `assembly_*`

| tool | nature it rides | file |
|---|---|---|
| assembly_part | /part | tools/mint.js |
| assembly_step | /step | tools/mint.js |
| assembly_placement | /placement | tools/layer.js |
| assembly_move | /move | tools/layer.js |
| assembly_sequence | /sequence | tools/layer.js |
| assembly_resolve | /resolve | tools/fold.js |
| assembly_bom | /bom | tools/fold.js |

`through(nature)` is one function: call `daemon.call[nature]` with `{ user, mode, thread, input }`,
return `{ message: line(row), entities: { literal: [row] }, object: { slug, ontology } }`. A tool's
input is its nature's input — no `owner`, no context-derived subject. The tools are armed on **every
thread of the daemon**, not only the editor's, because they are the domain's.

Domain tools are deliberately thinner than the aperture: there is no `assembly_retract` and no
`assembly_tree`. Destruction and the whole-daemon reading are the screen's, not a model's reflex.

## 8. The fold — `resolve.js`, the local half of LIVRPS

Pure functions over a `Map` of rows by slug (or a plain object). Seven exports:

- **`path(placed)`** — `parent ? parent/name : name`. A placement's address inside a fold.
- **`layerOf(rows, slug)`** — every placement whose `PLACED.layer` is this slug. A layer's contents
  live in the placements, never in the layer's own trait; a part with none is a leaf.
- **`interior(rows, slug)`** — whether that list is non-empty.
- **`fold(layers)`** — merge weakest-first by path; the same path again carries only what changes.
- **`stack(rows, slug, upto)`** — the part's own layer, then its steps, cut after `upto`
  (`0` = the base alone; absent = every step). A step's stack is itself.
- **`resolve(rows, slug, {upto})`** — the glTF-shaped tree: fold the stack, graft a placed part's
  interior under its own path (prefixing paths, parents and joins), drop `active: false`, then
  return `{ slug, placements[], parts{}, joints[], missing[] }`. Self-containment throws with the
  cycle named.
- **`bom(rows, slug, opts)`** — part → count for what the build uses. A placement of a `COUNTED`
  part counts; nothing *inside* a `COUNTED` part with an interior counts — a motor bought assembled
  is one line, not a line per piece.

## 9. What the repository refuses — the invariants, with their words

- `"x" is already a part — a slug is unique; name it deeper, or number it`
- `"x" is a part, not a placement` — an over may never change an ontology.
- `a part carries no PLACED — its traits are LABELED, SOURCED, …` — traits are per-ontology.
- `cannot place into "x" — a placement is not a layer`
- `"x" is a step — a placement places a part`
- `"x" already contains "y" — placing it here would eat itself` — containment is checked through
  `closure` before every place and every cross-layer move.
- `no symbol "x" — the vocabulary is what the topologies ship`; and, for the ontology root,
  `the symbol "part" is not installed — mount @assembly/topology/part`.
- `"x" still references y — retract those too, or none` — a dangling ref is not a state the domain
  holds.
- `no placement "x" in "y"` and `"x" is under "y" — a placement cannot move under itself`.

Two hard-won mechanics sit inside the writer:

- **`/move` computes its affected set BEFORE the rebase.** Re-slug the row, carry the family (every
  placement whose parent is under the old path, in the same layer), rewrite every join naming the
  old path — one flush.
- **`/retract` unhooks both sides of every edge before the remove.** The m:n cascade removes over
  whatever is loaded, and a symbol's inverse `literals` collection holds the literal *by
  propagation without ever being initialised* — the one hold the unit of work does not release. Hence
  `symbol.literals.removeWithoutPropagation(row)` on each, then flush, then remove, then flush.

## 10. The live dataspace — droneaid, measured

### 10.1 Totals

| figure | value |
|---|---|
| literals | 61 |
| parts | 25 |
| placements | 36 |
| steps | 0 |
| symbols installed | 71 |
| symbols attached to a literal | 2 |
| literal_uses edges | 72 |
| kit quantity (sum of COUNTED.qty) | 40 |
| triangles over all geometry | 23912 |
| GLB files on the mountpoint | 78 |
| mountpoint on disk | 490M |
| modes registered | 8 |
| threads · buffers | 3 · 4 |

Every one of the 61 literals carries `mode = editor/import`. Nothing in this dataspace was authored
by hand.

### 10.2 The parts

| slug | qty | tris | source object |
|---|---|---|---|
| antenna | 1 | 380 | Antenna.00 |
| antenna_2 | 1 | 632 | Antenna.01 |
| antenna_3 | 1 | 444 | Antenna.02 |
| antenna_fixture | 1 | 756 | AntennaFixture00 |
| antenna_fixture_2 | 1 | 92 | AntennaFixture02 |
| cam_holder | 2 | 104 | CamHolder1 |
| camera | 1 | 440 | Camera |
| computer | 1 | 32 | Computer |
| flight_control_separators | 8 | 496 | FlightControlSeparators (x8) |
| flight_controller | 2 | 92 | FlightController00 |
| frame_bottom | 1 | 2160 | Frame_Bottom |
| frame_spacers | 4 | 496 | FrameSpacers.00 (x4) |
| frame_spacers_2 | 2 | 124 | FrameSpacers.01 |
| frame_star | 1 | 624 | Frame_Star |
| frame_top | 1 | 1584 | Frame_Top |
| motor | 4 | 828 | Motor0 |
| motor_arm | 4 | 80 | Motor_Arm3 |
| propeller | 4 | 14548 | Propeller0 |
| antenna_4 | — | — | — |
| camera_2 | — | — | — |
| components | — | — | — |
| controller | — | — | — |
| drone | — | — | — |
| droneaid_model_latest | — | — | — |
| motor_2 | — | — | — |

18 parts carry geometry; 7 carry none — those seven are the blend's collections plus the import's
root, and they are parts because *a named composition is a part*. `propeller` alone is 14 548 of the
23 912 triangles (61%).

The only part nothing places is `droneaid_model_latest` — the single root of this dataspace.

### 10.3 The layers

| layer | placements | refs placed |
|---|---|---|
| drone | 10 | frame_star frame_top frame_bottom motor_arm×4 frame_spacers frame_spacers_2×2 |
| motor_2 | 8 | propeller×4 motor×4 |
| droneaid_model_latest | 6 | antenna_4 camera_2 components controller drone motor_2 |
| antenna_4 | 5 | antenna_fixture antenna_fixture_2 antenna antenna_2 antenna_3 |
| controller | 3 | flight_controller×2 flight_control_separators |
| camera_2 | 3 | cam_holder×2 camera |
| components | 1 | computer |

Seven layers, all of them parts (no step is a layer yet). 24 distinct parts are placed.

### 10.4 What the dataspace does NOT hold

| shape | rows |
|---|---|
| placements with a parent (nested inside a layer) | 0 |
| placements with rotation | 30 |
| placements with scale | 1 |
| placements with params | 0 |
| placements with active:false | 0 |
| placements carrying JOINED | 0 |
| steps of any kind | 0 |
| parts with a non-empty SEQUENCED | 0 |
| parts with PARAMETRIC | 0 |
| literals marked with a family/material/joint/source symbol | 0 |

**This table is the problem statement for Part III.** The importer filled the *what it is* half of
the ontology completely and the *how it is built* half not at all. Every trait that expresses
assembly — joints, torque, sequence, instructions, removal, nesting, parametric fasteners,
vocabulary — is empty.

### 10.5 The vocabulary installed but unused

| family | symbols | attached to literals |
|---|---|---|
| family | 24 | 0 |
| source | 8 | 0 |
| section | 8 | 0 |
| warn | 7 | 0 |
| tool | 7 | 0 |
| material | 6 | 0 |
| joint | 6 | 0 |
| roots (part · placement · step) | 3 | 61 |
| stale (component · assembly) | 2 | 0 |

`component` and `assembly` are leftovers of the ontology before the part/placement/step cut. They
are installed, unused, and OWED a purge.

## 11. Tests — measured this session

```
domain                    ok | 5 passed (40 steps) | 0 failed (1s)
```

Five suites: the repository (`literal.test.js`), the aperture (`aperture.test.js`), the barrel
(`domain.test.js`), the pure fold (`resolve.test.js`), the tools (`tools.test.js`). The rig is
`~/.viva/registry/assembly/tests/rig.js` over `provider` from `@vivalence/runtime/scenarios`, which
mounts the domain the way `resolution.domain` does: bind, slurp, `daemon.call`, the hook, http.

Pinned by name: a slug is unique · an over merges · a move carries children and rewrites joins ·
tree roots · retract closure · 12 natures and 7 tools with no `owner` in any input · `domain.resolve`
is undefined on the Die (a stray `resolve` export was once a boot-killer beneath 22 green steps).

**Standing coverage gap:** no runtime test calls `lifecycle.mount`. Unit-green over a hand-built rig
is not evidence the daemon boots.

---

# PART II — THE IMPORT MODE

## 1. What it is

`@assembly/editor/import` — the only way anything gets into the domain today. Drop a model file;
it walks `sniff → validate → decode → review → commit`, and what lands is parts and placements
minted through the domain's own natures. Nothing about the importer knows how to write a row: it
calls `/part` and `/placement` like any other caller.

Traits `MOUNTED · APPLICATION · STANDALONE · EXPOSED`. It has a seat — paladin gives it
`mountpoint/daemon_droneaid/mode_editor_import/` — and that is where the intake and the freight live.

## 2. Shape on disk

```
modes/editor/import/
  import.viva.js
  schematics.js
  sniff.js
  decode.js
  fold.js
  commit.js
  harvest.py
  cad.py
  aperture/
    index.js
  buffer/
    Import.svelte
    job.js
    scene.js
    parts/
      Queue.svelte
      Review.svelte
      Decode.svelte
      Node.svelte
      Stage.svelte
      Tree.svelte
  tests/
    import.test.js
    fixtures/
      harvest/
```

`sniff.js`
Magic bytes first, the extension only when there are none. 38 lines. Bytes win over the name.

`decode.js`
Finds blender and FreeCAD on the host, runs `harvest.py` headless (and `cad.py` first for a b-rep),
reads back `harvest.json`. 74 lines. Timeout 600 s per run.

`harvest.py`
Runs *inside* blender. Walks the scene's collections, exports one glTF per mesh object in its own
local frame, and writes the objects' TRS, bbox, triangle and vertex counts, materials, mirror axes
and hidden flags. 132 lines.

`cad.py`
Runs inside FreeCAD. OCCT tessellation of a b-rep to obj at a chord tolerance in millimetres.
41 lines.

`fold.js`
Pure: how many objects become how many parts, and what they are called. 126 lines.

`commit.js`
The only writer path: parts, then the root, then the collections, then the placements — each through
`daemon.call`. 78 lines.

## 3. The formats — 12

| format | extensions | route | declared up |
|---|---|---|---|
| glb | glb | blender import_scene.gltf | Y |
| gltf | gltf | blender import_scene.gltf | Y |
| blend | blend | blender native | Z |
| usd | usd usda | blender wm.usd_import | Y |
| usdz | usdz | blender wm.usd_import | Y |
| usdc | usdc | blender wm.usd_import | Y |
| fbx | fbx | blender import_scene.fbx | Y |
| obj | obj | blender wm.obj_import | Y |
| stl | stl | blender wm.stl_import | Z |
| 3ds | 3ds | blender io_scene_3ds | Z |
| step | step stp | FreeCAD OCCT → obj → blender | Z |
| iges | iges igs | FreeCAD OCCT → obj → blender | Z |

Every route ends in blender headless producing glTF 2.0, one file per object. Magic signatures are
read for BLENDER, glTF, Kaydara FBX, PXR-USDC, #usda, ISO-10303-21, 3DS (0x4d4d), zip (usdz), IGES
record columns, binary and ascii STL, JSON and OBJ keywords.

## 4. The pipeline — four natures

| nature | kind | input | yields/returns |
|---|---|---|---|
| /parse | stream | body + x-viva-name header, ?up= ?chord= | EVENT lines, last carries READING |
| /commit | stream | name, SETTINGS | EVENT lines, last carries MINTED |
| /revert | call | slugs[] | {retracted[], files[]} |
| /tree | call | slugs[] | TREE |

Stages and their progress marks: `sniff 0 · validate 20 · decode 40 · review 60 · commit 80 · 100`.
Log levels: `SNIFF OK WORK WARN FIX ONTO DONE FAIL`. Job states: `wait run parsed warn done fail`.

**`/parse` mints nothing.** It is the dry read: the file lands on the intake, blender reads it, and
the last line carries a `READING` — every object in the *file's own units*, what the file declares
about itself (`unit`, `up`), what was skipped (empties, cameras, lights), triangle and material
totals. Nothing is assumed; the operator chooses next.

**`/commit` refuses to assume.** `settled()` throws unless every one of `into · unit · up · fold ·
groups · hidden` is present: *"a commit takes every choice, made; nothing is assumed"*. The file is
decoded a **second** time under those settings, then minted.

**`/revert`** retracts the slugs the job minted through the domain's `/retract` and removes their
GLBs from the seat — so a job can be undone and the file stands parsed again. It is refused while a
row the job did not mint still references one of them.

**`/tree`** delegates to the domain's `/tree` with the job's own slugs. `[]` reads nothing; a
missing list is refused. Another buffer's rows never walk in.

## 5. The settings the operator chooses

| setting | type | default |
|---|---|---|
| into | string | the file's stem, humanized |
| unit | number > 0 | the declared unit, else 1 |
| up | Y \| Z | the declared axis |
| fold | fingerprint \| name \| none | fingerprint |
| groups | boolean | true |
| hidden | boolean | false |
| recentre | string? | absent |
| chord | number? (mm) | 0.05 for b-reps |

**The fold rule is the heart of the importer.** `fingerprint` = stem + triangle count + rounded
bbox; `name` = stem only; `none` = one part per object. The stem strips `(xN)`, `.NN` and trailing
digits. So `Motor0 Motor1 Motor2 Motor3` collapse to **one** part `motor` with **four** placements —
which is exactly the statement "this is one thing, occurring four times". `(x8)` in an object name is
read as eight welded copies and multiplies the count without multiplying the placements. A mirrored
instance never donates its GLB to the part: the first unmirrored one does.

## 6. What a commit writes

In order, all through `daemon.call`:

1. **Every folded part** — `/part` with `sourced { file, object, scale }`, `modeled { file, tris,
   bbox }`, `qty = placements × copies`. The GLB is copied from the intake to `parts/<slug>.glb` and
   admitted to the mode's freight.
2. **The root** — `/part` named from `settings.into`, no geometry. The one nothing places.
3. **Each collection**, parent-first — `/part` for the collection itself, then `/placement` of it
   into the collection above (or the root). A named composition is a part; that is what a part is.
4. **Every placement of every part** — `/placement { layer, name: "<slug>.<index>", ref, translation,
   rotation }` into its collection's layer, or the root's.

Slug collisions are suffixed `_2`, `_3` against **every slug in the daemon**
(`literal.find({}, { fields: ["slug"] })`) — an import never writes into what is there. That is why
the live dataspace holds `antenna_4`, `camera_2`, `motor_2`: the blend had a collection named the
same as a mesh object.

## 7. The screen

Two columns, six panes.

- **left** — `Queue` (the drop list, one row per job, with progress), `Review` (the settings beside
  what the file declared and what it yields, with a live preview of object/part/group/node counts
  and the scaled extent), `Decode` (the log, level-coloured, time-stamped).
- **right** — `Node` (the selected row's facts), `Stage` (three.js, the folded placements drawn from
  the freight, with an isolate filter and a preview overlay), `Tree` (the rows this buffer committed).

`Import.svelte` is 393 lines. The whole queue, every log line and every setting live in the buffer's
`data` — the tree is a *reading* of what the domain holds, never a copy of it.

## 8. Tests

```
modes/editor/import       ok | 3 passed (14 steps) | 0 failed (501ms)
```

Three suites: sniff (magic beats extension), commit (`stem · fold · preview · named` — the droneaid
harvest folds to 18 parts, arms and motors to one each with four placements), and the mode over the
rig (manifest · tree-empty · commit · tree · revert · parse-refusals · commit-refusals · hosts).

The fixture `tests/fixtures/harvest/blend.json` is the real harvest of `DRONEAID_model_latest.blend`
— blender 5.2.2 LTS, scale 0.05, origin `Frame_Star`, 30 parts — beside 30 real GLBs. A decode is a
live measurement, not a suite step: `P-hosts` reports whether blender and FreeCAD exist on the host
rather than pretending.

## 9. Where the importer stops

- It writes `part` and `placement`. It has never written a `step`, a `SEQUENCED` list, a `JOINED`
  payload, a symbol beyond the ontology root, or a nested placement.
- It flattens: every placement it mints sits at the root of its layer. 36 of 36, measured.
- Its geometry paths are **daemon-global**. `MODELED.file` is `parts/<slug>.glb`, and the browser
  resolves it through `daemon.getAsset({ path })` → `Cargo.resolve` → the daemon-wide
  `/metadata/cargo` catalog, keyed by flat path. The editor can read the importer's freight only
  because that namespace is flat and shared — which also means two modes admitting `parts/x.glb`
  would collide. Worth a ruling before a second mode writes geometry.
- It is not an editor. Every fact it wrote is a fact about the *file*. Every fact about the *build*
  is missing, and that is the editor's whole job.

---

# PART III — THE EDITOR, AS A DOSSIER

## 0. Terrain — what exists today

`@assembly/editor/assembly` landed 09-22 and was walked live once. Traits `APPLICATION · STANDALONE ·
EXPOSED · HARNESSED · TOOLING · CONVERSATIONAL`. 12 natures wrapped, 2 tools of its own, 9 files.

```
modes/editor/assembly/
  assembly.viva.js
  schematics.js
  harness.js
  aperture/
    index.js
  tools/
    index.js
  buffer/
    Assembly.svelte
    form.js
    scene.js
    parts/
      Tree.svelte
      Stage.svelte
      Inspector.svelte
      Steps.svelte
      New.svelte
  tests/
    assembly.test.js
```

| file | lines | what it holds |
|---|---|---|
| buffer/Assembly.svelte | 329 | the buffer mirror, the calls, the actions |
| buffer/parts/Inspector.svelte | 333 | the form drawn from the schematic |
| buffer/scene.js | 224 | the three.js stage and the gizmo |
| buffer/parts/Stage.svelte | 159 | the stage pane |
| buffer/parts/Steps.svelte | 143 | the sequence pane |
| buffer/parts/Tree.svelte | 116 | the tree pane |
| buffer/form.js | 106 | schema → fields → values → payload |
| harness.js | 96 | ontology · vocabulary · screen |
| buffer/parts/New.svelte | 90 | mint a part |

```
modes/editor/assembly     ok | 2 passed (10 steps) | 0 failed (314ms)
```

**It works, and it is not yet right.** Three things are wrong in the live instance right now, and
they are the dossier's starting point:

1. **It does not meet the operator empty.** Two `editor/assembly` buffer rows exist in droneaid, both
   carrying `{"subject":"droneaid_model_latest", …}` — created 13:48:58 and 14:20:07 on 09-22. The
   buffer row is durable, the App mirrors `buffer.$data` on mount, so re-opening the mode re-opens
   whatever was last on screen. beef, verbatim: *"WHY iS THERE A FUCKING DEFAULT OPEN AGAIN!!!!????
   I WANT TO FUCKING MEET AN EMPTY BUFFER!!! ANd THEN I SELECT!!!!!!!!!!!"* This is not walk residue
   alone — it is the design. It has to change.
2. **The stage draws grafted interiors flat.** `resolve` prefixes paths and parents when it grafts,
   but the stage composes each placement's TRS against the world, not against its parent's frame. A
   nested placement therefore lands in the wrong place the moment nesting exists.
3. **Mode calls go over a hand-built http `Connection`**, not the wired call proxy, because
   `Connection.aim` merges the body through `belt.object.merge`, whose default `arrayMergeStrategy`
   is `"unique"` — a rotation `[0,0,0,1]` leaves the client as `[0,1]` and the domain refuses it as
   *"must not have fewer than 4 items"*. Filed as `connection-aim-dedupes-arrays — OPEN`. Typology is
   holy; the one-line fix is beef's to take.

## 1. The problem space

The domain can express a complete product. The dataspace expresses a third of one. Measured, every
gap:

- **No steps.** 0 rows. The entire build-guide half of the ontology is unwritten. A drone with 40
  parts has no first move.
- **No sequence.** 0 parts carry a non-empty `SEQUENCED`. Nothing folds `upto` anything, so the
  `upto` control on the screen has nothing to do.
- **No joints.** 0 placements carry `JOINED`. Nothing in the dataspace says a bolt holds a plate to
  an arm, and nothing says how tight.
- **No nesting.** 36 of 36 placements sit at the root of their layer. The blend's hierarchy became
  seven flat layers instead of one tree.
- **No removal.** 0 placements carry `active: false` — nothing has ever been taken away by a later
  layer, which is how a step removes a jig.
- **No vocabulary.** 68 non-root symbols installed, 0 attached. Nothing is carbon, nothing is a
  fastener, nothing is bolted, nothing belongs to a section of the manual.
- **No parametric parts.** 0 rows, though three generators exist. Every bolt in the kit is missing
  entirely: the blend never modelled them, and no part can be *created* in the importer.

The editor is the instrument that turns that third into a whole. Its users are two: **beef**, who
authors the build, and **the model**, which does the same work through the same natures when told
to. Both act on the same rows, through the same six writes. There is no second road.

## 2. The laws

- **L1 — The editor meets you empty.** A buffer opens with no subject, no selection, nothing folded.
  The tree lists what the daemon holds and the stage is dark until the operator picks. Nothing
  restores, nothing remembers, nothing guesses. A subject appears when a human or a tool says a slug.
- **L2 — A slug is the address.** Every write names its subject by slug in the input. The screen
  never derives a subject from the caller, the mode, the selection or the last thing that happened.
  If you cannot name it, you cannot write it.
- **L3 — The form is the schematic.** The inspector's fields are drawn at runtime from
  `/schematics` — the domain's own `VERBS` and `TRAITS` as JSON schema. A field exists because the
  domain declares it. Add a trait to the domain and the form grows it without an edit here.
- **L4 — One road.** Every change the screen makes goes through a domain nature. The editor has no
  repository, no entity write, no special case. Its own two tools change only what is *on screen*.
- **L5 — The harness reads the screen, not its memory.** On every call the model is given the
  ontology (rendered from the schematic), the installed vocabulary, and the open buffer — the
  subject, the fold, the selection, every placement with its real path and slug. It uses those slugs
  and invents none.
- **L6 — No leaving the mode.** No file here imports outside this directory. The domain's shapes
  arrive at runtime through `daemon.domain.schematics` or over the wire. The buffer's schema is
  restated in the mode and pinned equal by a suite.
- **L7 — An over carries only what changed.** The identity always (a part its slug; a placement its
  layer, parent, name AND ref — `PLACED` requires the ref), then the fields that differ. A field
  emptied is not sent; the domain keeps what it has. Deletion is `/retract`, never a blank field.
- **L8 — Reading is free, writing is named.** `/tree`, `/resolve`, `/closure`, `/bom`, `/geometry`
  cost nothing and are called freely. The six writes are always the operator's or the model's
  explicit act, and each one refreshes the tree and the fold.

## 3. The screen — pane by pane

Two columns. Left is *what exists*; right is *what is open*.

**Tree** (left, top)
Every literal in the daemon as the domain's `/tree` lists it: a part nothing places at depth 0, its
own layer's placements under it, a placed part's interior grafted under that placement, its steps
after. Counts by ontology in the head. An isolate filter (`ALL · PART · PLACEMENT · STEP`) and a
search over slug and name. Colour by ontology — part, placement, step each have a token. A click
selects; a part or step click also opens it as the subject; a step click folds its part upto itself.

**New** (left, bottom)
Mint a part from nothing: slug, name, and optionally a generator. This is the only way a bolt enters
the kit today, and it must stay one field away.

**Stage** (right, top)
three.js. Draws the subject folded `upto`, one group per part, one node per placement, geometry from
the freight (`MODELED.file` through the cargo catalog) or from `/geometry` (`PARAMETRIC`). A
`TransformControls` gizmo in `translate · rotate · scale`; release sends one `/placement` over with
the new TRS. Clicking a mesh selects its placement by slug. An `upto` scrubber walks the stack.

**Inspector** (right, middle)
The selected literal, as a form generated from `VERBS[ontology]`. Field kinds derive from the JSON
schema: `enum` (a `v.enum` arrives as `anyOf` of consts), `flag`, `number`, `text`, `vector` (fixed
length, comma separated), `lines`, `json`. Each field shows the schematic's own description and its
`Example:` as placeholder. Save sends the over. Beside it: the symbol chips from `/vocabulary`,
grouped by family; a place control; a move control; and retract, which first shows the `/closure`
the retract would take and asks.

**Steps** (right, bottom)
The subject's `SEQUENCED` list, in order, reorderable, each row with its placement count. Add a step,
sequence it in, fold upto it. This pane is where the empty half of the ontology gets filled.

## 4. What the screen calls

| control | nature | write |
|---|---|---|
| tree / search | /tree | no |
| subject or upto change | /resolve | no |
| parametric part on stage | /geometry | no |
| retract, before asking | /closure | no |
| inspector save (part) | /part | yes |
| inspector save (step) | /step | yes |
| inspector save (placement), gizmo release, place | /placement | yes |
| move control | /move | yes |
| steps reorder / add | /sequence | yes |
| retract, confirmed | /retract | yes |

Plus the mode's own two: `/schematics` once on mount, `/vocabulary` once on mount.

## 5. The mode's own tools — the model's hands on the screen

| tool | input | effect |
|---|---|---|
| /open | slug, upto? | writes subject + upto to the buffer, clears selection |
| /select | slugs[] | writes selection to the buffer |

They write the buffer row directly (the newest of this mode on this thread) and return it in
`entities.buffer` so the screen updates through the subscription. They are the *only* two things in
the mode that write anything, and they write nothing in the domain. Everything the model does to the
rows, it does with the seven `assembly_*` tools — which are armed on every thread because they are
the domain's, not the editor's.

## 6. Interaction specifics that must hold

- **Select before act.** The inspector shows exactly one literal — a multi-select lights the stage
  and the tree but offers no form. Cmd/Ctrl-click toggles.
- **The gizmo's release is an over, not a stream.** One `/placement` per release, carrying the
  identity plus the TRS. No write while dragging.
- **A placement is never renamed by hand.** Its slug is `slugOf`. To change layer, parent or name,
  the move control calls `/move`, and the family and the joins follow.
- **Retract always shows its closure first.** The dialog lists every slug that would go, from
  `/closure`, and the confirm calls `/retract { slugs: [root], closure: true }`. What something
  outside still references stays — that is the fixpoint, and the operator should be able to see it.
- **Fold state is a view, not a fact.** `upto` lives in the buffer; the rows never change when it
  moves.
- **A failed call surfaces its own words.** The domain's refusals are written for a reader — they go
  on the screen verbatim, prefixed by the nature that refused.

## 7. What must be built, ranked

1. **Meet empty (L1).** The App must not adopt a stale subject. Either the buffer stops persisting
   `subject`/`selected`, or the App ignores them on mount and treats them as tool-written only. This
   is beef's open complaint and it outranks everything else.
2. **Steps, end to end.** Create a step, place into it, sequence it, fold upto it, see the stage
   change. This is the half of the ontology the dataspace has never exercised, and nothing proves the
   fold until a step exists.
3. **Joints.** `JOINED` on a placement: pick the placements it holds from the fold's real paths, set
   the torque, mark the `joint.*` symbol. Zero rows today.
4. **Nesting.** Parent a placement under another in the same layer, by `/move`. Then fix the stage:
   a grafted interior must compose its parent's frame, which it does not today.
5. **Vocabulary.** Chips that attach `material.* · joint.* · source.* · family.* · section.* ·
   warn.* · tool.*`. 68 symbols installed and 0 attached is the cheapest large win in the dataspace.
6. **Parametric parts.** `New` should offer the three generators with their params so a bolt can be
   minted without a file — the kit cannot be finished otherwise.
7. **Removal.** `active: false` on a placement in a later layer, with the stage showing the
   difference across `upto`.
8. **BOM pane.** `/bom` exists and nothing on the screen calls it. Kit qty beside what the build
   uses, per `upto`, is how the operator knows a step is complete.

## 8. Owed, and who owns it

- **beef** — the `Connection.aim` one-liner (typology is holy):
  `merge.withOptions({ arrayMergeStrategy: "replace" }, body, bodyBase)` at
  `subsystems/typology/prototypes/connection.js:101-105`. Until then the editor keeps its plain http
  `Connection`, which is the importer's precedent and works.
- **beef** — the mode's name. `editor/assembly` reads oddly next to the domain `assembly`;
  `editor/parts` or `editor/scene` were the alternatives.
- **beef** — commits (the registry has no VCS of its own), the stale `component`/`assembly` symbol
  purge, and the `(slug, mode_id)` → `(slug)` migration.
- **mine** — the grafted-interior frame composition on the stage; `ObjectLoader` cost per part; a
  unit control; `harvest.py`'s missing-node fallback; `recentre: "centre"` by bbox; substitution;
  undo; and the fact that the harness has never been driven by a live model (droneaid's hallucinator
  is filtered — empty key).

## 9. How it gets proven

- **Testimony, pre-registered** — *"I open the editor and meet an empty buffer. I click
  `droneaid_model_latest` in the tree and the drone appears. I create a step, place the bottom plate
  into it, sequence it first, drag `upto` to 0 and see nothing, to 1 and see the plate."*
- **Probes** — meet-empty (a fresh buffer's data is `{}` and the App renders no subject) · a step
  minted, placed into, sequenced, folded, and the fold's placement count changing with `upto` · a
  join written and read back on the fold's `joints` · a nested placement composing its parent's frame
  · a symbol attached and surviving an over that omits `symbols`.
- **The rule that holds it honest** — a recorded green is not a standing green. Re-run before citing.

---

## Provenance

| reading | source |
|---|---|
| code shapes, line counts | `~/.viva/registry/assembly/` |
| row counts, traits, layers, symbols | droneaid sqlite, read-only |
| test envelopes | `deno test -A --no-check --config deno.jsonc <dir>/` |
| freight, seat, disk | `~/.viva/instances/droneaid/mountpoint/` |
| beef's words | quest `m67-assembly-ontology.org`, rulings 13 · 14 · 24 |
| the transport defect | `.ikiro/known-issues.org` — connection-aim-dedupes-arrays |
