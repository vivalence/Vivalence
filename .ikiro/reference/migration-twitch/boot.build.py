"""Builds the booted-runtime copy: paladin.version, the version key, a probe step on View.

usage: python3 -I boot.build.py <copy root> <marker file>
"""
import sys

ROOT, MARKER = sys.argv[1], sys.argv[2]


def turn(path, pairs):
    full = f"{ROOT}/{path}"
    text = open(full).read()
    for old, new in pairs:
        assert text.count(old) == 1, (path, old, text.count(old))
        text = text.replace(old, new)
    open(full, "w").write(text)


turn("deno.jsonc", [('{\n  "nodeModulesDir": "auto",', '{\n  "version": "2026.11.0",\n  "nodeModulesDir": "auto",')])

turn(
    "subsystems/paladin/paladin/lifecycle.js",
    [
        (
            "export function instance(paladin) {",
            "export async function version(paladin) {\n"
            '  const root = await paladin.read.json(paladin.scope.repository.branch("deno.jsonc"));\n'
            "  paladin.version = format(parse(root.version));\n"
            "}\n\n"
            "export function instance(paladin) {",
        ),
        (
            'import { isAbsolute, join } from "@std/path";',
            'import { isAbsolute, join } from "@std/path";\nimport { format, parse } from "@std/semver";',
        ),
    ],
)

turn(
    "subsystems/paladin/mod.js",
    [("await lifecycle.scopes(paladin);", "await lifecycle.scopes(paladin);\nawait lifecycle.version(paladin);")],
)

STEP = f"""
const heard = (side) => (ctx) =>
  Deno.writeTextFileSync("{MARKER}", `${{side}} ${{ctx.signal?.nature ?? ""}} migrate=${{Object.keys(ctx.migrate).join(",")}} em=${{Boolean(ctx.em)}}\\n`, {{ append: true }});

const twitch = new Vector()
  .open("/before/datamap/migrate/2026.11.0", heard("before 2026.11.0"))
  .open("/after/datamap/migrate/2026.11.0", heard("after 2026.11.0"))
  .open("/before/datamap/migrate/2026.11.1", heard("before 2026.11.1"))
  .open("/after/datamap/migrate/2026.11.1", heard("after 2026.11.1"));

export default {{
  type: "view",
  schema: ViewSchema,
  entity: ViewEntity,
  repository: ViewRepository,
  twitch,
}};
"""

path = f"{ROOT}/subsystems/typology/entities/View.ts"
text = open(path).read()
tail = 'export default {\n  type: "view",\n  schema: ViewSchema,\n  entity: ViewEntity,\n  repository: ViewRepository,\n};\n'
assert text.count(tail) == 1
text = text.replace(tail, STEP.lstrip("\n"))
text = 'import { Vector } from "../prototypes/vector.js";\n' + text
open(path, "w").write(text)
print("built")
