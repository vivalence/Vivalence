# limit: 11000 chars · the M1 builder (free surface): python3 rename.py <repo> <registry> dry|wet; an allow-list of roots, every rule counted, comments kept, specials anchored, then the five moves
import os
import re
import sys
from collections import Counter

repo, registry, mode = sys.argv[1], sys.argv[2], sys.argv[3]
assert mode in ("dry", "wet")

ROOTS = [
    f"{repo}/systems",
    f"{repo}/subsystems",
    f"{repo}/commons",
    f"{repo}/documentation/src",
    *[f"{registry}/{pkg}" for pkg in ("assembly", "chess", "education", "media", "vcompany", "young-ladys-primer")],
]
for root in ROOTS:
    print("ALLOW", root)
    if not os.path.isdir(root):
        sys.exit(f"REFUSED: no root {root}")

SKIP_DIRS = {"node_modules", "bak", "bak.belt", "build", "dist", "bundle", ".harvest", ".git", ".jj"}
SKIP_FILE = re.compile(r"(\.bak\.|\.mjs$|m6land\..*\.txt$|dataspace-v2-data\.md$|deno\.lock$)")
TEXT = re.compile(r"\.(js|jsx|ts|svelte|css|json|jsonc|md|org|astro)$")

GLOBAL = [
    ("css-var", re.compile(r"--([a-z0-9-]*?)surface"), r"--\1plane"),
    ("camel-depth", re.compile(r"surface(Sunk|Lift)"), r"plane\1"),
    ("kebab-depth", re.compile(r"(?<![\w-])surface-(sunk|lift)\b"), r"plane-\1"),
    ("bg-class", re.compile(r"\bbg-surface-"), "bg-plane-"),
    ("palette-member", re.compile(r"\b(palette|zone|RGB|body)\.surface\b"), r"\1.plane"),
    ("client-member", re.compile(r"\b(client|appDie|commands)\.surface\b"), r"\1.skin"),
    ("path-dir", re.compile(r"\bsurfaces/"), "skins/"),
    ("path-commands", re.compile(r"commands/surface\b"), "commands/skin"),
    ("path-barrel", re.compile(r"\./surface/index\.js"), "./skin/index.js"),
    ("bag-destructure", re.compile(r"\{ terminal, buffer, surface( \}|, )"), r"{ terminal, buffer, skin\1"),
    ("bag-key", re.compile(r"\bsurface: \{ place: "), "skin: { place: "),
    ("bag-default", re.compile(r"\bsurface = \{ place: "), "skin = { place: "),
]

SPECIAL = {
    "systems/anima/tests/world.js": [("../src/surface/", "../src/skins/", 1)],
    "subsystems/typology/tests/theme.test.js": [("surfaceRaised", "planeRaised", 2)],
    "subsystems/drapes/readme.org": [("semantic surface/contrast/boundary", "semantic plane/contrast/boundary", 1)],
    "@chess/tests/render.js": [("  surface,\n", "  skin,\n", 1)],
    "commons/instances/hello-world/page/style.js": [
        (
            "  surfaces   --surface        the field (the page itself)\n"
            "             --surface-sunk   sunk — panels, quotes, tables\n"
            "             --surface-lift   raised — a card floating above\n",
            "  planes     --plane          the field (the page itself)\n"
            "             --plane-sunk     sunk — panels, quotes, tables\n"
            "             --plane-lift     raised — a card floating above\n",
            1,
        )
    ],
    "commons/instances/hello-world/tests/snapshots/hello-world-draw.snapshot.json": [
        ('    "--font-size-xs",\n', '    "--font-size-xs",\n    "--plane",\n    "--plane-lift",\n    "--plane-sunk",\n', 1),
        ('    "--surface",\n    "--surface-lift",\n    "--surface-sunk",\n', "", 1),
    ],
    "@chess/README.md": [("(surface light, contrast ink)", "(plane light, contrast ink)", 1)],
    "@assembly/tests/render.js": [("  surface,\n", "  skin,\n", 1)],
}

PALETTE = [
    "subsystems/dapper/lib/theme.js",
    "subsystems/dapper/lib/tokens.js",
    "subsystems/dapper/tests/contrast.test.js",
    "subsystems/dapper/tests/emit.test.js",
    "subsystems/dapper/tests/theme.test.js",
    "subsystems/dapper/tests/tokens.test.js",
    "subsystems/dapper/themes/datasette/theme.js",
    "subsystems/dapper/themes/northsea/theme.js",
    "subsystems/dapper/themes/parchment/theme.js",
    "subsystems/dapper/themes/porcelain/theme.js",
    "subsystems/drapes/design/index.jsx",
    "subsystems/drapes/tests/a11y.test.js",
    "subsystems/drapes/tests/sheet.test.js",
    "subsystems/sheets/tests/a11y.test.js",
    "subsystems/sheets/tests/segment.test.js",
    "subsystems/typology/schematics/primitives/theme.js",
    "subsystems/typology/tests/theme.test.js",
    "systems/anima/tests/zones/slots.test.js",
    "commons/instances/hello-world/page/style.js",
    "@chess/modes/board/play/buffer/kit/Theme.svelte",
    "@chess/modes/coach/practice/buffer/kit/Theme.svelte",
    "@chess/modes/library/games/buffer/kit/Theme.svelte",
    "@chess/modes/riddle/puzzles/buffer/kit/Theme.svelte",
    "@chess/modes/study/analysis/buffer/kit/Theme.svelte",
    "@chess/modes/board/play/buffer/play.jsx",
    "@chess/modes/board/play/tests/tty.render.test.js",
]
CLIENT = [
    "systems/anima/src/client.js",
    "systems/anima/src/surfaces/chrome/ambient/index.js",
    "systems/anima/src/surfaces/chrome/panels/frame/view.jsx",
    "systems/anima/src/surfaces/chrome/panels/modeline/modeline.jsx",
    "systems/anima/src/surfaces/chrome/panels/sidebar/sidebar.jsx",
    "systems/anima/src/surfaces/chrome/widgets/buffer/painters.jsx",
    "systems/anima/src/surfaces/chrome/widgets/buffer/renderers.js",
    "systems/anima/tests/bar.test.js",
    "systems/anima/tests/chrome.test.js",
    "systems/anima/tests/harness.surfaces.test.js",
    "systems/anima/tests/island.test.js",
    "systems/anima/tests/journal.test.js",
    "systems/anima/tests/painters.test.js",
    "systems/anima/tests/panel.test.js",
    "systems/anima/tests/regions.test.js",
    "systems/anima/tests/sidebar.test.js",
    "systems/anima/tests/tabs.test.js",
    "systems/anima/tests/tele.test.js",
    "systems/anima/tests/textarea.test.js",
    "systems/anima/tests/world.js",
    "systems/ghost/subjects/app/prototype.js",
    "systems/ghost/subjects/shell/commands/chrome.js",
    "systems/ghost/gestalten/commands/index.js",
    "systems/ghost/surfaces/chrome/ambient/index.js",
    "systems/ghost/tests/subjects/app/lifecycle.test.js",
    "systems/ghost/tests/subjects/terminal/repl.test.js",
    "systems/ghost/tests/subjects/terminal/commands.test.js",
    "systems/ghost/tests/surfaces/chrome/mount.test.js",
    "subsystems/typology/schematics/primitives/contexts.js",
    "commons/fixtures/memo/mode/buffer/memo.jsx",
    "commons/fixtures/memo/tests/memo.test.js",
    "commons/fixtures/memo/tests/memo.snapshot.test.js",
    "@chess/tests/render.js",
    "@assembly/tests/render.js",
    "@chess/modes/board/play/buffer/Play.svelte",
]
BARE = re.compile(r"\b(surfaces|surfaced|surface|Surfaces|Surface|SURFACES|SURFACE)\b")
WORDS = {
    "palette": {"surfaces": "planes", "surface": "plane", "Surfaces": "Planes", "Surface": "Plane"},
    "client": {
        "surfaces": "skins", "surfaced": "skinned", "surface": "skin",
        "Surfaces": "Skins", "Surface": "Skin", "SURFACES": "SKINS", "SURFACE": "SKIN",
    },
}

MOVES = [
    ("systems/ghost/surfaces", "systems/ghost/skins"),
    ("systems/anima/src/surfaces", "systems/anima/src/skins"),
    ("systems/ghost/gestalten/commands/surface", "systems/ghost/gestalten/commands/skin"),
    ("systems/ghost/tests/surfaces", "systems/ghost/tests/skins"),
    ("systems/anima/tests/harness.surfaces.test.js", "systems/anima/tests/harness.skins.test.js"),
]


CODE = re.compile(r"\.(js|jsx|ts|svelte|css|astro|jsonc)$")
COMMENT = re.compile(r"/\*[\s\S]*?\*/|<!--[\s\S]*?-->|(?<![:\"'\w\\])//[^\n]*")


def spans(path, text, change):
    if not CODE.search(path):
        return change(text)
    out, last = [], 0
    for match in COMMENT.finditer(text):
        out.append(change(text[last:match.start()]))
        out.append(match.group(0))
        counts["comment-kept"] += len(re.findall("surface", match.group(0), re.I))
        last = match.end()
    out.append(change(text[last:]))
    return "".join(out)


def absolute(rel):
    if rel.startswith("@"):
        pkg, rest = rel[1:].split("/", 1)
        return f"{registry}/{pkg}/{rest}"
    return f"{repo}/{rel}"


def relative(path):
    if path.startswith(registry + "/"):
        return "@" + path[len(registry) + 1:]
    return path[len(repo) + 1:]


classed = {}
for rel in PALETTE:
    classed[absolute(rel)] = "palette"
for rel in CLIENT:
    classed[absolute(rel)] = "client"
for path in list(classed) + [absolute(rel) for rel in SPECIAL]:
    if not os.path.isfile(path):
        sys.exit(f"REFUSED: missing {path}")

counts = Counter()
written = {}
scanned = {}
for root in ROOTS:
    for directory, dirs, files in os.walk(root):
        dirs[:] = [held for held in dirs if held not in SKIP_DIRS]
        for name in files:
            path = os.path.join(directory, name)
            if os.path.islink(path) or SKIP_FILE.search(path) or not TEXT.search(name):
                continue
            text = open(path, encoding="utf-8", errors="strict").read()
            if "surface" not in text.lower():
                continue
            before = text
            sense = classed.get(path)
            specials = SPECIAL.get(relative(path), [])
            seen = Counter()

            def change(code):
                for want, swap, expected in specials:
                    seen[want] += code.count(want)
                    code = code.replace(want, swap)
                for label, rx, swap in GLOBAL:
                    code, hits = rx.subn(swap, code)
                    counts[label] += hits
                if sense:
                    table = WORDS[sense]

                    def bare(match):
                        word = match.group(1)
                        if word not in table:
                            sys.exit(f"REFUSED: {relative(path)} {sense} file holds {word!r}")
                        counts[f"bare-{sense}"] += 1
                        return table[word]

                    code = BARE.sub(bare, code)
                return code

            text = spans(path, text, change)
            for want, swap, expected in specials:
                if seen[want] != expected:
                    sys.exit(f"REFUSED: {relative(path)} anchor {want!r} seen {seen[want]}x, want {expected}")
                counts["special"] += seen[want]
            if text != before:
                written[path] = text
                scanned[path] = before

for label, hits in sorted(counts.items()):
    print(f"{hits:5}  {label}")
print(f"{len(written):5}  files changed")
untouched = [relative(path) for path in classed if path not in written]
if untouched:
    sys.exit(f"REFUSED: classed files unchanged: {untouched}")

for old, new in MOVES:
    if not os.path.exists(f"{repo}/{old}") or os.path.exists(f"{repo}/{new}"):
        sys.exit(f"REFUSED: move {old} -> {new}")

if mode == "dry":
    sys.exit(0)

raced = [relative(path) for path in written if open(path, encoding="utf-8").read() != scanned[path]]
if raced:
    sys.exit(f"REFUSED: saved during the scan, nothing written: {raced}")
for path, text in written.items():
    open(path, "w", encoding="utf-8").write(text)
for old, new in MOVES:
    os.rename(f"{repo}/{old}", f"{repo}/{new}")
    print("moved", old, "->", new)
