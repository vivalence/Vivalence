"""the appendix's edits, written onto a copy: python3 edit.py <root>

every site of assign.py in state `new`, every `ID` in state `wear`, a `$id` on every scalar the tree
already names, and the import each touched file then needs. every edit must land exactly once.
"""
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HOME = "subsystems/typology/schematics"
ROOT = sys.argv[1].rstrip("/")
NAMED = {
    "primitives/theme.js": (
        "Hex", "Alpha", "Px", "Percent", "Rem", "Em", "Factor", "Ratio", "Leading",
        "Shadow", "Family", "Glow", "Filter",
    ),
    "primitives/hallucination.js": ("Probability",),
    "traits/themed.js": ("Themed",),
}
ADDED = """
export const ModuleIdentifier = v.string().$id("ModuleIdentifier");
export const Version = v.string().$id("Version");
export const Hash = v.string().$id("Hash");
export const Integrity = v.string().$id("Integrity");

export const Index = v.integer().$id("Index");
export const Bytes = v.integer().$id("Bytes");
"""
BROKEN = {
    ("primitives/hallucination.js", "Packet.PartFull.turn"): ("  turn: v\n    .string()\n", "  turn: ID\n"),
}

texts = {}
worn = {}


def text(short):
    if short not in texts:
        texts[short] = open(f"{ROOT}/{HOME}/{short}").read()
    return texts[short]


def once(short, old, new):
    held = text(short)
    if held.count(old) != 1:
        raise SystemExit(f"{short}: {held.count(old)} matches of {old!r}")
    texts[short] = held.replace(old, new)


rows = subprocess.run(
    ["python3", f"{HERE}/assign.py", "--sites"], capture_output=True, text=True, check=True
).stdout.splitlines()
for row in rows:
    at, path, today, scalar, state, note = row.split("\t")
    if not (state in ("new", "ruled") or (state == "wear" and scalar == "ID")):
        continue
    short, line = at.split(":")
    worn.setdefault(short, set()).add(scalar)
    if (short, path) in BROKEN:
        continue
    lines = text(short).split("\n")
    held = lines[int(line) - 1]
    key = re.sub(r"(\[\]|\|)+$", "", path).split(".")[-1]
    builder = re.escape(today) + r"\(\)"
    arm = re.compile(builder) if path.endswith("|") else re.compile(rf"(?<![A-Za-z0-9_$])({re.escape(key)}: ){builder}")
    if len(arm.findall(held)) != 1:
        raise SystemExit(f"{at} {path}: {len(arm.findall(held))} matches in {held!r}")
    lines[int(line) - 1] = arm.sub(scalar if path.endswith("|") else rf"\g<1>{scalar}", held)
    texts[short] = "\n".join(lines)

for (short, path), (old, new) in BROKEN.items():
    once(short, old, new)

for short, names in NAMED.items():
    for name in names:
        row = re.compile(rf"^((?:export )?const {name}\s*= .*)(;)$", re.M)
        held = text(short)
        if len(row.findall(held)) != 1:
            raise SystemExit(f"{short}: {len(row.findall(held))} definitions of {name}")
        texts[short] = row.sub(rf'\g<1>.$id("{name}")\g<2>', held)

once(
    "scalars/index.js",
    'v.string({ pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", title: "lowercase alphanumeric words joined by single dashes", ...opts })',
    'v.string({ pattern: `^${PART}(?:\\\\.${PART})*$`, title: "words of letters and digits joined by - or _, parts joined by dots", ...opts })',
)
once("scalars/index.js", "export const slug = ", 'const PART = "[\\\\p{L}\\\\p{N}]+(?:[-_][\\\\p{L}\\\\p{N}]+)*";\n\nexport const slug = ')
once("scalars/index.js", "export const Slug = slug();\n", "export const Slug = slug();\n" + ADDED)

for short, names in sorted(worn.items()):
    held = text(short)
    found = re.search(r'^import \{ ([^}]+) \} from "\.\./scalars/index\.js";$', held, re.M)
    if found:
        whole = sorted(set(found.group(1).split(", ")) | names)
        once(short, found.group(0), f'import {{ {", ".join(whole)} }} from "../scalars/index.js";')
        continue
    first = re.search(r'^import [^\n]*from "\.\./v\.js";\n', held, re.M)
    once(short, first.group(0), first.group(0) + f'import {{ {", ".join(sorted(names))} }} from "../scalars/index.js";\n')

for short, held in sorted(texts.items()):
    open(f"{ROOT}/{HOME}/{short}", "w").write(held)
    print(f"written {HOME}/{short}")
