# limit: 11000 chars · the Surface entity builder: python3 -I entity.build.py <repo> <registry> dry|wet [rows-prefix]
# a sense per root (entity · keep · registry), keep-files, protected spans, anchored specials, every rule counted,
# comments kept, then the moves. `rows-prefix` prints each changed row under that path, for the eye.
import os
import re
import sys
from collections import Counter

repo, registry, mode = sys.argv[1], sys.argv[2], sys.argv[3]
shown = sys.argv[4] if len(sys.argv) > 4 else None
assert mode in ("dry", "wet")

PACKAGES = ("assembly", "chess", "education", "media", "stucatch", "vcompany", "young-ladys-primer")
ROOTS = [
    (f"{repo}/subsystems/typology", "entity"),
    (f"{repo}/subsystems/paladin", "keep"),
    (f"{repo}/systems/runtime", "entity"),
    (f"{repo}/systems/ghost", "entity"),
    (f"{repo}/systems/anima", "entity"),
    (f"{repo}/commons", "entity"),
    (f"{repo}/testament/_bruno/system", "entity"),
    *[(f"{registry}/{pkg}", "registry") for pkg in PACKAGES],
]

SKIP_DIRS = {
    "node_modules", "bak", "bak.belt", "build", "dist", "bundle", ".harvest", ".git", ".jj",
    ".vite", ".svelte-kit", "static", "vendor", "fonts",
}
SKIP_FILE = re.compile(r"(\.bak\.|\.mjs$|m6land\..*\.txt$|dataspace-v2-data\.md$|deno\.lock$)")
TEXT = re.compile(r"\.(js|jsx|ts|svelte|css|json|jsonc|md|org|astro|bru|html)$")

GLOBAL = [
    ("class", re.compile(r"\bView(Entity|Repository|Schematic|Schema)\b"), r"Surface\1"),
    ("sorted", re.compile(r'"TOOLING", "VIEWABLE"\]'), '"SURFACED", "TOOLING"]'),
    ("article", re.compile(r"\ban VIEWABLE\b"), "a SURFACED"),
    ("trait", re.compile(r"\bVIEWABLE\b"), "SURFACED"),
    ("tool", re.compile(r"\bview_(create|update|read|list|id)\b"), r"surface_\1"),
    ("constant", re.compile(r"\bVIEW_(MIME|SEED|STEPS)\b"), r"SURFACE_\1"),
    ("pivot", re.compile(r"\bbuffer_views\b"), "buffer_surfaces"),
    ("store", re.compile(r"\$views\b"), "$surfaces"),
    ("camel", re.compile(r"\bviewMime\b"), "surfaceMime"),
    ("camel", re.compile(r"\boneArtifactPerView\b"), "oneArtifactPerSurface"),
    ("recipe", re.compile(r"\bexport const views = "), "export const surfaces = "),
    ("surfacing-trait", re.compile(r"\bGENERATIVE\b"), "SURFACING"),
    ("surfacing", re.compile(r"\bgenerative\b"), "surfacing"),
    ("surfacing-member", re.compile(r"\bmode\.generator\b"), "mode.surface"),
]
BARE = re.compile(r"(?<![\w$-])(views|view|Views|View|viewable|viewed)(?![\w$-])")
WORDS = {
    "views": "surfaces", "view": "surface", "Views": "Surfaces", "View": "Surface",
    "viewable": "surfaced", "viewed": "surfaced",
}
RECIPE = re.compile(r"\.viva\.js$")
REGISTRY = [
    ("recipe-views", re.compile(r"(?<![\w$.-])views(?![\w$-])"), "surfaces"),
]
MEMBER = [
    ("registry-member", re.compile(r"\b([a-z]+)\.views(\[0\]\.mount|\)\.toBeUndefined)"), r"\1.surfaces\2"),
    ("registry-names", re.compile(r'"buffer", "views"(?=[,\]])'), '"buffer", "surfaces"'),
    ("registry-route", re.compile(r"/userspace/entities/view/"), "/userspace/entities/surface/"),
]

PROTECT = re.compile(
    "|".join(
        [
            r"\b(?:dock|state|tree)\.view\b",
            r"\bview: \"(?:docked|full|closed|messenger|wide|logger|inspector)\"",
            r"DOCKED: \{ view \}",
            r"a view to view",
            r"renaming\(\"View\", \"Surface\"\)",
            r"side, share, view, lens",
            r"class=\"view\" role=\"group\" aria-label=\"view\"",
        ]
    )
)

KEEP = {
    "subsystems/typology/schematics/traits/docked.js",
    "subsystems/typology/schematics/entities/terminal.js",
    "subsystems/typology/schematics/primitives/contexts.js",
    "subsystems/typology/gestalten/belt/pcm.js",
    "subsystems/typology/tests/schematics/contexts.test.js",
    "systems/ghost/skins/chrome/layout.jsx",
    "systems/ghost/skins/chrome/widgets/display/display.jsx",
    "systems/ghost/tests/skins/chrome/voice.test.js",
    "commons/services/ocr/provider/level.js",
    "systems/ghost/gestalten/belt/dock.js",
    "systems/ghost/gestalten/commands/skin/dock.js",
    "systems/ghost/gestalten/commands/skin/telemetry.js",
    "systems/ghost/gestalten/commands/skin/widget.js",
    "systems/ghost/gestalten/commands/content/buffer.js",
    "systems/ghost/gestalten/commands/system/set.js",
    "systems/ghost/skins/chrome/panels/modeline/modeline.jsx",
    "systems/ghost/subjects/app/prototypes/bridge.js",
    "systems/ghost/subjects/shell/lifecycle/3-integration.js",
    "systems/anima/src/skins/chrome/layout.jsx",
    "systems/anima/src/skins/chrome/panels/sidebar/sections.js",
    "systems/anima/src/skins/chrome/panels/modeline/modeline.jsx",
    "systems/anima/src/skins/chrome/panels/dock/dock.jsx",
    "systems/anima/src/skins/chrome/panels/telemetry/entities.js",
    "systems/anima/tests/call.test.js",
    "systems/anima/tests/tele.test.js",
    "systems/anima/tests/sidebar.test.js",
    "systems/anima/tests/harness.skins.test.js",
    "systems/anima/tests/bar.test.js",
    "systems/anima/src/skins/chrome/mount.jsx",
    "systems/anima/src/skins/chrome/panels/sidebar/sidebar.jsx",
    "systems/anima/src/skins/chrome/panels/telemetry/telemetry.jsx",
}
SPECIAL = {}
AFTER = {}
MOVES = []
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "entity.rules.py")).read())

CODE = re.compile(r"\.(js|jsx|ts|svelte|css|astro|jsonc)$")
COMMENT = re.compile(r"/\*[\s\S]*?\*/|<!--[\s\S]*?-->|(?<![:\"'\w\\])//[^\n]*")
counts = Counter()


def spans(path, text, change):
    if not CODE.search(path):
        return change(text)
    out, last = [], 0
    for match in COMMENT.finditer(text):
        out.append(change(text[last:match.start()]))
        out.append(match.group(0))
        counts["comment-kept"] += len(BARE.findall(match.group(0)))
        last = match.end()
    out.append(change(text[last:]))
    return "".join(out)


def relative(path):
    if path.startswith(registry + "/"):
        return "@" + path[len(registry) + 1:]
    return path[len(repo) + 1:]


def absolute(rel):
    return f"{registry}/{rel[1:]}" if rel.startswith("@") else f"{repo}/{rel}"


for rel in [*KEEP, *SPECIAL, *AFTER]:
    if not os.path.isfile(absolute(rel)):
        sys.exit(f"REFUSED: missing {rel}")

written, scanned, unruled = {}, {}, []
for root, sense in ROOTS:
    if not os.path.isdir(root):
        sys.exit(f"REFUSED: no root {root}")
    print("ALLOW", sense, root)
    for directory, dirs, files in os.walk(root):
        dirs[:] = [held for held in dirs if held not in SKIP_DIRS]
        for name in files:
            path = os.path.join(directory, name)
            if os.path.islink(path) or SKIP_FILE.search(path) or not TEXT.search(name):
                continue
            text = open(path, encoding="utf-8", errors="strict").read()
            if "view" not in text.lower() and "generative" not in text.lower():
                continue
            rel = relative(path)
            before = text
            specials = SPECIAL.get(rel, [])
            seen = Counter()
            turned = sense == "entity" and rel not in KEEP

            def change(code):
                for want, swap, expected in specials:
                    seen[want] += code.count(want)
                    code = code.replace(want, swap)
                for label, rx, swap in GLOBAL:
                    code, hits = rx.subn(swap, code)
                    counts[label] += hits
                if sense == "registry":
                    for label, rx, swap in MEMBER + (REGISTRY if RECIPE.search(rel) else []):
                        code, hits = rx.subn(swap, code)
                        counts[label] += hits
                if not turned:
                    return code
                out, last = [], 0

                def bare(match):
                    counts[f"bare-{match.group(1)}"] += 1
                    return WORDS[match.group(1)]

                for kept in PROTECT.finditer(code):
                    out.append(BARE.sub(bare, code[last:kept.start()]))
                    out.append(kept.group(0))
                    counts["protected"] += 1
                    last = kept.end()
                out.append(BARE.sub(bare, code[last:]))
                return "".join(out)

            text = spans(path, text, change)
            for want, swap, expected in specials:
                if seen[want] != expected:
                    sys.exit(f"REFUSED: {rel} anchor {want!r} seen {seen[want]}x, want {expected}")
                counts["special"] += seen[want]
            for want, swap, expected in AFTER.get(rel, []):
                if text.count(want) != expected:
                    sys.exit(f"REFUSED: {rel} after-anchor {want!r} seen {text.count(want)}x")
                text = text.replace(want, swap)
                counts["after"] += expected
            if text != before:
                written[path] = text
                scanned[path] = before
                if shown is not None and rel.startswith(shown):
                    for old, new in zip(before.split("\n"), text.split("\n")):
                        if old != new:
                            print(f"{rel}: {new.strip()[:170]}")

for label, hits in sorted(counts.items()):
    print(f"{hits:5}  {label}")
print(f"{len(written):5}  files changed")

for old, new in MOVES:
    if not os.path.exists(absolute(old)) or os.path.exists(absolute(new)):
        sys.exit(f"REFUSED: move {old} -> {new}")

if mode == "dry":
    sys.exit(0)

raced = [relative(path) for path in written if open(path, encoding="utf-8").read() != scanned[path]]
if raced:
    sys.exit(f"REFUSED: saved during the scan, nothing written: {raced}")
for path, text in written.items():
    open(path, "w", encoding="utf-8").write(text)
for old, new in MOVES:
    os.rename(absolute(old), absolute(new))
    print("moved", old, "->", new)
