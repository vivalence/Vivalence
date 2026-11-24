# limit: 9000 chars
import os
import re
import shutil
import sys

registry = sys.argv[1]
instance = sys.argv[2]
wet = "--wet" in sys.argv

assembly = os.path.join(registry, "assembly")
droneaid = os.path.join(registry, "droneaid")

MOVES = [
    ("modes/editor/assembly", "modes/model/editor", "assembly.viva.js", "editor.viva.js"),
    ("modes/editor/import", "modes/model/import", "import.viva.js", "import.viva.js"),
    ("modes/editor/guide", "modes/guide/editor", "guide.viva.js", "editor.viva.js"),
    ("modes/player/guide", "modes/guide/player", "guide.viva.js", "player.viva.js"),
]

IDENTIFIERS = [
    ("@assembly/editor/assembly", "@assembly/model/editor"),
    ("@assembly/editor/import", "@assembly/model/import"),
    ("@assembly/editor/guide", "@assembly/guide/editor"),
    ("@assembly/player/guide", "@assembly/guide/player"),
    ("mode_editor_import", "mode_model_import"),
    ("modes/editor/assembly/", "modes/model/editor/"),
    ("modes/editor/import/", "modes/model/import/"),
    ("modes/editor/guide/", "modes/guide/editor/"),
    ("modes/player/guide/", "modes/guide/player/"),
]

EXACT = {
    "modes/model/editor/editor.viva.js": [
        ('  type: "editor",\n  slug: "assembly",\n  name: "Assembly",\n  version: "0.3.0",',
         '  type: "model",\n  slug: "editor",\n  name: "Model editor",\n  version: "0.4.0",'),
    ],
    "modes/model/import/import.viva.js": [
        ('  type: "editor",\n  slug: "import",', '  type: "model",\n  slug: "import",'),
    ],
    "modes/guide/editor/editor.viva.js": [
        ('  type: "editor",\n  slug: "guide",', '  type: "guide",\n  slug: "editor",'),
    ],
    "modes/guide/player/player.viva.js": [
        ('  type: "player",\n  slug: "guide",', '  type: "guide",\n  slug: "player",'),
    ],
    "modes/model/editor/tests/assembly.test.js": [
        ('import * as mode from "../assembly.viva.js";', 'import * as mode from "../editor.viva.js";'),
        ('{ type: "editor", slug: "assembly", name: "Assembly",', '{ type: "model", slug: "editor", name: "Model editor",'),
        ('CONVERSATIONAL editor named assembly;', 'CONVERSATIONAL model named editor;'),
        ('expect(mode.manifest.type).toBe("editor");\n    expect(mode.manifest.slug).toBe("assembly");',
         'expect(mode.manifest.type).toBe("model");\n    expect(mode.manifest.slug).toBe("editor");'),
    ],
    "modes/model/editor/tests/harness.test.js": [
        ('{ type: "editor", slug: "assembly", name: "Assembly",', '{ type: "model", slug: "editor", name: "Model editor",'),
    ],
    "modes/model/import/tests/import.test.js": [
        ('{ type: "editor", slug: "import",', '{ type: "model", slug: "import",'),
        ('EXPOSED editor named import;', 'EXPOSED model named import;'),
        ('expect(mode.manifest.type).toBe("editor");\n    expect(mode.manifest.slug).toBe("import");',
         'expect(mode.manifest.type).toBe("model");\n    expect(mode.manifest.slug).toBe("import");'),
    ],
    "modes/guide/editor/tests/guide.test.js": [
        ('import * as mode from "../guide.viva.js";', 'import * as mode from "../editor.viva.js";'),
        ('{ type: "editor", slug: "guide",', '{ type: "guide", slug: "editor",'),
        ('CONVERSATIONAL editor named guide;', 'CONVERSATIONAL guide named editor;'),
        ('expect(mode.manifest.type).toBe("editor");\n    expect(mode.manifest.slug).toBe("guide");',
         'expect(mode.manifest.type).toBe("guide");\n    expect(mode.manifest.slug).toBe("editor");'),
    ],
    "modes/guide/player/tests/guide.test.js": [
        ('import * as mode from "../guide.viva.js";', 'import * as mode from "../player.viva.js";'),
        ('{ type: "player", slug: "guide",', '{ type: "guide", slug: "player",'),
        ('CONVERSATIONAL player named guide;', 'CONVERSATIONAL guide named player;'),
        ('expect(mode.manifest.type).toBe("player");\n    expect(mode.manifest.slug).toBe("guide");',
         'expect(mode.manifest.type).toBe("guide");\n    expect(mode.manifest.slug).toBe("player");'),
    ],
    "tests/kit.test.js": [
        ('const MODES = ["player/guide", "editor/guide"];', 'const MODES = ["guide/player", "guide/editor"];'),
        ("`${ROOT}player/guide/buffer/kit`)).toEqual(names(b, `${ROOT}editor/guide/buffer/kit`)",
         "`${ROOT}guide/player/buffer/kit`)).toEqual(names(b, `${ROOT}guide/editor/buffer/kit`)"),
        ("path.replace(`${ROOT}player/guide/buffer/kit`, `${ROOT}editor/guide/buffer/kit`)",
         "path.replace(`${ROOT}guide/player/buffer/kit`, `${ROOT}guide/editor/buffer/kit`)"),
    ],
}

SWEPT = [
    os.path.join(assembly, "README.md"),
    os.path.join(assembly, "modes/model/editor/editor.viva.js"),
    os.path.join(assembly, "modes/model/editor/buffer/Assembly.svelte"),
    os.path.join(droneaid, "README.md"),
    os.path.join(droneaid, "instances/droneaid/instance.viva.json"),
]

DEAD = re.compile(r"@assembly/(editor|player)/|mode_editor_import|modes/(editor|player)/(assembly|import|guide)|type: \"(editor|player)\"|mode from \"\.\./(assembly|guide)\.viva\.js|type\)\.toBe\(\"(editor|player)\"\)")

log = []

def sweep(path):
    with open(path) as handle:
        text = handle.read()
    total = 0
    for old, new in IDENTIFIERS:
        total += text.count(old)
        text = text.replace(old, new)
    log.append(f"sweep {path}: {total} hits")
    if wet:
        with open(path, "w") as handle:
            handle.write(text)

sweep(instance)

for source, target, before, after in MOVES:
    src = os.path.join(assembly, source)
    dst = os.path.join(assembly, target)
    assert os.path.isdir(src), f"missing {src}"
    assert not os.path.exists(dst), f"taken {dst}"
    log.append(f"mv {source} -> {target}")
    if wet:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        if before != after:
            os.rename(os.path.join(dst, before), os.path.join(dst, after))
    if before != after:
        log.append(f"mv {target}/{before} -> {target}/{after}")

for emptied in ["modes/editor", "modes/player"]:
    path = os.path.join(assembly, emptied)
    if wet:
        assert not os.listdir(path), f"not empty {path}"
        os.rmdir(path)
    log.append(f"rmdir {emptied}")

def read(path):
    with open(path) as handle:
        return handle.read()

def write(path, text):
    with open(path, "w") as handle:
        handle.write(text)

def located(relative):
    if wet:
        return os.path.join(assembly, relative)
    for source, target, before, after in MOVES:
        if relative.startswith(target + "/"):
            rest = relative[len(target) + 1:]
            if rest == after:
                rest = before
            return os.path.join(assembly, source, rest)
    return os.path.join(assembly, relative)

for relative, pairs in EXACT.items():
    path = located(relative)
    text = read(path)
    for old, new in pairs:
        count = text.count(old)
        assert count == 1, f"{relative}: anchor x{count}: {old[:60]}"
        text = text.replace(old, new)
    log.append(f"edit {relative}: {len(pairs)} anchors")
    if wet:
        write(path, text)

for path in SWEPT:
    if not wet and path.startswith(assembly):
        path = located(os.path.relpath(path, assembly))
    text = read(path)
    total = 0
    for old, new in IDENTIFIERS:
        hits = text.count(old)
        total += hits
        text = text.replace(old, new)
    log.append(f"sweep {path}: {total} hits")
    if wet:
        write(path, text)

if wet:
    residue = []
    for root in [assembly, droneaid]:
        for directory, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in (".jj", ".git", "bak", "node_modules", "dataset", "freight")]
            for name in files:
                if not name.endswith((".js", ".json", ".jsonc", ".md", ".svelte", ".ts")):
                    continue
                path = os.path.join(directory, name)
                for number, line in enumerate(read(path).splitlines(), 1):
                    if DEAD.search(line):
                        residue.append(f"{path}:{number}: {line.strip()[:120]}")
    for number, line in enumerate(read(instance).splitlines(), 1):
        if DEAD.search(line):
            residue.append(f"{instance}:{number}: {line.strip()[:120]}")
    log.append(f"residue: {len(residue)}")
    log.extend(residue)

print("\n".join(log))
