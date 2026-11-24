# limit: 60000 chars
# builder: the stage's milestones 4 · 5 onto a COPY of the assembly package, each replace asserted to hit its count.
# usage: python3 .ikiro/reference/m127/stage-4.build.py <root holding assembly/> <stop> [<stop> …]
# stops: s1 own colour · s2 the drawing (pose · label · callout) · s5 model editor colour · s6 guide editor pieces · s7 callout tools
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]) / "assembly"
HUNKS = Path(__file__).parent / "stage-4"
GUIDES = ["modes/guide/editor/buffer/kit", "modes/guide/player/buffer/kit"]
KITS = [*GUIDES, "modes/model/editor/buffer/kit"]
EDITOR = "modes/guide/editor/buffer"
PLAYER = "modes/guide/player/buffer"
MODEL = "modes/model/editor"


def swap(path, old, new, count=1):
    file = ROOT / path
    text = file.read_text()
    assert text.count(old) == count, f"{path}: {text.count(old)} hits, wanted {count}, of {old[:70]!r}"
    file.write_text(text.replace(old, new))


def before(path, anchor, new):
    swap(path, anchor, new + anchor)


def after(path, anchor, new):
    swap(path, anchor, anchor + new)


def hunk(name):
    return (HUNKS / name).read_text()


def s1():
    after(
        "domain/assembly/resolve.js",
        "  ...(row.trait.JOINED?.joins && { joins: row.trait.JOINED.joins }),\n",
        "  ...(row.trait.STAGED?.colour && { colour: row.trait.STAGED.colour }),\n",
    )
    swap(
        "domain/assembly/resolve.js",
        "  const placements = live.map((one) => ({ ...one, path: path(one), children: live.filter((child) => child.parent === path(one)).map(path) }));\n",
        "  const placements = live.map((one) => ({\n"
        "    ...(parts[one.ref]?.STAGED?.colour && { colour: parts[one.ref].STAGED.colour }),\n"
        "    ...one,\n"
        "    path: path(one),\n"
        "    children: live.filter((child) => child.parent === path(one)).map(path),\n"
        "  }));\n",
    )
    carried = "...(one.scale && { scale: one.scale }),\n"
    for kit in KITS:
        after(f"{kit}/frames.js", "      " + carried, "      ...(one.colour && { colour: one.colour }),\n")
        swap(
            f"{kit}/scene.js",
            '          material.userData.colour = material.color?.clone() ?? new THREE.Color("white");\n',
            '          const filed = material.color?.clone() ?? new THREE.Color("white");\n'
            "          material.userData.colour = at.colour ? palette.tint(at.colour) : filed;\n",
        )
    after(f"{MODEL}/buffer/Assembly.svelte", "        " + carried, "        ...(one.colour && { colour: one.colour }),\n")
    before("domain/assembly/tests/resolve.test.js", '  it("P-missing:', hunk("resolve.test.js"))


def s2():
    for kit in KITS:
        swap(
            f"{kit}/frames.js",
            "    grouped.get(one.ref).push({\n"
            "      path: one.path,\n"
            "      slug: one.slug,\n"
            "      parentMatrix: parents.get(one.path),\n"
            "      ...(one.translation && { translation: one.translation }),\n"
            "      ...(one.rotation && { rotation: one.rotation }),\n"
            "      ...(one.scale && { scale: one.scale }),\n"
            "      ...(one.colour && { colour: one.colour }),\n"
            "    });\n",
            "    grouped.get(one.ref).push(node(one, parents));\n",
        )
        before(f"{kit}/frames.js", "// what the stage draws for a fold:", hunk("frames.node.js"))
        scene = f"{kit}/scene.js"
        swap(
            scene,
            "      const matrix = new THREE.Matrix4().fromArray(at.parentMatrix ?? IDENTITY);\n"
            "      const translation = numbers(at.translation, 3) ?? [0, 0, 0];\n"
            "      const rotation = numbers(at.rotation, 4) ?? [0, 0, 0, 1];\n"
            "      const scale = numbers(at.scale, 3) ?? [1, 1, 1];\n",
            "",
        )
        swap(
            scene,
            "      const local = new THREE.Matrix4().compose(new THREE.Vector3().fromArray(translation), new THREE.Quaternion().fromArray(rotation), new THREE.Vector3().fromArray(scale));\n"
            "      group.applyMatrix4(matrix.clone().multiply(local));\n",
            "",
        )
        swap(
            scene,
            "      group.userData = { slug: at.slug, path: at.path, ref: id, active: at.active, inverse: matrix.clone().invert(), base: group.position.clone() };\n",
            "      group.userData = { slug: at.slug, path: at.path, ref: id, active: at.active };\n"
            "      seat(group, at);\n",
        )
        before(scene, "  const mount = (id, built, nodes, malformed) => {\n", hunk("scene.seat.js"))
        after(scene, "    raise,\n", "    seat,\n")
        swap(
            scene,
            "onFault = () => {}, select = false } = {}) => {\n",
            "onFault = () => {}, onPins = () => {}, select = false } = {}) => {\n",
        )
        swap(
            scene,
            "  let S = { status: {}, tints: {}, labels: {}, selected: new Set(),",
            "  let S = { status: {}, tints: {}, labels: {}, seats: {}, pins: [], selected: new Set(),",
        )
        swap(
            scene,
            "  const made = world(container, { onCamera, onFrame: settling });\n",
            "  const made = world(container, {\n"
            "    onCamera: (elements) => {\n"
            "      onCamera(elements);\n"
            "      onPins(spots());\n"
            "    },\n"
            "    onFrame: settling,\n"
            "  });\n",
        )
        swap(
            scene,
            "      made.dress(group, { status, picked: S.selected.has(slug), hover: hovered === group.userData.path, tint: S.tints[slug] ?? null });\n",
            "      made.dress(group, { status, picked: S.selected.has(slug), hover: hovered === group.userData.path, tint: S.tints[slug] ?? null });\n"
            "      if (S.seats[group.userData.path]) made.seat(group, S.seats[group.userData.path]);\n",
        )
        before(scene, "  const view = (name) => made.go(", hunk("scene.spots.js"))
        swap(
            scene,
            "  // what the screen says about the placements — status, tints, labels, explode, the step's view\n",
            "  // what the screen says about the placements — status, tints, labels, seats, pins, explode, the step's view\n",
        )
    for kit in GUIDES:
        before(f"{kit}/guide.js", "// the parts a fold's kit holds, part → count, with the part's card\n", hunk("guide.posed.js"))
        stage = f"{kit}/Stage.svelte"
        after(stage, "    labels = {},\n", "    seats = {},\n    pins = [],\n    asset = (path) => path,\n")
        after(stage, "    onfault = () => {},\n", "    onimage = () => {},\n")
        after(stage, "  let hover = $state(null);\n", "  let spots = $state.raw([]);\n  let wide = $state(0);\n  let tall = $state(0);\n")
        after(stage, "        onHover: (one) => (hover = one),\n", "        onPins: (list) => (spots = list),\n")
        swap(
            stage,
            "    const next = { status, tints, labels, explode, overview, step, view, selected, ghost };\n",
            "    const next = { status, tints, labels, seats, pins, explode, overview, step, view, selected, ghost };\n",
        )
        after(stage, '  export const home = () => go("step");\n', hunk("Stage.drawn.js"))
        swap(
            stage,
            '<div class="stage" bind:this={host} onpointerdown=',
            '<div class="stage" bind:this={host} bind:clientWidth={wide} bind:clientHeight={tall} onpointerdown=',
        )
        swap(
            stage,
            '    <div class="tip" style="left:{hover.x}px;top:{hover.y}px">{hover.label}</div>\n  {/if}\n</div>\n',
            '    <div class="tip" style="left:{hover.x}px;top:{hover.y}px">{hover.label}</div>\n  {/if}\n' + hunk("Stage.pins.svelte") + "</div>\n",
        )
        before(stage, "  .cube-wrap {\n", hunk("Stage.pins.css"))

    view = f"{PLAYER}/Guide.svelte"
    swap(view, 'import { entries as entriesOf } from "./kit/frames.js";', 'import { entries as entriesOf, seats as seatsOf } from "./kit/frames.js";')
    swap(
        view,
        "import { anchored, chips as chipsOf, installs, kit as kitOf, pad, sections as sectionsOf, statuses, tints as tintsOf } from",
        "import { anchored, chips as chipsOf, installs, kit as kitOf, pad, pins as pinsOf, posed, sections as sectionsOf, staged as saidOf, statuses, tints as tintsOf, tone } from",
    )
    after(
        view,
        "  const tints = $derived(tintsOf(steps, step, fold));\n",
        "  const said = $derived(saidOf(steps, step, fold));\n"
        "  const seats = $derived(fold ? seatsOf(posed(fold, said)) : {});\n"
        "  const pins = $derived(fold ? pinsOf(steps, step, fold, body?.notes) : []);\n",
    )
    swap(view, '  const kindClass = (note) => (note.kind === "TIP" ? "tip" : note.kind ? "warning" : "plain");\n', "")
    swap(view, "kindClass(note)", "tone(note)", 2)
    after(view, "      {labels}\n", "      {seats}\n      {pins}\n      {asset}\n      onimage={openBox}\n")

    view = f"{EDITOR}/Guide.svelte"
    swap(view, 'import { entries as entriesOf } from "./kit/frames.js";', 'import { entries as entriesOf, seats as seatsOf } from "./kit/frames.js";')
    swap(
        view,
        "import { free, installs, kit as kitOf, nextStep, pad, restaged, sections as sectionsOf, statuses, tints as tintsOf } from",
        "import { free, installs, kit as kitOf, nextStep, pad, pins as pinsOf, posed, restaged, sections as sectionsOf, staged as saidOf, statuses, tints as tintsOf } from",
    )
    after(
        view,
        "  const tints = $derived(tintsOf(stepsWithDraft, stageStep, fold));\n",
        "  const said = $derived(saidOf(stepsWithDraft, stageStep, fold));\n"
        "  const seats = $derived(fold ? seatsOf(posed(fold, said)) : {});\n"
        "  const pins = $derived(fold ? pinsOf(stepsWithDraft, stageStep, fold, guideTab ? meta?.notes : ins?.notes) : []);\n",
    )
    after(view, "        {labels}\n", "        {seats}\n        {pins}\n        {asset}\n        onimage={(images, k) => retain({ lb: images[k] })}\n")

    notes = f"{EDITOR}/parts/Notes.svelte"
    swap(notes, '  const tone = (note) => (note.kind === "TIP" ? "tip" : note.kind ? "warning" : "plain");\n', "")
    before(notes, "  let { notes = [], onset, onkind, onremove, onadd } = $props();\n", '  import { tone } from "../kit/guide.js";\n\n')
    swap(f"{EDITOR}/parts/StepTab.svelte", 'held.notes.push({ text: "", symbols: [] })', 'held.notes.push({ text: "" })')
    swap(f"{EDITOR}/parts/GuideTab.svelte", 'held.notes.push({ text: "", symbols: [] })', 'held.notes.push({ text: "" })')

    test = "modes/guide/player/tests/guide.test.js"
    swap(
        test,
        "import { built, chips, nextStep, restaged, sections, staged, statuses, through, tints } from",
        "import { built, chips, nextStep, pins, posed, restaged, sections, staged, statuses, through, tints, tone } from",
    )
    swap(test, "import { entries, frames, IDENTITY } from", "import { entries, frames, IDENTITY, seats } from")
    before(test, '  it("P-status: overview is all solid;', hunk("guide.test.js"))


def s5():
    schematics = "domain/assembly/schematics.js"
    after(
        schematics,
        'const STAGING = STAGED.optional().desc("How the stage shows it, whole. Example: { explode: 0.4 }");\n',
        "const COLOURING = v.union([COLOUR, v.null()]).optional().desc('Its own colour on every stage: a theme role or a hex; null takes it off again. Example: \"#e8590c\"');\n",
    )
    after(schematics, '    qty: v.integer().optional().desc("How many the kit ships — what makes it a thing you order. Example: 6"),\n', "    colour: COLOURING,\n")
    after(schematics, "    joins: JOINED.properties.joins.optional(),\n", "    colour: COLOURING,\n")
    worn = '      if (colour !== undefined) (carried.push("STAGED"), (trait.STAGED = this.coloured(held, colour)));\n'
    counted = "domain/assembly/traits/literal/counted.js"
    swap(counted, "sourced, qty, symbols }, mode) {", "sourced, qty, colour, symbols }, mode) {")
    after(counted, '      if (qty != null) (carried.push("COUNTED"), (trait.COUNTED = { qty }));\n', worn)
    placed = "domain/assembly/traits/literal/placed.js"
    swap(placed, "    async placement({ label, description, joins, symbols, ...placed }, mode) {", "    async placement({ label, description, joins, symbols, colour, ...placed }, mode) {")
    after(placed, '      if (joins) (carried.push("JOINED"), (trait.JOINED = { joins }));\n', worn)
    before(
        placed,
        "    async placement({ label, description, joins, symbols, colour, ...placed }, mode) {",
        "    coloured(held, colour) {\n"
        "      const { colour: _was, ...rest } = held?.trait?.STAGED ?? {};\n"
        "      return { ...rest, ...(colour && { colour }) };\n"
        "    },\n\n",
    )
    test = "domain/assembly/tests/domain.test.js"
    swap(test, 'import { specimen, shape } from "@vivalence/typology";', 'import { specimen, shape, v } from "@vivalence/typology";')
    before(test, '  it("P-traits:', hunk("domain.test.js"))

    form = f"{MODEL}/buffer/form.js"
    before(
        form,
        "const kindOf = (held) => {\n",
        "// the theme roles a colour field offers: every enum inside its union\n"
        "export const rolesOf = (held) => optionsOf(held) ?? (held.anyOf ?? []).flatMap(rolesOf);\n\n",
    )
    inspector = f"{MODEL}/buffer/parts/Inspector.svelte"
    swap(inspector, "import { IDENTITY, at, fields, into as written, read, show, values } from", "import { IDENTITY, at, fields, into as written, read, rolesOf, show, values } from")
    swap(inspector, "onstate, onsave, onmove, onretract } = $props();", "onstate, onsave, onmove, onretract, oncolour } = $props();")
    after(inspector, "  const shown = $derived(schema ? fields(schema) : []);\n", "  const worn = $derived(card ? card.trait.STAGED?.colour : undefined);\n")
    swap(inspector, '        {#if field.kind === "lines"}\n', hunk("Inspector.colour.svelte"))
    before(inspector, "  .families {\n", hunk("Inspector.colour.css"))
    view = f"{MODEL}/buffer/Assembly.svelte"
    swap(view, 'import { payload } from "./form.js";', 'import { payload, values } from "./form.js";')
    before(
        view,
        "  const relocate = async (input) => {\n",
        "  const coloured = (colour) => {\n"
        "    const was = values(card.ontology, card);\n"
        "    return act(card.ontology, { ...payload(card.ontology, was, was), colour });\n"
        "  };\n\n",
    )
    after(view, "            onsave={save}\n", "            oncolour={coloured}\n")
    test = f"{MODEL}/tests/assembly.test.js"
    swap(test, "import { IDENTITY, at, exampleOf, fields, into, payload, read, show, values } from", "import { IDENTITY, at, exampleOf, fields, into, payload, read, rolesOf, show, values } from")
    swap(test, '"label", "description", "joins", "symbols"]);', '"label", "description", "joins", "colour", "symbols"]);')
    before(
        test,
        '  it("P-fields:',
        '  it("P-roles: a colour field offers the theme roles inside its union, at any depth; a field of no enum offers none", () => {\n'
        '    const colour = { anyOf: [{ anyOf: [{ enum: ["info", "warning"] }, { type: "string", pattern: "^#[0-9a-f]{6}$" }] }, { type: "null" }] };\n'
        '    expect(rolesOf(colour)).toEqual(["info", "warning"]);\n'
        '    expect(rolesOf({ type: "string" })).toEqual([]);\n'
        "  });\n\n",
    )


def s6():
    after("modes/guide/editor/schematics.js", 'export const TINTS = ["info", "success", "warning", "danger", "accent", "contrast"];\n', '\n// how a step may show one piece, over what the build says\nexport const SHOWN = ["solid", "ghost", "hidden"];\n')
    tab = f"{EDITOR}/parts/StepTab.svelte"
    swap(tab, 'import { TINTS } from "../../schematics.js";', 'import { SHOWN, TINTS } from "../../schematics.js";')
    swap(tab, "names = {}, tintsOpen = null, folding = null, ctl } = $props();", "names = {}, tintsOpen = null, folding = null, looks, asset, ctl } = $props();")
    swap(tab, 'const LABELS = { pre: "Prerequisites", parts: "Parts", lines:', 'const LABELS = { pre: "Prerequisites", parts: "Parts", pieces: "Pieces", lines:')
    after(tab, "    parts: `${scope.here} in this step`,\n", "    pieces: String(looks.entries.length),\n")
    before(tab, '  {@render heading("lines")}\n', hunk("StepTab.pieces.svelte"))
    after(
        tab,
        "  <Notes\n    notes={ins.notes}\n",
        "    selected={looks.selected}\n"
        "    {asset}\n"
        "    onanchor={(k, literals) =>\n"
        "      ctl.editStep((held) => {\n"
        "        const { at: was, ...rest } = held.notes[k];\n"
        "        held.notes[k] = literals ? { ...rest, at: { literals } } : rest;\n"
        "      })}\n"
        "    onpicture={(k) => ctl.openPicker(k)}\n"
        "    onunpicture={(k, image) =>\n"
        "      ctl.editStep((held) => {\n"
        "        held.notes[k] = { ...held.notes[k], images: held.notes[k].images.filter((one) => one !== image) };\n"
        "      })}\n",
    )
    before(tab, "  .none {\n", hunk("StepTab.pieces.css"))

    notes = f"{EDITOR}/parts/Notes.svelte"
    swap(
        notes,
        "  let { notes = [], onset, onkind, onremove, onadd } = $props();\n",
        "  let { notes = [], selected = [], asset = (path) => path, onset, onkind, onremove, onadd, onanchor = null, onpicture, onunpicture } = $props();\n",
    )
    swap(notes, "      </select>\n    </div>\n", "      </select>\n" + hunk("Notes.pin.svelte") + "    </div>\n")
    before(notes, "  .add {\n", hunk("Notes.pin.css"))

    view = f"{EDITOR}/Guide.svelte"
    swap(view, "    openPicker: () => retain({ picker: true }),\n", hunk("Guide.ctl.js"))
    after(view, "  const images = $derived((ins?.images ?? []).map((path) => ({ path, url: asset(path) })));\n", hunk("Guide.looks.js"))
    swap(view, "{names} tintsOpen={local.tints} {folding} {ctl} />", "{names} tintsOpen={local.tints} {folding} {looks} {asset} {ctl} />")
    swap(view, "              {@const k = (ins?.images ?? []).indexOf(path)}\n", "              {@const k = pictured.indexOf(path)}\n")
    swap(
        view,
        "onclick={() => editStep((held) => (held.images = k >= 0 ? held.images.filter((one) => one !== path) : [...held.images, path]))}>",
        "onclick={() => ctl.togglePicture(path)}>",
    )
    swap(view, '<div class="guide-strong">Manual pages</div>', '<div class="guide-strong">{noted === null ? "Manual pages" : `Pictures of note ${noted + 1}`}</div>')


STOPS = {"s1": s1, "s2": s2, "s5": s5, "s6": s6}
for stop in sys.argv[2:]:
    STOPS[stop]()
    print(f"{stop} applied")
