# DroneAid guide: technical design briefing

This brief is for rebuilding the build guide on the assembly domain and adding a tutorial editor that authors guides.

## 2. The ontology

### 2.1 Three ontologies, one entity

A **literal** is exactly one of `part`, `placement` or `step`. Its one `TOPOGRAPHICAL` symbol says which. The runtime subscriber stamps that as `row.ontology`, and it throws when a literal carries zero or two (`systems/runtime/entities/kernel/Literal.ts:141-149`).

```js
// domain/assembly/schematics.js — ONTOLOGIES
export const ONTOLOGIES = {
  part:      { traits: ["LABELED","SOURCED","MODELED","PARAMETRIC","COUNTED","SEQUENCED"], layer: true,  stack: true  },
  placement: { traits: ["LABELED","PLACED","JOINED"],                                     layer: false, stack: false },
  step:      { traits: ["LABELED","INSTRUCTED","PREPARED"],                               layer: true,  stack: false },
};
```

| ontology | what it is | layer? | stack? |
|---|---|---|---|
| `part` | what a thing IS: geometry, a kit count, an interior, or any mix | yes, its own base layer | yes: base, then its steps |
| `placement` | one occurrence of a part under a layer | no | no |
| `step` | one layer of change, plus instructions | yes | no, its stack is itself |

The column meanings, from the `ONTOLOGIES` code comment:
- **layer?** is whether placements may name this literal as their layer.
- **stack?** is whether the literal is a layer stack of its own layer followed by its SEQUENCED steps, weakest first.

**Laws** (rulings 21 and 24, and the code):
- **A slug is unique in the daemon.** A literal has no owner. `literal.mode` is only an annotation and nothing reads it.
- **A placement always has a `ref`.** A placement that places nothing does not exist. That invariant is what removed `group`.
- **A placement's slug is `<layer>.<path>`,** with `/` replaced by `.`. Placing the same layer + parent + name again is an over, by construction.
- **Two ways to nest, never blurred.** `parent` is structure inside ONE layer. A `ref` to a part that has an interior grafts that part's composition under the placement's path (reuse).
- **`JOINED` rides the fastener's placement.** The kind of joint is a `joint.*` symbol, not a field.

### 2.2 The trait payloads

These are verbatim from `schematics.js`. Units are metres, Y-up, quaternions xyzw: glTF node TRS as is.

```js
LABELED    { name: string, description?: string }

// part
SOURCED    { file: string, object?: string, scale?: number, url?: string, credit?: string }
MODELED    { file: string /* freight path of a GLB */, tris?: int, bbox?: [x,y,z] }
PARAMETRIC { generator: string /* "fastener.bolt" */, params: Record<string, any> }
COUNTED    { qty: int }                   // what makes it a thing you order
SEQUENCED  { steps: string[] }            // step slugs, weakest first

// placement
PLACED     { layer: string, name: string, parent?: PATH, ref: string,
             translation?: [3], rotation?: [4], scale?: [3], active?: boolean, params?: Record }
JOINED     { joins: PATH[], torque?: "loose" | "snug" | "tight" }

// step
INSTRUCTED { text: string[], warn?: string[], images?: string[] /* freight paths */ }
PREPARED   { parts?: Record<slug, int>, tools?: string[] /* tool.* symbols */ }
```

### 2.3 The database schema

This is the runtime base plus the assembly entities. It was measured with `.schema` on `droneaid.viva.db`.

```sql
CREATE TABLE "Literal" (
  id text PK, created_at, updated_at,
  slug text NOT NULL,
  trait json NOT NULL,                 -- { LABELED: {...}, PLACED: {...}, ... }
  symbol json NOT NULL DEFAULT '{}',
  ontology text NOT NULL DEFAULT '',   -- stamped from the TOPOGRAPHICAL symbol
  mode_id text NULL → Mode(id) ON DELETE SET NULL,   -- annotation only
  traits json NOT NULL DEFAULT '[]'    -- ["LABELED","PLACED",...], enum-validated on hydrate
);
CREATE UNIQUE INDEX Literal_slug_mode_id_unique ON Literal(slug, mode_id);   -- ⚠ see §4.4

CREATE TABLE Symbol (id PK, slug, traits json, trait json, mode_id → Mode);
CREATE TABLE symbol_literals (symbol_entity_id → Symbol, literal_entity_id → Literal);   -- m:n  literal.symbols
CREATE TABLE literal_uses   (literal_entity_1_id → Literal, literal_entity_2_id → Literal); -- m:n  uses ⇄ in
CREATE TABLE Buffer (id PK, status, data json DEFAULT '{}', view json, "index" int,
                     traits json, trait json, mode → Mode, thread → Thread);
-- + Mode · Thread · Turn · Intent · User · buffer_literals · buffer_symbols · _mikro_migrations
```

**The edge graph** (`uses` ⇄ `in`, written by `Literal.ts: uses()`):

```js
references(row) = [
  ...(row.PLACED ? [PLACED.ref, PLACED.layer] : []),  // a placement uses what it places AND its layer
  ...row.SEQUENCED.steps,                              // a part uses its steps
]
// in (reverse edge) answers:
//   "where is this part used"        → part.in  ∩ placements with ref = part
//   "what does this layer contain"   → layer.in ∩ placements with layer = it   (closure() walks this)
//   "which part owns this step"      → step.in  ∩ parts                        (hostOf())
```

### 2.4 The symbols: the vocabulary

| mount | family | slugs |
|---|---|---|
| `topology/part` | root + `material.*` ×6 + `source.*` ×8 | `part`, `material.{carbon,printed,fastener,electronics,motor,soft_goods}`, `source.{3d_scan,vendor_cad,print_stl,parametric,procedural_spline,photo_model,texture_only,none}` |
| `topology/placement` | root + `joint.*` ×6 | `placement`, `joint.{bolted,pressed,adhesive,tied,plugged,threaded}` |
| `topology/step` | root + `warn.*` ×7 + `tool.*` ×7 | `step`, `warn.{loose,tight,orientation,length,magnet,force,wires}`, `tool.{hex_2_0,hex_5_5,tweezers,wire_cutters,screw_gauge,bolt_organizer,marker}` |
| `droneaid/topography/model` | `family.*` ×24 + `section.*` ×8 | `section.{frame,motors,stack,vtx,rx,camera,top_plate,checklist}` (manual p3–35) |

A symbol is `{ slug, traits: ["ONTOLOGICAL","LABELED", +"TOPOGRAPHICAL" on the 3 roots], trait: { LABELED: {name, description} } }`.

**The guide already has its vocabulary:**
- `section.*` groups steps the way pt10's `section` string did.
- `warn.*` classifies warnings.
- `tool.*` fills `PREPARED.tools`.

---

## 3. The fold: how a step becomes the drone after step N

`resolve.js` is pure: it takes plain rows and needs no ORM. The browser and the repository run the same file.

```js
stack(rows, "drone", upto)   → ["drone", ...SEQUENCED.steps.slice(0, upto)]        // base, then steps
layerOf(rows, layer)         → placements whose PLACED.layer === layer
fold(layers)                 → Map<path, placement>   later layer wins per path (an over merges fields)
resolve(rows, slug, {upto})  → {
  slug,
  placements: [{ ...PLACED, path, children[], slug, symbols[], joins?, torque? }],   // active !== false only
  parts:      { [ref]: trait },       // what each placement draws
  joints:     [{ fastener, joins, torque?, symbols }],
  missing:    [ref],                  // a ref with no literal
}
bom(rows, slug, {upto})      → Map<partSlug, count>   COUNTED parts only; nothing under a sealed sub-assembly
```

A guide in data, as a worked example:

```js
// part "drone": SEQUENCED { steps: ["drone.01", "drone.02"] }
// placements:
{ slug: "drone.01.frame_bottom.0", PLACED: { layer: "drone.01", name: "frame_bottom.0", ref: "frame_bottom", translation: [...] } }
{ slug: "drone.01.motor_arm.0",    PLACED: { layer: "drone.01", name: "motor_arm.0",    ref: "motor_arm",    translation: [...] } }
{ slug: "drone.02.bolt_m3_16.0",   PLACED: { layer: "drone.02", name: "bolt_m3_16.0",   ref: "bolt_m3_16", ... },
                                   JOINED: { joins: ["frame_bottom.0", "motor_arm.0"], torque: "loose" } }
{ slug: "drone.03.bolt_m3_16.0",   PLACED: { layer: "drone.03", name: "bolt_m3_16.0", ref: "bolt_m3_16" },   // an OVER, same path
                                   JOINED: { joins: [...], torque: "tight" } }                               // "now tighten"

resolve(rows, "drone", { upto: 0 })  // base layer only
resolve(rows, "drone", { upto: 1 })  // + frame_bottom.0, motor_arm.0
resolve(rows, "drone", { upto: 2 })  // + the bolt, loose
// "what step N adds" = layerOf(rows, steps[N-1]), which the fold never needs to store
```

---

## 4. The instance

### 4.1 Recipe (shelf `~/.viva/instances/droneaid`)

```js
// instance.viva.js (trimmed)
export const datamap = { module: "@commons/datamap/libsql" };
export const hallucinators = [ "@commons/hallucinator/anthropic", "@commons/hallucinator/openrouter" ];  // keys via paladin.secret
export const daemons = [droneaid];
export const clients = [{ manifest: { type: "client", slug: "anima" } }];
export const services = [{ manifest: { type: "lighthouse", slug: "multiplayer" }, module: "@commons/lighthouse/multiplayer" }];

// daemon.js: the kernel = what mounts
kernel: [
  "@assembly/domain/assembly",
  "@assembly/topology/part", "@assembly/topology/placement", "@assembly/topology/step",
  "@droneaid/topography/model",
  "@assembly/editor/import",
  "@assembly/editor/assembly",
  "@commons/dashboard/dataspace",
]
```

**⚠ Drift between the two manifests.** The registry copy `~/.viva/registry/droneaid/instances/droneaid/daemon.js` still mounts `@droneaid/assembly/pt10` and lacks `@commons/dashboard/dataspace`. The shelf copy is the reverse. The shelf is yours and canonical, so the registry copy should align to it.

### 4.2 The mountpoint

```
mountpoint/
├── daemon_droneaid/
│   ├── droneaid.viva.db          425 kB
│   ├── migrations/               Migration20260921173305.ts · Migration20260922093530.ts
│   ├── mode_editor_import/       DRONEAID_model_latest.blend · intake/ · parts/*.glb (36)   ← MOUNTED seat
│   └── bundles/{editor,dashboard}
└── service_multiplayer/          multiplayer.viva.db · tokens.json
```

### 4.3 Database census (measured)

```
Mode      8   domain/assembly · topology/{part,placement,step} · topography/model
              · editor/import · editor/assembly · dashboard/dataspace
Literal 122   part 50 · placement 72 · step 0        (all mode = import)
Symbol   71   69 shipped + 2 STALE roots: "assembly", "component"  (old ontology; an upsert never deletes)
symbol_literals 122   every literal carries ONLY its root. No family.*, material.*, joint.*
literal_uses    144   = 72 placements × (ref + layer)
Buffer    8   import 1 · dataspace 2 · assembly 5 (4 on one thread)
Thread 5 · User 2 · Turn 0 · Intent 0
roots     2   droneaid_model_latest · droneaid_model_latest_2   ← the blend imported TWICE
```

The first import (`groups: true`) has this shape:

```
droneaid_model_latest                  (root part, LABELED + SEQUENCED{steps:[]})
├── drone        10 placements: frame_star, frame_top, frame_bottom, motor_arm ×4, frame_spacers, frame_spacers_2 ×2
├── controller    3: flight_controller ×2, flight_control_separators
├── components    1: computer
├── antenna_4     5: antenna, antenna_2, antenna_3, antenna_fixture, antenna_fixture_2
├── camera_2  …   cam_holder_2 ×2, camera_3
└── motor_2   …   motor_4 → propeller_2 ×4, motor_3 ×4
```

A leaf part as stored:

```json
{ "slug": "frame_bottom", "ontology": "part",
  "traits": ["LABELED","SOURCED","MODELED","COUNTED","SEQUENCED"],
  "trait": { "LABELED": { "name": "Frame Bottom" },
             "SOURCED": { "file": "DRONEAID_model_latest.blend", "object": "Frame_Bottom", "scale": 0.05 },
             "MODELED": { "file": "parts/frame_bottom.glb", "tris": 2160, "bbox": [0.28225, 0.002, 0.09699] },
             "COUNTED": { "qty": 1 },
             "SEQUENCED": { "steps": [] } } }
```

A placement as stored:

```json
{ "slug": "antenna_4.antenna.0",
  "trait": { "LABELED": { "name": "antenna.0" },
             "PLACED": { "layer": "antenna_4", "name": "antenna.0", "ref": "antenna",
                         "translation": [0.27406, 0.03532, 0.43915], "rotation": [0, 0.70711, 0, 0.70711] } } }
```

### 4.4 What this means for the guide

- **0 steps.** Every placement sits in a part's BASE layer. Authoring a guide means creating steps and moving placements out of the base into the step that installs them (§10.3).
- **The second import is a duplicate.** One `/retract { slugs: ["droneaid_model_latest_2"], closure: true }` clears it. I have not run it: it is your data.
- **The db's unique index is `(slug, mode_id)`, not `(slug)`.** "A slug is unique" is enforced by the repository only (`mint` → `findOne({slug})`), not by the database. It holds while the repository is the only writer.
- **No product vocabulary is attached.** The `family.*` marks were never applied, so a guide cannot group the kit by family until someone marks the parts.

---

## 5. Apertures and methods: the entire instance

### 5.1 How calls travel

```js
// natures of the DOMAIN are slurped into the daemon root → compiled into daemon.call
ctx.daemon.call["/part"]({ user, mode, thread, input })          // from a tool or a mode's own nature

// a mode's own natures ride under the mode, over the wire:
//   editor/assembly/buffer/Assembly.svelte:98-103
wire = new Connection(new Url(daemon.url), shard.transmitter.fetcher);
call = (verb, input) => wire.call(`/mode/${mode.type}/${mode.slug}/${verb}`, input);
// ⚠ NOT mode.call: the wired proxy merges bodies through belt.object.merge,
//   whose array strategy "unique" turns [0,0,0,1] into [0,1]  (known-issues: connection-aim-dedupes-arrays)

// entities from the client (the buffer is how a screen persists):
daemon.entities.buffer.updateOne({ id }, { data });
daemon.entities.buffer.subscribe({ id }, (row) => …);             // the tool → screen channel
```

### 5.2 `@assembly/domain/assembly`: 12 natures (`EXPOSED TOOLING`)

| nature | input | does |
|---|---|---|
| `/part` | `VERBS.part` `{slug, name?, description?, sourced?, modeled?, parametric?, qty?, symbols?}` | mint or over |
| `/step` | `VERBS.step` `{slug, name?, description?, text?, warn?, images?, prepared?, symbols?}` | mint or over |
| `/placement` | `VERBS.placement` `{...PLACED, label?, description?, joins?, torque?, symbols?}` | place or over; refuses a cycle at the write |
| `/sequence` | `{part, steps[]}` | sets `SEQUENCED`; every slug must be a step |
| `/move` | `{slug, layer?, parent?, name?}` | re-slugs a placement with its same-layer family, rewrites joins |
| `/resolve` | `{slug, upto?}` | the fold (§3) |
| `/bom` | `{slug, upto?}` | `{partSlug: count}` |
| `/closure` | `{slug}` | every literal the fold needs |
| `/tree` | `{slugs?}` (absent = every root, `[]` = nothing) | `TREE {rows, counts, parts}` |
| `/retract` | `{slugs[], closure?}` | unmint; refused while an unnamed literal references one |
| `/literals` | `{ontology?, search?, limit=500}` | cards |
| `/geometry` | `{generator, params}` | three.js JSON |

**Repository methods** (`Literal.ts`, the only writer): `named · symbolsNamed · mint · part · step · placement · sequence · move · retract · closure · resolve · bom · tree · references`, plus the static `slugOf(placed)`.

### 5.3 The domain's 7 tools: armed as `assembly_*` on EVERY thread of the daemon

`part · step · placement · move · sequence · resolve · bom`. Each tool's input is exactly its nature's input. The answer is `{ message, entities: { literal: [row] }, object }`. `/retract` is deliberately hand-only.

### 5.4 `@assembly/editor/import` (`MOUNTED APPLICATION STANDALONE EXPOSED`)

| nature | input | does |
|---|---|---|
| `/parse` | raw body, `x-viva-name`, `?up=&chord=` | dry run: yields `EVENT`s, the `READING` in source units, mints nothing |
| `/commit` | `{name, settings: {into, unit, up, recentre?, fold, groups, hidden, chord?}}` | decodes again and mints through `/part` + `/placement` |
| `/revert` | `{slugs[]}` | `/retract` + deletes GLBs |
| `/tree` | `{slugs[]}` | domain `/tree`, scoped to this buffer's commits |

`buffer.data`: `{ jobs[], active, node, isolate, running }`.

⚠ `schematics.js:27`: `ISOLATES` still reads `COMPONENT/ASSEMBLY`, which is stale from the old ontology.

### 5.5 `@assembly/editor/assembly` (`APPLICATION STANDALONE EXPOSED HARNESSED TOOLING CONVERSATIONAL`)

It has 13 natures:
- `/schematics` serves `ONTOLOGIES · TRAITS · VERBS` as JSON schema.
- `/vocabulary` serves the symbols grouped by family.
- The other 11 pass through to the domain: `/tree /resolve /bom /closure /part /step /placement /sequence /move /retract /geometry`.

It has three mode tools, each writing the thread's newest buffer of the mode:
- `/open {slug, upto?}`
- `/select {slugs}`
- `/isolate {isolate}`

The harness puts four blocks in `hallucination.system.assembly`: `[Ontology]`, `[Vocabulary]`, and `[Screen]` (the subject, the selection, and the folded placements with TRS).

`buffer.data` has 18 keys:
```
subject upto selected isolate gizmo opened trail cursor query line joins torque panes sizes draft draftOf move into
```

The screen is four panes: a tree with a line under it, the stage, the inspector, and a footer with the sequence lanes (↑ reorder, `+ step`, ◀▶ upto, move-into) and the bom.

**Most of the tutorial editor's layer-stack plumbing already exists here.**

### 5.6 `@droneaid/topography/model` (`DATASET FRAUGHT`)

It has no natures of its own:
- `Dataset` installs its 32 symbols at boot.
- `Freight("freight")` carries `manual/*.webp`.

### 5.7 `@commons/dashboard/dataspace` (`APPLICATION STANDALONE`)

It is a generic dataspace browser with no natures of its own.

### 5.8 `@droneaid/assembly/pt10` (NOT mounted)

It has one tool, `/step {step}`, and a freight carry: `mode.call.freight()` returns `{ file: { path, type, url } }` (§7).

---

## 6. How a mode works (the laws the guide must follow)

```js
// <slug>.viva.js: the whole contract
export const manifest = { type, slug, name, version, description, traits: [ … ] };
export const application = new App("buffer/X.svelte", v.buffer({ data: { /* every key the screen holds */ } }));
export const aperture = new Vector().open({ nature, valence, input, output? }, handler);  // EXPOSED wires it
export const harness  = new Vector().use(async (ctx, next) => { ctx.hallucination.system.<slug> = "…"; await next(); });
export const tools    = new Vector().open({ nature, valence, input }, handler);           // TOOLING arms them
export const freight  = new Freight("freight");                                           // FRAUGHT carries
```

| trait | means |
|---|---|
| `APPLICATION` | has an App, a buffer view |
| `STANDALONE` | its own design, no theme integration |
| `EXPOSED` | the aperture is on the wire |
| `MOUNTED` | owns a seat on the mountpoint (`mode_<type>_<slug>/`) to write files |
| `FRAUGHT` | ships a freight directory |
| `HARNESSED` | adds to the system prompt |
| `TOOLING` | arms tools |
| `CONVERSATIONAL` | anima's dock reaches this harness |

**Laws already paid for** (memory and codemap):
- **All screen state lives in `buffer.data`**: selection, cursor, drafts. `retain(patch, {soon})` sets the data locally, then persists it debounced.
- **A buffer `$effect` must not write a `$state` it also reads.** Keep `world` a plain `let`. Mount the stage in one effect keyed on `container`.
- **Render on demand.** A loop that renders every frame burned CPU.
- **A mode never imports outside its own directory.** It reaches shapes at runtime through `ctx.daemon.domain.schematics`. The browser imports `resolve.js` by path.
- **The dock is anima's.** No conversation pane inside a buffer.
- **No defaults, no preselection.** You said "no fucking default" four times.

---

## 7. pt10: the deprecated guide, dissected

```
modes/assembly/pt10/
  pt10.viva.js     type "assembly" · traits APPLICATION STANDALONE EXPOSED FRAUGHT HARNESSED TOOLING CONVERSATIONAL
                   buffer.data = { step: int = 0 }
  guide.js         ALL the data, hardcoded (107 lines)
  compose.js       glTF → parts: bake skinned meshes, split mesh ISLANDS by union-find on welded vertices,
                   pivot at bbox centre, auto-explode vector
  harness.js       ROLE + [Parts] + [Steps] + [Screen]; tool /step writes buffer.data.step
  buffer/Assembly.svelte   floating panel over the stage: TOC by section, detail, explode slider, sound, Back/Next
  buffer/scene.js  three.js: 5 camera views, settle animation, highlight, hover tip, click-to-jump, spin
  buffer/motor.js  WebAudio synthesized motor whine for the spin step
  freight/animated_drone.glb   815 kB, sketchfab "Animated Drone" CC-BY: a STAND-IN, not the DroneAid blend
  tests/{compose,harness}.test.js
```

### 7.1 The data shape (`guide.js`)

```js
export const guide = {
  model:   { asset: "animated_drone.glb", front: "+x", credit: "…CC-BY-4.0…" },
  guide:   { title: "10″ FPV drone", source: "DroneAid Hamburg · assembly manual v1.3.1 (EDTH 2026)" },
  explode: { radial: 0.55, up: 3.2, lift: 0.12 },
  animations: { spin: { axis: [0,1,0], rpm: 420, ramp: 2.5, sound: "motor",
                        parts: { "prop-fr": 1, "prop-rl": 1, "prop-fl": -1, "prop-rr": -1 } } },
  parts: [   // 22: a "part" = a set of mesh ISLANDS in the GLB
    { id: "frame",   label: "Frame (bottom plate + arms)", select: { mesh: "main_CuerpoDron_0", islands: [0] }, explode: [0,0,0] },
    { id: "fc",      label: "Flight controller",           select: { mesh: "main_CuerpoDron_0", islands: [6] }, explode: { lift: 0.4 } },
    { id: "prop-fr", label: "Propeller, front right",      select: { mesh: "h1_Helice_0", islands: [2,3,4] }, pivot: { part: "motor-fr" } },
    // …
  ],
  steps: [   // 16, index 0 = overview
    { section: "Frame", title: "Bottom plate and arms", view: "top", parts: ["frame"],
      text: ["Identify the top side…", "Set the arms into the hub…"],
      warn: ["Don’t tighten anything yet. Leave every bolt loose.", "18 mm bolts under the standoff positions, not 16 mm."],
      prep: { Parts: "Bottom plate, sandwich plate, arms ×4", Bolts: "16 mm ×6, 18 mm ×4", Tool: "Hex 2.0" } },
    // … Overview · Frame ×2 · Motors ×3 · Stack ×3 · VTX · Camera ×2 · Top plate · Props · Check ×2
    { section: "Check", title: "Spin up", view: "front", parts: [], play: "spin", text: […], warn: […], prep: {} },
  ],
};
```

### 7.2 Behaviour worth keeping: the learner's experience

- **The step rule.** Parts whose first step is later than the current one are hidden. At step N, the parts it names get a **settle**: they start exploded and ease in. Step 0 is the full **exploded overview**.
- **Explode.** Each part moves by `(centroid − centre)·radial` in x/z, plus `(y − min)·up + lift` in y. A part may override it. The slider scrubs between assembled and exploded.
- **Camera per step.** One of `iso top under front back`, computed from the bounds plus `front` (the model's forward axis). It eases with a cubic.
- **Highlight.** The current step's parts glow yellow (0.35 emissive). Hover shows 0.2 and a label tip.
- **Overview click.** In the overview, clicking a part jumps to the step that installs it.
- **Play.** The last step spins the props with a motor sound.
- **Harness.** `[Steps]` lists every step with its warnings. The ROLE says "warnings before instructions" and "never invent a bolt". The tool `/step` moves the learner's screen, and the buffer subscription makes it follow.
- **Panel.** A floating panel sits over the stage, and `camera.setViewOffset` shifts the model beside it.

### 7.3 Why it is deprecated

| pt10 | domain |
|---|---|
| a part is an island set of a stand-in GLB | a part is a literal with its own GLB (`MODELED`) from the real blend |
| steps and parts live in code | steps and placements are literals |
| `prep` is free strings ("16 mm ×6") | `PREPARED { parts: {slug: qty}, tools: [tool.*] }`, checked against `bom()` |
| `warn` is a free string | `INSTRUCTED.warn[]` text + `warn.*` symbols |
| `section` is a string | `section.*` symbols |
| positions are GLB world positions | `PLACED` TRS in the layer's frame |
| unmounted since the 09-21 purge; kept as M3's seed (m67 `* owed`) | |

---

## 8. Mapping pt10 onto the domain

```js
// guide.steps[i]  →  a step literal
{ slug: "<root>.<nn>",                               // e.g. "droneaid_model_latest.03"; naming is a fork (F6)
  traits: ["LABELED","INSTRUCTED","PREPARED"],
  trait: {
    LABELED:    { name: step.title },
    INSTRUCTED: { text: step.text, warn: step.warn, images: ["manual/2dab0a680257.webp"] },
    PREPARED:   { parts: { bolt_m3_16: 6, bolt_m3_18: 4 }, tools: ["tool.hex_2_0"] },
  },
  symbols: ["section.frame", "warn.loose", "warn.length"] }

// guide.steps[i].parts  →  placements MOVED from the base layer into that step's layer
/move { slug: "drone.frame_bottom.0", layer: "droneaid_model_latest.01" }

// guide.steps order  →  SEQUENCED on the root
/sequence { part: "droneaid_model_latest", steps: [".01", ".02", …] }

// step index 0 (overview)  →  NOT a step: upto 0 = base layer, and the overview is the player's view of the whole
```

| pt10 field | domain slot | status |
|---|---|---|
| `title` | `LABELED.name` | ✅ |
| `text[]` | `INSTRUCTED.text` | ✅ |
| `warn[]` | `INSTRUCTED.warn` + `warn.*` symbols | ✅ |
| `section` | `section.*` symbol | ✅ (droneaid ships 8) |
| `prep` | `PREPARED.parts` + `.tools` | ✅, but the free text needs parsing into slugs (F7) |
| `parts[]` (what the step installs) | placements with `layer = step` | ✅ via `/move` |
| manual images | `INSTRUCTED.images` | ✅ shape, ⚠ whose freight (F5) |
| `view` (camera) | — | ❌ no slot (F3) |
| `play` + `animations` | — | ❌ no slot (F4) |
| `explode` per part | — | derivable from TRS + bbox; an override has no slot |
| `pivot` | — | not needed: the importer's GLBs are in their local frame, with the pivot at the placement origin |
| `model.front` | — | ❌ no slot: the player needs a forward axis for the named views (F3) |

---

## 9. Findings in the fold that bite a guide

Each finding below was read from code, not run. Every one has a fork in §11.

### 9.1 A graft overwrites a root step's over at a grafted path

```js
// resolve.js: resolve()
const held = fold(stack(rows, slug, upto).map((layer) => layerOf(rows, layer)));   // root's stack, later wins
for (const [at, one] of [...held]) {
  if (!one.ref || !interior(rows, one.ref)) continue;
  const sub = resolve(rows, one.ref, {}, [...seen, slug]);
  for (const inner of sub.placements) held.set(prefix(at, inner.path), { ...inner, … });   // ← SET, not merge-under
}
```

Say a root step tries to over a path inside a grafted sub-part, for example tightening the bolt at `drone.0/bolt.0`. The graft runs after the fold and `set`s the interior's own version, so the step's opinion is lost. The stronger layer should win, as in USD's LIVRPS, where local layers beat references.

### 9.2 `upto` does not reach inside a grafted part

```js
const sub = resolve(rows, one.ref, {} /* ← no upto */, …);
```

A sub-assembly's own steps are always fully folded when grafted. There is no global "step N across the hierarchy". With `groups: true`, the imported drone is a hierarchy (`drone`, `controller`, `antenna_4`…). So a guide on the root can only install whole groups per step, never the frame's pieces one by one.

### 9.3 `interior()` checks the base layer only

```js
export const interior = (rows, slug) => layerOf(rows, slug).length > 0;   // base layer only
```

Take a sub-part whose placements have all been moved into its steps, with an empty base. It no longer counts as having an interior, so nothing is grafted and `bom` stops sealing it. Guide authoring empties base layers by design (§10.3), so this will bite right away.

### 9.4 `/move` keeps `parent`

```js
if (next.parent && !placements.some((h) => h.placed.layer === next.layer && pure.path(h.placed) === next.parent))
  throw new Error(`no placement "${next.parent}" in "${next.layer}"`);
```

A placement that is parented in the base cannot move alone into a step. The caller must pass `parent: ""` or move the parent first. The `groups: true` import parents nothing inside a group layer, so this matters mostly for hand-made hierarchies.

**Easiest path through §9.1–9.3:** re-import the blend with `groups: false` into a new root. The result is one flat base layer, so nothing grafts and every leaf is a direct placement of the root. A guide's step can then install any single piece. This needs no domain change. §9.1 and §9.3 still matter the moment a bought sub-assembly (a motor) gets its own guide.

---

## 10. The design

There are two modes over one set of literals:
- the **player** (the LMS half, pt10 rebuilt) for the learner;
- the **tutorial editor** for the author.

Neither mode owns data. The domain does.

```
            ┌──────────── domain/assembly (literals: part · placement · step) ────────────┐
            │ /step /placement /move /sequence /resolve /bom /tree   assembly_* tools     │
            └──────────────▲───────────────────────────────────────────▲──────────────────┘
                           │ reads                                      │ writes
          ┌────────────────┴──────────┐                  ┌──────────────┴──────────────┐
          │ guide player (pt10 reborn)│                  │ tutorial editor             │
          │ buffer.data: subject, step│                  │ buffer.data: subject, step, │
          │  explode, muted, done[]   │                  │  cursor, drafts, camera …   │
          │ harness: mentor           │                  │ harness: co-author          │
          │ tool: /step               │                  │ tools: open, select, go     │
          └───────────────────────────┘                  └─────────────────────────────┘
```

### 10.1 The player

**Manifest:**
```js
export const manifest = {
  type: "<F1>", slug: "<F1>",
  traits: ["APPLICATION", "STANDALONE", "EXPOSED", "HARNESSED", "TOOLING", "CONVERSATIONAL"],
};
```

**Buffer.** Every key the screen holds lives here:
```js
export const application = new App("buffer/Guide.svelte", v.buffer({ data: {
  subject: v.string().optional().desc('The part whose guide is open, by slug. Example: "drone"'),
  step:    v.integer({ minimum: 0 }).optional().desc("0 is the exploded overview; n is the stack folded upto n. Example: 3"),
  explode: v.number({ minimum: 0, maximum: 1 }).optional().desc("The slider. Example: 0.4"),
  muted:   v.boolean().optional().desc("Sound off. Example: true"),
  done:    v.array(v.string()).optional().desc('Steps the learner ticked, by slug. Example: ["drone.01"]'),
  camera:  v.record(v.string(), v.any()).optional().desc("The orbit the learner left, when they moved it. Example: {}"),
}}));
```

**Natures.** They pass through, as the editor's do:
```
/tree /resolve /bom /closure /geometry          (read-only; the player never writes a literal)
```

**The view, computed purely** (`buffer/fold.js`, testable like the editor's):
```js
const steps   = subject.trait.SEQUENCED.steps;                         // [slug]
const at      = resolve(rows, subject.slug, { upto: step });           // what is built
const before  = resolve(rows, subject.slug, { upto: step - 1 });
const fresh   = at.placements.filter((p) => !before.placements.some((q) => q.path === p.path)); // settle + glow
const tightened = at.joints.filter(/* torque differs from before */);  // "now tighten" steps light their bolts
const firstStep = (path) => steps.findIndex((_, i) => placed(resolve(rows, subject.slug, { upto: i + 1 }), path)); // overview click → jump
const explodeOf = (placement, bounds) => /* pt10 autoExplode, from world TRS + MODELED.bbox */;
```

**The stage.** Copy `editor/assembly/buffer/scene.js`, which already loads `MODELED` GLBs and places them through `frames()`. Grow it with pt10's settle, explode, named views, glow and hover tip, and render on demand. It uses raw three, like both editors.

**The harness.** It is pt10's harness with its sources swapped:
```js
ctx.hallucination.system.<slug> = [
  ROLE,                          // pt10's rules: warnings before instructions; never invent a bolt, a part or a step
  `[Steps]\n${…}`,               // from the subject's SEQUENCED steps: n · section · name · installs … · WARN … · PREPARED …
  `[Kit]\n${…}`,                 // bom(subject) with part names
  `[Screen]\n${…}`,              // subject, step n, what is fresh on screen
].join("\n\n");
```

**The tool.** `/step { step }` writes `buffer.data.step`, and the screen follows through `buffer.subscribe`. This is exactly pt10's tool.

### 10.2 The tutorial editor

**What it adds over `editor/assembly`.** The assembly editor is geometry-first. The tutorial editor is instruction-first, and it always shows what the learner will see at the step being written.

**Layout:**
```
┌ steps ──────────┬ stage (learner preview @ step n) ─────────────┬ step ─────────────────────────┐
│ § Frame         │                                               │ name     [Bottom plate…     ] │
│  01 Bottom plate│   fresh placements lit · earlier ones solid · │ section  [section.frame ▾]    │
│ ▸02 Standoffs   │   later ones hidden or ghosted                │ text     1 [Identify the top…]│
│ § Motors        │                                               │          + line               │
│  03 …           │   [capture view]  [preview as learner]        │ warn     1 [Don't tighten…] ⚑loose│
│  + step         │                                               │ images   [manual p5] [+ page] │
│                 │                                               │ tools    ⚒hex_2_0 ⚒tweezers   │
├ kit: not yet installed ─────────────────────────────────────────┤ prepared authored ⇄ bom Δ     │
│ frame_star ×1 · motor_arm ×4 · bolt_m3_16 ×6 …  (drag onto a step)│  bolt_m3_16 6 · 6 ✓           │
└─────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

**Buffer.** Everything on screen goes in the buffer, down to the unsaved draft:
```js
v.buffer({ data: {
  subject, step,                 // the root and the step on screen
  cursor, selected,              // cursor ≠ selection (the editor's navigation standard)
  opened,                        // section groups expanded
  draft, draftOf,                // the step inspector's unsaved edit, the verb's own shape
  camera,                        // a captured-but-unsaved view (F3)
  panes, sizes, query,
}})
```

**Every gesture is one existing domain nature:**

| gesture | nature |
|---|---|
| `+ step` | `/step {slug, name}` then `/sequence {part, steps: [...steps, slug]}` |
| reorder a step (drag or ↑↓) | `/sequence {part, steps}` |
| rename or edit text, warnings, images | `/step {slug, text?, warn?, images?}` (an over) |
| section or warn chip | `/step {slug, symbols: [...]}` (the whole set again) |
| tools, prepared | `/step {slug, prepared: {parts, tools}}` |
| drag a kit part onto a step | `/move {slug, layer: step, parent: ""}` |
| drag a placement between steps | `/move {slug, layer: other}` |
| take a placement out of a step | `/move {slug, layer: subject}` (back to the base) |
| "tighten in this step" | `/placement {layer: step, name, ref, parent?, torque: "tight", joins}` (an over at the same path) |
| remove in a later step | `/placement {…, active: false}` |
| delete a step | `/retract {slugs: [step]}`: refused while placements name it, so move them out first; the Retract dialog already lists the closure |
| capture view | F3 |

**"prepared authored ⇄ bom Δ"** is the pt10 prep text made checkable:
```js
const needed = diff(bom(rows, subject, { upto: n }), bom(rows, subject, { upto: n - 1 }));  // what step n consumes
// show authored PREPARED.parts beside it; one click copies needed → /step { prepared: { parts: needed } }
```

**Natures.** The editor is `EXPOSED` and passes these through:
```
/schematics /vocabulary /tree /resolve /bom /closure /step /placement /move /sequence /retract
+ /pages   (NEW, mode-local) the manual images on offer, i.e. the topography's freight catalog (F5)
```

**Tools.** The domain's `assembly_*` tools are already armed on every thread, and they do the writing. The mode adds only screen tools:
```
/open { slug }   /go { step }   /select { slugs }
```

**Harness.** It is the assembly editor's `[Ontology]` + `[Vocabulary]`, plus a `[Guide]` block: every step with what it installs, and the kit parts not yet installed. The model can then do "draft steps 4–6 from manual pages 14–16" through `assembly_step`, `assembly_move` and `assembly_sequence`. The hand reviews the result, since `/retract` stays hand-only.

### 10.3 The authoring flow on the real data

```
1. /commit  blend · { into: "DroneAid", unit: 0.05, up: "Z", fold: "fingerprint", groups: false, hidden: false }
            → one root, one flat base layer, every leaf a placement                          (fixes §9.1–9.3 by shape)
2. /retract { slugs: ["droneaid_model_latest_2"], closure: true }  (+ the first import when the flat one replaces it)
3. seed:    16 pt10 steps  → /step × 15 (step 0 is the overview, not a literal)  → /sequence
            text · warn · section from guide.js; images from manual.md page ↔ freight/manual/*.webp
4. author:  drag each kit placement from the base into its step (the kit tray empties as the guide completes)
            base empty ⇒ upto 0 = nothing built, upto 15 = the drone
5. check:   every step's PREPARED ⇄ bom Δ green · no placement left in the base · player walks 0..15
```

**Seed sources**, weighed:

| source | has | lacks |
|---|---|---|
| `pt10/guide.js` | 16 curated English steps, text, warn, sections | slugs of real parts; its parts are islands |
| `bak/dataset/literals/steps.json` | steps `frame.01…` with images and `PREPARED` | old ontology (`COMPOSED`, `PREPARED.components`), frame section only |
| `~/Downloads/droneaid-manual/manual.md` | 37 pages, the authority for where each screw goes (m67 intent) | structure, which has to be read |

---

## 11. Forks: yours to rule

**F1: Where the two modes live, and their names**

```js
// before: the guide is product code
"@droneaid/assembly/pt10"                       // type assembly, slug pt10, hardcoded guide.js

// after (a): generic, in @assembly; the product supplies only literals
"@assembly/<type>/<slug>"                       // the player: any part with SEQUENCED steps is a guide
"@assembly/editor/<slug>"                       // the tutorial editor, beside editor/import and editor/assembly

// after (b): in @droneaid, as m67 "* milestones" planned
"@droneaid/guide/pt10"
```

I recommend (a). Nothing in §10 names a drone, and `@assembly` "never names a plate, an arm or a frame section". The names are yours; I have not picked any.

**F2: A separate tutorial editor, or grow `editor/assembly`**

```js
// (a) new mode: its own buffer, instruction-first screen, shares natures through the domain
// (b) editor/assembly grows a "guide" pane: its Sequence footer already has lanes, reorder, + step, upto, move-into
```

I recommend (a). The subject and the dominant pane differ: the assembly editor is a geometry tree, the tutorial editor a step list with a learner preview. (b) is cheaper, but it pushes a 4-pane screen to 6. Code sharing is bounded by the law that a mode imports only inside its own directory, so `scene.js`, `fold.js` and `form.js` get copied, as `scene.js` already was between import and editor.

**F3: The camera per step (and the model's forward axis)**

```js
// before: pt10 guide.js
{ view: "top" }   +   model: { front: "+x" }

// (a) symbols. No schema change; a view.* family in topology/step
symbols: ["view.top"]                                        // presets only; forward axis still has no slot

// (b) a new step trait. The name is yours; "<VIEW>" is a placeholder, not a proposal
LiteralTraitsEnum.<VIEW>   // + ONTOLOGIES.step.traits
{ preset?: "iso"|"top"|"under"|"front"|"back", position?: [3], target?: [3] }   // metres, in the subject's frame
```

I recommend (b). "Capture the view" is the editor's core gesture, and a symbol cannot hold a pose. It needs an enum member and a schematic, and the traits column is json, so there is no db migration. Per memory `trait-enum-migration`, an appended member is safe. The forward axis would then be a part-side field, which is a second fork inside this one.

**F4: `play: "spin"` with the motor sound**

```js
// before: guide.animations.spin { axis, rpm, ramp, sound, parts: { "prop-fr": 1, … } }
// (a) drop it: "Spin up" becomes a plain step
// (b) a player-local effect keyed on a symbol (e.g. a joint.* or a new family) + params on the placement
```

I recommend (a) now and (b) as a deferred item. It is product flavour, not guide structure.

**F5: Whose freight `INSTRUCTED.images` names**

```js
// before: images: ["manual/cf5a470bc835.webp"]   // a freight path, with no mount in it
// the pages sit on @droneaid/topography/model's freight; the player/editor live in @assembly
// (a) the player and editor resolve images against every FRAUGHT mount of the daemon (first hit wins)
// (b) the path carries its mount: "@droneaid/topography/model:manual/cf5a….webp"
// (c) the editor is MOUNTED and uploads its images to its own seat (the importer's /upload idiom)
```

I recommend (b), plus (c) for new images later. An unqualified path is ambiguous as soon as two topographies ship a `manual/`. `MODELED.file` has the same shape (`parts/x.glb`, resolved against the importer's seat), so this ruling should cover both.

**F6: Step slugs**

```js
// before (bak/steps.json): "frame.01"                 section-scoped
// (a) "<root>.<nn>"   e.g. "droneaid.03"               a guide owns its steps; reorder ≠ rename
// (b) "<section>.<nn>"                                 collides across two guides of one daemon
```

I recommend (a), since slugs are daemon-unique. Numbering is only a name: the order lives in `SEQUENCED`, so a reordered guide keeps its slugs.

**F7: `PREPARED` in the seed**

```js
// before: prep: { Bolts: "16 mm ×6, 18 mm ×4", Tool: "Hex 2.0" }          // free text
// after:  prepared: { parts: { bolt_m3_16: 6, bolt_m3_18: 4 }, tools: ["tool.hex_2_0"] }
```

The blend has no bolts: the m67 quest lists 11 parametric fastener parts still owed. So `PREPARED.parts` can only name bolts once those parts exist. Until then there are two choices:
- seed `tools` only and carry the bolt lines as `INSTRUCTED.text`;
- mint the fasteners first (`/part {parametric: {generator: "fastener.bolt", params: {thread: "M3", length: 16}}, qty}`).

I recommend minting the fasteners first. That makes bom Δ meaningful from step 1.

**F8: The fold findings §9.1–9.3**

```js
// §9.1 before                                          // after: a stronger layer wins over the graft
held.set(prefix(at, inner.path), { ...inner, … })       if (!held.has(p)) held.set(p, g); else held.set(p, { ...g, ...held.get(p) })
// §9.2 before                                          // after
resolve(rows, one.ref, {}, …)                           // unchanged: a sub-assembly is built before it is placed
// §9.3 before                                          // after
layerOf(rows, slug).length > 0                          stack(rows, slug).some((layer) => layerOf(rows, layer).length)
```

I recommend fixing §9.1 and §9.3 in `resolve.js` with a test each, and leaving §9.2 as it is. It matches the physical build: you install a finished motor. The flat re-import (§10.3 step 1) sidesteps all three for this guide either way. This is `@assembly`, not typology, but it is a fold every mode reads, so it needs your go.

**F9: Learner progress**

```js
// (a) buffer.data.done[]: per buffer, the law as it stands, zero schema
// (b) a per-user record in the dataspace (the LMS half proper: who finished which guide)
```

I recommend (a) now. (b) is its own quest.

---

## 12. Proposed milestones (numbering is yours)

| | what | closes when |
|---|---|---|
| A | the data: flat re-import; retract both old roots; fasteners minted (F7); 15 steps seeded from pt10 + manual; placements moved | `tree` shows the root, the base empty, every step with ≥1 placement or an explicit no-geometry step; `bom(upto: 15)` equals the kit |
| B | the player: pt10's screen over `resolve(upto)` (settle, explode, glow, overview jump, views, harness, `/step`) | a pure `fold.js` suite; server-render through `tests/render.js`; walked in anima 0 → 15 |
| C | the tutorial editor: step list, preview stage, step inspector, kit tray, bom Δ, `/pages` | a suite per gesture → nature; a fresh buffer is empty; walked: author one step end to end |
| D | fold fixes (F8), the view trait (F3), and image paths (F5) | as you rule them |

**Tests follow the existing pattern:**
- `tests/rig.js` for a daemon with the topologies mounted;
- a suite per mode;
- `fold.js` pure and pinned against `resolve.js`;
- the view rendered server-side through `tests/render.js`.

**Before anything is written, the owed items still stand:**
- commits in `assembly`, `droneaid` and the repo;
- the registry `daemon.js` aligned to the shelf copy (§4.1).
<context files="0" tokens="~0">

</context>
