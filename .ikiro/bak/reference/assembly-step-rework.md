# assembly: the step rework — plan

Ruled: composition and process split; a step names its member placements by slug the way education's sentence names its tokens (`ANNOTATED.tokens[].literal`) and a conjugation its forms (`CONJUGATED.paradigm`); consumption derived; the trait named by ikiro.

## 1. The trait: `ASSEMBLED`

Register: `PLACED · JOINED · SEQUENCED · COUNTED · MODELED`. A step's `ASSEMBLED` is what it assembles: the occurrences it touches, each with the state it leaves them in. Every member says `active` outright; nothing is implied by being listed.

```js
// schematics.js
export const ASSEMBLED = v.object({
  placements: v.array(v.object({
    literal: v.string().desc('A placement\'s slug — <part>.<path>. Example: "drone.arm.0"'),
    active:  v.boolean().desc("true installs it or keeps it in the build; false takes it out from this step on. Example: true"),
    torque:  v.enum(TORQUES).optional().desc('For a fastener: how far it is done up after this step. Example: "loose"'),
  })).desc('The occurrences this step touches, in the order the hands do them. Example: [{ literal: "drone.arm.0", active: true }]'),
}).desc("What a step assembles: the placements it installs, tightens or removes, by slug, each with the state it leaves. Example: { placements: [{ literal: \"drone.arm.0/bolt.0\", active: true, torque: \"loose\" }] }");

export const ONTOLOGIES = {
  part:      { traits: ["LABELED","SOURCED","MODELED","PARAMETRIC","COUNTED","SEQUENCED"], layer: true,  stack: true  },
  placement: { traits: ["LABELED","PLACED","JOINED"],                                     layer: false, stack: false },
  step:      { traits: ["LABELED","INSTRUCTED","ASSEMBLED"],                              layer: false, stack: false },  // was: PREPARED, layer: true
};
```

`PREPARED` goes: parts consumed = derived (`bom` Δ), tools = `tool.*` symbols on the step (already shipped by `topology/step`). 0 step rows exist, so the enum member is dropped outright, not deprecated.

## 2. Slug laws after

| literal | slug | who writes |
|---|---|---|
| part | free | importer, editor, tools |
| placement | `<part>.<path>` — the layer is always a part now | importer, editor, tools |
| step | free; `<part>.<nn>` by convention in the guide editor | editor, tools |

`PLACED.layer` names a part, full stop. `active: false` in the composition = never in the finished thing (a jig).

## 3. The folds (`resolve.js`)

```js
resolve(rows, part)              // composition: base layer + grafts; active !== false. NO upto.
resolve(rows, part, { upto })    // state after upto own steps:
                                 //   1. composition as above, every path marked live = false   ← explicit: nothing before its step
                                 //   2. for step of SEQUENCED.steps.slice(0, upto), for member of ASSEMBLED.placements in order:
                                 //        path = pathOf(member.literal)   (own placement: its path; grafted: anchor/path — recorded during graft)
                                 //        live[path] = member.active; torque[path] = member.torque ?? torque[path]
                                 //   3. placements = live ones; joints read the final torque
bom(rows, part, { upto })        // unchanged code — rides the placements resolve returns
consumed(rows, part, n)          // bom(upto n) − bom(upto n−1): what step n uses. the guide's Prepare block, derived
```

§9.1 dissolves: step overs apply after the graft by construction. §9.3 dissolves: the base is the only layer. §9.2 (a built sub-assembly's own steps inlined before the parent step that installs it, sealed = `COUNTED` + interior, the bom rule): a pure `sequence(rows, part)` for the player, milestone B, not this change.

Order in `ASSEMBLED.placements` is the hands' order; ties across steps resolve by step order, last wins.

## 4. The writer (`Literal.ts`)

| method | change |
|---|---|
| `LiteralTraitsEnum` | `+ ASSEMBLED`, `− PREPARED` |
| `placement()` | layer must be a part (`ONTOLOGIES[layer].layer` does it — a step is `layer: false` now); `hostOf` gone, the host IS the layer |
| `step({ …, assembled, symbols })` | every `member.literal` must name a placement (`named`, ontology check) and sit in the closure of the part that sequences the step — when sequenced; unsequenced steps check existence only |
| `sequence(part, steps)` | + refuse a step whose members lie outside `closure(part)` |
| `references(row)` | `+ ASSEMBLED.placements.map(m => m.literal)` → `uses` edges step → placement; `in` on a placement answers "which steps touch me" |
| `move()` | the into-a-step branch gone; `+` rewrite `ASSEMBLED.placements[].literal` naming the old slug in every step, same flush as the joins rewrite |
| `retract()` | unchanged law: a placement a step still names is refused, name the step too or edit it first |
| `tree()` | step branch: `layerOf(step)` → members of `ASSEMBLED`, tail `n placements`; `scenery(step)` → `resolve(part, { upto: index+1 })` |
| `closure()` | unchanged — steps reach their placements through `references` |

## 5. Surfaces

| surface | change |
|---|---|
| `VERBS.step` | `− prepared`, `+ assembled: ASSEMBLED.properties.placements.optional()` |
| `VERBS.placement` | `layer` desc: a part |
| `VERBS.move` | `layer` stays (part → part re-home), desc drops "or a step of it" |
| `/step` valence | "…names the placements it installs, tightens or removes by slug" |
| tools | `assembly_step` follows `VERBS.step`; `line.js` says `step x · n placements` |
| harness `[Ontology]` | drawn from `ONTOLOGIES`/`TRAITS` — follows |

No new nature. `consumed` is two `/bom` calls or a pure helper the editor imports.

## 6. Editor and importer

| | touched? | what |
|---|---|---|
| `editor/import` | **no** | `commit.js` writes placements into `model.slug` or a collection part — parts only, already |
| `editor/assembly` | **one gesture + one count** | `onmoveinto(lane)` → `call("step", { slug: lane.key, assembled: [...members, { literal: placement, active: true }] })` instead of `/move { layer }`; `fold.js: lanes()` counts a step's `ASSEMBLED.placements` instead of placements in its layer. `[ ]`, `+ step`, `seq`, `/resolve { upto }` unchanged |
| `cli.js` `place … into <step>` | refused by the domain with its message; no code |

## 7. Tests

| suite | pins |
|---|---|
| `resolve.test.js` | `upto: 0` → no placements · install · tighten over (loose → tight) · remove (`active: false`) · a step over at a grafted path wins · `bom(upto)` and `consumed` Δ · `resolve(part)` ignores steps |
| `literal.test.js` | `step` refuses an unknown slug and a part slug · `placement` refuses a step as layer · `sequence` refuses a member outside the closure · `move` rewrites members · `retract` refuses a named placement · `uses` step → placement |
| `domain.test.js` | `VERBS.step` has `assembled`, no `prepared` |
| `editor/assembly/tests` | move-into lane → one `/step` over |
| `editor/import/tests` | green untouched — the proof it is not touched |

## 8. Data

0 step rows. The 122 rows are already composition-shaped. No migration. The two stale symbols `assembly`, `component` are yours (§4.3 of the brief).

## 9. Docs

`README.md ## the ontology`, `.ikiro/world/codemap/assembly.md` (the "a step is a LAYER" paragraph), `.ikiro/reference/assembly-domain-and-editor.md`, the brief §2–3 and §9.
