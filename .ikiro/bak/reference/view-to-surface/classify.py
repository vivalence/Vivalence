# limit: 2200 chars · the product hits sorted by sense: palette · client · built · other (the other pile read by eye)
import re
import sys
from collections import Counter, defaultdict

OUT = "/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/e098a56c-10b6-4c39-bde7-2c3d73cc534f/scratchpad/m1"
HOME = "/Users/finn"

BUILT = re.compile(r"(\.mjs$|/build/|/dist/|/snapshots/.*\.html$|/\.harvest/|/bundle/)")

PALETTE = [
    re.compile(r"--surface(-sunk|-lift)?(?![\w-])"),
    re.compile(r"surface(Sunk|Lift)"),
    re.compile(r"(?<![\w-])surface-(sunk|lift)(?![\w-])"),
    re.compile(r"(palette|zone|RGB|BODY|earth|ground)\.surface\b"),
    re.compile(r"bg-surface"),
]
CLIENT = [
    re.compile(r"(client|appDie|app|App|this|held\.client|props\.client|terminal\.client)\.surface\b"),
    re.compile(r"commands\.surface\b"),
    re.compile(r"surfaces/"),
    re.compile(r"commands/surface"),
]
TOKEN = re.compile(r"[A-Za-z_$.\-]*surface[A-Za-z_$\-]*", re.I)

counts = Counter()
files = defaultdict(set)
rest = []
for raw in open(f"{OUT}/product.txt"):
    path, line, text = raw.split(":", 2)
    if BUILT.search(path):
        counts["built"] += 1
        files["built"].add(path)
        continue
    left = text
    tagged = set()
    for rx in PALETTE:
        if rx.search(left):
            tagged.add("palette")
            left = rx.sub("", left)
    for rx in CLIENT:
        if rx.search(left):
            tagged.add("client")
            left = rx.sub("", left)
    if re.search("surface", left, re.I):
        tagged.add("other")
        rest.append((path.replace(HOME, "~"), line, text.strip()[:190]))
    for tag in tagged:
        counts[tag] += 1
        files[tag].add(path)

for tag, n in counts.most_common():
    print(f"{tag}: {n} hits in {len(files[tag])} files")
print("== other")
for path, line, text in rest:
    print(f"{path}:{line}: {text}")
