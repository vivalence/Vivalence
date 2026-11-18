# limit: 4200 chars
# builder: milestone 4's hunks onto a COPY of the assembly package, each replace asserted to hit once.
# usage: python3 .ikiro/reference/m127/stage-4.build.py <root holding assembly/> <stop> [<stop> …]
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]) / "assembly"
KITS = ["modes/guide/editor/buffer/kit", "modes/guide/player/buffer/kit", "modes/model/editor/buffer/kit"]


def swap(path, old, new):
    file = ROOT / path
    text = file.read_text()
    assert text.count(old) == 1, f"{path}: {text.count(old)} hits of {old[:60]!r}"
    file.write_text(text.replace(old, new))


def s1():
    swap(
        "domain/assembly/resolve.js",
        "  ...(row.trait.JOINED?.joins && { joins: row.trait.JOINED.joins }),\n",
        "  ...(row.trait.JOINED?.joins && { joins: row.trait.JOINED.joins }),\n"
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
        swap(f"{kit}/frames.js", "      " + carried, "      " + carried + "      ...(one.colour && { colour: one.colour }),\n")
        swap(
            f"{kit}/scene.js",
            '          material.userData.colour = material.color?.clone() ?? new THREE.Color("white");\n',
            '          const filed = material.color?.clone() ?? new THREE.Color("white");\n'
            "          material.userData.colour = at.colour ? palette.tint(at.colour) : filed;\n",
        )
    swap(
        "modes/model/editor/buffer/Assembly.svelte",
        "        " + carried,
        "        " + carried + "        ...(one.colour && { colour: one.colour }),\n",
    )
    swap(
        "domain/assembly/tests/resolve.test.js",
        '  it("P-missing:',
        '  it("P-colour: a placement wears its own colour, else its part\'s; a piece of neither wears none", () => {\n'
        '    const painted = at("stool", { name: "plate.1", ref: "plate" });\n'
        '    painted.trait.STAGED = { colour: "warning" };\n'
        "    const held = new Map(\n"
        "      [\n"
        '        part("plate", { STAGED: { colour: "#e8590c" } }),\n'
        '        part("bolt", {}),\n'
        '        part("stool", {}),\n'
        '        at("stool", { name: "plate.0", ref: "plate" }),\n'
        "        painted,\n"
        '        at("stool", { name: "bolt.0", ref: "bolt" }),\n'
        "      ].map((one) => [one.slug, one]),\n"
        "    );\n"
        '    const colours = resolve(held, "stool").placements.map((one) => [one.slug, one.colour]);\n'
        "    expect(colours).toEqual([\n"
        '      ["stool.plate.0", "#e8590c"],\n'
        '      ["stool.plate.1", "warning"],\n'
        '      ["stool.bolt.0", undefined],\n'
        "    ]);\n"
        "  });\n\n"
        '  it("P-missing:',
    )


STOPS = {"s1": s1}
for stop in sys.argv[2:]:
    STOPS[stop]()
    print(f"{stop} applied")
